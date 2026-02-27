import pool from "../../../config/db.js";

// =============================
// CREAR EQUIPO
// =============================
export const crearEquipo = async (data) => {
  const {
    nombre,
    descripcion,
    categoria_id,
    cancha_id,
    logo_url,
    nombre_representante,
    celular_representante
  } = data;
  try {

  const result = await pool.query(
    `INSERT INTO equipos (
      nombre,
      descripcion,
      categoria_id,
      cancha_id,
      logo_url,
      nombre_representante,
      celular_representante,
      estado,
      eliminado,
      fecha_registro
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,true,false,NOW())
    RETURNING *`,
    [
      nombre,
      descripcion,
      categoria_id,
      cancha_id,
      logo_url || null,
      nombre_representante,
      celular_representante
    ]
  );

  return result.rows[0];
    } catch (error) {   
        if (error.code === "23505") {
            throw new Error("Ya existe un equipo con ese nombre en la misma categoría");
        }   
};  
        throw new Error("Error al crear el equipo");
}

// =============================
// LISTAR EQUIPOS (NO ELIMINADOS)
// =============================
export const listarEquipos = async () => {
  const result = await pool.query(
    `SELECT *
     FROM equipos
     WHERE eliminado = false
     ORDER BY fecha_registro DESC`
  );

  return result.rows;
};

// =============================
// EDITAR EQUIPO
// =============================
export const editarEquipo = async (id, data) => {
  const {
    nombre,
    descripcion,
    categoria_id,
    cancha_id,
    logo_url,
    nombre_representante,
    celular_representante,
    estado
  } = data;

  const result = await pool.query(
    `UPDATE equipos
     SET nombre = $1,
         descripcion = $2,
         categoria_id = $3,
         cancha_id = $4,
         logo_url = $5,
         nombre_representante = $6,
         celular_representante = $7,
         estado = $8
     WHERE id_equipo = $9 AND eliminado = false
     RETURNING *`,
    [
      nombre,
      descripcion,
      categoria_id,
      cancha_id,
      logo_url || null,
      nombre_representante,
      celular_representante,
      estado,
      id
    ]
  );

  if (!result.rows.length) {
    throw new Error("Equipo no encontrado o eliminado");
  }

  return result.rows[0];
};

// =============================
// ELIMINAR (SOFT DELETE)
// =============================
export const eliminarEquipo = async (id) => {
  const result = await pool.query(
    `UPDATE equipos
     SET eliminado = true   
     WHERE id_equipo = $1
     RETURNING *`,
    [id]
  );

  if (!result.rows.length) {
    throw new Error("Equipo no encontrado");
  }

  return result.rows[0];
};
// =============================
// HABILITAR / DESHABILITAR
// =============================
export const habilitarEquipo = async (id) => {
  const result = await pool.query(
    `
    UPDATE equipos
    SET estado = true
    WHERE id_equipo = $1
      AND eliminado = false
    RETURNING *
    `,
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("Equipo no encontrado o eliminado");
  }

  return result.rows[0];
};

export const deshabilitarEquipo = async (id) => {
  const result = await pool.query(
    `
    UPDATE equipos
    SET estado = false
    WHERE id_equipo = $1
      AND eliminado = false
    RETURNING *
    `,
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("Equipo no encontrado o eliminado");
  }

  return result.rows[0];
};
