import db from '../../../config/db.js';

class RegistroService {

  // ===============================
  // DETALLE INICIAL DEL PARTIDO
  // ===============================
  async obtenerDetallePartido(idPartido) {
    const query = `
      SELECT
        p.id_partido,
        p.id_campeonato,
        p.id_grupo,
        p.estado,
        p.goles_local,
        p.goles_visitante,
        p.inasistencia,

        el.id_equipo AS local_id,
        el.nombre AS local_nombre,

        ev.id_equipo AS visitante_id,
        ev.nombre AS visitante_nombre,

        c.id_cancha AS cancha_id,
        c.nombre AS cancha_nombre,
        c.ubicacion AS cancha_ubicacion,

        p.fecha_encuentro,
        p.hora_encuentro,

        EXISTS (
          SELECT 1
          FROM actas_blockchain ab
          WHERE ab.id_partido = p.id_partido
        ) AS ya_registrado

      FROM partidos p
      JOIN equipos el ON el.id_equipo = p.equipo_local
      JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
      LEFT JOIN canchas c ON c.id_cancha = p.cancha_partido
      WHERE p.id_partido = $1
    `;

    const partido = await db.query(query, [idPartido]);

    if (partido.rowCount === 0) {
      throw new Error('Partido no encontrado');
    }

    const arbitros = await db.query(`
     SELECT 
        id_arbitro,
        CONCAT(nombres, ' ', apellidos) AS nombre
        FROM arbitros
        WHERE estado = true
        ORDER BY nombres;

    `);

    return {
      ...partido.rows[0],
      arbitros: arbitros.rows
    };
  }

  // ===============================
  // INICIAR PARTIDO
  // ===============================
  async iniciarPartido(idPartido) {
  const res = await db.query(
    `
    UPDATE partidos
    SET estado = 'en_juego'
    WHERE id_partido = $1
      AND estado = 'pendiente'
    RETURNING id_partido, estado
    `,
    [idPartido]
  );

  if (res.rowCount === 0) {
    throw new Error('El partido no puede iniciarse');
  }

  return res.rows[0];
}


  // ===============================
  // ACTUALIZAR MARCADOR
  // ===============================
  async actualizarMarcador(idPartido, golesLocal, golesVisitante) {
    const res = await db.query(
      `
      UPDATE partidos
      SET goles_local = $1,
          goles_visitante = $2
      WHERE id_partido = $3
        AND estado = 'en_juego'
      RETURNING id_partido
      `,
      [golesLocal, golesVisitante, idPartido]
    );

    if (res.rowCount === 0) {
      throw new Error('No se puede actualizar el marcador');
    }
  }

  // ===============================
  // FINALIZAR PARTIDO (TRANSACCIÓN REAL)
  // ===============================
  async finalizarPartido({
    partidoId,
    golesLocal,
    golesVisitante,
    arbitroId,
    vocalId,
    hashActa
  }) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Validar que no esté ya registrado
      const existe = await client.query(
        `SELECT 1 FROM actas_blockchain WHERE id_partido = $1`,
        [partidoId]
      );

      if (existe.rowCount > 0) {
        throw new Error('Este partido ya fue registrado');
      }

      // Finalizar partido
      const partido = await client.query(
        `
        UPDATE partidos
        SET goles_local = $1,
            goles_visitante = $2,
            estado = 'finalizado'
        WHERE id_partido = $3
          AND estado = 'en_juego'
        RETURNING id_partido
        `,
        [golesLocal, golesVisitante, partidoId]
      );

      if (partido.rowCount === 0) {
        throw new Error('El partido no está en juego');
      }

      // Registrar acta
      await client.query(
        `
        INSERT INTO actas_blockchain (
          id_partido,
          hash_acta,
          vocal_id,
          arbitro_id
        )
        VALUES ($1, $2, $3, $4)
        `,
        [partidoId, hashActa, vocalId, arbitroId]
      );

      await client.query('COMMIT');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  // ===============================
// ACTUALIZAR FECHA Y HORA DEL PARTIDO
// ===============================
async actualizarEncuentro(idPartido, fechaEncuentro, horaEncuentro) {
  const res = await db.query(
    `
    UPDATE partidos
    SET fecha_encuentro = $1,
        hora_encuentro = $2
    WHERE id_partido = $3
    RETURNING id_partido, fecha_encuentro, hora_encuentro
    `,
    [fechaEncuentro, horaEncuentro, idPartido]
  );

  if (res.rowCount === 0) {
    throw new Error('No se pudo actualizar la fecha y hora del partido');
  }

  return res.rows[0];
}
async guardarActas({ idPartido, frente, dorso }) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const archivo of [frente, dorso]) {
      await client.query(
        `
        INSERT INTO actas_archivos (
          id_partido,
          tipo,
          ruta_archivo,
          hash_archivo
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          idPartido,
          archivo.tipo,          // 'frente' | 'dorso'
          archivo.ruta_archivo,  // ruta relativa
          archivo.hash_archivo   // ✅ YA NO ES NULL
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

}

export default new RegistroService();
