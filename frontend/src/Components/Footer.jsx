import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PiCopyrightLight } from "react-icons/pi";

function Footer() {
    const navigate = useNavigate();
    const mintShade = '#00A19B';
    const mintDarkShade = '#008985';
    const latteShade = '#fffaf3';
    const latteDarkShade = '#e4ddd3';
    const fontShade = '#ffffff';

    return (
        <div className='h-10 flex justify-center items-center'>
            Copyright
            <PiCopyrightLight className='mx-1' />
            2026 | Designed and developed by: <span className='mx-1 font-semibold'>Bikram Das (MCA) & Soumyadip Chowdhury (MCA)</span>
            <button
                // className='mx-2 px-2 py-00 rounded-md bg-blue-800 text-white cursor-pointer'
                className={`mx-2 px-2 py-00 rounded-md bg-[${mintShade}] text-[${fontShade}] cursor-pointer`}
                onClick={() => window.open('/contact-us', "_blank", "noopener,noreferrer")}
            >
                Contact Us
            </button>
        </div>
    )
}

export default Footer