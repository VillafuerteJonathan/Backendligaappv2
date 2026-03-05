// src/modules/usuarios/delegados/vocales.service.js
import pool from '../../../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const VocalesService = {

  // ===============================
  // LISTAR VOCALES
  // ===============================
  async listarVocales() {
    const res = await pool.query(
      `SELECT id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro
       FROM usuarios
       WHERE rol = 'vocal'
         AND eliminado = false
       ORDER BY nombre ASC`
    );
    return res.rows;
  },

  // ===============================
  // CREAR VOCAL
  // ===============================
  async crearVocal(data) {
    const { nombre, apellido, cedula, correo, telefono } = data;

    if (!correo) {
      throw new Error("El correo del vocal es obligatorio");
    }

    const rol = 'vocal';
    const estado = true;

    // 🔐 Generar contraseña aleatoria
    const password = crypto.randomBytes(4).toString('hex');
    const password_hash = await bcrypt.hash(password, 10);

    // -------------------------------
    // INSERTAR EN LA BASE DE DATOS
    // -------------------------------
    const res = await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, cedula, correo, telefono, rol, estado, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
      [nombre, apellido, cedula, correo, telefono, rol, estado, password_hash]
    );

    const vocal = res.rows[0];

    console.log(`✅ Vocal creado en DB: ${vocal.nombre} (${vocal.correo})`);

    return { vocal, password }; // retornamos password temporal para el controller
  },

  // ===============================
  // ACTUALIZAR VOCAL
  // ===============================
  async actualizarVocal(id_usuario, data) {
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
         AND rol='vocal'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
      values
    );

    if (res.rows.length === 0) {
      throw new Error('Vocal no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // HABILITAR VOCAL
  // ===============================
  async habilitarVocal(id_usuario) {
    const res = await pool.query(
      `UPDATE usuarios
       SET estado = true
       WHERE id_usuario=$1
         AND rol='vocal'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, estado`,
      [id_usuario]
    );

    if (res.rows.length === 0) {
      throw new Error('Vocal no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // DESHABILITAR VOCAL
  // ===============================
  async deshabilitarVocal(id_usuario) {
    const res = await pool.query(
      `UPDATE usuarios
       SET estado = false
       WHERE id_usuario=$1
         AND rol='vocal'
         AND eliminado=false
       RETURNING id_usuario, nombre, apellido, estado`,
      [id_usuario]
    );

    if (res.rows.length === 0) {
      throw new Error('Vocal no encontrado');
    }

    return res.rows[0];
  },

  // ===============================
  // ELIMINAR VOCAL (SOFT DELETE)
  // ===============================
  async eliminarVocal(id_usuario) {
    await pool.query(
      `UPDATE usuarios
       SET eliminado = true
       WHERE id_usuario=$1
         AND rol='vocal'`,
      [id_usuario]
    );
  }
};