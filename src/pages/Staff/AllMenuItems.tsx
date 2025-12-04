// import React, { useState } from 'react'
// import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout'
// import { Clipboard, Edit, Trash2, Plus, X, SaveIcon } from 'lucide-react'
// import { useForm, type SubmitHandler } from "react-hook-form";
// import { menuItemApi } from '../../features/api/MenuItemApi'
// import type { MenuItem } from '../../types/Types'
// import { Toaster, toast } from "sonner";
// import { categoryApi } from '../../features/api/CategoryApi';
// import Swal from 'sweetalert2';


// type AddFormValues = {
//     name: string;
//     description: string;
//     restaurant_id: number;
//     category_id: number;
//     price: number;
//     menuitem_image_url: string;
//     is_available?: boolean;
//     quantity: number;
//     prepared_time: number;
// }

// const AllMenuItems: React.FC = () => {

//     const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddFormValues>();


//     //RTK Query Hook to fetch all menu items
//     const { data: allMenuItem, isLoading: menuIsLoading } = menuItemApi.useGetAllMenuItemsQuery()
//     const { data: allCategory } = categoryApi.useGetAllCategoryQuery();

//     //RTK Mutation Hook to add new menu item
//     const [addMenuItem] = menuItemApi.useAddMenuItemMutation();
//     const [deleteMenuItem] = menuItemApi.useDeleteMenuItemMutation();
//     const [updateMenuItem] = menuItemApi.useUpdateMenuItemMutation();

//     //modal for adding menut items
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//     //modal for editing menu items
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null)

//     //open/close modal
//     const handleModalToggle = () => {
//         setIsAddModalOpen(!isAddModalOpen);
//     };

//     //open/close edit modal
//     const handleEditModalToggle = () => {
//         setIsEditModalOpen(!isEditModalOpen);
//         if (isEditModalOpen) {
//             reset();
//             setSelectedMenuItem(null);
//         }
//     }

//     // Format price to currency
//     const formatPrice = (price: number) => {
//         return `$${price.toFixed(2)}`
//     }

//     // Edit menu item function
//     const openEditModal = (item: MenuItem) => {
//         setSelectedMenuItem(item);
//         // Reset form first
//         reset();
//         // Set form values with selected item data
//         setValue('name', item.name);
//         setValue('description', item.description);
//         setValue('price', item.price);
//         setValue('category_id', item.category_id);
//         setValue('quantity', item.quantity);
//         setValue('prepared_time', item.prepared_time);
//         setValue('is_available', item.is_available);
//         setValue('menuitem_image_url', item.menuitem_image_url);
//         setIsEditModalOpen(true);
//     };

//     // Handle form submission
//     const onSubmit: SubmitHandler<AddFormValues> = async (data) => {
//         const loadingToastId = toast.loading("Adding the menu item...");
//         data.restaurant_id = 1; // Assuming restaurant_id is 1 for now
//         // data.menuitem_image_url = mealImage;
//         try {
//             const res = await addMenuItem(data).unwrap();
//             toast.success(res.message, { id: loadingToastId })
//             reset();
//             // setMealImage("");
//             setIsAddModalOpen(false);
//         } catch (error: any) {
//             toast.error('Failed to add meal . Please try again.', error);
//             toast.dismiss(loadingToastId)
//         }
//     }

//     //delete menu item function
//     const handleDeleteMenuItem = async (menu_item_id: number) => {
//         Swal.fire({
//             title: "Are you sure?",
//             text: "You want to delete this menu item?",
//             icon: "question",
//             showCancelButton: true,
//             confirmButtonColor: "#2563eb",
//             cancelButtonColor: "#f44336",
//             confirmButtonText: "Yes, Delete it!",
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const res = await deleteMenuItem(menu_item_id).unwrap()
//                     // console.log(res)
//                     Swal.fire("Deleted", res.message, "success")
//                 } catch (error) {
//                     Swal.fire("Something went wrong", "Please Try Again", "error")
//                 }
//             }
//         })
//     }

