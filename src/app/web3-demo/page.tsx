"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import Web3PaymentDemo from "@/components/web3/Web3PaymentDemo";

export default function Web3DemoPage() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400">
              ARD Arena Web3 Demo
            </h1>
            <p className="text-sm text-white/60">
              Payment Prototype with ARD Tokens
            </p>
          </div>

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-lg transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">{connector.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400">
              Web3 Payment Prototype
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Test ARD token payments and rewards on Polygon Amoy Testnet
            </p>
          </div>

          {/* Demo Component */}
          <Web3PaymentDemo />

          {/* Resources */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://faucet.polygon.technology/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/50 hover:bg-slate-800/70 border border-white/10 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">Get Test MATIC</h3>
                <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-white/60">
                Get free test MATIC for gas fees on Polygon Amoy
              </p>
            </a>

            <a
              href="https://amoy.polygonscan.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/50 hover:bg-slate-800/70 border border-white/10 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">Block Explorer</h3>
                <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-white/60">
                View transactions on Polygon Amoy Testnet
              </p>
            </a>

            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">Contract Info</h3>
              <p className="text-sm text-white/60">
                ARD Token and GamePayments contracts deployed on Polygon Amoy
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
