// import React, { useState } from 'react'
// import Navbar from '../Componnents/Navbar'
// import Footer from '../Componnents/Footer'
// // import { type MenuItem } from '../types/Types'
// import { menuItemApi } from '../features/Api/MenuItemApi'
// import { orderApi } from '../features/Api/OrderApi'
// import { useSelector } from 'react-redux'
// import type { RootState } from '../store/store'
// import { ShoppingCart } from 'lucide-react'
// import { toast, Toaster } from 'sonner'
// import { useNavigate } from 'react-router'



// // const MealsData: MenuItem[] = [

// //     {
// //         menu_item_id: 1,
// //         name: 'Grilled Chicken Salad',
// //         description: 'A healthy mix of grilled chicken, fresh greens, and a light vinaigrette.',
// //         price: 12.99,
// //         category_name: 'Salads',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
// //         is_available: true,
// //         quantity: 15,
// //         prepared_time: '15 mins'
// //     },
// //     {
// //         menu_item_id: 2,
// //         name: 'Spaghetti Carbonara',
// //         description: 'Classic Italian pasta with creamy sauce, pancetta, and Parmesan cheese.',
// //         price: 14.99,
// //         category_name: 'Pasta',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1623243020684-9f8bcefe6e94?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470',
// //         is_available: true,
// //         quantity: 8,
// //         prepared_time: '20 mins'
// //     },
// //     {
// //         menu_item_id: 3,
// //         name: 'Vegan Buddha Bowl',
// //         description: 'A nourishing bowl of quinoa, roasted veggies, chickpeas, and tahini dressing.',
// //         price: 11.99,
// //         category_name: 'Vegan',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
// //         is_available: true,
// //         quantity: 22,
// //         prepared_time: '12 mins'
// //     },
// //     {
// //         menu_item_id: 4,
// //         name: 'BBQ Beef Burger',
// //         description: 'Juicy beef patty with BBQ sauce, lettuce, tomato, and crispy onions.',
// //         price: 16.99,
// //         category_name: 'Burgers',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
// //         is_available: true,
// //         quantity: 3,
// //         prepared_time: '18 mins'
// //     },
// //     {
// //         menu_item_id: 5,
// //         name: 'Margherita Pizza',
// //         description: 'Traditional pizza with fresh mozzarella, tomato sauce, and basil.',
// //         price: 13.99,
// //         category_name: 'Pizza',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
// //         is_available: false,
// //         quantity: 0,
// //         prepared_time: '25 mins'
// //     },
// //     {
// //         menu_item_id: 6,
// //         name: 'Fish Tacos',
// //         description: 'Fresh grilled fish with cabbage slaw, avocado, and lime crema.',
// //         price: 15.99,
// //         category_name: 'Mexican',
// //         menuitemimage_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
// //         is_available: true,
// //         quantity: 12,
// //         prepared_time: '16 mins'
// //     }
// // ]

// const Meals: React.FC = () => {


//     //get auth state on redux store
//     const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice)
//     const navigate = useNavigate()

//     const user_id = user?.user_id

//     //    RTK query hook to fetch all menu items
//     const { data: menuItems, error, isLoading } = menuItemApi.useGetAllMenuItemsQuery();
//     // console.log("🚀 ~ Meals ~ menuItems:", menuItems)

//     // RTK query hook to create order
//     const [createNewOrder, { isLoading: isCreateOrderLoading }] = orderApi.useAddNewOrderMutation()

//     const [searchTerm, setSearchTerm] = useState('')
//     const [selectedCategory, setSelectedCategory] = useState('All')
//     const [sortBy, setSortBy] = useState('name')
//     const [showAvailableOnly, setShowAvailableOnly] = useState(false)
//     const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
//     const [selectedMeal, setSelectedMeal] = useState<any>(null)
//     const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')


//     // Get unique categories
//     const categories = ['All', ...new Set(menuItems?.map(meal => meal.category_name).filter(Boolean))]

