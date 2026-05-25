import React, { useState } from 'react'
import { IoWarning } from "react-icons/io5";

function DeleteModal({ onDelete, onClose }) {
    // const [isOpen, setIsOpen] = useState(true);
    // if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-xl rounded-2xl bg-white p-8 shadow-2xl text-center relative">

                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                    {/* <div className="bg-yellow-100 p-3 rounded-full"> */}
                        <IoWarning className="text-yellow-500 w-14 h-14" />
                    {/* </div> */}
                </div>

                {/* Title */}
                <h2 className="text-4xl font-semibold text-blue-700 mb-4">
                    Delete Faculty
                </h2>

                {/* Message */}
                <p className="text-red-500 text-2xl leading-relaxed mb-8">
                    Are you sure you want to delete this faculty?
                    <br />
                    This action cannot be undone !
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-6">
                    <button
                        // onClick={() => setIsOpen(prev => !prev)}
                        onClick={onClose}
                        className="px-8 py-3 rounded-lg bg-gray-500 text-white text-xl font-medium hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onDelete}
                        className="px-8 py-3 rounded-lg bg-red-500 text-white text-xl font-medium hover:bg-red-600 transition"
                    >
                        Yes, Delete !
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal