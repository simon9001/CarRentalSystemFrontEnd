// src/components/admin/bookings/CustomerInfoCard.tsx
import React from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { User, Mail, Phone } from 'lucide-react';

interface CustomerInfoCardProps {
  booking: BookingDetailsResponse;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User size={16} className="text-gray-400" />
          <div>
            <p className="font-medium">{booking.customer_name || 'N/A'}</p>
            <p className="text-sm text-gray-500">Customer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-gray-400" />
          <div>
            <p className="font-medium">{booking.customer_email}</p>
            <p className="text-sm text-gray-500">Email</p>
          </div>
        </div>
        
        {booking.customer_phone && (
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-gray-400" />
            <div>
              <p className="font-medium">{booking.customer_phone}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Customer ID: <span className="font-mono">{booking.customer_id}</span>
          </p>
          <p className="text-sm text-gray-600">
            Username: <span className="font-medium">{booking.customer_username}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;