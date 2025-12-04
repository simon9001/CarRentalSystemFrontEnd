// src/components/admin/CustomerManagement.tsx
import React, { useState, useCallback, useMemo } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { 
  Users, 
  Plus, 
  Shield, 
  AlertTriangle, 
  Clock,  
  BarChart3 
} from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import { UserApi } from '../../../features/Api/UsersApi'
import Swal from 'sweetalert2'
import CustomerOverview from './CustomerOverview'
import CreateCustomerModal from './CreateCustomerModal'
import CustomerDetailsModal from './CustomerDetailsModal'
import EditCustomerModal from './EditCustomerModal'
import VerificationModal from './VerificationModal'
import AccountStatusModal from './AccountStatusModal'
import LoyaltyPointsModal from './LoyaltyPointsModal'
import LicenseAlerts from './LicenseAlerts'
import RoleManagementModal from '../Users/RoleManagementModal'
import type { CustomerDetailsResponse } from '../../../types/CustomerTypes'
import type { UserResponse } from '../../../types/UserTypes'

type ActiveTab = 'overview' | 'create' | 'alerts' | 'stats'

interface CustomerStats {
  total: number
  active: number
  suspended: number
  verified: number
  pending: number
  expiredLicenses: number
  expiringLicenses: number
}

interface ModalState {
  viewCustomer: number | null
  editCustomer: number | null
  verifyCustomer: number | null
  statusCustomer: number | null
  loyaltyCustomer: number | null
  roleCustomer: number | null
}

