import axios from 'axios';
import React, { useState } from 'react'
import { COLORS } from '../../constants/theme';

function EditCoPoRelations({ data, setOpenEdit }) {
    const [tableData, setTableData] = useState(data.mappingData);
    const [isHovered, setIsHovered] = useState(false);
    const rows = Object.entries(tableData);
    const poColumns = Object.keys(rows[0][1]);
    const prevData = data.mappingData;

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
        if (prevData === tableData) {
            setOpenEdit(false);
            return;
        }
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
        <div className='px-3 py-4'>
            <div
                className='font-semibold text-lg pb-6'
                style={{ color: COLORS.mint }}
            >
                View CO/PO Relation
            </div>
            <div>
                <div className="overflow-auto shadow">
                    <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">
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
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className='mt-4 px-3 py-1 rounded-md text-white font-semibold cursor-pointer'
                    style={{
                        backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
                        color: COLORS.font
                    }}
                    onClick={handleUpdate}
                >
                    Update
                </button>
                <button
                    className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
                    onClick={() => setOpenEdit(false)}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default EditCoPoRelations