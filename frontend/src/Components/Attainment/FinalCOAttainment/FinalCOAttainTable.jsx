import React from "react";

const FinalCOAttainmentTable = ({ data }) => {
    const { attainmentTable, finalSubjectAttainment } = data;

    // Convert object → array for mapping
    const rows = Object.entries(attainmentTable);

    // Column configuration
    const columns = [
        { key: "Quiz_1", label: "Quiz 1" },
        { key: "Mid_Term", label: "Sessional 1" },
        { key: "Quiz_2", label: "Quiz 2" },
        { key: "Surprise_Quiz", label: "Sessional 2" },
        { key: "Assignment", label: "Assignment" },
        { key: "externalLevel", label: "End Sem" },
        { key: "internalAvg", label: "Total Avg Int" },
        {
            key: "grandTotal",
            label: "Grand Total (50% int + 50% End term)",
        },
    ];

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            <div className="overflow-auto">

                <table className="min-w-full border-separate border-spacing-0 text-sm text-center whitespace-nowrap">

                    {/* ================= HEADER ================= */}
                    <thead className="sticky top-0 z-20">

                        <tr>

                            <th className="border-b border-r border-gray-200 bg-slate-800 px-5 py-3 text-left font-semibold text-white">
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

                    {/* ================= BODY ================= */}
                    <tbody>

                        {rows.map(([co, values], index) => (

                            <tr
                                key={co}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-indigo-50 transition-colors`}
                            >

                                {/* CO Name */}
                                <td className="border-b border-r border-gray-200 bg-slate-100 px-5 py-3 text-left font-semibold text-slate-700">
                                    {co}
                                </td>

                                {/* Dynamic Columns */}
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className="border-b border-r border-gray-200 px-4 py-3 text-slate-700"
                                    >
                                        {values[col.key] ?? "-"}
                                    </td>
                                ))}

                            </tr>

                        ))}

                    </tbody>

                    {/* ================= FOOTER ================= */}
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

        // <div className="bg-white">
        //     <div className="overflow-auto shadow">
        //         <table className="min-w-full text-sm text-center border-collapse whitespace-nowrap">

        //             {/* HEADER */}
        //             <thead className="bg-gray-100 sticky top-0 z-10">
        //                 <tr>
        //                     <th className="border-r border-b border-gray-300 p-2">CO's</th>

        //                     {columns.map((col) => (
        //                         <th key={col.key} className="border-r border-b border-gray-300 p-2 font-semibold">
        //                             {col.label}
        //                         </th>
        //                     ))}
        //                 </tr>
        //             </thead>

        //             {/* BODY */}
        //             <tbody>
        //                 {rows.map(([co, values]) => (
        //                     <tr key={co} className="hover:bg-gray-200">

        //                         {/* CO Name */}
        //                         <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-100">
        //                             {co}
        //                         </td>

        //                         {/* Dynamic Columns */}
        //                         {columns.map((col) => (
        //                             <td key={col.key} className="border-r border-b border-gray-300 p-2">
        //                                 {values[col.key] ?? "-"}
        //                             </td>
        //                         ))}
        //                     </tr>
        //                 ))}
        //             </tbody>

        //             {/* FOOTER */}
        //             <tfoot>
        //                 <tr className="bg-gray-100 font-semibold">
        //                     <td
        //                         colSpan={columns.length}
        //                         className="border-r border-gray-300 p-2 text-right"
        //                     >
        //                         Final CO Attainment
        //                     </td>

        //                     <td className="p-2 bg-gray-200 font-bold">
        //                         {finalSubjectAttainment}
        //                     </td>
        //                 </tr>
        //             </tfoot>

        //         </table>
        //     </div>
        // </div>
    );
};

export default FinalCOAttainmentTable;