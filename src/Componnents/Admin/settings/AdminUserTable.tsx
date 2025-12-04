// components/settings/AdminUserTable.tsx
import React from 'react'
import { Edit, Trash2, Mail, User, Shield } from 'lucide-react'
import type { AdminUser } from '../../../features/Api/settingsApi'

interface AdminUserTableProps {
  users: AdminUser[]
  onEditUser: (user: AdminUser) => void
  onDeleteUser: (userId: string) => void
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ users, onEditUser, onDeleteUser }) => {
  const getRoleColor = (role: string) => {
    const colors = {
      superadmin: 'badge-error',
      admin: 'badge-primary',
      manager: 'badge-secondary',
      support: 'badge-info',
    }
    return colors[role as keyof typeof colors] || 'badge-ghost'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-10">
                      <User size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Shield size={14} />
                  <span className={`badge ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </td>
              <td>
                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="text-sm text-gray-600">
                  {formatDate(user.last_login)}
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={user.role === 'superadmin'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUserTable