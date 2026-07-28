import axios from 'axios';
import React, { useState } from 'react'
import { IoWarning } from "react-icons/io5";
import { COLORS } from '../../../constants/theme';

function SubjectDeleteModal({ data, toggleUpdate, closeMenu }) {
    const deleteSubject = async () => {
        try {
            const res = await axios.delete(`/sub/${data.subjectId}`)
            closeMenu();
            toggleUpdate();
            // alert('Subject deleted successfully!');
        } catch (error) {
            console.log('Axios Error | SubjectDeleteModal | deleteSubject(): ', error);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default p-3 sm:p-4"
            onClick={closeMenu}
        >
            <div
                className="w-full max-w-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl text-center relative"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Warning Icon */}
                <div className="flex justify-center mb-3">
                    <IoWarning className="text-yellow-500 w-10 h-10 sm:w-12 sm:h-12" />
                </div>


                {/* Title */}
                <h2
                    className="text-xl sm:text-2xl font-semibold mb-2"
                    style={{ color: COLORS.mintDark }}
                >
                    Delete Subject
                </h2>


                {/* Message */}
                <p className="text-red-600 text-base sm:text-xl leading-relaxed mb-5">
                    Are you sure you want to delete this subject?
                    <br />
                    This action cannot be undone!
                </p>


                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">

                    <button
                        onClick={closeMenu}
                        className="w-full sm:w-auto px-5 py-2 rounded-md bg-gray-500 text-white text-base sm:text-lg font-medium hover:bg-gray-600 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={deleteSubject}
                        className="w-full sm:w-auto px-5 py-2 rounded-md bg-red-600 text-white text-base sm:text-lg font-medium hover:bg-red-700 transition cursor-pointer"
                    >
                        Yes, Delete!
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
        //         style={{backgroundColor: COLORS.latte}}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Warning Icon */}
        //         <div className="flex justify-center mb-2">
        //             <IoWarning className="text-yellow-500 w-12 h-12" />
        //         </div>

        //         {/* Title */}
        //         <h2
        //             className="text-2xl font-semibold mb-2"
        //             style={{color: COLORS.mintDark}}
        //         >
        //             Delete Subject
        //         </h2>

        //         {/* Message */}
        //         <p className="text-red-600 text-xl leading-relaxed mb-4">
        //             Are you sure you want to delete this subject?
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
        //                 onClick={deleteSubject}
        //                 className="px-4 py-1 rounded-md bg-red-600 text-white text-lg font-medium hover:bg-red-700 transition cursor-pointer"
        //             >
        //                 Yes, Delete !
        //             </button>
        //         </div>
        //     </div>
        // </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[92%] max-w-md rounded-3xl p-6 text-center shadow-2xl"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         <div className="mb-4 flex justify-center">
        //             <IoWarning className="h-14 w-14 text-yellow-500" />
        //         </div>

        //         <h2
        //             className="text-2xl font-semibold"
        //             style={{ color: COLORS.mint }}
        //         >
        //             Delete Subject
        //         </h2>

        //         <p className="mt-3 text-gray-700">
        //             Are you sure you want to permanently delete
        //         </p>

        //         <div
        //             className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold"
        //             style={{ color: COLORS.mintDark }}
        //         >
        //             {data.subjectId}
        //         </div>

        //         <p className="mt-4 text-sm text-red-600">
        //             This action cannot be undone.
        //         </p>

        //         <div className="mt-6 flex justify-center gap-4">

        //             <button
        //                 onClick={closeMenu}
        //                 className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        //             >
        //                 Cancel
        //             </button>

        //             <button
        //                 onClick={deleteSubject}
        //                 className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
        //             >
        //                 Delete Subject
        //             </button>

        //         </div>

        //     </div>
        // </div>
    );
}

export default SubjectDeleteModal