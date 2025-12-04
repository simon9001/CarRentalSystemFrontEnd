// src/components/admin/LoyaltyPointsModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Award, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import Swal from 'sweetalert2'
// import { UpdateLoyaltyPointsRequest, AddLoyaltyPointsRequest } from '../../types/HeroTypes'

interface LoyaltyPointsModalProps {
    customerId: number
    onClose: () => void
    onSuccess: () => void
}

const LoyaltyPointsModal: React.FC<LoyaltyPointsModalProps> = ({ customerId, onClose, onSuccess }) => {
    const { data: customer } = CustomerApi.useGetCustomerByIdQuery(customerId)
    const [updateLoyaltyPoints] = CustomerApi.useUpdateLoyaltyPointsMutation()
    const [addLoyaltyPoints] = CustomerApi.useAddLoyaltyPointsMutation()
    
    const [action, setAction] = useState<'set' | 'add'>('add')
    const [points, setPoints] = useState<number>(0)
    const [newTotal, setNewTotal] = useState<number>(0)

    useEffect(() => {
        if (customer) {
            setNewTotal(customer.loyalty_points)
        }
    }, [customer])

    useEffect(() => {
        if (customer) {
            if (action === 'set') {
                setNewTotal(points)
            } else {
                setNewTotal(customer.loyalty_points + points)
            }
        }
    }, [points, action, customer])

    const handlePointsChange = (value: number) => {
        const newPoints = Math.max(0, value)
        setPoints(newPoints)
    }

    const quickAddPoints = (amount: number) => {
        if (action === 'add') {
            setPoints(prev => Math.max(0, prev + amount))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customer) return

        if (points === 0 && action === 'add') {
            Swal.fire('Info!', 'No points to add.', 'info')
            return
        }

        const result = await Swal.fire({
            title: `${action === 'set' ? 'Set' : 'Add'} Points?`,
            html: `
                <div class="text-left">
                    <p>You are about to ${action === 'set' ? 'set' : 'add'} loyalty points for:</p>
                    <p class="font-semibold">${customer.username}</p>
                    <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span>Current Points:</span>
                            <span class="font-bold text-gray-700">${customer.loyalty_points}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span>${action === 'set' ? 'New Points:' : 'Points to Add:'}</span>
                            <span class="font-bold ${action === 'add' ? 'text-green-600' : 'text-blue-600'}">
                                ${action === 'add' ? '+' : ''}${points}
                            </span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span>New Total:</span>
                            <span class="font-bold text-green-600">${newTotal}</span>
                        </div>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action === 'set' ? 'set' : 'add'} points!`
        })

        if (result.isConfirmed) {
            try {
                if (action === 'set') {
                    await updateLoyaltyPoints({ 
                        customer_id: customerId, 
                        loyalty_points: { loyalty_points: points } 
                    }).unwrap()
                } else {
                    await addLoyaltyPoints({ 
                        customer_id: customerId, 
                        points: { points_to_add: points } 
                    }).unwrap()
                }
                onSuccess()
            } catch (error) {
                Swal.fire('Error!', 'Failed to update loyalty points.', 'error')
            }
        }
    }

    if (!customer) return null

    const pointsChange = newTotal - customer.loyalty_points

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-yellow-600" size={24} />
                        Loyalty Points
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Customer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <h3 className="font-semibold text-gray-800">{customer.username}</h3>
                                <p className="text-sm text-gray-600">{customer.email}</p>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <Award className="text-yellow-500" size={20} />
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {customer.loyalty_points}
                                    </span>
                                    <span className="text-sm text-gray-500">current points</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Type */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Action Type</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="add"
                                        checked={action === 'add'}
                                        onChange={(e) => setAction(e.target.value as 'add' | 'set')}
                                        className="hidden"
                                    />
                                    <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                                        action === 'add'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center justify-center gap-1">
                                            <Plus size={16} />
                                            <span className="font-medium">Add Points</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="set"
                                        checked={action === 'set'}
                                        onChange={(e) => setAction(e.target.value as 'add' | 'set')}
                                        className="hidden"
                                    />
                                    <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                                        action === 'set'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center justify-center gap-1">
                                            <TrendingUp size={16} />
                                            <span className="font-medium">Set Points</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Points Input */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">
                                    {action === 'add' ? 'Points to Add' : 'New Points Total'} *
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={points}
                                    onChange={(e) => handlePointsChange(Number(e.target.value))}
                                    className="input input-bordered w-full pr-16 text-lg font-semibold"
                                    min="0"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => handlePointsChange(points - 1)}
                                        className="btn btn-ghost btn-sm rounded-l-none border-l border-gray-300"
                                        disabled={points <= 0}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePointsChange(points + 1)}
                                        className="btn btn-ghost btn-sm rounded-r-none"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Add Buttons (only for add action) */}
                        {action === 'add' && (
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {[10, 50, 100, 500].map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => quickAddPoints(amount)}
                                        className="btn btn-outline btn-sm"
                                    >
                                        +{amount}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-2">Summary</div>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Current:</span>
                                    <span className="font-semibold">{customer.loyalty_points}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Change:</span>
                                    <span className={`font-semibold flex items-center gap-1 ${
                                        pointsChange > 0 ? 'text-green-600' : 
                                        pointsChange < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {pointsChange > 0 ? <TrendingUp size={14} /> : 
                                         pointsChange < 0 ? <TrendingDown size={14} /> : null}
                                        {pointsChange > 0 ? '+' : ''}{pointsChange}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>New Total:</span>
                                    <span className="text-green-600">{newTotal}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={action === 'add' && points === 0}
                        >
                            {action === 'set' ? 'Set Points' : 'Add Points'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoyaltyPointsModal