// src/modules/usuarios/delegados/vocales.controller.js
import { VocalesService } from './vocales.service.js';
import { sendEmail } from '../../../utils/email.js';

export const VocalController = {

  // ===============================
  // LISTAR VOCALES
  // ===============================
  async listar(req, res) {
    try {
      const vocales = await VocalesService.listarVocales();
      res.json({ success: true, data: vocales });
    } catch (err) {
      console.error('Error al listar vocales:', err);
      res.status(500).json({ success: false, message: 'Error al listar vocales' });
    }
  },

 // ===============================
// CREAR VOCAL
// ===============================
// ===============================
// CREAR VOCAL
// ===============================
async crear(req, res) {
  console.log("🟡 [CONTROLLER] Iniciando crear vocal");

  try {
    const { vocal, password, reactivado } =
      await VocalesService.crearVocal(req.body);

    console.log("✅ Vocal creado:", vocal);
    console.log("🔁 Reactivado:", reactivado);

    // ======================================
    // 📧 ENVÍO DE CORREO (BREVO API)
    // ======================================
    try {
      if (!process.env.BREVO_API_KEY) {
        console.warn("⚠️ BREVO_API_KEY no configurada");
      } else {
        console.log("📧 Preparando envío de correo...");

        const subject = reactivado
          ? "Cuenta Reactivada - Liga Deportiva de Picaíhua"
          : "Cuenta de Vocal - Liga Deportiva de Picaíhua";

        const text = `Hola ${vocal.nombre},

${reactivado ? "Tu cuenta ha sido reactivada." : "Tu cuenta de vocal ha sido creada."}

Usuario: ${vocal.correo}
Contraseña: ${password}

Por favor cambia tu contraseña al iniciar sesión.`;

        const html = `
          <h3>Hola ${vocal.nombre}</h3>
          <p>${
            reactivado
              ? "Tu cuenta ha sido <b>reactivada</b>"
              : "Tu cuenta de <b>vocal</b> ha sido creada"
          }</p>
          <p><b>Usuario:</b> ${vocal.correo}</p>
          <p><b>Contraseña:</b> ${password}</p>
          <p>⚠️ Por seguridad, cambia tu contraseña al iniciar sesión.</p>
        `;

        console.log("📨 Enviando a:", vocal.correo);

        const result = await sendEmail({
          to: vocal.correo,
          subject,
          text,
          html,
        });

        console.log("✅ Correo enviado:", result);
      }
    } catch (emailError) {
      console.error(
        "❌ Error real enviando correo:",
        emailError.response?.body || emailError.message
      );
    }

    // ======================================
    // RESPUESTA
    // ======================================
    res.status(201).json({
      success: true,
      data: vocal,
      reactivado,
    });

  } catch (err) {
    console.error("🔥 Error al crear vocal:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "La cédula o el correo ya están registrados",
      });
    }

    res.status(400).json({
      success: false,
      message: err.message || "Error al crear vocal",
    });
  }
},


  // ===============================
  // ACTUALIZAR, HABILITAR, DESHABILITAR, ELIMINAR
  // ===============================
  async actualizar(req, res) {
    try {
      const vocal = await VocalesService.actualizarVocal(req.params.id, req.body);
      res.json({ success: true, data: vocal });
    } catch (err) {
      console.error('Error al actualizar vocal:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al actualizar vocal' });
    }
  },

  async habilitar(req, res) {
    try {
      const vocal = await VocalesService.habilitarVocal(req.params.id);
      res.json({ success: true, data: vocal, message: 'Vocal habilitado correctamente' });
    } catch (err) {
      console.error('Error al habilitar vocal:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al habilitar vocal' });
    }
  },

  async deshabilitar(req, res) {
    try {
      const vocal = await VocalesService.deshabilitarVocal(req.params.id);
      res.json({ success: true, data: vocal, message: 'Vocal deshabilitado correctamente' });
    } catch (err) {
      console.error('Error al deshabilitar vocal:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al deshabilitar vocal' });
    }
  },

  async eliminar(req, res) {
    try {
      await VocalesService.eliminarVocal(req.params.id);
      res.json({ success: true, message: 'Vocal eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar vocal:', err);
      res.status(400).json({ success: false, message: err.message || 'Error al eliminar vocal' });
    }
  }
};