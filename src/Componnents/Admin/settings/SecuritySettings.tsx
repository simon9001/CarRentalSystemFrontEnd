// pages/admin/settings/SecuritySettings.tsx
import React, { useState } from 'react'
import { Shield, Users, Key, Clock, Activity, Lock, Plus, Edit, Trash2 } from 'lucide-react'
import { 
  useGetSecuritySettingsQuery, 
  useUpdateSecuritySettingsMutation,
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetApiKeysQuery,
  useGenerateApiKeyMutation,
  useRevokeApiKeyMutation
} from '../../../features/Api/settingsApi'
import SettingsSectionCard from './SettingsSectionCard'
import SaveButton from './SaveButton'
import AdminUserTable from './AdminUserTable'
import AdminRoleEditor from './AdminRoleEditor'
import APIKeyDisplay from './APIKeyDisplay'

const SecuritySettings: React.FC = () => {
  // Security Settings
  const { data: securitySettings, isLoading: securityLoading } = useGetSecuritySettingsQuery()
  const [updateSecuritySettings, { isLoading: isUpdatingSecurity }] = useUpdateSecuritySettingsMutation()

  // Admin Users
  const { data: adminUsers, isLoading: usersLoading } = useGetAdminUsersQuery()
  const [createAdminUser] = useCreateAdminUserMutation()
  const [updateAdminUser] = useUpdateAdminUserMutation()
  const [deleteAdminUser] = useDeleteAdminUserMutation()

  // API Keys
  const { data: apiKeys, isLoading: keysLoading } = useGetApiKeysQuery()
  const [generateApiKey] = useGenerateApiKeyMutation()
  const [revokeApiKey] = useRevokeApiKeyMutation()

  const [securityForm, setSecurityForm] = useState({
    enable_2fa: securitySettings?.enable_2fa || false,
    force_password_reset: securitySettings?.force_password_reset || false,
    session_timeout: securitySettings?.session_timeout || 3600,
    password_policy: securitySettings?.password_policy || {
      min_length: 8,
      require_special_char: true,
      require_numbers: true,
      require_uppercase: true,
    },
  })

  const [showUserModal, setShowUserModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSecuritySettings(securityForm).unwrap()
    } catch (error) {
      console.error('Failed to update security settings:', error)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      await createAdminUser(userData).unwrap()
      setShowUserModal(false)
    } catch (error) {
      console.error('Failed to create admin user:', error)
    }
  }

  const handleGenerateApiKey = async (keyData: any) => {
    try {
      await generateApiKey(keyData).unwrap()
      setShowApiKeyModal(false)
    } catch (error) {
      console.error('Failed to generate API key:', error)
    }
  }

  if (securityLoading || usersLoading || keysLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-gray-600">Loading security settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Security & Admin Settings</h1>
      </div>

      {/* Security Settings */}
      <form onSubmit={handleSecuritySubmit} className="space-y-6">
        <SettingsSectionCard
          title="Security Policies"
          description="Configure system-wide security settings"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={securityForm.enable_2fa}
                    onChange={(e) => setSecurityForm({ ...securityForm, enable_2fa: e.target.checked })}
                  />
                  <span className="label-text flex items-center gap-2">
                    <Lock size={16} />
                    Enable Two-Factor Authentication
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={securityForm.force_password_reset}
                    onChange={(e) => setSecurityForm({ ...securityForm, force_password_reset: e.target.checked })}
                  />
                  <span className="label-text">
                    Force Password Reset on Next Login
                  </span>
                </label>
              </div>

              <div>
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Clock size={16} />
                    Session Timeout (minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  className="input input-bordered w-full"
                  value={Math.floor(securityForm.session_timeout / 60)}
                  onChange={(e) => setSecurityForm({ 
                    ...securityForm, 
                    session_timeout: parseInt(e.target.value) * 60 
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Password Policy</h4>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Minimum Length</span>
                </label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  className="input input-bordered"
                  value={securityForm.password_policy.min_length}
                  onChange={(e) => setSecurityForm({
                    ...securityForm,
                    password_policy: {
                      ...securityForm.password_policy,
                      min_length: parseInt(e.target.value)
                    }
                  })}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={securityForm.password_policy.require_uppercase}
                    onChange={(e) => setSecurityForm({
                      ...securityForm,
                      password_policy: {
                        ...securityForm.password_policy,
                        require_uppercase: e.target.checked
                      }
                    })}
                  />
                  <span className="label-text">Require Uppercase Letters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={securityForm.password_policy.require_numbers}
                    onChange={(e) => setSecurityForm({
                      ...securityForm,
                      password_policy: {
                        ...securityForm.password_policy,
                        require_numbers: e.target.checked
                      }
                    })}
                  />
                  <span className="label-text">Require Numbers</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={securityForm.password_policy.require_special_char}
                    onChange={(e) => setSecurityForm({
                      ...securityForm,
                      password_policy: {
                        ...securityForm.password_policy,
                        require_special_char: e.target.checked
                      }
                    })}
                  />
                  <span className="label-text">Require Special Characters</span>
                </label>
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        <div className="flex justify-end">
          <SaveButton isLoading={isUpdatingSecurity} />
        </div>
      </form>

      {/* Admin Users Management */}
      <SettingsSectionCard
        title="Admin Users"
        description="Manage system administrators and their permissions"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-800">Administrator Accounts</h4>
            <button
              type="button"
              onClick={() => setShowUserModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Add Admin User
            </button>
          </div>

          <AdminUserTable
            users={adminUsers || []}
            onEditUser={(user) => console.log('Edit user:', user)}
            onDeleteUser={async (userId) => {
              try {
                await deleteAdminUser(userId)
              } catch (error) {
                console.error('Failed to delete user:', error)
              }
            }}
          />
        </div>
      </SettingsSectionCard>

      {/* Role & Permission Editor */}
      <AdminRoleEditor />

      {/* API Keys Management */}
      <SettingsSectionCard
        title="API Keys"
        description="Manage API keys for system integration"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-800">Active API Keys</h4>
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Key size={16} />
              Generate New Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys?.map((apiKey) => (
              <APIKeyDisplay
                key={apiKey.id}
                apiKey={apiKey}
                onRevoke={async () => {
                  try {
                    await revokeApiKey(apiKey.id)
                  } catch (error) {
                    console.error('Failed to revoke API key:', error)
                  }
                }}
              />
            ))}
          </div>
        </div>
      </SettingsSectionCard>

      {/* Activity Logs */}
      <SettingsSectionCard
        title="Activity Logs"
        description="Recent system activities and admin actions"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-green-500" />
              <div>
                <div className="font-medium">User login</div>
                <div className="text-sm text-gray-600">admin@carrental.com - 2 minutes ago</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Successful</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Edit size={16} className="text-blue-500" />
              <div>
                <div className="font-medium">Settings updated</div>
                <div className="text-sm text-gray-600">Booking settings modified - 1 hour ago</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  )
}

export default SecuritySettings