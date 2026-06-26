import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme';
import AddSubjectForm from './AddSubjectForm';
import AddAllSubjectsForm from './AddAllSubjectsForm';
import Select from 'react-select';

function AddSubject({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [addSingleSubject, setAddSingleSubject] = useState(true);

    const subjectAddOptions = [
        { value: true, label: 'Single subject' },
        { value: false, label: 'Multiple subjects' }
    ];

    if (!isAddSubjectOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b border-gray-200"
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
                
                {/* Body */}
                <div className="px-6 py-2 space-y-2">
                    <div>
                        <label className="block text-md text-gray-700 mb-1 font-semibold">
                            Subjects to add
                        </label>

                        <Select
                            options={subjectAddOptions}
                            placeholder='Select a year'
                            value={subjectAddOptions.find(option => (
                                option.value === addSingleSubject
                            ))}
                            onChange={selected => setAddSingleSubject(selected?.value)}
                            maxMenuHeight={100}
                        />
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