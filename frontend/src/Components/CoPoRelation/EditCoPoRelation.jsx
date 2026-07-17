import axios from 'axios';
import React, { useState } from 'react'
import { COLORS } from '../../constants/theme';
import { Loading } from '../index';
import { ErrorSuccessMsg } from '../index';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function EditCoPoRelation({ data, setOpenEdit }) {
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useDocumentTitle('Menu - CO PO Relations | Edit');

    const defaultMappingData = {
        CO1: { PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', PO7: '', PO8: '' },
        CO2: { PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', PO7: '', PO8: '' },
        CO3: { PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', PO7: '', PO8: '' },
        CO4: { PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', PO7: '', PO8: '' },
        CO5: { PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', PO7: '', PO8: '' }
    };

    const [tableData, setTableData] = useState(data?.mappingData || defaultMappingData);

    const prevData = data?.mappingData || defaultMappingData;
    const coRows = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];
    const poColumns = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8'];

    const handleChange = (co, po, val) => {
        if (val !== '' && !['0', '1', '2', '3'].includes(val)) return;

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
            setErrorMsg("Please edit atleast one field before updating!");
            return;
        }
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await axios.post('/co-po/save-relation', {
                subjectId: data.subjectId,
                academicYear: data.academicYear,
                course: data.course,
                mappingData: tableData
            })
            setSuccessMsg('Updated successfully!');
        } catch (error) {
            console.log('Axios Error | EditCoPoRelation | handleUpdate(): ', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='px-3 py-4'>
            <div
                className='font-semibold text-lg pb-6'
                style={{ color: COLORS.mint }}
            >
                Edit CO/PO Relation
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

                            {coRows.map(co => (
                                <tr key={co} className="bg-gray-200 hover:bg-gray-300">
                                    <td className="border p-2 font-bold bg-gray-300">
                                        {co}
                                    </td>

                                    {poColumns.map(po => (
                                        <td key={po} className="border p-2 font-semibold">
                                            <input
                                                value={tableData[co][po]}
                                                onChange={(e) =>
                                                    handleChange(co, po, e.target.value)
                                                }
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
                {loading &&
                    <Loading
                        type='update'
                        className='mt-4 flex items-center'
                    />
                }
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
            <ErrorSuccessMsg
                errorMsg={errorMsg}
                successMsg={successMsg}
                setSuccessMsg={setSuccessMsg}
                setIsOpen={setOpenEdit}
            />
        </div>
    )
}

export default EditCoPoRelation