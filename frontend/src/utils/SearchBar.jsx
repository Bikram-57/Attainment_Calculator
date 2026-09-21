import React from 'react'
import { BsSearch } from "react-icons/bs";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { COLORS } from '../constants/theme';

function SearchBar({search, placeholderText = 'Search...', handleChange, handleClear}) {
    return (
        <div className="relative w-full lg:w-80 xl:w-96">
            <BsSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: COLORS.mintDark }}
            />

            <input
                type="text"
                placeholder={placeholderText}
                value={search}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:ring-2"
                style={{
                    color: COLORS.mintDark,
                    "--tw-ring-color": COLORS.mint,
                }}
            />

            {search.length > 0 && (
                <MdOutlineCancelPresentation
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-500 transition hover:text-red-500"
                    onClick={handleClear}
                />
            )}
        </div>
    )
}

export default SearchBar