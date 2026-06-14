import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from '../store/authSlice';
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(
        state => state.auth.isAuthenticated
    );

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const verify = async () => {
            if (isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('/refresh/', {
                    withCredentials: true
                });

                // console.log(res);
                // console.log(res.data);
                dispatch(login({
                    user: res.data.user,
                    accessToken: res.data.accessToken
                }));

                axios.defaults.headers.common.Authorization =
                    `Bearer ${res.data.accessToken}`;
            } catch (error) {
                // do nothing
                console.log(error);
                
            } finally {
                setLoading(false);
            }
        };
        
        verify();
    }, []);
    
    if (loading) return <div>Loading...</div>;

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}

export default ProtectedRoute




// import { Navigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'

// function ProtectedRoute({ children }) {
//     const isAuthenticated = useSelector(
//         state => state.auth.isAuthenticated
//     );
//     console.log(isAuthenticated);
    

//     return isAuthenticated
//         ? children
//         : <Navigate to="/login" replace />
// }

// export default ProtectedRoute