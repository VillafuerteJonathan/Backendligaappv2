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
    try {
      // Crear delegado en DB
      const { delegado, password } = await DelegadosService.crearDelegado(req.body);

      // -------------------------------
      // Enviar correo
      // -------------------------------
      try {
       

        await sendEmail({
          to: delegado.correo,
          subject: 'Cuenta de Delegado - Liga Deportiva de Picaíhua',
          text: `Hola ${delegado.nombre},

Tu cuenta de delegado ha sido creada.

Usuario: ${delegado.correo}
Contraseña temporal: ${password}

Por favor cambia tu contraseña al iniciar sesión.`,
          html: `
            <h3>Hola ${delegado.nombre}</h3>
            <p>Tu cuenta de <b>delegado</b> ha sido creada con exito.</p>
            <p><b>Usuario:</b> ${delegado.correo}</p>
            <p><b>Contraseña:</b> ${password}</p>
            <p>⚠️ Esta contraseña es única e intransferible , cualquier porblema comuniquese con departamento de sistemas</p>
          `
        });

        

      } catch (emailError) {
        console.error("[CONTROLLER] ❌ Error enviando correo:", emailError.message);
      }

      // Retornar delegado
      res.status(201).json({ success: true, data: delegado });

    } catch (err) {
      console.error('Error al crear delegado:', err);

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