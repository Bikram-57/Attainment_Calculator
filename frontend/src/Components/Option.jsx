import React, { useEffect, useRef, useState } from 'react'
import { SlOptions } from 'react-icons/sl';

function Option() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const close = (e) => !ref.current?.contains(e.target) && setIsOpen(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [])

    return (
        <div
            className='cursor-pointer relative inline-block'
            onClick={() => setIsOpen(!isOpen)}
            ref={ref}
        >
            <SlOptions className='cursor-pointer' />
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-30 text-center bg-white border rounded shadow z-10">
                    <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">View</p>
                    <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Edit</p>
                    <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Delete</p>
                </div>
            )}
        </div>
    )
}

export default Option