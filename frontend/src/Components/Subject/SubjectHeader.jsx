import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import AddSubjectForm from './AddSubjectForm';
import { COLORS } from '../../constants/theme';

function SubjectHeader({ toggleUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    // const mintShade = '#00A19B';
    // const mintDarkShade = '#008985';
    // const latteShade = '#fffaf3';
    // const latteDarkShade = '#e4ddd3';
    // const fontShade = '#ffffff';

    return (
        <div className='flex justify-between p-4'>
            {/* <div className='text-blue-900 text-xl font-semibold'>All Subjects</div> */}
            <div
                className='text-xl font-semibold'
                style={{color: COLORS.mint}}
            >
                All Subjects
            </div>
            <div className='flex gap-5 mx-10'>
                {/* <div className='border border-gray-300 rounded-md flex items-center'> */}
                <div
                    className='border rounded-md flex items-center'
                    style={{borderColor: COLORS.mintDark}}
                >
                    <input
                        type='text'
                        placeholder='Search by subject code or name'

                        // className='border-r border-gray-300 px-3 py-1 w-87.5'
                        // className='border-r-4 border-r-red-200 px-3 py-1 w-87.5'
                        className='border-r px-3 py-1 w-87.5 outline-none'
                        style={{
                            borderRightColor: COLORS.mintDark,
                            color: COLORS.mintDark
                        }}
                    />
                    <div className='px-3 py-1 cursor-pointer'>
                        <BsSearch style={{color: COLORS.mintDark}}/>
                    </div>
                </div>
                <div>
                    <button
                        // className='bg-blue-900 text-white px-3 py-1 rounded-lg cursor-pointer'
                        className='px-3 py-1 rounded-lg cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
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