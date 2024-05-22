"use client";
import { IoCopyOutline } from "react-icons/io5";

const AddressCard = ({ title, address, onCopy }) => (
	<div className='flex flex-col items-center p-4 border border-gray-300 rounded-lg'>
		<h2 className='mb-4 font-bold'>{title}</h2>
		<div className='flex items-center'>
			<p className='mr-2' title={address}>
				{address.slice(0, 6) + "..." + address.slice(-4)}
			</p>
			<button
				onClick={() => onCopy(address)}
				className='px-4 py-1 text-green-600 rounded-full hover:text-green-700 hover:scale-95'>
				<IoCopyOutline />
			</button>
		</div>
	</div>
);

export default AddressCard;
