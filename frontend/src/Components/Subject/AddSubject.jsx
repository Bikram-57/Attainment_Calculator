import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme';
import AddSubjectForm from './AddSubjectForm';
import AddAllSubjectsForm from './AddAllSubjectsForm';

function AddSubject({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [addSingleSubject, setAddSingleSubject] = useState(true);

    if (!isAddSubjectOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
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
                        Add Subject
                    </h2>

                    <button
                        onClick={() => setIsAddSubjectOpen(false)}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
                    </button>
                </div>
                <div className="px-6 py-3 space-y-2">
                    <div>
                        <label className="block text-lg text-gray-700 mb-2 font-semibold">
                            Subjects to add
                        </label>

                        <div className="relative">
                            <select
                                value={addSingleSubject}
                                onChange={(e) => setAddSingleSubject(e.target.value === 'true')}
                                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
                            >
                                <option value='true'>Single subject</option>
                                <option value='false'>Multiple subjects</option>
                            </select>

                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {addSingleSubject &&
                        <AddSubjectForm
                            isAddSubjectOpen={isAddSubjectOpen}
                            setIsAddSubjectOpen={setIsAddSubjectOpen}
                            toggleUpdate={toggleUpdate}
                        />
                    }
                    {!addSingleSubject &&
                        <AddAllSubjectsForm
                            isAddSubjectOpen={isAddSubjectOpen}
                            setIsAddSubjectOpen={setIsAddSubjectOpen}
                            toggleUpdate={toggleUpdate}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default AddSubject