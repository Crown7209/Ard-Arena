import { useConnect } from "wagmi";
import { Wallet } from "lucide-react";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="inline-flex items-center justify-center h-10 md:h-16 px-4 md:px-6 gap-2 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
        >
          <Wallet className="h-4 w-4 md:h-5 md:w-5 text-[#64ccc5]" />
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
            {connector.name}
          </span>
        </button>
      ))}
    </div>
  );
}
