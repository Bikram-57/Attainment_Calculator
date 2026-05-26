import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import AddSubjectForm from './AddSubjectForm';

function SubjectHeader({ toggleUpdate }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className='flex justify-between p-4'>
            <div className='text-blue-900 text-xl font-semibold'>All Subjects</div>
            <div className='flex gap-5 mx-10'>
                <div className='border border-gray-300 rounded-md flex items-center'>
                    <input
                        type='text'
                        placeholder='Search by subject code or name'

                        className='border-r border-gray-300 px-3 py-1 w-87.5'
                    />
                    <div className='px-3 py-1 cursor-pointer'>
                        <BsSearch />
                    </div>
                </div>
                <div>
                    <button
                        className='bg-blue-900 text-white px-3 py-1 rounded-lg cursor-pointer'
                        onClick={() => setIsOpen(true)}
                    >
                        Add Subject
                    </button>
                </div>
            </div>
            {isOpen && 
                <AddSubjectForm
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default SubjectHeader