"use client";
import { useRef, useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { IoCopyOutline } from "react-icons/io5";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";
import Image from "next/image";
import logolight from "../public/images/logolight.png"
import logo from "../public/images/logo.png"
import Footer from "@/components/Footer";

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
  const web3ModalRef = useRef();

  // Initialize Web3Modal on component mount
  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "Avocado RPC",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }, []);

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const provider = await web3ModalRef.current.connect();
      if (provider) {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        setConnectedAddress(address);
        await createAvoWallet(address);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
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
     
      const avocadoMultisigAddress = await forwarder.computeAvocado(address, multisigIndex);
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
      const polygonProvider = new ethers.providers.JsonRpcProvider(chains.polygon.rpcUrl);
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
      const avocadoProvider = new ethers.providers.JsonRpcProvider(chains.avocado.rpcUrl);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
    <section className="flex flex-col h-[80vh] items-center justify-center px-4 sm:px-6 lg:px-8">
      <Image src={logolight} width={200} height={500} />
      <span className="text-5xl sm:text-7xl font-bold mb-8 mt-2 text-center">Starter Dapp</span>
      {!connectedAddress && (
        <button
          onClick={connectWallet}
          className="bg-emerald-950 text-white font-semibold px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-transform duration-500 transform hover:scale-95"
        >
          <Image src={logo} width={20} height={20} alt="Logo" />
          <span>Connect your wallet</span>
        </button>
      )}
      {connectedAddress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full">
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Connected EOA Address</h2>
            <div className="flex items-center">
              <p className="mr-2" title={connectedAddress}>
                {connectedAddress.slice(0, 6) +
                  "..." +
                  connectedAddress.slice(-4)}
              </p>
              <button
                onClick={() => copyToClipboard(connectedAddress)}
                className="text-green-600 px-4 py-1 rounded-full hover:text-green-700 hover:scale-95"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Avocado Address</h2>
            <div className="flex items-center">
              <p className="mr-2" title={avocadoAddress}>
                {avocadoAddress.slice(0, 6) +
                  "..." +
                  avocadoAddress.slice(-4)}
              </p>
              <button
                onClick={() => copyToClipboard(avocadoAddress)}
                className="text-green-600 px-4 py-1 rounded-full hover:text-green-700 hover:scale-95"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Avocado Multisig Address #1</h2>
            <div className="flex items-center">
              <p className="mr-2" title={avocadoMultisigAddress}>
                {avocadoMultisigAddress.slice(0, 6) +
                  "..." +
                  avocadoMultisigAddress.slice(-4)}
              </p>
              <button
                onClick={() => copyToClipboard(avocadoMultisigAddress)}
                className="text-green-600 px-4 py-1 rounded-full hover:text-green-700 hover:scale-95"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Avocado GAS TANK Balance</h2>
            <p>{avocadoBalance} USDC</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Polygon Matic Balance</h2>
            <p>{polygonBalance} MATIC</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <h2 className="font-bold mb-4">Multisig #1 Gas Tank Balance</h2>
            <p>{avocadoMultisigBalance} USDC</p>
          </div>
        </div>
      )}
</section>
<Footer/>
    </main>
  );
}
