// pages/VehicleDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, MapPin, Calendar, Users, Fuel, 
  Car, CheckCircle, Shield, CreditCard, 
  ChevronLeft, ChevronRight, Star, Clock,
  DollarSign, Cog, Car as CarIcon, ShieldCheck,
  Phone, Mail, Navigation
} from 'lucide-react';
import Navbar from '../../Componnents/Navbar.tsx';
import Footer from '../../Componnents/Footer.tsx';
import { VehicleApi } from '../../features/Api/VehicleApi';
import { toast, Toaster } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

// Define the auth state type
interface AuthState {
  auth: {
    token: string | null;
    user: any | null;
    refresh_token?: string;
  };
}

const VehicleDetail: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
  // Get authentication state from Redux store - matching VehicleListing
  const { token, user } = useSelector((state: AuthState) => state.auth);
  const isAuthenticated = !!token;
  
  // Fetch vehicle data
  const { 
    data: vehicle, 
    isLoading, 
    error 
  } = VehicleApi.useGetVehicleByIdQuery(Number(vehicleId), {
    skip: !vehicleId
  });
  
  // Image carousel controls
  const nextImage = () => {
    if (!vehicle?.images) return;
    setCurrentImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    if (!vehicle?.images) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };
  
  // Auto-play carousel
  useEffect(() => {
    if (!isAutoplay || !vehicle?.images || vehicle.images.length <= 1) return;
    
    const interval = setInterval(() => {
      nextImage();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoplay, vehicle?.images]);
  
  // Handle booking - Updated to match VehicleListing behavior
  const handleBookNow = () => {
    if (!vehicle) return;

    console.log('Booking vehicle:', {
      vehicle_id: vehicle.vehicle_id,
      daily_rate: vehicle.effective_daily_rate,
      status: vehicle.status
    });

    // Check if user is authenticated - matching VehicleListing
    if (!isAuthenticated) {
      // Redirect to login page with return URL and vehicle data
      toast.error('Please login to book a vehicle');
      navigate('/login', { 
        state: { 
          returnUrl: '/Booking',
          vehicleData: {
            vehicle_id: vehicle.vehicle_id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            daily_rate: vehicle.effective_daily_rate,
            vehicle_type: vehicle.vehicle_type,
            branch_id: vehicle.branch_id,
            branch_name: vehicle.branch_name,
            model_id: vehicle.model_id || 1
          }
        }
      });
      return;
    }
    
    // Check vehicle availability
    if (vehicle.status !== 'Available') {
      toast.error('This vehicle is not available for booking');
      return;
    }
    
    // User is authenticated and vehicle is available, proceed to booking
    navigate('/Booking', { 
      state: { 
        vehicle: {
          vehicle_id: vehicle.vehicle_id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          daily_rate: vehicle.effective_daily_rate,
          vehicle_type: vehicle.vehicle_type,
          branch_id: vehicle.branch_id,
          branch_name: vehicle.branch_name,
          model_id: vehicle.model_id || 1
        }
      }
    });
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Get fuel icon - matching VehicleListing
  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric': return '⚡';
      case 'hybrid': return '🔋';
      case 'diesel': return '⛽';
      default: return '⛽';
    }
  };

  // Format features - matching VehicleListing
  const formatFeatures = (featuresString: string) => {
    if (!featuresString) return [];
    try {
      const features = JSON.parse(featuresString);
      return Array.isArray(features) ? features : [];
    } catch {
      return featuresString.split(',');
    }
  };

  // Get vehicle features
  const vehicleFeatures = vehicle?.standard_features 
    ? formatFeatures(vehicle.standard_features)
    : [];
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">Failed to load vehicle details</div>
            <button 
              onClick={() => navigate('/Magariiii')}
              className="btn btn-primary"
            >
              Back to Vehicles
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster position="top-right" />
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading vehicle details...</p>
          </div>
        </div>
      )}
      
      {/* Vehicle Details */}
      {!isLoading && vehicle && (
        <div className="flex-1">
          {/* Back Button */}
          <div className="bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <button
                onClick={() => navigate('/Magariiii')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Vehicles
              </button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Images */}
              <div className="lg:w-1/2">
                {/* Main Image Carousel */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <>
                      <img
                        src={vehicle.images[currentImageIndex]?.image_url}
                        alt={`${vehicle.make} ${vehicle.model} - ${vehicle.images[currentImageIndex]?.image_type}`}
                        className="w-full h-96 object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {vehicle.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {vehicle.images.length}
                      </div>
                      
                      {/* Autoplay Toggle */}
                      <button
                        onClick={() => setIsAutoplay(!isAutoplay)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        title={isAutoplay ? 'Pause autoplay' : 'Start autoplay'}
                      >
                        {isAutoplay ? '⏸️' : '▶️'}
                      </button>

                      {/* Status Badge - matching VehicleListing styling */}
                      <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-semibold ${
                        vehicle.status === 'Available' ? 'bg-green-500' : 
                        vehicle.status === 'Booked' ? 'bg-orange-500' : 
                        vehicle.status === 'Rented' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {vehicle.status}
                      </div>
                      <div className="absolute top-4 right-16 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {vehicle.vehicle_type}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                      <CarIcon className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Gallery */}
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {vehicle.images.map((image, index) => (
                      <button
                        key={image.image_id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex 
                          ? 'border-blue-500 scale-105' 
                          : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        <img
                          src={image.image_url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Vehicle Features */}
                {vehicleFeatures.length > 0 && (
                  <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {vehicleFeatures.slice(0, 6).map((feature, index) => (
                        <span key={index} className="badge badge-outline badge-lg">
                          {feature}
                        </span>
                      ))}
                      {vehicleFeatures.length > 6 && (
                        <span className="badge badge-ghost badge-lg">
                          +{vehicleFeatures.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Vehicle Status Card - Updated styling */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">Vehicle Status</h3>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-2 ${
                        vehicle.status === 'Available' 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : vehicle.status === 'Booked'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        {vehicle.status === 'Available' ? 'Available for Rent' : vehicle.status}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {vehicle.status === 'Available' 
                          ? 'This vehicle is currently available for immediate booking.'
                          : 'This vehicle is not currently available for booking.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Details */}
              <div className="lg:w-1/2">
                {/* Vehicle Title and Price */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {vehicle.vehicle_type}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                          {vehicle.year}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h1>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span className="text-lg">{vehicle.branch_name}, {vehicle.branch_city}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600">
                        {formatPrice(vehicle.effective_daily_rate)}
                      </div>
                      <div className="text-gray-500">per day</div>
                      {vehicle.actual_daily_rate !== vehicle.standard_daily_rate && (
                        <div className="text-sm text-green-600 mt-1">
                          Special rate applied!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">
                    A premium {vehicle.vehicle_type.toLowerCase()} perfect for {vehicle.seating_capacity}-person trips. 
                    Featuring {vehicle.transmission.toLowerCase()} transmission and {vehicle.fuel_type.toLowerCase()} engine.
                  </p>
                </div>
                
                {/* Key Specifications - Updated with VehicleListing icons */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Fuel className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Fuel Type</div>
                        <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-lg">{getFuelIcon(vehicle.fuel_type)}</span>
                          {vehicle.fuel_type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Seating Capacity</div>
                        <div className="text-lg font-semibold text-gray-800">{vehicle.seating_capacity} People</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Transmission</div>
                        <div className="text-lg font-semibold text-gray-800">{vehicle.transmission}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Model Year</div>
                        <div className="text-lg font-semibold text-gray-800">{vehicle.year}</div>
                      </div>
                    </div>
                    
                    {vehicle.engine_size && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Cog className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Engine Size</div>
                          <div className="text-lg font-semibold text-gray-800">{vehicle.engine_size}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Standard Rate</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {formatPrice(vehicle.standard_daily_rate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Registration Number</div>
                        <div className="font-semibold text-gray-800">{vehicle.registration_number}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Color</div>
                        <div className="font-semibold text-gray-800">{vehicle.color}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Current Mileage</div>
                        <div className="font-semibold text-gray-800">
                          {vehicle.current_mileage.toLocaleString()} km
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Insurance Expiry</div>
                        <div className="font-semibold text-gray-800">
                          {vehicle.insurance_expiry_date 
                            ? new Date(vehicle.insurance_expiry_date).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {vehicle.custom_features && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Custom Features</div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-gray-700">{vehicle.custom_features}</p>
                        </div>
                      </div>
                    )}
                    
                    {vehicle.notes && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Additional Notes</div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-700">{vehicle.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Branch Information */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Pickup Location</h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Navigation className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg mb-1">
                        {vehicle.branch_name}
                      </div>
                      <div className="text-gray-600 mb-2">{vehicle.branch_city}</div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Phone className="w-4 h-4" />
                          Call Branch
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors">
                          <Navigation className="w-4 h-4" />
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Booking CTA - Updated to match VehicleListing */}
                <div className="sticky bottom-6 bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatPrice(vehicle.effective_daily_rate)}
                        <span className="text-lg text-gray-500 font-normal"> / day</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                          vehicle.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          vehicle.status === 'Booked' ? 'bg-orange-100 text-orange-800' : 
                          vehicle.status === 'Rented' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status}
                        </span>
                        {vehicle.status === 'Available' 
                          ? 'Available for booking'
                          : 'Currently unavailable'}
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/Magariiii')}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Browse More
                      </button>
                      <button
                        onClick={handleBookNow}
                        disabled={vehicle.status !== 'Available'}
                        className={`px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
                          vehicle.status === 'Available'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <Car className="w-5 h-5" />
                        {vehicle.status === 'Available' ? 'Book Now' : vehicle.status}
                      </button>
                    </div>
                  </div>
                  
                  {vehicle.status === 'Available' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          Fully Insured
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-green-600" />
                          Secure Payment
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          24/7 Support
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VehicleDetail;