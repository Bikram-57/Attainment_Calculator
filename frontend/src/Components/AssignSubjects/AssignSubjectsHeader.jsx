import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import AssignSubjectForm from './AssignSubjectForm';
import { COLORS } from '../../constants/theme';

function AssignSubjectsHeader({ toggleUpdate, setSearchQuery, currentYear, setFilterYear }) {
    const [isAssignSubjectOpen, setIsAssignSubjectOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [year, setYear] = useState('');

    
    const yearList = [2025, 2024];

    const handleYear = (e) => {
        setYear(e.target.value);
        setFilterYear(e.target.value);
    }

    const handleChange = (e) => {
        if (e.target.value == '') {
            setSearchQuery('');
        }
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    }

    return (
        <div className='flex justify-between p-4'>
            {/* <div className='text-blue-900 text-xl font-semibold'>All Subjects</div> */}
            <div
                className='text-xl font-semibold'
                style={{ color: COLORS.mint }}
            >
                Assigned Subjects
            </div>
            <div className="w-1/8 flex items-center gap-2">
                <div>
                    Filter:
                </div>
                <div className='w-1/2'>
                    <select
                        value={year}
                        onChange={(e) => handleYear(e)}
                        className="w-full border border-gray-400 text-center rounded-lg px-2 text-md cursor-pointer outline-none"
                    >
                        <option value={currentYear}>{currentYear}</option>
                        {yearList.map(y => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='flex gap-5 mx-10'>
                {/* <div className='border border-gray-300 rounded-md flex items-center'> */}
                <div
                    className='border rounded-md flex items-center'
                // style={{ borderColor: COLORS.mintDark }}
                >
                    <input
                        type='text'
                        placeholder='Search by subject code or name'
                        value={search}
                        // className='border-r border-gray-300 px-3 py-1 w-87.5'
                        // className='border-r-4 border-r-red-200 px-3 py-1 w-87.5'
                        className='border-r px-3 py-1 w-87.5 outline-none'
                        style={{
                            // borderRightColor: COLORS.mintDark,
                            color: COLORS.mintDark
                        }}
                        onChange={(e) => handleChange(e)}
                    />
                    <div
                        className='px-3 py-1 cursor-pointer'
                        onClick={() => setSearchQuery(search)}
                    >
                        <BsSearch style={{ color: COLORS.mintDark }} />
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
                        onClick={() => setIsAssignSubjectOpen(true)}
                    >
                        Assign Subject
                    </button>
                </div>
            </div>
            {isAssignSubjectOpen &&
                <AssignSubjectForm
                    isAssignSubjectOpen={isAssignSubjectOpen}
                    setIsAssignSubjectOpen={setIsAssignSubjectOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default AssignSubjectsHeader