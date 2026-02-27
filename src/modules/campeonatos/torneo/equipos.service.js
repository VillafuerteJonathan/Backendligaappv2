import pool from '../../../config/db.js';

class EquiposService {

  // ===============================
  // OBTENER EQUIPO POR ID
  // ===============================
  static async obtenerPorId(idEquipo) {
    const result = await pool.query(
      `SELECT 
        e.id_equipo,
        e.nombre,
        e.categoria_id,
        e.estado,
        e.eliminado,
        c.nombre AS categoria_nombre,
        c.edad_minima,
        c.edad_maxima
      FROM equipos e
      JOIN categorias c ON e.categoria_id = c.id_categoria
      WHERE e.id_equipo = $1
        AND e.eliminado = FALSE`,
      [idEquipo]
    );

    return result.rows[0] || null;
  }

  // ===============================
  // VALIDAR SI SE PUEDE AGREGAR
  // ===============================
  static async puedeAgregarAGrupo(idEquipo, idCampeonato, idGrupo) {
    console.log('[EquiposService] Validando equipo:', { idEquipo, idCampeonato, idGrupo });

    const equipo = await this.obtenerPorId(idEquipo);
    if (!equipo || !equipo.estado) {
      return { puede: false, razon: 'Equipo no disponible' };
    }

    // ¿Está en otro grupo del mismo campeonato?
    const enOtroGrupo = await pool.query(
      `SELECT 1 
       FROM grupo_equipos 
       WHERE id_equipo = $1 
         AND id_campeonato = $2`,
      [idEquipo, idCampeonato]
    );

    if (enOtroGrupo.rows.length) {
      return { puede: false, razon: 'Equipo ya asignado a un grupo del campeonato' };
    }

    // ¿Ya existe equipo de la misma categoría en el grupo?
    const categoriaRepetida = await pool.query(
      `SELECT 1
       FROM grupo_equipos ge
       JOIN equipos e ON ge.id_equipo = e.id_equipo
       WHERE ge.id_campeonato = $1
         AND ge.id_grupo = $2
         AND e.categoria_id = $3`,
      [idCampeonato, idGrupo, equipo.categoria_id]
    );

    if (categoriaRepetida.rows.length) {
      return {
        puede: false,
        razon: 'Ya existe un equipo de esta categoría en el grupo'
      };
    }

    return { puede: true };
  }

  // ===============================
  // AGREGAR EQUIPO A GRUPO
  // ===============================
  static async agregarAGrupo(idCampeonato, idGrupo, idEquipo) {
    console.log('[EquiposService] Agregando equipo a grupo');

    await pool.query(
      `INSERT INTO grupo_equipos (id_campeonato, id_grupo, id_equipo)
       VALUES ($1, $2, $3)`,
      [idCampeonato, idGrupo, idEquipo]
    );
  }

  // ===============================
  // REMOVER EQUIPO
  // ===============================
  static async removerDeGrupo(idCampeonato, idGrupo, idEquipo) {
    await pool.query(
      `DELETE FROM grupo_equipos
       WHERE id_campeonato = $1
         AND id_grupo = $2
         AND id_equipo = $3`,
      [idCampeonato, idGrupo, idEquipo]
    );
  }
}

export default EquiposService;
