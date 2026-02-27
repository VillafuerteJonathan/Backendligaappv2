// categorias.controller.js
import * as categoriaService from './categorias.service.js';
// ============================================
// CONTROLADORES PARA CRUD BÁSICO
// ============================================ 
/**
 * Crear una nueva categoría
 */ 
export const crearCategoriaController = async (req, res) => {
  try {
    const categoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json({
      success: true,
      data: categoria,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error en crearCategoriaController:', error);
    res.status(500).json({  
        success: false, 
        error: error.message || 'Error al crear categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Listar todas las categorías NO ELIMINADAS (para usuarios normales)   
    */
export const listarCategoriasController = async (req, res) => {
  try {
    const categorias = await categoriaService.listarCategorias();
    res.status(200).json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error en listarCategoriasController:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Error al listar categorías',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Editar una categoría existente
 */
export const editarCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.actualizarCategoria(id, req.body);
    res.status(200).json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en editarCategoriaController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al actualizar categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }     
};
/**
 * Habilitar una categoría
 */
export const habilitarCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.habilitarCategoria(id);
    res.status(200).json({
      success: true,
      data: categoria,
      message: 'Categoría habilitada exitosamente'
    });
  } catch (error) {
    console.error('Error en habilitarCategoriaController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al habilitar categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Deshabilitar una categoría
 */
export const deshabilitarCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.deshabilitarCategoria(id);
    res.status(200).json({
      success: true,
      data: categoria,
      message: 'Categoría deshabilitada exitosamente'
    });
  } catch (error) {
    console.error('Error en deshabilitarCategoriaController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al deshabilitar categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Eliminar una categoría (eliminado lógico)
 */
export const eliminarCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.eliminarCategoria(id);
    res.status(200).json({
      success: true,
      data: categoria,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarCategoriaController:', error);
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al eliminar categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
