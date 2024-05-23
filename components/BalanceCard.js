"use client";
const BalanceCard = ({ title, balance, unit }) => (
	<div className='flex flex-col items-center p-4 mt-4 border border-gray-300 rounded-lg'>
		<h2 className='mb-4 font-bold'>{title}</h2>
		<p>
			{balance} {unit}
		</p>
	</div>
);

export default BalanceCard;
