import React from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { FaUserAlt } from "react-icons/fa";
import { NavLink, useMatches } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { open, close } from '../../store/sideBarSlice';
import { COLORS } from '../../constants/theme';
import Logout from '../Logout';
import NavBarMenu from './NavBarMenu';

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
        <div
            className="min-h-15 px-3 sm:px-4 flex items-center justify-between gap-3 font-semibold"
            style={{ backgroundColor: COLORS.mint }}
        >
            {/* Left */}
            <div className="min-w-0 flex flex-1 items-center gap-3 sm:gap-5">

                <RxHamburgerMenu
                    className="h-6 w-6 shrink-0 cursor-pointer"
                    style={{ color: COLORS.font }}
                    onClick={handleClick}
                />

                <div
                    className="truncate text-sm sm:text-base md:text-lg"
                    style={{ color: COLORS.font }}
                >
                    {title}
                </div>

            </div>

            {/* Right */}
            <div className="shrink-0">
                <NavBarMenu />
            </div>

        </div>

        // <div
        //     className='h-15 px-4 flex justify-between items-center font-semibold'
        //     style={{ backgroundColor: COLORS.mint }}
        // >
        //     <div className='h-full flex items-center gap-7 mx-4'>
        //         <RxHamburgerMenu
        //             className='h-full w-6.25 cursor-pointer'
        //             style={{ color: COLORS.font }}
        //             onClick={handleClick}
        //         />
        //         <div style={{ color: COLORS.font }}>
        //             {title}
        //         </div>
        //     </div>
        //     <NavBarMenu />
        // </div>
    )
}

export default NavBar