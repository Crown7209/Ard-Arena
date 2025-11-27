# 🚀 ARD Arena - Web3 Payment Prototype

Complete Web3 payment system using Next.js + Wagmi + ARD Tokens on Polygon

## 📋 What's Included

### Smart Contracts

- **ARDToken.sol** - ERC20 token for payments
- **GamePayments.sol** - Payment and reward management
- Deployed on Polygon Amoy Testnet

### Frontend

- **Web3 Demo Page** (`/web3-demo`)
- Wallet connection (MetaMask, WalletConnect)
- ARD token balance display
- Two action buttons:
  - Pay 100 ARD (player → treasury)
  - Claim 200 ARD (treasury → player)

### Backend

- **API Route** (`/api/send-reward`)
- Server-side wallet for secure reward distribution
- Prevents client-side manipulation

## 🛠️ Installation

### 1. Install Dependencies

```bash
# Install Next.js dependencies
yarn install

# Install contract dependencies
cd contracts
yarn install
cd ..
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Deployer wallet private key (for deploying contracts)
PRIVATE_KEY=0x...

# Treasury wallet private key (for sending rewards)
TREASURY_PRIVATE_KEY=0x...

# Polygon Amoy RPC (optional, has default)
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# Polygonscan API Key (optional, for contract verification)
POLYGONSCAN_API_KEY=...
```

⚠️ **IMPORTANT**: Never commit private keys! Add `.env` to `.gitignore`

### 3. Get Test MATIC

You need test MATIC for gas fees on Polygon Amoy:

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Get free test MATIC

## 📦 Deploy Contracts

### Compile Contracts

```bash
cd contracts
yarn compile
```

### Deploy to Polygon Amoy Testnet

```bash
yarn deploy:amoy
```

This will:

- Deploy ARDToken contract
- Deploy GamePayments contract
- Approve GamePayments to spend treasury tokens
- Save contract addresses to `src/utils/contracts.ts`
- Save deployment info to `deployments/polygonAmoy.json`

### Deploy to Local Hardhat Network (for testing)

```bash
# Terminal 1: Start local node
yarn node

# Terminal 2: Deploy contracts
yarn deploy:local
```

## 🪙 Mint Test Tokens

After deployment, mint ARD tokens to your test wallet:

```bash
cd contracts

# Mint to deployer address
yarn mint

# Mint to specific address
RECIPIENT_ADDRESS=0x... MINT_AMOUNT=10000 yarn mint
```

## 🎮 Run the Application

```bash
# From root directory
yarn dev
```

Visit: `http://localhost:3000/web3-demo`

## 📱 How to Use

### 1. Connect Wallet

- Click "Connect Wallet" button
- Choose MetaMask or WalletConnect
- Approve connection

### 2. Switch to Polygon Amoy

- Make sure you're on Polygon Amoy Testnet
- Network ID: 80002

### 3. Test Payments

**Pay 100 ARD:**

1. Click "Pay 100 ARD" button
2. Approve token spending (first time only)
3. Confirm payment transaction
4. Balance updates automatically

**Claim 200 ARD:**

1. Click "Claim 200 ARD" button
2. Backend sends reward from treasury
3. Balance updates automatically

## 📂 Project Structure

```
ard-arena/
├── contracts/
│   ├── ARDToken.sol              # ERC20 token contract
│   ├── GamePayments.sol          # Payment management
│   ├── hardhat.config.js         # Hardhat configuration
│   └── package.json              # Contract dependencies
├── scripts/
│   ├── deploy.js                 # Deployment script
│   └── mint-tokens.js            # Token minting script
├── deployments/
│   └── polygonAmoy.json          # Deployment addresses
├── src/
│   ├── app/
│   │   ├── web3-demo/
│   │   │   └── page.tsx          # Demo page
│   │   ├── api/
│   │   │   └── send-reward/
│   │   │       └── route.ts      # Reward API endpoint
│   │   ├── layout.tsx            # Root layout with Wagmi
│   │   └── providers.tsx         # Wagmi provider
│   ├── components/
│   │   └── web3/
│   │       └── Web3PaymentDemo.tsx  # Payment UI component
│   └── utils/
│       ├── config.ts             # Wagmi configuration
│       └── contracts.ts          # Contract addresses & ABIs
└── package.json
```

