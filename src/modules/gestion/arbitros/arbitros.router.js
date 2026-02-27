import express from "express";

import {
  crearArbitroController,
  listarArbitrosController,
  editarArbitroController,
  eliminarArbitroController,
  habilitarArbitroController,
  deshabilitarArbitroController,
} from "./arbitros.controller.js";

const router = express.Router();

// ============================================
// CRUD BÁSICO
// ============================================

// Crear árbitro
router.post("/", crearArbitroController);

// Listar árbitros (no eliminados)
router.get("/", listarArbitrosController);

// Editar árbitro
router.put("/:id", editarArbitroController);

// ============================================
// GESTIÓN DE ESTADO
// ============================================

// Habilitar árbitro
router.patch("/:id/habilitar", habilitarArbitroController);

// Deshabilitar árbitro
router.patch("/:id/deshabilitar", deshabilitarArbitroController);

// ============================================
// SOFT DELETE
// ============================================

// Eliminar árbitro
router.delete("/:id", eliminarArbitroController);

export default router;
