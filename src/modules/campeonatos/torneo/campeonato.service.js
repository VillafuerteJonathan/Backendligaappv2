import pool from '../../../config/db.js';

class CampeonatosService {

  // ===============================
  // CREAR / ACTUALIZAR COMPLETO (CORREGIDO)
  // ===============================
  static async crearOCambiarCampeonatoCompleto(data, idCampeonato = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      console.log('=== CREAR/ACTUALIZAR CAMPEONATO ===');
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));
      console.log('ID Campeonato:', idCampeonato);

      let campeonato;

      // =========================
      // CREAR NUEVO CAMPEONATO
      // =========================
      if (!idCampeonato) {
        const insert = await client.query(
          `INSERT INTO campeonatos (nombre, fecha_inicio, fecha_fin)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [data.nombre, data.fecha_inicio, data.fecha_fin]
        );
        campeonato = insert.rows[0];
        idCampeonato = campeonato.id_campeonato;
        console.log('Campeonato creado:', campeonato);
      }
      // =========================
      // ACTUALIZAR CAMPEONATO EXISTENTE
      // =========================
      else {
        // Verificar que el campeonato existe
        const existe = await client.query(
          `SELECT id_campeonato FROM campeonatos 
           WHERE id_campeonato = $1 AND eliminado = FALSE`,
          [idCampeonato]
        );
        
        if (existe.rows.length === 0) {
          throw new Error('Campeonato no encontrado');
        }

        const update = await client.query(
          `UPDATE campeonatos
           SET nombre = $1,
               fecha_inicio = $2,
               fecha_fin = $3
           WHERE id_campeonato = $4
           RETURNING *`,
          [data.nombre, data.fecha_inicio, data.fecha_fin, idCampeonato]
        );
        campeonato = update.rows[0];
        console.log('Campeonato actualizado:', campeonato);

        // Eliminar relaciones anteriores
        await client.query(
          `DELETE FROM campeonato_grupos WHERE id_campeonato = $1`,
          [idCampeonato]
        );
        
        await client.query(
          `DELETE FROM grupo_equipos WHERE id_campeonato = $1`,
          [idCampeonato]
        );
      }

      // =========================
      // PROCESAR GRUPOS Y EQUIPOS
      // =========================
      if (data.grupos && Array.isArray(data.grupos)) {
        console.log('Procesando grupos:', data.grupos.length);
        
        for (const grupoData of data.grupos) {
          console.log('Procesando grupo:', grupoData);
          
          let grupoId;

          // Si el grupo ya tiene ID, usarlo
          if (grupoData.id_grupo) {
            // Verificar que el grupo existe
            const grupoExistente = await client.query(
              `SELECT id_grupo FROM grupo 
               WHERE id_grupo = $1 AND eliminado = FALSE`,
              [grupoData.id_grupo]
            );
            
            if (grupoExistente.rows.length > 0) {
              grupoId = grupoData.id_grupo;
            } else {
              // Si no existe, crear nuevo grupo
              const nuevoGrupo = await client.query(
                `INSERT INTO grupo (nombre) VALUES ($1) RETURNING id_grupo`,
                [grupoData.nombre]
              );
              grupoId = nuevoGrupo.rows[0].id_grupo;
              console.log(`Grupo creado: ${grupoData.nombre} (ID: ${grupoId})`);
            }
          } else {
            // Buscar grupo por nombre o crear nuevo
            const grupoExistente = await client.query(
              `SELECT id_grupo FROM grupo 
               WHERE LOWER(nombre) = LOWER($1) AND eliminado = FALSE`,
              [grupoData.nombre]
            );
            
            if (grupoExistente.rows.length > 0) {
              grupoId = grupoExistente.rows[0].id_grupo;
              console.log(`Grupo existente encontrado: ${grupoData.nombre} (ID: ${grupoId})`);
            } else {
              const nuevoGrupo = await client.query(
                `INSERT INTO grupo (nombre) VALUES ($1) RETURNING id_grupo`,
                [grupoData.nombre]
              );
              grupoId = nuevoGrupo.rows[0].id_grupo;
              console.log(`Nuevo grupo creado: ${grupoData.nombre} (ID: ${grupoId})`);
            }
          }

          // Vincular campeonato con grupo
          await client.query(
            `INSERT INTO campeonato_grupos (id_campeonato, id_grupo)
             VALUES ($1, $2)
             ON CONFLICT (id_campeonato, id_grupo) DO NOTHING`,
            [idCampeonato, grupoId]
          );

          // Agregar equipos al grupo
          if (grupoData.equiposIds && Array.isArray(grupoData.equiposIds) && grupoData.equiposIds.length > 0) {
            console.log(`Agregando ${grupoData.equiposIds.length} equipos al grupo ${grupoData.nombre}`);
            
            // Verificar que los equipos existan y estén activos
            const placeholders = grupoData.equiposIds.map((_, i) => `$${i + 1}`).join(',');
            const equiposValidos = await client.query(
              `SELECT id_equipo, categoria_id FROM equipos 
               WHERE id_equipo IN (${placeholders}) 
               AND estado = TRUE 
               AND eliminado = FALSE`,
              grupoData.equiposIds
            );

            console.log(`Equipos válidos encontrados: ${equiposValidos.rows.length}`);

            // Controlar categorías únicas por grupo
            for (const equipo of equiposValidos.rows) {
  await client.query(
    `INSERT INTO grupo_equipos (id_campeonato, id_grupo, id_equipo)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_campeonato, id_grupo, id_equipo) DO NOTHING`,
    [idCampeonato, grupoId, equipo.id_equipo]
  );

  console.log(`Equipo ${equipo.id_equipo} agregado al grupo ${grupoId}`);
}
}else {
            console.log(`No hay equipos para agregar al grupo ${grupoData.nombre}`);
          }
        }
      } else {
        console.log('No hay grupos para procesar');
      }

      await client.query('COMMIT');
      console.log('Transacción completada exitosamente');
      
      // Obtener el campeonato con todos los detalles
      const campeonatoCompleto = await this.obtenerConDetalles(idCampeonato);
      console.log('Campeonato completo para respuesta:', {
        id: campeonatoCompleto?.id_campeonato,
        nombre: campeonatoCompleto?.nombre,
        grupos: campeonatoCompleto?.grupos?.length || 0
      });
      
      return campeonatoCompleto;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en crearOCambiarCampeonatoCompleto:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    } finally {
      client.release();
    }
  }

  // ===============================
  // OBTENER TODOS (SIMPLIFICADO)
  // ===============================
  static async obtenerTodos() {
    try {
      console.log('=== OBTENIENDO TODOS LOS CAMPEONATOS ===');
      
      const query = `
          SELECT 
            c.*,
            COALESCE(
              (SELECT COUNT(DISTINCT cg.id_grupo) 
              FROM campeonato_grupos cg 
              WHERE cg.id_campeonato = c.id_campeonato),
              0
            ) as total_grupos,
            COALESCE(
              (SELECT COUNT(ge.id_equipo) 
              FROM grupo_equipos ge 
              WHERE ge.id_campeonato = c.id_campeonato),
              0
            ) as total_equipos
          FROM campeonatos c
          WHERE c.eliminado = FALSE 
          ORDER BY c.fecha_registro DESC
        `;
      
      const res = await pool.query(query);
      console.log(`Total campeonatos encontrados: ${res.rows.length}`);
      
      // Para cada campeonato, obtener sus grupos y equipos
      const campeonatosConDetalles = await Promise.all(
        res.rows.map(async (campeonato) => {
          const detalles = await this.obtenerConDetalles(campeonato.id_campeonato);
          return detalles || campeonato;
        })
      );
      
      return campeonatosConDetalles;
      
    } catch (error) {
      console.error('Error en obtenerTodos:', error.message);
      throw error;
    }
  }

  // ===============================
  // OBTENER CON DETALLES (CORREGIDO)
  // ===============================
  static async obtenerConDetalles(idCampeonato) {
    try {
      console.log(`=== OBTENIENDO DETALLES PARA CAMPEONATO ${idCampeonato} ===`);
      
      const query = `
        WITH grupos_campeonato AS (
          SELECT 
            cg.id_campeonato,
            g.id_grupo,
            g.nombre as grupo_nombre,
            json_agg(
              json_build_object(
                'id_equipo', e.id_equipo,
                'nombre', e.nombre,
                'categoria_id', e.categoria_id,
                'estado', e.estado,
                'categoria_nombre', cat.nombre
              )
            ) FILTER (WHERE e.id_equipo IS NOT NULL) as equipos
          FROM campeonato_grupos cg
          JOIN grupo g ON cg.id_grupo = g.id_grupo
          LEFT JOIN grupo_equipos ge ON cg.id_campeonato = ge.id_campeonato 
            AND cg.id_grupo = ge.id_grupo
          LEFT JOIN equipos e ON ge.id_equipo = e.id_equipo
          LEFT JOIN categorias cat ON e.categoria_id = cat.id_categoria
          WHERE g.eliminado = FALSE 
            AND cg.id_campeonato = $1
          GROUP BY cg.id_campeonato, g.id_grupo, g.nombre
        )
        SELECT 
          c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id_grupo', gc.id_grupo,
                'nombre', gc.grupo_nombre,
                'equipos', COALESCE(gc.equipos, '[]'::json)
              )
              ORDER BY gc.grupo_nombre
            ) FILTER (WHERE gc.id_grupo IS NOT NULL),
            '[]'::json
          ) as grupos
        FROM campeonatos c
        LEFT JOIN grupos_campeonato gc ON c.id_campeonato = gc.id_campeonato
        WHERE c.id_campeonato = $1 
          AND c.eliminado = FALSE
        GROUP BY c.id_campeonato
      `;
      
      console.log(`Ejecutando query para campeonato ${idCampeonato}`);
      
      const result = await pool.query(query, [idCampeonato]);
      
      if (result.rows.length === 0) {
        console.log(`Campeonato ${idCampeonato} no encontrado`);
        return null;
      }
      
      const campeonato = result.rows[0];
      
      console.log(`Campeonato encontrado:`, {
        nombre: campeonato.nombre,
        gruposCount: campeonato.grupos ? campeonato.grupos.length : 0,
        equiposTotales: campeonato.grupos ? 
          campeonato.grupos.reduce((total, grupo) => total + (grupo.equipos?.length || 0), 0) : 0
      });
      
      if (campeonato.grupos) {
        campeonato.grupos.forEach((grupo, index) => {
          console.log(`  Grupo ${index + 1}: ${grupo.nombre}, Equipos: ${grupo.equipos?.length || 0}`);
        });
      }
      
      return campeonato;
      
    } catch (error) {
      console.error(`Error en obtenerConDetalles(${idCampeonato}):`, error.message);
      throw error;
    }
  }

  // ===============================
  // ELIMINAR (SOFT DELETE)
  // ===============================
  static async eliminar(idCampeonato) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log(`=== ELIMINANDO CAMPEONATO ${idCampeonato} ===`);
      
      // Verificar que el campeonato existe
      const existe = await client.query(
        `SELECT id_campeonato FROM campeonatos 
         WHERE id_campeonato = $1 AND eliminado = FALSE`,
        [idCampeonato]
      );
      
      if (existe.rows.length === 0) {
        throw new Error('Campeonato no encontrado');
      }
      
      // Eliminar relaciones
      await client.query(
        `DELETE FROM campeonato_grupos WHERE id_campeonato = $1`,
        [idCampeonato]
      );
      
      await client.query(
        `DELETE FROM grupo_equipos WHERE id_campeonato = $1`,
        [idCampeonato]
      );
      
      // Soft delete del campeonato
      const result = await client.query(
        `UPDATE campeonatos 
         SET eliminado = TRUE 
         WHERE id_campeonato = $1 
         RETURNING id_campeonato, nombre`,
        [idCampeonato]
      );
      
      await client.query('COMMIT');
      
      const campeonatoEliminado = result.rows[0];
      console.log(`Campeonato eliminado: ${campeonatoEliminado.nombre} (ID: ${campeonatoEliminado.id_campeonato})`);
      
      return { 
        success: true, 
        message: `Campeonato "${campeonatoEliminado.nombre}" eliminado correctamente` 
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error en eliminar(${idCampeonato}):`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // ===============================
  // MÉTODOS ADICIONALES ÚTILES
  // ===============================
  
  static async verificarExistencia(idCampeonato) {
    const result = await pool.query(
      `SELECT id_campeonato, nombre FROM campeonatos 
       WHERE id_campeonato = $1 AND eliminado = FALSE`,
      [idCampeonato]
    );
    return result.rows[0] || null;
  }

  static async obtenerEstadisticas(idCampeonato) {
    const query = `
      SELECT 
        COUNT(DISTINCT cg.id_grupo) as total_grupos,
        COUNT(ge.id_equipo) as total_equipos,
        COUNT(DISTINCT e.categoria_id) as categorias_unicas
      FROM campeonatos c
      LEFT JOIN campeonato_grupos cg ON c.id_campeonato = cg.id_campeonato
      LEFT JOIN grupo_equipos ge ON cg.id_campeonato = ge.id_campeonato 
        AND cg.id_grupo = ge.id_grupo
      LEFT JOIN equipos e ON ge.id_equipo = e.id_equipo
      WHERE c.id_campeonato = $1 AND c.eliminado = FALSE
    `;
    
    const result = await pool.query(query, [idCampeonato]);
    return result.rows[0];
  }


