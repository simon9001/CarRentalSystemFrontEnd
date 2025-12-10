import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { AlertTriangle, Camera, Upload, User, Mail, Car, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock, Wrench } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
// Import BookingDetails from BookingApi
import { BookingApi, type BookingDetails } from '../../features/Api/BookingApi'
// Import DamageApi types and hooks
import { 
  useCreateDamageReportMutation, 
  useGetDamageReportsByCustomerQuery,
  type DamageReport as ApiDamageReport 
} from '../../features/Api/DamageApi'
// Import UserProfileApi to get full name
import { UserProfileApi } from '../../features/Api/CustomerUserApi'

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dfhzcvbof'
const CLOUDINARY_UPLOAD_PRESET = 'Csrrentalsystem'
const CLOUDINARY_FOLDER = 'currentalsystem/vehicles/damage-reports'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

interface DamageReportForm {
  booking_id: number | null;
  vehicle_id: number | null;
  customer_id: number | null;
  incident_description: string;
  damage_cost: number;
  photos: string[] | null;
}

interface PreviousDamageReport {
  incident_id: number;
  booking_id: number;
  vehicle_id: number;
  customer_id: number;
  incident_description: string;
  damage_cost: number;
  date_recorded: string;
  resolved_date: string | null;
  status: 'Reported' | 'Assessed' | 'Repaired' | 'Closed';
  photos: string[] | null;
  registration_number?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
}

const DamageReportPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Get user from redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Fetch user profile to get full name
  const { data: userProfile } = UserProfileApi.useGetProfileByUserIdQuery(
    user?.user_id || 0,
    {
      skip: !isAuthenticated || !user?.user_id
    }
  );
  
  // Fetch customer's bookings
  const { data: customerBookings = [], isLoading: bookingsLoading } = BookingApi.useGetBookingsByCustomerQuery(
    user?.user_id || 0,
    {
      skip: !isAuthenticated || !user?.user_id
    }
  );
  
  // Filter active/completed bookings
  const filteredBookings = React.useMemo(() => {
    if (!Array.isArray(customerBookings)) return [];
    return customerBookings.filter((booking: BookingDetails) => 
      ['Completed', 'Active'].includes(booking.booking_status)
    );
  }, [customerBookings]);
  
  // Fetch previous damage reports for this customer
  const { 
    data: apiResponse = [], 
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports 
  } = useGetDamageReportsByCustomerQuery(
    user?.user_id || 0,
    {
      skip: !isAuthenticated || !user?.user_id
    }
  );
  
  // Form state
  const [formData, setFormData] = useState<DamageReportForm>({
    booking_id: null,
    vehicle_id: null,
    customer_id: user?.user_id || null,
    incident_description: '',
    damage_cost: 0,
    photos: null
  });
  
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof DamageReportForm, string>>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // RTK mutation for creating damage report
  const [createDamageReport, { isLoading: submitting }] = useCreateDamageReportMutation();
  
  // Handle booking selection
  const handleBookingChange = (bookingId: number) => {
    const booking = filteredBookings.find((b: BookingDetails) => b.booking_id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setFormData(prev => ({
        ...prev,
        booking_id: booking.booking_id,
        vehicle_id: booking.vehicle_id,
        customer_id: user?.user_id || null
      }));
    }
  };
  
  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Only JPG, PNG, GIF, and WebP images are allowed.'
      });
      return;
    }
    
    // Validate file size (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Each image must be less than 5MB.'
      });
      return;
    }
    
    // Limit to 5 files
    if (imageFiles.length + files.length > 5) {
      Swal.fire({
        icon: 'error',
        title: 'Too Many Files',
        text: 'You can upload a maximum of 5 images.'
      });
      return;
    }
    
    // Add files to state
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  // Upload all images to Cloudinary
  const uploadImagesToCloudinary = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploading(true);
    try {
      const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setUploading(false);
      return urls;
    } catch (error) {
      setUploading(false);
      throw error;
    }
  };
  
  // Remove uploaded image
  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    
    // Revoke object URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    
    // Remove corresponding URL from form data
    setFormData(prev => {
      if (!prev.photos) return prev;
      
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { 
        ...prev, 
        photos: newPhotos.length > 0 ? newPhotos : null 
      };
    });
  };
  
  // Form validation - Updated to make damage_cost required
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DamageReportForm, string>> = {};
    
    if (!formData.booking_id) {
      newErrors.booking_id = 'Please select a booking';
    }
    
    if (!formData.incident_description.trim()) {
      newErrors.incident_description = 'Damage description is required';
    } else if (formData.incident_description.trim().length < 10) {
      newErrors.incident_description = 'Description must be at least 10 characters';
    }
    
    // Updated: Damage cost is now required
    if (formData.damage_cost <= 0) {
      newErrors.damage_cost = 'Damage cost is required and must be greater than 0';
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
      title: 'Submit Damage Report?',
      text: 'Please confirm that all information is accurate.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, submit report',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Upload images to Cloudinary first
          let imageUrls: string[] = [];
          if (imageFiles.length > 0) {
            Swal.fire({
              title: 'Uploading Images...',
              text: 'Please wait while we upload your images.',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
            
            try {
              imageUrls = await uploadImagesToCloudinary();
              Swal.close();
            } catch (uploadError) {
              Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: 'Failed to upload images. Please try again.'
              });
              return;
            }
          }
          
          // Prepare data for API
          const damageData = {
            booking_id: formData.booking_id!,
            vehicle_id: formData.vehicle_id!,
            customer_id: formData.customer_id!,
            incident_description: formData.incident_description,
            damage_cost: formData.damage_cost,
            photos: imageUrls.length > 0 ? imageUrls.join('||') : null
          };
          
          console.log('Submitting damage report:', damageData);
          
          // Call the mutation
          const result = await createDamageReport(damageData).unwrap();
          console.log('Damage report created:', result);
          
          // Reset form
          setFormData({
            booking_id: null,
            vehicle_id: null,
            customer_id: user?.user_id || null,
            incident_description: '',
            damage_cost: 0,
            photos: null
          });
          setSelectedBooking(null);
          setImagePreviews([]);
          setImageFiles([]);
          setErrors({});
          
          // Refetch previous reports to update the list
          refetchReports();
          
          Swal.fire({
            title: 'Success!',
            text: 'Damage report submitted successfully.',
            icon: 'success',
            confirmButtonColor: '#2563eb'
          });
          
        } catch (error: any) {
          console.error('Error submitting damage report:', error);
          
          let errorMessage = 'Failed to submit damage report. Please try again.';
          
          if (error.data?.error) {
            errorMessage = error.data.error;
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.data?.message) {
            errorMessage = error.data.message;
          }
          
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
        }
      }
    });
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Reported: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Reported' },
      Assessed: { color: 'bg-blue-100 text-blue-800', icon: Wrench, label: 'Assessed' },
      Repaired: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Repaired' },
      Closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Closed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Reported;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile?.data?.first_name || userProfile?.data?.last_name) {
      const firstName = userProfile.data.first_name || '';
      const lastName = userProfile.data.last_name || '';
      return `${firstName} ${lastName}`.trim();
    }
    return user?.username || 'Customer';
  };

  // Convert API damage reports to PreviousDamageReport format
  const previousDamageReports = React.useMemo(() => {
    // Ensure apiResponse is always an array
    const reportsData = Array.isArray(apiResponse) ? apiResponse : [];
    
    console.log('Processing damage reports:', {
      rawResponse: apiResponse,
      reportsCount: reportsData.length,
      userId: user?.user_id
    });
    
    return reportsData.map((report: any): PreviousDamageReport => {
      // Handle booking_id - it might be an array in the response
      let bookingId: number;
      if (Array.isArray(report.booking_id)) {
        // Take the first value if it's an array
        bookingId = report.booking_id[0] || 0;
      } else {
        bookingId = report.booking_id || 0;
      }
      
      // Parse photos from string to array
      let photosArray: string[] | null = null;
      if (report.photos) {
        if (typeof report.photos === 'string' && report.photos.trim() !== '') {
          // Split by '||' delimiter if it exists
          if (report.photos.includes('||')) {
            photosArray = report.photos.split('||').filter((url: string) => url.trim() !== '');
          } else {
            // Single URL
            photosArray = [report.photos];
          }
        } else if (Array.isArray(report.photos)) {
          photosArray = report.photos;
        }
      }
      
      return {
        incident_id: report.incident_id || 0,
        booking_id: bookingId,
        vehicle_id: report.vehicle_id || 0,
        customer_id: report.customer_id || 0,
        incident_description: report.incident_description || '',
        damage_cost: report.damage_cost || 0,
        date_recorded: report.date_recorded || new Date().toISOString(),
        resolved_date: report.resolved_date || null,
        status: report.status || 'Reported',
        photos: photosArray,
        registration_number: report.registration_number,
        make: report.make,
        model: report.model,
        year: report.year,
        color: report.color
      };
    });
  }, [apiResponse, user?.user_id]);

  // Reset form when user changes
  useEffect(() => {
    if (user?.user_id) {
      setFormData(prev => ({
        ...prev,
        customer_id: user.user_id
      }));
    }
  }, [user]);

  // Update damage cost when input changes
  const handleDamageCostChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, damage_cost: numValue }));
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">Please sign in to report damage.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Report Vehicle Damage</h1>
          <p className="text-sm text-gray-600">Submit damage reports for your rentals</p>
        </div>
      </div>

      {/* Customer Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={20} />
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-medium text-gray-800">{getUserDisplayName()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{user?.email || 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Damage Report Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <AlertTriangle size={20} />
              New Damage Report
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Booking Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Select Booking *
                </label>
                <select
                  className={`select select-bordered w-full ${errors.booking_id ? 'select-error' : ''}`}
                  value={formData.booking_id || ''}
                  onChange={(e) => handleBookingChange(Number(e.target.value))}
                  disabled={bookingsLoading}
                >
                  <option value="">Select a booking</option>
                  {filteredBookings.map((booking: BookingDetails) => (
                    <option key={booking.booking_id} value={booking.booking_id}>
                      #{booking.booking_id} - {booking.make} {booking.model} ({booking.year}) - {formatDate(booking.pickup_date)} to {formatDate(booking.return_date)}
                    </option>
                  ))}
                </select>
                {errors.booking_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.booking_id}</p>
                )}
                {bookingsLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading bookings...</p>
                )}
                {!bookingsLoading && filteredBookings.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No active or completed bookings found.</p>
                )}
              </div>

              {/* Vehicle Information (Auto-populated) */}
              {selectedBooking && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Car size={16} />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Registration</p>
                      <p className="font-medium text-gray-800">{selectedBooking.registration_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Make & Model</p>
                      <p className="font-medium text-gray-800">{selectedBooking.make} {selectedBooking.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year & Color</p>
                      <p className="font-medium text-gray-800">{selectedBooking.year} • {selectedBooking.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rental Period</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(selectedBooking.pickup_date)} - {formatDate(selectedBooking.return_date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Damage Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Damage Description *
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-32 ${errors.incident_description ? 'textarea-error' : ''}`}
                  value={formData.incident_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, incident_description: e.target.value }))}
                  placeholder="Describe the damage in detail. Include location, severity, and any other relevant information..."
                  maxLength={500}
                />
                {errors.incident_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.incident_description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.incident_description.length}/500 characters
                </p>
              </div>

              {/* Estimated Damage Cost - Updated to be required */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Estimated Damage Cost *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    className={`input input-bordered w-full pl-8 ${errors.damage_cost ? 'input-error' : ''}`}
                    value={formData.damage_cost || ''}
                    onChange={(e) => handleDamageCostChange(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                {errors.damage_cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.damage_cost}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Estimated cost for repairs. Must be greater than 0.
                </p>
              </div>

              {/* Photos Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Upload Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`btn btn-outline btn-sm cursor-pointer ${uploading ? 'btn-disabled' : ''}`}
                  >
                    {uploading ? 'Uploading...' : 'Browse Files'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum 5 images. {imageFiles.length}/5 uploaded
                  </p>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Damage preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={uploading}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                  disabled={submitting || uploading || !formData.booking_id || !formData.incident_description.trim() || formData.damage_cost <= 0}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : uploading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Uploading Images...
                    </>
                  ) : (
                    'Submit Damage Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Previous Damage Reports */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Previous Reports
            </h2>

            {reportsLoading ? (
              <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-sm text-gray-600"></span>
                <span className="ml-2 text-sm text-gray-600">Loading reports...</span>
              </div>
            ) : reportsError ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
                <p className="text-red-600">Error loading reports</p>
                <p className="text-sm text-gray-500 mt-1">Please try again later</p>
              </div>
            ) : previousDamageReports.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No previous damage reports</p>
                <p className="text-sm text-gray-500 mt-1">Submit your first damage report above</p>
                <button
                  onClick={() => refetchReports()}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Refresh reports
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-2">
                  Showing {previousDamageReports.length} report{previousDamageReports.length !== 1 ? 's' : ''}
                </div>
                {previousDamageReports.slice(0, 5).map((report: PreviousDamageReport) => (
                  <div key={report.incident_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {report.make || 'Unknown'} {report.model || 'Vehicle'}
                        </h4>
                        <p className="text-xs text-gray-500">{report.registration_number || 'No registration'}</p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {report.incident_description}
                    </p>
                    {report.photos && report.photos.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">
                          {report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800">
                        ${report.damage_cost.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(report.date_recorded)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {previousDamageReports.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => navigate('/dashboard/damage-reports')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all {previousDamageReports.length} reports →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} />
              Important Notes
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Submit damage reports within 24 hours of incident
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Clear photos help with faster processing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Estimated damage cost is now required
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                You'll be contacted for additional information if needed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Insurance claims may require additional documentation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DamageReportPage;