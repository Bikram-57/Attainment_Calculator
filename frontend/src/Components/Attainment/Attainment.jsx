import React from 'react'
import { COLORS } from '../../constants/theme'
import { FaArrowLeft } from 'react-icons/fa';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function Attainment({ academicYear, course, subjectId, setFetchClicked }) {
    const handleCOAttain = () => {
        window.open(`/co-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
    }
    const handleFinalCOAttain = () => {
        window.open(`/final-co-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
    }
    const handlePOAttain = () => {
        window.open(`/po-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
    }

    useDocumentTitle('Attainment - Fetch Data | Menu');

    return (
        <div className="flex h-full w-full flex-col p-4 sm:p-5 lg:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 pb-5">
                <button
                    onClick={() => setFetchClicked(false)}
                    className="rounded-lg border border-slate-300 bg-white p-2 transition hover:bg-slate-100 cursor-pointer"
                >
                    <FaArrowLeft size={18} />
                </button>

                <h2
                    className="text-xl font-semibold sm:text-2xl"
                    style={{ color: COLORS.mint }}
                >
                    Attainment
                </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3">

                <button
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium transition duration-200 sm:text-base cursor-pointer"
                    onClick={handleCOAttain}
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    CO Attainment
                </button>

                <button
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium transition duration-200 sm:text-base cursor-pointer"
                    onClick={handleFinalCOAttain}
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    Final CO Attainment
                </button>

                <button
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium transition duration-200 sm:text-base cursor-pointer"
                    onClick={handlePOAttain}
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font,
                    }}
                >
                    PO Attainment
                </button>

            </div>

            <div className="mt-4">
                {/* {error && (
            <p className="ml-2 text-sm text-red-500">
                {error}
            </p>
        )} */}
            </div>
        </div>

        // <div className='h-full flex flex-col p-4'>
        //     <div className='flex items-center gap-2 pb-4'>
        //         <button
        //             onClick={() => setFetchClicked(false)}
        //             className="rounded-lg border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100 cursor-pointer"
        //         >
        //             <FaArrowLeft size={18} />

        //         </button>
        //         <div
        //             className='text-xl font-semibold'
        //             style={{ color: COLORS.mint }}
        //         >
        //             Attainment
        //         </div>
        //     </div>
        //     <div className='flex w-1/2 gap-8'>
        //         <div className=''>
        //             <button
        //                 className='rounded-sm px-4 py-1 cursor-pointer duration-200'
        //                 onClick={handleCOAttain}
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 CO Attainment
        //             </button>
        //         </div>
        //         <div className=''>
        //             <button
        //                 className='rounded-sm px-4 py-1 cursor-pointer duration-200'
        //                 onClick={handleFinalCOAttain}
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 Final CO Attainment
        //             </button>
        //         </div>
        //         <div className=''>
        //             <button
        //                 className='rounded-sm px-4 py-1 cursor-pointer duration-200'
        //                 onClick={handlePOAttain}
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 PO Attainment
        //             </button>
        //         </div>
        //     </div>
        //     <div>
        //         {/* {error && (
        // 			<p className="text-red-500 text-sm ml-2">
        // 				{error}
        // 			</p>
        // 		)} */}
        //     </div>
        // </div>
    )
}

export default Attainment