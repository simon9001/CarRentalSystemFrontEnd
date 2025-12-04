// src/components/admin/bookings/VehicleInfoCard.tsx
import React from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { Car, Palette, Calendar, Hash } from 'lucide-react';

interface VehicleInfoCardProps {
  booking: BookingDetailsResponse;
}

const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Car size={20} />
        Vehicle Information
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Vehicle</label>
          <p className="text-gray-800 font-medium">
            {booking.make} {booking.model} ({booking.year})
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-gray-400" />
          <div>
            <label className="text-sm font-medium text-gray-600">Registration</label>
            <p className="text-gray-800 font-mono">{booking.registration_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-gray-400" />
          <div>
            <label className="text-sm font-medium text-gray-600">Color</label>
            <p className="text-gray-800">{booking.color}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600">Type</label>
          <p className="text-gray-800 capitalize">{booking.vehicle_type}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600">Vehicle ID</label>
          <p className="text-gray-800 font-mono">#{booking.vehicle_id}</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoCard;