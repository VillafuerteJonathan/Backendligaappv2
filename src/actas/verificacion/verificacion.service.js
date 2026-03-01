import pool from "../../../config/db.js";
import { obtenerActaBlockchain } from "../../blockchain/index.js";

/**
 * 🔍 Campeonatos con actas pendientes
 */
export async function obtenerCampeonatosConActasPendientes() {
  const query = `
    SELECT DISTINCT
      c.id_campeonato,
      c.nombre,
      c.fecha_inicio,
      c.fecha_fin
    FROM campeonatos c
    JOIN partidos p ON p.id_campeonato = c.id_campeonato
    WHERE p.estado = 'finalizado'
      AND p.estado_acta = 'pendiente'
    ORDER BY c.nombre;
  `;

  const { rows } = await pool.query(query);
  return rows;
}

/**
 * 📋 Actas pendientes por campeonato
 */
export async function obtenerActasPendientesPorCampeonato(idCampeonato) {
  const query = `
    SELECT
      p.id_partido,
      p.fecha_encuentro,
      p.hora_encuentro,
      p.goles_local,
      p.goles_visitante,
      el.nombre AS equipo_local,
      el.logo_url AS logo_local,
      ev.nombre AS equipo_visitante,
      ev.logo_url AS logo_visitante,
      ca.nombre AS cancha,
      COALESCE(
        json_agg(
          json_build_object(
            'tipo', aa.tipo,
            'ruta', aa.ruta_archivo,
            'hash', aa.hash_archivo
          )
        ) FILTER (WHERE aa.id_archivo IS NOT NULL),
        '[]'::json
      ) AS actas,
      ab.arbitro_id,
      ab.vocal_id,
      a.nombres AS nombre_arbitro,
      a.apellidos AS apellido_arbitro,
      u.nombre AS nombre_vocal,
      u.apellido AS apellido_vocal,
      ab.hash_acta,
      ab.created_at AS fecha_subida_blockchain
    FROM partidos p
    JOIN equipos el ON el.id_equipo = p.equipo_local
    JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
    LEFT JOIN canchas ca ON ca.id_cancha = p.cancha_partido
    LEFT JOIN actas_archivos aa ON aa.id_partido = p.id_partido
    LEFT JOIN actas_blockchain ab ON ab.id_partido = p.id_partido
    LEFT JOIN arbitros a ON a.id_arbitro = ab.arbitro_id
    LEFT JOIN usuarios u ON u.id_usuario = ab.vocal_id
    WHERE p.id_campeonato = $1
      AND p.estado = 'finalizado'
      AND p.estado_acta = 'pendiente'
    GROUP BY
      p.id_partido, el.nombre, el.logo_url,
      ev.nombre, ev.logo_url, ca.nombre,
      ab.arbitro_id, ab.vocal_id,
      a.nombres, a.apellidos,
      u.nombre, u.apellido,
      ab.hash_acta, ab.created_at
    ORDER BY p.fecha_encuentro DESC;
  `;

  const { rows } = await pool.query(query, [idCampeonato]);
  return rows;
}

/**
 * ✅ ACTUALIZAR TABLA DE POSICIONES (TRANSACCIONAL)
 */
