import React, { useState } from 'react'
import { COLORS } from '../../constants/theme'

function ViewCoPoRelations({ data, setOpenView }) {
    const rows = data.mappingData ? Object.entries(data?.mappingData) : [];
    const poColumns = rows[0] ? Object.keys(rows[0][1]) : [];

    return (
        <div className='px-3 py-4'>
            <div
                className='font-semibold text-lg pb-6'
                style={{ color: COLORS.mint }}
            >
                View CO/PO Relation
            </div>
            <div>
                <div className="overflow-auto shadow">
                    {data.mappingData ? (<table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">
                        <thead
                            className="sticky top-0 z-10"
                            style={{ backgroundColor: COLORS.latteDark }}
                        >
                            <tr>
                                <th className="border p-2 font-bold">
                                    {data.subjectId}
                                </th>
                                {poColumns.map((po) => (
                                    <th key={po} className="border p-2 font-bold">
                                        {po}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(([co, val]) => (
                                <tr key={co} className="bg-gray-200 hover:bg-gray-300">
                                    <td className="border p-2 font-bold bg-gray-300">
                                        {co}
                                    </td>
                                    {poColumns.map(po => (
                                        <td key={po} className="border p-2 font-semibold">
                                            {val[po] !== '' ? val[po] : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>) :
                        (
                            <div className='text-center text-lg'>No data available</div>
                        )
                    }
                </div>
            </div>
            <div className='flex justify-end'>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
                    onClick={() => setOpenView(false)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default ViewCoPoRelations