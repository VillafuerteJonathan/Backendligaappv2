import {
  obtenerCampeonatosConActasPendientes,
  obtenerActasPendientesPorCampeonato,
  revisarActa
} from "./verificacion.service.js";

import { validate as isUUID } from "uuid";
import path from "path";
import fs from "fs";

/**
 * 🔍 GET /verificacion/campeonatos
 */
export async function getCampeonatos(req, res) {
  try {
    const data = await obtenerCampeonatosConActasPendientes();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("❌ getCampeonatos:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno"
    });
  }
}

/**
 * 📋 GET /verificacion/campeonatos/:id/actas
 */
export async function getActasPorCampeonato(req, res) {
  const { id } = req.params;

  if (!isUUID(id)) {
    return res.status(400).json({ message: "ID de campeonato inválido" });
  }

  try {
    const data = await obtenerActasPendientesPorCampeonato(id);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("❌ getActasPorCampeonato:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno"
    });
  }
}

/**
 * ✅ POST /verificacion/actas/:id/revisar
 */
export async function revisarActaController(req, res) {
  const { id } = req.params;
  const { comentario } = req.body;
  const juezId = req.user?.id_usuario;

  // 1️⃣ Validar ID de partido
  if (!isUUID(id)) {
    return res.status(400).json({
      success: false,
      errorType: "invalid_id",
      message: "ID de partido inválido"
    });
  }

  // 2️⃣ Validar token / usuario
  if (!juezId) {
    return res.status(401).json({
      success: false,
      errorType: "unauthorized",
      message: "Token requerido o inválido"
    });
  }

  try {
    // 3️⃣ Llamar al servicio
    const result = await revisarActa({
      idPartido: id,
      juezId,
      comentario
    });

    // 4️⃣ OK
    // 4️⃣ Responder según resultado del servicio
if (result?.success === false) {
  return res.status(422).json({
    success: false,
    errorType: result.errorType || "data_integrity",
    message: result.message || "Datos alterados detectados"
  });
}

// ✅ ÉXITO REAL
return res.status(200).json({
  success: true,
  message: result.message || "Acta verificada correctamente"
});


  } catch (error) {
    console.error("❌ revisarActaController:", error.message);

    let statusCode = 500;
    let errorType = "server_error";
    let message = "Error al revisar el acta";

    // 🚨 INTEGRIDAD DE DATOS (BLOCKCHAIN)
    if (
      error.errorType === "data_integrity" ||
      error.message?.includes("ALERTA DE INTEGRIDAD")
    ) {
      statusCode = 422;
      errorType = "data_integrity";
      message = error.message;

    // ⚠️ Acta ya revisada
    } else if (error.message?.includes("ya fue revisada")) {
      statusCode = 409;
      errorType = "already_reviewed";
      message = error.message;

    // 🔍 No encontrada / no registrada
    } else if (
      error.message?.includes("no encontrada") ||
      error.message?.includes("no registrada")
    ) {
      statusCode = 404;
      errorType = "not_found";
      message = error.message;

    // 🔐 No autorizado
    } else if (
      error.message?.includes("Token") ||
      error.message?.includes("autorización")
    ) {
      statusCode = 401;
      errorType = "unauthorized";
      message = "Sesión inválida o expirada";
    }

    return res.status(statusCode).json({
      success: false,
      errorType,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 🖼️ GET /verificacion/uploads/:filePath(*)
 */
export async function servirArchivo(req, res) {
  const { filePath } = req.params;

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const fullPath = path.resolve(uploadsDir, filePath);

  // 🔒 Protección contra path traversal
  if (!fullPath.startsWith(uploadsDir)) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "Archivo no encontrado" });
  }

  return res.sendFile(fullPath);
}