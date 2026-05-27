import React from 'react'

function ViewCoPoRelations({ data, setOpenView }) {
    const rows = Object.entries(data.mappingData);
    const poColumns = Object.keys(rows[0][1]);

    return (
        <div className='bg-white px-3 py-4'>
            <div className='font-semibold text-blue-900 text-lg pb-6'>
                View CO/PO Relation
            </div>
            <div>
                <div className="overflow-auto shadow">
                    <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">
                        <thead className="bg-gray-300 sticky top-0 z-10">
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
                                <tr key={co} className="bg-gray-300 hover:bg-gray-200">
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
                    </table>
                </div>
            </div>
            <div className='flex justify-end'>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-red-500 text-white font-semibold cursor-pointer'
                    onClick={() => setOpenView(false)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default ViewCoPoRelations