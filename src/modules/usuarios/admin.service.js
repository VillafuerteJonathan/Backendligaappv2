import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

export const UsuarioService = {

  async crearAdmin() {
  try {
    const cedula = '1801770429';
    const nombre = 'Romel Narcizo';
    const apellido = 'López Fiallos';
    const correo = 'ldppicaihua@hotmail.com';
    const telefono = '2762758';
    const rol = 'admin';
    const password = '123456';

    const password_hash = await bcrypt.hash(password, 10);

    const res = await pool.query(`SELECT * FROM usuarios WHERE cedula=$1`, [cedula]);

    if (res.rows.length > 0) {
      console.log('Administrador ya existe');
      return res.rows[0];
    }

    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, cedula, correo, telefono, rol, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, apellido, cedula, correo, telefono, rol, password_hash]
    );

    console.log('Administrador creado:', insert.rows[0]);
    return insert.rows[0];

  } catch (error) {
    console.error('Error creando admin:', error);
    throw error;
  }
}


};
