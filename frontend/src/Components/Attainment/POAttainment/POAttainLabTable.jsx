import React from "react";

const POAttainLabTable = ({ data }) => {
	const averageCo = data?.averageCo ?? {};
	const finalSubjectAttainment = data?.finalSubjectAttainment ?? "-";
	const mappingData = data?.mappingData ?? {};
	const poAttainment = data?.poAttainment ?? {};
	const subjectId = data?.subjectId ?? "Subject";

	const rows = Object.entries(mappingData);

	// Get PO columns safely from mappingData / averageCo / poAttainment
	const poColumns = Object.keys(
		rows[0]?.[1] ?? averageCo
	);

	const avgCoColumns = poColumns.map((po) => [
		po,
		averageCo[po],
	]);

	const poAttainmentColumns = poColumns.map((po) => [
		po,
		poAttainment[po],
	]);

	return (
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<div className="overflow-auto">
				<table className="min-w-full border-separate border-spacing-0 whitespace-nowrap text-center text-sm">
					{/* ================= HEADER ================= */}
					<thead className="sticky top-0 z-20">
						<tr>
							<th className="sticky left-0 z-30 border-b border-r border-gray-200 bg-slate-800 px-5 py-3 text-left font-semibold text-white">
								{subjectId}
							</th>

							{poColumns.map((po) => (
								<th
									key={po}
									className="border-b border-r border-gray-200 bg-slate-800 px-4 py-3 font-semibold text-white"
								>
									{po}
								</th>
							))}
						</tr>
					</thead>

					{/* ================= BODY ================= */}
					<tbody>
						{/* CO Rows */}
						{rows.length > 0 ? (
							rows.map(([co, values], index) => (
								<tr
									key={co}
									className={`transition-colors hover:bg-indigo-50 ${index % 2 === 0
										? "bg-white"
										: "bg-slate-50"
										}`}
								>
									<td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-slate-100 px-5 py-3 text-left font-semibold text-slate-700">
										{co}
									</td>

									{poColumns.map((po) => {
										const value = values?.[po];

										return (
											<td
												key={po}
												className="border-b border-r border-gray-200 px-4 py-3 text-slate-700"
											>
												{value !== "" &&
													value !== null &&
													value !== undefined
													? value
													: "-"}
											</td>
										);
									})}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={poColumns.length + 1}
									className="px-5 py-8 text-center text-gray-500"
								>
									No PO mapping data available
								</td>
							</tr>
						)}

						{/* Average CO */}
						<tr className="bg-amber-50">
							<td className="border-t border-r border-gray-200 px-5 py-3 text-left font-semibold text-slate-800">
								Average CO
							</td>

							{avgCoColumns.map(([po, val]) => (
								<td
									key={po}
									className="border-t border-r border-gray-200 px-4 py-3 font-medium text-slate-700"
								>
									{val !== "" &&
										val !== null &&
										val !== undefined
										? val
										: "-"}
								</td>
							))}
						</tr>

						{/* CO Attainment */}
						<tr className="bg-emerald-50">
							<td className="border-t border-r border-gray-200 px-5 py-4 text-left font-semibold text-slate-800">
								CO Attainment
							</td>

							<td
								colSpan={poColumns.length}
								className="border-t border-r border-gray-200 px-4 py-4"
							>
								<span className="inline-flex min-w-12 justify-center rounded-full bg-emerald-600 px-4 py-1 text-sm font-bold text-white">
									{finalSubjectAttainment}
								</span>
							</td>
						</tr>

						{/* PO Attainment */}
						<tr className="bg-sky-50">
							<td className="border-t border-r border-gray-200 px-5 py-3 text-left font-semibold text-slate-800">
								PO Attainment
							</td>

							{poAttainmentColumns.map(([po, val]) => (
								<td
									key={po}
									className="border-t border-r border-gray-200 px-4 py-3 font-medium"
								>
									{val !== "" &&
										val !== null &&
										val !== undefined ? (
										<span className="inline-flex min-w-9.5 justify-center rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
											{val}
										</span>
									) : (
										"-"
									)}
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default POAttainLabTable;