import React from "react";

const POAttainTable = ({ data }) => {
    const { averageCo, finalSubjectAttainment, mappingData, poAttainment, subjectId } = data;

    // Convert CO object → array
    const rows = Object.entries(mappingData);

    // Dynamically extract PO columns (from first CO)
    const poColumns = Object.keys(rows[0][1]); // ["PO1", "PO2", ...]
    const avgCoColumns = Object.entries(averageCo);
    const poAttainmentColumns = Object.entries(poAttainment);
    // console.log(avgCoColumns[0]);
    // console.log(avgCoColumns[0][0]);
    // console.log(avgCoColumns[0][1]);
    // console.log(poAttainmentColumns[0]);


    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            <div className="overflow-auto">

                <table className="min-w-full border-separate border-spacing-0 text-sm text-center whitespace-nowrap">

                    {/* ================= HEADER ================= */}
                    <thead className="sticky top-0 z-20">

                        <tr>

                            <th className="border-b border-r border-gray-200 bg-slate-800 px-5 py-3 text-left font-semibold text-white">
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
                        {rows.map(([co, values], index) => (

                            <tr
                                key={co}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-indigo-50 transition-colors`}
                            >

                                <td className="border-b border-r border-gray-200 bg-slate-100 px-5 py-3 text-left font-semibold text-slate-700">
                                    {co}
                                </td>

                                {poColumns.map((po) => (

                                    <td
                                        key={po}
                                        className="border-b border-r border-gray-200 px-4 py-3 text-slate-700"
                                    >
                                        {values[po] !== "" ? values[po] : "-"}
                                    </td>

                                ))}

                            </tr>

                        ))}

                        {/* Average CO */}
                        <tr className="bg-amber-50">

                            <td className="border-t border-r border-gray-200 px-5 py-3 text-left font-semibold text-slate-800">
                                Average CO
                            </td>

                            {avgCoColumns.map(([po, val]) => (

                                <td
                                    key={po}
                                    className="border-t border-r border-gray-200 px-4 py-3 font-medium"
                                >
                                    {val !== "" ? val : "-"}
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
                                    {val !== "" ? (
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

        // <div className="bg-white">
        //     <div className="overflow-auto shadow">
        //         <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">

        //             {/* HEADER */}
        //             <thead className="bg-gray-100 sticky top-0 z-10">
        //                 <tr>
        //                     <th className="border-r border-b border-gray-300 p-2">{subjectId}</th>

        //                     {poColumns.map((po) => (
        //                         <th key={po} className="border-r border-b border-gray-300 p-2 font-semibold">
        //                             {po}
        //                         </th>
        //                     ))}
        //                 </tr>
        //             </thead>

        //             {/* BODY */}
        //             <tbody>
        //                 {/* CO */}
        //                 {rows.map(([co, values]) => (
        //                     <tr key={co} className="hover:bg-gray-200">

        //                         {/* CO Name */}
        //                         <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-50">
        //                             {co}
        //                         </td>

        //                         {/* PO Values */}
        //                         {poColumns.map((po) => (
        //                             <td key={po} className="border-r border-b border-gray-300 p-2">
        //                                 {values[po] !== "" ? values[po] : "-"}
        //                             </td>
        //                         ))}
        //                     </tr>
        //                 ))}

        //                 {/* Average CO */}
        //                 <tr className="bg-gray-200">
        //                     <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-100">
        //                         Average CO
        //                     </td>
        //                     {/* PO Values */}
        //                     {avgCoColumns.map(([po, val]) => (
        //                         <td key={po} className="border-r border-b border-gray-300 p-2">
        //                             {val !== '' ? val : '-'}
        //                         </td>
        //                     ))}
        //                 </tr>

        //                 {/* CO Attainment */}
        //                 <tr className="bg-gray-600">
        //                     <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-100">
        //                         CO Attainment
        //                     </td>
        //                     {/* PO Values */}
        //                     <td colSpan={8} className="text-white font-bold border-r border-b border-gray-300 p-2">
        //                         {finalSubjectAttainment}
        //                     </td>
        //                 </tr>

        //                 {/* PO Attainment */}
        //                 <tr className="bg-gray-200">
        //                     <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-100">
        //                         PO Attainment
        //                     </td>
        //                     {/* PO Values */}
        //                     {poAttainmentColumns.map(([po, val]) => (
        //                         <td key={po} className="border-r border-b border-gray-300 p-2">
        //                             {val !== '' ? val : '-'}
        //                         </td>
        //                     ))}
        //                 </tr>
        //             </tbody>

        //         </table>
        //     </div>
        // </div>
    );
};

export default POAttainTable;