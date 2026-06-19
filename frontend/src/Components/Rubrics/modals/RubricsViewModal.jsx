import React from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function RubricsViewModal({ data, closeMenu }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
			onClick={closeMenu}
		>
			<div
				className="w-[90%] max-w-xl rounded-lg bg-white shadow-2xl overflow-hidden"
				style={{ backgroundColor: COLORS.latte }}
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div
					className="flex items-center justify-between px-6 py-5 border-b border-gray-300"
					style={{ backgroundColor: COLORS.mint }}
				>
					<h2
						className="text-2xl font-semibold"
						style={{ color: COLORS.font }}
					>
						{`Rubrics: ${data.course} - ${data.year}`}
					</h2>

					<button
						onClick={closeMenu}
						className="text-gray-500 hover:text-gray-600 transition cursor-pointer"
					>
						<IoMdClose className='w-8 h-8' style={{ color: COLORS.font }} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-6">
					<table className="w-full">
						<thead className="bg-blue-600 text-white">
							<tr>
								<th className="px-6 py-3 text-left">
									Level
								</th>
								<th className="px-6 py-3 text-left">
									Min %
								</th>
								<th className="px-6 py-3 text-left">
									Max %
								</th>
								<th className="px-6 py-3 text-left">
									Range
								</th>
							</tr>
						</thead>

						<tbody>
							{data.thresholds.map((threshold) => (
								<tr
									key={threshold.level}
									className="border-b hover:bg-slate-50"
								>
									<td className="px-6 py-4 font-medium">
										Level {threshold.level}
									</td>

									<td className="px-6 py-4">
										{threshold.minPercent}%
									</td>

									<td className="px-6 py-4">
										{threshold.maxPercent}%
									</td>

									<td className="px-6 py-4 text-slate-600">
										{threshold.minPercent}% -{" "}
										{threshold.maxPercent}%
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>



		// <div
		// 	className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
		// 	onClick={closeMenu}
		// >
		// 	<div className="border-t bg-white">
		// 		<div className="overflow-x-auto">
		// 			<table className="w-full">
		// 				<thead className="bg-blue-600 text-white">
		// 					<tr>
		// 						<th className="px-6 py-3 text-left">
		// 							Level
		// 						</th>
		// 						<th className="px-6 py-3 text-left">
		// 							Min %
		// 						</th>
		// 						<th className="px-6 py-3 text-left">
		// 							Max %
		// 						</th>
		// 						<th className="px-6 py-3 text-left">
		// 							Range
		// 						</th>
		// 					</tr>
		// 				</thead>

		// 				<tbody>
		// 					{data?.map((threshold) => (
		// 						<tr
		// 							key={threshold.level}
		// 							className="border-b hover:bg-slate-50"
		// 						>
		// 							<td className="px-6 py-4 font-medium">
		// 								Level {threshold.level}
		// 							</td>

		// 							<td className="px-6 py-4">
		// 								{threshold.minPercent}%
		// 							</td>

		// 							<td className="px-6 py-4">
		// 								{threshold.maxPercent}%
		// 							</td>

		// 							<td className="px-6 py-4 text-slate-600">
		// 								{threshold.minPercent}% -{" "}
		// 								{threshold.maxPercent}%
		// 							</td>
		// 						</tr>
		// 					))}
		// 				</tbody>
		// 			</table>
		// 		</div>

		// 		{/* <div className="bg-slate-50 px-6 py-3 text-sm text-slate-500">
		// 			Last Updated:{" "}
		// 			{new Date(
		// 				data.updatedAt
		// 			).toLocaleDateString()}
		// 		</div> */}
		// 	</div>
		// </div>
	);
}

export default RubricsViewModal