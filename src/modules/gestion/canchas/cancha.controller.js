// cancha.controller.js
import * as canchaService from './cancha.service.js';

// ============================================
// CONTROLADORES PARA CRUD BÁSICO
// ============================================

/**
 * Crear una nueva cancha
 */
export const crearCanchaController = async (req, res) => {
  try {
    const cancha = await canchaService.crearCancha(req.body);
    
    res.status(201).json({
      success: true,
      data: cancha,
      message: 'Cancha creada exitosamente'
    });
  } catch (error) {
    console.error('Error en crearCanchaController:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Listar todas las canchas NO ELIMINADAS (para usuarios normales)
 */
export const listarCanchasController = async (req, res) => {
  try {
    const canchas = await canchaService.listarCanchas();
    
    res.status(200).json({
      success: true,
      data: canchas,
      count: canchas.length,
      message: canchas.length > 0 
        ? 'Canchas obtenidas exitosamente' 
        : 'No hay canchas registradas'
    });
  } catch (error) {
    console.error('Error en listarCanchasController:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener canchas',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



/**
 * Editar una cancha existente
 */
export const editarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await canchaService.editarCancha(id, req.body);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: 'Cancha actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en editarCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al actualizar cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================
// CONTROLADORES PARA GESTIÓN DE ESTADO
// ============================================

/**
 * Habilitar una cancha
 */
export const habilitarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await canchaService.habilitarCancha(id);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: 'Cancha habilitada exitosamente'
    });
  } catch (error) {
    console.error('Error en habilitarCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al habilitar cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Deshabilitar una cancha
 */
export const deshabilitarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await canchaService.deshabilitarCancha(id);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: 'Cancha deshabilitada exitosamente'
    });
  } catch (error) {
    console.error('Error en deshabilitarCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al deshabilitar cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Cambiar estado de una cancha (alternativa unificada)
 */
export const cambiarEstadoCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (typeof estado !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'El campo "estado" debe ser un valor booleano'
      });
    }
    
    const cancha = await canchaService.cambiarEstadoCancha(id, estado);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: `Cancha ${estado ? 'habilitada' : 'deshabilitada'} exitosamente`
    });
  } catch (error) {
    console.error('Error en cambiarEstadoCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al cambiar estado de la cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================
// CONTROLADORES PARA SOFT DELETE
// ============================================

/**
 * Eliminar una cancha (soft delete)
 */
export const eliminarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await canchaService.eliminarCancha(id);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: 'Cancha eliminada exitosamente',
      warning: 'Esta es una eliminación lógica. La cancha puede ser restaurada.'
    });
  } catch (error) {
    console.error('Error en eliminarCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al eliminar cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Restaurar una cancha eliminada
 */
export const restaurarCanchaController = async (req, res) => {
  try {
    const { id } = req.params;
    const cancha = await canchaService.restaurarCancha(id);
    
    res.status(200).json({
      success: true,
      data: cancha,
      message: 'Cancha restaurada exitosamente'
    });
  } catch (error) {
    console.error('Error en restaurarCanchaController:', error);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al restaurar cancha',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

 


// ============================================
// EXPORTAR TODOS LOS CONTROLADORES
// ============================================

export default {
  // CRUD básico
  crearCanchaController,
  listarCanchasController,
  editarCanchaController,
  
  // Gestión de estado
  habilitarCanchaController,
  deshabilitarCanchaController,
  cambiarEstadoCanchaController,
  
  // Soft delete
  eliminarCanchaController,

  
};