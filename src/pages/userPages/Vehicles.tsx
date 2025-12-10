// pages/Vehicles.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  Search, Filter, Grid, List, ChevronRight, 
  Car, Users, Fuel, Calendar, MapPin, 
  DollarSign, CheckCircle, XCircle, Clock,
  ArrowRight, X, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Navbar from '../../Componnents/Navbar';
import Footer from '../../Componnents/Footer';
import { VehicleApi } from '../../features/Api/VehicleApi';
import type { VehicleListing, VehicleFilters } from '../../types/vehicle';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

// Constants
const DEFAULT_YEAR_MIN = 2000;
const DEFAULT_YEAR_MAX = new Date().getFullYear() + 1;
const SEATING_CAPACITIES = [2, 4, 5, 6, 7, 8];
const TRANSMISSION_TYPES = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

// Helper components
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="text-center">
      <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading vehicles...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-4">Failed to load vehicles</div>
        <button 
          onClick={onRetry}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
    <Footer />
  </div>
);

const EmptyState: React.FC<{ onClearFilters: () => void }> = ({ onClearFilters }) => (
  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
    <div className="text-6xl mb-6">🚗</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">
      No vehicles found
    </h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      Try adjusting your search criteria or filters to find what you're looking for.
    </p>
    <button
      onClick={onClearFilters}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Clear All Filters
    </button>
  </div>
);

