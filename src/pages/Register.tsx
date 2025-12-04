import React from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'
import SignUp from '../assets/sign-up.svg'
import { Link, useNavigate } from 'react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthApi } from '../features/Api/AuthApi'
import { Toaster, toast } from 'sonner'

type RegisterFormValues = {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    phone_number?: string;
    // address?: string;
    // role?: 'Customer' | 'Admin' | 'Manager' | 'Agent';
}

const Register: React.FC = () => {
    // RTK Query mutation hook for registration 
    const [registerUser, { isLoading }] = AuthApi.useRegisterMutation();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>();
    const navigate = useNavigate();

    // Watch password for confirmation validation
    const password = watch('password');

    // Handle form submission
    const handleSubmitForm: SubmitHandler<RegisterFormValues> = async (data) => {
        try {
            // Remove confirm_password before sending to backend
            const { confirm_password, ...registerData } = data;
            
            const response = await registerUser(registerData).unwrap();
            console.log('Registration successful:', response);
            
            // Show success message with email verification info
            toast.success(response.message || 'Registration successful! Please check your email for verification.');
            
            // Navigate to login page after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error: any) {
            console.error('Registration failed:', error);
            
            // Handle different error response formats
            const errorMessage = error.data?.error || error.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        }
    };

    // Password strength validation
    const validatePassword = (value: string) => {
        if (value.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
            return 'Password must contain both uppercase and lowercase letters';
        }
        if (!/(?=.*\d)/.test(value)) {
            return 'Password must contain at least one number';
        }
        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
            return 'Password must contain at least one special character';
        }
        return true;
    };

    // Username validation
    const validateUsername = (value: string) => {
        if (value.length < 3 || value.length > 50) {
            return 'Username must be between 3 and 50 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return true;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Toaster position="top-right" richColors />
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl overflow-hidden w-full max-w-6xl shadow-2xl">
                    {/* Form Section */}
                    <div className="flex items-center justify-center p-8">
                        <div className="w-full max-w-96 bg-white rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-blue-800 mb-1">
                                    Join Car Rental
                                </h2>
                                <p className="text-gray-500 text-base">
                                    Create your account
                                </p>
                            </div>

                            <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleSubmitForm)}>
                                {/* Username Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="username"
                                    >
                                        Username *
                                    </label>
                                    <input
                                        {...register('username', { 
                                            required: "Username is required",
                                            validate: validateUsername
                                        })}
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Choose a username"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="email"
                                    >
                                        Email *
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
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Number Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="phone_number"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        {...register('phone_number', { 
                                            pattern: { 
                                                value: /^[0-9+\-\s()]{10,15}$/, 
                                                message: "Invalid phone number format" 
                                            } 
                                        })}
                                        type="tel"
                                        id="phone_number"
                                        name="phone_number"
                                        placeholder="Phone Number (optional)"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                    {errors.phone_number && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.phone_number.message}
                                        </p>
                                    )}
                                </div>

                                {/* Address Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="address"
                                    >
                                        Address
                                    </label>
                                    {/* <input
                                        {...register('address')}
                                        type="text"
                                        id="address"
                                        name="address"
                                        placeholder="Your address (optional)"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    /> */}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="password"
                                    >
                                        Password *
                                    </label>
                                    <input
                                        {...register('password', { 
                                            required: "Password is required",
                                            validate: validatePassword
                                        })}
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500">
                                        Password must contain: 8+ characters, uppercase & lowercase letters, numbers, and special characters
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="confirm_password"
                                    >
                                        Confirm Password *
                                    </label>
                                    <input
                                        {...register('confirm_password', { 
                                            required: "Please confirm your password",
                                            validate: value => value === password || "Passwords do not match"
                                        })}
                                        type="password"
                                        id="confirm_password"
                                        name="confirm_password"
                                        placeholder="Confirm your password"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                    />
                                    {errors.confirm_password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.confirm_password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Hidden Role Field (defaults to Customer) */}
                                {/* <input
                                    type="hidden"
                                    {...register('role')}
                                    value="Customer"
                                /> */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white px-4 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 shadow-md hover:shadow-lg w-full flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner text-white"></span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Terms and Privacy Notice */}
                                <div className="text-center text-xs text-gray-500">
                                    By creating an account, you agree to our{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                                        Privacy Policy
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-2 text-center mt-4">
                                    <Link to="/" className="text-blue-800 no-underline flex items-center justify-center gap-1 text-sm hover:text-blue-900">
                                        <span role="img" aria-label="home">🏡</span> Go to HomePage
                                    </Link>
                                    <Link to="/login" className="text-blue-600 no-underline flex items-center justify-center gap-1 text-sm hover:text-blue-700">
                                        Already have an account? Login
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* Image Section */}
                    <div className="flex items-center justify-center bg-blue-50 p-8">
                        <img
                            src={SignUp}
                            alt="Register"
                            className="w-full max-w-96 rounded-2xl h-auto"
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Register