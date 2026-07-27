import { FaUserAlt } from "react-icons/fa";
import { FiUser, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { COLORS } from "../../constants/theme";
import Logout from "../Logout";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useRef } from "react";
import { useSelector } from "react-redux";

function NavBarMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const userData = useSelector(state => state.auth.userData);
    const [image, setImage] = useState(`https://localhost:8000/${userData?.profileImage}`);
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
            <img
                src={image}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition cursor-pointer"
            />
            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-10"
                    onClick={closeMenu}
                >
                    <NavLink
                        to='/profile'
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <FiUser size={18} />
                        Profile
                    </NavLink>

                    <NavLink
                        to='/support'
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <FiHelpCircle size={18} />
                        Support
                    </NavLink>

                    <div className="border-t border-gray-100" />

                    <Logout />
                </div>
            )}
        </div>
    );
}

export default NavBarMenu