// Define type for customer with user info
interface CustomerWithUser extends CustomerDetailsResponse {
  username?: string
  email?: string
  phone_number?: string | null
  address?: string | null
  role?: string
  is_active?: boolean
}

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [modalState, setModalState] = useState<ModalState>({
    viewCustomer: null,
    editCustomer: null,
    verifyCustomer: null,
    statusCustomer: null,
    loyaltyCustomer: null,
    roleCustomer: null,
  })

  // RTK Query hooks for CUSTOMER DETAILS
  const { 
    data: customerDetails = [], 
    isLoading: customersLoading, 
    error: customersError, 
    refetch: refetchCustomers 
  } = CustomerApi.useGetAllCustomerDetailsQuery()
  
  const { 
    data: expiredLicenses = [], 
    refetch: refetchExpiredLicenses 
  } = CustomerApi.useGetCustomersWithExpiredLicensesQuery()
  
  const { 
    data: expiringLicenses = [], 
    refetch: refetchExpiringLicenses 
  } = CustomerApi.useGetCustomersWithLicensesExpiringSoonQuery()
  
  const { 
    data: statistics 
  } = CustomerApi.useGetCustomerStatisticsQuery()

  // Get user data for each customer
  const { data: userData = [], isLoading: usersLoading } = UserApi.useGetAllUsersQuery()

  // Combine customer details with user info
  const customersWithUserInfo: CustomerWithUser[] = useMemo(() => {
    if (!customerDetails.length || !userData.length) return customerDetails as CustomerWithUser[]
    
    return customerDetails.map(customer => {
      const user = userData.find(u => u.user_id === customer.customer_id)
      if (!user) return customer as CustomerWithUser
      
      return {
        ...customer,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        is_active: user.is_active
      }
    })
  }, [customerDetails, userData])

  // Memoized customer statistics
  const customerStats: CustomerStats = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.total || 0,
        active: statistics.active || 0,
        suspended: statistics.suspended || 0,
        verified: statistics.verified || 0,
        pending: statistics.pending || 0,
        expiredLicenses: statistics.expiredLicenses || 0,
        expiringLicenses: statistics.expiringLicenses || 0,
      }
    }

    // Calculate from customers data as fallback
    return {
      total: customersWithUserInfo.length || 0,
      active: customersWithUserInfo.filter(c => c.account_status === 'Active').length || 0,
      suspended: customersWithUserInfo.filter(c => c.account_status === 'Suspended').length || 0,
      verified: customersWithUserInfo.filter(c => c.verification_status === 'Verified').length || 0,
      pending: customersWithUserInfo.filter(c => c.verification_status === 'Pending').length || 0,
      expiredLicenses: expiredLicenses.length || 0,
      expiringLicenses: expiringLicenses.length || 0,
    }
  }, [statistics, customersWithUserInfo, expiredLicenses, expiringLicenses])

  // Helper functions for calculations
  const calculatePercentage = useCallback((value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }, [])

  const showSuccessToast = useCallback((title: string, text: string) => {
    Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    })
  }, [])

  // // Refresh all data
  // const handleRefresh = useCallback(() => {
  //   refetchCustomers()
  //   refetchExpiredLicenses()
  //   refetchExpiringLicenses()
  // }, [refetchCustomers, refetchExpiredLicenses, refetchExpiringLicenses])

  // Modal handlers
  const openModal = useCallback((modal: keyof ModalState, customerId: number) => {
    setModalState(prev => ({ ...prev, [modal]: customerId }))
  }, [])

  const closeModal = useCallback((modal: keyof ModalState) => {
    setModalState(prev => ({ ...prev, [modal]: null }))
  }, [])

  const handleModalSuccess = useCallback((
    modal: keyof ModalState, 
    successMessage: string
  ) => {
    closeModal(modal)
    showSuccessToast('Success!', successMessage)
  }, [closeModal, showSuccessToast, ])

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'overview' as ActiveTab, label: 'Customer Overview', icon: Users },
    { id: 'alerts' as ActiveTab, label: 'License Alerts', icon: AlertTriangle },
    { id: 'stats' as ActiveTab, label: 'Statistics', icon: BarChart3 },
    { id: 'create' as ActiveTab, label: 'Add Customer Details', icon: Plus },
  ]

  // Statistics cards configuration
  const statCards = [
    {
      title: 'Total Customers',
      value: customerStats.total,
      icon: Users,
      color: 'purple',
      details: [
        { label: 'Active', value: customerStats.active },
        { label: 'Suspended', value: customerStats.suspended },
      ],
    },
    {
      title: 'Verified',
      value: customerStats.verified,
      icon: Shield,
      color: 'green',
      details: [
        { label: 'Pending', value: customerStats.pending },
        { label: 'Rejected', value: Math.max(0, customerStats.total - customerStats.verified - customerStats.pending) },
      ],
    },
    {
      title: 'License Alerts',
      value: customerStats.expiredLicenses,
      suffix: 'expired',
      icon: AlertTriangle,
      color: 'red',
      details: [
        { label: 'Expiring', value: customerStats.expiringLicenses },
        { label: 'Valid', value: Math.max(0, customerStats.total - customerStats.expiredLicenses) },
      ],
    },
    {
      title: 'Account Health',
      value: calculatePercentage(customerStats.active, customerStats.total),
      suffix: '% active',
      icon: Clock,
      color: 'blue',
      details: [
        { label: 'Active', value: customerStats.active },
        { label: 'Suspended', value: customerStats.suspended },
        { label: 'Inactive', value: Math.max(0, customerStats.total - customerStats.active - customerStats.suspended) },
      ],
    },
  ]

  const isLoading = customersLoading || usersLoading
  const error = customersError

  return (
    <AdminDashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-gray-600">Manage customer details, verification, and license information</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* <button
            onClick={handleRefresh}
            className="btn btn-outline btn-md gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button> */}
          <button
            onClick={() => setActiveTab('create')}
            className="btn btn-primary btn-md gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Customer Details
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <nav className="flex">
          {navigationTabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        customers={customersWithUserInfo}
        isLoading={isLoading}
        error={error}
        customerStats={customerStats}
        calculatePercentage={calculatePercentage}
        onViewCustomer={(id) => openModal('viewCustomer', id)}
        onEditCustomer={(id) => openModal('editCustomer', id)}
        onVerifyCustomer={(id) => openModal('verifyCustomer', id)}
        onStatusCustomer={(id) => openModal('statusCustomer', id)}
        onLoyaltyCustomer={(id) => openModal('loyaltyCustomer', id)}
        onRoleCustomer={(id) => openModal('roleCustomer', id)}
        onCloseCreate={() => setActiveTab('overview')}
        onCreateSuccess={() => handleModalSuccess('viewCustomer', 'Customer details added successfully.')}
        // onRefresh={handleRefresh}
      />

      {/* Modals */}
      <ModalRenderer
        modalState={modalState}
        onCloseModal={closeModal}
        onSuccess={handleModalSuccess}
        // onRefresh={handleRefresh}
      />
    </AdminDashboardLayout>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: number
  suffix?: string
  icon: React.ElementType
  color: string
  details: Array<{ label: string; value: number }>
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  suffix, 
  icon: Icon, 
  color, 
  details 
}) => {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">{value}</p>
            {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="pt-2 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-1">
          {details.map((detail, index) => (
            <div key={index} className="text-xs text-gray-500 truncate">
              {detail.label}: {detail.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Tab Button Component
interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-purple-500 text-purple-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  </button>
)

// Tab Content Component
interface TabContentProps {
  activeTab: ActiveTab
  customers: CustomerWithUser[]
  isLoading: boolean
  error: any
  customerStats: CustomerStats
  calculatePercentage: (value: number, total: number) => number
  onViewCustomer: (id: number) => void
  onEditCustomer: (id: number) => void
  onVerifyCustomer: (id: number) => void
  onStatusCustomer: (id: number) => void
  onLoyaltyCustomer: (id: number) => void
  onRoleCustomer: (id: number) => void
  onCloseCreate: () => void
  onCreateSuccess: () => void
  onRefresh: () => void
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  customers,
  isLoading,
  error,
  customerStats,
  calculatePercentage,
  onViewCustomer,
  onEditCustomer,
  onVerifyCustomer,
  onStatusCustomer,
  onLoyaltyCustomer,
  onRoleCustomer,
  onCloseCreate,
  onCreateSuccess,
  onRefresh,
}) => {
  switch (activeTab) {
    case 'overview':
      return (
        <CustomerOverview
          customers={customers}
          isLoading={isLoading}
          error={error}
          onViewCustomer={onViewCustomer}
          onEditCustomer={onEditCustomer}
          onVerifyCustomer={onVerifyCustomer}
          onStatusCustomer={onStatusCustomer}
          onLoyaltyCustomer={onLoyaltyCustomer}
          onRoleCustomer={onRoleCustomer}
        />
      )

    case 'create':
      return (
        <CreateCustomerModal
          onClose={onCloseCreate}
          onSuccess={() => {
            onCreateSuccess()
            onRefresh()
          }}
        />
      )

    case 'alerts':
      return <LicenseAlerts />

    case 'stats':
      return <StatisticsPanel stats={customerStats} calculatePercentage={calculatePercentage} />
  }
}

// Statistics Panel Component
interface StatisticsPanelProps {
  stats: CustomerStats
  calculatePercentage: (value: number, total: number) => number
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats, calculatePercentage }) => {
  const verificationStats = [
    { label: 'Verified', value: stats.verified, color: 'green', icon: Shield },
    { label: 'Pending', value: stats.pending, color: 'yellow', icon: Clock },
    { 
      label: 'Rejected', 
      value: Math.max(0, stats.total - stats.verified - stats.pending), 
      color: 'red', 
      icon: AlertTriangle 
    },
  ]

  const accountStats = [
    { label: 'Active Accounts', value: stats.active, color: 'green' },
    { label: 'Suspended Accounts', value: stats.suspended, color: 'yellow' },
    { 
      label: 'Inactive Accounts', 
      value: Math.max(0, stats.total - stats.active - stats.suspended), 
      color: 'red' 
    },
  ]

  const licenseStats = [
    { label: 'Expired Licenses', value: stats.expiredLicenses, color: 'red' },
    { label: 'Expiring Soon', value: stats.expiringLicenses, color: 'yellow' },
    { label: 'Valid Licenses', value: Math.max(0, stats.total - stats.expiredLicenses), color: 'green' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Statistics</h3>
      
      {/* Verification Status */}
      <StatSection title="Verification Status" stats={verificationStats} total={stats.total} />
      
      {/* Account Status */}
      <StatSection title="Account Status" stats={accountStats} total={stats.total} />
      
      {/* License Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">License Status</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {licenseStats.map((stat, index) => (
            <StatBox key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Stat Section Component
interface StatSectionProps {
  title: string
  stats: Array<{ label: string; value: number; color: string; icon?: React.ElementType }>
  total: number
}

const StatSection: React.FC<StatSectionProps> = ({ title, stats, total }) => (
  <div className="mb-6">
    <h4 className="font-medium text-gray-700 mb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <StatBox key={index} {...stat} total={total} />
      ))}
    </div>
  </div>
)

// Stat Box Component
interface StatBoxProps {
  label: string
  value: number
  color: string
  icon?: React.ElementType
  total?: number
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color, icon: Icon, total }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }

  const textColor = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  }

  const percentage = total ? Math.round((value / total) * 100) : 0

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className={`text-2xl font-bold ${textColor[color as keyof typeof textColor]}`}>
            {value}
          </p>
        </div>
        {Icon && <Icon className={`w-5 h-5 ${textColor[color as keyof typeof textColor]}`} />}
      </div>
      {total !== undefined && (
        <p className="text-xs mt-2">
          {percentage}% of customers
        </p>
      )}
    </div>
  )
}

// Modal Renderer Component
interface ModalRendererProps {
  modalState: ModalState
  onCloseModal: (modal: keyof ModalState) => void
  onSuccess: (modal: keyof ModalState, message: string) => void
  onRefresh: () => void
}

const ModalRenderer: React.FC<ModalRendererProps> = ({ modalState, onCloseModal, onSuccess, onRefresh }) => {
  const modalConfigs = [
    {
      key: 'viewCustomer' as keyof ModalState,
      component: CustomerDetailsModal,
      props: (id: number) => ({
        customerId: id,
        onClose: () => onCloseModal('viewCustomer'),
        onEdit: () => {
          onCloseModal('viewCustomer')
          onCloseModal('editCustomer')
        },
        onVerify: () => {
          onCloseModal('viewCustomer')
          onCloseModal('verifyCustomer')
        },
        onStatus: () => {
          onCloseModal('viewCustomer')
          onCloseModal('statusCustomer')
        },
        onLoyalty: () => {
          onCloseModal('viewCustomer')
          onCloseModal('loyaltyCustomer')
        },
        onRole: () => {
          onCloseModal('viewCustomer')
          onCloseModal('roleCustomer')
        },
      }),
    },
    {
      key: 'editCustomer' as keyof ModalState,
      component: EditCustomerModal,
      props: (id: number) => ({
        customerId: id,
        onClose: () => onCloseModal('editCustomer'),
        onSuccess: () => onSuccess('editCustomer', 'Customer details updated successfully.'),
      }),
    },
    {
      key: 'verifyCustomer' as keyof ModalState,
      component: VerificationModal,
      props: (id: number) => ({
        customerId: id,
        onClose: () => onCloseModal('verifyCustomer'),
        onSuccess: () => onSuccess('verifyCustomer', 'Verification status updated.'),
      }),
    },
    {
      key: 'statusCustomer' as keyof ModalState,
      component: AccountStatusModal,
      props: (id: number) => ({
        customerId: id,
        onClose: () => onCloseModal('statusCustomer'),
        onSuccess: () => onSuccess('statusCustomer', 'Account status updated.'),
      }),
    },
    {
      key: 'loyaltyCustomer' as keyof ModalState,
      component: LoyaltyPointsModal,
      props: (id: number) => ({
        customerId: id,
        onClose: () => onCloseModal('loyaltyCustomer'),
        onSuccess: () => onSuccess('loyaltyCustomer', 'Loyalty points updated.'),
      }),
    },
    {
      key: 'roleCustomer' as keyof ModalState,
      component: RoleManagementModal,
      props: (id: number) => ({
        userId: id,
        onClose: () => onCloseModal('roleCustomer'),
        onSuccess: () => onSuccess('roleCustomer', 'Customer role updated successfully.'),
      }),
    },
  ]

  return (
    <>
      {modalConfigs.map(({ key, component: Component, props }) => {
        const customerId = modalState[key]
        return customerId && <Component key={key} {...props(customerId)} />
      })}
    </>
  )
}

export default CustomerManagement