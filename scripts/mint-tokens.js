const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Load deployment info
  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}.json`
  );
  if (!fs.existsSync(deploymentFile)) {
    console.error(
      "❌ Deployment file not found. Please deploy contracts first."
    );
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const ardTokenAddress = deployment.contracts.ARDToken;

  console.log("🪙 Minting ARD tokens...\n");
  console.log("Network:", hre.network.name);
  console.log("ARDToken:", ardTokenAddress);
  console.log("Minter:", deployer.address);

  const ARDToken = await hre.ethers.getContractAt("ARDToken", ardTokenAddress);

  // Get recipient address from command line or use deployer
  const recipient = process.env.RECIPIENT_ADDRESS || deployer.address;
  const amount = process.env.MINT_AMOUNT || "10000"; // Default 10,000 ARD

  const mintAmount = hre.ethers.parseEther(amount);

  console.log("\n📝 Minting details:");
  console.log("  Recipient:", recipient);
  console.log("  Amount:", hre.ethers.formatEther(mintAmount), "ARD");

  const tx = await ARDToken.mint(recipient, mintAmount);
  console.log("\n⏳ Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Tokens minted successfully!");

  const balance = await ARDToken.balanceOf(recipient);
  console.log("\n💰 New balance:", hre.ethers.formatEther(balance), "ARD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
