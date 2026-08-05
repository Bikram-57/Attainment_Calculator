import axios from 'axios';
import React, { useState } from 'react'
import { IoWarning } from "react-icons/io5";
import { COLORS } from '../../../constants/theme';

function FacultyDeleteModal({ data, toggleUpdate, closeMenu }) {
    const deleteUser = async () => {
        try {
            const res = await axios.delete(`/user/${data.facultyId}`)
            closeMenu();
            toggleUpdate();
        } catch (err) {
            console.log(err?.response?.data?.message || err?.response?.data?.error || 'Failed to delete user!');
            console.log('Axios Error | FacultyDeleteModal | deleteUser(): ', err);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default p-3 sm:p-4"
            onClick={closeMenu}
        >
            <div
                className="w-full max-w-lg rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-2xl text-center relative"
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
                    Delete Faculty
                </h2>


                {/* Message */}
                <p className="text-red-600 text-base sm:text-xl leading-relaxed mb-5">
                    Are you sure you want to delete this faculty?
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
                        onClick={deleteUser}
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
        //         className="w-[90%] max-w-lg rounded-lg bg-white p-4 shadow-2xl text-center relative"
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Warning Icon */}
        //         <div className="flex justify-center mb-2">
        //             <IoWarning className="text-yellow-500 w-12 h-12" />
        //         </div>

        //         {/* Title */}
        //         <h2
        //             className="text-2xl font-semibold text-blue-900 mb-2"
        //             style={{color: COLORS.mintDark}}
        //         >
        //             Delete Faculty
        //         </h2>

        //         {/* Message */}
        //         <p className="text-red-600 text-xl leading-relaxed mb-4">
        //             Are you sure you want to delete this faculty?
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
        //                 onClick={deleteUser}
        //                 className="px-4 py-1 rounded-md bg-red-600 text-white text-lg font-medium hover:bg-red-700 transition cursor-pointer"
        //             >
        //                 Yes, Delete !
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}

export default FacultyDeleteModal