// components/settings/AdminRoleEditor.tsx
import React, { useState } from 'react'
import { Save, Plus, X, Shield } from 'lucide-react'
import SettingsSectionCard from './SettingsSectionCard'

const AdminRoleEditor: React.FC = () => {
  const [roles, setRoles] = useState([
    {
      id: 'superadmin',
      name: 'Super Administrator',
      permissions: ['*'],
      description: 'Full system access',
    },
    {
      id: 'admin',
      name: 'Administrator',
      permissions: ['users.read', 'users.write', 'vehicles.*', 'bookings.*', 'reports.*'],
      description: 'Full access except system settings',
    },
    {
      id: 'manager',
      name: 'Branch Manager',
      permissions: ['vehicles.read', 'vehicles.write', 'bookings.*', 'reports.read'],
      description: 'Branch-level management access',
    },
    {
      id: 'support',
      name: 'Support Agent',
      permissions: ['bookings.read', 'bookings.write', 'customers.*'],
      description: 'Customer support and booking management',
    },
  ])

  const availablePermissions = [
    'users.read', 'users.write', 'users.delete',
    'vehicles.read', 'vehicles.write', 'vehicles.delete',
    'bookings.read', 'bookings.write', 'bookings.delete',
    'customers.read', 'customers.write', 'customers.delete',
    'reports.read', 'reports.write',
    'settings.read', 'settings.write',
    'payments.*', 'maintenance.*'
  ]

  const togglePermission = (roleId: string, permission: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const permissions = role.permissions.includes(permission)
          ? role.permissions.filter(p => p !== permission)
          : [...role.permissions, permission]
        
        return { ...role, permissions }
      }
      return role
    }))
  }

  const hasPermission = (roleId: string, permission: string) => {
    const role = roles.find(r => r.id === roleId)
    return role?.permissions.includes(permission) || role?.permissions.includes('*')
  }

  return (
    <SettingsSectionCard
      title="Role & Permission Editor"
      description="Define access levels and permissions for different admin roles"
    >
      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield size={16} />
                  {role.name}
                </h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm">
                  <Save size={14} />
                  Save
                </button>
                {role.id !== 'superadmin' && (
                  <button className="btn btn-ghost btn-sm text-error">
                    <X size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availablePermissions.map((permission) => (
                <div key={permission} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={hasPermission(role.id, permission)}
                      onChange={() => togglePermission(role.id, permission)}
                      disabled={role.permissions.includes('*')}
                    />
                    <span className="label-text text-sm">{permission}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center">
          <button className="btn btn-outline">
            <Plus size={16} />
            Add New Role
          </button>
        </div>
      </div>
    </SettingsSectionCard>
  )
}

export default AdminRoleEditor