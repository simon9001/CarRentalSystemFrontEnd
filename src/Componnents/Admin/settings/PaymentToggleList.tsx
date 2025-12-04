// components/settings/PaymentToggleList.tsx
import React from 'react'
import { CreditCard, Smartphone, Building } from 'lucide-react'

interface PaymentToggleListProps {
  enabledMethods: string[]
  onChange: (methods: string[]) => void
}

const PaymentToggleList: React.FC<PaymentToggleListProps> = ({ enabledMethods, onChange }) => {
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Mobile money payments via M-Pesa',
      icon: Smartphone,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, MasterCard, and other card payments',
      icon: CreditCard,
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank transfers and wire payments',
      icon: Building,
    },
  ]

  const toggleMethod = (methodId: string) => {
    if (enabledMethods.includes(methodId)) {
      onChange(enabledMethods.filter(id => id !== methodId))
    } else {
      onChange([...enabledMethods, methodId])
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Enabled Payment Methods</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isEnabled = enabledMethods.includes(method.id)
          
          return (
            <div
              key={method.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                isEnabled
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => toggleMethod(method.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  isEnabled ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={isEnabled}
                  onChange={() => toggleMethod(method.id)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentToggleList