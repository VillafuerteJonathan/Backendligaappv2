import express from 'express';
import { DelegadosController } from './delegados.controller.js';

const router = express.Router();

// Rutas CRUD para delegados
router.get('/', DelegadosController.listar);       // Listar todos
router.post('/', DelegadosController.crear);       // Crear uno nuevo
router.put('/:id', DelegadosController.actualizar); // Actualizar por ID

router.patch('/:id/habilitar', DelegadosController.habilitar);
router.patch('/:id/deshabilitar', DelegadosController.deshabilitar);

router.delete('/:id', DelegadosController.eliminar); // Eliminar por ID

export default router;
