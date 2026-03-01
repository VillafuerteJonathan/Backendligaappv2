// src/modules/blockchain/hash.util.js
import fs from "fs";
import crypto from "crypto";

/**
 * Calcula un hash SHA256 combinando dos archivos
 * @param {string} filePath1 - Ruta del primer archivo (foto frente)
 * @param {string} filePath2 - Ruta del segundo archivo (foto atrás)
 * @returns {string} hash hexadecimal
 */
export async function calcularHash(filePath1, filePath2) {
  try {
    const data1 = fs.readFileSync(filePath1);
    const data2 = fs.readFileSync(filePath2);

    // Concatenar buffers
    const combined = Buffer.concat([data1, data2]);

    // Calcular hash SHA256
    const hash = crypto.createHash("sha256").update(combined).digest("hex");

    return hash;
  } catch (error) {
    console.error("Error calculando hash:", error);
    throw new Error("No se pudo calcular hash de las fotos");
  }
}
