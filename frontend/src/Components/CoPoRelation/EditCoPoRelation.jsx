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
        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.log('Axios Error | EditCoPoRelation | handleUpdate(): ', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="mx-2 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-md sm:mx-3 lg:mx-0"
            style={{ backgroundColor: COLORS.latte }}
        >
            {/* Header */}
            <div
                className="border-b border-gray-200 px-4 py-4 sm:px-5 lg:px-6"
                style={{ backgroundColor: COLORS.mint }}
            >
                <h2
                    className="text-lg font-semibold sm:text-xl"
                    style={{ color: COLORS.font }}
                >
                    Edit CO/PO Relation
                </h2>

                <p
                    className="mt-1 break-all text-sm opacity-90 sm:text-base"
                    style={{ color: COLORS.font }}
                >
                    {data.subjectId}
                </p>
            </div>

            {/* Table */}
            <div className="flex-1 p-4 sm:p-5 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="max-h-[70vh] overflow-auto">

                        <table className="min-w-225 w-full border-collapse text-center text-sm">

                            <thead
                                className="sticky top-0 z-20"
                                style={{
                                    backgroundColor: COLORS.latteDark,
                                    color: COLORS.mintDark,
                                }}
                            >
                                <tr>
                                    <th className="whitespace-nowrap border border-gray-300 px-4 py-3 font-semibold">
                                        {data.subjectId}
                                    </th>

                                    {poColumns.map((po) => (
                                        <th
                                            key={po}
                                            className="whitespace-nowrap border border-gray-300 px-4 py-3 font-semibold"
                                        >
                                            {po}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {coRows.map((co, index) => (
                                    <tr
                                        key={co}
                                        className={
                                            index % 2 === 0
                                                ? "bg-gray-100"
                                                : "bg-gray-50"
                                        }
                                    >
                                        <td
                                            className="whitespace-nowrap border border-gray-300 px-4 py-3 font-semibold"
                                            style={{
                                                backgroundColor: COLORS.latteDark,
                                            }}
                                        >
                                            {co}
                                        </td>

                                        {poColumns.map((po) => (
                                            <td
                                                key={po}
                                                className="border border-gray-300 p-2"
                                            >
                                                <input
                                                    value={tableData[co][po]}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            co,
                                                            po,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mx-auto w-14 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-center text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:w-16"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">

                <div className="min-w-0 flex-1">
                    <ErrorSuccessMsg
                        errorMsg={errorMsg}
                        successMsg={successMsg}
                        setSuccessMsg={setSuccessMsg}
                        setIsOpen={setOpenEdit}
                    />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

                    {loading && (
                        <Loading
                            type="update"
                            className="flex items-center justify-center"
                        />
                    )}

                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={handleUpdate}
                        className="w-full rounded-lg px-5 py-2.5 text-sm font-medium transition sm:w-auto cursor-pointer"
                        style={{
                            backgroundColor: isHovered
                                ? COLORS.mintDark
                                : COLORS.mint,
                            color: COLORS.font,
                        }}
                    >
                        Update
                    </button>

                    <button
                        onClick={() => setOpenEdit(false)}
                        className="w-full rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 sm:w-auto cursor-pointer"
                    >
                        Cancel
                    </button>

                </div>

            </div>
        </div>

        // <div
        //     className="m-2 rounded-2xl overflow-hidden border border-gray-200 shadow-md"
        //     style={{ backgroundColor: COLORS.latte }}
        // >
        //     {/* Header */}
        //     <div
        //         className="px-5 py-3 border-b border-gray-200"
        //         style={{ backgroundColor: COLORS.mint }}
        //     >
        //         <h2
        //             className="text-lg font-semibold"
        //             style={{ color: COLORS.font }}
        //         >
        //             Edit CO/PO Relation
        //         </h2>

        //         <p
        //             className="mt-1 text-sm opacity-90"
        //             style={{ color: COLORS.font }}
        //         >
        //             {data.subjectId}
        //         </p>
        //     </div>

        //     {/* Table */}
        //     <div className="p-5">
        //         <div className="overflow-hidden rounded-xl border border-gray-200">
        //             <div className="max-h-105 overflow-auto">
        //                 <table className="min-w-full text-sm text-center border-collapse whitespace-nowrap">
        //                     <thead
        //                         className="sticky top-0 z-10"
        //                         style={{
        //                             backgroundColor: COLORS.latteDark,
        //                             color: COLORS.mintDark,
        //                         }}
        //                     >
        //                         <tr>
        //                             <th className="border border-gray-300 px-4 py-3 font-semibold">
        //                                 {data.subjectId}
        //                             </th>

        //                             {poColumns.map((po) => (
        //                                 <th
        //                                     key={po}
        //                                     className="border border-gray-300 px-4 py-3 font-semibold"
        //                                 >
        //                                     {po}
        //                                 </th>
        //                             ))}
        //                         </tr>
        //                     </thead>

        //                     <tbody>
        //                         {coRows.map((co, index) => (
        //                             <tr
        //                                 key={co}
        //                                 className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}
        //                             >
        //                                 <td
        //                                     className="border border-gray-300 font-semibold"
        //                                     style={{ backgroundColor: COLORS.latteDark }}
        //                                 >
        //                                     {co}
        //                                 </td>

        //                                 {poColumns.map((po) => (
        //                                     <td
        //                                         key={po}
        //                                         className="border border-gray-300 p-2"
        //                                     >
        //                                         <input
        //                                             value={tableData[co][po]}
        //                                             onChange={(e) =>
        //                                                 handleChange(co, po, e.target.value)
        //                                             }
        //                                             className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        //                                         />
        //                                     </td>
        //                                 ))}
        //                             </tr>
        //                         ))}
        //                     </tbody>
        //                 </table>
        //             </div>
        //         </div>
        //     </div>

        //     {/* Footer */}
        //     <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
        //         <ErrorSuccessMsg
        //             errorMsg={errorMsg}
        //             successMsg={successMsg}
        //             setSuccessMsg={setSuccessMsg}
        //             setIsOpen={setOpenEdit}
        //         />

        //         <div className="flex items-center gap-3">
        //             {loading && (
        //                 <Loading
        //                     type="update"
        //                     className="flex items-center"
        //                 />
        //             )}

        //             <button
        //                 onMouseEnter={() => setIsHovered(true)}
        //                 onMouseLeave={() => setIsHovered(false)}
        //                 onClick={handleUpdate}
        //                 className="rounded-lg px-5 py-2 text-sm font-medium transition cursor-pointer"
        //                 style={{
        //                     backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
        //                     color: COLORS.font,
        //                 }}
        //             >
        //                 Update
        //             </button>

        //             <button
        //                 onClick={() => setOpenEdit(false)}
        //                 className="rounded-lg bg-gray-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700 cursor-pointer"
        //             >
        //                 Cancel
        //             </button>
        //         </div>
        //     </div>
        // </div>

        // <div className='px-3 py-4'>
        //     <div
        //         className='font-semibold text-lg pb-6'
        //         style={{ color: COLORS.mint }}
        //     >
        //         Edit CO/PO Relation
        //     </div>
        //     <div>
        //         <div className="overflow-auto shadow">
        //             <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">
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

        //                     {coRows.map(co => (
        //                         <tr key={co} className="bg-gray-200 hover:bg-gray-300">
        //                             <td className="border p-2 font-bold bg-gray-300">
        //                                 {co}
        //                             </td>

        //                             {poColumns.map(po => (
        //                                 <td key={po} className="border p-2 font-semibold">
        //                                     <input
        //                                         value={tableData[co][po]}
        //                                         onChange={(e) =>
        //                                             handleChange(co, po, e.target.value)
        //                                         }
        //                                         className="w-20 h-8 text-center border border-gray-400 bg-white outline-none"
        //                                     />
        //                                 </td>
        //                             ))}
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>
        //     </div>
        //     <div className='flex justify-end gap-2'>
        //         {loading &&
        //             <Loading
        //                 type='update'
        //                 className='mt-4 flex items-center'
        //             />
        //         }
        //         <button
        //             onMouseEnter={() => setIsHovered(true)}
        //             onMouseLeave={() => setIsHovered(false)}
        //             className='mt-4 px-3 py-1 rounded-md text-white font-semibold cursor-pointer'
        //             style={{
        //                 backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
        //                 color: COLORS.font
        //             }}
        //             onClick={handleUpdate}
        //         >
        //             Update
        //         </button>
        //         <button
        //             className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
        //             onClick={() => setOpenEdit(false)}
        //         >
        //             Close
        //         </button>
        //     </div>
        //     <ErrorSuccessMsg
        //         errorMsg={errorMsg}
        //         successMsg={successMsg}
        //         setSuccessMsg={setSuccessMsg}
        //         setIsOpen={setOpenEdit}
        //     />
        // </div>
    )
}

export default EditCoPoRelation