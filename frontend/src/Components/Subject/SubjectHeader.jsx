import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { FaFilter } from "react-icons/fa";
import AddSubjectForm from './AddSubjectForm';
import { COLORS } from '../../constants/theme';
import AddAllSubjectsForm from './AddAllSubjectsForm';
import YearFilter from '../YearFilter';

function SubjectHeader({ toggleUpdate, setSearchQuery, setFilterYear }) {
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
    const [isAddAllSubjectOpen, setIsAddAllSubjectOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const handleChange = (e) => {
        if (e.target.value == '') {
            setSearchQuery('');
        }
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    }

    return (
        <div className='flex justify-between p-4'>
            <div
                className='text-xl font-semibold'
                style={{ color: COLORS.mint }}
            >
                All Subjects
            </div>

            <YearFilter setFilterYear={setFilterYear} />

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
                        onClick={() => setIsAddSubjectOpen(true)}
                    >
                        Add Subject
                    </button>
                    <button
                        // className='bg-blue-900 text-white px-3 py-1 rounded-lg cursor-pointer'
                        className='px-3 py-1 ml-2 rounded-lg cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                        onClick={() => setIsAddAllSubjectOpen(true)}
                    >
                        Add All Subjects
                    </button>
                </div>
            </div>
            {isAddSubjectOpen &&
                <AddSubjectForm
                    isAddSubjectOpen={isAddSubjectOpen}
                    setIsAddSubjectOpen={setIsAddSubjectOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
            {isAddAllSubjectOpen &&
                <AddAllSubjectsForm
                    isAddAllSubjectOpen={isAddAllSubjectOpen}
                    setIsAddAllSubjectOpen={setIsAddAllSubjectOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default SubjectHeader