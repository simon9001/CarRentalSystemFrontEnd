// components/payments/RefundPaymentModal.tsx
import React, { useState } from 'react'
import { X, RefreshCw, DollarSign } from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import Swal from 'sweetalert2'

interface RefundPaymentModalProps {
  payment: any
  onClose: () => void
  onRefundProcessed: () => void
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({ 
  payment, 
  onClose, 
  onRefundProcessed 
}) => {
  const [refundAmount, setRefundAmount] = useState('')
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [processRefund] = PaymentApi.useProcessRefundMutation()

  const maxRefundAmount = payment.amount - payment.refund_amount

  // Set full refund amount when type changes
  React.useEffect(() => {
    if (refundType === 'full') {
      setRefundAmount(maxRefundAmount.toString())
    } else {
      setRefundAmount('')
    }
  }, [refundType, maxRefundAmount])

  const handleProcessRefund = async () => {
    const amount = parseFloat(refundAmount)
    
    if (!amount || amount <= 0) {
      Swal.fire('Validation Error', 'Please enter a valid refund amount.', 'warning')
      return
    }

    if (amount > maxRefundAmount) {
      Swal.fire('Validation Error', `Refund amount cannot exceed ${maxRefundAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })}.`, 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      await processRefund({
        payment_id: payment.payment_id,
        refund_amount: amount,
        is_partial: refundType === 'partial'
      }).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: `Refund of ${amount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })} has been processed.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

      onRefundProcessed()
      onClose()
    } catch (error: any) {
      console.error('Failed to process refund:', error)
      Swal.fire({
        title: 'Error!',
        text: error?.data?.message || 'Failed to process refund. Please try again.',
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
            <RefreshCw className="text-purple-600" size={24} />
            <h3 className="text-lg font-bold">Process Refund</h3>
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
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="text-purple-600" size={20} />
              <div>
                <p className="font-semibold">Payment #{payment.payment_id}</p>
                <p className="text-sm text-purple-700">
                  {payment.customer_name} • Original Amount: {payment.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
                <p className="text-sm text-purple-700">
                  Already Refunded: {payment.refund_amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Refund Type Selection */}
          <div>
            <label className="label">
              <span className="label-text">Refund Type</span>
            </label>
            <div className="flex gap-4">
              <label className="cursor-pointer label justify-start gap-2">
                <input 
                  type="radio" 
                  name="refundType"
                  className="radio radio-primary"
                  checked={refundType === 'full'}
                  onChange={() => setRefundType('full')}
                  disabled={isSubmitting}
                />
                <span className="label-text">Full Refund ({maxRefundAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })})</span>
              </label>
              <label className="cursor-pointer label justify-start gap-2">
                <input 
                  type="radio" 
                  name="refundType"
                  className="radio radio-primary"
                  checked={refundType === 'partial'}
                  onChange={() => setRefundType('partial')}
                  disabled={isSubmitting}
                />
                <span className="label-text">Partial Refund</span>
              </label>
            </div>
          </div>

          {/* Refund Amount */}
          {refundType === 'partial' && (
            <div>
              <label className="label">
                <span className="label-text">Refund Amount <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  className="input input-bordered w-full pl-10"
                  placeholder="0.00"
                  min="0"
                  max={maxRefundAmount}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Maximum refundable amount: {maxRefundAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </span>
              </label>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. Refund will be recorded 
              in the payment history and may affect revenue reporting.
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
            onClick={handleProcessRefund} 
            className="btn btn-warning"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Process Refund
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RefundPaymentModal