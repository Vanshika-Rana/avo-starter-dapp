"use client";
import { useState, useEffect } from "react";
import { useWeb3Modal, useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { connectEOA } from "../utils/web3";
import Image from "next/image";
import logolight from "../public/images/logolight.png";
import logo from "../public/images/logo.png";
import AddressCard from "../components/AddressCard";
import BalanceCard from "../components/BalanceCard";
import { SendButton, ReceiveButton } from "../components/ActionButton";
import Footer from "@/components/Footer";

export default function Home() {
	const [connectedAddress, setConnectedAddress] = useState("");
	const [avocadoAddress, setAvocadoAddress] = useState("");
	const [avocadoMultisigAddress, setAvocadoMultisigAddress] = useState("");
	const [avocadoGasBalance, setAvocadoGasBalance] = useState("");
	const [polygonBalance, setPolygonBalance] = useState("");
	const [avocadoMultisigGasBalance, setAvocadoMultisigGasBalance] =
		useState("");

	const { open } = useWeb3Modal();
	const { walletProvider } = useWeb3ModalProvider();

	useEffect(() => {
		connectEOA(
			walletProvider,
			setConnectedAddress,
			setAvocadoAddress,
			setAvocadoMultisigAddress,
			setAvocadoGasBalance,
			setPolygonBalance,
			setAvocadoMultisigGasBalance
		);
	}, [walletProvider]);

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<main className='flex flex-col items-center justify-between bg-red-100 min-h-screen w-full'>
			<section className='flex flex-col h-[80vh] items-center justify-center px-4 sm:px-6 lg:px-8'>
				<Image src={logolight} width={200} height={500} alt='' />
				<span className='mt-2 mb-8 text-5xl font-bold text-center sm:text-7xl'>
					Starter Dapp
				</span>

				{!connectedAddress ? (
					<button
						onClick={open}
						className='flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white transition-transform duration-500 transform rounded-lg bg-emerald-950 hover:scale-95'>
						<Image src={logo} width={20} height={20} alt='Logo' />
						<span>Connect your wallet</span>
					</button>
				) : (
					<>
						<div className='grid w-full grid-cols-1 gap-4 mt-8 md:grid-cols-3'>
							<AddressCard
								title='Connected EOA Address'
								address={connectedAddress}
								onCopy={copyToClipboard}
							/>
							<AddressCard
								title='Avocado Address'
								address={avocadoAddress}
								onCopy={copyToClipboard}
							/>
							<AddressCard
								title='Avocado Multisig Address #1'
								address={avocadoMultisigAddress}
								onCopy={copyToClipboard}
							/>
							<BalanceCard
								title='Avocado GAS Tank Balance'
								balance={avocadoGasBalance}
								unit='USDC'
							/>
							<BalanceCard
								title='Polygon Matic Balance'
								balance={polygonBalance}
								unit='MATIC'
							/>
							<BalanceCard
								title='Multisig #1 Gas Tank Balance'
								balance={avocadoMultisigGasBalance}
								unit='USDC'
							/>
						</div>

						<div className='flex justify-around mt-4 w-full'>
							<SendButton onClick={open} />
							<ReceiveButton onClick={open} />
						</div>
					</>
				)}

				<div className='max-w-2xl mx-auto mt-8 mb-8 text-center'>
					<p className='text-lg text-gray-700'>
						Welcome to the <b>Avocado Starter Dapp!</b> This dapp
						serves as a starting point for developers interested in
						integrating Avocado Wallet into their projects.
					</p>
					<p className='mt-4 text-lg text-gray-700'>
						With this starter dapp, you can quickly connect to
						Avocado Wallet and explore its features. Clone this{" "}
						<a
							href='https://github.com/Vanshika-Rana/avo-starter-dapp'
							target='_blank'
							className='font-bold underline text-emerald-500'>
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
