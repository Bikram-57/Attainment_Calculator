import { FaUserAlt } from "react-icons/fa";
import { FiUser, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { COLORS } from "../../constants/theme";
import Logout from "../Logout";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useRef } from "react";

function NavBarMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();

    const closeMenu = () => {
        setIsOpen(false);
    }

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current?.contains(e.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div className="relative" ref={ref}>
            {/* User Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition cursor-pointer"
                style={{
                    backgroundColor: COLORS.mintDark,
                    color: COLORS.font
                }}
            >
                <FaUserAlt className='h-full w-5' />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                onClick={closeMenu}
                >
                    <NavLink
                        to='/profile'
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <FiUser size={18} />
                        Profile
                    </NavLink>

                    <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                        <FiHelpCircle size={18} />
                        Support
                    </button>

                    <div className="border-t border-gray-100" />

                    <Logout />
                </div>
            )}
        </div>
    );
}

export default NavBarMenu