"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { IoCopyOutline } from "react-icons/io5";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";
import Image from "next/image";
import logolight from "../public/images/logolight.png";
import logo from "../public/images/logo.png";
import Footer from "@/components/Footer";
import { useWeb3Modal, useWeb3ModalProvider } from "@web3modal/ethers5/react";

// Define chain configurations
const chains = {
  avocado: {
    rpcUrl: "https://rpc.avocado.instadapp.io/",
    forwarderAddress: "0x46978CD477A496028A18c02F07ab7F35EDBa5A54",
  },
  polygon: {
    rpcUrl: "https://polygon-rpc.com/",
    forwarderAddress: "0x46978CD477A496028A18c02F07ab7F35EDBa5A54",
  },
  // Add more chains here as needed
};

// Main component
export default function Home() {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [avocadoAddress, setAvocadoAddress] = useState("");
  const [avocadoMultisigAddress, setAvocadoMultisigAddress] = useState("");
  const [avocadoBalance, setAvocadoBalance] = useState("");
  const [polygonBalance, setPolygonBalance] = useState("");
  const [avocadoMultisigBalance, setAvocadoMultisigBalance] = useState("");

  const { open } = useWeb3Modal();

  const { walletProvider } = useWeb3ModalProvider();

  // Function to generate Avocado wallet
  const generateWallet = async () => {
    if (walletProvider) {
      const web3Provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      setConnectedAddress(address);
      await createAvoWallet(address);
    }
  };

  // Function to create Avocado wallet
  const createAvoWallet = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        chains.polygon.rpcUrl
      );
      const forwarder = new ethers.Contract(
        chains.polygon.forwarderAddress,
        avoForwarderV1ABI,
        provider
      );

      const index = 0;
      const avocadoAddress = await forwarder.computeAvocado(address, index);
      setAvocadoAddress(avocadoAddress);

      /**
      The index for multisig starts with 1, 
      a user can have more than one multisig wallet. 
      Hence, the index will increase accordingly
       **/
      const multisigIndex = 1;

      const avocadoMultisigAddress = await forwarder.computeAvocado(
        address,
        multisigIndex
      );
      setAvocadoMultisigAddress(avocadoMultisigAddress);

      const avocadoBalance = await fetchAvocadoBalance(avocadoAddress);
      setAvocadoBalance(avocadoBalance);

      const polygonBalance = await fetchPolygonBalance(avocadoAddress);
      setPolygonBalance(polygonBalance);

      const multisigBalance = await fetchAvocadoBalance(avocadoMultisigAddress);
      setAvocadoMultisigBalance(multisigBalance);
    } catch (err) {
      console.error("Error creating Avocado wallet:", err);
    }
  };

  // Function to fetch Polygon balance
  const fetchPolygonBalance = async (address) => {
    try {
      const polygonProvider = new ethers.providers.JsonRpcProvider(
        chains.polygon.rpcUrl
      );
      const balance = await polygonProvider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error("Error fetching Polygon balance:", err);
      return "";
    }
  };

  // Function to fetch Avocado balance
  const fetchAvocadoBalance = async (address) => {
    try {
      const avocadoProvider = new ethers.providers.JsonRpcProvider(
        chains.avocado.rpcUrl
      );
      const balance = await avocadoProvider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error("Error fetching Avocado balance:", err);
      return "";
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // useEffect to generate Avo Wallet and set connected address
  useEffect(() => {
    generateWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletProvider]);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
      <section className="flex flex-col h-[80vh] items-center justify-center px-4 sm:px-6 lg:px-8">
        <Image src={logolight} width={200} height={500} />
        <span className="mt-2 mb-8 text-5xl font-bold text-center sm:text-7xl">
          Starter Dapp
        </span>
        {!connectedAddress && (
          <button
            onClick={() => open()}
            className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white transition-transform duration-500 transform rounded-lg bg-emerald-950 hover:scale-95"
          >
            <Image src={logo} width={20} height={20} alt="Logo" />
            <span>Connect your wallet</span>
          </button>
        )}
        {connectedAddress && (
          <div className="grid w-full grid-cols-1 gap-4 mt-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Connected EOA Address</h2>
              <div className="flex items-center">
                <p className="mr-2" title={connectedAddress}>
                  {connectedAddress.slice(0, 6) +
                    "..." +
                    connectedAddress.slice(-4)}
                </p>
                <button
                  onClick={() => copyToClipboard(connectedAddress)}
                  className="px-4 py-1 text-green-600 rounded-full hover:text-green-700 hover:scale-95"
                >
                  <IoCopyOutline />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Avocado Address</h2>
              <div className="flex items-center">
                <p className="mr-2" title={avocadoAddress}>
                  {avocadoAddress.slice(0, 6) +
                    "..." +
                    avocadoAddress.slice(-4)}
                </p>
                <button
                  onClick={() => copyToClipboard(avocadoAddress)}
                  className="px-4 py-1 text-green-600 rounded-full hover:text-green-700 hover:scale-95"
                >
                  <IoCopyOutline />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Avocado Multisig Address #1</h2>
              <div className="flex items-center">
                <p className="mr-2" title={avocadoMultisigAddress}>
                  {avocadoMultisigAddress.slice(0, 6) +
                    "..." +
                    avocadoMultisigAddress.slice(-4)}
                </p>
                <button
                  onClick={() => copyToClipboard(avocadoMultisigAddress)}
                  className="px-4 py-1 text-green-600 rounded-full hover:text-green-700 hover:scale-95"
                >
                  <IoCopyOutline />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Avocado GAS TANK Balance</h2>
              <p>{avocadoBalance} USDC</p>
            </div>
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Polygon Matic Balance</h2>
              <p>{polygonBalance} MATIC</p>
            </div>
            <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
              <h2 className="mb-4 font-bold">Multisig #1 Gas Tank Balance</h2>
              <p>{avocadoMultisigBalance} USDC</p>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto mt-16 mb-8 text-center">
          <p className="text-lg text-gray-700">
            Welcome to the <b>Avocado Starter Dapp!</b> This dapp serves as a
            starting point for developers interested in integrating Avocado
            Wallet into their projects.
          </p>
          <p className="mt-4 text-lg text-gray-700">
            With this starter dapp, you can quickly connect to Avocado Wallet
            and explore its features. Clone this{" "}
            <a
              href="https://github.com/Vanshika-Rana/avo-starter-dapp"
              target="_blank"
              className="font-bold underline text-emerald-500"
            >
              {" "}
              repository
            </a>{" "}
            to kickstart your development journey.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
