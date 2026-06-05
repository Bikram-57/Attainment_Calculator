import React from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function FacultyViewModal({data, closeMenu}) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
			onClick={closeMenu}
		>
			<div
				className="w-[90%] max-w-xl rounded-lg shadow-2xl overflow-hidden"
				style={{backgroundColor: COLORS.latte}}
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div
					className="flex items-center justify-between px-6 py-3"
					style={{backgroundColor: COLORS.mint}}
				>
					<h2
						className="text-2xl font-semibold"
						style={{color: COLORS.font}}
					>
						Faculty Details
					</h2>

					<button
						onClick={closeMenu}
						className="cursor-pointer"
					>
						<IoMdClose className='w-8 h-8' style={{color: COLORS.font}}/>
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-6">
					<div className="grid grid-cols-[180px_1fr] gap-y-5 gap-x-8 text-[18px]">

						<div className="font-bold text-gray-900">
							Faculty Id
						</div>
						<div className="text-gray-700">
							{data.facultyId}
						</div>

						<div className="font-bold text-gray-900">
							Faculty Name
						</div>
						<div className="text-gray-700">
							{data.name}
						</div>

						<div className="font-bold text-gray-900">
							Email
						</div>
						<div className="text-gray-700">
							{data.email}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default FacultyViewModal