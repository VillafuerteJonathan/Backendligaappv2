// src/modules/usuarios/auth/auth.routes.js
import { Router } from 'express';
import { login } from './auth.controller.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario (solo admin por ahora)
 * @access  Public
 */
router.post('/login', login);

export default router;
