import express from 'express';
import CampeonatosController from './campeonato.controller.js';

const router = express.Router();

// Crear
router.post('/', CampeonatosController.crear.bind(CampeonatosController));
router.put('/:id', CampeonatosController.actualizar.bind(CampeonatosController));
router.get('/', CampeonatosController.obtenerTodos.bind(CampeonatosController));
router.get('/:id', CampeonatosController.obtenerPorId.bind(CampeonatosController));
router.delete('/:id', CampeonatosController.eliminar.bind(CampeonatosController));
router.get('/:idCampeonato/grupos/:idGrupo/equipos', CampeonatosController.obtenerEquiposGrupo.bind(CampeonatosController));
router.post('/:idCampeonato/grupos/:idGrupo/equipos', CampeonatosController.agregarEquipoAGrupo.bind(CampeonatosController));
router.delete('/:idCampeonato/grupos/:idGrupo/equipos/:idEquipo', CampeonatosController.removerEquipoDeGrupo.bind(CampeonatosController));
router.post("/:id/generar-partidos", CampeonatosController.generarPartidos.bind(CampeonatosController));


export default router;