## 🔧 Contract Functions

### ARDToken

```solidity
// Mint tokens (owner only)
function mint(address to, uint256 amount)

// Burn tokens
function burn(uint256 amount)

// Standard ERC20 functions
function transfer(address to, uint256 amount)
function approve(address spender, uint256 amount)
function balanceOf(address account) returns (uint256)
```

### GamePayments

```solidity
// Player pays tokens to treasury
function payTokens(uint256 amount)

// Send reward to player (owner only)
function sendReward(address player, uint256 amount)

// Get player balance
function getPlayerBalance(address player) returns (uint256)

// Get treasury balance
function getTreasuryBalance() returns (uint256)
```

## 🌐 Frontend Hooks

```typescript
// Get wallet connection
const { address, isConnected, chain } = useAccount();

// Get ARD balance
const { data: balance } = useReadContract({
  address: CONTRACTS.ARDToken,
  abi: ARD_TOKEN_ABI,
  functionName: "balanceOf",
  args: [address],
});

// Write to contract
const { writeContract } = useWriteContract();
writeContract({
  address: CONTRACTS.GamePayments,
  abi: GAME_PAYMENTS_ABI,
  functionName: "payTokens",
  args: [parseEther("100")],
});
```

## 🔐 Security Notes

1. **Private Keys**: Never commit private keys to Git
2. **Treasury Wallet**: Keep treasury private key secure on server
3. **API Route**: Only backend can send rewards
4. **Allowances**: Users approve contract to spend tokens
5. **Reentrancy**: Contracts use ReentrancyGuard

## 🧪 Testing

### Test Payment Flow

1. Mint 1000 ARD to your wallet
2. Connect wallet on `/web3-demo`
3. Click "Pay 100 ARD"
4. Check balance decreased by 100
5. Click "Claim 200 ARD"
6. Check balance increased by 200

### Verify on Block Explorer

Visit [Polygon Amoy Explorer](https://amoy.polygonscan.com/)

- View your transactions
- Check contract interactions
- Verify token transfers

## 📊 Contract Addresses

After deployment, addresses are saved in:

- `src/utils/contracts.ts` (auto-imported in frontend)
- `deployments/polygonAmoy.json` (deployment record)

## 🚨 Troubleshooting

### "Insufficient balance" error

- Make sure you have ARD tokens (run mint script)
- Check you have test MATIC for gas

### "Wrong network" warning

- Switch MetaMask to Polygon Amoy Testnet
- Network ID: 80002
- RPC: https://rpc-amoy.polygon.technology

### "Approval failed"

- Make sure contract addresses are correct
- Check you have enough gas (MATIC)

### "Claim reward failed"

- Check treasury has enough ARD tokens
- Verify TREASURY_PRIVATE_KEY is set in .env
- Check API route logs

## 🎯 Next Steps

1. **Add More Features**:

   - Transaction history
   - Multiple payment amounts
   - Reward tiers
   - NFT rewards

2. **Integrate with Game**:

   - Pay to enter matches
   - Earn rewards for winning
   - Buy power-ups with ARD

3. **Deploy to Mainnet**:
   - Test thoroughly on testnet
   - Audit contracts
   - Deploy to Polygon mainnet

## 📚 Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Polygon Documentation](https://docs.polygon.technology/)

## ✅ Checklist

- [x] Smart contracts created
- [x] Deployment scripts ready
- [x] Frontend UI built
- [x] Wallet connection working
- [x] Payment function implemented
- [x] Reward claim implemented
- [x] Backend API created
- [x] Documentation complete

---

**Ready to test!** 🎮

Run `yarn dev` and visit `/web3-demo` to try it out!
