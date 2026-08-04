import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const location = useLocation();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect to unauthorized if role doesn't match
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
