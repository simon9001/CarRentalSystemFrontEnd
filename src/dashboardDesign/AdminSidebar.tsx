import {
    BarChart,
    ClipboardList,
    Car,
    User,
    Building2,
    Wrench,
    CreditCard,
    AlertTriangle,
    Users,
    Shield,
    Calendar,
    Settings,
    ChevronDown,
    ChevronRight
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router'

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const isActive = (path: string) => location.pathname === path;
    const isSettingsActive = location.pathname.startsWith('/admin/settings');

    const navigationItems = [
         
        {
            name: 'ALLUSERS',
            path: '/admin/Users',
            icon: <Users className="w-5 h-5" />
        },

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
    ];

    const settingsItems = [
        {
            name: 'Company',
            path: '/admin/settings/company',
            icon: <Building2 className="w-4 h-4" />,
            description: 'Brand identity and contact info'
        },
        {
            name: 'Bookings & Pricing',
            path: '/admin/settings/bookings', 
            icon: <Calendar className="w-4 h-4" />,
            description: 'Rates, policies, and booking rules'
        },
        {
            name: 'Vehicles',
            path: '/admin/settings/vehicles',
            icon: <Car className="w-4 h-4" />,
            description: 'Maintenance and fleet settings'
        },
        {
            name: 'Payments',
            path: '/admin/settings/payments',
            icon: <CreditCard className="w-4 h-4" />,
            description: 'Payment methods and billing'
        },
        {
            name: 'Security & Admin',
            path: '/admin/settings/security',
            icon: <Shield className="w-4 h-4" />,
            description: 'Users, roles, and security'
        },
    ];

    return (
        <div className="bg-white border-r border-gray-200 shadow-sm transition-all duration-300 
                        w-64 h-screen fixed left-0 top-0 z-40 flex flex-col pt-20 pb-20">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 shrink-0">
                <h1 className="text-lg font-bold text-green-800">Admin Panel</h1>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto">
                <nav className="p-4 space-y-2">
                    {/* Main Navigation Items */}
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

                    {/* Settings Dropdown */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                            ${isSettingsActive || settingsOpen
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-green-800'
                            }`}
                        >
                            <div className="flex items-center">
                                <span className="shrink-0 mr-3">
                                    <Settings className="w-5 h-5" />
                                </span>
                                Settings
                            </div>
                            <span className="shrink-0">
                                {settingsOpen ? 
                                    <ChevronDown className="w-4 h-4" /> : 
                                    <ChevronRight className="w-4 h-4" />
                                }
                            </span>
                        </button>

                        {/* Settings Submenu */}
                        {settingsOpen && (
                            <div className="ml-4 mt-2 space-y-1 border-l-2 border-green-200 pl-3">
                                {settingsItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-start px-3 py-2 rounded-lg text-sm transition-all duration-200 group
                                        ${isActive(item.path)
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-green-800'
                                        }`}
                                        onClick={() => setSettingsOpen(false)}
                                    >
                                        <span className="shrink-0 mr-3 mt-0.5">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default AdminSidebar