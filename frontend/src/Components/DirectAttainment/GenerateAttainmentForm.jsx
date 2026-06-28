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

    for (let i = 2026; i <= d.getFullYear(); i++) {
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
        } catch (error) {
            console.log('ERROR || GenerateAttainmentForm || handleGenerate(): ', error);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-[92%] max-w-lg max-h-1/2 pb-4 rounded-2xl shadow-2xl overflow-hidden"
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
                    <label className="block text-lg text-gray-700 mt-2 font-semibold">
                        Academic Year
                    </label>
                    <div className='flex-1'>
                        <Select
                            options={yearOptions}
                            placeholder='Select a year'
                            value={yearOptions.find(option => (
                                option.value === academicYear
                            ))}
                            onChange={selected => setAcademicYear(selected?.value || '')}
                            maxMenuHeight={100}
                        />
                    </div>
                    <label className="block text-lg text-gray-700 mt-5 font-semibold">
                        Course Name
                    </label>
                    <div className='flex-1'>
                        <Select
                            options={courseOptions}
                            placeholder='Select a course'
                            value={courseOptions.find(option => (
                                option.value === course
                            ))}
                            onChange={selected => setCourse(selected?.value || '')}
                            maxMenuHeight={100}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-2">
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