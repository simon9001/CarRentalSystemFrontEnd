import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

interface UserRouteProps {
    children: React.ReactNode
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user is customer
    if (user.role !== 'Customer') {

        if (user.role === 'Admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default UserRoute