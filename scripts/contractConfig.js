const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

const ABI_PATH = "./artifacts/contracts/ElectionSystem.sol/ElectionSystem.json";
const ADDR_PATH = path.join(__dirname, "deployedAddress.json");

if (!fs.existsSync(ADDR_PATH)) {
  throw new Error("Contract address not found. Please deploy the contract first.");
}

const { address: CONTRACT_ADDRESS } = JSON.parse(fs.readFileSync(ADDR_PATH));
const contractJson = JSON.parse(fs.readFileSync(ABI_PATH));
const web3 = new Web3("http://127.0.0.1:8545"); // Hardhat local node
const contract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS);
console.log("Contract initialized at address:", CONTRACT_ADDRESS);

async function getContractAndDefaultAccount() {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  console.log("Using default account:", defaultAccount);
  return { contract, defaultAccount };
}

module.exports = {
  getContractAndDefaultAccount
};