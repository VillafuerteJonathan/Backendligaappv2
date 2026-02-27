import pool from "../../../config/db.js";

class CampeonatosPosicionesService {

  static async obtenerCampeonatosActivosConTablas() {
    // 1️⃣ Campeonatos activos
    const campeonatosRes = await pool.query(`
      SELECT id_campeonato, nombre
      FROM campeonatos
      WHERE estado = TRUE
        AND eliminado = FALSE
      ORDER BY nombre
    `);

    const campeonatos = [];

    for (const camp of campeonatosRes.rows) {

      // 2️⃣ Grupos del campeonato
      const gruposRes = await pool.query(`
        SELECT g.id_grupo, g.nombre
        FROM campeonato_grupos cg
        JOIN grupo g ON g.id_grupo = cg.id_grupo
        WHERE cg.id_campeonato = $1
        ORDER BY g.id_grupo
      `, [camp.id_campeonato]);

      const grupos = [];

      for (const grupo of gruposRes.rows) {

        // 3️⃣ Tabla de posiciones por grupo
        const tablaRes = await pool.query(`
          SELECT 
            tp.id_equipo,
            e.nombre AS equipo,
            tp.pj, tp.pg, tp.pe, tp.pp,
            tp.gf, tp.gc, tp.dg, tp.pts
          FROM tabla_posiciones tp
          JOIN equipos e ON e.id_equipo = tp.id_equipo
          WHERE tp.id_campeonato = $1
            AND tp.id_grupo = $2
          ORDER BY 
            tp.pts DESC,
            tp.dg DESC,
            tp.gf DESC,
            e.nombre ASC
        `, [camp.id_campeonato, grupo.id_grupo]);

        grupos.push({
          id_grupo: grupo.id_grupo,
          nombre: grupo.nombre,
          tabla_posiciones: tablaRes.rows
        });
      }

      campeonatos.push({
        id_campeonato: camp.id_campeonato,
        nombre: camp.nombre,
        grupos
      });
    }

    return campeonatos;
  }
}

export default CampeonatosPosicionesService;
