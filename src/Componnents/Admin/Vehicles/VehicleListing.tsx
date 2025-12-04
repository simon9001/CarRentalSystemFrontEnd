// src/components/vehicle/VehicleListing.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Car, MapPin, Users, Building, Calendar, Fuel, Settings } from 'lucide-react';
import { useGetAvailableVehiclesQuery } from '../../../features/Api/VehicleApi';
import { useGetActiveBranchesQuery } from '../../../features/Api/BranchApi';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

interface Vehicle {
  vehicle_id: number;
  registration_number: string;
  color: string;
  current_mileage: number;
  daily_rate: number;
  status: string;
  branch_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  standard_features: string;
  engine_size: string;
  branch_name: string;
  city: string;
  branch_address: string;
  images?: any;
  primary_image_url?: string;
  model_id?: number;
  
  // Fields from API response
  daily_rate_at_booking?: number;
}

interface Branch {
  branch_id: number;
  branch_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager_id: number | null;
  opening_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VehicleListingProps {
  showHero?: boolean;
  showFeatures?: boolean;
  showBranches?: boolean;
  title?: string;
  subtitle?: string;
}

// Define the auth state type based on your Redux store
interface AuthState {
  auth: {
    token: string | null;
    user: any | null;
    refresh_token?: string;
  };
}

const VehicleListing: React.FC<VehicleListingProps> = ({
  showHero = true,
  showFeatures = true,
  showBranches = true,
  title = "Find Your Perfect Rental Car",
  subtitle = "Discover the perfect vehicle for your journey from our wide selection of well-maintained cars at competitive prices."
}) => {
  const navigate = useNavigate();
  
  // Get authentication state from Redux store
  const { token, user } = useSelector((state: AuthState) => state.auth);
  const isAuthenticated = !!token;
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  const { data: vehiclesResponse, isLoading, error } = useGetAvailableVehiclesQuery();
  const { data: branchesResponse } = useGetActiveBranchesQuery();

  // Use useMemo to prevent unnecessary recalculations and infinite loops
  const vehicles = useMemo(() => {
    const rawData = vehiclesResponse?.data || vehiclesResponse || [];
    console.log('Raw API response:', rawData); // Debug log
    
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map((vehicle: any) => {
      // Use daily_rate_at_booking as the daily rate
      const dailyRate = vehicle.daily_rate_at_booking || 0;
      
      console.log('Vehicle mapped:', {
        id: vehicle.vehicle_id,
        make: vehicle.make,
        model: vehicle.model,
        daily_rate_at_booking: vehicle.daily_rate_at_booking,
        mapped_daily_rate: dailyRate
      });
      
      return {
        ...vehicle,
        daily_rate: dailyRate,
        city: vehicle.city || '',
        images: vehicle.images || null,
        // Add placeholder for missing fields
        standard_features: vehicle.standard_features || 'Air Conditioning,Bluetooth,USB Port',
        engine_size: vehicle.engine_size || '2.0L'
      };
    });
  }, [vehiclesResponse]);

  useEffect(() => {
    if (branchesResponse) {
      const branchesData = branchesResponse?.data || branchesResponse || [];
      setBranches(branchesData);
    }
  }, [branchesResponse]);
  
  // Fix the infinite loop by using useMemo for vehicleTypes
  const availableVehicleTypes = useMemo(() => {
    if (vehicles && vehicles.length > 0) {
      const types = [...new Set(vehicles.map(vehicle => vehicle.vehicle_type))];
      return types;
    }
    return [];
  }, [vehicles]);

  // Set vehicle types only once when availableVehicleTypes changes
  useEffect(() => {
    setVehicleTypes(availableVehicleTypes);
  }, [availableVehicleTypes]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const branchMatch = !selectedBranch || vehicle.branch_name === selectedBranch;
      const typeMatch = !selectedType || vehicle.vehicle_type === selectedType;
      return branchMatch && typeMatch;
    });
  }, [vehicles, selectedBranch, selectedType]);

  const getVehicleImageUrl = (vehicle: Vehicle) => {
    if (vehicle.primary_image_url) {
      return vehicle.primary_image_url;
    }
    
    if (vehicle.images && Array.isArray(vehicle.images)) {
      try {
        const primaryImage = vehicle.images.find((img: any) => img.is_primary);
        if (primaryImage) return primaryImage.image_url;
        if (vehicle.images.length > 0) return vehicle.images[0].image_url;
      } catch (error) {
        console.error('Error parsing vehicle images:', error);
      }
    }
    
    if (typeof vehicle.images === 'string') {
      try {
        const imagesArray = JSON.parse(vehicle.images);
        if (Array.isArray(imagesArray) && imagesArray.length > 0) {
          const primaryImage = imagesArray.find((img: any) => img.is_primary);
          if (primaryImage) return primaryImage.image_url;
          return imagesArray[0].image_url;
        }
      } catch (error) {
        console.error('Error parsing vehicle images string:', error);
      }
    }
    
    return null;
  };

  const formatFeatures = (featuresString: string) => {
    if (!featuresString) return [];
    try {
      const features = JSON.parse(featuresString);
      return Array.isArray(features) ? features.slice(0, 3) : [];
    } catch {
      return featuresString.split(',').slice(0, 3);
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric': return '⚡';
      case 'hybrid': return '🔋';
      case 'diesel': return '⛽';
      default: return '⛽';
    }
  };

  const handleBookNow = (vehicle: Vehicle) => {
    console.log('Booking vehicle:', {
      vehicle_id: vehicle.vehicle_id,
      daily_rate: vehicle.daily_rate,
      daily_rate_at_booking: vehicle.daily_rate_at_booking
    });

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { 
        state: { 
          returnUrl: '/Booking',
          vehicleData: {
            vehicle_id: vehicle.vehicle_id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            daily_rate: vehicle.daily_rate,
            vehicle_type: vehicle.vehicle_type,
            branch_id: vehicle.branch_id,
            branch_name: vehicle.branch_name,
            model_id: vehicle.model_id || 1
          }
        }
      });
      return;
    }
    
    // User is authenticated, proceed to booking
    navigate('/Booking', { 
      state: { 
        vehicle: {
          vehicle_id: vehicle.vehicle_id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          daily_rate: vehicle.daily_rate,
          vehicle_type: vehicle.vehicle_type,
          branch_id: vehicle.branch_id,
          branch_name: vehicle.branch_name,
          model_id: vehicle.model_id || 1
        }
      }
    });
  };

  const getEngineSize = (vehicle: Vehicle) => {
    if (vehicle.engine_size) return vehicle.engine_size;
    return '2.0L';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section - Conditionally Rendered */}
        {showHero && (
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Select Branch</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.branch_id} value={branch.branch_name}>
                    {branch.branch_name} - {branch.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Vehicle Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedBranch('');
                  setSelectedType('');
                }}
                className="btn btn-ghost w-full"
                disabled={!selectedBranch && !selectedType}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {(selectedBranch || selectedType) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedBranch && (
                <span className="badge badge-primary badge-lg">
                  Branch: {selectedBranch}
                  <button 
                    onClick={() => setSelectedBranch('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="badge badge-secondary badge-lg">
                  Type: {selectedType}
                  <button 
                    onClick={() => setSelectedType('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Available Vehicles Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Vehicles
              {vehicles && (
                <span className="text-blue-600 ml-2">
                  ({filteredVehicles.length} of {vehicles.length})
                </span>
              )}
            </h2>
            
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {branches.length} Branches
              </span>
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                {vehicleTypes.length} Types
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="loading loading-spinner loading-lg text-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading available vehicles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="alert alert-error max-w-md mx-auto">
                <p className="text-red-600 text-lg">Error loading vehicles. Please try again.</p>
              </div>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map(vehicle => {
                const imageUrl = getVehicleImageUrl(vehicle);
                const features = formatFeatures(vehicle.standard_features || '');
                const engineSize = getEngineSize(vehicle);
                
                return (
                  <div key={vehicle.vehicle_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <Car className="w-16 h-16 text-blue-600" />
                        </div>
                      )}
                      <div className={`absolute top-4 right-4 text-white px-2 py-1 rounded-full text-xs font-semibold ${
                        vehicle.status === 'Available' ? 'bg-green-500' : 
                        vehicle.status === 'Booked' ? 'bg-orange-500' : 
                        vehicle.status === 'Rented' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {vehicle.status}
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {vehicle.vehicle_type}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <span className="text-2xl font-bold text-blue-600">
                          ${vehicle.daily_rate}/day
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {vehicle.year} • {vehicle.transmission}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {vehicle.seating_capacity} Seats • {engineSize}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Fuel className="w-4 h-4 mr-2" />
                          <span className="mr-1">{getFuelIcon(vehicle.fuel_type)}</span>
                          {vehicle.fuel_type}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{vehicle.branch_name} - {vehicle.city}</span>
                        </div>
                      </div>

                      {features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {features.map((feature, index) => (
                              <span key={index} className="badge badge-outline badge-sm">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {vehicle.registration_number}
                        </span>
                        <button 
                          onClick={() => handleBookNow(vehicle)}
                          disabled={vehicle.status !== 'Available'}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
                            vehicle.status === 'Available' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <Car className="w-4 h-4" />
                          {vehicle.status === 'Available' ? 'Book Now' : vehicle.status}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {vehicles.length === 0 ? 'No Vehicles Available' : 'No Matching Vehicles Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {vehicles.length === 0 
                  ? 'No vehicles are currently available. Please check back later.'
                  : 'No vehicles match your current filters. Try adjusting your selection.'
                }
              </p>
              {(selectedBranch || selectedType) && (
                <button
                  onClick={() => {
                    setSelectedBranch('');
                    setSelectedType('');
                  }}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Features Section - Conditionally Rendered */}
        {showFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Choose from various vehicle types to suit your needs and budget</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Locations</h3>
              <p className="text-gray-600">Pick up and drop off at convenient branch locations across the city</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Well Maintained</h3>
              <p className="text-gray-600">All our vehicles are regularly serviced and thoroughly inspected</p>
            </div>
          </div>
        )}

        {/* Branch Information - Conditionally Rendered */}
        {showBranches && branches.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Branch Locations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.slice(0, 3).map(branch => (
                <div key={branch.branch_id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{branch.branch_name}</h3>
                      <p className="text-gray-600">{branch.city}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{branch.address}</p>
                    {branch.phone && <p>📞 {branch.phone}</p>}
                    {branch.opening_hours && <p>🕒 {branch.opening_hours}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleListing;