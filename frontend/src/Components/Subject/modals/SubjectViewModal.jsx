import React from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function SubjectViewModal({ data, closeMenu }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default p-3 sm:p-4"
			onClick={closeMenu}
		>
			<div
				className="w-full max-w-lg max-h-[90vh] rounded-xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden"
				style={{ backgroundColor: COLORS.latte }}
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div
					className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-300"
					style={{ backgroundColor: COLORS.mint }}
				>
					<h2
						className="text-xl sm:text-2xl font-semibold"
						style={{ color: COLORS.font }}
					>
						Subject Details
					</h2>

					<button
						onClick={closeMenu}
						className="text-gray-500 hover:text-gray-600 transition cursor-pointer shrink-0"
					>
						<IoMdClose
							className="w-6 h-6 sm:w-8 sm:h-8"
							style={{ color: COLORS.font }}
						/>
					</button>
				</div>


				{/* Body */}
				<div className="px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto">

					<div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 sm:gap-y-5 gap-x-12 text-base sm:text-lg">

						<div className="font-bold text-gray-900">
							Subject Id
						</div>
						<div className="text-gray-700 wrap-break-word">
							{data.subjectId}
						</div>


						<div className="font-bold text-gray-900">
							Subject Name
						</div>
						<div className="text-gray-700 wrap-break-word">
							{data.subjectName}
						</div>


						<div className="font-bold text-gray-900">
							Course
						</div>
						<div className="text-gray-700 wrap-break-word">
							{data.course}
						</div>

					</div>

				</div>

			</div>
		</div>

		// <div
		// 	className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
		// 	onClick={closeMenu}
		// >
		// 	<div
		// 		className="w-[90%] max-w-xl rounded-lg bg-white shadow-2xl overflow-hidden"
		// 		style={{backgroundColor: COLORS.latte}}
		// 		onClick={(e) => e.stopPropagation()}
		// 	>

		// 		{/* Header */}
		// 		<div
		// 			className="flex items-center justify-between px-6 py-5 border-b border-gray-300"
		// 			style={{ backgroundColor: COLORS.mint }}
		// 		>
		// 			<h2
		// 				className="text-2xl font-semibold"
		// 				style={{color: COLORS.font}}
		// 			>
		// 				Subject Details
		// 			</h2>

		// 			<button
		// 				onClick={closeMenu}
		// 				className="text-gray-500 hover:text-gray-600 transition cursor-pointer"
		// 			>
		// 				<IoMdClose className='w-8 h-8' style={{color: COLORS.font}} />
		// 			</button>
		// 		</div>

		// 		{/* Body */}
		// 		<div className="px-6 py-6">
		// 			<div className="grid grid-cols-[180px_1fr] gap-y-5 gap-x-8 text-[18px]">

		// 				<div className="font-bold text-gray-900">
		// 					Subject Id
		// 				</div>
		// 				<div className="text-gray-700">
		// 					{data.subjectId}
		// 				</div>

		// 				<div className="font-bold text-gray-900">
		// 					Subject Name
		// 				</div>
		// 				<div className="text-gray-700">
		// 					{data.subjectName}
		// 				</div>

		// 				<div className="font-bold text-gray-900">
		// 					Course
		// 				</div>
		// 				<div className="text-gray-700">
		// 					{data.course}
		// 				</div>
		// 			</div>
		// 		</div>
		// 	</div>
		// </div>
	);
}

export default SubjectViewModal