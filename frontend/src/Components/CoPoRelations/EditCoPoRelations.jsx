import axios from 'axios';
import React, { useState } from 'react'

function EditCoPoRelations({ data, setOpenEdit }) {
    const [tableData, setTableData] = useState(data.mappingData);
    const rows = Object.entries(tableData);
    const poColumns = Object.keys(rows[0][1]);

    const handleChange = (co, po, val) => {
        if (val !== '' && !['1', '2', '3'].includes(val)) return;

        setTableData(prev => ({
            ...prev,
            [co]: {
                ...prev[co],
                [po]: val === '' ? '' : Number(val)
            }
        }))
    }
    const handleUpdate = async () => {
        try {
            const res = await axios.post('/co-po/save-relation', {
                subjectId: data.subjectId,
                academicYear: data.academicYear,
                course: data.course,
                mappingData: tableData
            })
            setOpenEdit(false);
            alert('Updated successfully!')
        } catch (error) {
            console.log('Axios Error | EditCoPoRelations | handleUpdate(): ', error);
        }
    }

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
                                            <input
                                                type='text'
                                                value={val[po]}
                                                onChange={(e) => handleChange(co, po, e.target.value)}
                                                className="w-20 h-8 text-center border border-gray-400 bg-white outline-none"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='flex justify-end gap-2'>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-blue-900 text-white font-semibold cursor-pointer'
                    onClick={handleUpdate}
                >
                    Update
                </button>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-red-500 text-white font-semibold cursor-pointer'
                    onClick={() => setOpenEdit(false)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default EditCoPoRelations