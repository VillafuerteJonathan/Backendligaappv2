import express from 'express';
import {
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

} from './cancha.controller.js';

const router = express.Router();


// ============================================
// RUTAS BÁSICAS DE CRUD
// ============================================

// Crear cancha
router.post('/', crearCanchaController);

// Listar canchas (solo no eliminadas)
router.get('/', listarCanchasController);


// Editar cancha
router.put('/:id', editarCanchaController);

// ============================================
// RUTAS PARA GESTIÓN DE ESTADO
// ============================================

// Habilitar cancha
router.patch('/:id/habilitar', habilitarCanchaController);

// Deshabilitar cancha
router.patch('/:id/deshabilitar', deshabilitarCanchaController);

// Cambiar estado (alternativa)
router.patch('/:id/estado', cambiarEstadoCanchaController);

// ============================================
// RUTAS PARA SOFT DELETE
// ============================================

// Eliminar cancha (soft delete)
router.delete('/:id', eliminarCanchaController);




export default router;