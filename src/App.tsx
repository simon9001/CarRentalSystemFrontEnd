import { RouterProvider, createBrowserRouter } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
// import Meals from './pages/Meals'
import Register from './pages/Register'
import UserDashboard from './pages/userPages/UserDashboard'
// import Orders from './pages/userPages/Orders'
import UserProfile from './pages/userPages/UserProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import VehicleDetails from './Componnents/Details'
import Bookings from './pages/userPages/Bookings'
import AllBookings from './pages/userPages/Bookings'
import AdminVehiclesPage from './pages/admin/vehicles'
import AdminCarModelsPage from './pages/admin/Model'
import AdminCustomersPage from './pages/admin/Customer'
import AdminBranchesPage from './pages/admin/branches'
import StaffManagements from './pages/admin/stafff'
import AdminDamagesPage from './pages/admin/damages'
import PaymentManagemente from './pages/admin/payments'
import MaintenanceManagements from './pages/admin/maitanance'
import PaymentSettingsPage from './pages/admin/PaymentSettingsPage'
import VehicleSettingsPage from './pages/admin/VehicleSettingsPage'
import CompanySettingsPage from './pages/admin/CompanySettingsPage'
import SecuritySettingsPage from './pages/admin/SecuritySettingsPage'
import BookingSettingsPage from './pages/admin/settings'
import BookingManagementPage from './pages/admin/BookingManagementPage'
import BookingPage from './pages/userPages/BookingPage'
import PaymentPage from './pages/userPages/PaymentPage'
import BookingSuccessPage from './pages/userPages/BookingSuccessPage'
import UserManagementsdd from './pages/admin/users'


function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    // {
    //   path: '/meals',
    //   element: <Meals />
    // },
    {
      path: '/about',
      element: <About />
    },
    {
      path: '/contact',
      element: <Contact />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/login',
      element: <Login />
    },
    // User Dashboard routes
    {
      path: '/dashboard',
      element: <UserDashboard />
    },
    {
      path: '/admin/dashboard/models',
      element: < AdminCarModelsPage/>
    },
    {
      path: '/dashboard/user-profile',
      element: <UserProfile />
    },
    // // Admin dashboard routes
    {
      path: '/admin/dashboard',
      element: <AdminDashboard />
    },

    {
      path: '/vehicle-details/:vehicle_id',
      element: <VehicleDetails />
    },
    {
    path:"/dashboard/bookings" ,
    element: <Bookings /> 
    },
{ path: "/dashboard/all-bookings" ,
  element: <AllBookings /> 
},  

 {
    path: '/admin/dashboard/vehicles',
    element: <AdminVehiclesPage/>
    },
    {
      path: '/admin/dashboard/customers',
      element: <AdminCustomersPage />
    },
    {
      path: '/admin/dashboard/branches',
      element: <AdminBranchesPage />
    },
    {
      path: '/admin/dashboard/staff',
      element: <StaffManagements />
    },
    {
      path: '/admin/dashboard/damage-reports',
      element: <AdminDamagesPage />
    },
   {
      path: '/admin/dashboard/payments',
      element: <PaymentManagemente />
    },
     {
      path: '/admin/dashboard/maintenance',
      element: <MaintenanceManagements />
    },
     {
      path: '/admin/settings/payments',
      element: <PaymentSettingsPage/>
    },
     {
      path: '/admin/settings/vehicles',
      element: <VehicleSettingsPage />
    },
     {
      path: '/admin/settings/company',
      element: <CompanySettingsPage />
    },
     {
      path: '/admin/settings/security',
      element: <SecuritySettingsPage/>
    },
      {
      path: '/admin/settings/bookings',
      element: < BookingSettingsPage/>
    },
    {
      path: '/admin/dashboard/bookings',
      element: <BookingManagementPage/>
    },
      {
      path: '/Booking',
      element: <BookingPage/>
      },
      
      { 
      path: '/bookings/payment',
      element: <PaymentPage />
    },
      {
      path: '/booking-success',
      element: <BookingSuccessPage/>
    },
      {
      path: '/admin/Users',
      element: <UserManagementsdd/>
    },
  
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
