import React from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { FaUserAlt } from "react-icons/fa";

function NavBar() {
    return (
        <div className='bg-gray-100 h-[60px] px-4 flex justify-between items-center'>
            <div className='h-full flex items-center gap-7 mx-4'>
                <RxHamburgerMenu className='h-full w-[25px]' />
                <div className='text-blue-900'>
                    Manage Faculty
                </div>
            </div>
            <div className='text-blue-900 h-full flex items-center gap-2'>
                <FaUserAlt className='h-full w-[20px]' />
                <div>Admin</div>
            </div>
        </div>
    )
}

export default NavBar