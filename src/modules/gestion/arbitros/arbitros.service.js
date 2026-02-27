import pool from "../../../config/db.js";

// ============================================
// CREAR ÁRBITRO
// ============================================
export const crearArbitro = async (data) => {
  const { nombres, apellidos, cedula, telefono, correo, direccion } = data;

  try {
    const result = await pool.query(
      `
      INSERT INTO arbitros
      (nombres, apellidos, cedula, telefono, correo, direccion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [nombres, apellidos, cedula, telefono, correo, direccion]
    );

    return {
      success: true,
      data: result.rows[0],
    };

  } catch (error) {

    // 🟡 CÉDULA DUPLICADA
    if (error.code === "23505") {
      return {
        success: false,
        message: "La cédula ya existe",
      };
    }

    // 🔴 OTRO ERROR REAL
    return {
      success: false,
      message: "Error al registrar árbitro",
    };
  }
};

// ============================================
// LISTAR ÁRBITROS (NO ELIMINADOS)
// ============================================
export const listarArbitros = async () => {
  const result = await pool.query(
    `SELECT *
     FROM arbitros
     WHERE eliminado = false
     ORDER BY fecha_registro DESC`
  );

  return result.rows;
};

// ============================================
// EDITAR ÁRBITRO
// ============================================
export const editarArbitro = async (id, data) => {
  const { nombres, apellidos, cedula, telefono, correo, direccion } = data;

  const result = await pool.query(
    `UPDATE arbitros
     SET nombres = $1,
         apellidos = $2,
         cedula = $3,
         telefono = $4,
         correo = $5,
         direccion = $6
     WHERE id_arbitro = $7
       AND eliminado = false
     RETURNING *`,
    [nombres, apellidos, cedula, telefono, correo, direccion, id]
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      message: "Árbitro no encontrado o eliminado",
    };
  }

  return {
    success: true,
    message: "Árbitro actualizado correctamente",
    data: result.rows[0],
  };
};


// ============================================
// ELIMINAR ÁRBITRO (SOFT DELETE)
// ============================================
export const eliminarArbitro = async (id) => {
  const result = await pool.query(
    `UPDATE arbitros
     SET eliminado = true,
         fecha_eliminacion = NOW()
     WHERE id_arbitro = $1
       AND eliminado = false
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Árbitro no encontrado o ya eliminado");
  }

  return result.rows[0];
};

// ============================================
// HABILITAR ÁRBITRO
// ============================================
export const habilitarArbitro = async (id) => {
  const result = await pool.query(
    `UPDATE arbitros
     SET estado = true
     WHERE id_arbitro = $1
       AND eliminado = false
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Árbitro no encontrado o eliminado");
  }

  return result.rows[0];
};

// ============================================
// DESHABILITAR ÁRBITRO
// ============================================
export const deshabilitarArbitro = async (id) => {
  const result = await pool.query(
    `UPDATE arbitros
     SET estado = false
     WHERE id_arbitro = $1
       AND eliminado = false
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Árbitro no encontrado o eliminado");
  }

  return result.rows[0];
};
