import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import AssignSubjectForm from './AssignSubjectForm';
import { COLORS } from '../../constants/theme';
import { FaFilter } from "react-icons/fa";
import { Filters } from '../index';

function AssignSubjectsHeader({ toggleUpdate, setSearchQuery, currentYear, setFilterYear }) {
    const [isAssignSubjectOpen, setIsAssignSubjectOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [year, setYear] = useState('');
    const defaultYear = new Date().getFullYear();

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
            <div
                className='text-xl font-semibold'
                style={{ color: COLORS.mint }}
            >
                Assigned Subjects
            </div>

            <Filters
                showYear
                defaultYear='2026'
                isYearClearable={false}
                onYearChange={setFilterYear}
            />
            <div className='flex gap-5 mx-10'>
                <div className='border rounded-md flex items-center'>
                    <input
                        type='text'
                        placeholder='Search by faculty ID'
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