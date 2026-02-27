// src/modules/usuarios/delegados/delegados.controller.js
import { DelegadosService } from './delegados.service.js';

export const DelegadosController = {

  // ===============================
  // LISTAR DELEGADOS
  // ===============================
  async listar(req, res) {
    try {
      const delegados = await DelegadosService.listarDelegado();
      res.json({
        success: true,
        data: delegados
      });
    } catch (err) {
      console.error('Error al listar delegados:', err);
      res.status(500).json({
        success: false,
        message: 'Error al listar delegados'
      });
    }
  },

  // ===============================
  // CREAR DELEGADO
  // ===============================
  async crear(req, res) {
    try {
      const delegado = await DelegadosService.crearDelegado(req.body);
      res.status(201).json({
        success: true,
        data: delegado
      });
    } catch (err) {
      console.error('Error al crear delegado:', err);

      // Error de duplicidad (correo o cédula)
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
  // ACTUALIZAR DELEGADO
  // ===============================
  async actualizar(req, res) {
    try {
      const delegado = await DelegadosService.actualizarDelegado(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: delegado
      });
    } catch (err) {
      console.error('Error al actualizar delegado:', err);

      if (err.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'La cédula o el correo ya están registrados'
        });
      }

      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar delegado'
      });
    }
  },

  // ===============================
  // HABILITAR DELEGADO
  // ===============================
  async habilitar(req, res) {
    try {
      const delegado = await DelegadosService.habilitarDelegado(req.params.id);
      res.json({
        success: true,
        data: delegado,
        message: 'Delegado habilitado correctamente'
      });
    } catch (err) {
      console.error('Error al habilitar delegado:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al habilitar delegado'
      });
    }
  },

  // ===============================
  // DESHABILITAR DELEGADO
  // ===============================
  async deshabilitar(req, res) {
    try {
      const delegado = await DelegadosService.deshabilitarDelegado(req.params.id);
      res.json({
        success: true,
        data: delegado,
        message: 'Delegado deshabilitado correctamente'
      });
    } catch (err) {
      console.error('Error al deshabilitar delegado:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al deshabilitar delegado'
      });
    }
  },

  // ===============================
  // ELIMINAR DELEGADO (SOFT DELETE)
  // ===============================
  async eliminar(req, res) {
    try {
      await DelegadosService.eliminarDelegado(req.params.id);
      res.json({
        success: true,
        message: 'Delegado eliminado correctamente'
      });
    } catch (err) {
      console.error('Error al eliminar delegado:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al eliminar delegado'
      });
    }
  }

};
