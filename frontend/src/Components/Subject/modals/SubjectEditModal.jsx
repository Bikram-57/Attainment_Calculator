import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';
import { FaChevronDown } from "react-icons/fa";
import { ErrorSuccessMsg } from '../../index';
import Select from 'react-select';

function SubjectEditModal({ data, toggleUpdate, closeMenu }) {
    const [subjectName, setSubjectName] = useState(data.subjectName);
    const [course, setCourse] = useState(data.course);
    const [academicYear, setAcademicYear] = useState(data.academicYear);
    const [semester, setSemester] = useState(data.semester || '');
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-default"
            onClick={closeMenu}
        >
            <div
                className="w-[92%] max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: COLORS.font }}>
                            Edit Subject
                        </h2>

                        <p className="text-sm opacity-90" style={{ color: COLORS.font }}>
                            Update subject information.
                        </p>
                    </div>

                    <button
                        onClick={closeMenu}
                        className="rounded-lg p-2 transition hover:bg-white/10"
                    >
                        <IoMdClose className="h-6 w-6" style={{ color: COLORS.font }} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-3 p-6" style={{ backgroundColor: COLORS.latte }}>

                    {/* Subject Code */}
                    <div>
                        <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
                            Subject Code
                        </label>

                        <input
                            type="text"
                            value={data.subjectId}
                            readOnly
                            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>

                    {/* Subject Name */}
                    <div>
                        <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
                            Subject Name
                        </label>

                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
                            Academic Year
                        </label>

                        <Select
                            options={yearOptions}
                            placeholder="Select year"
                            value={yearOptions.find(option => option.value === academicYear)}
                            onChange={selected => setAcademicYear(selected?.value || "")}
                            maxMenuHeight={120}
                        />
                    </div>

                    {/* Semester */}
                    <div>
                        <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
                            Semester
                        </label>

                        <Select
                            options={semesterOptions}
                            placeholder="Select semester"
                            value={semesterOptions.find(option => option.value === semester)}
                            onChange={selected => setSemester(selected?.value || "")}
                            maxMenuHeight={120}
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
                            Course
                        </label>

                        <Select
                            options={courseOptions}
                            placeholder="Select course"
                            value={courseOptions.find(option => option.value === course)}
                            onChange={selected => setCourse(selected?.value || "")}
                            maxMenuHeight={120}
                        />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                            setIsOpen={closeMenu}
                        />
                        <div className='flex gap-3'>
                            <button
                                onClick={closeMenu}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateSubject}
                                className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                Update Subject
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>


        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[90%] max-w-xl rounded-lg shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-4 py-2 border-b border-gray-300"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Subject Details
        //             </h2>

        //             <button
        //                 onClick={closeMenu}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose className='w-8 h-8' style={{ color: COLORS.font }} />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div className="p-5 space-y-3 text-left">

        //             {/* Subject ID */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 mb-1">
        //                     Subject Id
        //                 </label>
        //                 <input
        //                     type="text"
        //                     value={data.subjectId}
        //                     readOnly
        //                     className="w-full border border-gray-400 rounded-lg px-4 py-1 text-md bg-gray-50 outline-none cursor-not-allowed"
        //                     style={{ backgroundColor: COLORS.latteDark }}
        //                 />
        //             </div>

        //             {/* Subject Name */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 my-1">
        //                     Subject Name
        //                 </label>
        //                 <input
        //                     type="text"
        //                     value={subjectName}
        //                     onChange={(e) => setSubjectName(e.target.value)}
        //                     className="w-full border border-gray-400 rounded-lg px-4 py-1 text-md bg-gray-50 outline-none"
        //                 />
        //             </div>

        //             {/* Year */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 my-1">
        //                     Academic Year
        //                 </label>

        //                 <Select
        //                     options={yearOptions}
        //                     placeholder='Select a year'
        //                     value={yearOptions.find(option => (
        //                         option.value === academicYear
        //                     ))}
        //                     onChange={selected => setAcademicYear(selected?.value || '')}
        //                     maxMenuHeight={120}
        //                 />
        //             </div>

        //             {/* Semester */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 my-1">
        //                     Semester
        //                 </label>

        //                 <Select
        //                     options={semesterOptions}
        //                     placeholder='Select a semester'
        //                     value={semesterOptions.find(option => (
        //                         option.value === semester
        //                     ))}
        //                     onChange={selected => setSemester(selected?.value || '')}
        //                     maxMenuHeight={120}
        //                 />
        //             </div>

        //             {/* Course Name */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 my-1">
        //                     Course
        //                 </label>

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
        //         </div>

        //         {/* Error/Success Message */}
        //         <ErrorSuccessMsg
        //             errorMsg={errorMsg}
        //             successMsg={successMsg}
        //             setSuccessMsg={setSuccessMsg}
        //             setIsOpen={closeMenu}
        //         />

        //         {/* Footer */}
        //         <div className="px-4 py-5 border-t border-gray-300 flex justify-end">
        //             <button
        //                 onClick={updateSubject}
        //                 onMouseEnter={() => setIsHovered(true)}
        //                 onMouseLeave={() => setIsHovered(false)}
        //                 className="px-4 py-1 rounded-lg text-lg font-medium shadow cursor-pointer"
        //                 style={{
        //                     backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 Update
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
};

export default SubjectEditModal