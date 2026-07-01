import React, { useState } from 'react'
import { COLORS } from '../../constants/theme'
import { BsSearch } from "react-icons/bs";
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

    return (
        <div className="mb-3 flex items-center justify-between">
            <h2
                className="text-xl font-semibold"
                style={{ color: COLORS.mint }}
            >
                CO PO Relations
            </h2>

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

            {/* Search */}
            <div
                className="flex w-105 overflow-hidden rounded-md border"
            >
                <input
                    type="text"
                    placeholder="Search by subject Id or name"
                    value={search}
                    onChange={(e) => handleChange(e)}
                    className="w-full border-r px-3 py-1 text-sm outline-none"
                    style={{
                        color: COLORS.mintDark
                    }}
                />

                <button className="px-3 cursor-pointer">
                    <BsSearch
                        onClick={() => setSearchQuery(search)}
                        style={{ color: COLORS.mintDark }}
                    />
                </button>
            </div>
        </div>
    )
}

export default CoPoRelationHeader