import { FiLogOut } from "react-icons/fi";
import { logout } from '../store/authSlice';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from "react-redux";

function Logout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            const res = await axios.post('/logout/', {
                withCredentials: true
            });
            dispatch(logout());
            delete axios.defaults.headers.common.Authorization;
            navigate('/login');
        } catch (error) {
            console.log('ERROR || NavBar | handleLogout(): ', error);
        }
    }

    return (
        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 cursor-pointer"
            onClick={handleLogout}
        >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
        </button>
    );
}

export default Logout