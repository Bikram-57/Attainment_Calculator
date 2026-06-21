import React from 'react';
import { useDispatch } from 'react-redux';
import { open, close } from '../../store/sideBarSlice';
import { useEffect } from 'react';

function DirectAttainmentTable({ data, setIsOpen }) {
    const dispatch = useDispatch();
    const subject = data?.subjects?.[0];

    if (!subject) return <div className='text-center text-lg'>No data available</div>

    const rows = subject.tableData;

    // Get PO columns dynamically
    const poColumns = Object.keys(rows[0]).filter(
        key => key.startsWith('PO')
    );

    // Last row = Direct PO Attainment
    const directPoRow = rows[rows.length - 1];

    // CO rows
    const coRows = rows.slice(0, -1);

    useEffect(() => {
        dispatch(close());
        return () => {
            dispatch(open());
        }
    }, []);

    return (
        <div className="bg-white p-4">
            <div className='font-semibold text-lg pb-3'>
                Direct Attainment: {data.course} - {data.academicYear}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-center border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Subject</th>
                            <th className="border p-2">CO</th>
                            <th className="border p-2">
                                Attainment Level
                            </th>

                            {poColumns.map((po) => (
                                <th
                                    key={po}
                                    className="border p-2"
                                >
                                    {po}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {coRows.map((row, index) => (
                            <tr key={index} className='hover:bg-gray-100'>
                                {/* Show subject only once */}
                                {index === 0 && (
                                    <td
                                        rowSpan={coRows.length}
                                        className="border p-2 font-semibold align-top bg-white"
                                    >
                                        {row.course}
                                    </td>
                                )}

                                <td className="border p-2 font-semibold">
                                    {row.co}
                                </td>

                                <td className="border p-2">
                                    {row.attainmentLevel}
                                </td>

                                {poColumns.map((po) => (
                                    <td
                                        key={po}
                                        className="border p-2"
                                    >
                                        {row[po] ?? '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Direct PO Attainment Row */}
                        <tr className="font-semibold bg-gray-50 hover:bg-gray-100">
                            <td
                                colSpan={3}
                                className="border p-2 text-center bg-gray-200"
                            >
                                Direct PO Attainment
                            </td>

                            {poColumns.map((po) => (
                                <td
                                    key={po}
                                    className="border p-2"
                                >
                                    {directPoRow[po] ?? '-'}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='flex justify-end'>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default DirectAttainmentTable;