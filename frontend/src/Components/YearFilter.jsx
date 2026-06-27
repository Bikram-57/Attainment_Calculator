import React, { useState } from 'react'
import { FaFilter } from "react-icons/fa";
import { COLORS } from '../constants/theme';
import Select from 'react-select';

function YearFilter({ defaultYear = '', setFilterYear, isClearable = true }) {
    const [academicYear, setAcademicYear] = useState(defaultYear);
    const currentYear = defaultYear !== '' ? defaultYear : new Date().getFullYear();
    const academicYearList = [currentYear, 2025, 2024];

    const yearOptions = academicYearList.map(year => (
        {
            value: year,
            label: year
        }
    ));

    const handleYear = (selected) => {
        setAcademicYear(selected);
        setFilterYear(selected);
    }

    return (
        <div className="w-1/4 flex items-center gap-2">
            <div
                className='flex items-center gap-1 font-semibold text-md'
                style={{ color: COLORS.mint }}
            >
                <FaFilter />
                <div>
                    Academic Year:
                </div>
            </div>
            <Select
                options={yearOptions}
                placeholder='Select a year'
                value={yearOptions.find(option => (
                    option.value === academicYear
                ))}
                onChange={selected => handleYear(selected?.value || '')}
                maxMenuHeight={200}
                isClearable = {isClearable}
            />
        </div>
    )
}

export default YearFilter