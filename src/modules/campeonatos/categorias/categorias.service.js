import pool from "../../../config/db.js";

// Crear categoría
export const crearCategoria = async (data) => {
  const { nombre, edad_minima, edad_maxima, descripcion } = data;

  const query = `
    INSERT INTO categorias (nombre, edad_minima, edad_maxima, descripcion)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [nombre, edad_minima, edad_maxima, descripcion];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Obtener todas las categorías
export const listarCategorias = async () => {
  const query = `
    SELECT * FROM categorias
    WHERE eliminado = false
    ORDER BY fecha_registro DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Obtener por ID
export const getCategoriaById = async (id) => {
  const query = `
    SELECT * FROM categorias
    WHERE id_categoria = $1 AND eliminado = false
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
// Actualizar categoría (SIN tocar estado)
export const actualizarCategoria = async (id, data) => {
  const { nombre, edad_minima, edad_maxima, descripcion } = data;

  const query = `
    UPDATE categorias
    SET nombre = $1,
        edad_minima = $2,
        edad_maxima = $3,
        descripcion = $4
    WHERE id_categoria = $5
    RETURNING *
  `;

  const values = [
    nombre,
    edad_minima,
    edad_maxima,
    descripcion,
    id
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Habilitar categoría
export const habilitarCategoria = async (id) => {
  const query = `
    UPDATE categorias
    SET estado = true
    WHERE id_categoria = $1
  `;
  await pool.query(query, [id]);
};
// Deshabilitar categoría
export const deshabilitarCategoria = async (id) => {
  const query = `
    UPDATE categorias
    SET estado = false
    WHERE id_categoria = $1
  `;
  await pool.query(query, [id]);
};

// Eliminado lógico
export const eliminarCategoria = async (id) => {
  const query = `
    UPDATE categorias
    SET eliminado = true
    WHERE id_categoria = $1
  `;
  await pool.query(query, [id]);
};

