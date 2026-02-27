import * as grupoService from './grupos.service.js';

// ============================================
// CONTROLADORES PARA CRUD DE GRUPOS
// ============================================

/**
 * Crear un nuevo grupo
 */
export const crearGrupoController = async (req, res) => {
  try {
    const grupo = await grupoService.crearGrupo(req.body);
    res.status(201).json({
      success: true,
      data: grupo,
      message: 'Grupo creado exitosamente'
    });
  } catch (error) {
    console.error('Error en crearGrupoController:', error);

    // 🔹 Si el error es de llave duplicada
    if (error.code === '23505' && error.constraint === 'grupo_nombre_key') {
      return res.status(400).json({
        success: false,
        error: 'Error al guardar grupo: ya existe un grupo con ese nombre',
      });
    }

    // Otros errores
    res.status(500).json({
      success: false,
      error: 'Error al guardar grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


/**
 * Listar todos los grupos activos (no eliminados)
 */
export const listarGruposController = async (req, res) => {
  try {
    const grupos = await grupoService.listarGrupos();
    res.status(200).json({
      success: true,
      data: grupos
    });
  } catch (error) {
    console.error('Error en listarGruposController:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al listar grupos',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Obtener un grupo por ID
 */
export const obtenerGrupoController = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await grupoService.getGrupoById(id);
    if (!grupo) {
      return res.status(404).json({
        success: false,
        error: 'Grupo no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      data: grupo
    });
  } catch (error) {
    console.error('Error en obtenerGrupoController:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Editar un grupo existente (solo nombre)
 */
export const editarGrupoController = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await grupoService.actualizarGrupo(id, req.body);
    res.status(200).json({
      success: true,
      data: grupo,
      message: 'Grupo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en editarGrupoController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al actualizar grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Habilitar un grupo
 */
export const habilitarGrupoController = async (req, res) => {
  try {
    const { id } = req.params;
    await grupoService.habilitarGrupo(id);
    res.status(200).json({
      success: true,
      message: 'Grupo habilitado exitosamente'
    });
  } catch (error) {
    console.error('Error en habilitarGrupoController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al habilitar grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Deshabilitar un grupo
 */
export const deshabilitarGrupoController = async (req, res) => {
  try {
    const { id } = req.params;
    await grupoService.deshabilitarGrupo(id);
    res.status(200).json({
      success: true,
      message: 'Grupo deshabilitado exitosamente'
    });
  } catch (error) {
    console.error('Error en deshabilitarGrupoController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al deshabilitar grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Eliminar un grupo (soft delete)
 */
export const eliminarGrupoController = async (req, res) => {
  try {
    const { id } = req.params;
    await grupoService.eliminarGrupo(id);
    res.status(200).json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarGrupoController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al eliminar grupo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
