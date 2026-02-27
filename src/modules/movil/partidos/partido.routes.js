import express from 'express';
import partidoController from './partido.controller.js';
import { auth } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Orden correcto de rutas: primero las más específicas
router.get('/campeonatos/activos', partidoController.obtenerCampeonatosActivos);

// Detalles específicos
router.get('/detalle/:idPartido', partidoController.obtenerPartidoDetalle);
router.get('/:idPartido/verificar-integridad', partidoController.verificarIntegridad);
router.get('/:idPartido/verificar-registro', partidoController.verificarPartidoYaRegistrado);

// Estadísticas y conteo
router.get('/estadisticas', partidoController.obtenerEstadisticasVocal);
router.get('/:campeonatoId/conteo-estados', partidoController.obtenerConteoEstados);

// Listado de partidos
router.get('/:campeonatoId/partidos', partidoController.obtenerPartidosPendientes);

// Registro de resultados
router.post('/:idPartido/registrar', partidoController.registrarResultado);

// Historial
router.get('/historial', partidoController.obtenerHistorial);

export default router;
