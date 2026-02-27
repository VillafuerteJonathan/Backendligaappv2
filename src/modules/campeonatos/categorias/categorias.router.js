import express from 'express';
import {        
  // CRUD básico    
    crearCategoriaController,
    listarCategoriasController,
    editarCategoriaController,
    habilitarCategoriaController,
    deshabilitarCategoriaController,
    eliminarCategoriaController,
} from './categorias.controller.js';

const router = express.Router();
// ============================================
// RUTAS BÁSICAS DE CRUD
// ============================================
// Crear categoría
router.post('/', crearCategoriaController); 
// Listar categorías (solo no eliminadas)
router.get('/', listarCategoriasController);
// Editar categoría
router.put('/:id', editarCategoriaController);
// ============================================
// RUTAS PARA GESTIÓN DE ESTADO
// ============================================
// Habilitar categoría
router.patch('/:id/habilitar', habilitarCategoriaController);
// Deshabilitar categoría
router.patch('/:id/deshabilitar', deshabilitarCategoriaController);
// ============================================
// RUTAS PARA SOFT DELETE
// ============================================
// Eliminar categoría (soft delete)
router.delete('/:id', eliminarCategoriaController);
export default router;