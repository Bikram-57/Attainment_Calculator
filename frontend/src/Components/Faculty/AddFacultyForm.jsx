import React, { useState } from "react";
import axios from 'axios'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";

function AddFacultyForm({ isOpen, setIsOpen, toggleUpdate }) {
    const [isHovered, setIsHovered] = useState(false);
    const [facultyId, setFacultyId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const password = "cadept@1234";
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleAddFaculty = async () => {
        if (facultyId.length === 0 || name.length === 0 || email.length === 0) {
            setErrorMsg('Please fill all the fields!');
            return;
        }
        setErrorMsg('');
        try {
            const res = await axios.post('/user/', {
                facultyId: facultyId,
                name: name,
                email: email,
                password: password
            });
            setSuccessMsg('Faculty successfully added!');
            toggleUpdate();
            console.log(res.data);
        } catch (err) {
            console.log('ERROR || handleAddFaculty(): ', err);
        }
    }

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
        >
            {/* <div
                className="w-full max-w-md rounded-2xl shadow-lg p-6 relative"
                style={{backgroundColor: COLORS.latte}}
            > */}
            {/* Close Button */}
            {/* <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-5 right-4 text-gray-500 hover:text-black cursor-pointer"
                >
                    <IoMdClose className='w-6 h-6' />
                </button> */}

            {/* Title */}
            {/* <h2 className="text-xl font-semibold mb-4">Add Faculty</h2> */}




            <div
                className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Add Faculty
                    </h2>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
                    </button>
                </div>




                {/* Form */}
                {/* <div className="space-y-4"> */}
                <div className="px-6 py-3 space-y-2">
                    <div>
                        <label className="block text-lg font-medium">
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
                        <label className="block text-lg font-medium">
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
                        <label className="block text-lg font-medium">
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
                        <label className="block text-lg font-medium">Password</label>
                        <input
                            type="text"
                            defaultValue={password}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gr ay-100"
                            disabled
                        // readOnly
                        />
                    </div>

                    <ErrorSuccessMsg
                        errorMsg={errorMsg}
                        successMsg={successMsg}
                        setSuccessMsg={setSuccessMsg}
                        setIsOpen={setIsOpen}
                    />

                    {/* Note */}
                    <p className="text-sm text-red-500">
                        Note: The above given is the default password for the newly
                        created faculty which can be changed by the faculty from their
                        profile section.
                    </p>

                    {/* Submit */}
                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="w-full py-2 rounded-lg cursor-pointer"
                        style={{
                            backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
                            color: COLORS.font
                        }}
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
