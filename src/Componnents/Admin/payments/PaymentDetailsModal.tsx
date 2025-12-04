// components/payments/PaymentDetailsModal.tsx
import React, { useState } from 'react'
import { 
  X, CreditCard, User, Calendar, DollarSign, FileText, 
  CheckCircle, Clock, XCircle, RefreshCw, Car, MapPin 
} from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import Swal from 'sweetalert2'
import PaymentStatusBadge from './PaymentStatusBadge'
import PaymentMethodBadge from './PaymentMethodBadge'

interface PaymentDetailsModalProps {
  payment: any
  onClose: () => void
  onPaymentUpdated: () => void
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ payment, onClose, onPaymentUpdated }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const [completePayment] = PaymentApi.useCompletePaymentMutation()
  const [failPayment] = PaymentApi.useFailPaymentMutation()
  const [updatePaymentStatus] = PaymentApi.useUpdatePaymentStatusMutation()

  if (!payment) return null

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

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Change payment status from ${payment.payment_status} to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await updatePaymentStatus({
          payment_id: payment.payment_id,
          payment_status: newStatus
        }).unwrap()
        Swal.fire('Updated!', 'Payment status has been updated.', 'success')
        onPaymentUpdated()
      } catch (error) {
        Swal.fire('Error!', 'Failed to update payment status.', 'error')
      }
    }
  }

  // Handle complete payment
  const handleCompletePayment = async () => {
    try {
      await completePayment({
        payment_id: payment.payment_id,
        transaction_code: payment.transaction_code
      }).unwrap()
      Swal.fire('Completed!', 'Payment has been marked as completed.', 'success')
      onPaymentUpdated()
    } catch (error) {
      Swal.fire('Error!', 'Failed to complete payment.', 'error')
    }
  }

  // Handle fail payment
  const handleFailPayment = async () => {
    const result = await Swal.fire({
      title: 'Mark as Failed?',
      text: `Are you sure you want to mark this payment as failed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, mark as failed',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await failPayment(payment.payment_id).unwrap()
        Swal.fire('Updated!', 'Payment has been marked as failed.', 'success')
        onPaymentUpdated()
      } catch (error) {
        Swal.fire('Error!', 'Failed to update payment status.', 'error')
      }
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-green-600" size={24} />
            <div>
              <h3 className="text-lg font-bold">Payment #{payment.payment_id}</h3>
              <p className="text-sm text-gray-600">
                {payment.customer_name} • {formatDate(payment.payment_date)}
              </p>
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
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard size={18} />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Amount</label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Refund Amount</label>
                      <p className="text-xl font-semibold text-red-600">
                        {formatCurrency(payment.refund_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Net Amount</label>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(payment.amount - payment.refund_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Method</label>
                      <div className="mt-1">
                        <PaymentMethodBadge method={payment.payment_method} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transaction Code</label>
                      <p className="font-mono text-sm mt-1">
                        {payment.transaction_code || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <PaymentStatusBadge status={payment.payment_status} />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Vehicle</label>
                      <p className="font-medium">{payment.make} {payment.model}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Year</label>
                      <p className="font-medium">{payment.year}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Registration</label>
                      <p className="font-mono">{payment.registration_number}</p>
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
                      <label className="text-xs text-gray-600">Full Name</label>
                      <p className="font-medium">{payment.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Email</label>
                      <p className="text-sm break-all">{payment.customer_email}</p>
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
                      <p className="font-medium">#{payment.booking_id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Pickup Date</label>
                      <p className="text-sm">{formatDate(payment.pickup_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Return Date</label>
                      <p className="text-sm">{formatDate(payment.return_date)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Booking Total</label>
                      <p className="text-sm font-semibold">{formatCurrency(payment.final_total)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Quick Actions</h5>
                  <div className="space-y-2">
                    {payment.payment_status === 'Pending' && (
                      <>
                        <button 
                          onClick={handleCompletePayment}
                          className="btn btn-success btn-sm w-full justify-start"
                        >
                          <CheckCircle size={14} />
                          Mark as Paid
                        </button>
                        <button 
                          onClick={handleFailPayment}
                          className="btn btn-error btn-sm w-full justify-start"
                        >
                          <XCircle size={14} />
                          Mark as Failed
                        </button>
                      </>
                    )}
                    {(payment.payment_status === 'Completed' || payment.payment_status === 'Partially_Refunded') && (
                      <button 
                        onClick={() => handleStatusUpdate('Refunded')}
                        className="btn btn-warning btn-sm w-full justify-start"
                      >
                        <RefreshCw size={14} />
                        Process Refund
                      </button>
                    )}
                    {payment.payment_status === 'Failed' && (
                      <button 
                        onClick={() => handleStatusUpdate('Pending')}
                        className="btn btn-info btn-sm w-full justify-start"
                      >
                        <Clock size={14} />
                        Mark as Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-6">Payment Timeline</h4>
              <div className="space-y-6">
                {/* Payment Created */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CreditCard size={16} className="text-white" />
                    </div>
                    <div className="flex-1 w-0.5 bg-blue-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold">Payment Created</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                    <p className="text-gray-700 mt-1">Payment record was created</p>
                  </div>
                </div>

                {/* Status Updates would go here based on payment history */}
                {payment.payment_status !== 'Pending' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        payment.payment_status === 'Completed' ? 'bg-green-500' :
                        payment.payment_status === 'Failed' ? 'bg-red-500' :
                        payment.payment_status === 'Refunded' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}>
                        {payment.payment_status === 'Completed' && <CheckCircle size={16} className="text-white" />}
                        {payment.payment_status === 'Failed' && <XCircle size={16} className="text-white" />}
                        {payment.payment_status === 'Refunded' && <RefreshCw size={16} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold capitalize">{payment.payment_status}</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                      <p className="text-gray-700 mt-1">
                        Payment status updated to {payment.payment_status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                )}
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

export default PaymentDetailsModal