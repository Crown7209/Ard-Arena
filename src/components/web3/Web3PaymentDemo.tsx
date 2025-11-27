"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  Wallet,
  Coins,
  Gift,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { CONTRACTS, ARD_TOKEN_ABI, GAME_PAYMENTS_ABI } from "@/utils/contracts";

export default function Web3PaymentDemo() {
  const { address, isConnected, chain } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "approving" | "paying" | "success" | "error"
  >("idle");
  const [claimStatus, setClaimStatus] = useState<
    "idle" | "claiming" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Demo mode - for testing without deployed contracts
  const [demoMode, setDemoMode] = useState(true);
  const [mockBalance, setMockBalance] = useState(1000); // Start with 1000 ARD in demo

  // Get ARD token balance
  const { data: ardBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.ARDToken as `0x${string}`,
    abi: ARD_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.ARDToken as `0x${string}`,
    abi: ARD_TOKEN_ABI,
    functionName: "allowance",
    args: address
      ? [address, CONTRACTS.GamePayments as `0x${string}`]
      : undefined,
  });

  // Contract write hooks
  const { writeContract: approveWrite, data: approveHash } = useWriteContract();
  const { writeContract: payWrite, data: payHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isPaying, isSuccess: isPaySuccess } =
    useWaitForTransactionReceipt({
      hash: payHash,
    });

  // Handle approve success
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      // After approval, proceed to pay
      handlePayAfterApproval();
    }
  }, [isApproveSuccess]);

  // Handle pay success
  useEffect(() => {
    if (isPaySuccess) {
      setPaymentStatus("success");
      refetchBalance();
      setTimeout(() => setPaymentStatus("idle"), 3000);
    }
  }, [isPaySuccess]);

  const handlePayAfterApproval = () => {
    setPaymentStatus("paying");
    payWrite({
      address: CONTRACTS.GamePayments as `0x${string}`,
      abi: GAME_PAYMENTS_ABI,
      functionName: "payTokens",
      args: [parseEther("100")],
    });
  };

  const handlePay100ARD = async () => {
    if (!address) return;

    // Demo mode - simulate payment
    if (demoMode) {
      try {
        setErrorMessage("");
        setPaymentStatus("paying");

        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update mock balance
        setMockBalance((prev) => prev - 100);
        setPaymentStatus("success");
        setTimeout(() => setPaymentStatus("idle"), 3000);
      } catch (error: any) {
        setErrorMessage("Demo payment failed");
        setPaymentStatus("error");
        setTimeout(() => setPaymentStatus("idle"), 3000);
      }
      return;
    }

    try {
      setErrorMessage("");
      const payAmount = parseEther("100");

      // Check if we need approval
      if (!allowance || allowance < payAmount) {
        setPaymentStatus("approving");
        approveWrite({
          address: CONTRACTS.ARDToken as `0x${string}`,
          abi: ARD_TOKEN_ABI,
          functionName: "approve",
          args: [
            CONTRACTS.GamePayments as `0x${string}`,
            parseEther("1000000"),
          ], // Approve 1M for future txs
        });
      } else {
        // Already approved, just pay
        handlePayAfterApproval();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "Payment failed");
      setPaymentStatus("error");
      setTimeout(() => setPaymentStatus("idle"), 3000);
    }
  };

  const handleClaimReward = async () => {
    if (!address) return;

    // Demo mode - simulate reward claim
    if (demoMode) {
      try {
        setErrorMessage("");
        setClaimStatus("claiming");

        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update mock balance - ADD 200 ARD
        setMockBalance((prev) => prev + 200);
        setClaimStatus("success");
        setTimeout(() => setClaimStatus("idle"), 3000);
      } catch (error: any) {
        setErrorMessage("Demo claim failed");
        setClaimStatus("error");
        setTimeout(() => setClaimStatus("idle"), 3000);
      }
      return;
    }

    try {
      setErrorMessage("");
      setClaimStatus("claiming");

      // Call backend API to trigger reward
      const response = await fetch("/api/send-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: address,
          amount: "200",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim reward");
      }

      setClaimStatus("success");
      refetchBalance();
      setTimeout(() => setClaimStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Claim error:", error);
      setErrorMessage(error.message || "Claim failed");
      setClaimStatus("error");
      setTimeout(() => setClaimStatus("idle"), 3000);
    }
  };

  const formattedBalance = demoMode
    ? mockBalance.toString()
    : ardBalance
    ? formatEther(ardBalance)
    : "0";

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <Wallet className="w-16 h-16 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
        <p className="text-white/60">
          Please connect your wallet to use the payment demo
        </p>
      </div>
    );
  }

  // Check if on correct network (only matters in real mode)
  const isCorrectNetwork = demoMode || chain?.id === 80002; // Polygon Amoy

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Wallet Info Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Wallet Connected</h3>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              demoMode
                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300"
                : "bg-green-500/20 border border-green-500/50 text-green-300"
            }`}
          >
            {demoMode ? "🎮 Demo Mode" : "⛓️ Real Mode"}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Address</span>
            <span className="text-white font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Network</span>
            <span
              className={`text-sm font-semibold ${
                isCorrectNetwork ? "text-green-400" : "text-orange-400"
              }`}
            >
              {demoMode ? "Demo Network" : chain?.name || "Unknown"}
            </span>
          </div>

          {!isCorrectNetwork && !demoMode && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-200">
                Please switch to <strong>Polygon Amoy Testnet</strong> to use
                this demo
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-linear-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-r from-cyan-500 to-purple-500 p-3 rounded-xl">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-sm">ARD Balance</p>
              <p className="text-3xl font-black text-white">
                {parseFloat(formattedBalance).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchBalance()}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm text-red-200">{errorMessage}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pay 100 ARD Button */}
        <button
          onClick={handlePay100ARD}
          disabled={!isCorrectNetwork || paymentStatus !== "idle"}
          className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200 flex flex-col items-center gap-3"
        >
          {paymentStatus === "approving" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Approving...</span>
            </>
          )}
          {paymentStatus === "paying" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Paying...</span>
            </>
          )}
          {paymentStatus === "success" && (
            <>
              <CheckCircle2 className="w-8 h-8" />
              <span>Payment Sent!</span>
            </>
          )}
          {paymentStatus === "error" && (
            <>
              <XCircle className="w-8 h-8" />
              <span>Payment Failed</span>
            </>
          )}
          {paymentStatus === "idle" && (
            <>
              <Coins className="w-8 h-8" />
              <span>Pay 100 ARD</span>
              <span className="text-xs text-white/70">Send to Treasury</span>
            </>
          )}
        </button>

        {/* Claim Reward Button */}
        <button
          onClick={handleClaimReward}
          disabled={!isCorrectNetwork || claimStatus !== "idle"}
          className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200 flex flex-col items-center gap-3"
        >
          {claimStatus === "claiming" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Claiming...</span>
            </>
          )}
          {claimStatus === "success" && (
            <>
              <CheckCircle2 className="w-8 h-8" />
              <span>Reward Claimed!</span>
            </>
          )}
          {claimStatus === "error" && (
            <>
              <XCircle className="w-8 h-8" />
              <span>Claim Failed</span>
            </>
          )}
          {claimStatus === "idle" && (
            <>
              <Gift className="w-8 h-8" />
              <span>Claim 200 ARD</span>
              <span className="text-xs text-white/70">Receive Reward</span>
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4 text-sm text-white/60">
        <p className="font-semibold text-white mb-2">
          {demoMode ? "🎮 Demo Mode - Testing" : "⛓️ Real Blockchain Mode"}
        </p>
        {demoMode ? (
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Pay 100 ARD:</strong> Simulates payment (balance -100)
            </li>
            <li>
              <strong>Claim 200 ARD:</strong> Simulates reward (balance +200)
            </li>
            <li className="text-yellow-300">
              ⚡ No blockchain needed - instant testing!
            </li>
            <li>Click "⛓️ Real Mode" to use actual smart contracts</li>
          </ul>
        ) : (
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Pay 100 ARD:</strong> Transfers 100 ARD from your wallet
              to the treasury
            </li>
            <li>
              <strong>Claim 200 ARD:</strong> Backend sends you 200 ARD as a
              reward
            </li>
            <li>All transactions are on Polygon Amoy Testnet</li>
            <li>Make sure you have test MATIC for gas fees</li>
          </ul>
        )}
      </div>
    </div>
  );
}
