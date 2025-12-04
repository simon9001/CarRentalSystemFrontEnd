import {
    BarChart,
    ClipboardList,
    Car,
    User,
    Building2,
    Wrench,
    CreditCard,
    AlertTriangle,
    Settings,
    Users
} from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router'

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navigationItems = [
        {
            name: 'Analytics',
            path: '/admin/dashboard',
            icon: <BarChart className="w-5 h-5" />
        },
        {
            name: 'Bookings',
            path: '/admin/dashboard/bookings',
            icon: <ClipboardList className="w-5 h-5" />
        },
        {
            name: 'Vehicles',
            path: '/admin/dashboard/vehicles',
            icon: <Car className="w-5 h-5" />
        },
        {
            name: 'Car Models',
            path: '/admin/dashboard/models',
            icon: <Car className="w-5 h-5" />
        },
        {
            name: 'Customers',
            path: '/admin/dashboard/customers',
            icon: <User className="w-5 h-5" />
        },
        {
            name: 'Branches',
            path: '/admin/dashboard/branches',
            icon: <Building2 className="w-5 h-5" />
        },
        {
            name: 'Payments',
            path: '/admin/dashboard/payments',
            icon: <CreditCard className="w-5 h-5" />
        },
        {
            name: 'Maintenance',
            path: '/admin/dashboard/maintenance',
            icon: <Wrench className="w-5 h-5" />
        },
        {
            name: 'Damage Reports',
            path: '/admin/dashboard/damage-reports',
            icon: <AlertTriangle className="w-5 h-5" />
        },
        {
            name: 'Staff & Roles',
            path: '/admin/dashboard/staff',
            icon: <Users className="w-5 h-5" />
        },
        {
            name: 'System Settings',
            path: '/admin/dashboard/settings',
            icon: <Settings className="w-5 h-5" />
        }
    ];

    return (
        <div className="bg-white border-r border-gray-200 shadow-sm transition-all duration-300 
                        w-64 min-h-screen fixed left-0 top-0 z-40 pt-20 pb-20">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-lg font-bold text-green-800">Admin Panel</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                {navigationItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                        ${isActive(item.path)
                            ? 'bg-green-800 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-green-800'
                        }`}
                    >
                        <span className="shrink-0 mr-3">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default AdminSidebar
