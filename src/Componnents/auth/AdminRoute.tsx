import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { Navigate} from 'react-router'

interface AdminRouteProps {
    children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user is admin
    if (user.role !== 'Admin') {
        // Redirect non-admin users to user dashboard
        if (user.role === 'Customer') {
            return <Navigate to="/dashboard" replace />
        }
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default AdminRoute