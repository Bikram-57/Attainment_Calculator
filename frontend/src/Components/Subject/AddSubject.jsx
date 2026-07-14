import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme';
import AddSubjectForm from './AddSubjectForm';
import AddMultipleSubjectsForm from './AddMultipleSubjectsForm';
import Select from 'react-select';

function AddSubject({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [addSingleSubject, setAddSingleSubject] = useState(true);

    const subjectAddOptions = [
        { value: true, label: 'Single subject' },
        { value: false, label: 'Multiple subjects' }
    ];

    if (!isAddSubjectOpen) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setIsAddSubjectOpen(false)}
        >
            <div
                className="w-[92%] max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: COLORS.font }}>
                            Add Subject
                        </h2>

                        <p className="text-sm opacity-90" style={{ color: COLORS.font }}>
                            Create a new subject or import multiple subjects.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddSubjectOpen(false)}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose className="h-6 w-6" style={{ color: COLORS.font }} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-3 pt-2 pb-4 px-6" style={{ backgroundColor: COLORS.latte }}>

                    <div>
                        <label
                            className="mb-2 block text-md font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Add Method
                        </label>

                        <Select
                            options={subjectAddOptions}
                            value={subjectAddOptions.find(option => option.value === addSingleSubject)}
                            onChange={selected => setAddSingleSubject(selected?.value)}
                            placeholder="Choose an option..."
                            maxMenuHeight={120}
                        />
                    </div>

                    <div className="border-t border-gray-400 pt-2">

                        {addSingleSubject ? (
                            <AddSubjectForm
                                isAddSubjectOpen={isAddSubjectOpen}
                                setIsAddSubjectOpen={setIsAddSubjectOpen}
                                toggleUpdate={toggleUpdate}
                            />
                        ) : (
                            <AddMultipleSubjectsForm
                                isAddSubjectOpen={isAddSubjectOpen}
                                setIsAddSubjectOpen={setIsAddSubjectOpen}
                                toggleUpdate={toggleUpdate}
                            />
                        )}

                    </div>

                </div>
            </div>
        </div>


        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        //     onClick={() => setIsAddSubjectOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-5 py-3 border-b border-gray-200"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Add Subject
        //             </h2>

        //             <button
        //                 onClick={() => setIsAddSubjectOpen(false)}
        //                 className="cursor-pointer"
        //             >
        //                 <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
        //             </button>
        //         </div>

        //         {/* Body */}
        //         <div className="px-6 py-2 space-y-2">
        //             <div>
        //                 <label className="block text-md text-gray-700 mb-1 font-semibold">
        //                     Subjects to add
        //                 </label>

        //                 <Select
        //                     options={subjectAddOptions}
        //                     placeholder='Select a year'
        //                     value={subjectAddOptions.find(option => (
        //                         option.value === addSingleSubject
        //                     ))}
        //                     onChange={selected => setAddSingleSubject(selected?.value)}
        //                     maxMenuHeight={100}
        //                 />
        //             </div>

        //             {addSingleSubject &&
        //                 <AddSubjectForm
        //                     isAddSubjectOpen={isAddSubjectOpen}
        //                     setIsAddSubjectOpen={setIsAddSubjectOpen}
        //                     toggleUpdate={toggleUpdate}
        //                 />
        //             }
        //             {!addSingleSubject &&
        //                 <AddMultipleSubjectsForm
        //                     isAddSubjectOpen={isAddSubjectOpen}
        //                     setIsAddSubjectOpen={setIsAddSubjectOpen}
        //                     toggleUpdate={toggleUpdate}
        //                 />
        //             }
        //         </div>
        //     </div>
        // </div>
    )
}

export default AddSubject