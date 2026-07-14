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
                course: data.course,
                year: data.year,
                thresholds
            });
            setSuccessMsg(res.data.message);
            toggleUpdate();

        } catch (error) {
            setErrorMsg(error?.response?.data?.message);
            console.error(
                'Axios Error | RubricsEditModal | handleUpdate(): ',
                error
            );
        } finally {
            setErrorMsg('');
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-auto"
            onClick={closeMenu}
        >
            <div
                className="w-[90%] max-w-2xl rounded-lg bg-white shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-5 border-b border-gray-300"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-2xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        {`Edit Rubrics: ${data.course} - ${data.year}`}
                    </h2>

                    <button
                        onClick={closeMenu}
                        className="cursor-pointer"
                    >
                        <IoMdClose
                            className="w-8 h-8"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">

                    <table className="w-full border border-gray-300">
                        <thead
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font
                            }}
                        >
                            <tr>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Min %</th>
                                <th className="px-4 py-3">Max %</th>
                                <th className="px-4 py-3">Range</th>
                            </tr>
                        </thead>

                        <tbody>
                            {thresholds.map((threshold, index) => (
                                <tr
                                    key={threshold.level}
                                    className="border-b border-gray-300"
                                >
                                    <td className="px-4 py-4 font-medium text-center">
                                        Level {threshold.level}
                                    </td>

                                    <td className="px-4 py-4 w-1/5">
                                        <input
                                            // type="text"
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            max={100}
                                            value={threshold.minPercent}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    'minPercent',
                                                    e.target.value
                                                )
                                            }
                                            className="hover:bg-slate-50 w-full border border-gray-400 rounded px-3 py-2"
                                        />
                                    </td>

                                    <td className="px-4 py-4 w-1/5">
                                        <input
                                            // type="text"
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            max={100}
                                            value={threshold.maxPercent}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    'maxPercent',
                                                    e.target.value
                                                )
                                            }
                                            className="hover:bg-slate-50 w-full border border-gray-400 rounded px-3 py-2"
                                        />
                                    </td>

                                    <td className="px-2 py-4 text-center text-slate-600">
                                        {threshold.minPercent}% - {threshold.maxPercent}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='mt-3'>
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                            close={closeMenu}
                        />
                    </div>

                    {/* <div className="mt-4 text-sm text-gray-600">
                        Edit the percentage ranges and click Update to save changes.
                    </div> */}

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-400 bg-gray-50">

                    <button
                        onClick={closeMenu}
                        className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
                        style={{ color: COLORS.font }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        // className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        className='px-4 py-1 rounded-lg text-lg font-medium cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default RubricsEditModal;