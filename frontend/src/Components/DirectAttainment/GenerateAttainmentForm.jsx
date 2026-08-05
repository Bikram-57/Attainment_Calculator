import axios from 'axios';
import React, { useState } from 'react'
import { ErrorSuccessMsg } from '../index';
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme';
import Select from 'react-select';

function GenerateAttainmentForm({ setIsGenerateOpen, toggleUpdate }) {
    const [course, setCourse] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const academicYearList = [];
    const d = new Date();

    for (let i = 2024; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }

    const yearOptions = academicYearList.map(year => (
        {
            value: year,
            label: year
        }
    ));

    const courseOptions = [
        { value: 'BCA', label: 'BCA' },
        { value: 'MCA', label: 'MCA' }
    ];

    const handleGenerate = async () => {
        if (course.length === 0 || academicYear.length === 0) {
            setErrorMsg("Please fill all the fields!");
            return;
        }
        setErrorMsg('');
        try {
            const res = await axios.post('/dir/', {
                course,
                academicYear
            });
            setSuccessMsg('Attainment generated successfully!');
            console.log(res.data);
            toggleUpdate();
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to generate attainment!');;
            console.log('ERROR || GenerateAttainmentForm || handleGenerate(): ', err);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setIsGenerateOpen(false)}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl shadow-2xl sm:max-w-lg"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div className="min-w-0">
                        <h2
                            className="text-lg font-semibold sm:text-xl"
                            style={{ color: COLORS.font }}
                        >
                            Generate Attainment
                        </h2>

                        <p
                            className="mt-1 text-sm opacity-90"
                            style={{ color: COLORS.font }}
                        >
                            Generate direct attainment for a selected batch.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsGenerateOpen(false)}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose
                            className="h-6 w-6"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
                    style={{ backgroundColor: COLORS.latte }}
                >
                    {/* Academic Year */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Academic Year
                        </label>

                        <Select
                            options={yearOptions}
                            placeholder="Select year"
                            value={yearOptions.find(
                                (option) => option.value === academicYear
                            )}
                            onChange={(selected) =>
                                setAcademicYear(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Course
                        </label>

                        <Select
                            options={courseOptions}
                            placeholder="Select course"
                            value={courseOptions.find(
                                (option) => option.value === course
                            )}
                            onChange={(selected) =>
                                setCourse(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t border-gray-300 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0 flex-1">
                            <ErrorSuccessMsg
                                errorMsg={errorMsg}
                                successMsg={successMsg}
                                setSuccessMsg={setSuccessMsg}
                                setIsOpen={setIsGenerateOpen}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">

                            <button
                                onClick={() => setIsGenerateOpen(false)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleGenerate}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="w-full rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
                                style={{
                                    backgroundColor: isHovered
                                        ? COLORS.mintDark
                                        : COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                Generate
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        //     onClick={() => setIsGenerateOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-lg overflow-hidden rounded-3xl shadow-2xl"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-6 py-4"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <div>
        //                 <h2
        //                     className="text-xl font-semibold"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Generate Attainment
        //                 </h2>

        //                 <p
        //                     className="text-sm opacity-90"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Generate direct attainment for a selected batch.
        //                 </p>
        //             </div>

        //             <button
        //                 onClick={() => setIsGenerateOpen(false)}
        //                 className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
        //             >
        //                 <IoMdClose
        //                     className="h-6 w-6"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div
        //             className="space-y-5 px-6 py-5"
        //             style={{ backgroundColor: COLORS.latte }}
        //         >
        //             {/* Academic Year */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Academic Year
        //                 </label>

        //                 <Select
        //                     options={yearOptions}
        //                     placeholder="Select year"
        //                     value={yearOptions.find(
        //                         option => option.value === academicYear
        //                     )}
        //                     onChange={selected =>
        //                         setAcademicYear(selected?.value || "")
        //                     }
        //                     maxMenuHeight={120}
        //                 />
        //             </div>

        //             {/* Course */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Course
        //                 </label>

        //                 <Select
        //                     options={courseOptions}
        //                     placeholder="Select course"
        //                     value={courseOptions.find(
        //                         option => option.value === course
        //                     )}
        //                     onChange={selected =>
        //                         setCourse(selected?.value || "")
        //                     }
        //                     maxMenuHeight={80}
        //                 />
        //             </div>

        //             {/* Footer */}
        //             <div className="flex items-center justify-between border-t border-gray-300 pt-5">
        //                 <ErrorSuccessMsg
        //                     errorMsg={errorMsg}
        //                     successMsg={successMsg}
        //                     setSuccessMsg={setSuccessMsg}
        //                     setIsOpen={setIsGenerateOpen}
        //                 />

        //                 <div className="flex gap-3">
        //                     <button
        //                         onClick={() => setIsGenerateOpen(false)}
        //                         className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                     >
        //                         Cancel
        //                     </button>

        //                     <button
        //                         onClick={handleGenerate}
        //                         onMouseEnter={() => setIsHovered(true)}
        //                         onMouseLeave={() => setIsHovered(false)}
        //                         className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                         style={{
        //                             backgroundColor: isHovered
        //                                 ? COLORS.mintDark
        //                                 : COLORS.mint,
        //                             color: COLORS.font,
        //                         }}
        //                     >
        //                         Generate
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        //     onClick={() => setIsGenerateOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-lg max-h-1/2 pb-4 rounded-2xl shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-5 py-3 border-b border-gray-200"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Generate Attainment
        //             </h2>

        //             <button
        //                 onClick={() => setIsGenerateOpen(false)}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
        //             </button>
        //         </div>
        //         <div className="px-6 py-2 space-y-2">
        //             <label className="block text-lg text-gray-700 mt-2 font-semibold">
        //                 Academic Year
        //             </label>
        //             <div className='flex-1'>
        //                 <Select
        //                     options={yearOptions}
        //                     placeholder='Select a year'
        //                     value={yearOptions.find(option => (
        //                         option.value === academicYear
        //                     ))}
        //                     onChange={selected => setAcademicYear(selected?.value || '')}
        //                     maxMenuHeight={100}
        //                 />
        //             </div>
        //             <label className="block text-lg text-gray-700 mt-5 font-semibold">
        //                 Course Name
        //             </label>
        //             <div className='flex-1'>
        //                 <Select
        //                     options={courseOptions}
        //                     placeholder='Select a course'
        //                     value={courseOptions.find(option => (
        //                         option.value === course
        //                     ))}
        //                     onChange={selected => setCourse(selected?.value || '')}
        //                     maxMenuHeight={100}
        //                 />
        //             </div>

        //             {/* Buttons */}
        //             <div className="flex justify-end gap-3 mt-8 pt-2">
        //                 <button
        //                     onClick={() => setIsGenerateOpen(false)}
        //                     className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Close
        //                 </button>

        //                 <button
        //                     className="hover:bg-blue-900 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                     style={{
        //                         color: COLORS.font,
        //                         backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint
        //                     }}
        //                     onClick={handleGenerate}
        //                     onMouseEnter={() => setIsHovered(true)}
        //                     onMouseLeave={() => setIsHovered(false)}
        //                 >
        //                     Generate
        //                 </button>
        //             </div>

        //             {/* Error/Success Message */}
        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 setIsOpen={setIsGenerateOpen}
        //             />
        //         </div>
        //     </div>
        // </div>
    )
}

export default GenerateAttainmentForm