//     // Filter and sort meals
//     const filteredMeals = menuItems?.filter(meal => {
//         const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             meal.description.toLowerCase().includes(searchTerm.toLowerCase())
//         const matchesCategory = selectedCategory === 'All' || meal.category_name === selectedCategory
//         const matchesAvailability = !showAvailableOnly || meal.is_available

//         return matchesSearch && matchesCategory && matchesAvailability
//     })
//         .sort((a, b) => {
//             switch (sortBy) {
//                 case 'price-low':
//                     return a.price - b.price
//                 case 'price-high':
//                     return b.price - a.price
//                 default:
//                     return a.name.localeCompare(b.name)
//             }
//         })

//     // Open order modal
//     const openOrderModal = (meal: any) => {
//         if (!isAuthenticated || !user_id) {
//             toast.error('Please sign in to place an order');
//             return;
//         }

//         if (!meal.is_available || meal.quantity < 1) {
//             toast.error('This item is currently unavailable');
//             return;
//         }

//         setSelectedMeal(meal);
//         setIsOrderModalOpen(true);
//     };

//     // Create order with selected type
//     const handleCreateOrder = async () => {
//         if (!selectedMeal) return;

//         const loadingToastId = toast.loading("Creating order...");
//         try {
//             const orderData = {
//                 restaurant_id:  selectedMeal.restaurant_id,
//                 customer_id: user_id!,
//                 menu_item_id: selectedMeal.menu_item_id,
//                 total_amount: selectedMeal.price,
//                 order_type: orderType
//             };

//             const response = await createNewOrder(orderData).unwrap();
//             toast.success(response.message, { id: loadingToastId });

//             // Close modal and reset
//             setIsOrderModalOpen(false);
//             setSelectedMeal(null);
//             setOrderType('dine_in');

//             navigate('/dashboard/my-orders');

//         } catch (error: any) {
//             console.error('Order failed:', error);
//             toast.error('Failed to place order. Please try again.', { id: loadingToastId });
//         }
//     }; return (
//         <div className="min-h-screen flex flex-col">
//             <Navbar />
//             <Toaster position="top-right" richColors />
//             {/* Hero Section */}
//             <div className="bg-green-800 text-white pt-16 pb-8 px-8 text-center">
//                 <h1 className="text-5xl mb-4 font-bold">
//                     🍽️ Our Delicious Meals
//                 </h1>
//                 <p className="text-xl max-w-2xl mx-auto leading-relaxed opacity-90">
//                     Discover our carefully crafted menu featuring authentic flavors and fresh ingredients.
//                 </p>
//             </div>

//             {/* Search and Filters */}
//             <div className="bg-gray-50 p-8 border-b border-gray-200">
//                 <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center justify-center">
//                     {/* Search Bar */}
//                     <div className="flex-1 min-w-64 max-w-96">
//                         <input
//                             type="text"
//                             placeholder="🔍 Search meals..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-full text-base outline-none transition-colors duration-300 focus:border-green-800"
//                         />
//                     </div>

//                     {/* Category Filter */}
//                     <select
//                         value={selectedCategory}
//                         onChange={(e) => setSelectedCategory(e.target.value)}
//                         className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base bg-white cursor-pointer outline-none focus:border-green-800"
//                     >
//                         {categories.map(category => (
//                             <option key={category} value={category}>
//                                 📂 {category}
//                             </option>
//                         ))}
//                     </select>

//                     {/* Sort By */}
//                     <select
//                         value={sortBy}
//                         onChange={(e) => setSortBy(e.target.value)}
//                         className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base bg-white cursor-pointer outline-none focus:border-green-800"
//                     >
//                         <option value="name">📝 Sort by Name</option>
//                         <option value="price-low">💰 Price: Low to High</option>
//                         <option value="price-high">💎 Price: High to Low</option>
//                     </select>

