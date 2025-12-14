import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    console.log('ProtectedRoute: Checking access...');
    
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    console.log('ProtectedRoute: User from storage:', user);

    if (!user || !user.token) {
        console.log('ProtectedRoute: No user or token found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    try {
        console.log('ProtectedRoute: Decoding token...');
        const decodedToken = jwtDecode(user.token);
        console.log('ProtectedRoute: Decoded token:', decodedToken);
        
        const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
        console.log('ProtectedRoute: User role from token:', userRole);
        console.log('ProtectedRoute: Allowed roles:', allowedRoles);

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            console.log('ProtectedRoute: Role not allowed, redirecting to unauthorized');
            return <Navigate to="/unauthorized" replace />;
        }

        // Check token expiration
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log('ProtectedRoute: Token expired, redirecting to login');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }

        console.log('ProtectedRoute: Access granted, rendering children');
        return children;
    } catch (error) {
        console.error('ProtectedRoute: Token validation error:', error);
        console.log('ProtectedRoute: Error occurred, redirecting to login');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;