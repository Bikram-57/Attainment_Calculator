import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(
        state => state.auth.isAuthenticated
    );
    console.log(isAuthenticated);
    

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />
}

export default ProtectedRoute