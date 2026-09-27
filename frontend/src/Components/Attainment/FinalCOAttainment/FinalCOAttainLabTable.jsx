const FinalCOAttainLabTable = ({ data }) => {
    const attainmentTable = data?.attainmentTable ?? {};
    const finalSubjectAttainment = data?.finalSubjectAttainment ?? "-";

    const rows = Object.entries(attainmentTable);

    const labColumns = Array.from({ length: 12 }, (_, index) => ({
        key: `Lab_${index + 1}`,
        label: `Lab ${index + 1}`,
    }));

    const columns = [
        ...labColumns,
        {
            key: "internalAvg",
            label: "Total Avg Int",
        },
        {
            key: "externalLevel",
            label: "End Sem",
        },
        {
            key: "grandTotal",
            label: "Grand Total (50% int + 50% End term)",
        },
    ];

    return (
        <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-auto">
                <table className="min-w-full border-separate border-spacing-0 whitespace-nowrap text-center text-sm">
                    {/* HEADER */}
                    <thead className="sticky top-0 z-20">
                        <tr>
                            <th className="sticky left-0 z-30 border-b border-r border-gray-200 bg-slate-800 px-5 py-3 text-left font-semibold text-white">
                                CO's
                            </th>

                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="border-b border-r border-gray-200 bg-slate-800 px-4 py-3 font-semibold text-white"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
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

                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="border-b border-r border-gray-200 px-4 py-3 text-slate-700"
                                        >
                                            {values?.[col.key] ?? "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-5 py-8 text-center text-gray-500"
                                >
                                    No attainment data available
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* FOOTER */}
                    <tfoot>
                        <tr className="bg-emerald-50">
                            <td
                                colSpan={columns.length}
                                className="border-t border-r border-gray-200 px-5 py-4 text-right font-semibold text-slate-800"
                            >
                                Final CO Attainment
                            </td>

                            <td className="border-t border-gray-200 bg-emerald-100 px-5 py-4">
                                <span className="inline-flex min-w-10.5 justify-center rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                                    {finalSubjectAttainment}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FinalCOAttainLabTable;