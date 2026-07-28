import axios from 'axios';
import React, { useState } from 'react'
import { IoWarning } from "react-icons/io5";
import { COLORS } from '../../../constants/theme';

function RubricsDeleteModal({ data, toggleUpdate, closeMenu }) {
    const deleteRubrics = async () => {
        try {
            const res = await axios.delete('/rubrics/delete', {
                data: {
                    course: data.course,
                    year: data.year
                }
            });
            closeMenu();
            toggleUpdate();
            alert('Rubrics deleted successfully!');
        } catch (error) {
            console.log('Axios Error | RubricsDeleteModal | deleteRubrics(): ', error);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={closeMenu}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xl text-center"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                    <IoWarning className="h-12 w-12 sm:h-14 sm:w-14 text-yellow-500" />
                </div>

                {/* Title */}
                <h2
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: COLORS.mintDark }}
                >
                    Delete Rubrics
                </h2>

                {/* Message */}
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-red-600 wrap-break-word">
                    Are you sure you want to delete rubrics for
                    <br className="hidden sm:block" />
                    <span className="font-semibold">
                        {data.course} - {data.year}
                    </span>
                    ?
                    <br />
                    This action cannot be undone!
                </p>

                {/* Buttons */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4">
                    <button
                        onClick={closeMenu}
                        className="w-full sm:w-auto rounded-lg bg-gray-500 px-5 py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-gray-600 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={deleteRubrics}
                        className="w-full sm:w-auto rounded-lg bg-red-600 px-5 py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-red-700 cursor-pointer"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[90%] max-w-lg rounded-lg p-4 shadow-2xl text-center relative"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Warning Icon */}
        //         <div className="flex justify-center mb-2">
        //             <IoWarning className="text-yellow-500 w-12 h-12" />
        //         </div>

        //         {/* Title */}
        //         <h2
        //             className="text-2xl font-semibold mb-2"
        //             style={{ color: COLORS.mintDark }}
        //         >
        //             Delete Rubrics
        //         </h2>

        //         {/* Message */}
        //         <p className="text-red-600 text-xl leading-relaxed mb-4">
        //             Are you sure you want to delete rubrics for
        //             <br />
        //             {data.course} - {data.year}?
        //             <br />
        //             This action cannot be undone !
        //         </p>

        //         {/* Buttons */}
        //         <div className="flex justify-center gap-6">
        //             <button
        //                 onClick={closeMenu}
        //                 className="px-4 py-1 rounded-md bg-gray-500 text-white text-lg font-medium hover:bg-gray-600 transition cursor-pointer"
        //             >
        //                 Cancel
        //             </button>

        //             <button
        //                 onClick={deleteRubrics}
        //                 className="px-4 py-1 rounded-md bg-red-600 text-white text-lg font-medium hover:bg-red-700 transition cursor-pointer"
        //             >
        //                 Yes, Delete !
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}

export default RubricsDeleteModal