import React from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { FaUserAlt } from "react-icons/fa";
import { useMatches } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {open, close} from '../store/sideBarSlice';

function NavBar() {
    const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
    const dispatch = useDispatch();
    const matches = useMatches();
    const currentMatch = matches[matches.length - 1];
    const title = currentMatch?.handle?.title || 'Home';

    const handleClick = () => {
        dispatch(isOpen ? close() : open());
    }

    return (
        <div className='bg-gray-50 h-15 px-4 flex justify-between items-center font-semibold'>
            <div className='h-full flex items-center gap-7 mx-4'>
                <RxHamburgerMenu className='h-full w-6.25 cursor-pointer' onClick={handleClick} />
                {/* TODO: MAKE THE BELOW TEXT DYNAMIC */}
                <div className='text-blue-900'>
                    {title}
                </div>
            </div>
            <div className='text-blue-900 h-full flex items-center gap-2'>
                <FaUserAlt className='h-full w-5' />
                <div>Admin</div>
            </div>
        </div>
    )
}

export default NavBar