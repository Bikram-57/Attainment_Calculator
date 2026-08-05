import React from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function RubricsViewModal({ data, closeMenu }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={closeMenu}
		>
			<div
				className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
				style={{ backgroundColor: COLORS.latte }}
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div
					className="flex items-start justify-between gap-4 border-b border-gray-300 px-5 py-4 sm:px-6"
					style={{ backgroundColor: COLORS.mint }}
				>
					<div className="min-w-0">
						<h2
							className="truncate text-lg font-semibold sm:text-xl lg:text-2xl"
							style={{ color: COLORS.font }}
						>
							{`Rubrics: ${data.academicYear} (${data.semesterType} semester)`}
						</h2>

						<p
							className="mt-1 text-sm opacity-90"
							style={{ color: COLORS.font }}
						>
							Rubric thresholds for the selected course.
						</p>
					</div>

					<button
						onClick={closeMenu}
						className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
					>
						<IoMdClose
							className="h-6 w-6 sm:h-7 sm:w-7"
							style={{ color: COLORS.font }}
						/>
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-auto p-4 sm:p-6">

					<div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

						<div className="overflow-x-auto">

							<table className="min-w-150 w-full text-sm">

								<thead
									className="sticky top-0 z-10"
									style={{
										backgroundColor: COLORS.mint,
										color: COLORS.font,
									}}
								>
									<tr>

										<th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
											Level
										</th>

										<th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
											Min %
										</th>

										<th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
											Max %
										</th>

										<th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
											Range
										</th>

									</tr>
								</thead>

								<tbody>

									{data.thresholds.map((threshold, index) => (

										<tr
											key={threshold.level}
											className={`border-b border-gray-200 transition hover:bg-slate-50 ${index % 2 === 0
													? "bg-white"
													: "bg-gray-50"
												}`}
										>

											<td className="whitespace-nowrap px-5 py-4 text-center font-medium text-gray-800">
												Level {threshold.level}
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-center">
												{threshold.minPercent}%
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-center">
												{threshold.maxPercent}%
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-center text-gray-600">
												{threshold.minPercent}% - {threshold.maxPercent}%
											</td>

										</tr>

									))}

								</tbody>

							</table>

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
		// 		style={{ backgroundColor: COLORS.latte }}
		// 		onClick={(e) => e.stopPropagation()}
		// 	>

		// 		{/* Header */}
		// 		<div
		// 			className="flex items-center justify-between px-6 py-5 border-b border-gray-300"
		// 			style={{ backgroundColor: COLORS.mint }}
		// 		>
		// 			<h2
		// 				className="text-2xl font-semibold"
		// 				style={{ color: COLORS.font }}
		// 			>
		// 				{`Rubrics: ${data.course} - ${data.year}`}
		// 			</h2>

		// 			<button
		// 				onClick={closeMenu}
		// 				className="text-gray-500 hover:text-gray-600 transition cursor-pointer"
		// 			>
		// 				<IoMdClose className='w-8 h-8' style={{ color: COLORS.font }} />
		// 			</button>
		// 		</div>

		// 		{/* Body */}
		// 		<div className="px-6 py-6">
		// 			<table className="w-full border border-gray-300">
		// 				<thead
		// 					style={{
		// 						backgroundColor: COLORS.mint,
		// 						color: COLORS.font
		// 					}}
		// 				>
		// 					<tr>
		// 						<th className="px-6 py-3">
		// 							Level
		// 						</th>
		// 						<th className="px-6 py-3">
		// 							Min %
		// 						</th>
		// 						<th className="px-6 py-3">
		// 							Max %
		// 						</th>
		// 						<th className="px-6 py-3">
		// 							Range
		// 						</th>
		// 					</tr>
		// 				</thead>

		// 				<tbody>
		// 					{data.thresholds.map((threshold) => (
		// 						<tr
		// 							key={threshold.level}
		// 							className="border-b border-gray-300 hover:bg-slate-50"
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
		// 	</div>
		// </div>



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