// components/payments/PaymentManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { CreditCard, BarChart3, List, DollarSign, TrendingUp } from 'lucide-react'
import PaymentDashboard from './PaymentDashboard'
import PaymentList from './PaymentList'
import PaymentAnalytics from './PaymentAnalytics'

const PaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Payment Management</h1>
            <p className="text-gray-600">Manage payments, refunds, and revenue tracking</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className="btn btn-outline btn-sm"
          >
            <TrendingUp size={16} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="btn btn-primary btn-sm"
          >
            <DollarSign size={16} />
            View All Payments
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
          All Payments
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={16} className="mr-2" />
          Analytics
        </button>
      </div>

      {/* Render Active Tab */}
      {activeTab === 'dashboard' && <PaymentDashboard />}
      {activeTab === 'reports' && <PaymentList />}
      {activeTab === 'analytics' && <PaymentAnalytics />}
    </AdminDashboardLayout>
  )
}

export default PaymentManagement