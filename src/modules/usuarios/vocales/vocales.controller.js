// src/modules/usuarios/delegados/delegados.controller.js
import { VocalesService } from './vocales.service.js';

export const VocalController = {

  // ===============================
  // LISTAR VOCALES
  // ===============================
  async listar(req, res) {
    try {
      const vocales = await VocalesService.listarVocales();
      res.json({
        success: true,
        data: vocales
      });
    } catch (err) {
      console.error('Error al listar vocales:', err);
      res.status(500).json({
        success: false,
        message: 'Error al listar vocales'
      });
    }
  },

  // ===============================
  // CREAR DELEGADO
  // ===============================
  async crear(req, res) {
    try {
      const vocal = await VocalesService.crearVocal(req.body);
      res.status(201).json({
        success: true,
        data: vocal
      });
    } catch (err) {
      console.error('Error al crear vocal:', err);

      // Error de duplicidad (correo o cédula)
      if (err.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'La cédula o el correo ya están registrados'
        });
      }

      res.status(400).json({
        success: false,
        message: err.message || 'Error al crear vocal'
      });
    }
  },

  // ===============================
  // ACTUALIZAR VOCALES
  // ===============================
  async actualizar(req, res) {
    try {
      const vocal = await VocalesService.actualizarVocal(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: vocal
      });
    } catch (err) {
      console.error('Error al actualizar vocal:', err);

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
  // HABILITAR VOCAL
  // ===============================
  async habilitar(req, res) {
    try {
      const vocal = await VocalesService.habilitarVocal(req.params.id);
      res.json({
        success: true,
        data: vocal,
        message: 'Vocal habilitado correctamente'
      });
    } catch (err) {
      console.error('Error al habilitar vocal:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al habilitar vocal'
      });
    }
  },

  // ===============================
  // DESHABILITAR VOCAL
  // ===============================
  async deshabilitar(req, res) {
    try {
      const vocal = await VocalesService.deshabilitarVocal(req.params.id);
      res.json({
        success: true,
        data: vocal,
        message: 'Vocal deshabilitado correctamente'
      });
    } catch (err) {
      console.error('Error al deshabilitar vocal:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al deshabilitar vocal'
      });
    }
  },

  // ===============================
  // ELIMINAR DELEGADO (SOFT DELETE)
  // ===============================
  async eliminar(req, res) {
    try {
      await VocalesService.eliminarVocal(req.params.id);
      res.json({
        success: true,
        message: 'Vocal eliminado correctamente'
      });
    } catch (err) {
      console.error('Error al eliminar vocal:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al eliminar vocal'
      });
    }
  }

};
