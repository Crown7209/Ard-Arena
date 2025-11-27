"use client";

import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { WalletOptions } from "./WalletOptions";

export function Account() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  if (!isConnected) {
    return <WalletOptions />;
  }

  return (
    <div className="flex items-center gap-4">
      {ensAvatar && (
        <img
          alt="ENS Avatar"
          src={ensAvatar}
          className="w-10 h-10 rounded-full"
        />
      )}
      <div className="flex flex-col items-end">
        {address && (
          <div className="text-sm font-medium">
            {ensName
              ? `${ensName} (${address.slice(0, 6)}...)`
              : address.slice(0, 6) + "..." + address.slice(-4)}
          </div>
        )}
        <button
          onClick={() => disconnect()}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
