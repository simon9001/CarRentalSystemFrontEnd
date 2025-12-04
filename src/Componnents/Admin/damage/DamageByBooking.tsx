// components/damage/DamageByBooking.tsx
import React, { useState } from 'react'
import { useParams } from 'react-router'
import { ArrowLeft, Car, User, Calendar, DollarSign } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'

const DamageByBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: reports, isLoading, error } = DamageApi.useGetDamageReportsByBookingQuery(
    Number(bookingId),
    { skip: !bookingId }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading damage reports...</span>
      </div>
    )
  }

  if (error || !reports) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
        <p className="text-red-600">Unable to fetch damage reports for this booking.</p>
      </div>
    )
  }

  const bookingInfo = reports[0] // First report contains booking info

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-circle">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Damage Reports - Booking #{bookingId}
            </h1>
            <p className="text-gray-600">
              {reports.length} damage report{reports.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      {bookingInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">{bookingInfo.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Car className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-semibold">{bookingInfo.make} {bookingInfo.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">
                  {formatDate(bookingInfo.pickup_date)} - {formatDate(bookingInfo.return_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-orange-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Damage Cost</p>
                <p className="font-semibold text-red-600">
                  {formatCurrency(reports.reduce((sum, report) => sum + report.damage_cost, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Damage Reports Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50">
                <th>Incident ID</th>
                <th>Description</th>
                <th>Date Recorded</th>
                <th>Damage Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.incident_id}>
                  <td className="font-bold">#{report.incident_id}</td>
                  <td>
                    <div className="max-w-xs truncate" title={report.incident_description}>
                      {report.incident_description}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">
                    {formatDate(report.date_recorded)}
                  </td>
                  <td className="font-semibold text-red-600">
                    {formatCurrency(report.damage_cost)}
                  </td>
                  <td>
                    <span className={`badge ${
                      report.status === 'Reported' ? 'badge-warning' :
                      report.status === 'Assessed' ? 'badge-info' :
                      report.status === 'Repaired' ? 'badge-secondary' : 'badge-success'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DamageByBooking