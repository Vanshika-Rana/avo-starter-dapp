import React from "react";

const Modal = ({ onClose, children }) => {
	return (
		<div className='fixed inset-0 flex items-center justify-center z-50'>
			<div className='fixed inset-0 bg-black opacity-50'></div>
			<div className='relative z-10 bg-white rounded-lg w-96 p-8'>
				<button
					className='absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400'
					onClick={onClose}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6 text-gray-600'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
						strokeLinecap='round'
						strokeLinejoin='round'>
						<path d='M6 18L18 6M6 6l12 12' />
					</svg>
				</button>
				<div className='mt-4'>{children}</div>
			</div>
		</div>
	);
};

export default Modal;
