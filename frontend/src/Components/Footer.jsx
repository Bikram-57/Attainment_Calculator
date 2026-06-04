import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PiCopyrightLight } from "react-icons/pi";
import { COLORS } from '../constants/theme';

function Footer() {
    const navigate = useNavigate();

    return (
        <div className='h-10 flex justify-center items-center'>
            Copyright
            <PiCopyrightLight className='mx-1' />
            2026 | Designed and developed by: <span className='mx-1 font-semibold'>Bikram Das (MCA) & Soumyadip Chowdhury (MCA)</span>
            <button
                // className='mx-2 px-2 py-00 rounded-md bg-blue-800 text-white cursor-pointer'
                className='mx-2 px-2 py-00 rounded-md cursor-pointer'
                style={{
                    backgroundColor: COLORS.mint,
                    color: COLORS.font
                }}
                onClick={() => window.open('/contact-us', "_blank", "noopener,noreferrer")}
            >
                Contact Us
            </button>
        </div>
    )
}

export default Footer