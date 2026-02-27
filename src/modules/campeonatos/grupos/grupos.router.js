import express from 'express';
import {        
  crearGrupoController,
  listarGruposController,
  obtenerGrupoController,
  editarGrupoController,
  habilitarGrupoController,
  deshabilitarGrupoController,
  eliminarGrupoController,
} from './grupos.controller.js';

const router = express.Router();

// ============================================
// RUTAS BÁSICAS DE CRUD
// ============================================

// Crear grupo
router.post('/', crearGrupoController); 

// Listar todos los grupos activos (no eliminados)
router.get('/', listarGruposController);

// Obtener grupo por ID
router.get('/:id', obtenerGrupoController);

// Editar grupo
router.put('/:id', editarGrupoController);

// ============================================
// RUTAS PARA GESTIÓN DE ESTADO
// ============================================

// Habilitar grupo
router.patch('/:id/habilitar', habilitarGrupoController);

// Deshabilitar grupo
router.patch('/:id/deshabilitar', deshabilitarGrupoController);

// ============================================
// RUTAS PARA SOFT DELETE
// ============================================

// Eliminar grupo (soft delete)
router.delete('/:id', eliminarGrupoController);

export default router;
