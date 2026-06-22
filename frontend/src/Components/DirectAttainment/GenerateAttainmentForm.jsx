import axios from 'axios';
import React, { useState } from 'react'
import ErrorSuccessMsg from '../ErrorSuccessMsg';
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme';

function GenerateAttainmentForm({ setIsGenerateOpen, toggleUpdate }) {
    const [course, setCourse] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const academicYearList = [];
    const d = new Date();

    for (let i = 2026; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }

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
        } catch (error) {
            console.log('ERROR || GenerateAttainmentForm || handleGenerate(): ', error);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b border-gray-200"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Generate Attainment
                    </h2>

                    <button
                        onClick={() => setIsGenerateOpen(false)}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
                    </button>
                </div>
                <div className="px-6 py-2 space-y-2">
                    {/* Academic Year */}
                    <div>
                        <label className="block text-lg text-gray-700 mt-2 font-semibold">
                            Academic Year
                        </label>

                        <div className="relative">
                            <select
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-md cursor-pointer outline-none"
                            >
                                <option value="">Select academic year from list</option>
                                {academicYearList.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Course Name */}
                    <div>
                        <label className="block text-lg text-gray-700 mt-2 font-semibold">
                            Course Name
                        </label>

                        <div className="relative">
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-md cursor-pointer outline-none"
                            >
                                <option value="">Select course from list</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                            </select>

                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsGenerateOpen(false)}
                            className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
                            style={{ color: COLORS.font }}
                        >
                            Close
                        </button>

                        <button
                            className="hover:bg-blue-900 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
                            style={{
                                color: COLORS.font,
                                backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint
                            }}
                            onClick={handleGenerate}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Generate
                        </button>
                    </div>

                    {/* Error/Success Message */}
                    <ErrorSuccessMsg
                        errorMsg={errorMsg}
                        successMsg={successMsg}
                        setSuccessMsg={setSuccessMsg}
                        setIsOpen={setIsGenerateOpen}
                    />
                </div>
            </div>
        </div>
    )
}

export default GenerateAttainmentForm