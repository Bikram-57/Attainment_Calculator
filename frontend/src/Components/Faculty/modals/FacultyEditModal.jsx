import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";

function FacultyEditModal({ data, toggleUpdate, closeMenu }) {
    const [name, setName] = useState(data.name);
    const [email, setEmail] = useState(data.email);

    const updateUser = async () => {
        try {
            const res = await axios.put(`/user/${data.facultyId}`, {
                name: name,
                email: email
            });
            closeMenu();
            toggleUpdate();
            alert('Faculty updated successfully!');
        } catch (error) {

        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-default"
            onClick={closeMenu}
        >
            <div
                className="w-[90%] max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
                    <h2 className="text-2xl font-semibold text-blue-900">
                        Faculty Details
                    </h2>

                    <button
                        onClick={closeMenu}
                        className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    >
                        <IoMdClose className='w-8 h-8' />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">

                    {/* Faculty ID */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Faculty Id
                        </label>
                        <input
                            type="text"
                            value={data.facultyId}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-300 flex justify-end">
                    <button
                        onClick={updateUser}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1 rounded-lg text-lg font-medium shadow cursor-pointer"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};


export default FacultyEditModal