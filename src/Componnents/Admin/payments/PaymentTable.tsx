// components/payments/PaymentTable.tsx
import React, { useState } from 'react'
import { MoreVertical, Eye, CheckCircle, XCircle, RefreshCw, Edit, Trash2, CreditCard, User, Calendar } from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import Swal from 'sweetalert2'
import PaymentStatusBadge from './PaymentStatusBadge'
import PaymentMethodBadge from './PaymentMethodBadge'
import PaymentDetailsModal from './PaymentDetailsModal'
import CompletePaymentModal from './CompletePaymentModal'
import RefundPaymentModal from './RefundPaymentModal'
import UpdateTransactionModal from './UpdateTransactionModal'

interface PaymentTableProps {
  payments: any[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onRefetch: () => void
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onRefetch
}) => {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  const [completePayment] = PaymentApi.useCompletePaymentMutation()
  const [failPayment] = PaymentApi.useFailPaymentMutation()
  const [deletePayment] = PaymentApi.useDeletePaymentMutation()

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
      day: 'numeric'
    })
  }

  // Handle complete payment
  const handleCompletePayment = async (payment: any) => {
    setSelectedPayment(payment)
    setShowCompleteModal(true)
  }

  // Handle fail payment
  const handleFailPayment = async (paymentId: number, customerName: string) => {
    const result = await Swal.fire({
      title: 'Mark as Failed?',
      text: `Are you sure you want to mark payment for ${customerName} as failed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, mark as failed',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await failPayment(paymentId).unwrap()
        Swal.fire('Updated!', 'Payment has been marked as failed.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to update payment status.', 'error')
      }
    }
  }

  // Handle refund payment
  const handleRefundPayment = async (payment: any) => {
    setSelectedPayment(payment)
    setShowRefundModal(true)
  }

  // Handle update transaction code
  const handleUpdateTransaction = async (payment: any) => {
    setSelectedPayment(payment)
    setShowTransactionModal(true)
  }

  // Handle delete payment
  const handleDeletePayment = async (paymentId: number, customerName: string) => {
    const result = await Swal.fire({
      title: 'Delete Payment?',
      text: `Are you sure you want to delete payment for ${customerName}? This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await deletePayment(paymentId).unwrap()
        Swal.fire('Deleted!', 'Payment has been deleted.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete payment.', 'error')
      }
    }
  }

  // View payment details
  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment)
    setShowDetailsModal(true)
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CreditCard className="mx-auto mb-4 text-green-600" size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Found</h3>
        <p className="text-gray-500">No payments match your search criteria.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left font-semibold text-gray-700">Payment ID</th>
                <th className="text-left font-semibold text-gray-700">Customer</th>
                <th className="text-left font-semibold text-gray-700">Booking ID</th>
                <th className="text-left font-semibold text-gray-700">Amount</th>
                <th className="text-left font-semibold text-gray-700">Method</th>
                <th className="text-left font-semibold text-gray-700">Transaction Code</th>
                <th className="text-left font-semibold text-gray-700">Payment Date</th>
                <th className="text-left font-semibold text-gray-700">Status</th>
                <th className="text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="font-bold text-gray-800">#{payment.payment_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-800">{payment.customer_name}</div>
                        <div className="text-xs text-gray-500">{payment.customer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">#{payment.booking_id}</td>
                  <td className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                    {payment.refund_amount > 0 && (
                      <div className="text-xs text-red-600">
                        -{formatCurrency(payment.refund_amount)}
                      </div>
                    )}
                  </td>
                  <td>
                    <PaymentMethodBadge method={payment.payment_method} />
                  </td>
                  <td className="font-mono text-sm">
                    {payment.transaction_code || 'N/A'}
                  </td>
                  <td className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(payment.payment_date)}
                    </div>
                  </td>
                  <td>
                    <PaymentStatusBadge status={payment.payment_status} />
                  </td>
                  <td className="text-center">
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                        <li>
                          <button 
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </li>
                        
                        {/* Complete Payment */}
                        {payment.payment_status === 'Pending' && (
                          <li>
                            <button 
                              onClick={() => handleCompletePayment(payment)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Paid
                            </button>
                          </li>
                        )}

                        {/* Fail Payment */}
                        {payment.payment_status === 'Pending' && (
                          <li>
                            <button 
                              onClick={() => handleFailPayment(payment.payment_id, payment.customer_name)}
                              className="text-orange-600 hover:bg-orange-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Mark as Failed
                            </button>
                          </li>
                        )}

                        {/* Refund Payment */}
                        {(payment.payment_status === 'Completed' || payment.payment_status === 'Partially_Refunded') && (
                          <li>
                            <button 
                              onClick={() => handleRefundPayment(payment)}
                              className="text-purple-600 hover:bg-purple-50"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Process Refund
                            </button>
                          </li>
                        )}

                        {/* Update Transaction Code */}
                        <li>
                          <button 
                            onClick={() => handleUpdateTransaction(payment)}
                            className="text-yellow-600 hover:bg-yellow-50"
                          >
                            <Edit className="w-4 h-4" />
                            Update Transaction
                          </button>
                        </li>

                        <li>
                          <button 
                            onClick={() => handleDeletePayment(payment.payment_id, payment.customer_name)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Payment
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <select 
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </span>
            </div>
            
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-sm">Page {currentPage}</button>
              <button 
                className="join-item btn btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && (
        <PaymentDetailsModal 
          payment={selectedPayment}
          onClose={() => setShowDetailsModal(false)}
          onPaymentUpdated={onRefetch}
        />
      )}

      {showCompleteModal && (
        <CompletePaymentModal 
          payment={selectedPayment}
          onClose={() => setShowCompleteModal(false)}
          onPaymentCompleted={onRefetch}
        />
      )}

      {showRefundModal && (
        <RefundPaymentModal 
          payment={selectedPayment}
          onClose={() => setShowRefundModal(false)}
          onRefundProcessed={onRefetch}
        />
      )}

      {showTransactionModal && (
        <UpdateTransactionModal 
          payment={selectedPayment}
          onClose={() => setShowTransactionModal(false)}
          onTransactionUpdated={onRefetch}
        />
      )}
    </>
  )
}

export default PaymentTable