import db from '../../../config/db.js';

class JuegosService {

  // ===============================
  // OBTENER FECHA LÍMITE (últimos 3 días desde la fecha más reciente)
  // ===============================
  async obtenerFechaLimite() {
    const result = await db.query(`
      SELECT MAX(fecha_encuentro)::date - INTERVAL '3 days' AS fecha_limite
      FROM partidos
      WHERE fecha_encuentro <> 'Por definir'
    `);

    return result.rows[0].fecha_limite;
  }

  // ===============================
  // PARTIDOS POR JUGAR
  // ===============================
  async obtenerPorJugar() {
    const fechaLimite = await this.obtenerFechaLimite();

    const result = await db.query(`
      SELECT 
        p.id_partido,
        p.fecha_encuentro,
        p.hora_encuentro,
        el.nombre AS local,
        ev.nombre AS visitante,
        c.nombre AS cancha
      FROM partidos p
      JOIN equipos el ON el.id_equipo = p.equipo_local
      JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
      LEFT JOIN canchas c ON c.id_cancha = p.cancha_partido
      WHERE p.estado = 'pendiente'
        AND p.fecha_encuentro <> 'Por definir'
        AND p.hora_encuentro <> 'Por definir'
        AND p.fecha_encuentro >= $1
      ORDER BY p.fecha_encuentro ASC, p.hora_encuentro ASC
    `, [fechaLimite]);

    return result.rows;
  }

  // ===============================
  // PARTIDOS EN JUEGO
  // ===============================
  async obtenerEnJuego() {
    const fechaLimite = await this.obtenerFechaLimite();

    const result = await db.query(`
      SELECT 
        p.id_partido,
        p.goles_local,
        p.goles_visitante,
        el.nombre AS local,
        ev.nombre AS visitante
      FROM partidos p
      JOIN equipos el ON el.id_equipo = p.equipo_local
      JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
      WHERE p.estado = 'en_juego'
        AND p.fecha_encuentro >= $1
      ORDER BY p.fecha_encuentro DESC
    `, [fechaLimite]);

    return result.rows;
  }

  // ===============================
  // PARTIDOS JUGADOS (acta revisada)
  // ===============================
  async obtenerJugados() {
    const fechaLimite = await this.obtenerFechaLimite();

    const result = await db.query(`
      SELECT 
        p.id_partido,
        p.goles_local,
        p.goles_visitante,
        p.fecha_encuentro,
        el.nombre AS local,
        ev.nombre AS visitante
      FROM partidos p
      JOIN equipos el ON el.id_equipo = p.equipo_local
      JOIN equipos ev ON ev.id_equipo = p.equipo_visitante
      WHERE p.estado = 'finalizado'
        AND p.estado_acta = 'revisado'
        AND p.fecha_encuentro >= $1
      ORDER BY p.fecha_encuentro DESC
    `, [fechaLimite]);

    return result.rows;
  }

  // ===============================
  // OBTENER TODO AGRUPADO
  // ===============================
  async obtenerDashboard() {
    const [porJugar, enJuego, jugados] = await Promise.all([
      this.obtenerPorJugar(),
      this.obtenerEnJuego(),
      this.obtenerJugados()
    ]);

    return {
      porJugar,
      enJuego,
      jugados
    };
  }
}

export default new JuegosService();