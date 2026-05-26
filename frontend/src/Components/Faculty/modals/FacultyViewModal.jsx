import React from 'react'
import { IoMdClose } from "react-icons/io";

function FacultyViewModal({data, closeMenu}) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 cursor-default"
			onClick={closeMenu}
		>
			<div
				className="w-[90%] max-w-xl rounded-xl bg-white shadow-2xl overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
					<h2 className="text-2xl font-semibold text-blue-900">
						Faculty Details
					</h2>

					<button
						onClick={closeMenu}
						className="text-gray-500 hover:text-gray-600 transition cursor-pointer"
					>
						<IoMdClose className='w-8 h-8' />
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