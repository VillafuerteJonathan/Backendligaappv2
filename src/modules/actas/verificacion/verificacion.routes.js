import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import {
  getCampeonatos,
  getActasPorCampeonato,
  revisarActaController
} from "./verificacion.controller.js";

import { auth, authorizeRoles } from "../../../middlewares/auth.middleware.js";

const router = express.Router();

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// RUTAS DE VERIFICACIÓN DE ACTAS
// ============================================

// 🔍 Campeonatos con actas pendientes
router.get(
  "/campeonatos",
  auth,
  authorizeRoles("delegado", "admin"),
  getCampeonatos
);

// 📋 Actas pendientes por campeonato
router.get(
  "/campeonatos/:id/actas",
  auth,
  authorizeRoles("delegado", "admin"),
  getActasPorCampeonato
);

// ✅ Revisar acta
router.post(
  "/actas/:id/revisar",
  auth,
  authorizeRoles("delegado", "admin"),
  revisarActaController
);

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS (FORMA CORRECTA)
// ============================================

// /verificacion/uploads/actas/<uuid>/frente.jpg
router.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

export default router;