//     //funtion to update menu item
//     const handleEditSubmit: SubmitHandler<AddFormValues> = async (data) => {
//         const loadingToastId = toast.loading("Updating the menu item...");
//         try {
//             console.log(data);
//             const res = await updateMenuItem({ menu_item_id: selectedMenuItem.menu_item_id, ...data }).unwrap();
//             toast.success(res.message, { id: loadingToastId })
//             setIsEditModalOpen(false);
//             setSelectedMenuItem(null);
//             reset();
//         } catch (error: any) {
//             toast.error('Failed to update menu item. Please try again.', { id: loadingToastId });
//         }
//     }

//     return (
//         <AdminDashboardLayout>
//             <Toaster position="top-right" richColors />
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-purple-100 rounded-lg">
//                         <Clipboard className="text-green-600" size={24} />
//                     </div>
//                     <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Menu Items Management</h1>
//                 </div>
//                 <button onClick={handleModalToggle} className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
//                     <Plus size={16} />
//                     Add New Menu Item
//                 </button>
//             </div>

//             {/* Loading State */}
//             {menuIsLoading ? (
//                 <div className="flex justify-center items-center py-16">
//                     <span className="loading loading-spinner loading-lg text-green-600"></span>
//                     <span className="ml-3 text-gray-600">Loading menu items...</span>
//                 </div>
//             ) : !allMenuItem || allMenuItem.length === 0 ? (
//                 /* Empty State */
//                 <div className="bg-white rounded-lg shadow-md p-8 text-center">
//                     <Clipboard className="mx-auto mb-4 text-green-600" size={48} />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">No Menu Items Found</h3>
//                     <p className="text-gray-500 mb-4">Start by adding your first menu item.</p>
//                     <button className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mx-auto">
//                         <Plus size={16} />
//                         Add First Item
//                     </button>
//                 </div>
//             ) : (
//                 /* Menu Items Table */
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="table table-zebra w-full">
//                             <thead>
//                                 <tr className="bg-gray-50">
//                                     <th className="text-left font-semibold text-gray-700">Image</th>
//                                     <th className="text-left font-semibold text-gray-700">Name</th>
//                                     <th className="text-left font-semibold text-gray-700">Category</th>
//                                     <th className="text-left font-semibold text-gray-700">Price</th>
//                                     <th className="text-left font-semibold text-gray-700">Quantity</th>
//                                     <th className="text-left font-semibold text-gray-700">Prep Time</th>
//                                     <th className="text-left font-semibold text-gray-700">Status</th>
//                                     <th className="text-center font-semibold text-gray-700">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {allMenuItem?.map((item: MenuItem) => (
//                                     <tr key={item.menu_item_id} className="hover:bg-gray-50">
//                                         <td>
//                                             <div className="avatar">
//                                                 <div className="mask mask-squircle w-12 h-12">
//                                                     <img
//                                                         src={item.menuitem_image_url}
//                                                         alt={item.name}
//                                                         className="object-cover"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div>
//                                                 <div className="font-bold text-gray-800">{item.name}</div>
//                                                 <div className="text-sm opacity-50 truncate max-w-xs">
//                                                     {item.description}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <span className="badge badge-outline">{item.category_name}</span>
//                                         </td>
//                                         <td className="font-bold text-green-600">
//                                             {formatPrice(item.price)}
//                                         </td>
//                                         <td>
//                                             <span className={`badge ${item.quantity > 10 ? 'badge-success' : item.quantity > 5 ? 'badge-warning' : 'badge-error'}`}>
//                                                 {item.quantity}
//                                             </span>
//                                         </td>
//                                         <td className="text-sm text-gray-600">
//                                             {item.prepared_time} mins
//                                         </td>
//                                         <td>
//                                             <span className={`badge ${item.is_available ? 'badge-success' : 'badge-error'}`}>
//                                                 {item.is_available ? 'Available' : 'Unavailable'}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             <div className="flex items-center justify-center gap-2">
//                                                 <button
//                                                     onClick={() => openEditModal(item)}
//                                                     className="btn btn-ghost btn-xs text-green-600">
//                                                     <Edit size={14} />
//                                                 </button>
//                                                 <button onClick={() => handleDeleteMenuItem(item.menu_item_id)} className="btn btn-ghost btn-xs text-red-600">
//                                                     <Trash2 size={14} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         {isAddModalOpen && (
//                             <div className="modal modal-open">
//                                 <div className="modal-box">
//                                     <div className="flex justify-center items-center mb-4 ">
//                                         <h2 className="text-2xl font-bold text-green-500 ">Add A Menu Item</h2>
//                                     </div>
//                                     <form onSubmit={handleSubmit(onSubmit)}>
//                                         <div className="mb-4">
//                                             <label htmlFor="mealName" className="block text-sm font-medium text-green-500">Menu Item Name</label>
//                                             <input
//                                                 type="text"
//                                                 id="mealName"
//                                                 className="input  w-full  text-blue-500 text-sm"
//                                                 {...register('name', { required: 'Menu Item Name is required' })}
//                                             />
//                                             {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="menuItemDescription" className="block text-sm font-medium text-green-500">Menu Item Description</label>
//                                             <input
//                                                 type="text"
//                                                 id="menuItemDescription"
//                                                 className="input  w-full  text-blue-500 text-sm"
//                                                 {...register('description', { required: 'Menu Item Description is required' })}
//                                             />
//                                             {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="menuItemPrice" className="block text-sm font-medium text-green-500">Menu Item Price (Ksh)</label>
//                                             <input
//                                                 type="number"
//                                                 id="menuItemPrice"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('price', { required: 'Menu Item Price is required' })}
//                                             />
//                                             {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="categoryId" className="block text-sm font-medium text-green-500">Category</label>
//                                             <select
//                                                 id="categoryId"
//                                                 className="input input-bordered w-full text-blue-500 text-sm"
//                                                 {...register('category_id', { required: 'Category is required' })}
//                                             >
//                                                 <option value="">Select a category</option>
//                                                 {allCategory?.map((category) => (
//                                                     <option key={category.category_id} value={category.category_id}>
//                                                         {category.name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                             {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="mealQuantity" className="block text-sm font-medium text-green-500">Menu Item Quantity</label>
//                                             <input
//                                                 type="number"
//                                                 id="mealQuantity"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('quantity', { required: 'Menu Item Quantity is required' })}
//                                             />
//                                             {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="mealPrepTime" className="block text-sm font-medium text-green-500">Preparation Time (mins)</label>
//                                             <input
//                                                 type="number"
//                                                 id="mealPrepTime"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('prepared_time', { required: 'Preparation Time is required' })}
//                                             />
//                                             {errors.prepared_time && <p className="text-red-500 text-sm">{errors.prepared_time.message}</p>}
//                                         </div>

