import React, { useState } from "react";
import axios from 'axios'
import { IoMdClose } from "react-icons/io";

function AddFacultyForm({ isOpen, setIsOpen, toggleUpdate }) {
    const [facultyId, setFacultyId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const password = "cadept@1234";

    if (!isOpen) return null;

    const handleAddFaculty = async () => {
        try {
            const res = await axios.post('/user/', {
                facultyId: facultyId,
                name: name,
                email: email,
                password: password
            });
            toggleUpdate();
            setIsOpen(false);
            console.log(res.data);
        } catch (err) {
            console.log('ERROR || handleAddFaculty(): ', err);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-5 right-4 text-gray-500 hover:text-black cursor-pointer"
                >
                    <IoMdClose className='w-6 h-6' />
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold mb-4">Add Faculty</h2>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Faculty Id <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                            value={facultyId}
                            onChange={(e) => setFacultyId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="text"
                            defaultValue={password}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gr ay-100"
                            disabled
                        // readOnly
                        />
                    </div>

                    {/* Note */}
                    <p className="text-sm text-red-500">
                        Note: The above given is the default password for the newly
                        created faculty which can be changed by the faculty from their
                        profile section.
                    </p>

                    {/* Submit */}
                    <button
                        className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800"
                        onClick={handleAddFaculty}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddFacultyForm;
