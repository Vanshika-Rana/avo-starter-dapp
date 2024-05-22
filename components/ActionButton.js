"use client";
import { MdOutlineArrowOutward, MdCallReceived } from "react-icons/md";

const ActionButton = ({ icon, label, onClick }) => (
	<button
		onClick={onClick}
		className='flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white transition-transform duration-500 transform rounded-lg bg-emerald-500 hover:scale-95'>
		{icon}
		<span>{label}</span>
	</button>
);

export const SendButton = ({ onClick }) => (
	<ActionButton
		icon={<MdOutlineArrowOutward />}
		label='Send'
		onClick={onClick}
	/>
);

export const ReceiveButton = ({ onClick }) => (
	<ActionButton icon={<MdCallReceived />} label='Receive' onClick={onClick} />
);
