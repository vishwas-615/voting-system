const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const ElectionSystem = await hre.ethers.getContractFactory("ElectionSystem");
  const electionSystem = await ElectionSystem.deploy();

  await electionSystem.waitForDeployment();

  const contractAddress = await electionSystem.getAddress();

  console.log("ElectionSystem deployed to:", contractAddress);

  // Store the address in deployedAddress.json
  const addressPath = path.join(__dirname, "deployedAddress.json");
  fs.writeFileSync(
    addressPath,
    JSON.stringify({ address: contractAddress }, null, 2)
  );
  console.log("Contract address saved to deployedAddress.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