//                     {/* Available Only Toggle */}
//                     <label className="flex items-center gap-2 cursor-pointer text-base">
//                         <input
//                             type="checkbox"
//                             checked={showAvailableOnly}
//                             onChange={(e) => setShowAvailableOnly(e.target.checked)}
//                             className="scale-125"
//                         />
//                         ✅ Available Only
//                     </label>
//                 </div>
//             </div>

//             {/* Results Count */}
//             <div className="py-4 px-8 bg-white text-center border-b border-gray-200">
//                 <p className="text-lg text-gray-500 m-0">
//                     Found {filteredMeals?.length} delicious meal{filteredMeals?.length !== 1 ? 's' : ''}
//                     {searchTerm && ` matching "${searchTerm}"`}
//                 </p>
//             </div>

//             {/* Meals Grid */}
//             <div className="flex-1 p-8 bg-white">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
//                     {isLoading ? (
//                         <span className="loading loading-spinner text-success"></span>
//                     ) : error ? (
//                         <p className="text-center col-span-full text-red-500">Error loading meals.</p>
//                     ) : (
//                         filteredMeals?.length === 0 ? (
//                             <p className="text-center col-span-full text-gray-500">No meals found.</p>
//                         ) : filteredMeals?.map(meal => (
//                             <div
//                                 key={meal.menu_item_id}
//                                 className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2"
//                             >
//                                 {/* Image */}
//                                 <div className="relative">
//                                     <img
//                                         src={meal.menuitem_image_url}
//                                         alt={meal.name}
//                                         className="w-full h-48 object-cover"
//                                     />

//                                     {/* Availability Badge */}
//                                     <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${meal.is_available ? 'bg-green-500' : 'bg-red-500'
//                                         }`}>
//                                         {meal.is_available ? '✅ Available' : '❌ Sold Out'}
//                                     </div>

//                                     {/* Quantity Badge */}
//                                     <div className={`absolute top-14 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${meal.quantity && meal.quantity <= 5 ? 'bg-orange-500' : 'bg-blue-500'
//                                         }`}>
//                                         📦 {meal.quantity || 0} left
//                                     </div>

//                                     {/* Category Badge */}
//                                     <div className="absolute top-4 left-4 bg-green-800 text-white px-3 py-1 rounded-full text-xs font-bold">
//                                         {meal.category_name}
//                                     </div>
//                                 </div>

//                                 {/* Content */}
//                                 <div className="p-6">
//                                     <h3 className="text-xl text-green-800 mb-2 font-bold">
//                                         {meal.name}
//                                     </h3>

//                                     <p className="text-gray-500 text-sm leading-relaxed mb-4">
//                                         {meal.description}
//                                     </p>

//                                     {/* Low Stock Warning */}
//                                     {meal.quantity && meal.quantity <= 5 && meal.quantity > 0 && (
//                                         <div className="bg-yellow-50 text-yellow-800 p-2 rounded-md text-xs mb-4 border border-yellow-200 flex items-center gap-2">
//                                             ⚠️ <strong>Hurry!</strong> Only {meal.quantity} left in stock!
//                                         </div>
//                                     )}

//                                     {/* Rating and Prep Time */}
//                                     <div className="flex justify-between items-center mb-4">
//                                         <div className="flex items-center gap-1 text-sm text-gray-500">
//                                             <span>⏱️</span>
//                                             <span>{meal.prepared_time}</span>
//                                         </div>
//                                     </div>

//                                     {/* Price and Add to Cart */}
//                                     <div className="flex justify-between items-center">
//                                         <div className="text-2xl font-bold text-green-800">
//                                             ${meal.price.toFixed(2)}
//                                         </div>

