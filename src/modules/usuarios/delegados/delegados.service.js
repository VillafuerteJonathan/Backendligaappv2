// src/modules/usuarios/delegados/delegados.service.js
import pool from '../../../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../../../utils/email.js'; // tu función Brevo

export const DelegadosService = {

  // ===============================
  // LISTAR DELEGADOS
  // ===============================
  async listarDelegado() {
    const res = await pool.query(
      `SELECT id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro
       FROM usuarios
       WHERE rol = 'delegado'
         AND eliminado = false
       ORDER BY nombre ASC`
    );
    return res.rows;
  },

  // ===============================
  // CREAR DELEGADO
  // ===============================
  async crearDelegado(data) {
  const { nombre, apellido, cedula, correo, telefono } = data;

  if (!correo) {
    throw new Error("El correo del delegado es obligatorio");
  }

  const rol = 'delegado';
  const estado = true;

  // 🔐 Generar contraseña aleatoria
  const password = crypto.randomBytes(4).toString('hex');
  const password_hash = await bcrypt.hash(password, 10);

  // 🔍 Verificar si ya existe (por correo o cédula)
  const existe = await pool.query(
    `SELECT * FROM usuarios WHERE correo = $1 OR cedula = $2 LIMIT 1`,
    [correo, cedula]
  );

  // ======================================
  // 🔁 CASO: YA EXISTE
  // ======================================
  if (existe.rows.length > 0) {
    const usuario = existe.rows[0];

    // 👉 SI ESTÁ ELIMINADO → REACTIVAR
    if (usuario.eliminado) {
      const res = await pool.query(
        `UPDATE usuarios
         SET nombre=$1,
             apellido=$2,
             telefono=$3,
             estado=$4,
             eliminado=false,
             password_hash=$5,
             rol=$6
         WHERE id_usuario=$7
         RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
        [nombre, apellido, telefono, estado, password_hash, rol, usuario.id_usuario]
      );

      return {
        delegado: res.rows[0],
        password,
        reactivado: true
      };
    }

    // ❌ YA EXISTE Y ESTÁ ACTIVO
    throw new Error("El usuario ya existe y está activo");
  }

  // ======================================
  // 🆕 CASO: NO EXISTE → INSERTAR
  // ======================================
  const res = await pool.query(
    `INSERT INTO usuarios
     (nombre, apellido, cedula, correo, telefono, rol, estado, password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
    [nombre, apellido, cedula, correo, telefono, rol, estado, password_hash]
  );

  return {
    delegado: res.rows[0],
    password,
    reactivado: false
  };
},

  // ===============================
  // ACTUALIZAR DELEGADO
  // ===============================
  async actualizarDelegado(id_usuario, data) {
    const fields = [];
    const values = [];
    let i = 1;

    ['nombre', 'apellido', 'telefono', 'correo', 'estado'].forEach((key) => {
      if (data[key] !== undefined) {
        fields.push(`${key}=$${i}`);
        values.push(data[key]);
        i++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    values.push(id_usuario);

    const res = await pool.query(
      `UPDATE usuarios
       SET ${fields.join(', ')}
       WHERE id_usuario=$${i}
         AND rol='delegado'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
      values
    );

    if (res.rows.length === 0) {
      throw new Error('Delegado no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // HABILITAR DELEGADO
  // ===============================
  async habilitarDelegado(id_usuario) {
    const res = await pool.query(
      `UPDATE usuarios
       SET estado = true
       WHERE id_usuario=$1
         AND rol='delegado'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, estado`,
      [id_usuario]
    );

    if (res.rows.length === 0) {
      throw new Error('Delegado no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // DESHABILITAR DELEGADO
  // ===============================
  async deshabilitarDelegado(id_usuario) {
    const res = await pool.query(
      `UPDATE usuarios
       SET estado = false
       WHERE id_usuario=$1
         AND rol='delegado'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, estado`,
      [id_usuario]
    );

    if (res.rows.length === 0) {
      throw new Error('Delegado no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // ELIMINAR DELEGADO (SOFT DELETE)
  // ===============================
  async eliminarDelegado(id_usuario) {
    await pool.query(
      `UPDATE usuarios
       SET eliminado = true
       WHERE id_usuario=$1
         AND rol='delegado'`,
      [id_usuario]
    );
  }
};