// ===============================
// GENERAR PARTIDOS
// ===============================
static async generarPartidos(idCampeonato) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Validar campeonato y estado de generación
    const campRes = await client.query(
      `
      SELECT partidos_generados
      FROM campeonatos
      WHERE id_campeonato = $1
        AND eliminado = FALSE
      `,
      [idCampeonato]
    );

    if (campRes.rowCount === 0) {
      throw new Error("Campeonato no encontrado");
    }

    if (campRes.rows[0].partidos_generados) {
      throw new Error("Los partidos ya fueron generados");
    }

    // 2️⃣ Obtener grupos del campeonato
    const gruposRes = await client.query(
      `
      SELECT g.id_grupo
      FROM campeonato_grupos cg
      JOIN grupo g ON g.id_grupo = cg.id_grupo
      WHERE cg.id_campeonato = $1
      `,
      [idCampeonato]
    );

    // 3️⃣ Recorrer grupos
    for (const { id_grupo } of gruposRes.rows) {

      // 4️⃣ Obtener equipos del grupo + su cancha
      const equiposRes = await client.query(
        `
        SELECT 
          e.id_equipo,
          e.cancha_id
        FROM grupo_equipos ge
        JOIN equipos e ON e.id_equipo = ge.id_equipo
        WHERE ge.id_campeonato = $1
          AND ge.id_grupo = $2
        `,
        [idCampeonato, id_grupo]
      );

      const equipos = equiposRes.rows;
       if (equipos.length < 2) continue;
      // ======================
// INICIALIZAR TABLA DE POSICIONES (TODO EN 0)
// ======================
for (const equipo of equipos) {
  await client.query(
    `
    INSERT INTO tabla_posiciones (
      id_campeonato,
      id_grupo,
      id_equipo,
      pj, pg, pe, pp,
      gf, gc, dg, pts
    )
    VALUES ($1,$2,$3,0,0,0,0,0,0,0,0)
    ON CONFLICT (id_campeonato, id_grupo, id_equipo) DO NOTHING
    `,
    [
      idCampeonato,
      id_grupo,
      equipo.id_equipo
    ]
  );
}


     

      // 5️⃣ Generar partidos (ida y vuelta)
      for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {

          const local = equipos[i];
          const visitante = equipos[j];

          // ======================
          // PARTIDO IDA
          // ======================
          await client.query(
            `
            INSERT INTO partidos (
              id_campeonato,
              id_grupo,
              equipo_local,
              equipo_visitante,
              cancha_partido,
              fecha_encuentro,
              hora_encuentro
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
            `,
            [
              idCampeonato,
              id_grupo,
              local.id_equipo,
              visitante.id_equipo,
              local.cancha_id,
              "Por definir",
              "Por definir"
            ]
          );

          // ======================
          // PARTIDO VUELTA
          // ======================
          await client.query(
            `
            INSERT INTO partidos (
              id_campeonato,
              id_grupo,
              equipo_local,
              equipo_visitante,
              cancha_partido,
              fecha_encuentro,
              hora_encuentro
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
            `,
            [
              idCampeonato,
              id_grupo,
              visitante.id_equipo,
              local.id_equipo,
              visitante.cancha_id,
              "Por definir",
              "Por definir"
            ]
          );
        }
      }
    }

    // 6️⃣ Marcar partidos como generados
    await client.query(
      `
      UPDATE campeonatos
      SET partidos_generados = TRUE
      WHERE id_campeonato = $1
      `,
      [idCampeonato]
    );

    await client.query("COMMIT");
    return { success: true };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

}
export default CampeonatosService;