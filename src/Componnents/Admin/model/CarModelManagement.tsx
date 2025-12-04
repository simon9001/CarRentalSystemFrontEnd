// src/components/admin/CarModelManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Car, Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { CarModelApi } from '../../../features/Api/CarModelApi'
import Swal from 'sweetalert2'
import CarModelOverview from './CarModelOverview'
import CreateCarModelModal from './CreateCarModelModal'
import CarModelDetailsModal from './CarModelDetailsModal'
import EditCarModelModal from './EditCarModelModal'
import DailyRateModal from './DailyRateModal'

const CarModelManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview')
    const [selectedModel, setSelectedModel] = useState<number | null>(null)
    const [viewModel, setViewModel] = useState<number | null>(null)
    const [editModel, setEditModel] = useState<number | null>(null)
    const [rateModel, setRateModel] = useState<number | null>(null)
    
    // RTK Query hooks
    const { data: carModels, isLoading, error } = CarModelApi.useGetAllCarModelsQuery()
    const [updateCarModelStatus] = CarModelApi.useUpdateCarModelStatusMutation()
    const [deleteCarModel] = CarModelApi.useDeleteCarModelMutation()

    // Statistics
    const statistics = {
        total: carModels?.length || 0,
        active: carModels?.filter(model => model.is_active)?.length || 0,
        inactive: carModels?.filter(model => !model.is_active)?.length || 0,
        averageRate: carModels?.reduce((sum, model) => sum + model.standard_daily_rate, 0) / (carModels?.length || 1) || 0
    }

    // Handle status toggle
    const handleStatusToggle = async (modelId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus
        const action = newStatus ? 'enable' : 'disable'
        
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `This will ${action} the car model and affect all vehicles using it.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus ? '#10b981' : '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action} it!`
        })

        if (result.isConfirmed) {
            try {
                await updateCarModelStatus({ 
                    model_id: modelId, 
                    status: { is_active: newStatus } 
                }).unwrap()
                Swal.fire(
                    `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
                    `Car model has been ${action}d.`,
                    'success'
                )
            } catch (error) {
                Swal.fire('Error!', `Failed to ${action} car model.`, 'error')
            }
        }
    }

    // Handle delete
    const handleDeleteCarModel = async (modelId: number, modelName: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This will permanently delete "${modelName}" and cannot be undone!`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                await deleteCarModel(modelId).unwrap()
                Swal.fire('Deleted!', 'Car model has been deleted.', 'success')
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete car model.', 'error')
            }
        }
    }

    return (
        <AdminDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Car className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Car Model Management</h1>
                        <p className="text-gray-600">Manage your vehicle models and specifications</p>
                    </div>
                </div>
                
                <button
                    onClick={() => setActiveTab('create')}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Add New Model
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Models</p>
                            <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
                        </div>
                        <Car className="text-indigo-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Models</p>
                            <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
                        </div>
                        <ToggleRight className="text-green-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactive Models</p>
                            <p className="text-2xl font-bold text-red-600">{statistics.inactive}</p>
                        </div>
                        <ToggleLeft className="text-red-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Daily Rate</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${statistics.averageRate.toFixed(2)}
                            </p>
                        </div>
                        <DollarSign className="text-blue-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Model Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'create'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Create New Model
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <CarModelOverview
                    carModels={carModels || []}
                    isLoading={isLoading}
                    error={error}
                    onViewModel={setViewModel}
                    onEditModel={setEditModel}
                    onRateModel={setRateModel}
                    onToggleStatus={handleStatusToggle}
                    onDeleteModel={handleDeleteCarModel}
                />
            )}

            {activeTab === 'create' && (
                <CreateCarModelModal
                    onClose={() => setActiveTab('overview')}
                    onSuccess={() => {
                        setActiveTab('overview')
                        Swal.fire('Success!', 'Car model created successfully.', 'success')
                    }}
                />
            )}

            {/* Modals */}
            {viewModel && (
                <CarModelDetailsModal
                    modelId={viewModel}
                    onClose={() => setViewModel(null)}
                    onEdit={() => {
                        setEditModel(viewModel)
                        setViewModel(null)
                    }}
                    onRate={() => {
                        setRateModel(viewModel)
                        setViewModel(null)
                    }}
                />
            )}

            {editModel && (
                <EditCarModelModal
                    modelId={editModel}
                    onClose={() => setEditModel(null)}
                    onSuccess={() => {
                        setEditModel(null)
                        Swal.fire('Success!', 'Car model updated successfully.', 'success')
                    }}
                />
            )}

            {rateModel && (
                <DailyRateModal
                    modelId={rateModel}
                    onClose={() => setRateModel(null)}
                    onSuccess={() => {
                        setRateModel(null)
                        Swal.fire('Success!', 'Daily rate updated successfully.', 'success')
                    }}
                />
            )}
        </AdminDashboardLayout>
    )
}

export default CarModelManagement