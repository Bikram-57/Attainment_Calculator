import React from 'react'
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
    }

    return (
        <div className='h-full flex flex-col p-4'>
            <div className='flex justify-between pb-4'>
                <div className='text-blue-900 text-xl font-semibold'>Attainment</div>
            </div>
            <div className='flex w-1/2 gap-8'>
                <div className=''>
                    <button className='bg-blue-900 rounded-sm text-white px-4 py-1 cursor-pointer hover:bg-blue-800 duration-200' onClick={handleCOAttain}>
                        CO Attainment
                    </button>
                </div>
                <div className=''>
                    <button className='bg-blue-900 rounded-sm text-white px-4 py-1 cursor-pointer hover:bg-blue-800 duration-200' onClick={handleFinalCOAttain}>
                        Final CO Attainment
                    </button>
                </div>
                <div className=''>
                    <button className='bg-blue-900 rounded-sm text-white px-4 py-1 cursor-pointer hover:bg-blue-800 duration-200' onClick={handlePOAttain}>
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