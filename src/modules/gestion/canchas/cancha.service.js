  import pool from "../../../config/db.js";

  // Crear cancha
  export const crearCancha = async (data) => {
    const { nombre, tipo_deporte, ubicacion } = data;

    const result = await pool.query(
      `INSERT INTO canchas (nombre, tipo_deporte, ubicacion, estado, fecha_registro)
      VALUES ($1, $2, $3, true, NOW())
      RETURNING *`,
      [nombre, tipo_deporte, ubicacion]
    );

    return result.rows[0];
  };

  // Listar canchas activas (no eliminadas)
  export const listarCanchas = async () => {
    const result = await pool.query(
      `SELECT * FROM canchas 
      WHERE eliminado = false
      ORDER BY fecha_registro DESC`
    );

    return result.rows;
  };

  // Eliminar cancha (soft delete)
  export const eliminarCancha = async (id) => {
    const result = await pool.query(
      `UPDATE canchas
      SET eliminado = true,
          fecha_eliminacion = NOW()
      WHERE id_cancha = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) throw new Error('Cancha no encontrada');

    return result.rows[0];
  };

  // Editar cancha
  export const editarCancha = async (id, data) => {
    const { nombre, tipo_deporte, ubicacion } = data;

    const result = await pool.query(
      `UPDATE canchas
      SET nombre = $1,
          tipo_deporte = $2,
          ubicacion = $3
      WHERE id_cancha = $4 AND eliminado = false
      RETURNING *`,
      [nombre, tipo_deporte, ubicacion, id]
    );

    if (result.rows.length === 0) throw new Error('Cancha no encontrada o eliminada');

    return result.rows[0];
  };

  // Habilitar cancha
  export const habilitarCancha = async (id) => {
    const result = await pool.query(
      `UPDATE canchas
      SET estado = true
      WHERE id_cancha = $1 AND eliminado = false
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) throw new Error('Cancha no encontrada o eliminada');

    return result.rows[0];
  };

  // Deshabilitar cancha
  export const deshabilitarCancha = async (id) => {
    const result = await pool.query(
      `UPDATE canchas
      SET estado = false
      WHERE id_cancha = $1 AND eliminado = false
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) throw new Error('Cancha no encontrada o eliminada');

    return result.rows[0];
  };
