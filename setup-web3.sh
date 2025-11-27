#!/bin/bash

# ARD Arena Web3 Setup Script
# This script helps you set up and deploy the Web3 payment prototype

set -e

echo "🚀 ARD Arena Web3 Payment Prototype Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Please create a .env file with the following variables:"
    echo ""
    cat ENV_TEMPLATE.md
    echo ""
    echo -e "${RED}Setup cannot continue without .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Check if contracts dependencies are installed
if [ ! -d "contracts/node_modules" ]; then
    echo ""
    echo "📦 Installing contract dependencies..."
    cd contracts
    yarn install
    cd ..
    echo -e "${GREEN}✓${NC} Contract dependencies installed"
else
    echo -e "${GREEN}✓${NC} Contract dependencies already installed"
fi

# Compile contracts
echo ""
echo "🔨 Compiling smart contracts..."
cd contracts
yarn compile
cd ..
echo -e "${GREEN}✓${NC} Contracts compiled"

# Ask if user wants to deploy
echo ""
read -p "Do you want to deploy contracts to Polygon Amoy Testnet? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying contracts to Polygon Amoy..."
    cd contracts
    yarn deploy:amoy
    cd ..
    echo -e "${GREEN}✓${NC} Contracts deployed!"
    echo ""
    echo "📝 Contract addresses saved to src/utils/contracts.ts"
fi

# Ask if user wants to mint tokens
echo ""
read -p "Do you want to mint test ARD tokens? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🪙 Minting ARD tokens..."
    cd contracts
    yarn mint
    cd ..
    echo -e "${GREEN}✓${NC} Tokens minted!"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✨ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Run: ${YELLOW}yarn dev${NC}"
echo "2. Visit: ${YELLOW}http://localhost:3000/web3-demo${NC}"
echo "3. Connect your wallet"
echo "4. Test the payment buttons!"
echo ""
echo "📚 For more info, see WEB3_SETUP.md"
echo ""
