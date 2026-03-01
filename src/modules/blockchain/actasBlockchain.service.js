import { actasContract } from "../contracts/ActasPartidos.contract.js";
import { keccak256, toUtf8Bytes } from "ethers";

/**
 * Convierte UUID → bytes32
 */
function hashIdPartido(idPartido) {
  return keccak256(toUtf8Bytes(idPartido));
}

/**
 * Registrar acta en blockchain
 */
export async function registrarActaBlockchain({
  idPartido,
  hashActa,
  arbitroId,
  vocalId,
  golesLocal,
  golesVisitante
}) {
  try {
    const idPartidoHash = hashIdPartido(idPartido);

    const tx = await actasContract.registrarActa(
      idPartidoHash,
      hashActa,
      arbitroId,
      vocalId,
      golesLocal,
      golesVisitante
    );

    await tx.wait();

    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error) {
    console.error("❌ Error registrando acta en blockchain:", error);
    return {
      success: false,
      error: error.shortMessage || error.message
    };
  }
}

/**
 * Obtener acta desde blockchain
 */
export async function obtenerActaBlockchain(idPartido) {
  try {
    const idPartidoHash = hashIdPartido(idPartido);

    const acta = await actasContract.obtenerActa(idPartidoHash);

    return {
      success: true,
      data: {
        idPartidoHash: acta[0],
        hashActa: acta[1],
        arbitroId: acta[2],
        vocalId: acta[3],
        golesLocal: Number(acta[4]),
        golesVisitante: Number(acta[5]),
        timestamp: Number(acta[6])
      }
    };
  } catch (error) {
    console.error("❌ Error obteniendo acta de blockchain:", error);
    return {
      success: false,
      error: error.shortMessage || error.message
    };
  }
}
