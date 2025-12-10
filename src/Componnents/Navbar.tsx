import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import type { RootState } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../features/Slice/AuthSlice.ts';
import { ChevronDown, LogOut, User, Car, Settings, LayoutDashboard, Camera } from 'lucide-react';
import { AuthApi } from '../features/Api/AuthApi.ts';
import { UserProfileApi, profileUtils } from '../features/Api/CustomerUserApi.ts';
import { toast, Toaster } from 'sonner';

const Navbar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get the auth state from redux store
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    
    // State for profile picture upload
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Fetch user profile if authenticated
    const { data: profileResponse, isLoading: isLoadingProfile, refetch: refetchProfile } = 
        UserProfileApi.useGetProfileByUserIdQuery(user?.user_id || 0, {
            skip: !isAuthenticated || !user?.user_id
        });
    
    const profileData = profileResponse?.data;
    
    // Profile picture upload mutation
    const [uploadProfilePicture] = UserProfileApi.useUploadProfilePictureMutation();
    const [removeProfilePicture] = UserProfileApi.useRemoveProfilePictureMutation();
    
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

    // Get user's profile picture or default
    const getProfilePicture = () => {
        if (profileData?.profile_picture) {
            return profileData.profile_picture;
        }
        return '/default-avatar.png'; // Make sure this image exists in your public folder
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = async (file: File) => {
        if (!user?.user_id) {
            toast.error("User ID not found");
            return;
        }

        setIsUploading(true);
        const loadingToastId = toast.loading("Uploading profile picture...");

        try {
            await uploadProfilePicture({
                user_id: user.user_id,
                file,
                onProgress: (progress) => {
                    toast.loading(`Uploading... ${progress}%`, { id: loadingToastId });
                }
            }).unwrap();

            // Refresh profile data
            refetchProfile();
            toast.success("Profile picture uploaded successfully!", { id: loadingToastId });
        } catch (error: any) {
            console.error('Profile picture upload failed:', error);
            const errorMessage = error?.data?.error || error?.message || 'Failed to upload profile picture';
            toast.error(errorMessage, { id: loadingToastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle profile picture removal
    const handleRemoveProfilePicture = async () => {
        if (!user?.user_id) {
            toast.error("User ID not found");
            return;
        }

        const confirmRemove = window.confirm("Are you sure you want to remove your profile picture?");
        if (!confirmRemove) return;

        const loadingToastId = toast.loading("Removing profile picture...");

        try {
            await removeProfilePicture(user.user_id).unwrap();
            
            // Refresh profile data
            refetchProfile();
            toast.success("Profile picture removed successfully!", { id: loadingToastId });
        } catch (error: any) {
            console.error('Profile picture removal failed:', error);
            const errorMessage = error?.data?.error || error?.message || 'Failed to remove profile picture';
            toast.error(errorMessage, { id: loadingToastId });
        }
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file
            const validation = profileUtils.validateImageFile(file);
            if (!validation.isValid) {
                toast.error(validation.error || "Invalid file");
                return;
            }
            handleProfilePictureUpload(file);
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        if (fileInputRef.current && !isUploading) {
            fileInputRef.current.click();
        }
    };

    // Check if user has admin/manager role
    const isStaff = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Agent';
    
    // Check if user is a regular customer
    const isCustomer = user?.role === 'Customer';

    return (
        <>
            <Toaster position="top-right" richColors />
            
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
            
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
                            <Link to="/Magariiii"><li className="text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md transition-colors duration-200">Vehicles</li></Link>
                            
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
                    <Link
                        to="/"
                        className="btn btn-ghost text-xl font-semibold text-blue-800 hover:bg-transparent"
                    >
                        <img
                            src="https://tse4.mm.bing.net/th/id/OIP.Fu8GCqsycuEgspBjTfIqYwHaEt?rs=1&pid=ImgDetMain&o=7&rm=3"
                            alt="Rent Moti Logo"
                            className="w-15 h-15 mr-8 object-cover rounded-full"
                        />
                        RENT MOTI
                    </Link>
                </div>
                
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1 gap-2">
                        <Link to="/"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Home</li></Link>
                        <Link to="/Magariiii"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Vehicles</li></Link>
                        
                        {/* Dashboard links for authenticated users */}
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Dashboard</li></Link>
                                <Link to="/dashboard/bookings"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">My Bookings</li></Link>
                            </>
                        )}
                        
                        <Link to="/about"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">About</li></Link>
                        <Link to="/contact"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Contact</li></Link>
                        
                        {/* Staff-only links */}
                        {isStaff && (
                            <>
                                <Link to="/admin/dashboard"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Admin Dashboard</li></Link>
                                <Link to="/admin/dashboard/vehicles"><li className="text-gray-600 hover:text-blue-800 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-all duration-300">Manage Vehicles</li></Link>
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
                                    <div className="relative group">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow">
                                            {isUploading ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <div className="loading loading-spinner loading-xs text-blue-600"></div>
                                                </div>
                                            ) : (
                                                <img 
                                                    src={getProfilePicture()} 
                                                    alt="Profile" 
                                                    className="w-3 h-1 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/default-avatar.png';
                                                    }}
                                                />
                                            )}
                                            {!isUploading && (
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-700 font-medium">Hey, {getUserDisplayName()}</span>
                                    <ChevronDown className="w-4 h-4 text-blue-800" />
                                </div>
                            </button>
                            
                            <ul className="dropdown-content bg-white rounded-box z-50 mt-3 w-64 p-2 shadow-lg border">
                                {/* User Info with Profile Picture */}
                                <li className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-3">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-4 border-white shadow-lg">
                                                <img 
                                                    src={getProfilePicture()} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/default-avatar.png';
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={triggerFileInput}
                                                disabled={isUploading}
                                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Change profile picture"
                                            >
                                                {isUploading ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <Camera size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <span className="font-semibold text-gray-800">{user?.username}</span>
                                        <span className="text-sm text-gray-500">{user?.email}</span>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                {user?.role}
                                            </span>
                                            {!user?.is_email_verified && (
                                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                    Email not verified
                                                </span>
                                            )}
                                            {profileData?.profile_picture && (
                                                <button
                                                    onClick={handleRemoveProfilePicture}
                                                    className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full hover:bg-red-100 transition-colors"
                                                >
                                                    Remove Photo
                                                </button>
                                            )}
                                        </div>
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
                                    <Link to="/dashboard/bookings" className="flex items-center text-gray-700 hover:text-blue-800 hover:bg-gray-50 p-3 rounded-md transition-colors duration-200">
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
        </>
    )
}

export default Navbar