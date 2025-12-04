// components/payments/PaymentActionsMenu.tsx
import React from 'react'
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye
} from 'lucide-react'

interface PaymentActionsMenuProps {
  payment: any
  onViewDetails: (payment: any) => void
  onCompletePayment: (payment: any) => void
  onFailPayment: (paymentId: number, customerName: string) => void
  onRefundPayment: (payment: any) => void
  onUpdateTransaction: (payment: any) => void
  onDeletePayment: (paymentId: number, customerName: string) => void
}

const PaymentActionsMenu: React.FC<PaymentActionsMenuProps> = ({
  payment,
  onViewDetails,
  onCompletePayment,
  onFailPayment,
  onRefundPayment,
  onUpdateTransaction,
  onDeletePayment
}) => {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
        <MoreVertical className="w-4 h-4" />
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
        <li>
          <button 
            onClick={() => onViewDetails(payment)}
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
              onClick={() => onCompletePayment(payment)}
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
              onClick={() => onFailPayment(payment.payment_id, payment.customer_name)}
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
              onClick={() => onRefundPayment(payment)}
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
            onClick={() => onUpdateTransaction(payment)}
            className="text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="w-4 h-4" />
            Update Transaction
          </button>
        </li>

        <li>
          <button 
            onClick={() => onDeletePayment(payment.payment_id, payment.customer_name)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Payment
          </button>
        </li>
      </ul>
    </div>
  )
}

export default PaymentActionsMenu