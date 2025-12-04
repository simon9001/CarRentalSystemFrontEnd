// src/components/booking/BookingReceipt.tsx
import React from 'react';
import { Printer, Download, CheckCircle, Car, Calendar, MapPin } from 'lucide-react';

interface BookingReceiptProps {
  booking: any;
  payment: any;
  onPrint: () => void;
  onClose: () => void;
}

export const BookingReceipt: React.FC<BookingReceiptProps> = ({
  booking,
  payment,
  onPrint,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
    onPrint();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    alert('PDF download functionality coming soon');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white text-center">
          <CheckCircle size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Payment Confirmed!</h1>
          <p className="text-green-100 text-lg">Your booking has been successfully confirmed</p>
        </div>

        {/* Receipt Content */}
        <div className="p-8" id="receipt">
          {/* Company Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h2 className="text-2xl font-bold text-gray-800">Car Rental System</h2>
            <p className="text-gray-600">Your Trusted Car Rental Partner</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Booking Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Booking Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold">#{booking.booking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {booking.booking_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Vehicle Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span>{booking.make} {booking.model} ({booking.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration:</span>
                  <span>{booking.registration_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span>{booking.color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Rental Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">Pick-up</p>
                  <p className="text-gray-600">{new Date(booking.pickup_date).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg">
                <Calendar size={20} className="text-green-600" />
                <div>
                  <p className="font-semibold text-gray-800">Return</p>
                  <p className="text-gray-600">{new Date(booking.return_date).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span>KES {booking.rate_per_day?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Days:</span>
                <span>
                  {Math.ceil((new Date(booking.return_date).getTime() - new Date(booking.pickup_date).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KES {booking.calculated_total?.toLocaleString()}</span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>- KES {booking.discount_amount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3 text-green-600">
                <span>Total Paid:</span>
                <span>KES {payment.amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold text-green-600 mb-2">Thank You for Your Booking!</h3>
            <p className="text-gray-600 mb-4">
              Please present this receipt when picking up your vehicle.
            </p>
            <div className="text-sm text-gray-500">
              <p><strong>Contact Us:</strong> support@carrental.com | +254 700 000 000</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Printer size={20} />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};