import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { login } from "../store/authSlice";

function PublicRoute({ children }) {
    const isAuthenticated = useSelector(
        state => state.auth.isAuthenticated
    );

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const verify = async () => {
            // Already logged in
            if (isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('/refresh/', {
                    withCredentials: true
                });

                dispatch(login({
                    userData: res.data.user,
                    accessToken: res.data.accessToken
                }));

                axios.defaults.headers.common.Authorization =
                    `Bearer ${res.data.accessToken}`;
            } catch (error) {
                // Refresh token invalid/expired, allow access to login page
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [dispatch, isAuthenticated]);

    if (loading) return <div>Loading...</div>;

    return isAuthenticated
        ? <Navigate to="/" replace />
        : children;
}

export default PublicRoute;