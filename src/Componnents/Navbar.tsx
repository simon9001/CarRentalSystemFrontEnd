import React from 'react'
import { Link, useNavigate } from 'react-router'
import type { RootState } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../features/Slice/AuthSlice.ts';
import { ChevronDown, LogOut, User, Car, Settings, LayoutDashboard } from 'lucide-react';
import { AuthApi } from '../features/Api/AuthApi.ts';

const Navbar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get the auth state from redux store
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    
    // Logout mutation
    const [logout] = AuthApi.useLogoutMutation();

    const handleLogout = async () => {
        try {
            // Call logout endpoint if user is authenticated
            if (isAuthenticated) {
                await logout().unwrap();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call result
            dispatch(clearCredentials());
            navigate('/login');
        }
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (!user) return 'User';
        return user.username || user.email?.split('@')[0] || 'User';
    };

    // Check if user has admin/manager role
    const isStaff = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Agent';
    
    // Check if user is a regular customer
    const isCustomer = user?.role === 'Customer';

    return (
        <div className="navbar bg-white shadow-md sticky top-0 z-50 py-4">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-white rounded-lg z-10 mt-3 w-52 p-2 shadow-lg border">
                        <Link to="/"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Home</li></Link>
                        <Link to="/vehicles"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Vehicles</li></Link>
                        
                        {/* Dashboard links for authenticated users */}
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Dashboard</li></Link>
                                <Link to="/bookings"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">My Bookings</li></Link>
                            </>
                        )}
                        
                        <Link to="/about"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">About</li></Link>
                        <Link to="/contact"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Contact</li></Link>
                        
                        {/* Staff-only links */}
                        {isStaff && (
                            <>
                                <Link to="/admin/dashboard"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Admin Dashboard</li></Link>
                                <Link to="/admin/vehicles"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Manage Vehicles</li></Link>
                            </>
                        )}
                        
                        {!isAuthenticated && (
                            <Link to="/register"><li className="text-white btn bg-blue-800 hover:bg-blue-700 rounded-md transition-colors duration-200">Register</li></Link>
                        )}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl font-semibold text-blue-800 hover:bg-transparent">
                    <Car className="w-6 h-6 mr-2" />
                    Car Rental
                </Link>
            </div>
            
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    <Link to="/"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Home</li></Link>
                    <Link to="/vehicles"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Vehicles</li></Link>
                    
                    {/* Dashboard links for authenticated users */}
                    {isAuthenticated && (
                        <>
                            <Link to="/dashboard"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Dashboard</li></Link>
                            <Link to="/bookings"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">My Bookings</li></Link>
                        </>
                    )}
                    
                    <Link to="/about"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">About</li></Link>
                    <Link to="/contact"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Contact</li></Link>
                    
                    {/* Staff-only links */}
                    {isStaff && (
                        <>
                            <Link to="/admin/dashboard"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Admin Dashboard</li></Link>
                            <Link to="/admin/vehicles"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Manage Vehicles</li></Link>
                        </>
                    )}
                    
                    {!isAuthenticated && (
                        <Link to="/register"><li className="text-white btn bg-blue-800 hover:bg-blue-700 font-medium px-4 py-2 rounded-md transition-all duration-300">Register</li></Link>
                    )}
                </ul>
            </div>
            
            <div className="navbar-end">
                {!isAuthenticated ? (
                    <Link to="/login">
                        <button className="btn bg-blue-800 hover:bg-blue-900 text-white border-blue-800 hover:border-blue-900 px-6 py-2 font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                            Login
                        </button>
                    </Link>
                ) : (
                    <div className="dropdown dropdown-end">
                        <button className="btn btn-ghost flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-800" />
                                </div>
                                <span className="text-gray-700 font-medium">Hey, {getUserDisplayName()}</span>
                                <ChevronDown className="w-4 h-4 text-blue-800" />
                            </div>
                        </button>
                        
                        <ul className="dropdown-content bg-white rounded-box z-50 mt-3 w-64 p-2 shadow-lg border">
                            {/* User Info */}
                            <li className="px-4 py-3 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800">{user?.username}</span>
                                    <span className="text-sm text-gray-500">{user?.email}</span>
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                                        {user?.role}
                                    </span>
                                    {!user?.is_email_verified && (
                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full mt-1 inline-block">
                                            Email not verified
                                        </span>
                                    )}
                                </div>
                            </li>
                            
                            {/* Dashboard Link for Customers */}
                            {isCustomer && (
                                <li>
                                    <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-blue-800 hover:bg-gray-50 p-3 rounded-md transition-colors duration-200">
                                        <LayoutDashboard className="w-4 h-4 mr-3" />
                                        My Dashboard
                                    </Link>
                                </li>
                            )}
                            
                            {/* Profile Link */}
                            <li>
                                <Link to="/dashboard/user-profile" className="flex items-center text-gray-700 hover:text-blue-800 hover:bg-gray-50 p-3 rounded-md transition-colors duration-200">
                                    <User className="w-4 h-4 mr-3" />
                                    My Profile
                                </Link>
                            </li>
                            
                            {/* Bookings Link */}
                            <li>
                                <Link to="/bookings" className="flex items-center text-gray-700 hover:text-blue-800 hover:bg-gray-50 p-3 rounded-md transition-colors duration-200">
                                    <Car className="w-4 h-4 mr-3" />
                                    My Bookings
                                </Link>
                            </li>
                            
                            {/* Admin/Staff Links */}
                            {isStaff && (
                                <li>
                                    <Link to="/admin/dashboard" className="flex items-center text-gray-700 hover:text-blue-800 hover:bg-gray-50 p-3 rounded-md transition-colors duration-200">
                                        <Settings className="w-4 h-4 mr-3" />
                                        Admin Dashboard
                                    </Link>
                                </li>
                            )}
                            
                            {/* Logout */}
                            <li className="border-t border-gray-100 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-50 p-3 rounded-md transition-colors duration-200 w-full text-left"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar