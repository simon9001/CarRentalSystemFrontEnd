// components/payments/PaymentTableSkeleton.tsx
import React from 'react'

const PaymentTableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-gray-50">
              {[...Array(8)].map((_, i) => (
                <th key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex}>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentTableSkeleton