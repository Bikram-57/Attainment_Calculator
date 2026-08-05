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
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to add faculty!');
            console.log('ERROR || handleAddFaculty(): ', err);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-xl max-h-[95vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div
                    className="flex items-start justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 shrink-0"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div>

                        <h2
                            className="text-lg sm:text-xl font-semibold"
                            style={{ color: COLORS.font }}
                        >
                            Add Faculty
                        </h2>


                        <p
                            className="text-xs sm:text-sm opacity-90 mt-1"
                            style={{ color: COLORS.font }}
                        >
                            Create a new faculty account.
                        </p>

                    </div>


                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer shrink-0"
                    >
                        <IoMdClose
                            className="h-5 w-5 sm:h-6 sm:w-6"
                            style={{ color: COLORS.font }}
                        />
                    </button>

                </div>


                {/* Body */}
                <div
                    className="flex-1 overflow-y-auto space-y-3 px-4 sm:px-6 py-4"
                    style={{ backgroundColor: COLORS.latte }}
                >

                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Faculty ID
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. FAC001"
                            value={facultyId}
                            onChange={(e) => setFacultyId(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Faculty Name
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="john@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Default Password
                        </label>

                        <input
                            type="text"
                            value={password}
                            disabled
                            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </div>


                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">

                        <div className="order-2 sm:order-1">
                            <ErrorSuccessMsg
                                errorMsg={errorMsg}
                                successMsg={successMsg}
                                setSuccessMsg={setSuccessMsg}
                                setIsOpen={setIsOpen}
                            />
                        </div>


                        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>


                            <button
                                onClick={handleAddFaculty}
                                className="w-full sm:w-auto rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font
                                }}
                            >
                                Add Faculty
                            </button>

                        </div>

                    </div>


                    {/* Note */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">

                        <p className="text-xs sm:text-sm text-amber-800">
                            <span className="font-semibold">Note:</span> New faculty accounts are created with the default password shown above. Faculty members can change it later from their profile.
                        </p>

                    </div>

                </div>

            </div>

        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        //     onClick={() => setIsOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        //         onClick={(e) => e.stopPropagation()}
        //     >

        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-6 py-4"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <div>

        //                 <h2
        //                     className="text-xl font-semibold"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Add Faculty
        //                 </h2>

        //                 <p
        //                     className="text-sm opacity-90"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Create a new faculty account.
        //                 </p>

        //             </div>

        //             <button
        //                 onClick={() => setIsOpen(false)}
        //                 className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
        //             >
        //                 <IoMdClose
        //                     className="h-6 w-6"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>

        //         </div>

        //         {/* Body */}
        //         <div
        //             className="space-y-3 px-6 py-4"
        //             style={{ backgroundColor: COLORS.latte }}
        //         >

        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Faculty ID
        //                 </label>

        //                 <input
        //                     type="text"
        //                     placeholder="e.g. FAC001"
        //                     value={facultyId}
        //                     onChange={(e) => setFacultyId(e.target.value)}
        //                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Faculty Name
        //                 </label>

        //                 <input
        //                     type="text"
        //                     placeholder="e.g. John Doe"
        //                     value={name}
        //                     onChange={(e) => setName(e.target.value)}
        //                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Email Address
        //                 </label>

        //                 <input
        //                     type="email"
        //                     placeholder="john@college.edu"
        //                     value={email}
        //                     onChange={(e) => setEmail(e.target.value)}
        //                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-400"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Default Password
        //                 </label>

        //                 <input
        //                     type="text"
        //                     value={password}
        //                     disabled
        //                     className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
        //                 />
        //             </div>

        //             <div className="flex items-center justify-between pt-2">

        //                 <ErrorSuccessMsg
        //                     errorMsg={errorMsg}
        //                     successMsg={successMsg}
        //                     setSuccessMsg={setSuccessMsg}
        //                     setIsOpen={setIsOpen}
        //                 />

        //                 <div className="flex gap-3">

        //                     <button
        //                         onClick={() => setIsOpen(false)}
        //                         className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                     >
        //                         Cancel
        //                     </button>

        //                     <button
        //                         onClick={handleAddFaculty}
        //                         className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                         style={{
        //                             backgroundColor: COLORS.mint,
        //                             color: COLORS.font
        //                         }}
        //                     >
        //                         Add Faculty
        //                     </button>

        //                 </div>

        //             </div>

        //             <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
        //                 <p className="text-sm text-amber-800">
        //                     <span className="font-semibold">Note:</span> New faculty accounts are created with the default password shown above. Faculty members can change it later from their profile.
        //                 </p>
        //             </div>

        //         </div>

        //     </div>
        // </div>

        // <div
        //     className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        //     onClick={() => setIsOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Add Faculty
        //             </h2>

        //             <button
        //                 onClick={() => setIsOpen(false)}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
        //             </button>
        //         </div>

        //         {/* Form */}
        //         <div className="px-6 py-3 space-y-2">
        //             <div>
        //                 <label className="block text-lg font-medium">
        //                     Faculty Id <span className="text-red-500">*</span>
        //                 </label>
        //                 <input
        //                     type="text"
        //                     className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
        //                     value={facultyId}
        //                     onChange={(e) => setFacultyId(e.target.value)}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="block text-lg font-medium">
        //                     Name <span className="text-red-500">*</span>
        //                 </label>
        //                 <input
        //                     type="text"
        //                     className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
        //                     value={name}
        //                     onChange={(e) => setName(e.target.value)}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="block text-lg font-medium">
        //                     Email <span className="text-red-500">*</span>
        //                 </label>
        //                 <input
        //                     type="email"
        //                     className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
        //                     value={email}
        //                     onChange={(e) => setEmail(e.target.value)}
        //                 />
        //             </div>

        //             <div>
        //                 <label className="block text-lg font-medium">Password</label>
        //                 <input
        //                     type="text"
        //                     defaultValue={password}
        //                     className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gr ay-100"
        //                     disabled
        //                 />
        //             </div>

        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 setIsOpen={setIsOpen}
        //             />

        //             {/* Note */}
        //             <p className="text-sm text-red-500">
        //                 Note: The above given is the default password for the newly
        //                 created faculty which can be changed by the faculty from their
        //                 profile section.
        //             </p>

        //             {/* Submit */}
        //             <button
        //                 onMouseEnter={() => setIsHovered(true)}
        //                 onMouseLeave={() => setIsHovered(false)}
        //                 className="w-full py-2 rounded-lg cursor-pointer"
        //                 style={{
        //                     backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //                 onClick={handleAddFaculty}
        //             >
        //                 Add
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}

export default AddFacultyForm;
