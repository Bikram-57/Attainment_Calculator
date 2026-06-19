import axios from 'axios';
import React, { useState } from 'react'
import { IoWarning } from "react-icons/io5";
import { COLORS } from '../../../constants/theme';

function RubricsDeleteModal({ data, toggleUpdate, closeMenu }) {
    const deleteSubject = async () => {
        try {
            const res = await axios.delete(`/sub/${data.subjectId}`)
            closeMenu();
            toggleUpdate();
            alert('Subject deleted successfully!');
        } catch (error) {
            console.log('Axios Error | RubricsDeleteModal | deleteSubject(): ', error);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
            onClick={closeMenu}
        >
            <div
                className="w-[90%] max-w-lg rounded-lg p-4 shadow-2xl text-center relative"
                style={{backgroundColor: COLORS.latte}}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warning Icon */}
                <div className="flex justify-center mb-2">
                    <IoWarning className="text-yellow-500 w-12 h-12" />
                </div>

                {/* Title */}
                <h2
                    className="text-2xl font-semibold mb-2"
                    style={{color: COLORS.mintDark}}
                >
                    Delete Subject
                </h2>

                {/* Message */}
                <p className="text-red-600 text-xl leading-relaxed mb-4">
                    Are you sure you want to delete this subject?
                    <br />
                    This action cannot be undone !
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-6">
                    <button
                        onClick={closeMenu}
                        className="px-4 py-1 rounded-md bg-gray-500 text-white text-lg font-medium hover:bg-gray-600 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={deleteSubject}
                        className="px-4 py-1 rounded-md bg-red-600 text-white text-lg font-medium hover:bg-red-700 transition cursor-pointer"
                    >
                        Yes, Delete !
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RubricsDeleteModal