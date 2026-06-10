import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import { COLORS } from '../../constants/theme'

function AddSubjectForm({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [subjectId, setSubjectId] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [course, setCourse] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');
    const academicYearList = [];
    const d = new Date();

    for (let i = 2026; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }

    useEffect(() => {
        if (!successMsg) return;
        const timer = setTimeout(() => {
            setSuccessMsg("");
            setIsAddSubjectOpen(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [successMsg])

    const handleAddSubject = async () => {
        if (subjectId.length === 0 || subjectName.length === 0 || academicYear.length === 0 || course.length === 0) {
            setError("Please fill all the fields!");
            return;
        }
        setError('');
        try {
            const res = await axios.post('/sub/', {
                subjectId: subjectId,
                subjectName: subjectName,
                course: course,
                academicYear: academicYear
            });
            setSuccessMsg('Subject successfully added!');
            toggleUpdate();
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || handleAddSubject(): ', error);
        }
    }

    if (!isAddSubjectOpen) return null;

    return (
        <div>
            {/* Subject Code */}
            <div>
                <label className="block text-lg text-gray-700 mb-2 font-semibold">
                    Subject Code
                </label>
                <input
                    type="text"
                    placeholder="E.G. CA1603"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-1 text-lg outline-none"
                />
            </div>

            {/* Subject Name */}
            <div>
                <label className="block text-lg text-gray-700 mb-2 font-semibold">
                    Subject Name
                </label>
                <input
                    type="text"
                    placeholder="E.g. Software Engineering"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-1 text-lg outline-none"
                />
            </div>

            {/* Year */}
            <div>
                <label className="block text-lg text-gray-700 mb-2 font-semibold">
                    Academic Year
                </label>

                <div className="relative">
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
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
                <label className="block text-lg text-gray-700 mb-2 font-semibold">
                    Course Name
                </label>

                <div className="relative">
                    <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
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
                    onClick={() => setIsAddSubjectOpen(false)}
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
                    onClick={handleAddSubject}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Add
                </button>
            </div>

            <div>
                {error && (
                    <p className="text-red-500 text-sm ml-2">
                        {error}
                    </p>
                )}
                {successMsg && (
                    <p className="text-sm ml-2 flex">
                        <MdDone className='text-green-500 h-full w-5 mx-1 order rounded-full' />
                        {successMsg}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 mt-2 pt-2">
                <p className="text-red-500 text-md">
                    Note: Once a subject is created, Subject Code cannot be changed.
                </p>
            </div>
        </div>
    );
};

export default AddSubjectForm;