import pool from "../../../config/db.js";

// Crear grupo
export const crearGrupo = async (data) => {
  const { nombre } = data;

  const query = `
    INSERT INTO grupo (nombre)
    VALUES ($1)
    RETURNING *
  `;

  const values = [nombre];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Listar todos los grupos activos (soft delete = false)
export const listarGrupos = async () => {
  const query = `
    SELECT *
    FROM grupo
    WHERE eliminado = false
    ORDER BY fecha_registro DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Obtener grupo por ID
export const getGrupoById = async (id) => {
  const query = `
    SELECT *
    FROM grupo
    WHERE id_grupo = $1 AND eliminado = false
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Actualizar grupo (solo nombre, sin tocar estado)
export const actualizarGrupo = async (id, data) => {
  const { nombre } = data;

  const query = `
    UPDATE grupo
    SET nombre = $1
    WHERE id_grupo = $2
    RETURNING *
  `;

  const values = [nombre, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Habilitar grupo
export const habilitarGrupo = async (id) => {
  const query = `
    UPDATE grupo
    SET estado = true
    WHERE id_grupo = $1
  `;
  await pool.query(query, [id]);
};

// Deshabilitar grupo
export const deshabilitarGrupo = async (id) => {
  const query = `
    UPDATE grupo
    SET estado = false
    WHERE id_grupo = $1
  `;
  await pool.query(query, [id]);
};

// Eliminado lógico (soft delete)
export const eliminarGrupo = async (id) => {
  const query = `
    UPDATE grupo
    SET eliminado = true
    WHERE id_grupo = $1
  `;
  await pool.query(query, [id]);
};
