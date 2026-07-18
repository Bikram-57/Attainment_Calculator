import React, { useState } from 'react'
import { COLORS } from '../../constants/theme'
import { BsSearch } from "react-icons/bs";
import { MdOutlineCancelPresentation } from "react-icons/md";
import Filters from '../../utils/Filters';

function CoPoRelationHeader({ setSearchQuery, setFilterYear, setFilterCourse, setFilterSemester }) {
    const [search, setSearch] = useState("");
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
        <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-gray-200">

            {/* Left */}
            <div className="flex items-center gap-6">

                <h2
                    className="text-xl font-semibold whitespace-nowrap"
                    style={{ color: COLORS.mint }}
                >
                    CO-PO Relations
                </h2>

                <div className="relative">

                    <BsSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: COLORS.mintDark }}
                    />

                    <input
                        type="text"
                        placeholder="Search by subject code or name..."
                        value={search}
                        onChange={handleChange}
                        className="w-80 rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2"
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
                    onYearChange={setFilterYear}
                    isYearClearable={false}
                    showCourse
                    onCourseChange={setFilterCourse}
                    showSemester
                    onSemesterChange={setFilterSemester}
                />

            </div>

        </div>

        // <div className="mb-3 flex items-center justify-between">
        //     <h2
        //         className="text-xl font-semibold"
        //         style={{ color: COLORS.mint }}
        //     >
        //         CO PO Relations
        //     </h2>

        //     <Filters
        //         showYear
        //         defaultYear={String(new Date().getFullYear())}
        //         onYearChange={setFilterYear}
        //         isYearClearable={false}
        //         showCourse
        //         onCourseChange={setFilterCourse}
        //         showSemester
        //         onSemesterChange={setFilterSemester}
        //     />

        //     {/* Search */}
        //     <div
        //         className="flex w-105 overflow-hidden rounded-md border"
        //     >
        //         <input
        //             type="text"
        //             placeholder="Search by subject Id or name"
        //             value={search}
        //             onChange={(e) => handleChange(e)}
        //             className="w-full border-r px-3 py-1 text-sm outline-none"
        //             style={{
        //                 color: COLORS.mintDark
        //             }}
        //         />

        //         <button className="px-3 cursor-pointer">
        //             <BsSearch
        //                 onClick={() => setSearchQuery(search)}
        //                 style={{ color: COLORS.mintDark }}
        //             />
        //         </button>
        //     </div>
        // </div>
    )
}

export default CoPoRelationHeader