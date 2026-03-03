// consulta.router.js

import { Router } from "express";
import { ConsultaController } from "./consulta.controller.js";

const router = Router();

router.get("/campeonatos", ConsultaController.listarCampeonatos);
router.get("/campeonatos/:id/partidos", ConsultaController.listarPartidosPorCampeonato);

export default router;