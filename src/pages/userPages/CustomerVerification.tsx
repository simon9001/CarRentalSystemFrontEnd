import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { 
  UserCheck, 
  User, 
  FileText, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  IdCard,
  Car,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Star
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { CustomerDetailsApi } from '../../features/Api/CustomerDetailsApi'
import { UserProfileApi } from '../../features/Api/CustomerUserApi' // Add this import

const CustomerVerification: React.FC = () => {
  // Get user from redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Fetch customer details for the logged-in user
  const { data: customerDetailsResponse, isLoading, error, refetch } = CustomerDetailsApi.useGetCustomerDetailsByIdQuery(
    isAuthenticated ? user!.user_id : skipToken
  )
  
  // Extract data from response
  const customerDetails = customerDetailsResponse?.success ? customerDetailsResponse.data : null;
  
  // Fetch user profile data for additional user information
  const { data: profileResponse } = UserProfileApi.useGetCurrentProfileQuery(
    isAuthenticated && user?.user_id ? user.user_id : skipToken
  )
  
  const profileData = profileResponse?.success ? profileResponse.data : null;
  
  // RTK mutation for creating/updating customer details
  const [createCustomerDetails, { isLoading: submitting }] = CustomerDetailsApi.useCreateCustomerDetailsMutation();
  const [updateCustomerDetails] = CustomerDetailsApi.useUpdateCustomerDetailsMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    national_id: '',
    drivers_license_number: '',
    license_expiry: '',
    license_issue_date: '',
    license_issuing_authority: '',
    preferred_payment_method: '',
    marketing_opt_in: false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form when customer details are loaded
  useEffect(() => {
    if (customerDetails) {
      setFormData({
        national_id: customerDetails.national_id || '',
        drivers_license_number: customerDetails.drivers_license_number || '',
        license_expiry: customerDetails.license_expiry?.split('T')[0] || '',
        license_issue_date: customerDetails.license_issue_date?.split('T')[0] || '',
        license_issuing_authority: customerDetails.license_issuing_authority || '',
        preferred_payment_method: customerDetails.preferred_payment_method || '',
        marketing_opt_in: customerDetails.marketing_opt_in || false
      });
    }
  }, [customerDetails]);
  
  // Helper functions
  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Verification' },
      Verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' },
      Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getAccountStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { color: 'bg-green-100 text-green-800', icon: ShieldCheck, label: 'Active' },
      Suspended: { color: 'bg-red-100 text-red-800', icon: ShieldAlert, label: 'Suspended' },
      Inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Inactive' },
      Pending_Verification: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Verification' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending_Verification;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format full name from profile data
  const getFullName = () => {
    if (profileData) {
      if (profileData.first_name && profileData.last_name) {
        return `${profileData.first_name} ${profileData.last_name}`;
      }
      if (profileData.first_name) {
        return profileData.first_name;
      }
      if (profileData.last_name) {
        return profileData.last_name;
      }
    }
    return user?.username || 'Not available';
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    
    if (!formData.drivers_license_number.trim()) {
      newErrors.drivers_license_number = 'Drivers license number is required';
    }
    
    if (!formData.license_expiry) {
      newErrors.license_expiry = 'License expiry date is required';
    } else {
      const expiryDate = new Date(formData.license_expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate <= today) {
        newErrors.license_expiry = 'License expiry date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    Swal.fire({
      title: customerDetails ? 'Update Verification Details?' : 'Submit Verification Details?',
      text: 'Please ensure all information is accurate. Incorrect information may delay verification.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: customerDetails ? 'Update Details' : 'Submit for Verification',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const customerData = {
            customer_id: user!.user_id,
            national_id: formData.national_id || undefined,
            drivers_license_number: formData.drivers_license_number,
            license_expiry: formData.license_expiry,
            license_issue_date: formData.license_issue_date || undefined,
            license_issuing_authority: formData.license_issuing_authority || undefined,
            preferred_payment_method: formData.preferred_payment_method || undefined,
            marketing_opt_in: formData.marketing_opt_in,
            account_status: 'Pending_Verification',
            verification_status: 'Pending'
          };
          
          let response;
          if (customerDetails) {
            response = await updateCustomerDetails({
              customer_id: user!.user_id,
              updates: customerData
            }).unwrap();
          } else {
            response = await createCustomerDetails(customerData).unwrap();
          }
          
          // Check if the operation was successful
          if (!response?.success) {
            throw new Error(response?.error || 'Failed to submit verification details');
          }
          
          setIsEditing(false);
          refetch();
          
          Swal.fire({
            title: 'Success!',
            text: customerDetails ? 'Verification details updated successfully.' : 'Verification details submitted successfully.',
            icon: 'success',
            confirmButtonColor: '#2563eb'
          });
          
        } catch (error: any) {
          console.error('Error submitting verification details:', error);
          Swal.fire({
            title: 'Error',
            text: error.data?.error || error.message || 'Failed to submit verification details. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
        }
      }
    });
  };

  // Handle API error
  const getErrorMessage = () => {
    if (!error) return null;
    
    // Check if it's an RTK Query error
    if ('data' in error) {
      const errorData = error.data as any;
      return errorData.error || 'An error occurred while loading verification details';
    }
    
    return 'An error occurred while loading verification details';
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserCheck className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Account Verification</h1>
          <p className="text-sm text-gray-600">Complete your verification to book vehicles</p>
        </div>
      </div>

      {/* Verification Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
          <span className="ml-3 text-gray-600">Loading verification details...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Verification</h3>
          <p className="text-red-600">{getErrorMessage()}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h2>
              <div className="flex gap-2">
                {customerDetails && getVerificationBadge(customerDetails.verification_status)}
                {customerDetails && getAccountStatusBadge(customerDetails.account_status)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-800">{getFullName()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{profileData?.email || user?.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">{profileData?.phone_number || user?.phone_number || 'Not provided'}</p>
                </div>
              </div>
              {customerDetails?.loyalty_points !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loyalty Points</p>
                    <p className="font-medium text-gray-800">{customerDetails.loyalty_points}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Profile Information if available */}
            {profileData && (profileData.address || profileData.city || profileData.country) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profileData.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{profileData.address}</span>
                    </div>
                  )}
                  {profileData.city && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{profileData.city}</span>
                    </div>
                  )}
                  {profileData.country && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{profileData.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Verification Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserCheck size={20} />
                Verification Details
              </h2>
              {customerDetails && !isEditing && customerDetails.verification_status !== 'Verified' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                >
                  Edit Details
                </button>
              )}
            </div>

            {/* Important Notice */}
            {(!customerDetails || customerDetails.verification_status === 'Rejected') && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">Verification Required</h3>
                    <p className="text-sm text-yellow-700">
                      {customerDetails?.verification_status === 'Rejected' 
                        ? customerDetails.verification_notes || 'Your verification was rejected. Please update your details and resubmit.'
                        : 'You must complete verification before you can book vehicles. Please provide your identification details below.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* National ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <IdCard size={16} />
                    National ID / Passport
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.national_id ? 'input-error' : ''}`}
                    value={formData.national_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                    placeholder="Enter national ID or passport number"
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                  />
                  {errors.national_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.national_id}</p>
                  )}
                </div>

                {/* Driver's License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <IdCard size={16} />
                    Driver's License Number *
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.drivers_license_number ? 'input-error' : ''}`}
                    value={formData.drivers_license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, drivers_license_number: e.target.value }))}
                    placeholder="Enter driver's license number"
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                    required
                  />
                  {errors.drivers_license_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.drivers_license_number}</p>
                  )}
                </div>

                {/* License Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    License Issue Date
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.license_issue_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_issue_date: e.target.value }))}
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                  />
                </div>

                {/* License Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    className={`input input-bordered w-full ${errors.license_expiry ? 'input-error' : ''}`}
                    value={formData.license_expiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_expiry: e.target.value }))}
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                    required
                  />
                  {errors.license_expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.license_expiry}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Must be a future date
                  </p>
                </div>

                {/* Issuing Authority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.license_issuing_authority}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_issuing_authority: e.target.value }))}
                    placeholder="e.g., NTSA, DVLA, etc."
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                  />
                </div>

                {/* Preferred Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard size={16} />
                    Preferred Payment Method
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.preferred_payment_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_payment_method: e.target.value }))}
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                  >
                    <option value="">Select payment method</option>
                    <option value="Mpesa">Mpesa</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Marketing Opt-in */}
              <div className="mt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.marketing_opt_in}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketing_opt_in: e.target.checked }))}
                    disabled={customerDetails && !isEditing && customerDetails.verification_status === 'Verified'}
                  />
                  <span className="text-sm text-gray-700">
                    I want to receive marketing emails about special offers and promotions
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original data
                      if (customerDetails) {
                        setFormData({
                          national_id: customerDetails.national_id || '',
                          drivers_license_number: customerDetails.drivers_license_number || '',
                          license_expiry: customerDetails.license_expiry?.split('T')[0] || '',
                          license_issue_date: customerDetails.license_issue_date?.split('T')[0] || '',
                          license_issuing_authority: customerDetails.license_issuing_authority || '',
                          preferred_payment_method: customerDetails.preferred_payment_method || '',
                          marketing_opt_in: customerDetails.marketing_opt_in || false
                        });
                      }
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={submitting || (customerDetails && !isEditing && customerDetails.verification_status === 'Verified')}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {customerDetails ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : customerDetails ? (
                    isEditing ? 'Update Details' : 
                    customerDetails.verification_status === 'Verified' ? 'Verified ✓' : 'Details Submitted'
                  ) : (
                    'Submit for Verification'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Verification Status Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Verification Process Information
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Pending Verification:</span> Your details have been submitted and are awaiting review by our team (typically 1-2 business days).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Verified:</span> Your account is fully verified and you can book vehicles immediately.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Rejected:</span> Your verification was not approved. Please check the notes above and update your details.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Important:</span> You <strong>cannot book vehicles</strong> until your account is verified to "Verified" status.
                </div>
              </li>
            </ul>
          </div>

          {/* License Expiry Warning */}
          {customerDetails?.license_expiry && (
            <div className={`border rounded-lg p-6 ${
              new Date(customerDetails.license_expiry) < new Date() 
                ? 'bg-red-50 border-red-200' 
                : new Date(customerDetails.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={
                  new Date(customerDetails.license_expiry) < new Date() 
                    ? 'text-red-600' 
                    : new Date(customerDetails.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? 'text-yellow-600'
                    : 'text-green-600'
                } size={20} />
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    {new Date(customerDetails.license_expiry) < new Date() 
                      ? 'License Expired'
                      : new Date(customerDetails.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? 'License Expiring Soon'
                      : 'License Valid'
                    }
                  </h3>
                  <p className="text-sm text-gray-700">
                    Your driver's license expires on {formatDate(customerDetails.license_expiry)}. 
                    {new Date(customerDetails.license_expiry) < new Date() 
                      ? ' You must renew your license to continue booking vehicles.'
                      : new Date(customerDetails.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? ' Please renew your license soon to avoid interruption in service.'
                      : ' Your license is valid.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default CustomerVerification;