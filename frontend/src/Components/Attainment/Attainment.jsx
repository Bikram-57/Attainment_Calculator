import React from 'react'
import { COLORS } from '../../constants/theme'
// import { useNavigate } from 'react-router-dom'
// import axios from 'axios'

// function Attainment({ coAttainData, finalCOAttainData, poAttainData }) {
function Attainment({ academicYear, course, subjectId }){
    // const navigate = useNavigate();

    const handleCOAttain = () => {
        // const coData = coAttainData.metadata;
        // console.log('CO: ', coAttainData)
        // nagivate to respective page with the respective prop data
        window.open(`/co-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
        // navigate(`/co-attainment/${coData.subjectId}/${coData.academicYear}`, {
        //     state: { coAttainData }
        // });
    }
    const handleFinalCOAttain = () => {
        // console.log('Final: ', finalCOAttainData)
        // nagivate to respective page with the respective prop data
        window.open(`/final-co-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
    }
    const handlePOAttain = () => {
        // console.log('PO: ', poAttainData)
        // nagivate to respective page with the respective prop data
        window.open(`/po-attainment/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
        // window.open(`/calpo/${academicYear}/${course}/${subjectId}`, "_blank", "noopener,noreferrer");
    }

    return (
        <div className='h-full flex flex-col p-4'>
            <div className='flex justify-between pb-4'>
                <div
                    className='text-xl font-semibold'
                    style={{ color: COLORS.mint }}
                >
                    Attainment
                </div>
            </div>
            <div className='flex w-1/2 gap-8'>
                <div className=''>
                    <button
                        className='rounded-sm px-4 py-1 cursor-pointer duration-200'
                        onClick={handleCOAttain}
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        CO Attainment
                    </button>
                </div>
                <div className=''>
                    <button
                        className='rounded-sm px-4 py-1 cursor-pointer duration-200'
                        onClick={handleFinalCOAttain}
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        Final CO Attainment
                    </button>
                </div>
                <div className=''>
                    <button
                        className='rounded-sm px-4 py-1 cursor-pointer duration-200'
                        onClick={handlePOAttain}
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        PO Attainment
                    </button>
                </div>
            </div>
            <div>
                {/* {error && (
					<p className="text-red-500 text-sm ml-2">
						{error}
					</p>
				)} */}
            </div>
        </div>
    )
}

export default Attainment