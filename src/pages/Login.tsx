import React from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'
import SignIn from '../assets/login.svg'
import { Link, useNavigate } from 'react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthApi } from '../features/Api/AuthApi.ts'
import { toast, Toaster } from 'sonner'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/Slice/AuthSlice.ts';

type LoginFormValues = {
    email: string;
    password: string;
    device_info?: string;
    ip_address?: string;
    user_agent?: string;
};

const Login: React.FC = () => {
    // RTK Query mutation hook for login - updated to match your backend
    const [loginUser, { isLoading }] = AuthApi.useLoginMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get client info for enhanced security
    const getClientInfo = () => {
        return {
            device_info: navigator.userAgent,
            ip_address: 'unknown', // You might want to get this from a service
            user_agent: navigator.userAgent
        };
    };

    // Handle form submission
    const handleLoginForm: SubmitHandler<LoginFormValues> = async (data) => {
        try {
            const clientInfo = getClientInfo();
            const loginData = {
                ...data,
                ...clientInfo
            };

            const response = await loginUser(loginData).unwrap();
            console.log('Login successful:', response);

            // Dispatch the login success action to store the token and user info in Redux store
            // Updated to match your backend response structure
            dispatch(setCredentials({ 
                token: response.access_token, 
                refresh_token: response.refresh_token,
                user: response.user 
            }));
            
            // Show success message
            toast.success('Login successful!');
            
            // Redirect based on user role or to home page
            navigate('/');
            
        } catch (error: any) {
            console.error('Login failed:', error);
            
            // Handle different error response formats from your backend
            const errorMessage = error.data?.error || error.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Toaster position="top-right" richColors />
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl overflow-hidden w-full max-w-6xl shadow-2xl">
                    {/* Image Section */}                    
                    <div className="hidden lg:flex items-center justify-center bg-blue-50 p-4">
                        <img
                            src={SignIn}
                            alt="Login"
                            className="w-full max-w-96 rounded-2xl h-auto"
                        />
                    </div>
                    {/* Form Section */}
                    <div className="flex items-center justify-center p-8">
                        <div className="w-full max-w-96 bg-white rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-blue-800 mb-2">
                                    Welcome Back
                                </h2>
                                <p className="text-gray-500 text-base">
                                    Sign in to your Car Rental account
                                </p>
                            </div>

                            <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleLoginForm)}>
                                {/* Email Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        {...register('email', { 
                                            required: "Email is required", 
                                            pattern: { 
                                                value: /^\S+@\S+$/i, 
                                                message: "Invalid email address" 
                                            } 
                                        })}
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Email address"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        {errors.email.message}
                                    </p>
                                )}

                                {/* Password Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="password"
                                    >
                                        Password
                                    </label>
                                    <input
                                        {...register('password', { 
                                            required: "Password is required", 
                                            minLength: { 
                                                value: 8, 
                                                message: "Password must be at least 8 characters" 
                                            } 
                                        })}
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        {errors.password.message}
                                    </p>
                                )}

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-blue-600 no-underline text-sm hover:text-blue-700"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>

                                {/* Email Verification Reminder */}
                                <div className="text-center">
                                    <Link 
                                        to="/resend-verification" 
                                        className="text-gray-600 no-underline text-sm hover:text-gray-700"
                                    >
                                        Didn't receive verification email?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white px-4 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 shadow-md hover:shadow-lg w-full flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner text-white"></span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <div className="flex flex-col gap-2 text-center mt-4">
                                    <Link to="/" className="text-blue-800 no-underline flex items-center justify-center gap-1 text-sm hover:text-blue-900">
                                        <span role="img" aria-label="home">🏡</span> Go to HomePage
                                    </Link>
                                    <Link to="/register" className="text-blue-600 no-underline flex items-center justify-center gap-1 text-sm hover:text-blue-700">
                                        Don't have an account? Register
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Login