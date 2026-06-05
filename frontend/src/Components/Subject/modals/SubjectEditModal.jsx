import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function SubjectEditModal({ data, toggleUpdate, closeMenu }) {
    const [subjectName, setSubjectName] = useState(data.subjectName);
    const [course, setCourse] = useState(data.course);
    const [isHovered, setIsHovered] = useState(false);

    const updateSubject = async () => {
        try {
            const res = await axios.put(`/sub/${data.subjectId}`, {
                subjectName: subjectName,
                course: course
            });
            closeMenu();
            toggleUpdate();
            alert('Subject updated successfully!');
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
                style={{backgroundColor: COLORS.latte}}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-2 border-b border-gray-300"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-2xl font-semibold"
                        style={{color: COLORS.font}}
                    >
                        Subject Details
                    </h2>

                    <button
                        onClick={closeMenu}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-8 h-8' style={{color: COLORS.font}}/>
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
                            className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none cursor-not-allowed"
                            style={{backgroundColor: COLORS.latteDark}}
                        />
                    </div>

                    {/* Subject Name */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Subject Name
                        </label>
                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                            // style={{backgroundColor: COLORS.latteDark}}
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Course
                        </label>
                        <input
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                            // style={{backgroundColor: COLORS.latteDark}}
                        />
                    </div>
                </div>

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