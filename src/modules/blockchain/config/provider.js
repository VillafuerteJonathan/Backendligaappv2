import { ethers } from "ethers";

const network = "mainnet"; // También puede ser "homestead"
const infuraApiKey = "fd553c4f1106498fb98507224f6ee7e9";

const provider = new ethers.InfuraProvider(network, infuraApiKey);