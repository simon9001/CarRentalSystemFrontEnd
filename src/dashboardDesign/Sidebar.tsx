import {
    LayoutDashboardIcon,
    ShoppingBag,
    User,
    CreditCard,
    Ticket,
    ShieldCheck,
    Bell,
    Car,
    Star,
    AlertTriangle,
    LogOut
} from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router'

const Sidebar: React.FC = () => {
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    const navigationItems = [
        {
            name: 'My Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboardIcon className="w-5 h-5" />
        },
        {
            name: 'My Bookings',
            path: '/dashboard/bookings',
            icon: <ShoppingBag className="w-5 h-5" />
        },
        {
            name: 'Payments',
            path: '/dashboard/payments',
            icon: <CreditCard className="w-5 h-5" />
        },
        {
            name: 'Reviews',
            path: '/dashboard/reviews',
            icon: <Star className="w-5 h-5" />
        },
        {
            name: 'Damage Reports',
            path: '/dashboard/damages',
            icon: <AlertTriangle className="w-5 h-5" />
        },
        {
            name: 'Loyalty & Coupons',
            path: '/dashboard/coupons',
            icon: <Ticket className="w-5 h-5" />
        },
        {
            name: 'Vehicle History',
            path: '/dashboard/vehicles',
            icon: <Car className="w-5 h-5" />
        },
        {
            name: 'Profile',
            path: '/dashboard/user-profile',
            icon: <User className="w-5 h-5" />
        },
        {
            name: 'Verification & License',
            path: '/dashboard/verification',
            icon: <ShieldCheck className="w-5 h-5" />
        },
        {
            name: 'Notifications',
            path: '/dashboard/notifications',
            icon: <Bell className="w-5 h-5" />
        },
        {
            name: 'Logout',
            path: '/logout',
            icon: <LogOut className="w-5 h-5" />
        }
    ]

    return (
        <div className="bg-white border-r border-gray-200 shadow-sm transition-all duration-300 w-64 min-h-screen fixed left-0 top-0 z-40 pt-20 pb-20">

            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-lg font-bold text-green-800">User Dashboard</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                {navigationItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive(item.path)
                                ? 'bg-green-800 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-green-800'
                        }`}
                    >
                        <span className="shrink-0 mr-3">
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar
