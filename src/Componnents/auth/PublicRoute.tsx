import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

interface PublicRouteProps {
    children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        if (user.role === 'Admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        if (user.role === 'Customer') {
            return <Navigate to="/dashboard" replace />
        }
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default PublicRoute