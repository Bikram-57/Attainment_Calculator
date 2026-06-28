import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";
import Select from 'react-select';

function AddSubjectForm({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [subjectId, setSubjectId] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [course, setCourse] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const academicYearList = [];
    const semesterList = [];
    const d = new Date();

    for (let i = 2024; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }


    for (let i = 1; i <= 8; i++) {
        semesterList.push(i);
    }

    const yearOptions = academicYearList.map(year => (
        {
            value: year,
            label: year
        }
    ));

    const semesterOptions = semesterList.map(sem => (
        {
            value: sem,
            label: sem
        }
    ));

    const courseOptions = [
        { value: 'BCA', label: 'BCA' },
        { value: 'MCA', label: 'MCA' }
    ];

    const handleAddSubject = async () => {
        if (subjectId.length === 0 || subjectName.length === 0 || academicYear.length === 0 || semester.length === 0 || course.length === 0) {
            setErrorMsg("Please fill all the fields!");
            return;
        }
        setErrorMsg('');
        try {
            const res = await axios.post('/sub/', {
                subjectId: subjectId,
                subjectName: subjectName,
                course: course,
                academicYear: academicYear,
                semester: semester
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
                <label className="block text-md text-gray-700 mt-2 font-semibold">
                    Subject Code
                </label>
                <input
                    type="text"
                    placeholder="E.G. CA1603"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-1 text-sm outline-none"
                />
            </div>

            {/* Subject Name */}
            <div>
                <label className="block text-md text-gray-700 mt-2 font-semibold">
                    Subject Name
                </label>
                <input
                    type="text"
                    placeholder="E.g. Software Engineering"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-1 text-sm outline-none"
                />
            </div>

            {/* Year */}
            <div>
                <label className="block text-md text-gray-700 mt-2 font-semibold">
                    Academic Year
                </label>

                <Select
                    options={yearOptions}
                    placeholder='Select a year'
                    value={yearOptions.find(option => (
                        option.value === academicYear
                    ))}
                    onChange={selected => setAcademicYear(selected?.value || '')}
                    maxMenuHeight={120}
                />
            </div>

            {/* Semester */}
            <div>
                <label className="block text-md text-gray-700 mt-2 font-semibold">
                    Semester
                </label>

                <Select
                    options={semesterOptions}
                    placeholder='Select a semester'
                    value={semesterOptions.find(option => (
                        option.value === semester
                    ))}
                    onChange={selected => setSemester(selected?.value || '')}
                    maxMenuHeight={120}
                />
            </div>

            {/* Course Name */}
            <div>
                <label className="block text-md text-gray-700 mt-2 font-semibold">
                    Course Name
                </label>

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

            {/* Error/Success Message */}
            <ErrorSuccessMsg
                errorMsg={errorMsg}
                successMsg={successMsg}
                setSuccessMsg={setSuccessMsg}
                setIsOpen={setIsAddSubjectOpen}
            />

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