import React from 'react'
import { useNavigate } from 'react-router-dom'

function Footer() {
    const navigate = useNavigate();
    return (
        <div className='h-10 flex justify-center items-center font-semibold'>
            Designed and developed by: Bikram Das (MCA) & Soumyadip Chowdhury (MCA) |
            <button
                className='mx-2 px-2 py-00 rounded-md bg-blue-800 text-white cursor-pointer'
                onClick={() => window.open('/contact-us', "_blank", "noopener,noreferrer")}
            >
                Contact Us
            </button>
        </div>
    )
}

export default Footer