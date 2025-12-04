// src/components/admin/DailyRateModal.tsx
import React, { useState, useEffect } from 'react'
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { CarModelApi } from '../../../features/Api/CarModelApi'
import Swal from 'sweetalert2'
// import { UpdateCarModelDailyRateRequest } from '../../types/HeroTypes'

interface DailyRateModalProps {
    modelId: number
    onClose: () => void
    onSuccess: () => void
}

const DailyRateModal: React.FC<DailyRateModalProps> = ({ modelId, onClose, onSuccess }) => {
    const { data: model } = CarModelApi.useGetCarModelByIdQuery(modelId)
    const [updateCarModelDailyRate] = CarModelApi.useUpdateCarModelDailyRateMutation()
    
    const [newRate, setNewRate] = useState<number>(0)
    const [changePercentage, setChangePercentage] = useState<number>(0)

    useEffect(() => {
        if (model) {
            setNewRate(model.standard_daily_rate)
        }
    }, [model])

    useEffect(() => {
        if (model && newRate !== model.standard_daily_rate) {
            const change = ((newRate - model.standard_daily_rate) / model.standard_daily_rate) * 100
            setChangePercentage(change)
        } else {
            setChangePercentage(0)
        }
    }, [newRate, model])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!model) return

        if (newRate <= 0) {
            Swal.fire('Error!', 'Daily rate must be greater than 0.', 'error')
            return
        }

        if (newRate === model.standard_daily_rate) {
            Swal.fire('Info!', 'No changes made to the daily rate.', 'info')
            onClose()
            return
        }

        const result = await Swal.fire({
            title: 'Update Daily Rate?',
            html: `
                <div class="text-left">
                    <p>You are about to update the daily rate for:</p>
                    <p class="font-semibold">${model.make} ${model.model} ${model.year}</p>
                    <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span>Current Rate:</span>
                            <span class="font-bold text-gray-700">$${model.standard_daily_rate}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span>New Rate:</span>
                            <span class="font-bold text-green-600">$${newRate}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span>Change:</span>
                            <span class="font-bold ${changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}">
                                ${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update rate!'
        })

        if (result.isConfirmed) {
            try {
                await updateCarModelDailyRate({ 
                    model_id: modelId, 
                    daily_rate: { standard_daily_rate: newRate } 
                }).unwrap()
                onSuccess()
            } catch (error) {
                Swal.fire('Error!', 'Failed to update daily rate.', 'error')
            }
        }
    }

    if (!model) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="text-green-600" size={24} />
                        Update Daily Rate
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Model Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <h3 className="font-semibold text-gray-800">
                                    {model.make} {model.model} {model.year}
                                </h3>
                                <p className="text-sm text-gray-600">Model ID: #{model.model_id}</p>
                            </div>
                        </div>

                        {/* Current Rate */}
                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Current Daily Rate</span>
                            </label>
                            <div className="text-2xl font-bold text-gray-700 text-center">
                                ${model.standard_daily_rate}
                            </div>
                        </div>

                        {/* New Rate Input */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">New Daily Rate *</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="number"
                                    value={newRate}
                                    onChange={(e) => setNewRate(Number(e.target.value))}
                                    className="input input-bordered w-full pl-10 text-lg font-semibold"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Change Indicator */}
                        {changePercentage !== 0 && (
                            <div className={`p-4 rounded-lg mb-6 flex items-center justify-center gap-2 ${
                                changePercentage >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                                {changePercentage >= 0 ? (
                                    <TrendingUp className="text-green-600" size={20} />
                                ) : (
                                    <TrendingDown className="text-red-600" size={20} />
                                )}
                                <span className={`font-semibold ${
                                    changePercentage >= 0 ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}% change
                                </span>
                            </div>
                        )}

                        {/* Quick Adjust Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {[10, 5, -5, -10].map((percent) => (
                                <button
                                    key={percent}
                                    type="button"
                                    onClick={() => {
                                        const change = model.standard_daily_rate * (percent / 100)
                                        setNewRate(Number((model.standard_daily_rate + change).toFixed(2)))
                                    }}
                                    className={`btn btn-outline btn-sm ${
                                        percent >= 0 ? 'btn-success' : 'btn-error'
                                    }`}
                                >
                                    {percent >= 0 ? '+' : ''}{percent}%
                                </button>
                            ))}
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
                            disabled={newRate === model.standard_daily_rate}
                        >
                            Update Rate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DailyRateModal