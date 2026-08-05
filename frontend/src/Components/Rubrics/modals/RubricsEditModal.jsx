import React, { useState } from 'react';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';
import { ErrorSuccessMsg } from '../../index';

function RubricsEditModal({ data, closeMenu, toggleUpdate }) {

    const [thresholds, setThresholds] = useState(data.thresholds);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (index, field, value) => {
        const updated = [...thresholds];

        updated[index] = {
            ...updated[index],
            [field]: Number(value)
            // [field]: value
        };

        setThresholds(updated);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await axios.put('/rubrics/update', {
                semesterType: data.semesterType,
                academicYear: data.academicYear,
                thresholds
            });
            setSuccessMsg(res.data.message);
            toggleUpdate();

        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update rubrics!');
            console.error('Axios Error | RubricsEditModal | handleUpdate(): ', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={closeMenu}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div
                    className="flex items-start justify-between gap-4 border-b border-gray-300 px-5 py-4 sm:px-6"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div className="min-w-0">
                        <h2
                            className="truncate text-lg font-semibold sm:text-xl lg:text-2xl"
                            style={{ color: COLORS.font }}
                        >
                            {`Edit Rubrics: ${data.academicYear} (${data.semesterType} semester)`}
                        </h2>

                        <p
                            className="mt-1 text-sm opacity-90"
                            style={{ color: COLORS.font }}
                        >
                            Modify the threshold percentages and update the rubric.
                        </p>
                    </div>

                    <button
                        onClick={closeMenu}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">

                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

                        <div className="overflow-x-auto">

                            <table className="min-w-162.5 w-full text-sm">

                                <thead
                                    className="sticky top-0 z-10"
                                    style={{
                                        backgroundColor: COLORS.mint,
                                        color: COLORS.font,
                                    }}
                                >
                                    <tr>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Level
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Min %
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Max %
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Range
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {thresholds.map((threshold, index) => (

                                        <tr
                                            key={threshold.level}
                                            className={`border-b border-gray-200 transition hover:bg-slate-50 ${index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                                }`}
                                        >

                                            <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800">
                                                Level {threshold.level}
                                            </td>

                                            <td className="w-44 px-4 py-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    max={100}
                                                    value={threshold.minPercent}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "minPercent",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center outline-none transition hover:bg-slate-50 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                                />
                                            </td>

                                            <td className="w-44 px-4 py-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    max={100}
                                                    value={threshold.maxPercent}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "maxPercent",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center outline-none transition hover:bg-slate-50 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                                />
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600">
                                                {threshold.minPercent}% - {threshold.maxPercent}%
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    <div className="mt-5">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                            close={closeMenu}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 bg-white px-5 py-4 sm:px-6">

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <button
                            onClick={closeMenu}
                            className="w-full rounded-lg bg-gray-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-600 sm:w-auto cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="w-full rounded-lg px-5 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font,
                            }}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>

                    </div>

                </div>

            </div>
        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-auto"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[90%] max-w-2xl rounded-lg bg-white shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >

        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-6 py-5 border-b border-gray-300"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-2xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 {`Edit Rubrics: ${data.course} - ${data.year}`}
        //             </h2>

        //             <button
        //                 onClick={closeMenu}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose
        //                     className="w-8 h-8"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div className="p-6">

        //             <table className="w-full border border-gray-300">
        //                 <thead
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font
        //                     }}
        //                 >
        //                     <tr>
        //                         <th className="px-4 py-3">Level</th>
        //                         <th className="px-4 py-3">Min %</th>
        //                         <th className="px-4 py-3">Max %</th>
        //                         <th className="px-4 py-3">Range</th>
        //                     </tr>
        //                 </thead>

        //                 <tbody>
        //                     {thresholds.map((threshold, index) => (
        //                         <tr
        //                             key={threshold.level}
        //                             className="border-b border-gray-300"
        //                         >
        //                             <td className="px-4 py-4 font-medium text-center">
        //                                 Level {threshold.level}
        //                             </td>

        //                             <td className="px-4 py-4 w-1/5">
        //                                 <input
        //                                     // type="text"
        //                                     type="number"
        //                                     step="0.01"
        //                                     min={0}
        //                                     max={100}
        //                                     value={threshold.minPercent}
        //                                     onChange={(e) =>
        //                                         handleChange(
        //                                             index,
        //                                             'minPercent',
        //                                             e.target.value
        //                                         )
        //                                     }
        //                                     className="hover:bg-slate-50 w-full border border-gray-400 rounded px-3 py-2"
        //                                 />
        //                             </td>

        //                             <td className="px-4 py-4 w-1/5">
        //                                 <input
        //                                     // type="text"
        //                                     type="number"
        //                                     step="0.01"
        //                                     min={0}
        //                                     max={100}
        //                                     value={threshold.maxPercent}
        //                                     onChange={(e) =>
        //                                         handleChange(
        //                                             index,
        //                                             'maxPercent',
        //                                             e.target.value
        //                                         )
        //                                     }
        //                                     className="hover:bg-slate-50 w-full border border-gray-400 rounded px-3 py-2"
        //                                 />
        //                             </td>

        //                             <td className="px-2 py-4 text-center text-slate-600">
        //                                 {threshold.minPercent}% - {threshold.maxPercent}%
        //                             </td>
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>
        //             <div className='mt-3'>
        //                 <ErrorSuccessMsg
        //                     errorMsg={errorMsg}
        //                     successMsg={successMsg}
        //                     setSuccessMsg={setSuccessMsg}
        //                     close={closeMenu}
        //                 />
        //             </div>

        //             {/* <div className="mt-4 text-sm text-gray-600">
        //                 Edit the percentage ranges and click Update to save changes.
        //             </div> */}

        //         </div>

        //         {/* Footer */}
        //         <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-400 bg-gray-50">

        //             <button
        //                 onClick={closeMenu}
        //                 className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Cancel
        //             </button>

        //             <button
        //                 onClick={handleUpdate}
        //                 disabled={loading}
        //                 // className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        //                 className='px-4 py-1 rounded-lg text-lg font-medium cursor-pointer'
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 {loading ? 'Updating...' : 'Update'}
        //             </button>

        //         </div>

        //     </div>
        // </div>
    );
}

export default RubricsEditModal;