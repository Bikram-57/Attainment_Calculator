import React, { useState } from 'react'
import { COLORS } from '../../constants/theme'
import useDocumentTitle from '../../hooks/useDocumentTitle';

function ViewCoPoRelation({ data, setOpenView }) {
    const rows = data.mappingData ? Object.entries(data?.mappingData) : [];
    const poColumns = rows[0] ? Object.keys(rows[0][1]) : [];

    useDocumentTitle('Menu - CO PO Relations | View')

    return (
        <div
            className="m-2 rounded-2xl overflow-hidden border border-gray-200 shadow-md"
            style={{ backgroundColor: COLORS.latte }}
        >
            {/* Header */}
            <div
                className="px-5 py-3 border-b border-gray-200"
                style={{ backgroundColor: COLORS.mint }}
            >
                <h2
                    className="text-lg font-semibold"
                    style={{ color: COLORS.font }}
                >
                    View CO/PO Relation
                </h2>

                <p
                    className="text-sm mt-1 opacity-90"
                    style={{ color: COLORS.font }}
                >
                    {data.subjectId}
                </p>
            </div>

            {/* Table */}
            <div className="p-5">
                {data.mappingData ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-auto max-h-105">
                            <table className="min-w-full text-sm text-center border-collapse whitespace-nowrap">
                                <thead
                                    className="sticky top-0 z-10"
                                    style={{
                                        backgroundColor: COLORS.latteDark,
                                        color: COLORS.mintDark,
                                    }}
                                >
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-3 font-semibold">
                                            {data.subjectId}
                                        </th>

                                        {poColumns.map((po) => (
                                            <th
                                                key={po}
                                                className="border border-gray-300 px-4 py-3 font-semibold"
                                            >
                                                {po}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map(([co, val], index) => (
                                        <tr
                                            key={co}
                                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        >
                                            <td
                                                className="border border-gray-300 font-semibold"
                                                style={{ backgroundColor: COLORS.latteDark }}
                                            >
                                                {co}
                                            </td>

                                            {poColumns.map((po) => (
                                                <td
                                                    key={po}
                                                    className="border border-gray-300 px-4 py-3"
                                                >
                                                    {val[po] || (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
                        <p
                            className="text-lg font-medium"
                            style={{ color: COLORS.mintDark }}
                        >
                            No CO/PO Relation Available
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Upload the mapping to view it here.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 px-5 py-4">
                <button
                    onClick={() => setOpenView(false)}
                    className="rounded-lg bg-gray-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700 cursor-pointer"
                >
                    Close
                </button>
            </div>
        </div>

        // <div className='px-3 py-4'>
        //     <div
        //         className='font-semibold text-lg pb-6'
        //         style={{ color: COLORS.mint }}
        //     >
        //         View CO/PO Relation
        //     </div>
        //     <div>
        //         <div className="overflow-auto shadow">
        //             {data.mappingData ? (<table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">
        //                 <thead
        //                     className="sticky top-0 z-10"
        //                     style={{ backgroundColor: COLORS.latteDark }}
        //                 >
        //                     <tr>
        //                         <th className="border p-2 font-bold">
        //                             {data.subjectId}
        //                         </th>
        //                         {poColumns.map((po) => (
        //                             <th key={po} className="border p-2 font-bold">
        //                                 {po}
        //                             </th>
        //                         ))}
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {rows.map(([co, val]) => (
        //                         <tr key={co} className="bg-gray-200 hover:bg-gray-300">
        //                             <td className="border p-2 font-bold bg-gray-300">
        //                                 {co}
        //                             </td>
        //                             {poColumns.map(po => (
        //                                 <td key={po} className="border p-2 font-semibold">
        //                                     {val[po] !== '' ? val[po] : '-'}
        //                                 </td>
        //                             ))}
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>) :
        //                 (
        //                     <div className='text-center text-lg'>No data available</div>
        //                 )
        //             }
        //         </div>
        //     </div>
        //     <div className='flex justify-end'>
        //         <button
        //             className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
        //             onClick={() => setOpenView(false)}
        //         >
        //             Close
        //         </button>
        //     </div>
        // </div>
    )
}

export default ViewCoPoRelation