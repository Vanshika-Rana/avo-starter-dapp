"use client";
import { useState, useEffect } from "react";
import { useWeb3Modal, useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { connectEOA } from "../utils/web3";
import Image from "next/image";
import logolight from "../public/images/logolight.png";
import logo from "../public/images/logo.png";
import AddressCard from "../components/AddressCard";
import BalanceCard from "../components/BalanceCard";
import SendButton from "../utils/SendButton";
import ReceiveButton from "../utils/ReceiveButton";
import { IoCopyOutline } from "react-icons/io5";
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
		<main className=' flex flex-col items-center justify-between min-h-screen w-full'>
			<section className='flex flex-col min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8'>
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
						<div className='flex flex-col '>
							{/* <div className='flex  w-full items-center justify-center '>
								<h2 className=' font-bold text-xl'>
									Connected EOA Address:{" "}
								</h2>
								<div className='flex items-center'>
									<p className='mx-4 text-md'>
										{connectedAddress.slice(0, 6) +
											"..." +
											connectedAddress.slice(-7)}
									</p>
									<button
										onClick={() => copyToClipboard(address)}
										className='px-4 py-1 text-green-600 rounded-full hover:text-green-700 hover:scale-95'>
										<IoCopyOutline />
									</button>
								</div>
							</div>

							<div className='bg-purple-500 text-white rounded-lg py-2 mt-2 flex  w-full items-center justify-center '>
								<h2 className=' font-bold text-xl'>
									Polygon USDC Balance:{" "}
								</h2>
								<div className='flex items-center'>
									<p className='mx-4 text-md'>
										{polygonBalance} <span>USDC</span>
									</p>
								</div>
							</div> */}
							<div class='flex flex-col items-center justify-center'>
								{/* <!-- Connected EOA Address --> */}
								<div class=' text-black rounded-lg py-2 mt-2 w-full'>
									<h2 class='font-bold text-xl text-center'>
										Connected EOA Address:
									</h2>
									<div class='flex items-center justify-center'>
										<p class='text-sm text-center'>
											{connectedAddress}
										</p>
									</div>
								</div>

								{/* <!-- Polygon USDC Balance --> */}
								<div class='bg-purple-200 text-black rounded-lg py-2 mt-2 w-full'>
									<h2 class='font-bold text-lg text-center'>
										Polygon USDC Balance:
									</h2>
									<div class='flex items-center justify-center'>
										<p class='text-sm text-center'>
											{polygonBalance} <span>USDC</span>
										</p>
									</div>
								</div>
							</div>

							<h3 className='text-emerald-800 font-bold text-xl mt-4 w-full text-center'>
								WALLET INFORMATION
							</h3>
							<div className='grid w-full grid-cols-1 gap-4 mt-3 md:grid-cols-2'>
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
									title='Multisig #1 Gas Tank Balance'
									balance={avocadoMultisigGasBalance}
									unit='USDC'
								/>
							</div>
							<div className='grid w-full grid-cols-1 gap-4 mt-8 md:grid-cols-2'>
								<SendButton onClick={open} />
								<ReceiveButton onClick={open} />
							</div>
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
