// components/payments/UpdateTransactionModal.tsx
import React, { useState } from 'react'
import { X, Edit, CreditCard } from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import Swal from 'sweetalert2'

interface UpdateTransactionModalProps {
  payment: any
  onClose: () => void
  onTransactionUpdated: () => void
}

const UpdateTransactionModal: React.FC<UpdateTransactionModalProps> = ({ 
  payment, 
  onClose, 
  onTransactionUpdated 
}) => {
  const [transactionCode, setTransactionCode] = useState(payment.transaction_code || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [updatePaymentTransactionCode] = PaymentApi.useUpdatePaymentTransactionCodeMutation()

  const handleUpdateTransaction = async () => {
    if (!transactionCode.trim()) {
      Swal.fire('Validation Error', 'Please enter a transaction code.', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePaymentTransactionCode({
        payment_id: payment.payment_id,
        transaction_code: transactionCode
      }).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: 'Transaction code has been updated.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

      onTransactionUpdated()
      onClose()
    } catch (error: any) {
      console.error('Failed to update transaction code:', error)
      Swal.fire({
        title: 'Error!',
        text: error?.data?.message || 'Failed to update transaction code. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!payment) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Edit className="text-yellow-600" size={24} />
            <h3 className="text-lg font-bold">Update Transaction Code</h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-yellow-600" size={20} />
              <div>
                <p className="font-semibold">Payment #{payment.payment_id}</p>
                <p className="text-sm text-yellow-700">
                  {payment.customer_name} • {payment.payment_method}
                </p>
                <p className="text-sm text-yellow-700">
                  Current: {payment.transaction_code || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">New Transaction Code <span className="text-red-500">*</span></span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full"
              placeholder="Enter new transaction code (e.g., MPSA123456)"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              disabled={isSubmitting}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                This will update the transaction code for payment verification
              </span>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Updating the transaction code helps with payment tracking 
              and reconciliation. Ensure the code matches the actual payment transaction.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-action">
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdateTransaction} 
            className="btn btn-warning"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Updating...
              </>
            ) : (
              <>
                <Edit size={16} />
                Update Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateTransactionModal