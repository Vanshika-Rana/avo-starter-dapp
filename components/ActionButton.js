"use client";
import { useState, useEffect } from "react";
import { MdOutlineArrowOutward, MdCallReceived } from "react-icons/md";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { connectEOA } from "../utils/web3";
import { ethers } from "ethers";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";
import avocadoV1ABI from "../constants/avocado-v1-abi.json";
import Modal from "./Modal";

const ActionButton = ({ icon, label, onClick }) => (
	<button
		onClick={onClick}
		className='flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white transition-transform duration-500 transform rounded-lg bg-emerald-500 hover:scale-95'>
		{icon}
		<span>{label}</span>
	</button>
);

const types = {
	Cast: [
		{ name: "params", type: "CastParams" },
		{ name: "forwardParams", type: "CastForwardParams" },
	],
	CastParams: [
		{ name: "actions", type: "Action[]" },
		{ name: "id", type: "uint256" },
		{ name: "avoNonce", type: "int256" },
		{ name: "salt", type: "bytes32" },
		{ name: "source", type: "address" },
		{ name: "metadata", type: "bytes" },
	],
	Action: [
		{ name: "target", type: "address" },
		{ name: "data", type: "bytes" },
		{ name: "value", type: "uint256" },
		{ name: "operation", type: "uint256" },
	],
	CastForwardParams: [
		{ name: "gas", type: "uint256" },
		{ name: "gasPrice", type: "uint256" },
		{ name: "validAfter", type: "uint256" },
		{ name: "validUntil", type: "uint256" },
		{ name: "value", type: "uint256" },
	],
};
// Send Functionality
const SendButton = () => {
	const [connectedAddress, setConnectedAddress] = useState("");
	const [receiverAddress, setReceiverAddress] = useState("");
	const [usdcAmount, setUsdcAmount] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState("");
	const { walletProvider } = useWeb3ModalProvider();

	useEffect(() => {
		connectEOA(walletProvider, setConnectedAddress);
	}, [walletProvider]);

	const handleSend = async () => {
		setLoading(true);

		try {
			const polygonProvider = new ethers.providers.JsonRpcProvider(
				"https://polygon-rpc.com"
			);
			const chainId = (await polygonProvider.getNetwork()).chainId;
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			await window.ethereum.request({ method: "eth_requestAccounts" });

			const forwarder = new ethers.Contract(
				"0x46978CD477A496028A18c02F07ab7F35EDBa5A54",
				avoForwarderV1ABI,
				polygonProvider
			);

			const avocadoAddress = await forwarder.computeAvocado(
				connectedAddress,
				"0"
			);
			const avocado = new ethers.Contract(
				avocadoAddress,
				avocadoV1ABI,
				polygonProvider
			);
			const isDeployed =
				(await polygonProvider.getCode(avocadoAddress)) !== "0x";

			const [domainName, domainVersion] = isDeployed
				? await Promise.all([
						avocado.DOMAIN_SEPARATOR_NAME(),
						avocado.DOMAIN_SEPARATOR_VERSION(),
				  ])
				: await Promise.all([
						forwarder.avocadoVersionName(connectedAddress, "0"),
						forwarder.avocadoVersion(connectedAddress, "0"),
				  ]);

			const nonce = isDeployed ? await avocado.avoNonce() : "0";
			const requiredSigners = isDeployed
				? await avocado.requiredSigners()
				: 1;
			if (requiredSigners > 1)
				throw new Error(
					"This example is for single signer Avocado only"
				);

			const usdcAmountParsed = ethers.utils.parseUnits(usdcAmount, 6);
			const usdcInterface = new ethers.utils.Interface([
				"function transfer(address to, uint amount) returns (bool)",
			]);
			const calldata = usdcInterface.encodeFunctionData("transfer", [
				receiverAddress,
				usdcAmountParsed,
			]);

			const txPayload = {
				params: {
					actions: [
						{
							target: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
							data: calldata,
							value: "0",
							operation: "0",
						},
					],
					id: "0",
					avoNonce: nonce.toString(),
					salt: ethers.utils.defaultAbiCoder.encode(
						["uint256"],
						[Date.now()]
					),
					source: "0x000000000000000000000000000000000000Cad0",
					metadata: "0x",
				},
				forwardParams: {
					gas: "0",
					gasPrice: "0",
					validAfter: "0",
					validUntil: "0",
					value: "0",
				},
			};

			const avocadoProvider = new ethers.providers.JsonRpcProvider(
				"https://rpc.avocado.instadapp.io"
			);
			const estimate = await avocadoProvider.send(
				"txn_multisigEstimateFeeWithoutSignature",
				[
					{
						message: txPayload,
						owner: connectedAddress,
						safe: avocadoAddress,
						index: "0",
						targetChainId: chainId,
					},
				]
			);

			const domain = {
				name: domainName,
				version: domainVersion,
				chainId: "634",
				verifyingContract: avocadoAddress,
				salt: ethers.utils.solidityKeccak256(["uint256"], [chainId]),
			};

			const avoSigner = provider.getSigner();
			if ((await provider.getNetwork()).chainId !== 634)
				throw new Error("Not connected to Avocado network");
			if ((await avoSigner.getAddress()) !== connectedAddress)
				throw new Error("Not connected with expected owner address");

			const signature = await avoSigner._signTypedData(
				domain,
				types,
				txPayload
			);

			const txHash = await avocadoProvider.send("txn_broadcast", [
				{
					signatures: [{ signature, signer: connectedAddress }],
					message: txPayload,
					owner: connectedAddress,
					safe: avocadoAddress,
					index: "0",
					targetChainId: chainId,
				},
			]);

			setTxHash(txHash);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	const openModal = () => setShowModal(true);
	const closeModal = () => {
		setShowModal(false);
		setReceiverAddress(""); // Clear receiver address input
		setUsdcAmount(""); // Clear USDC amount input
		setTxHash(""); // Clear transaction hash
		setLoading(false); // Reset loading state
	};

	return (
		<>
			<ActionButton
				icon={<MdOutlineArrowOutward />}
				label='Send USDC on Polygon'
				onClick={openModal}
			/>
			{showModal && (
				<Modal onClose={closeModal}>
					<div className='p-6'>
						<h2 className='text-lg font-semibold mb-4'>
							Send USDC
						</h2>
						<div className='mb-4'>
							<label
								htmlFor='receiverAddress'
								className='block text-sm font-bold text-gray-700'>
								Receiver Address:
							</label>
							<input
								type='text'
								id='receiverAddress'
								value={receiverAddress}
								onChange={(e) =>
									setReceiverAddress(e.target.value)
								}
								className='mt-1 block w-full rounded-md border border-gray-200 focus:border-emerald-500 focus:outline-none'
							/>
						</div>
						<div className='mb-4'>
							<label
								htmlFor='usdcAmount'
								className='block text-sm font-bold text-gray-700'>
								USDC Amount:
							</label>
							<input
								type='text'
								id='usdcAmount'
								value={usdcAmount}
								onChange={(e) => setUsdcAmount(e.target.value)}
								className='mt-1 block w-full rounded-md border border-gray-200 focus:border-emerald-500 focus:outline-none'
							/>
						</div>
						<button
							onClick={handleSend}
							disabled={loading}
							className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md transition-transform duration-500 transform hover:scale-95 focus:outline-none'>
							{loading ? "Loading..." : "Send"}
						</button>
						{txHash && (
							<div className='mt-4'>
								<p>
									<span className='font-bold'>
										Transaction in Queue!
									</span>{" "}
									<br />
									<a
										href={`https://avoscan.co/tx/${txHash}`}
										target='_blank'
										rel='noopener noreferrer'
										className='text-blue-500 hover:underline '>
										Check Status
									</a>
								</p>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
};

const ReceiveButton = ({ onClick }) => (
	<ActionButton icon={<MdCallReceived />} label='Receive' onClick={onClick} />
);

export { SendButton, ReceiveButton };
