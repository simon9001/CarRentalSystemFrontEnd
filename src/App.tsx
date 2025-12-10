import { RouterProvider, createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/userPages/UserDashboard';
import UserProfile from './pages/userPages/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import VehicleDetails from './Componnents/Details';
import Bookings from './pages/userPages/Bookings';
import AllBookings from './pages/userPages/Bookings';
import AdminVehiclesPage from './pages/admin/vehicles';
import AdminCarModelsPage from './pages/admin/Model';
import AdminCustomersPage from './pages/admin/Customer';
import AdminBranchesPage from './pages/admin/branches';
import StaffManagements from './pages/admin/stafff';
import AdminDamagesPage from './pages/admin/damages';
import PaymentManagemente from './pages/admin/payments';
import MaintenanceManagements from './pages/admin/maitanance';
import PaymentSettingsPage from './pages/admin/PaymentSettingsPage';
import VehicleSettingsPage from './pages/admin/VehicleSettingsPage';
import CompanySettingsPage from './pages/admin/CompanySettingsPage';
import SecuritySettingsPage from './pages/admin/SecuritySettingsPage';
import BookingSettingsPage from './pages/admin/settings';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import BookingPage from './pages/userPages/BookingPage';
import PaymentPage from './pages/userPages/PaymentPage';
import BookingSuccessPage from './pages/userPages/BookingSuccessPage';
import UserManagementsdd from './pages/admin/users';
import Reviews from './pages/userPages/Review';
import DamageReportPage from './pages/userPages/Damagesreport';
import CustomerVerification from './pages/userPages/CustomerVerification';
import Coupons from './pages/userPages/Coupons';
import PaymentsView from './pages/userPages/ViewPayments';
// import Vehicles from './pages/admin/vehicles';
import VehicleDetail from './pages/userPages/VehicleDetail';
import Vehicles from './pages/userPages/Vehicles';
import AdminRoute from './Componnents/auth/AdminRoute';
import UserRoute from './Componnents/auth/UserRoute';
import PublicRoute from './Componnents/auth/PublicRoute';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element:  <Home /> 
    },
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
      element: <PublicRoute> <Register /> </PublicRoute>
    },
    {
      path: '/login',
      element: <PublicRoute> <Login /> </PublicRoute>
    },
    
    // Vehicle Pages (Public)
    {
      path: '/Magariiii',
      element:  < Vehicles /> 
    },
    {
      path: '/vehicles/:vehicleId',
      element: <VehicleDetail/> 
    },
    
    // User Dashboard routes (Protected)
    {
      path: '/dashboard',
      element: <UserRoute> <UserDashboard /> </UserRoute> 
    },
    {
      path: '/dashboard/user-profile',
      element:<UserRoute> <UserProfile /> </UserRoute> 
    },
    {
      path: '/dashboard/bookings',
      element: <UserRoute>  <Bookings /> </UserRoute>
    },
    {
      path: '/dashboard/all-bookings',
      element: <UserRoute> <AllBookings /> </UserRoute> 
    },
    {
      path: '/dashboard/reviews',
      element: <UserRoute> <Reviews /> </UserRoute>
    },
    {
      path: '/dashboard/damages',
      element: <UserRoute> <DamageReportPage /> </UserRoute>
    },
    {
      path: '/dashboard/verification',
      element:<UserRoute> <CustomerVerification /> </UserRoute> 
    },
    {
      path: '/dashboard/coupons',
      element:<UserRoute> <Coupons /> </UserRoute> 
    },
    
    // Booking Flow (Public/Protected based on auth)
    {
      path: '/booking',
      element:<UserRoute> <BookingPage /> </UserRoute>
    },
    {
      path: '/bookings/payment',
      element: <UserRoute> <PaymentPage /> </UserRoute>
    },
    {
      path: '/booking-success',
      element:<UserRoute> <BookingSuccessPage /> </UserRoute> 
    },
    {
      path: '/bookings/paymentview',
      element: <UserRoute> <PaymentsView /> </UserRoute>
    },
    
    // Admin Dashboard routes (Protected)
    {
      path: '/admin/dashboard',
      element:<AdminRoute> <AdminDashboard /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/vehicles',
      element: <AdminRoute> <AdminVehiclesPage /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/models',
      element: <AdminRoute> <AdminCarModelsPage /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/customers',
      element:<AdminRoute> <AdminCustomersPage /> </AdminRoute> 
    },
    {
      path: '/admin/dashboard/branches',
      element: <AdminRoute> <AdminBranchesPage /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/staff',
      element:<AdminRoute> <StaffManagements /> </AdminRoute> 
    },
    {
      path: '/admin/dashboard/damage-reports',
      element: <AdminRoute> <AdminDamagesPage /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/payments',
      element: <AdminRoute> <PaymentManagemente /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/maintenance',
      element: <AdminRoute> <MaintenanceManagements /> </AdminRoute>
    },
    {
      path: '/admin/dashboard/bookings',
      element: <AdminRoute> <BookingManagementPage /> </AdminRoute>
    },
    {
      path: '/admin/Users',
      element: <AdminRoute> <UserManagementsdd /> </AdminRoute>
    },
    
    // Admin Settings (Protected)
    {
      path: '/admin/settings/payments',
      element:<AdminRoute> <PaymentSettingsPage /> </AdminRoute> 
    },
    {
      path: '/admin/settings/vehicles',
      element: <AdminRoute> <VehicleSettingsPage /> </AdminRoute>
    },
    {
      path: '/admin/settings/company',
      element:<AdminRoute> <CompanySettingsPage /> </AdminRoute> 
    },
    {
      path: '/admin/settings/security',
      element: <AdminRoute> <SecuritySettingsPage /> </AdminRoute>
    },
    {
      path: '/admin/settings/bookings',
      element:<AdminRoute>  <BookingSettingsPage /> </AdminRoute> 
    },
    
    // Legacy route - keep for compatibility
    {
      path: '/vehicle-details/:vehicle_id',
      element: <PublicRoute> <VehicleDetails /> </PublicRoute> 
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;