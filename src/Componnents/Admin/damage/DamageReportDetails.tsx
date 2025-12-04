// components/damage/DamageReportDetails.tsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { 
  ArrowLeft, Edit, Download, Printer, Share2, 
  Car, User, Calendar, DollarSign, FileText, 
  MapPin, Clock, CheckCircle, AlertTriangle, Wrench 
} from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'
import Swal from 'sweetalert2'

const DamageReportDetails: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: report, isLoading, error } = DamageApi.useGetDamageReportByIdQuery(
    Number(incidentId), 
    { skip: !incidentId }
  )

  const [updateDamageReportStatus] = DamageApi.useUpdateDamageReportStatusMutation()
  const [updateDamageCost] = DamageApi.useUpdateDamageCostMutation()

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

  // Get status configuration
  const getStatusConfig = (status: string) => {
    const config: { [key: string]: { icon: any; color: string; bgColor: string; description: string } } = {
      'Reported': { 
        icon: AlertTriangle, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        description: 'Damage has been reported and is awaiting assessment'
      },
      'Assessed': { 
        icon: Clock, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        description: 'Damage has been assessed and repair cost estimated'
      },
      'Repaired': { 
        icon: Wrench, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100',
        description: 'Vehicle has been repaired and is ready for inspection'
      },
      'Closed': { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        description: 'Damage report has been closed and resolved'
      }
    }
    return config[status] || config['Reported']
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!incidentId) return

    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Change status from ${report?.status} to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await updateDamageReportStatus({
          incident_id: Number(incidentId),
          status: newStatus
        }).unwrap()
        Swal.fire('Updated!', 'Status has been updated.', 'success')
      } catch (error) {
        Swal.fire('Error!', 'Failed to update status.', 'error')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading damage report...</span>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Damage Report Not Found</h3>
        <p className="text-red-600 mb-4">The requested damage report could not be loaded.</p>
        <button 
          onClick={() => navigate('/damage-reports')}
          className="btn btn-primary"
        >
          Back to Reports
        </button>
      </div>
    )
  }

  const StatusConfig = getStatusConfig(report.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/damage-reports')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Damage Report #{report.incident_id}
            </h1>
            <p className="text-gray-600">
              Created on {formatDate(report.date_recorded)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            <Printer size={16} />
            Print
          </button>
          <button className="btn btn-outline btn-sm">
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-outline btn-sm">
            <Share2 size={16} />
            Share
          </button>
          <button className="btn btn-primary btn-sm">
            <Edit size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-6 ${StatusConfig.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusConfig.icon className={StatusConfig.color} size={32} />
            <div>
              <h3 className="text-lg font-semibold">Status: {report.status}</h3>
              <p className="text-gray-700">{StatusConfig.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(report.damage_cost)}
            </p>
            <p className="text-sm text-gray-700">Damage Cost</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-gray-100 p-1 rounded-lg">
        <button 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} className="mr-2" />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={16} className="mr-2" />
          Timeline
        </button>
        <button 
          className={`tab ${activeTab === 'photos' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          <MapPin size={16} className="mr-2" />
          Photos
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Incident Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Incident Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {report.incident_description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Recorded</label>
                      <p className="mt-1 text-gray-900">{formatDate(report.date_recorded)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resolved Date</label>
                      <p className="mt-1 text-gray-900">{formatDate(report.resolved_date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Damage Cost</label>
                      <p className="mt-1 text-2xl font-bold text-red-600">
                        {formatCurrency(report.damage_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Car size={20} />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-3">
                      <Car className="text-blue-600 mx-auto" size={32} />
                    </div>
                    <p className="font-semibold text-lg">{report.make} {report.model}</p>
                    <p className="text-gray-600">{report.year}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Registration Number</label>
                      <p className="font-mono font-semibold">{report.registration_number}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Color</label>
                      <p className="font-semibold capitalize">{report.color}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">VIN Number</label>
                      <p className="font-mono text-sm">{report.vin_number}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Vehicle Type</label>
                      <p className="font-semibold capitalize">{report.vehicle_type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-semibold">Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Status Timeline</h3>
              <div className="space-y-6">
                {/* Reported */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle size={16} className="text-white" />
                    </div>
                    <div className="flex-1 w-0.5 bg-orange-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold">Reported</p>
                    <p className="text-sm text-gray-600">{formatDate(report.date_recorded)}</p>
                    <p className="text-gray-700 mt-1">Damage incident was reported by staff</p>
                  </div>
                </div>

                {/* Assessed */}
                {report.status !== 'Reported' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Clock size={16} className="text-white" />
                      </div>
                      <div className="flex-1 w-0.5 bg-blue-200 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-semibold">Assessed</p>
                      <p className="text-sm text-gray-600">
                        {report.status === 'Reported' ? 'Pending' : formatDate(report.date_recorded)}
                      </p>
                      <p className="text-gray-700 mt-1">Damage has been assessed and cost estimated</p>
                    </div>
                  </div>
                )}

                {/* Repaired */}
                {(report.status === 'Repaired' || report.status === 'Closed') && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Wrench size={16} className="text-white" />
                      </div>
                      <div className="flex-1 w-0.5 bg-purple-200 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-semibold">Repaired</p>
                      <p className="text-sm text-gray-600">
                        {report.status === 'Assessed' ? 'Pending' : formatDate(report.date_recorded)}
                      </p>
                      <p className="text-gray-700 mt-1">Vehicle repairs have been completed</p>
                    </div>
                  </div>
                )}

                {/* Closed */}
                {report.status === 'Closed' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Closed</p>
                      <p className="text-sm text-gray-600">{formatDate(report.resolved_date)}</p>
                      <p className="text-gray-700 mt-1">Damage report has been resolved and closed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Damage Photos</h3>
              {report.photos ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Photo gallery implementation would go here */}
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="text-gray-400" size={32} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">No photos available for this damage report</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <User size={18} />
              Customer Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Full Name</label>
                <p className="font-medium">{report.customer_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Email</label>
                <p className="text-sm break-all">{report.customer_email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Phone Number</label>
                <p className="text-sm">{report.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Booking Information
            </h4>
            <div className="space-y-3">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => handleStatusUpdate('Assessed')}
                className="btn btn-outline btn-sm w-full justify-start"
                disabled={report.status === 'Assessed' || report.status === 'Repaired' || report.status === 'Closed'}
              >
                <Clock size={14} />
                Mark as Assessed
              </button>
              <button 
                onClick={() => handleStatusUpdate('Repaired')}
                className="btn btn-outline btn-sm w-full justify-start"
                disabled={report.status === 'Repaired' || report.status === 'Closed'}
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

          {/* Cost Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Cost Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Damage Cost</span>
                <span className="font-semibold text-red-600">{formatCurrency(report.damage_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Booking Total</span>
                <span className="font-semibold text-green-600">{formatCurrency(report.final_total)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Net Amount</span>
                  <span className="font-bold">
                    {formatCurrency(report.final_total - report.damage_cost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DamageReportDetails