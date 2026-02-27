// services/partido.service.js
import db from '../../../config/db.js';

class PartidoService {

  // Obtener todos los campeonatos activos
  async obtenerCampeonatosActivosVocal(vocalId) {
    try {
      const query = `
        SELECT DISTINCT
          c.id_campeonato,
          c.nombre as campeonato_nombre,
          c.fecha_inicio,
          c.fecha_fin,
          c.estado,
          (
            SELECT COUNT(*) 
            FROM partidos p2 
            WHERE p2.id_campeonato = c.id_campeonato 
              AND p2.estado IN ('pendiente', 'en_juego')
          ) as partidos_pendientes,
          (
            SELECT COUNT(*) 
            FROM partidos p2 
            WHERE p2.id_campeonato = c.id_campeonato 
              AND p2.estado = 'en_juego'
          ) as partidos_en_juego,
          (
            SELECT COUNT(*) 
            FROM partidos p2 
            WHERE p2.id_campeonato = c.id_campeonato 
              AND p2.estado = 'finalizado'
          ) as partidos_finalizados
        FROM campeonatos c
        INNER JOIN partidos p ON c.id_campeonato = p.id_campeonato
        WHERE c.estado = true
        ORDER BY c.fecha_inicio DESC, c.nombre ASC
      `;
      const result = await db.query(query);
      return { success: true, data: result.rows, total: result.rowCount };
    } catch (error) {
      throw new Error(`Error al obtener campeonatos activos: ${error.message}`);
    }
  }

  // =============================
  // Obtener TODOS los partidos de un campeonato
  // =============================
  async obtenerPartidosPendientes(campeonatoId) {
    try {
      const query = `
        SELECT
          p.id_partido,
          p.id_campeonato,
          p.goles_local,
          p.goles_visitante,
          p.inasistencia,
          p.estado,
          p.created_at,
          p.id_grupo,
          p.equipo_local,
          p.equipo_visitante,
          el.nombre as local_nombre,
          el.logo_url as local_logo,
          ev.nombre as visitante_nombre,
          ev.logo_url as visitante_logo,
          g.nombre as grupo_nombre,
          c.nombre as campeonato_nombre,
          c.fecha_inicio,
          c.fecha_fin,
          c.estado as campeonato_estado,
          p.fecha_encuentro,
          p.hora_encuentro,
          EXISTS(
            SELECT 1 FROM actas_blockchain ab WHERE ab.id_partido = p.id_partido
          ) as ya_registrado
        FROM partidos p
        INNER JOIN equipos el ON p.equipo_local = el.id_equipo
        INNER JOIN equipos ev ON p.equipo_visitante = ev.id_equipo
        LEFT JOIN grupo g ON p.id_grupo = g.id_grupo
        INNER JOIN campeonatos c ON p.id_campeonato = c.id_campeonato
        WHERE p.id_campeonato = $1
        ORDER BY
          CASE
            WHEN p.estado = 'en_juego' THEN 1
            WHEN p.estado = 'pendiente' THEN 2
            WHEN p.estado = 'finalizado' THEN 3
            ELSE 4
          END,
          p.fecha_encuentro ASC,
          p.hora_encuentro ASC
      `;

      const result = await db.query(query, [campeonatoId]);

      return {
        success: true,
        partidos: result.rows
      };
    } catch (error) {
      throw new Error(`Error al obtener partidos: ${error.message}`);
    }
  }

