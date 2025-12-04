// StaffManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Users, BarChart3, Activity, Plus } from 'lucide-react'
import StaffDashboard from './StaffDashboard'
import StaffList from './StaffList'
import ActivityLogsModal from './ActivityLogsModal'
import CreateStaffModal from './CreateStaffModal'

const StaffManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showActivityLogs, setShowActivityLogs] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Staff Management</h1>
            <p className="text-gray-600">Manage staff members, profiles, and employment details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowActivityLogs(true)}
            className="btn btn-outline btn-sm"
          >
            <Activity size={16} />
            Activity Logs
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-gray-100 p-1 rounded-lg mb-6">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} className="mr-2" />
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'staffList' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('staffList')}
        >
          <Users size={16} className="mr-2" />
          Staff List
        </button>
      </div>

      {/* Render Active Tab */}
      {activeTab === 'dashboard' && <StaffDashboard />}
      {activeTab === 'staffList' && <StaffList />}

      {/* Modals */}
      <ActivityLogsModal 
        isOpen={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
      />

      <CreateStaffModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStaffCreated={() => {
          // Refresh data if needed
          setShowCreateModal(false)
        }}
      />
    </AdminDashboardLayout>
  )
}

export default StaffManagement