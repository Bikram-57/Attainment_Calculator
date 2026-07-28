import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { MdOutlineCancelPresentation } from "react-icons/md";
import { COLORS } from '../../constants/theme';
import GenerateAttainmentForm from './GenerateAttainmentForm';

function DirectAttainmentHeader({ toggleUpdate, setSearchQuery }) {
    const [search, setSearch] = useState('');
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

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
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-5 lg:px-6 xl:flex-row xl:items-center xl:justify-between">

            {/* Left */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">

                <h2
                    className="whitespace-nowrap text-xl font-semibold sm:text-2xl"
                    style={{ color: COLORS.mint }}
                >
                    Direct Attainment
                </h2>

                <div className="relative w-full lg:w-80 xl:w-96">

                    <BsSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: COLORS.mintDark }}
                    />

                    <input
                        type="text"
                        placeholder="Search by course or academic year..."
                        value={search}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-gray-400 focus:ring-2"
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

            </div>

            {/* Right */}
            <div className="flex w-full justify-start xl:w-auto xl:justify-end">

                <button
                    onClick={() => setIsGenerateOpen(true)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    + Generate Attainment
                </button>

            </div>

            {isGenerateOpen && (
                <GenerateAttainmentForm
                    setIsGenerateOpen={setIsGenerateOpen}
                    toggleUpdate={toggleUpdate}
                />
            )}

        </div>

        // <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-gray-200">

        //     {/* Left */}
        //     <div className="flex items-center gap-6">

        //         <h2
        //             className="text-xl font-semibold whitespace-nowrap"
        //             style={{ color: COLORS.mint }}
        //         >
        //             Direct Attainment
        //         </h2>

        //         <div className="relative">

        //             <BsSearch
        //                 className="absolute left-3 top-1/2 -translate-y-1/2"
        //                 style={{ color: COLORS.mintDark }}
        //             />

        //             <input
        //                 type="text"
        //                 placeholder="Search by course or academic year..."
        //                 value={search}
        //                 onChange={handleChange}
        //                 className="w-80 rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400"
        //                 style={{
        //                     color: COLORS.mintDark,
        //                 }}
        //             />

        //             {search.length > 0 &&
        //                 <MdOutlineCancelPresentation
        //                     className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer"
        //                     onClick={handleClear}
        //                 />
        //             }

        //         </div>

        //     </div>

        //     {/* Right */}
        //     <div className="flex items-center gap-4">

        //         <button
        //             onClick={() => setIsGenerateOpen(true)}
        //             className="rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //             style={{
        //                 backgroundColor: COLORS.mint,
        //                 color: COLORS.font,
        //             }}
        //         >
        //             + Generate Attainment
        //         </button>

        //     </div>

        //     {isGenerateOpen && (
        //         <GenerateAttainmentForm
        //             setIsGenerateOpen={setIsGenerateOpen}
        //             toggleUpdate={toggleUpdate}
        //         />
        //     )}

        // </div>

        // <div className='flex justify-between p-4'>
        //     <div
        //         className='text-xl font-semibold'
        //         style={{ color: COLORS.mint }}
        //     >
        //         Direct Attainment
        //     </div>

        //     <div className='flex gap-5 mx-10'>
        //         <div
        //             className='border rounded-md flex items-center'
        //         >
        //             <input
        //                 type='text'
        //                 placeholder='Search by course name or academic year'
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
        //             onClick={() => setIsGenerateOpen(true)}
        //             >
        //                 Generate Attainment
        //             </button>
        //         </div>
        //     </div>
        //     {isGenerateOpen &&
        //         <GenerateAttainmentForm
        //             setIsGenerateOpen={setIsGenerateOpen}
        //             toggleUpdate={toggleUpdate}
        //         />
        //     }
        // </div>
    )
}

export default DirectAttainmentHeader