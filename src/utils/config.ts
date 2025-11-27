import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { mainnet, sepolia, polygon, polygonAmoy } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonAmoy],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
});
