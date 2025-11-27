const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "ETH\n"
  );

  // Deploy ARDToken
  console.log("📦 Deploying ARDToken...");
  const ARDToken = await hre.ethers.getContractFactory("ARDToken");
  const ardToken = await ARDToken.deploy();
  await ardToken.waitForDeployment();
  const ardTokenAddress = await ardToken.getAddress();
  console.log("✅ ARDToken deployed to:", ardTokenAddress);

  // Set treasury as deployer for now
  const treasury = deployer.address;
  console.log("🏦 Treasury address:", treasury);

  // Deploy GamePayments
  console.log("\n📦 Deploying GamePayments...");
  const GamePayments = await hre.ethers.getContractFactory("GamePayments");
  const gamePayments = await GamePayments.deploy(ardTokenAddress, treasury);
  await gamePayments.waitForDeployment();
  const gamePaymentsAddress = await gamePayments.getAddress();
  console.log("✅ GamePayments deployed to:", gamePaymentsAddress);

  // Approve GamePayments to spend tokens from treasury
  console.log("\n🔓 Approving GamePayments to spend treasury tokens...");
  const approveAmount = hre.ethers.parseEther("1000000"); // 1M ARD
  const approveTx = await ardToken.approve(gamePaymentsAddress, approveAmount);
  await approveTx.wait();
  console.log(
    "✅ Approved GamePayments to spend",
    hre.ethers.formatEther(approveAmount),
    "ARD"
  );

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    treasury: treasury,
    contracts: {
      ARDToken: ardTokenAddress,
      GamePayments: gamePaymentsAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Generate TypeScript constants file
  const contractsContent = `// Auto-generated contract addresses
// Network: ${hre.network.name}
// Generated: ${new Date().toISOString()}

export const CONTRACTS = {
  ARDToken: "${ardTokenAddress}" as const,
  GamePayments: "${gamePaymentsAddress}" as const,
  Treasury: "${treasury}" as const,
};

export const CHAIN_ID = ${deploymentInfo.chainId};
`;

  const contractsFile = path.join(
    __dirname,
    "..",
    "src",
    "utils",
    "contracts.ts"
  );
  fs.writeFileSync(contractsFile, contractsContent);
  console.log("📝 Contract addresses saved to:", contractsFile);

  console.log("\n✨ Deployment complete!\n");
  console.log("📋 Summary:");
  console.log("  ARDToken:", ardTokenAddress);
  console.log("  GamePayments:", gamePaymentsAddress);
  console.log("  Treasury:", treasury);
  console.log("\n🎯 Next steps:");
  console.log("  1. Mint some ARD tokens to test users");
  console.log("  2. Update .env with contract addresses");
  console.log("  3. Run the Next.js app: yarn dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
