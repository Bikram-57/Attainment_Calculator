import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import AssignSubjectForm from './AssignSubjectForm';
import { COLORS } from '../../constants/theme';
import { FaFilter } from "react-icons/fa";
import { MdOutlineCancelPresentation } from "react-icons/md";
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

    const handleClear = () => {
        setSearch('');
        setSearchQuery('')
    }

    return (
        // <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 px-4 sm:px-6 py-4 bg-white border-b border-gray-200">

        //     {/* Left */}
        //     <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">

        //         <h2
        //             className="text-lg sm:text-xl font-semibold whitespace-nowrap"
        //             style={{ color: COLORS.mint }}
        //         >
        //             Assigned Subjects
        //         </h2>


        //         <div className="relative w-full sm:w-96">

        //             <BsSearch
        //                 className="absolute left-3 top-1/2 -translate-y-1/2"
        //                 style={{ color: COLORS.mintDark }}
        //             />

        //             <input
        //                 type="text"
        //                 placeholder="Search by faculty or subject..."
        //                 value={search}
        //                 onChange={handleChange}
        //                 className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 transition"
        //                 style={{
        //                     color: COLORS.mintDark,
        //                     "--tw-ring-color": COLORS.mint,
        //                 }}
        //             />


        //             {search.length > 0 && (
        //                 <MdOutlineCancelPresentation
        //                     className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 cursor-pointer"
        //                     onClick={handleClear}
        //                 />
        //             )}

        //         </div>

        //     </div>


        //     {/* Right */}
        //     <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">

        //         <div className="w-full sm:w-auto overflow-x-auto">
        //             <Filters
        //                 showYear
        //                 defaultYear={String(new Date().getFullYear())}
        //                 isYearClearable={false}
        //                 onYearChange={setFilterYear}
        //             />
        //         </div>


        //         <button
        //             onClick={() => setIsAssignSubjectOpen(true)}
        //             className="w-full sm:w-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 hover:shadow-md cursor-pointer whitespace-nowrap"
        //             style={{
        //                 backgroundColor: COLORS.mint,
        //                 color: COLORS.font,
        //             }}
        //         >
        //             + Assign Subject
        //         </button>

        //     </div>


        //     {isAssignSubjectOpen && (
        //         <AssignSubjectForm
        //             isAssignSubjectOpen={isAssignSubjectOpen}
        //             setIsAssignSubjectOpen={setIsAssignSubjectOpen}
        //             toggleUpdate={toggleUpdate}
        //         />
        //     )}

        // </div>

        <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-gray-200">

            {/* Left */}
            <div className="flex items-center gap-6">

                <h2
                    className="text-xl font-semibold whitespace-nowrap"
                    style={{ color: COLORS.mint }}
                >
                    Assigned Subjects
                </h2>

                <div className="relative">

                    <BsSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: COLORS.mintDark }}
                    />

                    <input
                        type="text"
                        placeholder="Search by faculty or subject..."
                        value={search}
                        onChange={handleChange}
                        className="w-96 rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 transition"
                        style={{
                            color: COLORS.mintDark,
                            "--tw-ring-color": COLORS.mint,
                        }}
                    />
                    {search.length > 0 &&
                        <MdOutlineCancelPresentation
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer"
                            onClick={handleClear}
                        />
                    }
                </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-4">

                <Filters
                    showYear
                    defaultYear={String(new Date().getFullYear())}
                    isYearClearable={false}
                    onYearChange={setFilterYear}
                />

                <button
                    onClick={() => setIsAssignSubjectOpen(true)}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 hover:shadow-md cursor-pointer"
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    + Assign Subject
                </button>

            </div>

            {isAssignSubjectOpen && (
                <AssignSubjectForm
                    isAssignSubjectOpen={isAssignSubjectOpen}
                    setIsAssignSubjectOpen={setIsAssignSubjectOpen}
                    toggleUpdate={toggleUpdate}
                />
            )}

        </div>


        // <div className='flex justify-between p-4'>
        //     <div
        //         className='text-xl font-semibold'
        //         style={{ color: COLORS.mint }}
        //     >
        //         Assigned Subjects
        //     </div>

        //     <Filters
        //         showYear
        //         defaultYear='2026'
        //         isYearClearable={false}
        //         onYearChange={setFilterYear}
        //     />
        //     <div className='flex gap-5 mx-10'>
        //         <div className='border rounded-md flex items-center'>
        //             <input
        //                 type='text'
        //                 placeholder='Search by Faculty or Subject'
        //                 value={search}
        //                 className='border-r px-3 py-1 w-87.5 outline-none'
        //                 style={{
        //                     color: COLORS.mintDark
        //                 }}
        //                 onChange={(e) => handleChange(e)}
        //             />
        //             <div
        //                 className='px-3 py-1 cursor-pointer'
        //                 onClick={() => setSearchQuery(search)}
        //             >
        //                 <BsSearch style={{ color: COLORS.mintDark }} />
        //             </div>
        //         </div>
        //         <div>
        //             <button
        //                 className='px-3 py-1 rounded-lg cursor-pointer'
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //                 onClick={() => setIsAssignSubjectOpen(true)}
        //             >
        //                 Assign Subject
        //             </button>
        //         </div>
        //     </div>
        //     {isAssignSubjectOpen &&
        //         <AssignSubjectForm
        //             isAssignSubjectOpen={isAssignSubjectOpen}
        //             setIsAssignSubjectOpen={setIsAssignSubjectOpen}
        //             toggleUpdate={toggleUpdate}
        //         />
        //     }
        // </div>
    )
}

export default AssignSubjectsHeader