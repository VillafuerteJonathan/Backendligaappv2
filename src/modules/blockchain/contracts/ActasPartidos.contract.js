import { Contract } from "ethers";
import { signer } from "../config/signer.js";
import fs from "fs";
import path from "path";

// 🔹 Cargar ABI de JSON sin 'assert'
const abiPath = path.resolve("./src/modules/blockchain/abi/ActasPartidos.abi.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Dirección del contrato (puedes usar la de Hardhat o env)
const CONTRACT_ADDRESS = process.env.ACTAS_CONTRACT_ADDRESS ;

export const actasContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