// Custom hooks
const useVehicleFilters = (vehicles: VehicleListing[] = []) => {
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const vehicleTypes = useMemo(() => 
    Array.from(new Set(vehicles.map(v => v.vehicle_type)))
      .filter(Boolean)
      .sort(),
    [vehicles]
  );

  const makes = useMemo(() => 
    Array.from(new Set(vehicles.map(v => v.make)))
      .filter(Boolean)
      .sort(),
    [vehicles]
  );

  const filteredVehicles = useMemo(() => 
    vehicles.filter(vehicle => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.registration_number.toLowerCase().includes(searchLower) ||
          vehicle.vehicle_type.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Vehicle type filter
      if (filters.vehicle_type && filters.vehicle_type !== 'all') {
        if (vehicle.vehicle_type !== filters.vehicle_type) return false;
      }
      
      // Price range filter
      if (filters.min_price && vehicle.daily_rate_at_booking < filters.min_price) return false;
      if (filters.max_price && vehicle.daily_rate_at_booking > filters.max_price) return false;
      
      // Other filters
      if (filters.transmission && vehicle.transmission !== filters.transmission) return false;
      if (filters.seating_capacity && vehicle.seating_capacity < filters.seating_capacity) return false;
      if (filters.fuel_type && vehicle.fuel_type !== filters.fuel_type) return false;
      if (filters.make && vehicle.make !== filters.make) return false;
      if (filters.year && vehicle.year !== filters.year) return false;
      
      return true;
    }),
    [vehicles, searchTerm, filters]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setSelectedType('all');
  }, []);

  const updateFilter = useCallback(<K extends keyof VehicleFilters>(
    key: K,
    value: VehicleFilters[K] | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateVehicleType = useCallback((type: string) => {
    setSelectedType(type);
    updateFilter('vehicle_type', type === 'all' ? undefined : type);
  }, [updateFilter]);

  return {
    filters,
    searchTerm,
    selectedType,
    vehicleTypes,
    makes,
    filteredVehicles,
    setSearchTerm,
    updateFilter,
    updateVehicleType,
    clearFilters
  };
};

// Utility functions
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800 border-green-200',
    'Booked': 'bg-blue-100 text-blue-800 border-blue-200',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Retired': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusIcon = (status: string) => {
  const statusIcons: Record<string, React.ReactNode> = {
    'Available': <CheckCircle className="w-4 h-4" />,
    'Booked': <Clock className="w-4 h-4" />,
    'Under Maintenance': <Clock className="w-4 h-4" />,
    'Retired': <XCircle className="w-4 h-4" />,
  };
  return statusIcons[status] || null;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

// Filter Sidebar Component
const FilterSidebar: React.FC<{
  filters: VehicleFilters;
  branches: any[];
  makes: string[];
  onFilterChange: <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K] | undefined) => void;
  onClearFilters: () => void;
  showFilters: boolean;
}> = ({ filters, branches, makes, onFilterChange, onClearFilters, showFilters }) => (
  <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Branch Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Branch Location</h3>
        <select
          value={filters.branch_id || ''}
          onChange={(e) => onFilterChange('branch_id', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Branches</option>
          {branches?.map(branch => (
            <option key={branch.branch_id} value={branch.branch_id}>
              {branch.branch_name} ({branch.city})
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Daily Rate Range</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={filters.min_price || ''}
              onChange={(e) => onFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="self-center text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={filters.max_price || ''}
              onChange={(e) => onFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Transmission</h3>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSION_TYPES.map(transmission => (
            <button
              key={transmission}
              type="button"
              onClick={() => onFilterChange('transmission', filters.transmission === transmission ? undefined : transmission)}
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                filters.transmission === transmission
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {transmission}
            </button>
          ))}
        </div>
      </div>

      {/* Seating Capacity */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Seating Capacity</h3>
        <select
          value={filters.seating_capacity || ''}
          onChange={(e) => onFilterChange('seating_capacity', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any</option>
          {SEATING_CAPACITIES.map(capacity => (
            <option key={capacity} value={capacity}>
              {capacity}+ Seats
            </option>
          ))}
        </select>
      </div>

      {/* Fuel Type */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Fuel Type</h3>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map(fuel => (
            <button
              key={fuel}
              type="button"
              onClick={() => onFilterChange('fuel_type', filters.fuel_type === fuel ? undefined : fuel)}
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                filters.fuel_type === fuel
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      {/* Make */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Make</h3>
        <select
          value={filters.make || ''}
          onChange={(e) => onFilterChange('make', e.target.value || undefined)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Makes</option>
          {makes.map(make => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Year</h3>
        <input
          type="number"
          placeholder="e.g., 2023"
          value={filters.year || ''}
          onChange={(e) => onFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
          min={DEFAULT_YEAR_MIN}
          max={DEFAULT_YEAR_MAX}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

// Vehicle Card Components
const VehicleCardGrid: React.FC<{
  vehicle: VehicleListing;
  onViewDetails: (id: number) => void;
}> = ({ vehicle, onViewDetails }) => (
  <div
    onClick={() => onViewDetails(vehicle.vehicle_id)}
    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={vehicle.primary_image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop'}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      
      {/* Status Badge */}
      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(vehicle.status)}`}>
        {getStatusIcon(vehicle.status)}
        {vehicle.status}
      </div>
      
      {/* Price Badge */}
      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">
        {formatPrice(vehicle.daily_rate_at_booking)}<span className="text-xs font-normal">/day</span>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-5">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {vehicle.branch_name}, {vehicle.city}
        </div>
        <p className="text-gray-700">{vehicle.vehicle_type}</p>
      </div>
      
      {/* Specifications */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center text-gray-600">
          <Fuel className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.fuel_type}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.seating_capacity} Seats</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Car className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.transmission}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{vehicle.year}</span>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {vehicle.registration_number}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(vehicle.vehicle_id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const VehicleCardList: React.FC<{
  vehicle: VehicleListing;
  onViewDetails: (id: number) => void;
}> = ({ vehicle, onViewDetails }) => (
  <div
    onClick={() => onViewDetails(vehicle.vehicle_id)}
    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
  >
    <div className="flex flex-col md:flex-row">
      {/* Image */}
      <div className="md:w-1/3 relative">
        <img
          src={vehicle.primary_image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-48 md:h-full object-cover"
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(vehicle.status)}`}>
          {getStatusIcon(vehicle.status)}
          {vehicle.status}
        </div>
      </div>
      
      {/* Content */}
      <div className="md:w-2/3 p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center text-gray-600 mb-1">
              <MapPin className="w-4 h-4 mr-2" />
              {vehicle.branch_name}, {vehicle.city}
            </div>
            <p className="text-gray-700">{vehicle.vehicle_type}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(vehicle.daily_rate_at_booking)}<span className="text-sm font-normal text-gray-500">/day</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {vehicle.registration_number}
            </div>
          </div>
        </div>
        
        {/* Specifications */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600 mb-1">
              <Fuel className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Fuel</span>
            </div>
            <span className="text-gray-800">{vehicle.fuel_type}</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Seats</span>
            </div>
            <span className="text-gray-800">{vehicle.seating_capacity}</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600 mb-1">
              <Car className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Transmission</span>
            </div>
            <span className="text-gray-800">{vehicle.transmission}</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Year</span>
            </div>
            <span className="text-gray-800">{vehicle.year}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(vehicle.vehicle_id);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Full Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get user state for conditional rendering
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // RTK Query hooks
  const { 
    data: vehicles = [], 
    isLoading, 
    error,
    refetch 
  } = VehicleApi.useGetAvailableVehiclesQuery();
  
  const { data: branches = [] } = VehicleApi.useGetAllBranchesQuery();
  
  // Custom filter hook
  const {
    filters,
    searchTerm,
    selectedType,
    vehicleTypes,
    makes,
    filteredVehicles,
    setSearchTerm,
    updateFilter,
    updateVehicleType,
    clearFilters
  } = useVehicleFilters(vehicles);
  
  // Handlers
  const handleVehicleClick = useCallback((vehicleId: number) => {
    navigate(`/vehicles/${vehicleId}`);
  }, [navigate]);
  
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  if (error) {
    return <ErrorState onRetry={refetch} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Ride
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Browse our extensive fleet of quality vehicles available for rent
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by make, model, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Quick Type Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <button
                onClick={() => updateVehicleType('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${selectedType === 'all' 
                  ? 'bg-white text-blue-800' 
                  : 'bg-white/20 hover:bg-white/30'}`}
              >
                All Vehicles
              </button>
              {vehicleTypes.map(type => (
                <button
                  key={type}
                  onClick={() => updateVehicleType(type)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${selectedType === type 
                    ? 'bg-white text-blue-800' 
                    : 'bg-white/20 hover:bg-white/30'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <FilterSidebar
              filters={filters}
              branches={branches}
              makes={makes}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              showFilters={showFilters}
            />
            
            {/* Vehicles List */}
            <div className="lg:w-3/4">
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Available Vehicles <span className="text-gray-500">({filteredVehicles.length})</span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredVehicles.length === 0 
                      ? 'No vehicles match your criteria'
                      : 'Select a vehicle to view details and book'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Mobile Filters Toggle */}
                  <button
                    onClick={toggleFilters}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  
                  {/* View Toggle */}
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Loading State */}
              {isLoading && <LoadingSpinner />}
              
              {/* Content */}
              {!isLoading && (
                <>
                  {/* Grid View */}
                  {viewMode === 'grid' && filteredVehicles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVehicles.map(vehicle => (
                        <VehicleCardGrid
                          key={vehicle.vehicle_id}
                          vehicle={vehicle}
                          onViewDetails={handleVehicleClick}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* List View */}
                  {viewMode === 'list' && filteredVehicles.length > 0 && (
                    <div className="space-y-4">
                      {filteredVehicles.map(vehicle => (
                        <VehicleCardList
                          key={vehicle.vehicle_id}
                          vehicle={vehicle}
                          onViewDetails={handleVehicleClick}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Empty State */}
                  {filteredVehicles.length === 0 && !isLoading && (
                    <EmptyState onClearFilters={clearFilters} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Vehicles;