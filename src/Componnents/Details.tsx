// src/Components/Details.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Car, Users, Fuel, Cog, MapPin, Calendar, DollarSign } from 'lucide-react';

interface VehicleDetails {
    vehicle_id: number;
    model_id: number;
    make: string;
    model: string;
    year: number;
    registration_number: string;
    color: string;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    engine_size: string;
    fuel_efficiency_city: number;
    fuel_efficiency_highway: number;
    standard_features: string[];
    current_mileage: number; // This was the issue - it's current_mileage in your API
    status: string;
    branch_name: string;
    branch_city: string;
    effective_daily_rate: number;
    images: Array<{
        image_id: number;
        image_url: string;
        image_type: string;
        is_primary: boolean;
        display_order: number;
    }>;
    custom_features?: string[];
}

interface BookingData {
    pickup_date: string;
    return_date: string;
    pickup_time: string;
    return_time: string;
    rentalDays: number;
}

const VehicleDetails: React.FC = () => {
    const { vehicle_id } = useParams<{ vehicle_id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'gallery'>('overview');

    const bookingData = location.state?.bookingData as BookingData;

    useEffect(() => {
        const fetchVehicleDetails = async () => {
            try {
                setLoading(true);
                // If vehicle data was passed via state, use it
                if (location.state?.vehicle) {
                    setVehicle(location.state.vehicle);
                    if (location.state.vehicle.images && location.state.vehicle.images.length > 0) {
                        setSelectedImage(location.state.vehicle.images[0].image_url);
                    } else {
                        setSelectedImage(null);
                    }
                } else {
                    // Otherwise fetch from API - using the correct endpoint from your backend
                    const response = await fetch(`http://localhost:3000/api/vehicles/${vehicle_id}`);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch vehicle details: ${response.status} ${response.statusText}`);
                    }
                    
                    const vehicleData = await response.json();
                    console.log('API Response:', vehicleData); // Debug log
                    
                    // Transform the data to match our interface with proper defaults
                    const transformedVehicle: VehicleDetails = {
                        ...vehicleData,
                        // Handle current_mileage - ensure it's a number with proper fallback
                        current_mileage: vehicleData.current_mileage ?? 0, // Use nullish coalescing
                        // Handle custom_features which might be a stringified JSON array
                        custom_features: vehicleData.custom_features 
                            ? typeof vehicleData.custom_features === 'string'
                                ? JSON.parse(vehicleData.custom_features)
                                : vehicleData.custom_features
                            : [],
                        // Handle standard_features - you might need to adjust this based on your actual data
                        standard_features: vehicleData.standard_features || [],
                        // Add missing fields with default values
                        engine_size: vehicleData.engine_size || 'Not specified',
                        fuel_efficiency_city: vehicleData.fuel_efficiency_city || 0,
                        fuel_efficiency_highway: vehicleData.fuel_efficiency_highway || 0,
                        // Ensure all required fields have defaults
                        seating_capacity: vehicleData.seating_capacity || 5,
                        doors: vehicleData.doors || 4
                    };
                    
                    console.log('Transformed Vehicle:', transformedVehicle); // Debug log
                    
                    setVehicle(transformedVehicle);
                    
                    if (vehicleData.images && vehicleData.images.length > 0) {
                        setSelectedImage(vehicleData.images[0].image_url);
                    } else {
                        setSelectedImage(null);
                    }
                }
            } catch (err) {
                console.error('Error fetching vehicle details:', err);
                setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
            } finally {
                setLoading(false);
            }
        };

        if (vehicle_id) {
            fetchVehicleDetails();
        } else {
            setError('Vehicle ID is required');
            setLoading(false);
        }
    }, [vehicle_id, location.state]);

    const handleBackToBooking = () => {
        navigate(-1); // Go back to the booking page
    };

    const handleBookNow = () => {
        if (vehicle && bookingData) {
            // Navigate to booking confirmation page with vehicle and booking data
            navigate('/booking-confirmation', {
                state: {
                    vehicle,
                    bookingData
                }
            });
        } else if (vehicle) {
            // If no booking data, navigate to booking form
            navigate('/booking', {
                state: { vehicle }
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error || 'Vehicle not found'}</p>
                    <button
                        onClick={handleBackToBooking}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Back to Vehicle Selection
                    </button>
                </div>
            </div>
        );
    }

    // Group images by type
    const exteriorImages = vehicle.images?.filter(img => img.image_type === 'exterior') || [];
    const interiorImages = vehicle.images?.filter(img => img.image_type === 'interior') || [];
    const otherImages = vehicle.images?.filter(img => !['exterior', 'interior'].includes(img.image_type)) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={handleBackToBooking}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Vehicle Selection
                    </button>
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Registration: {vehicle.registration_number} • Color: {vehicle.color}
                            </p>
                        </div>
                        
                        {bookingData && (
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                    ${(vehicle.effective_daily_rate * bookingData.rentalDays).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Total for {bookingData.rentalDays} day{bookingData.rentalDays !== 1 ? 's' : ''}
                                </div>
                                <div className="text-sm text-gray-600">
                                    ${vehicle.effective_daily_rate}/day
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="w-full h-96 object-cover"
                                />
                            ) : (
                                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                    <Car className="w-16 h-16 text-gray-400" />
                                    <span className="text-gray-500 ml-2">No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {vehicle.images && vehicle.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {vehicle.images.map((image) => (
                                    image.image_url && (
                                        <button
                                            key={image.image_id}
                                            onClick={() => setSelectedImage(image.image_url)}
                                            className={`border-2 rounded-lg overflow-hidden ${
                                                selectedImage === image.image_url ? 'border-blue-500' : 'border-gray-200'
                                            }`}
                                        >
                                            <img
                                                src={image.image_url}
                                                alt={`${vehicle.make} ${vehicle.model} - ${image.image_type}`}
                                                className="w-full h-20 object-cover"
                                            />
                                        </button>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* Navigation Tabs */}
                        <div className="flex border-b mb-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 font-medium ${
                                    activeTab === 'overview'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('features')}
                                className={`px-4 py-2 font-medium ${
                                    activeTab === 'features'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Features
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`px-4 py-2 font-medium ${
                                    activeTab === 'gallery'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Gallery
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Car className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Vehicle Type</p>
                                            <p className="font-medium">{vehicle.vehicle_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Fuel className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Fuel Type</p>
                                            <p className="font-medium">{vehicle.fuel_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Cog className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Transmission</p>
                                            <p className="font-medium">{vehicle.transmission}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Seating Capacity</p>
                                            <p className="font-medium">{vehicle.seating_capacity} people</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Doors:</div>
                                        <div>{vehicle.doors}</div>
                                        <div>Current Mileage:</div>
                                        {/* FIXED: Added null check and default value */}
                                        <div>{(vehicle.current_mileage ?? 0).toLocaleString()} miles</div>
                                        <div>Status:</div>
                                        <div className={`font-semibold ${
                                            vehicle.status === 'Available' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {vehicle.status}
                                        </div>
                                        {vehicle.engine_size && vehicle.engine_size !== 'Not specified' && (
                                            <>
                                                <div>Engine Size:</div>
                                                <div>{vehicle.engine_size}</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {(vehicle.fuel_efficiency_city || vehicle.fuel_efficiency_highway) && (
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Fuel Efficiency</h3>
                                        <div className="text-sm">
                                            {vehicle.fuel_efficiency_city && (
                                                <p>City: {vehicle.fuel_efficiency_city} MPG</p>
                                            )}
                                            {vehicle.fuel_efficiency_highway && (
                                                <p>Highway: {vehicle.fuel_efficiency_highway} MPG</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{vehicle.branch_name} - {vehicle.branch_city}</span>
                                    </div>
                                </div>

                                {bookingData && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>Pickup:</div>
                                            <div>{bookingData.pickup_date} at {bookingData.pickup_time}</div>
                                            <div>Return:</div>
                                            <div>{bookingData.return_date} at {bookingData.return_time}</div>
                                            <div>Duration:</div>
                                            <div>{bookingData.rentalDays} day{bookingData.rentalDays !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Standard Features</h3>
                                {vehicle.standard_features && vehicle.standard_features.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {vehicle.standard_features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No standard features listed.</p>
                                )}

                                {vehicle.custom_features && vehicle.custom_features.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-gray-800 mt-6 mb-4">Additional Features</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {vehicle.custom_features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div>
                                {exteriorImages.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-3">Exterior</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {exteriorImages.map((image) => (
                                                image.image_url && (
                                                    <img
                                                        key={image.image_id}
                                                        src={image.image_url}
                                                        alt={`${vehicle.make} ${vehicle.model} exterior`}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(image.image_url)}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {interiorImages.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-3">Interior</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {interiorImages.map((image) => (
                                                image.image_url && (
                                                    <img
                                                        key={image.image_id}
                                                        src={image.image_url}
                                                        alt={`${vehicle.make} ${vehicle.model} interior`}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(image.image_url)}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {otherImages.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-3">Other Views</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {otherImages.map((image) => (
                                                image.image_url && (
                                                    <img
                                                        key={image.image_id}
                                                        src={image.image_url}
                                                        alt={`${vehicle.make} ${vehicle.model} - ${image.image_type}`}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(image.image_url)}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {vehicle.images?.length === 0 && (
                                    <div className="text-center py-8">
                                        <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No images available for this vehicle.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Book Now Button */}
                        <div className="mt-8 pt-6 border-t">
                            <button
                                onClick={handleBookNow}
                                disabled={vehicle.status !== 'Available'}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                                    vehicle.status === 'Available'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                            >
                                {vehicle.status === 'Available' 
                                    ? 'Book This Vehicle' 
                                    : 'Currently Unavailable'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetails;