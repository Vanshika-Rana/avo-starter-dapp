"use client";
import { useState, useEffect } from "react";
import { MdOutlineArrowOutward, MdCallReceived } from "react-icons/md";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { connectEOA } from "../utils/web3";
import { ethers } from "ethers";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";
import avocadoV1ABI from "../constants/avocado-v1-abi.json";
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

export const SendButton = () => {
	const [connectedAddress, setConnectedAddress] = useState("");
	const [avocadoAddress, setAvocadoAddress] = useState("");
	const { walletProvider } = useWeb3ModalProvider();

	useEffect(() => {
		connectEOA(walletProvider, setConnectedAddress);
	}, [walletProvider]);

	const handleSend = async () => {
		const avocadoRPCChainId = "634";

		const avocadoProvider = new ethers.providers.JsonRpcProvider(
			"https://rpc.avocado.instadapp.io"
		);
		// can use any other RPC on the network you want to interact with:
		const polygonProvider = new ethers.providers.JsonRpcProvider(
			"https://polygon-rpc.com"
		);
		const chainId = await polygonProvider
			.getNetwork()
			.then((network) => network.chainId); // e.g. when executing later on Polygon

		// Should be connected to chainId 634 (https://rpc.avocado.instadapp.io), before doing any transaction
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		// request connection
		await window.ethereum
			.request({ method: "eth_requestAccounts" })
			.catch((err) => {
				if (err.code === 4001) {
					console.log("Please connect to the Web3 wallet.");
				} else {
					console.error(err);
				}
			});

		const avoForwarderAddress =
			"0x46978CD477A496028A18c02F07ab7F35EDBa5A54"; // available on 10+ networks

		// set up AvoForwarder contract (main interaction point) on e.g. Polygon
		const forwarder = new ethers.Contract(
			avoForwarderAddress,
			avoForwarderV1ABI,
			polygonProvider
		);
		console.log(connectedAddress);
		console.log(String(connectedAddress));
		const ownerAddress = String(connectedAddress); // Vitalik as owner EOA example
		const index = "0";

		const avocadoAddress = await forwarder.computeAvocado(
			ownerAddress,
			index
		);
		console.log(avocadoAddress);
		// set up Avocado
		const avocado = new ethers.Contract(
			avocadoAddress,
			avocadoV1ABI,
			polygonProvider
		);
		console.log(avocado);
		const isDeployed =
			(await polygonProvider.getCode(avocadoAddress)) !== "0x";

		// -------------------------------- Read values -----------------------------------

		let domainName, domainVersion; // domain separator name & version required for building signatures
		console.log(ownerAddress);
		if (isDeployed) {
			// if avocado is deployed, can read values directly from there
			[domainName, domainVersion] = await Promise.all([
				avocado.DOMAIN_SEPARATOR_NAME(),
				avocado.DOMAIN_SEPARATOR_VERSION(),
			]);
		} else {
			// if avocado is not deployed yet, AvoForwarder will resolve to the default values set when deploying the Avocado
			[domainName, domainVersion] = await Promise.all([
				forwarder.avocadoVersionName(ownerAddress, index),
				forwarder.avocadoVersion(ownerAddress, index),
			]);
		}
		console.log("here", ownerAddress);
		console.log(avocado.avoNonce);
		const nonce = isDeployed ? await avocado.avoNonce() : "0";
		console.log(nonce);
		console.log(domainName);
		const requiredSigners = isDeployed
			? await avocado.requiredSigners()
			: 1;
		if (requiredSigners > 1) {
			throw new Error(
				"Example is for Avocado personal with only owner as signer"
			);
		}

		// USDC address on Polygon (different on other networks) - not USDC.e
		const usdcAddress = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
		// Sending "10" USDC (USDC has 6 decimals!)
		const usdcAmount = ethers.utils.parseUnits("0.01", 6);
		const receiver = connectedAddress;
		// alert(receiver.toString());

		const usdcInterface = new ethers.utils.Interface([
			"function transfer(address to, uint amount) returns (bool)",
		]);
		const calldata = usdcInterface.encodeFunctionData("transfer", [
			receiver,
			usdcAmount,
		]); // create calldata from interface
		console.log("here below calldata");
		const action = {
			target: usdcAddress,
			data: calldata,
			value: "0",
			operation: "0",
		};

		// transaction with action to transfer USDC
		const txPayload = {
			params: {
				actions: [action],
				id: "0",
				avoNonce: nonce.toString(), // setting nonce to previously obtained value for sequential avoNonce
				salt: ethers.utils.defaultAbiCoder.encode(
					["uint256"],
					[Date.now()]
				),
				source: "0x000000000000000000000000000000000000Cad0", // could set source here for referral system
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
		console.log("here above estimate fee");
		// -------------------------------- Estimate fee -----------------------------------
		console.log(avocadoAddress);
		console.log(index);
		console.log(txPayload);
		console.log(chainId);
		const estimate = await avocadoProvider.send(
			"txn_multisigEstimateFeeWithoutSignature",
			[
				{
					message: txPayload, // transaction payload as built in previous step
					owner: connectedAddress, // avocado owner EOA address
					safe: avocadoAddress, // avocado address
					index: index,
					targetChainId: chainId,
				},
			]
		);

		// convert fee from hex and 1e18, is in USDC:
		console.log("estimate", Number(estimate.fee) / 1e18);

		// -------------------------------- Sign -----------------------------------

		const domain = {
			name: domainName, // see previous steps
			version: domainVersion, // see previous steps
			chainId: avocadoRPCChainId,
			verifyingContract: avocadoAddress, // see previous steps
			salt: ethers.utils.solidityKeccak256(["uint256"], [chainId]), // salt is set to actual chain id where execution happens
		};
		console.log("i'm here");
		// make sure you are on chain id 634 (to interact with Avocado RPC) with expected owner
		const avoSigner = provider.getSigner();
		if ((await provider.getNetwork()).chainId !== 634) {
			throw new Error("Not connected to Avocado network");
		}
		if ((await avoSigner.getAddress()) !== connectedAddress) {
			throw new Error("Not connected with expected owner address");
		}

		// transaction payload as built in previous step
		const signature = await avoSigner._signTypedData(
			domain,
			types,
			txPayload
		);

		// -------------------------------- Execute -----------------------------------

		const txHash = await avocadoProvider.send("txn_broadcast", [
			{
				signatures: [
					{
						signature, // signature as built in previous step
						signer: connectedAddress, // signer address that signed the signature
					},
				],
				message: txPayload, // transaction payload as built in previous step
				owner: connectedAddress, // avocado owner EOA address
				safe: avocadoAddress, // avocado address
				index,
				targetChainId: chainId,
				executionSignature: undefined, // not required for Avocado personal
			},
		]);

		// -------------------------------- Check status -----------------------------------

		const txDetails = await avocadoProvider.send(
			"api_getTransactionByHash",
			[txHash]
		);
		console.log("here is txHash: " + txHash);
		console.log(txDetails);
		console.log(txDetails.status);

		// txDetails.status is of type 'pending' | 'success' | 'failed' | 'confirming'
		// in case of 'failed', use the error message: txDetails.revertReason
		if (txDetails.status === "failed") {
			// handle errors
			alert(txDetails.revertReason);
		} else {
			// status might still be pending or confirming
			console.log(txHash);
			alert(
				`Tx executed! Hash: ${txHash}, Avoscan: https://avoscan.co/tx/${txHash}`
			);
		}
	};
	return (
		<ActionButton
			icon={<MdOutlineArrowOutward />}
			label='Send'
			onClick={handleSend}
		/>
	);
};

export const ReceiveButton = ({ onClick }) => (
	<ActionButton icon={<MdCallReceived />} label='Receive' onClick={onClick} />
);