//                                         {/* <div className="mb-4">
//                                             <label htmlFor="mealPrice" className="block text-sm font-medium text-orange-500">Meal Image</label>
//                                             <input
//                                                 type="file"
//                                                 id="mealImage"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 onChange={handleFileChange}
//                                             />
//                                         </div>
//                                         <img src={mealImage} alt="" width="75" height="75" /> */}



//                                         <div className="flex justify-end">
//                                             <button onClick={handleModalToggle} className=" btn mr-2 btn-error">
//                                                 <X /> Cancel
//                                             </button>
//                                             <button type="submit" className="btn btn-primary" /*disabled={imageLoading}*/>
//                                                 <SaveIcon /> Add Meal
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         )}
//                         {isEditModalOpen && (
//                             <div className="modal modal-open">
//                                 <div className="modal-box">
//                                     <div className="flex justify-center items-center mb-4 ">
//                                         <h2 className="text-2xl font-bold text-green-500 ">Edit Menu Item</h2>
//                                     </div>
//                                     <form onSubmit={handleSubmit(handleEditSubmit)}>
//                                         <div className="mb-4">
//                                             <label htmlFor="mealName" className="block text-sm font-medium text-green-500">Menu Item Name</label>
//                                             <input
//                                                 type="text"
//                                                 id="mealName"
//                                                 className="input  w-full  text-blue-500 text-sm"
//                                                 {...register('name', { required: 'Menu Item Name is required' })}
//                                             />
//                                             {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="menuItemDescription" className="block text-sm font-medium text-green-500">Menu Item Description</label>
//                                             <input
//                                                 type="text"
//                                                 id="menuItemDescription"
//                                                 className="input  w-full  text-blue-500 text-sm"
//                                                 {...register('description', { required: 'Menu Item Description is required' })}
//                                             />
//                                             {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="menuItemPrice" className="block text-sm font-medium text-green-500">Menu Item Price (Ksh)</label>
//                                             <input
//                                                 type="number"
//                                                 id="menuItemPrice"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('price', { required: 'Menu Item Price is required' })}
//                                             />
//                                             {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
//                                         </div>
//                                         <div className="mb-4">
//                                             <label htmlFor="categoryId" className="block text-sm font-medium text-green-500">Category</label>
//                                             <select
//                                                 id="categoryId"
//                                                 className="input input-bordered w-full text-blue-500 text-sm"
//                                                 {...register('category_id', { required: 'Category is required' })}
//                                             >
//                                                 <option value="">Select a category</option>
//                                                 {allCategory?.map((category) => (
//                                                     <option key={category.category_id} value={category.category_id}>
//                                                         {category.name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                             {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="mealQuantity" className="block text-sm font-medium text-green-500">Menu Item Quantity</label>
//                                             <input
//                                                 type="number"
//                                                 id="mealQuantity"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('quantity', { required: 'Menu Item Quantity is required' })}
//                                             />
//                                             {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="mealPrepTime" className="block text-sm font-medium text-green-500">Preparation Time (mins)</label>
//                                             <input
//                                                 type="number"
//                                                 id="mealPrepTime"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 {...register('prepared_time', { required: 'Preparation Time is required' })}
//                                             />
//                                             {errors.prepared_time && <p className="text-red-500 text-sm">{errors.prepared_time.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="isAvailable" className="block text-sm font-medium text-green-500">Availability Status</label>
//                                             <select
//                                                 id="isAvailable"
//                                                 className="input input-bordered w-full text-blue-500 text-sm"
//                                                 {...register('is_available')}
//                                             >
//                                                 <option value="true">Available</option>
//                                                 <option value="false">Not Available</option>
//                                             </select>
//                                             {errors.is_available && <p className="text-red-500 text-sm">{errors.is_available.message}</p>}
//                                         </div>

