"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_PROJECT_ID is not defined. Generate it from https://cloud.walletconnect.com and add it to your .env.local file"
  );
}


const avocado = {
  chainId: 634,
  name: "Avocado RPC",
  currency: "USDC",
  explorerUrl: "https://avoscan.co/",
  rpcUrl: "https://rpc.avocado.instadapp.io/",
};

/*
 You can add more chains here, for ex:
 const polygon = {
  chainId: 137,
  name: "Polygon",
  currency: "Matic",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com/",
};
*/

// 2. Set chains (add more chains as needed)
const chains = [avocado];

// 3. Create a metadata object
const metadata = {
  name: "Avo Starter Dapp",
  description: "A starter dapp for Avocado",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains,
  projectId,
  themeVariables: {
    "--w3m-color-mix": "#0D5A37",
    "--w3m-color-mix-strength": 5,
  },
});

export function Web3Modal({ children }) {
  return children;
}
