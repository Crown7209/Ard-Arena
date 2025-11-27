# 🚀 Quick Start - ARD Arena Web3 Prototype

## ⚡ 5-Minute Setup

### Step 1: Environment Setup (2 min)

Create `.env` file in root:

```bash
# Your wallet private key (for deploying contracts)
PRIVATE_KEY=0x...your_private_key_here

# Treasury wallet private key (for sending rewards)
TREASURY_PRIVATE_KEY=0x...your_treasury_private_key_here

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**⚠️ IMPORTANT:**

- Use TEST wallets only!
- Never commit private keys
- Get test MATIC from https://faucet.polygon.technology/

### Step 2: Install & Deploy (3 min)

```bash
# Install contract dependencies
cd contracts
yarn install

# Compile contracts
yarn compile

# Deploy to Polygon Amoy Testnet
yarn deploy:amoy

# Mint test tokens to your wallet
yarn mint

# Go back to root
cd ..
```

### Step 3: Run the App

```bash
# Start Next.js
yarn dev
```

Visit: **http://localhost:3000/web3-demo**

## 🎮 Test the Prototype

1. **Connect Wallet**

   - Click "Connect Wallet"
   - Choose MetaMask or WalletConnect
   - Approve connection

2. **Switch Network**

   - Switch to "Polygon Amoy Testnet"
   - Network ID: 80002

3. **Test Payments**
   - Click "Pay 100 ARD" → Balance decreases
   - Click "Claim 200 ARD" → Balance increases

## 🆘 Troubleshooting

**"Insufficient balance"**
→ Run `cd contracts && yarn mint`

**"Wrong network"**
→ Switch MetaMask to Polygon Amoy (Chain ID: 80002)

**"No test MATIC"**
→ Get free MATIC: https://faucet.polygon.technology/

**"Contract not deployed"**
→ Run `cd contracts && yarn deploy:amoy`

## 📚 Full Documentation

- **WEB3_SETUP.md** - Complete setup guide
- **WEB3_DELIVERY.md** - What was built
- **ENV_TEMPLATE.md** - Environment variables

## 🎯 What You Get

✅ ERC20 ARD Token
✅ Payment smart contract
✅ Web3 wallet connection
✅ Pay 100 ARD button
✅ Claim 200 ARD button
✅ Backend reward API
✅ Mobile-friendly UI

**Everything works out of the box!** 🚀