async function actualizarTablaPosicionesTx(client, {
  idCampeonato,
  idGrupo,
  idEquipo,
  golesFavor,
  golesContra,
  puntos,
}) {
  const res = await client.query(
    `
    SELECT id_posicion
    FROM tabla_posiciones
    WHERE id_campeonato = $1
      AND id_grupo = $2
      AND id_equipo = $3
    FOR UPDATE
    `,
    [idCampeonato, idGrupo, idEquipo]
  );

  const pg = puntos === 3 ? 1 : 0;
  const pe = puntos === 1 ? 1 : 0;
  const pp = puntos === 0 ? 1 : 0;

  if (res.rowCount) {
    await client.query(
      `
      UPDATE tabla_posiciones
      SET
        pj = pj + 1,
        pg = pg + $1,
        pe = pe + $2,
        pp = pp + $3,
        gf = gf + $4,
        gc = gc + $5,
        dg = dg + ($4 - $5),
        pts = pts + $6
      WHERE id_posicion = $7
      `,
      [
        pg,
        pe,
        pp,
        golesFavor,
        golesContra,
        puntos,
        res.rows[0].id_posicion,
      ]
    );
  } else {
    await client.query(
      `
      INSERT INTO tabla_posiciones (
        id_campeonato,
        id_grupo,
        id_equipo,
        pj, pg, pe, pp,
        gf, gc, dg, pts
      )
      VALUES ($1,$2,$3,1,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        idCampeonato,
        idGrupo,
        idEquipo,
        pg,
        pe,
        pp,
        golesFavor,
        golesContra,
        golesFavor - golesContra,
        puntos,
      ]
    );
  }
}

/**
 * 🔍 REVISAR ACTA + ACTUALIZAR TABLA
 */
export async function revisarActa({ idPartido, juezId, comentario = null }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Partido
    const { rows, rowCount } = await client.query(
      `
      SELECT
        id_partido,
        id_campeonato,
        id_grupo,
        equipo_local,
        equipo_visitante,
        goles_local,
        goles_visitante,
        estado_acta
      FROM partidos
      WHERE id_partido = $1
      FOR UPDATE
      `,
      [idPartido]
    );

    if (!rowCount) throw new Error("Partido no encontrado");
    const partido = rows[0];

    if (partido.estado_acta !== "pendiente") {
      throw new Error("El acta ya fue revisada");
    }

    // 2️⃣ Blockchain BD
    const actaBDRes = await client.query(
      `
      SELECT arbitro_id, vocal_id, hash_acta
      FROM actas_blockchain
      WHERE id_partido = $1
      `,
      [idPartido]
    );

    if (!actaBDRes.rowCount) {
      throw new Error("Acta no registrada en blockchain");
    }

    const actaBD = actaBDRes.rows[0];

    // 3️⃣ Blockchain real
    const actaBlockchain = await obtenerActaBlockchain(idPartido);
    if (!actaBlockchain?.success) {
      throw new Error("No se pudo obtener el acta desde blockchain");
    }

    const bc = actaBlockchain.data;

    // 4️⃣ Comparación
    const diferencias = [];

    if (partido.goles_local !== bc.golesLocal)
      diferencias.push("Goles local no coinciden");

    if (partido.goles_visitante !== bc.golesVisitante)
      diferencias.push("Goles visitante no coinciden");

    if (actaBD.arbitro_id !== bc.arbitroId)
      diferencias.push("Árbitro no coincide");

    if (actaBD.vocal_id !== bc.vocalId)
      diferencias.push("Vocal no coincide");

    if (actaBD.hash_acta !== bc.hashActa)
      diferencias.push("Hash del acta no coincide");

    if (diferencias.length) {
      const err = new Error("Error de integridad");
      err.errorType = "data_integrity";
      err.diferencias = diferencias;
      throw err;
    }

    // 5️⃣ Registrar revisión
    await client.query(
      `
      INSERT INTO revision_actas (id_partido, id_juez, comentario, fecha_revision)
      VALUES ($1,$2,$3,NOW())
      `,
      [idPartido, juezId, comentario]
    );

    // 6️⃣ Marcar acta
    await client.query(
      `
      UPDATE partidos
      SET estado_acta = 'revisada'
      WHERE id_partido = $1
      `,
      [idPartido]
    );

    // 7️⃣ PUNTOS
   let puntosLocal = 0;
let puntosVisitante = 0;

// 🚫 INASISTENCIA
if (partido.inasistencia === "local") {
  // Local NO se presentó
  puntosLocal = -3;
  puntosVisitante = 3;

} else if (partido.inasistencia === "visitante") {
  // Visitante NO se presentó
  puntosLocal = 3;
  puntosVisitante = -3;

} else {
  // ⚽ PARTIDO NORMAL
  if (partido.goles_local > partido.goles_visitante) {
    puntosLocal = 3;
  } else if (partido.goles_local < partido.goles_visitante) {
    puntosVisitante = 3;
  } else {
    puntosLocal = 1;
    puntosVisitante = 1;
  }
}


    // 8️⃣ Tabla posiciones
    await actualizarTablaPosicionesTx(client, {
      idCampeonato: partido.id_campeonato,
      idGrupo: partido.id_grupo,
      idEquipo: partido.equipo_local,
      golesFavor: partido.goles_local,
      golesContra: partido.goles_visitante,
      puntos: puntosLocal,
    });

    await actualizarTablaPosicionesTx(client, {
      idCampeonato: partido.id_campeonato,
      idGrupo: partido.id_grupo,
      idEquipo: partido.equipo_visitante,
      golesFavor: partido.goles_visitante,
      golesContra: partido.goles_local,
      puntos: puntosVisitante,
    });

    await client.query("COMMIT");

    return {
      success: true,
      message: "Acta verificada y tabla de posiciones actualizada correctamente",
    };

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error revisarActa:", error);
    throw error;
  } finally {
    client.release();
  }
}
