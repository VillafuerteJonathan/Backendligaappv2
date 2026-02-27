import pool from '../../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '2h';

export const AuthService = {

  async login({ correo, password }) {
  const res = await pool.query(
    `SELECT * FROM usuarios WHERE correo=$1 AND eliminado=false`,
    [correo]
  );

  if (res.rows.length === 0)
    throw { status: 401, message: 'Usuario no encontrado' };

  const usuario = res.rows[0];

  const valid = await bcrypt.compare(password, usuario.password_hash);
  if (!valid)
    throw { status: 401, message: 'Contraseña incorrecta' };

  // ⛔ YA NO VALIDAMOS ROL AQUÍ

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: usuario.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol
    }
  };
},


  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw { status: 401, message: 'Token inválido' };
    }
  }

};
