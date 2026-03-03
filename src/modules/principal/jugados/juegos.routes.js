import { Router } from "express";
import ListaJuegosController
  from "./juegos.controller.js";

const router = Router();

/**
 * 📊 Campeonatos activos + grupos + tabla de posiciones
 */
router.get(
  "/listar",
  ListaJuegosController.listarJuegos
);

export default router;