  // Obtener detalle de un partido
  async obtenerDetallePartido(idPartido) {
    try {
      const query = `
        SELECT
          p.id_partido,
          p.id_campeonato,
          p.goles_local,
          p.goles_visitante,
          p.inasistencia,
          p.estado,
          p.created_at,
          p.id_grupo,
          p.equipo_local,
          p.equipo_visitante,
          el.nombre as local_nombre,
          el.logo_url as local_logo,
          ev.nombre as visitante_nombre,
          ev.logo_url as visitante_logo,
          g.nombre as grupo_nombre,
          c.nombre as campeonato_nombre,
          c.fecha_inicio,
          c.fecha_fin,
          c.estado as campeonato_estado,
          p.fecha_encuentro,
          p.hora_encuentro,
          c.id_campeonato,
          -- Acta
          ab.id_acta,
          ab.hash_acta,
          ab.vocal_id,
          ab.created_at as fecha_registro,
          u.nombre as vocal_nombre,
          u.correo as vocal_correo,
          -- Ya registrado
          CASE WHEN ab.id_acta IS NOT NULL THEN true ELSE false END as ya_registrado
        FROM partidos p
        INNER JOIN equipos el ON p.equipo_local = el.id_equipo
        INNER JOIN equipos ev ON p.equipo_visitante = ev.id_equipo
        LEFT JOIN grupo g ON p.id_grupo = g.id_grupo
        INNER JOIN campeonatos c ON p.id_campeonato = c.id_campeonato
        LEFT JOIN actas_blockchain ab ON p.id_partido = ab.id_partido
        LEFT JOIN usuarios u ON ab.vocal_id = u.id_usuario
        WHERE p.id_partido = $1
      `;
      const result = await db.query(query, [idPartido]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Partido no encontrado' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      throw new Error(`Error al obtener detalle del partido: ${error.message}`);
    }
  }

  // Verificar si un partido ya fue registrado
  async verificarPartidoYaRegistrado(idPartido) {
    try {
      const query = `
        SELECT 
          ab.id_acta,
          ab.created_at as fecha_registro,
          u.nombre as vocal_nombre,
          u.correo as vocal_correo
        FROM actas_blockchain ab
        INNER JOIN usuarios u ON ab.vocal_id = u.id_usuario
        WHERE ab.id_partido = $1
        LIMIT 1
      `;
      const result = await db.query(query, [idPartido]);
      return {
        success: true,
        data: result.rows.length > 0 ? result.rows[0] : null,
        ya_registrado: result.rows.length > 0
      };
    } catch (error) {
      throw new Error(`Error al verificar partido: ${error.message}`);
    }
  }

  // Historial de partidos de un vocal
  async obtenerHistorialVocal(vocalId, filtros = {}) {
    try {
      let query = `
        SELECT
          p.id_partido,
          p.goles_local,
          p.goles_visitante,
          p.inasistencia,
          p.estado,
          p.created_at,
          el.nombre as local_nombre,
          ev.nombre as visitante_nombre,
          c.nombre as campeonato_nombre,
          ab.hash_acta,
          ab.created_at as fecha_registro
        FROM actas_blockchain ab
        INNER JOIN partidos p ON ab.id_partido = p.id_partido
        INNER JOIN equipos el ON p.equipo_local = el.id_equipo
        INNER JOIN equipos ev ON p.equipo_visitante = ev.id_equipo
        INNER JOIN campeonatos c ON p.id_campeonato = c.id_campeonato
        WHERE ab.vocal_id = $1
      `;

      const params = [vocalId];
      let paramCount = 2;

      if (filtros.campeonatoId) {
        query += ` AND p.id_campeonato = $${paramCount}`;
        params.push(filtros.campeonatoId);
        paramCount++;
      }

      if (filtros.fechaDesde) {
        query += ` AND ab.created_at >= $${paramCount}`;
        params.push(filtros.fechaDesde);
        paramCount++;
      }

      if (filtros.fechaHasta) {
        query += ` AND ab.created_at <= $${paramCount}`;
        params.push(filtros.fechaHasta);
        paramCount++;
      }

      if (filtros.estado) {
        query += ` AND p.estado = $${paramCount}`;
        params.push(filtros.estado);
        paramCount++;
      }

      query += ` ORDER BY ab.created_at DESC`;

      const result = await db.query(query, params);
      return { success: true, data: result.rows, total: result.rowCount };
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }
}

export default new PartidoService();
