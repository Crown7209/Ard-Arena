import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { CONTRACTS, GAME_PAYMENTS_ABI } from "@/utils/contracts";

// Server-side wallet (treasury)
const PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("⚠️ TREASURY_PRIVATE_KEY not set in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    if (!PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: Treasury key not set" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { playerAddress, amount } = body;

    if (!playerAddress || !amount) {
      return NextResponse.json(
        { error: "Missing playerAddress or amount" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      return NextResponse.json(
        { error: "Invalid player address format" },
        { status: 400 }
      );
    }

    // Create account from private key
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(),
    });

    // Create public client for reading
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    });

    console.log("🎁 Sending reward...");
    console.log("  Player:", playerAddress);
    console.log("  Amount:", amount, "ARD");
    console.log("  From:", account.address);

    // Send reward transaction
    const hash = await walletClient.writeContract({
      address: CONTRACTS.GamePayments as `0x${string}`,
      abi: GAME_PAYMENTS_ABI,
      functionName: "sendReward",
      args: [playerAddress as `0x${string}`, parseEther(amount)],
    });

    console.log("⏳ Transaction sent:", hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log("✅ Reward sent successfully!");
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      message: `Successfully sent ${amount} ARD to ${playerAddress}`,
    });
  } catch (error: any) {
    console.error("❌ Error sending reward:", error);

    // Parse error message
    let errorMessage = "Failed to send reward";
    if (error.message) {
      if (error.message.includes("insufficient")) {
        errorMessage = "Insufficient treasury balance";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
