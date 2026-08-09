import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PiCopyrightLight } from "react-icons/pi";
import { COLORS } from '../constants/theme';

function Footer() {
    const navigate = useNavigate();

    return (
        <div className="min-h-8 px-4 py-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-center">

            <span>Copyright</span>

            <PiCopyrightLight className="shrink-0" />

            <span>2026</span>

            <span className="hidden sm:inline">|</span>

            <span>Designed and developed by:</span>

            <span className="font-semibold">
                Bikram Das (MCA) & Soumyadip Chowdhury (MCA)
            </span>

            <button
                className="px-3 py-1 rounded-md font-medium transition hover:opacity-90 cursor-pointer"
                style={{
                    backgroundColor: COLORS.mint,
                    color: COLORS.font
                }}
                onClick={() => window.open('/contact-us', "_blank", "noopener,noreferrer")}
            >
                Contact Us
            </button>

        </div>

        // <div className='h-10 flex justify-center items-center'>
        //     Copyright
        //     <PiCopyrightLight className='mx-1' />
        //     2026 | Designed and developed by: <span className='mx-1 font-semibold'>Bikram Das (MCA) & Soumyadip Chowdhury (MCA)</span>
        //     <button
        //         // className='mx-2 px-2 py-00 rounded-md bg-blue-800 text-white cursor-pointer'
        //         className='mx-2 px-2 py-00 rounded-md cursor-pointer'
        //         style={{
        //             backgroundColor: COLORS.mint,
        //             color: COLORS.font
        //         }}
        //         onClick={() => window.open('/contact-us', "_blank", "noopener,noreferrer")}
        //     >
        //         Contact Us
        //     </button>
        // </div>
    )
}

export default Footer