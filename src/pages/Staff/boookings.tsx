// import React from 'react'
// import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout'
// import { Package, Clock, CheckCircle, XCircle, Truck, User, Mail } from 'lucide-react'
// import { orderApi } from '../../features/api/OrderApi'
// import Swal from 'sweetalert2'

// const AllOrders: React.FC = () => {

//     // RTK Query Hook to fetch all orders
//     const { data: AllOrders, isLoading: AllOrderIsLoading, error } = orderApi.useGetAllOrdersQuery()
//     console.log("🚀 ~ AllOrders ~ AllOrders:", AllOrders)

//     // RTK mutation to update order status
//     const [updateOrderStatus] = orderApi.useUpdateOrderStatusMutation()

//     // Format date
//     const formatDate = (dateString: string) => {
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })
//     }

//     // Format price
//     const formatPrice = (price: number) => {
//         return `$${price.toFixed(2)}`
//     }

//     // Get status badge
//     const getStatusBadge = (status: string) => {
//         const statusConfig = {
//             pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
//             confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
//             preparing: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Preparing' },
//             completed: { color: 'bg-green-100 text-green-800', icon: Truck, label: 'Completed' },
//             cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
//         }

//         const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
//         const IconComponent = config.icon

//         return (
//             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
//                 <IconComponent size={14} className="mr-1" />
//                 {config.label}
//             </span>
//         )
//     }

//     // Get order type icon
//     const getOrderTypeIcon = (orderType: string) => {
//         const icons = {
//             dine_in: '🏠',
//             takeaway: '🥡',
//             delivery: '🚚'
//         }
//         return icons[orderType as keyof typeof icons] || '🏠'
//     }

//     // Handle status update
//     const handleStatusUpdate = async (order_id: number, currentStatus: string) => {
//         const statusOptions = ['pending', 'confirmed', 'preparing', 'completed', 'cancelled']
//         const currentIndex = statusOptions.indexOf(currentStatus)
//         const nextStatuses = statusOptions.slice(currentIndex + 1)

//         if (nextStatuses.length === 0) {
//             Swal.fire("Info", "This order is already at the final status", "info")
//             return
//         }

//         const { value: newStatus } = await Swal.fire({
//             title: 'Update Order Status',
//             input: 'select',
//             inputOptions: nextStatuses.reduce((acc, status) => {
//                 acc[status] = status.charAt(0).toUpperCase() + status.slice(1)
//                 return acc
//             }, {} as Record<string, string>),
//             inputPlaceholder: 'Select new status',
//             showCancelButton: true,
//             confirmButtonText: 'Update',
//             confirmButtonColor: '#10b981',
//             inputValidator: (value) => {
//                 if (!value) {
//                     return 'Please select a status'
//                 }
//             }
//         })

//         if (newStatus) {
//             try {
//                 const res = await updateOrderStatus({ order_id, status: newStatus }).unwrap()
//                 Swal.fire("Updated", res.message, "success")
//             } catch (error) {
//                 Swal.fire("Error", "Failed to update order status", "error")
//             }
//         }
//     }
//     return (
//         <AdminDashboardLayout>
//             {/* Header */}
//             <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                     <Package className="text-green-600" size={24} />
//                 </div>
//                 <h1 className="text-xl sm:text-2xl font-bold text-gray-800">All Orders Management</h1>
//             </div>

//             {/* Loading State */}
//             {AllOrderIsLoading ? (
//                 <div className="flex justify-center items-center py-16">
//                     <span className="loading loading-spinner loading-lg text-green-600"></span>
//                     <span className="ml-3 text-gray-600">Loading orders...</span>
//                 </div>
//             ) : error ? (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//                     <XCircle className="mx-auto text-red-500 mb-3" size={48} />
//                     <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
//                     <p className="text-red-600">Unable to fetch orders. Please try again later.</p>
//                 </div>
//             ) : !AllOrders || AllOrders.length === 0 ? (
//                 /* Empty State */
//                 <div className="bg-white rounded-lg shadow-md p-8 text-center">
//                     <Package className="mx-auto mb-4 text-green-600" size={48} />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
//                     <p className="text-gray-500">No orders have been placed yet.</p>
//                 </div>
//             ) : (
//                 /* Orders Table */
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="table table-zebra w-full">
//                             <thead>
//                                 <tr className="bg-gray-50">
//                                     <th className="text-left font-semibold text-gray-700">Order ID</th>
//                                     <th className="text-left font-semibold text-gray-700">Customer</th>
//                                     <th className="text-left font-semibold text-gray-700">Menu Item</th>
//                                     <th className="text-left font-semibold text-gray-700">Type</th>
//                                     <th className="text-left font-semibold text-gray-700">Status</th>
//                                     <th className="text-left font-semibold text-gray-700">Amount</th>
//                                     <th className="text-left font-semibold text-gray-700">Date</th>
//                                     <th className="text-center font-semibold text-gray-700">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {AllOrders.map((order: any) => (
//                                     <tr key={order.order_id} className="hover:bg-gray-50">
//                                         <td className="font-bold text-gray-800">#{order.order_id}</td>
//                                         <td>
//                                             <div>
//                                                 <div className="font-semibold text-gray-800 flex items-center gap-1">
//                                                     <User size={14} />
//                                                     {order.customer_name}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500 flex items-center gap-1">
//                                                     <Mail size={12} />
//                                                     {order.customer_email}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className="flex items-center gap-3">
//                                                 <div className="avatar">
//                                                     <div className="mask mask-squircle w-10 h-10">
//                                                         <img
//                                                             src={order.menuitem_image_url}
//                                                             alt={order.menu_item_name}
//                                                             className="object-cover"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="font-semibold text-green-800">{order.menu_item_name}</div>
//                                                     <div className="text-sm text-gray-500">{order.restaurant_name}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <span className="flex items-center gap-1">
//                                                 {getOrderTypeIcon(order.order_type)}
//                                                 {order.order_type.replace('_', ' ').toUpperCase()}
//                                             </span>
//                                         </td>
//                                         <td>{getStatusBadge(order.status)}</td>
//                                         <td className="font-bold text-green-600">{formatPrice(order.total_amount)}</td>
//                                         <td className="text-sm text-gray-600">{formatDate(order.created_at)}</td>
//                                         <td className="text-center">
//                                             <button
//                                                 onClick={() => handleStatusUpdate(order.order_id, order.status)}
//                                                 className="btn btn-outline btn-success btn-xs"
//                                                 disabled={order.status === 'delivered' || order.status === 'cancelled'}
//                                             >
//                                                 Update Status
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Order Summary Stats */}
//                     <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
//                         <div className="flex flex-wrap gap-6 text-sm">
//                             <div className="flex items-center gap-2">
//                                 <Clock size={16} className="text-yellow-600" />
//                                 <span className="text-gray-600">Pending: </span>
//                                 <span className="font-bold">{AllOrders.filter((o: any) => o.status === 'pending').length}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <Package size={16} className="text-purple-600" />
//                                 <span className="text-gray-600">Preparing: </span>
//                                 <span className="font-bold">{AllOrders.filter((o: any) => o.status === 'preparing').length}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <Truck size={16} className="text-green-600" />
//                                 <span className="text-gray-600">Delivered: </span>
//                                 <span className="font-bold">{AllOrders.filter((o: any) => o.status === 'delivered').length}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <span className="text-gray-600">Total Revenue: </span>
//                                 <span className="font-bold text-green-600">
//                                     {formatPrice(AllOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0))}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </AdminDashboardLayout>
//     )
// }

// export default AllOrders