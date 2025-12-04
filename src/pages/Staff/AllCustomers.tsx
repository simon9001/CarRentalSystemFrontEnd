// import React from 'react'
// import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout'
// import { Users } from 'lucide-react'
// import { userApi } from '../../features/api/UserApi'

// const AllCustomers: React.FC = () => {

//     //RTK QUery Hook
//     const { data: allCustomers, isLoading: customerIsLoading } = userApi.useGetAllUsersQuery()
//     console.log("🚀 ~ AllMenuItems ~ allMenuItem:", allCustomers)


//     return (
//         <AdminDashboardLayout>
//             <div className="flex items-center gap-3 mb-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                     <Users className="text-blue-600" size={24} />
//                 </div>
//                 <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Management</h1>
//             </div>

//             {/* Placeholder content */}
//             {/* <div className="bg-white rounded-lg shadow-md p-8 text-center">
//                 <Users className="mx-auto mb-4 text-blue-600" size={48} />
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">Customer Management</h3>
//                 <p className="text-gray-500">This page will contain customer management functionality</p>
//                 <button className="btn bg-blue-600 hover:bg-blue-700 text-white mt-4">
//                     Coming Soon
//                 </button>
//             </div> */}

//             {/* let have a table structure for customers */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4">All Customers</h3>
//             </div>

//             {/* table structure */}
//             <div className="overflow-x-auto">
//                 <table className="table table-zebra">
//                     {/* head */}
//                     <thead>
//                         <tr>
//                             <th>#</th>
//                             <th>First Name</th>
//                             <th>Last Name</th>
//                             <th>Email</th>
//                             <th>Phone Number</th>
//                             <th>Date Joined</th>
//                             <th>User Type</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr>
//                             <th>1</th>
//                             <td>John</td>
//                             <td>Ganderton</td>
//                             <td>mail.com</td>
//                             <td>071122114477</td>
//                             <td>2023-10-01</td>
//                             <td>Customer</td>
//                             <td>
//                                 <button className="btn btn-sm btn-primary mr-2">View</button>
//                                 <button className="btn btn-sm btn-success mr-2">Edit</button>
//                                 <button className="btn btn-sm btn-secondary">Delete</button>
//                             </td>
//                         </tr>

//                         <tr>
//                             <th>2</th>
//                             <td>John</td>
//                             <td>Ganderton</td>
//                             <td>mail.com</td>
//                             <td>071122114477</td>
//                             <td>2023-10-01</td>
//                             <td>Customer</td>
//                             <td>
//                                 <button className="btn btn-sm btn-primary mr-2">View</button>
//                                 <button className="btn btn-sm btn-success mr-2">Edit</button>
//                                 <button className="btn btn-sm btn-secondary">Delete</button>
//                             </td>
//                         </tr>

//                     </tbody>
//                 </table>
//             </div>
//         </AdminDashboardLayout>
//     )
// }

// export default AllCustomers