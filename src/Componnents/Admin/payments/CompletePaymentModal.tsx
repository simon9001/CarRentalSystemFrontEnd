// components/payments/CompletePaymentModal.tsx
import React, { useState } from 'react'
import { X, CheckCircle, CreditCard } from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import Swal from 'sweetalert2'

interface CompletePaymentModalProps {
  payment: any
  onClose: () => void
  onPaymentCompleted: () => void
}

const CompletePaymentModal: React.FC<CompletePaymentModalProps> = ({ 
  payment, 
  onClose, 
  onPaymentCompleted 
}) => {
  const [transactionCode, setTransactionCode] = useState(payment.transaction_code || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [completePayment] = PaymentApi.useCompletePaymentMutation()

  const handleCompletePayment = async () => {
    if (!transactionCode.trim()) {
      Swal.fire('Validation Error', 'Please enter a transaction code.', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      await completePayment({
        payment_id: payment.payment_id,
        transaction_code: transactionCode
      }).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: 'Payment has been marked as completed.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

      onPaymentCompleted()
      onClose()
    } catch (error: any) {
      console.error('Failed to complete payment:', error)
      Swal.fire({
        title: 'Error!',
        text: error?.data?.message || 'Failed to complete payment. Please try again.',
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
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="text-lg font-bold">Complete Payment</h3>
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
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-600" size={20} />
              <div>
                <p className="font-semibold">Payment #{payment.payment_id}</p>
                <p className="text-sm text-blue-700">
                  {payment.customer_name} • {payment.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Transaction Code <span className="text-red-500">*</span></span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full"
              placeholder="Enter transaction code (e.g., MPSA123456)"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              disabled={isSubmitting}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Required for payment verification
              </span>
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Marking this payment as completed will update the payment status 
              and record the transaction code for future reference.
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
            onClick={handleCompletePayment} 
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Complete Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletePaymentModal