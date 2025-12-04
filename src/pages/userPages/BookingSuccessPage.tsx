// src/Components/User/Bookings/BookingSuccessPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, Download, Mail, Printer, Car, Calendar, DollarSign, Shield, Home, FileText, AlertCircle } from 'lucide-react';
import { useSendPaymentReceiptMutation } from '../../features/Api/BookingApi';
import { useSelector } from 'react-redux';
import Footer from '../../Componnents/Footer';
import Navbar from '../../Componnents/Navbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BookingDetails {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  booking_status: string;
  calculated_total: number;
  final_total: number;
  created_at: string;
  customer_id: number;
}

interface PaymentDetails {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_code: string;
  payment_date: string;
  payment_status: string;
}

interface VehicleDetails {
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  registration_number?: string;
  color?: string;
  branch_name?: string;
  daily_rate?: number;
}

interface AuthState {
  auth: {
    token: string | null;
    user: {
      customer_id?: number;
      user_id?: number;
      email: string;
      full_name: string;
      phone_number?: string;
    } | null;
    refresh_token?: string;
  };
}

const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: AuthState) => state.auth);
  
  const [sendReceipt, { isLoading: isSendingEmail }] = useSendPaymentReceiptMutation();
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  
  // Extract data from location state
  const state = location.state as {
    booking: BookingDetails;
    payment: PaymentDetails;
    transactionCode: string;
    vehicle?: VehicleDetails;
  };

  // Debug logging
  useEffect(() => {
    console.log('🔍 BookingSuccessPage location state:', location.state);
    console.log('🚗 Vehicle data:', state?.vehicle);
  }, [location.state, state]);

  // Check if state exists
  if (!location.state || !state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h2>
          <p className="text-gray-600 mb-4">No booking information found. Please start your booking again.</p>
          <button 
            onClick={() => navigate('/vehicles')}
            className="btn btn-primary"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const { booking, payment, transactionCode, vehicle } = state;

  // Calculate rental days safely
  const rentalDays = (() => {
    try {
      if (!booking.pickup_date || !booking.return_date) return 1;
      const pickupDate = new Date(booking.pickup_date);
      const returnDate = new Date(booking.return_date);
      const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    } catch (error) {
      console.error('Error calculating rental days:', error);
      return 1;
    }
  })();

  // Format dates with safety
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString || 'Date not available';
    }
  };

  // Get vehicle display info with fallbacks
  const vehicleInfo = (() => {
    if (!vehicle) {
      return {
        year: 'N/A',
        make: 'Vehicle',
        model: 'Details',
        vehicleType: 'Car',
        fullName: 'Vehicle Information',
        hasVehicleData: false
      };
    }
    
    return {
      year: vehicle.year || 'N/A',
      make: vehicle.make || 'Vehicle',
      model: vehicle.model || 'Details',
      vehicleType: vehicle.vehicle_type || 'Car',
      fullName: `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
      hasVehicleData: true,
      registrationNumber: vehicle.registration_number,
      color: vehicle.color,
      dailyRate: vehicle.daily_rate
    };
  })();

  // Send receipt email automatically on page load
  useEffect(() => {
    const sendEmail = async () => {
      if (user && !emailSent && transactionCode && vehicleInfo.hasVehicleData) {
        try {
          const emailData = {
            customer_email: user.email,
            customer_name: user.full_name,
            booking_id: booking.booking_id,
            transaction_code: transactionCode,
            amount: payment.amount,
            vehicle: vehicleInfo.fullName,
            pickup_date: booking.pickup_date,
            return_date: booking.return_date,
            rental_days: rentalDays,
            payment_method: payment.payment_method
          };

          await sendReceipt(emailData).unwrap();
          setEmailSent(true);
          setShowEmailNotification(true);
          
          setTimeout(() => {
            setShowEmailNotification(false);
          }, 5000);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
      }
    };

    sendEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const downloadReceipt = () => {
    const receiptElement = document.getElementById('receipt');
    
    if (receiptElement) {
      html2canvas(receiptElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Receipt_${booking.booking_id}_${transactionCode}.pdf`);
      });
    }
  };

  const printReceipt = () => {
    const receiptElement = document.getElementById('receipt');
    
    if (receiptElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - Booking #${booking.booking_id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                @media print { button { display: none; } }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${receiptElement.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 100);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleResendEmail = async () => {
    if (!user) return;
    
    try {
      const emailData = {
        customer_email: user.email,
        customer_name: user.full_name,
        booking_id: booking.booking_id,
        transaction_code: transactionCode,
        amount: payment.amount,
        vehicle: vehicleInfo.fullName,
        pickup_date: booking.pickup_date,
        return_date: booking.return_date,
        rental_days: rentalDays,
        payment_method: payment.payment_method
      };

      await sendReceipt(emailData).unwrap();
      setEmailSent(true);
      setShowEmailNotification(true);
      
      setTimeout(() => {
        setShowEmailNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to resend email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <Navbar />
      
      {/* Email Notification */}
      {showEmailNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Receipt Sent!</p>
                <p className="text-green-700 text-sm">Payment receipt has been sent to {user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">Your payment has been processed successfully</p>
          <div className="mt-4 bg-green-50 text-green-700 inline-flex items-center gap-2 px-4 py-2 rounded-full">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Booking ID: #{booking.booking_id}</span>
          </div>
        </div>

        {!vehicleInfo.hasVehicleData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Limited Vehicle Information</p>
                <p className="text-yellow-700 text-sm">Complete vehicle details can be found in your booking confirmation email.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Vehicle Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Vehicle Booked</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vehicleInfo.fullName}</p>
            <p className="text-gray-600">{vehicleInfo.vehicleType}</p>
            {vehicleInfo.dailyRate && (
              <p className="text-sm text-gray-500 mt-2">KES {vehicleInfo.dailyRate.toLocaleString()}/day</p>
            )}
          </div>

          {/* Duration */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Duration</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</p>
            <p className="text-gray-600">{formatDate(booking.pickup_date)} to {formatDate(booking.return_date)}</p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Total Paid</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">KES {payment.amount?.toLocaleString() || '0'}</p>
            <p className="text-gray-600">Payment Method: {payment.payment_method || 'N/A'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={downloadReceipt}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Download size={20} />
            Download Receipt
          </button>
          
          <button
            onClick={printReceipt}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-lg font-semibold border border-gray-300 transition-colors"
          >
            <Printer size={20} />
            Print Receipt
          </button>
          
          <button
            onClick={handleResendEmail}
            disabled={isSendingEmail || !user}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              emailSent 
                ? 'bg-green-100 text-green-700 cursor-default'
                : !user
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isSendingEmail ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : emailSent ? (
              <>
                <CheckCircle size={20} />
                <span>Receipt Sent</span>
              </>
            ) : (
              <>
                <Mail size={20} />
                <span>Email Receipt</span>
              </>
            )}
          </button>
        </div>

        {/* Receipt Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Payment Receipt</h2>
                <p className="text-blue-100">Transaction completed successfully</p>
              </div>
              <div className="bg-white text-blue-600 px-4 py-2 rounded-lg">
                <span className="font-bold text-lg">RECEIPT</span>
              </div>
            </div>
          </div>

          <div id="receipt" className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Car Rental Service</h1>
              <p className="text-gray-600">123 Rental Street, Nairobi, Kenya</p>
            </div>

            <div className="mb-6">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                ✅ PAID
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Issued: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{user?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{user?.email || 'N/A'}</span>
                  </div>
                  {user?.phone_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{user.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield size={18} />
                  Transaction Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-semibold">{transactionCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{payment.payment_method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-semibold">
                      {payment.payment_date 
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : new Date().toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold">#{booking.booking_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold">{vehicleInfo.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle Type:</span>
                    <span className="font-semibold">{vehicleInfo.vehicleType}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Date:</span>
                    <span className="font-semibold">{formatDate(booking.pickup_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Date:</span>
                    <span className="font-semibold">{formatDate(booking.return_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Duration:</span>
                    <span className="font-semibold">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Payment Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>KES {(payment.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Tax (VAT 16%)</span>
                  <span>KES {((payment.amount || 0) * 0.16).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">KES {(payment.amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Shield size={18} />
                Important Information
              </h4>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Bring your ID, driver's license, and this receipt for vehicle pickup</li>
                <li>Pickup time: 9:00 AM</li>
                <li>Return vehicle with a full tank of fuel</li>
                <li>Contact: support@carrental.com</li>
              </ul>
            </div>

            <div className="text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-2">Thank you for choosing Car Rental Service!</p>
              <p className="text-sm text-gray-500">
                This is an official receipt. For any inquiries, contact support.
              </p>
            </div>
          </div>
        </div>

        {/* Final Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            <Home size={20} />
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-lg font-semibold border border-gray-300 transition-colors"
          >
            <Car size={20} />
            Book Another Vehicle
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccessPage;