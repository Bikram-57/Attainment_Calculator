import React from 'react';
import { useDispatch } from 'react-redux';
import { open, close } from '../../store/sideBarSlice';
import { useEffect } from 'react';

function DirectPOAttainmentTable({ data, setIsOpen }) {
    const dispatch = useDispatch();
    const subjects = data?.subjects || [];

    const handleDownload = () => { }

    useEffect(() => {
        dispatch(close());
        return () => {
            dispatch(open());
        }
    }, []);
    return (
        <div className="bg-white p-4">
            <div className='font-semibold text-lg pb-3 flex justify-between items-center'>
                <div className='flex items-center gap-5'>
                    <div>
                        Direct Attainment: {data.course} - {data.academicYear}
                    </div>
                    <button
                        className='border px-2 py-1 rounded-md cursor-pointer text-sm'
                        onClick={handleDownload}
                    >
                        Download
                    </button>
                </div>
                <button
                    className='px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </button>
            </div>
            <div className="space-y-8 overflow-y-auto max-h-[70vh]">
                {subjects.map((subject, index) => {
                    const rows = subject.tableData || [];

                    const coRows = rows.filter(
                        (row) => row.course !== "Direct PO Attainment"
                    );

                    const directPoRow = rows.find(
                        (row) => row.course === "Direct PO Attainment"
                    );

                    const poColumns = Object.keys(rows[0]).filter((key) =>
                        key.startsWith("PO")
                    );

                    return (
                        <div key={subject.subjectId} className="overflow-x-auto">
                            <table className="w-full border-collapse text-center">
                                <thead>
                                    <tr>
                                        <th className="border p-3 bg-gray-200">
                                            Subject {subjects.length > 1 ? `(${index + 1})` : null}
                                        </th>
                                        <th className="border p-3 bg-gray-200">
                                            CO
                                        </th>
                                        <th className="border p-3 bg-gray-200">
                                            Attainment Level
                                        </th>

                                        {poColumns.map((po) => (
                                            <th
                                                key={po}
                                                className="border p-3 bg-gray-200"
                                            >
                                                {po}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {coRows.map((row, index) => (
                                        <tr key={index} className='hover:bg-gray-100'>
                                            {index === 0 && (
                                                <td
                                                    rowSpan={coRows.length}
                                                    className="border p-3 font-semibold align-top bg-white w-1/4"
                                                >
                                                    {subject.subjectName}
                                                    <br />
                                                    ({subject.subjectId})
                                                </td>
                                            )}

                                            <td className="border p-3">
                                                {row.co}
                                            </td>

                                            <td className="border p-3">
                                                {row.attainmentLevel}
                                            </td>

                                            {poColumns.map((po) => (
                                                <td
                                                    key={po}
                                                    className="border p-3"
                                                >
                                                    {row[po] ?? "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* Direct PO Attainment Row */}
                                    {directPoRow && (
                                        <tr className="font-semibold bg-gray-200 hover:bg-gray-300">
                                            <td
                                                colSpan={3}
                                                className="border p-3 text-center bg-gray-300"
                                            >
                                                Direct PO Attainment
                                            </td>

                                            {poColumns.map((po) => (
                                                <td
                                                    key={po}
                                                    className="border p-3"
                                                >
                                                    {directPoRow[po] ?? "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DirectPOAttainmentTable;
