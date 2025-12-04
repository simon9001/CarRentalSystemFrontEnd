// components/payments/PaymentCardSkeleton.tsx
import React from 'react'

const PaymentCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentCardSkeleton