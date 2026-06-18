import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';
import { FaChevronDown } from "react-icons/fa";
import ErrorSuccessMsg from '../../ErrorSuccessMsg';

function SubjectEditModal({ data, toggleUpdate, closeMenu }) {
    const [subjectName, setSubjectName] = useState(data.subjectName);
    const [course, setCourse] = useState(data.course);
    const [isHovered, setIsHovered] = useState(false);
    const [academicYear, setAcademicYear] = useState(data.academicYear);
    const [semester, setSemester] = useState(data.semester || '');
    // const [course, setCourse] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const academicYearList = [];
    const semesterList = [];
    const d = new Date();

    for (let i = 2026; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }

    for (let i = 1; i <= 8; i++) {
        semesterList.push(i);
    }

    const updateSubject = async () => {
        if (subjectName.length === 0 || academicYear.length === 0 || semester.length === 0 || course.length === 0) {
            setErrorMsg("Please fill all the fields!");
            return;
        }
        setErrorMsg('');
        try {
            const res = await axios.put(`/sub/${data.subjectId}`, {
                subjectName,
                course,
                academicYear,
                semester
            });
            setSuccessMsg('Subject updated successfully!');
            toggleUpdate();
        } catch (error) {
            console.log('Axios Error | SubjectEditModal | updateSubject(): ', error);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
            onClick={closeMenu}
        >
            <div
                className="w-[90%] max-w-xl rounded-lg shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-2 border-b border-gray-300"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Subject Details
                    </h2>

                    <button
                        onClick={closeMenu}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-8 h-8' style={{ color: COLORS.font }} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">

                    {/* Subject ID */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Subject Id
                        </label>
                        <input
                            type="text"
                            value={data.subjectId}
                            readOnly
                            className="w-full border border-gray-400 rounded-lg px-4 py-1 text-md bg-gray-50 outline-none cursor-not-allowed"
                            style={{ backgroundColor: COLORS.latteDark }}
                        />
                    </div>

                    {/* Subject Name */}
                    <div>
                        <label className="block text-lg text-gray-700 my-1">
                            Subject Name
                        </label>
                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="w-full border border-gray-400 rounded-lg px-4 py-1 text-md bg-gray-50 outline-none"
                        // style={{backgroundColor: COLORS.latteDark}}
                        />
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-lg text-gray-700 my-1">
                            Academic Year
                        </label>

                        <div className="relative">
                            <select
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full appearance-none border border-gray-400 bg-gray-50 rounded-lg px-4 py-1 text-md cursor-pointer outline-none"
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

                    {/* Semester */}
                    <div>
                        <label className="block text-lg text-gray-700 my-1">
                            Semester
                        </label>

                        <div className="relative">
                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                className="w-full appearance-none border border-gray-400 bg-gray-50 rounded-lg px-4 py-1 text-md cursor-pointer outline-none"
                            >
                                <option value="">Select semester from list</option>
                                {semesterList.map(sem => (
                                    <option key={sem} value={sem}>
                                        {sem}
                                    </option>
                                ))}
                            </select>

                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Course Name */}

                    <div>
                        <label className="block text-lg text-gray-700 my-1">
                            Course
                        </label>
                        <input
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full border border-gray-400 rounded-lg px-4 py-1 text-md bg-gray-50 outline-none"
                        />
                    </div>
                    {/* <div>
                        <label className="block text-md text-gray-700 mt-2 font-semibold">
                            Course Name
                        </label>

                        <div className="relative">
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-sm cursor-pointer outline-none"
                            >
                                <option value="">Select course from list</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                            </select>

                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div> */}
                </div>

                {/* Error/Success Message */}
                <ErrorSuccessMsg
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                    setSuccessMsg={setSuccessMsg}
                    setIsOpen={closeMenu}
                />

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-300 flex justify-end">
                    <button
                        onClick={updateSubject}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="px-4 py-1 rounded-lg text-lg font-medium shadow cursor-pointer"
                        style={{
                            backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectEditModal