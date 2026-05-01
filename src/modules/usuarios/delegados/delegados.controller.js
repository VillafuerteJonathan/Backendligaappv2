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
// ===============================
// CREAR DELEGADO
// ===============================
async crear(req, res) {
  console.log("🟡 [CONTROLLER] Iniciando crear delegado");

  try {
    const { delegado, password, reactivado } =
      await DelegadosService.crearDelegado(req.body);

    console.log("✅ Delegado creado:", delegado);
    console.log("🔁 Reactivado:", reactivado);

    // ======================================
    // 📧 ENVÍO DE CORREO (BREVO)
    // ======================================
    try {
      // 🚨 Validar config de Brevo
      if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
        console.warn("⚠️ Brevo no configurado. No se enviará correo.");
      } else {
        console.log("📧 Preparando envío de correo...");

        const subject = reactivado
          ? "Cuenta Reactivada - Liga Deportiva de Picaíhua"
          : "Cuenta de Delegado - Liga Deportiva de Picaíhua";

        const text = `Hola ${delegado.nombre},

Usuario: ${delegado.correo}
Contraseña: ${password}

Por favor cambia tu contraseña al iniciar sesión.`;

        const html = `
          <h3>Hola ${delegado.nombre}</h3>
          <p>${
            reactivado
              ? "Tu cuenta ha sido <b>reactivada</b>"
              : "Tu cuenta de <b>delegado</b> ha sido creada"
          }</p>
          <p><b>Usuario:</b> ${delegado.correo}</p>
          <p><b>Contraseña:</b> ${password}</p>
          <p>⚠️ Por seguridad, cambia tu contraseña al iniciar sesión.</p>
        `;

        console.log("📨 Enviando a:", delegado.correo);

        const result = await sendEmail({
          to: delegado.correo,
          subject,
          text,
          html,
        });

        console.log("✅ Correo enviado (Brevo):", result.messageId);
      }
    } catch (emailError) {
      console.error("❌ Error enviando correo:", emailError.message);
    }

    // ======================================
    // RESPUESTA
    // ======================================
    res.status(201).json({
      success: true,
      data: delegado,
      reactivado,
    });

  } catch (err) {
    console.error("🔥 Error general:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "La cédula o el correo ya están registrados",
      });
    }

    res.status(400).json({
      success: false,
      message: err.message || "Error al crear delegado",
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