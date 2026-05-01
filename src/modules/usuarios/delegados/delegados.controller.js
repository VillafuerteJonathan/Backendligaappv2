// src/modules/usuarios/delegados/delegados.controller.js
import { DelegadosService } from './delegados.service.js';
import { sendEmail } from '../../../utils/email.js';

export const DelegadosController = {

  // ===============================
  // LISTAR DELEGADOS
  // ===============================
  async listar(req, res) {
    try {
      const delegados = await DelegadosService.listarDelegado();
      res.json({ success: true, data: delegados });
    } catch (err) {
      console.error('Error al listar delegados:', err);
      res.status(500).json({ success: false, message: 'Error al listar delegados' });
    }
  },

 // ===============================
// CREAR DELEGADO
// ===============================
async crear(req, res) {
  console.log("🟡 [CONTROLLER] Iniciando crear delegado");
  console.log("📥 Body recibido:", req.body);

  try {
    const { delegado, password, reactivado } = await DelegadosService.crearDelegado(req.body);

    console.log("✅ [CONTROLLER] Delegado creado:", delegado);
    console.log("🔐 Password generada:", password);
    console.log("🔁 ¿Reactivado?:", reactivado);

    // ======================================
    // 📧 ENVÍO DE CORREO
    // ======================================
    try {
      console.log("📧 Preparando envío de correo...");

      const subject = reactivado
        ? 'Cuenta Reactivada - Delegado - Liga Deportiva de Picaíhua'
        : 'Cuenta de Delegado - Liga Deportiva de Picaíhua';

      const text = reactivado
        ? `Hola ${delegado.nombre},

Tu cuenta ha sido reactivada.

Usuario: ${delegado.correo}
Nueva contraseña: ${password}

Por favor cambia tu contraseña al iniciar sesión.`
        : `Hola ${delegado.nombre},

Tu cuenta de delegado ha sido creada.

Usuario: ${delegado.correo}
Contraseña temporal: ${password}

Por favor cambia tu contraseña al iniciar sesión.`;

      const html = `
        <h3>Hola ${delegado.nombre}</h3>
        <p>${reactivado 
          ? 'Tu cuenta ha sido <b>reactivada</b>' 
          : 'Tu cuenta de <b>delegado</b> ha sido creada'}</p>
        <p><b>Usuario:</b> ${delegado.correo}</p>
        <p><b>Contraseña:</b> ${password}</p>
        <p>⚠️ Por seguridad, cambia tu contraseña al iniciar sesión.</p>
      `;

      console.log("📨 Datos del correo:");
      console.log("➡️ Para:", delegado.correo);
      console.log("➡️ Asunto:", subject);

      console.log("🌐 Variables de entorno:");
      console.log("EMAIL_USER:", process.env.EMAIL_USER);
      console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
      console.log("EMAIL_PORT:", process.env.EMAIL_PORT);

      console.log("🚀 Enviando correo...");

      const result = await sendEmail({
        to: delegado.correo,
        subject,
        text,
        html
      });

      console.log("✅ Correo enviado correctamente:", result);

    } catch (emailError) {
      console.error("❌ [CONTROLLER] Error enviando correo:");
      console.error("Mensaje:", emailError.message);
      console.error("Stack:", emailError.stack);
    }

    // ======================================
    // ✅ RESPUESTA
    // ======================================
    res.status(201).json({
      success: true,
      data: delegado,
      reactivado
    });

  } catch (err) {
    console.error("🔥 [CONTROLLER] Error general:");
    console.error(err);

    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'La cédula o el correo ya están registrados'
      });
    }

    res.status(400).json({
      success: false,
      message: err.message || 'Error al crear delegado'
    });
  }
},

  // ===============================
  // ACTUALIZAR, HABILITAR, DESHABILITAR, ELIMINAR
  // ===============================
  async actualizar(req, res) {
    try {
      const delegado = await DelegadosService.actualizarDelegado(req.params.id, req.body);
      res.json({ success: true, data: delegado });
    } catch (err) {
      console.error('Error al actualizar delegado:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al actualizar delegado' });
    }
  },

  async habilitar(req, res) {
    try {
      const delegado = await DelegadosService.habilitarDelegado(req.params.id);
      res.json({ success: true, data: delegado, message: 'Delegado habilitado correctamente' });
    } catch (err) {
      console.error('Error al habilitar delegado:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al habilitar delegado' });
    }
  },

  async deshabilitar(req, res) {
    try {
      const delegado = await DelegadosService.deshabilitarDelegado(req.params.id);
      res.json({ success: true, data: delegado, message: 'Delegado deshabilitado correctamente' });
    } catch (err) {
      console.error('Error al deshabilitar delegado:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al deshabilitar delegado' });
    }
  },

  async eliminar(req, res) {
    try {
      await DelegadosService.eliminarDelegado(req.params.id);
      res.json({ success: true, message: 'Delegado eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar delegado:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al eliminar delegado' });
    }
  }

};