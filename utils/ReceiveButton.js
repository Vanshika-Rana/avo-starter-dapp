"use client";
import { useState, useEffect } from "react";
import { MdCallReceived } from "react-icons/md";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { connectEOA } from "./web3";
import { ethers } from "ethers";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";
import Modal from "../components/Modal";

const ReceiveButton = () => {
	const [connectedAddress, setConnectedAddress] = useState("");
	const [usdcAmount, setUsdcAmount] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState("");
	const { walletProvider } = useWeb3ModalProvider();

	useEffect(() => {
		connectEOA(walletProvider, setConnectedAddress);
	}, [walletProvider]);

	const switchToPolygonMainnet = async () => {
		try {
			await walletProvider.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x89" }], // Polygon Mainnet chain ID
			});
		} catch (error) {
			if (error.code === 4902) {
				try {
					await walletProvider.request({
						method: "wallet_addEthereumChain",
						params: [
							{
								chainId: "0x89",
								chainName: "Polygon Mainnet",
								rpcUrls: ["https://polygon-rpc.com"],
								nativeCurrency: {
									name: "MATIC",
									symbol: "MATIC",
									decimals: 18,
								},
								blockExplorerUrls: ["https://polygonscan.com/"],
							},
						],
					});
				} catch (addError) {
					console.error("Failed to add Polygon Mainnet", addError);
				}
			} else {
				console.error("Failed to switch to Polygon Mainnet", error);
			}
		}
	};

	const handleReceive = async () => {
		setLoading(true);

		try {
			const polygonProvider = new ethers.providers.JsonRpcProvider(
				"https://polygon-rpc.com"
			);
			const provider = new ethers.providers.Web3Provider(walletProvider);
			await walletProvider.request({ method: "eth_requestAccounts" });

			const forwarder = new ethers.Contract(
				"0x46978CD477A496028A18c02F07ab7F35EDBa5A54",
				avoForwarderV1ABI,
				polygonProvider
			);

			const avocadoAddress = await forwarder.computeAvocado(
				connectedAddress,
				"0"
			);

			const usdcAmountParsed = ethers.utils.parseUnits(usdcAmount, 6);

			const usdcInterface = new ethers.utils.Interface([
				"function transfer(address to, uint amount) returns (bool)",
			]);
			const calldata = usdcInterface.encodeFunctionData("transfer", [
				avocadoAddress,
				usdcAmountParsed,
			]);

			const signer = provider.getSigner();
			const tx = await signer.sendTransaction({
				to: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", // USDC contract address
				data: calldata,
			});

			setTxHash(tx.hash);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	const openModal = () => setShowModal(true);
	const closeModal = () => {
		setShowModal(false);
		setUsdcAmount(""); // Clear USDC amount input
		setTxHash(""); // Clear transaction hash
		setLoading(false); // Reset loading state
	};

	return (
		<>
			<button
				onClick={openModal}
				className='flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white transition-transform duration-500 transform rounded-lg bg-emerald-500 hover:scale-95'>
				<MdCallReceived />
				<span>Deposit USDC</span>
			</button>
			{showModal && (
				<Modal onClose={closeModal}>
					<div className='p-6'>
						<h2 className='text-lg font-semibold mb-4'>
							Deposit USDC
						</h2>
						<button
							onClick={switchToPolygonMainnet}
							className='w-full text-purple-500 font-semibold transition-transform duration-500 transform hover:scale-95 focus:outline-none mb-4'>
							Switch to Polygon
						</button>
						<div className='mb-4'>
							<label
								htmlFor='usdcAmountDeposit'
								className='block text-sm font-bold text-gray-700'>
								USDC Amount:
							</label>
							<input
								type='text'
								id='usdcAmountDeposit'
								value={usdcAmount}
								onChange={(e) => setUsdcAmount(e.target.value)}
								className='mt-1 block w-full rounded-md border border-gray-200 focus:border-emerald-500 focus:outline-none'
							/>
						</div>
						<button
							onClick={handleReceive}
							disabled={loading}
							className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md transition-transform duration-500 transform hover:scale-95 focus:outline-none'>
							{loading ? "Loading..." : "Deposit"}
						</button>

						{txHash && (
							<div className='mt-4'>
								<p>
									<span className='font-bold'>
										Transaction Submitted!
									</span>{" "}
									<br />
									<a
										href={`https://polygonscan.com/tx/${txHash}`}
										target='_blank'
										rel='noopener noreferrer'
										className='text-blue-500 hover:underline '>
										Check Status
									</a>
								</p>
							</div>
						)}
						<div className='mt-4'>
							<p className='text-orange-600 font-semibold text-sm text-center'>
								Make sure to switch the networks for the
								transaction to execute successfully!
							</p>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};
export default ReceiveButton;
