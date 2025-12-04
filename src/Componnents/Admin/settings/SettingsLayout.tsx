// pages/admin/settings/SettingsLayout.tsx
import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import {
  Building2,
  Calendar,
  Car,
  CreditCard,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react'

const SettingsLayout: React.FC = () => {
  const location = useLocation()

  const settingsTabs = [
    {
      path: '/admin/settings/company',
      label: 'Company',
      icon: Building2,
    },
    {
      path: '/admin/settings/bookings',
      label: 'Bookings & Pricing',
      icon: Calendar,
    },
    {
      path: '/admin/settings/vehicles',
      label: 'Vehicles',
      icon: Car,
    },
    {
      path: '/admin/settings/payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      path: '/admin/settings/security',
      label: 'Security & Admin',
      icon: Shield,
    },
  ]

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
            <p className="text-gray-600">Configure your car rental system</p>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = location.pathname === tab.path
                
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={`
                      flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                      ${isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}

export default SettingsLayout