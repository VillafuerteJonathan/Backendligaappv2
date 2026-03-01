import { Wallet, ethers } from "ethers";
import { NETWORK } from "./network.js"; // importa la config anterior
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

export { signer, provider };