//                                         <div className="mb-4">
//                                             <label htmlFor="menuImageUrl" className="block text-sm font-medium text-green-500">Menu Item Image URL</label>
//                                             <input
//                                                 type="url"
//                                                 id="menuImageUrl"
//                                                 className="input input-bordered w-full text-blue-500 text-sm"
//                                                 {...register('menuitem_image_url')}
//                                                 placeholder="https://example.com/image.jpg"
//                                             />
//                                         </div>

//                                         {/* <div className="mb-4">
//                                             <label htmlFor="mealPrice" className="block text-sm font-medium text-orange-500">Meal Image</label>
//                                             <input
//                                                 type="file"
//                                                 id="mealImage"
//                                                 className="input input-bordered w-full  text-blue-500 text-sm"
//                                                 onChange={handleFileChange}
//                                             />
//                                         </div>
//                                         <img src={mealImage} alt="" width="75" height="75" /> */}



//                                         <div className="flex justify-end">
//                                             <button onClick={handleEditModalToggle} type="button" className=" btn mr-2 btn-error">
//                                                 <X /> Cancel
//                                             </button>
//                                             <button type="submit" className="btn btn-primary" /*disabled={imageLoading}*/>
//                                                 <SaveIcon /> Update Meal
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </AdminDashboardLayout>
//     )
// }

// export default AllMenuItems