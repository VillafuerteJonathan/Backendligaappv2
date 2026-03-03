// consulta.service.js

import pool from "../../../config/db.js";

/**
 * 🏆 Campeonatos con partidos finalizados y acta revisada
 */
export async function obtenerCampeonatosDisponibles() {
  const query = `
    SELECT DISTINCT
      c.id_campeonato,
      c.nombre,
      c.fecha_inicio,
      c.fecha_fin
    FROM campeonatos c
    JOIN partidos p ON p.id_campeonato = c.id_campeonato
    WHERE LOWER(p.estado) = 'finalizado'
      AND LOWER(p.estado_acta) = 'revisada'
    ORDER BY c.fecha_inicio DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
}
/**
 * 📋 Partidos finalizados y revisados por campeonato
 */
export async function obtenerPartidosRevisadosPorCampeonato(idCampeonato) {
  const query = `
    SELECT
      p.id_partido,
      p.fecha_encuentro,
      p.hora_encuentro,
      p.goles_local,
      p.goles_visitante,
      p.estado,
      p.estado_acta,
      p.inasistencia,

      el.id_equipo AS id_local,
      el.nombre AS equipo_local,
      el.logo_url AS logo_local,

      ev.id_equipo AS id_visitante,
      ev.nombre AS equipo_visitante,
      ev.logo_url AS logo_visitante,

      ca.nombre AS cancha,

      ab.hash_acta,
      ab.created_at AS fecha_blockchain,

      a.nombres AS nombre_arbitro,
      a.apellidos AS apellido_arbitro,

      u.nombre AS nombre_vocal,
      u.apellido AS apellido_vocal,

      COALESCE(
        json_agg(
          json_build_object(
            'tipo', aa.tipo,
            'ruta', aa.ruta_archivo,
            'hash', aa.hash_archivo
          )
        ) FILTER (WHERE aa.id_archivo IS NOT NULL),
        '[]'::json
      ) AS archivos_acta

    FROM partidos p
    JOIN equipos el ON el.id_equipo = p.equipo_local
    JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
    LEFT JOIN canchas ca ON ca.id_cancha = p.cancha_partido
    LEFT JOIN actas_blockchain ab ON ab.id_partido = p.id_partido
    LEFT JOIN arbitros a ON a.id_arbitro = ab.arbitro_id
    LEFT JOIN usuarios u ON u.id_usuario = ab.vocal_id
    LEFT JOIN actas_archivos aa ON aa.id_partido = p.id_partido

    WHERE p.id_campeonato = $1
      AND LOWER(p.estado) = 'finalizado'
      AND LOWER(p.estado_acta) = 'revisada'

    GROUP BY
      p.id_partido,
      el.id_equipo, el.nombre, el.logo_url,
      ev.id_equipo, ev.nombre, ev.logo_url,
      ca.nombre,
      ab.hash_acta, ab.created_at,
      a.nombres, a.apellidos,
      u.nombre, u.apellido

    ORDER BY p.fecha_encuentro DESC;
  `;

  const { rows } = await pool.query(query, [idCampeonato]);
  return rows;
}