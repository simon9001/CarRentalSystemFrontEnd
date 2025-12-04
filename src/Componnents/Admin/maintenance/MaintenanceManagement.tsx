// components/maintenance/MaintenanceManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Wrench, BarChart3, List, Calendar, Plus} from 'lucide-react'
import MaintenanceDashboard from './MaintenanceDashboard'
import MaintenanceList from './MaintenanceList'
import MaintenanceAnalytics from './MaintenanceAnalytics'
import CreateServiceRecordModal from './CreateServiceRecordModal'

const MaintenanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Wrench className="text-orange-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Maintenance Management</h1>
            <p className="text-gray-600">Manage vehicle service records and maintenance schedules</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className="btn btn-outline btn-sm"
          >
            <BarChart3 size={16} />
            Analytics
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            New Service
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
          className={`tab ${activeTab === 'services' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <List size={16} className="mr-2" />
          All Services
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Calendar size={16} className="mr-2" />
          Analytics
        </button>
      </div>

      {/* Render Active Tab */}
      {activeTab === 'dashboard' && <MaintenanceDashboard />}
      {activeTab === 'services' && <MaintenanceList />}
      {activeTab === 'analytics' && <MaintenanceAnalytics />}

      {/* Create Service Record Modal */}
      <CreateServiceRecordModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onServiceCreated={() => {
          // Refresh data if needed
          setShowCreateModal(false)
        }}
      />
    </AdminDashboardLayout>
  )
}

export default MaintenanceManagement