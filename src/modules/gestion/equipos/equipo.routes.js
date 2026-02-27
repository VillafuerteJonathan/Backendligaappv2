import express from "express";
import {
  crear,
  listar,
  editar,
  eliminar,
  habilitar,
  deshabilitar
} from "./equipo.controller.js"; // ✅ MISMA CARPETA

const router = express.Router();

router.get("/", listar);
router.post("/", crear);
router.put("/:id", editar);
router.delete("/:id", eliminar);

router.patch("/:id/habilitar", habilitar);
router.patch("/:id/deshabilitar", deshabilitar);

export default router;
