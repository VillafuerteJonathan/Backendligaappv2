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

    const delegado = res.rows[0];

    // -------------------------------
    // ENVIAR CORREO
    // -------------------------------
    try {
      

      await sendEmail({
        to: correo,
        subject: 'Cuenta de Delegado - Liga Deportiva de Picaíhua',
        text: `Hola ${nombre},

Tu cuenta de delegado ha sido creada.

Usuario: ${correo}
Contraseña temporal: ${password}

Por favor cambia tu contraseña al iniciar sesión.`,
        html: `
          <h3>Hola ${nombre}</h3>
          <p>Tu cuenta de <b>delegado</b> ha sido creada.</p>
          <p><b>Usuario:</b> ${correo}</p>
          <p><b>Contraseña:</b> ${password}</p>
          <p>Por favor cambia tu contraseña al iniciar sesión.</p>
        `
      });

 
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
    }

    return delegado;
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