//                                         {/* <button
//                                         onClick={() => openOrderModal(meal)}
//                                         disabled={!meal.is_available || meal.quantity < 1}
//                                         className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${meal.is_available
//                                             ? 'bg-green-800 hover:bg-green-900 text-white cursor-pointer hover:-translate-y-1 hover:shadow-lg'
//                                             : 'bg-gray-500 text-white cursor-not-allowed'
//                                             }`}
//                                     >
//                                         {isAuthenticated ? "Order Now" : "Sign In to Order"} 
//                                     </button> */}
//                                         <button
//                                             className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${meal.is_available && meal.quantity >= 1
//                                                 ? 'bg-green-800 hover:bg-green-900 text-white cursor-pointer hover:-translate-y-1 hover:shadow-lg'
//                                                 : 'bg-gray-500 text-white cursor-not-allowed'
//                                                 }`}
//                                             onClick={() => openOrderModal(meal)}
//                                             disabled={!meal.is_available || meal.quantity < 1 || isCreateOrderLoading}
//                                         >
//                                             {isCreateOrderLoading ? (
//                                                 <span className="loading loading-spinner loading-xs"></span>
//                                             ) : (
//                                                 <>
//                                                     <ShoppingCart size={16} />
//                                                     <span className="sm:inline">{isAuthenticated ? "Order Now" : "Sign In"}</span>
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )))}
//                 </div>

//                 {/* Simple Order Type Modal */}
//                 {isOrderModalOpen && selectedMeal && (
//                     <div className="modal modal-open">
//                         <div className="modal-box max-w-sm">
//                             <h3 className="font-bold text-lg mb-4">Select Order Type</h3>

//                             <div className="flex items-center gap-3 mb-4">
//                                 <img
//                                     src={selectedMeal.menuitem_image_url}
//                                     alt={selectedMeal.name}
//                                     className="w-12 h-12 object-cover rounded"
//                                 />
//                                 <div>
//                                     <p className="font-medium">{selectedMeal.name}</p>
//                                     <p className="text-green-600 font-bold">${selectedMeal.price}</p>
//                                 </div>
//                             </div>

//                             <div className="space-y-3 mb-6">
//                                 {[
//                                     { value: 'dine_in', label: '🏠 Dine In', desc: 'Eat at restaurant' },
//                                     { value: 'takeaway', label: '🥡 Takeaway', desc: 'Pick up order' },
//                                     { value: 'delivery', label: '🚚 Delivery', desc: 'Delivered to you' }
//                                 ].map((option) => (
//                                     <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
//                                         <input
//                                             type="radio"
//                                             name="orderType"
//                                             value={option.value}
//                                             checked={orderType === option.value}
//                                             onChange={(e) => setOrderType(e.target.value as typeof orderType)}
//                                             className="radio radio-primary"
//                                         />
//                                         <div>
//                                             <div className="font-medium">{option.label}</div>
//                                             <div className="text-sm text-gray-500">{option.desc}</div>
//                                         </div>
//                                     </label>
//                                 ))}
//                             </div>

//                             <div className="modal-action">
//                                 <button
//                                     className="btn btn-outline"
//                                     onClick={() => {
//                                         setIsOrderModalOpen(false);
//                                         setSelectedMeal(null);
//                                         setOrderType('dine_in');
//                                     }}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     className="btn bg-green-800 hover:bg-green-900 text-white"
//                                     onClick={handleCreateOrder}
//                                     disabled={isCreateOrderLoading}
//                                 >
//                                     {isCreateOrderLoading ? (
//                                         <span className="loading loading-spinner loading-sm"></span>
//                                     ) : (
//                                         'Place Order'
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* No Results */}
//                 {filteredMeals?.length === 0 && (
//                     <div className="text-center py-16 px-8 text-gray-500">
//                         <div className="text-6xl mb-4">🔍</div>
//                         <h3 className="text-2xl mb-2 text-gray-700">
//                             No meals found
//                         </h3>
//                         <p className="text-base">
//                             Try adjusting your search or filters
//                         </p>
//                     </div>
//                 )}
//             </div>

//             <Footer />
//         </div>
//     )
// }

// export default Meals