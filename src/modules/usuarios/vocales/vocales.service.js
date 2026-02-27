// src/modules/usuarios/delegados/delegados.service.js
import pool from '../../../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../../../utils/email.js'; // Gmail SMTP

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

    const rol = 'vocal';
    const estado = true;

    // 🔐 Generar contraseña aleatoria
    const password = crypto.randomBytes(4).toString('hex');
    const password_hash = await bcrypt.hash(password, 10);

    const res = await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, cedula, correo, telefono, rol, estado, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id_usuario, nombre, apellido, cedula, correo, telefono, rol, estado, fecha_registro`,
      [nombre, apellido, cedula, correo, telefono, rol, estado, password_hash]
    );

    const vocal = res.rows[0];

    // 📧 Enviar correo
    try {
      await sendEmail({
        to: correo,
        subject: 'Cuenta de Vocal - Liga Deportiva de Picaíhua',
        text: `Hola ${nombre},

Tu cuenta de vocal ha sido creada.

Usuario: ${correo}
Contraseña temporal: ${password}

Por favor cambia tu contraseña al iniciar sesión.`,
        html: `
          <h3>Hola ${nombre}</h3>
          <p>Tu cuenta de <b>delegado</b> ha sido creada.</p>
          <p><b>Usuario:</b> ${correo}</p>
          <p><b>Contraseña temporal:</b> ${password}</p>
          <p>⚠️ Cambia tu contraseña al iniciar sesión.</p>
        `
      });
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
    }

    return vocal;
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
      throw new Error('Delegado no encontrado');
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
      throw new Error('Delegado no encontrado');
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
