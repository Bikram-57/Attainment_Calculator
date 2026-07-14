import React, { useState } from 'react'
import { BsSearch } from "react-icons/bs";
import AddFacultyForm from './AddFacultyForm';
import { COLORS } from '../../constants/theme';

function FacultyHeader({ toggleUpdate, setSearchQuery }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const handleChange = (e) => {
        if (e.target.value == '') {
            setSearchQuery('');
        }
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    }

    return (
        <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-gray-200">
            {/* Left */}
            <div className="flex items-center gap-6">

                <h2
                    className="text-xl font-semibold whitespace-nowrap"
                    style={{ color: COLORS.mint }}
                >
                    Faculty List
                </h2>

                <div className="relative">

                    <BsSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: COLORS.mintDark }}
                    />

                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={search}
                        onChange={handleChange}
                        className="w-80 rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2"
                        style={{
                            color: COLORS.mintDark,
                            "--tw-ring-color": COLORS.mint,
                        }}
                    />

                </div>

            </div>

            {/* Right */}
            <div className="flex items-center">

                <button
                    onClick={() => setIsOpen(true)}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    + Add Faculty
                </button>

            </div>

            {isOpen && (
                <AddFacultyForm
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    toggleUpdate={toggleUpdate}
                />
            )}

        </div>


        // <div className='flex justify-between p-4'>
        //     <div
        //         className='text-xl font-semibold'
        //         style={{ color: COLORS.mint }}
        //     >
        //         List of Faculty
        //     </div>
        //     <div className='flex gap-5 mx-10'>
        //         <div
        //             className='border rounded-md flex items-center'
        //             // style={{ borderColor: COLORS.mintDark }}
        //         >
        //             <input
        //                 type='text'
        //                 placeholder='Search by id or name'
        //                 value={search}
        //                 className='border-r px-3 py-1 w-62.5 outline-none'
        //                 style={{
        //                     // borderRightColor: COLORS.mintDark,
        //                     color: COLORS.mintDark
        //                 }}
        //                 onChange={(e) => handleChange(e)}
        //             />
        //             <div className='px-3 py-1 cursor-pointer'>
        //                 <BsSearch
        //                     onClick={() => setSearchQuery(search)}
        //                     style={{ color: COLORS.mint }}
        //                 />
        //             </div>
        //         </div>
        //         <div>
        //             <button
        //                 className='px-3 py-1 rounded-lg cursor-pointer'
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //                 onClick={() => setIsOpen(true)}
        //             >
        //                 Add Faculty
        //             </button>
        //         </div>
        //     </div>
        //     {isOpen &&
        //         <AddFacultyForm
        //             isOpen={isOpen}
        //             setIsOpen={setIsOpen}
        //             toggleUpdate={toggleUpdate}
        //         />
        //     }
        // </div>
    )
}

export default FacultyHeader