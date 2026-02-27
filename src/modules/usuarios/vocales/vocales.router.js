import express from 'express';
import { VocalController } from './vocales.controller.js';

const router = express.Router();

// Rutas CRUD para vocales
router.get('/', VocalController.listar);       // Listar todos
router.post('/', VocalController.crear);       // Crear uno nuevo
router.put('/:id', VocalController.actualizar); // Actualizar por ID

router.patch('/:id/habilitar', VocalController.habilitar);
router.patch('/:id/deshabilitar', VocalController.deshabilitar);

router.delete('/:id', VocalController.eliminar); // Eliminar por ID

export default router;
