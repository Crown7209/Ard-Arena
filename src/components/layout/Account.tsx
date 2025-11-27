import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { WalletOptions } from "./WalletOptions";
import { Wallet, LogOut } from "lucide-react";

export function Account() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  if (!isConnected) {
    return <WalletOptions />;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Wallet Info Badge */}
      <div className="flex h-10 md:h-16 items-center gap-2 md:gap-4 rounded-xl md:rounded-2xl border border-white/30 bg-black/60 px-2.5 md:px-6 backdrop-blur">
        {ensAvatar ? (
          <img
            alt="ENS Avatar"
            src={ensAvatar}
            className="h-4 w-4 md:h-6 md:w-6 rounded-full"
          />
        ) : (
          <Wallet className="h-4 w-4 md:h-6 md:w-6 text-[#64ccc5]" />
        )}

        <div className="flex flex-col leading-none">
          <p className="text-[9px] md:text-xs uppercase tracking-[0.4em] text-white/60">
            Wallet
          </p>
          <p className="text-xs md:text-sm font-bold text-white font-mono">
            {ensName
              ? ensName
              : address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : ""}
          </p>
        </div>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={() => disconnect()}
        className="inline-flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 transition-all duration-200"
        aria-label="Disconnect Wallet"
      >
        <LogOut className="h-4 w-4 md:h-6 md:w-6" />
      </button>
    </div>
  );
}
