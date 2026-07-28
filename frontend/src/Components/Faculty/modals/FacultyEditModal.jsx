import axios from 'axios';
import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../../constants/theme';
import ErrorSuccessMsg from '../../../utils/ErrorSuccessMsg';

function FacultyEditModal({ data, toggleUpdate, closeMenu }) {
    const [name, setName] = useState(data.name);
    const [email, setEmail] = useState(data.email);
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const updateUser = async () => {
        if (name.length === 0 || email.length === 0) {
            setErrorMsg("Please fill all the fields!");
            return;
        }
        setErrorMsg('');
        try {
            const res = await axios.put(`/user/${data.facultyId}`, {
                name: name,
                email: email
            });
            setSuccessMsg('Faculty updated successfully!');
            toggleUpdate();
        } catch (error) {
            console.log('Axios Error | FacultyEditModal | updateUser(): ', error);
        }
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
            onClick={closeMenu}
        >
            <div
                className="w-full max-w-lg max-h-[95vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl flex flex-col"
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
                            Edit Faculty
                        </h2>


                        <p
                            className="text-xs sm:text-sm opacity-90 mt-1"
                            style={{ color: COLORS.font }}
                        >
                            Update faculty information.
                        </p>

                    </div>


                    <button
                        onClick={closeMenu}
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
                    className="flex-1 overflow-y-auto space-y-3 p-4 sm:p-6"
                    style={{ backgroundColor: COLORS.latte }}
                >

                    {/* Faculty ID */}
                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Faculty ID
                        </label>

                        <input
                            type="text"
                            value={data.facultyId}
                            readOnly
                            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    {/* Name */}
                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    {/* Email */}
                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                    </div>


                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">

                        <div className="order-2 sm:order-1">
                            <ErrorSuccessMsg
                                errorMsg={errorMsg}
                                successMsg={successMsg}
                                setSuccessMsg={setSuccessMsg}
                                setIsOpen={closeMenu}
                            />
                        </div>


                        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                            <button
                                onClick={closeMenu}
                                className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>


                            <button
                                onClick={updateUser}
                                className="w-full sm:w-auto rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                Update Faculty
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[92%] max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        //         onClick={(e) => e.stopPropagation()}
        //     >

        //         {/* Header */}
        //         <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: COLORS.mint }}>
        //             <div>
        //                 <h2 className="text-xl font-semibold" style={{ color: COLORS.font }}>
        //                     Edit Faculty
        //                 </h2>

        //                 <p className="text-sm opacity-90" style={{ color: COLORS.font }}>
        //                     Update faculty information.
        //                 </p>
        //             </div>

        //             <button
        //                 onClick={closeMenu}
        //                 className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
        //             >
        //                 <IoMdClose className="h-6 w-6" style={{ color: COLORS.font }} />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div className="space-y-3 p-6" style={{ backgroundColor: COLORS.latte }}>

        //             {/* Faculty ID */}
        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Faculty ID
        //                 </label>

        //                 <input
        //                     type="text"
        //                     value={data.facultyId}
        //                     readOnly
        //                     className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             {/* Name */}
        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Name
        //                 </label>

        //                 <input
        //                     type="text"
        //                     value={name}
        //                     onChange={(e) => setName(e.target.value)}
        //                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             {/* Email */}
        //             <div>
        //                 <label className="mb-1 block text-sm font-semibold" style={{ color: COLORS.mintDark }}>
        //                     Email
        //                 </label>

        //                 <input
        //                     type="email"
        //                     value={email}
        //                     onChange={(e) => setEmail(e.target.value)}
        //                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        //                     style={{ color: COLORS.mintDark }}
        //                 />
        //             </div>

        //             <div className="flex justify-between items-center pt-2">
        //                 <ErrorSuccessMsg
        //                     errorMsg={errorMsg}
        //                     successMsg={successMsg}
        //                     setSuccessMsg={setSuccessMsg}
        //                     setIsOpen={closeMenu}
        //                 />

        //                 <div className="flex gap-3">
        //                     <button
        //                         onClick={closeMenu}
        //                         className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                     >
        //                         Cancel
        //                     </button>

        //                     <button
        //                         onClick={updateUser}
        //                         className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                         style={{
        //                             backgroundColor: COLORS.mint,
        //                             color: COLORS.font,
        //                         }}
        //                     >
        //                         Update Faculty
        //                     </button>
        //                 </div>
        //             </div>

        //         </div>

        //     </div>
        // </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
        //     onClick={closeMenu}
        // >
        //     <div
        //         className="w-[90%] max-w-xl rounded-lg shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-4 py-3"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-2xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Faculty Details
        //             </h2>

        //             <button
        //                 onClick={closeMenu}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose className='w-8 h-8' style={{ color: COLORS.font }} />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div className="p-4 space-y-3">

        //             {/* Faculty ID */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 mb-1">
        //                     Faculty Id
        //                 </label>
        //                 <input
        //                     type="text"
        //                     value={data.facultyId}
        //                     readOnly
        //                     className="w-full border border-gray-400 rounded-lg px-4 py-3 text-lg outline-none cursor-not-allowed"
        //                     style={{ backgroundColor: COLORS.latteDark }}
        //                 />
        //             </div>

        //             {/* Name */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 mb-1">
        //                     Name
        //                 </label>
        //                 <input
        //                     type="text"
        //                     value={name}
        //                     onChange={(e) => setName(e.target.value)}
        //                     className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
        //                 />
        //             </div>

        //             {/* Email */}
        //             <div>
        //                 <label className="block text-lg text-gray-700 mb-1">
        //                     Email
        //                 </label>
        //                 <input
        //                     type="email"
        //                     value={email}
        //                     onChange={(e) => setEmail(e.target.value)}
        //                     className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
        //                 />
        //             </div>
        //         </div>

        //         {/* Footer */}
        //         <div className="flex justify-between items-center pt-2">
        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 setIsOpen={closeMenu}
        //             />
        //             <div className='flex gap-3'>
        //                 <button
        //                     onClick={closeMenu}
        //                     className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                 >
        //                     Cancel
        //                 </button>

        //                 <button
        //                     onClick={updateUser}
        //                     className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font,
        //                     }}
        //                 >
        //                     Update Subject
        //                 </button>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
};


export default FacultyEditModal