import { Router } from "express";
import CampeonatosPosicionesController
  from "./posiciones.controller.js";

const router = Router();

/**
 * 📊 Campeonatos activos + grupos + tabla de posiciones
 */
router.get(
  "/campeonatos",
  CampeonatosPosicionesController.obtenerTablas
);

export default router;
