// components/damage/DamageReportModal.tsx
import React, { useState } from 'react'
import { 
  X, Car, User, Calendar, DollarSign, FileText, 
  CheckCircle, Clock, Wrench, AlertTriangle, Image 
} from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'
import Swal from 'sweetalert2'

interface DamageReportModalProps {
  report: any
  onClose: () => void
  onReportUpdated: () => void
}

const DamageReportModal: React.FC<DamageReportModalProps> = ({ report, onClose, onReportUpdated }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const [updateDamageReport] = DamageApi.useUpdateDamageReportMutation()
  const [updateDamageCost] = DamageApi.useUpdateDamageCostMutation()

  if (!report) return null

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    const config: { [key: string]: { icon: any; color: string; bgColor: string } } = {
      'Reported': { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
      'Assessed': { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'Repaired': { icon: Wrench, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'Closed': { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' }
    }
    return config[status] || config['Reported']
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateDamageReport({
        incident_id: report.incident_id,
        updates: { status: newStatus }
      }).unwrap()
      Swal.fire('Success!', `Status updated to ${newStatus}`, 'success')
      onReportUpdated()
    } catch (error) {
      Swal.fire('Error!', 'Failed to update status', 'error')
    }
  }

  // Handle cost update
  const handleCostUpdate = async (newCost: number) => {
    try {
      await updateDamageCost({
        incident_id: report.incident_id,
        damage_cost: newCost
      }).unwrap()
      Swal.fire('Success!', 'Damage cost updated', 'success')
      onReportUpdated()
    } catch (error) {
      Swal.fire('Error!', 'Failed to update damage cost', 'error')
    }
  }

  const StatusConfig = getStatusConfig(report.status)

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${StatusConfig.bgColor}`}>
              <StatusConfig.icon className={StatusConfig.color} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Damage Report #{report.incident_id}</h3>
              <p className="text-sm text-gray-600">Incident recorded on {formatDate(report.date_recorded)}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FileText size={16} className="mr-2" />
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'photos' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <Image size={16} className="mr-2" />
            Photos
          </button>
          <button 
            className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={16} className="mr-2" />
            Timeline
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Incident Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Incident Overview
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1 text-gray-900">{report.incident_description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Damage Cost</label>
                        <p className="mt-1 text-xl font-bold text-red-600">
                          {formatCurrency(report.damage_cost)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <div className="mt-1">
                          <span className={`badge ${getStatusConfig(report.status).bgColor} ${getStatusConfig(report.status).color} badge-lg`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date Recorded</label>
                        <p className="mt-1 text-gray-900">{formatDate(report.date_recorded)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Resolved Date</label>
                        <p className="mt-1 text-gray-900">{formatDate(report.resolved_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Car size={18} />
                    Vehicle Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vehicle</label>
                      <p className="mt-1 font-medium">{report.make} {report.model} ({report.year})</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration</label>
                      <p className="mt-1 font-mono">{report.registration_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Color</label>
                      <p className="mt-1 capitalize">{report.color}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">VIN Number</label>
                      <p className="mt-1 font-mono text-sm">{report.vin_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <User size={16} />
                    Customer Information
                  </h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Name</label>
                      <p className="font-medium">{report.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Email</label>
                      <p className="text-sm">{report.customer_email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Phone</label>
                      <p className="text-sm">{report.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Booking Information
                  </h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Booking ID</label>
                      <p className="font-medium">#{report.booking_id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Pickup Date</label>
                      <p className="text-sm">{formatDate(report.pickup_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Return Date</label>
                      <p className="text-sm">{formatDate(report.return_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Total Amount</label>
                      <p className="text-sm font-semibold">{formatCurrency(report.final_total)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Quick Actions</h5>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleStatusUpdate('Assessed')}
                      className="btn btn-outline btn-sm w-full justify-start"
                      disabled={report.status === 'Assessed'}
                    >
                      <Clock size={14} />
                      Mark as Assessed
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('Repaired')}
                      className="btn btn-outline btn-sm w-full justify-start"
                      disabled={report.status === 'Repaired'}
                    >
                      <Wrench size={14} />
                      Mark as Repaired
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('Closed')}
                      className="btn btn-outline btn-sm w-full justify-start"
                      disabled={report.status === 'Closed'}
                    >
                      <CheckCircle size={14} />
                      Close Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Damage Photos</h4>
              {report.photos ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Photo gallery would go here */}
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="text-gray-400" size={32} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">No photos available for this report</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Status Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Reported</p>
                    <p className="text-sm text-gray-600">{formatDate(report.date_recorded)}</p>
                  </div>
                </div>
                {/* Timeline would continue based on status changes */}
              </div>
            </div>
          )}
        </div>

        <div className="modal-action mt-6 border-t pt-4">
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>
      </div>
    </div>
  )
}

export default DamageReportModal