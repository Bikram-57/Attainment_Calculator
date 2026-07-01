import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { FaFilter } from "react-icons/fa";
import { COLORS } from '../../constants/theme';
import { Filters } from '../index';
import AddSubject from './AddSubject';

function SubjectHeader({ toggleUpdate, setSearchQuery, setFilterYear, setFilterCourse, setFilterSemester }) {
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
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

            <Filters
                showYear
                showCourse
                showSemester
                defaultYear={String(new Date().getFullYear())}
                isYearClearable={false}
                onYearChange={setFilterYear}
                onCourseChange={setFilterCourse}
                onSemesterChange={setFilterSemester}
            />

            <div className='flex gap-5 mx-10'>
                <div
                    className='border rounded-md flex items-center'
                >
                    <input
                        type='text'
                        placeholder='Search by subject code or name'
                        value={search}
                        className='border-r px-3 py-1 w-87.5 outline-none'
                        style={{
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
                        className='px-3 py-1 rounded-lg cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                        onClick={() => setIsAddSubjectOpen(true)}
                    >
                        Add Subject
                    </button>
                </div>
            </div>
            {isAddSubjectOpen &&
                <AddSubject
                    isAddSubjectOpen={isAddSubjectOpen}
                    setIsAddSubjectOpen={setIsAddSubjectOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default SubjectHeader