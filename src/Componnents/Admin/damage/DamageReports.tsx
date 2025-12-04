// components/damage/DamageReports.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { AlertTriangle, BarChart3, List, Plus, Car, Users, Calendar } from 'lucide-react'
import DamageDashboard from './DamageDashboard'
import DamageReportList from './DamageReportList'
import DamageAnalytics from './DamageAnalytics'
import CreateDamageReportModal from './CreateDamageReportModal'

const DamageReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="text-orange-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Damage Reports</h1>
            <p className="text-gray-600">Manage vehicle damage incidents and repairs</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            New Report
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
          className={`tab ${activeTab === 'reports' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <List size={16} className="mr-2" />
          All Reports
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Car size={16} className="mr-2" />
          Cost Analytics
        </button>
      </div>

      {/* Render Active Tab */}
      {activeTab === 'dashboard' && <DamageDashboard />}
      {activeTab === 'reports' && <DamageReportList />}
      {activeTab === 'analytics' && <DamageAnalytics />}

      {/* Create Damage Report Modal */}
      <CreateDamageReportModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onReportCreated={() => {
          // Refresh data if needed
          setShowCreateModal(false)
        }}
      />
    </AdminDashboardLayout>
  )
}

export default DamageReports