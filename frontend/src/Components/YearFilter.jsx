import React, { useState } from 'react'
import { FaFilter } from "react-icons/fa";
import { COLORS } from '../constants/theme';

function YearFilter({ defaultYear = '', setFilterYear }) {
    const [year, setYear] = useState('');
    const currentYear = defaultYear !== '' ? defaultYear : new Date().getFullYear();
    const yearList = [currentYear, 2025, 2024];
    

    const handleYear = (e) => {
        setYear(e.target.value);
        setFilterYear(e.target.value);
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
            <div className='w-1/3'>
                <select
                    value={year}
                    onChange={(e) => handleYear(e)}
                    className="w-full border border-gray-400 text-center rounded-lg px-1 text-md cursor-pointer outline-none"
                >
                    <option value={defaultYear}>
                        {defaultYear !== '' ? defaultYear : 'Select year'}
                    </option>
                    {yearList.map(y => (
                        y != defaultYear ? (<option key={y} value={y}>
                            {y}
                        </option>) : null
                    ))}
                </select>
            </div>
        </div>
    )
}

export default YearFilter