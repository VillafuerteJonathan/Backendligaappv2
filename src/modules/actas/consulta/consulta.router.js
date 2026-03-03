// consulta.router.js

import { Router } from "express";
import { ConsultaController } from "./consulta.controller.js";

const router = Router();

router.get("/listar", ConsultaController.listarCampeonatos);
router.get("/listar/:id/partidos", ConsultaController.listarPartidosPorCampeonato);

export default router;