import { ethers } from "ethers";
import avoForwarderV1ABI from "../constants/avo-forwarder-v1-abi.json";

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

export const connectEOA = async (
	walletProvider,
	setConnectedAddress,
	setAvocadoAddress,
	setAvocadoMultisigAddress,
	setAvocadoGasBalance,
	setPolygonBalance,
	setAvocadoMultisigGasBalance
) => {
	if (walletProvider) {
		const web3Provider = new ethers.providers.Web3Provider(walletProvider);
		const signer = web3Provider.getSigner();
		const address = await signer.getAddress();
		setConnectedAddress(address);
		await createAvoWallet(
			address,
			setAvocadoAddress,
			setAvocadoMultisigAddress,
			setAvocadoGasBalance,
			setPolygonBalance,
			setAvocadoMultisigGasBalance
		);
	}
};

const createAvoWallet = async (
	address,
	setAvocadoAddress,
	setAvocadoMultisigAddress,
	setAvocadoGasBalance,
	setPolygonBalance,
	setAvocadoMultisigGasBalance
) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider(
			chains.polygon.rpcUrl
		);
		const forwarder = new ethers.Contract(
			chains.polygon.forwarderAddress,
			avoForwarderV1ABI,
			provider
		);

		const index = 0; // index for personal wallet is 0
		const avocadoAddress = await forwarder.computeAvocado(address, index);
		setAvocadoAddress(avocadoAddress);

		const multisigIndex = 1;
		const avocadoMultisigAddress = await forwarder.computeAvocado(
			address,
			multisigIndex
		);
		setAvocadoMultisigAddress(avocadoMultisigAddress);

		const avocadoGasTankBalance = await fetchAvocadoGasTankBalance(
			avocadoAddress
		);
		setAvocadoGasBalance(avocadoGasTankBalance);

		const polygonBalance = await fetchPolygonUSDCBalance(avocadoAddress);
		setPolygonBalance(polygonBalance);

		const multisigGasTankBalance = await fetchAvocadoGasTankBalance(
			avocadoMultisigAddress
		);
		setAvocadoMultisigGasBalance(multisigGasTankBalance);
	} catch (err) {
		console.error("Error creating Avocado wallet:", err);
	}
};

const fetchAvocadoGasTankBalance = async (address) => {
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

const fetchPolygonUSDCBalance = async (address) => {
	const usdcContractAddress = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
	try {
		const polygonProvider = new ethers.providers.JsonRpcProvider(
			chains.polygon.rpcUrl
		);
		const usdcContract = new ethers.Contract(
			usdcContractAddress,
			["function balanceOf(address) view returns (uint256)"],
			polygonProvider
		);
		const balance = await usdcContract.balanceOf(address);
		return ethers.utils.formatUnits(balance, 6); // Assuming USDC has 6 decimals
	} catch (err) {
		console.error("Error fetching Polygon USDC balance:", err);
		return "";
	}
};
// const fetchPolygonBalance = async (address) => {
// 	try {
// 		const polygonProvider = new ethers.providers.JsonRpcProvider(
// 			chains.polygon.rpcUrl
// 		);
// 		const balance = await polygonProvider.getBalance(address);
// 		return ethers.utils.formatEther(balance);
// 	} catch (err) {
// 		console.error("Error fetching Polygon balance:", err);
// 		return "";
// 	}
// };
