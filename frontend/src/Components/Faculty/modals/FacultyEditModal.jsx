import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';

function FacultyEditModal({ data, toggleUpdate, closeMenu }) {
    const [name, setName] = useState(data.name);
    const [email, setEmail] = useState(data.email);
    const [isHovered, setIsHovered] = useState(false);

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
            console.log('Axios Error | FacultyEditModal | updateUser(): ', error);
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
                    className="flex items-center justify-between px-4 py-3"
                    style={{backgroundColor: COLORS.mint}}
                >
                    <h2
                        className="text-2xl font-semibold"
                        style={{color: COLORS.font}}
                    >
                        Faculty Details
                    </h2>

                    <button
                        onClick={closeMenu}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-8 h-8' style={{color: COLORS.font}} />
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
                            className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg outline-none cursor-not-allowed"
                            style={{backgroundColor: COLORS.latteDark}}
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


export default FacultyEditModal