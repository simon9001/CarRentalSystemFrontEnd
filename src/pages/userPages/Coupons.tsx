import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { 
  Tag, 
  Percent, 
  DollarSign, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info,
  Sparkles,
  Trash2,
  Copy,
  ArrowRight
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { CouponApi } from '../../features/Api/CouponApi'
import { CouponUsageApi } from '../../features/Api/CouponUsageApi'

interface Coupon {
  coupon_id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  value: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  minimum_booking_amount: number;
  max_discount_amount: number | null;
  customer_scope: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface BookingSummary {
  total_amount: number;
  subtotal: number;
  tax: number;
  discount_amount: number;
  final_total: number;
}

interface CouponUsage {
  usage_id: number;
  customer_id: number;
  coupon_id: number;
  booking_id: number;
  used_at: string;
  discount_amount: number;
  coupon_code?: string;
  coupon_description?: string;
  discount_type?: string;
  coupon_value?: number;
  booking_final_total?: number;
}

const Coupons: React.FC = () => {
  // Get user from redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Fetch active coupons
  const { data: activeCoupons = [], isLoading, error, refetch } = CouponApi.useGetActiveCouponsQuery(
    isAuthenticated ? undefined : skipToken
  );
  
  // Fetch user's coupon usage history
  const { data: userCouponUsage = [] } = CouponUsageApi.useGetCouponUsageByCustomerQuery(
    isAuthenticated ? user!.user_id : skipToken,
    {
      skip: !isAuthenticated
    }
  );
  
  // State for booking simulation
  const [bookingTotal, setBookingTotal] = useState<number>(500); // Default booking total
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    total_amount: 500,
    subtotal: 450,
    tax: 50,
    discount_amount: 0,
    final_total: 500
  });
  
  // State for modal
  const [selectedCouponDetails, setSelectedCouponDetails] = useState<Coupon | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Convert activeCoupons to proper type
  const coupons = (activeCoupons as unknown as Coupon[]) || [];
  
  // Convert userCouponUsage to proper type
  const userCouponHistory = (userCouponUsage as unknown as CouponUsage[]) || [];

  // Check if user is new customer (for coupon eligibility)
  const isNewCustomer = React.useMemo(() => {
    // Check if user has any previous bookings or coupon usage
    return userCouponHistory.length === 0;
  }, [userCouponHistory]);

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getDiscountTypeIcon = (type: string) => {
    return type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />;
  };

  const getCustomerScopeBadge = (scope: string) => {
    const scopeConfig = {
      all: { color: 'bg-blue-100 text-blue-800', label: 'All Customers' },
      new: { color: 'bg-green-100 text-green-800', label: 'New Customers' },
      existing: { color: 'bg-purple-100 text-purple-800', label: 'Existing Customers' },
    };

    const config = scopeConfig[scope as keyof typeof scopeConfig] || scopeConfig.all;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Inactive' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  // Check if coupon is eligible for current user
  const isCouponEligible = (coupon: Coupon): { eligible: boolean; reason?: string } => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    
    // Check date validity
    if (now < startDate) {
      return { eligible: false, reason: `Starts on ${formatDate(coupon.start_date)}` };
    }
    
    if (now > endDate) {
      return { eligible: false, reason: 'Expired' };
    }
    
    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return { eligible: false, reason: 'Usage limit reached' };
    }
    
    // Check customer scope
    if (coupon.customer_scope === 'new' && !isNewCustomer) {
      return { eligible: false, reason: 'For new customers only' };
    }
    
    if (coupon.customer_scope === 'existing' && isNewCustomer) {
      return { eligible: false, reason: 'For existing customers only' };
    }
    
    // Check minimum booking amount
    if (bookingTotal < coupon.minimum_booking_amount) {
      return { 
        eligible: false, 
        reason: `Minimum booking: ${formatCurrency(coupon.minimum_booking_amount)}` 
      };
    }
    
    return { eligible: true };
  };

  // Calculate discount amount for a coupon
  const calculateDiscount = (coupon: Coupon): number => {
    if (!coupon) return 0;
    
    if (coupon.discount_type === 'percentage') {
      const discount = bookingTotal * (coupon.value / 100);
      return coupon.max_discount_amount ? Math.min(discount, coupon.max_discount_amount) : discount;
    } else {
      // Flat discount
      return Math.min(coupon.value, bookingTotal);
    }
  };

  // Apply coupon to booking
  const handleApplyCoupon = (coupon: Coupon) => {
    const { eligible, reason } = isCouponEligible(coupon);
    
    if (!eligible) {
      Swal.fire({
        title: 'Coupon Not Eligible',
        text: `This coupon cannot be applied: ${reason}`,
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const discountAmount = calculateDiscount(coupon);
    const newFinalTotal = bookingTotal - discountAmount;
    
    // Animate the discount application
    const discountElement = document.getElementById('discount-animation');
    if (discountElement) {
      discountElement.classList.add('animate-pulse', 'text-green-600');
      setTimeout(() => {
        discountElement.classList.remove('animate-pulse', 'text-green-600');
      }, 1000);
    }

    setAppliedCoupon(coupon);
    setBookingSummary(prev => ({
      ...prev,
      discount_amount: discountAmount,
      final_total: newFinalTotal
    }));

    // Show success message
    Swal.fire({
      title: 'Coupon Applied!',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Code:</strong> ${coupon.code}</p>
          <p class="mb-2"><strong>Discount:</strong> ${formatCurrency(discountAmount)}</p>
          <p><strong>New Total:</strong> ${formatCurrency(newFinalTotal)}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#2563eb',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setBookingSummary(prev => ({
      ...prev,
      discount_amount: 0,
      final_total: bookingTotal
    }));

    Swal.fire({
      title: 'Coupon Removed',
      text: 'Coupon has been removed from your booking.',
      icon: 'info',
      confirmButtonColor: '#6b7280',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      title: 'Copied!',
      text: `Coupon code "${code}" copied to clipboard.`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Show coupon details modal
  const handleShowDetails = (coupon: Coupon) => {
    setSelectedCouponDetails(coupon);
    setShowDetailsModal(true);
  };

  // Update booking total (simulation)
  const handleBookingTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(e.target.value) || 0;
    setBookingTotal(newTotal);
    setBookingSummary(prev => ({
      ...prev,
      total_amount: newTotal,
      subtotal: newTotal * 0.9, // 10% tax
      tax: newTotal * 0.1,
      discount_amount: appliedCoupon ? calculateDiscount(appliedCoupon) : 0,
      final_total: appliedCoupon ? newTotal - calculateDiscount(appliedCoupon) : newTotal
    }));
  };

  // Get error message from API error
  const getErrorMessage = () => {
    if (!error) return null;
    
    // Check if it's an RTK Query error
    if ('data' in error) {
      const errorData = error.data as any;
      return errorData.error || errorData.message || 'An error occurred while loading coupons';
    }
    
    return 'An error occurred while loading coupons';
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Tag className="text-purple-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Available Coupons</h1>
          <p className="text-sm text-gray-600">Apply discounts to your car rental bookings</p>
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          Booking Summary
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Total Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Total (Simulation)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                className="input input-bordered w-full pl-8"
                value={bookingTotal}
                onChange={handleBookingTotalChange}
                min="0"
                step="10"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Adjust this value to see how coupons affect different booking amounts
            </p>
          </div>

          {/* Applied Coupon Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applied Coupon
            </label>
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-green-800">{appliedCoupon.code}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Applied
                      </span>
                    </div>
                    <p className="text-sm text-green-700">{appliedCoupon.description || 'No description'}</p>
                    <p className="text-sm font-medium text-green-800 mt-1">
                      Discount: {formatCurrency(calculateDiscount(appliedCoupon))}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="btn btn-outline btn-error btn-sm"
                    aria-label="Remove coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-500">No coupon applied</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="space-y-2 max-w-md">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(bookingSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">{formatCurrency(bookingSummary.tax)}</span>
            </div>
            <div className="flex justify-between" id="discount-animation">
              <span className="text-gray-600">Discount</span>
              <span className={`font-medium ${bookingSummary.discount_amount > 0 ? 'text-green-600' : ''}`}>
                -{formatCurrency(bookingSummary.discount_amount)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-800">Final Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(bookingSummary.final_total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg text-purple-600"></span>
          <span className="ml-3 text-gray-600">Loading available coupons...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="mx-auto text-red-500 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Coupons</h3>
          <p className="text-red-600">{getErrorMessage()}</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Tag className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Coupons Available</h3>
          <p className="text-gray-500 mb-4">There are no active coupons at the moment.</p>
          <button
            onClick={() => refetch()}
            className="btn bg-purple-600 hover:bg-purple-700 text-white"
          >
            Check Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Available Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon: Coupon) => {
              const { eligible, reason } = isCouponEligible(coupon);
              const discountAmount = calculateDiscount(coupon);
              const isApplied = appliedCoupon?.coupon_id === coupon.coupon_id;
              
              return (
                <div 
                  key={coupon.coupon_id} 
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
                    isApplied 
                      ? 'border-green-500 ring-2 ring-green-200' 
                      : eligible 
                        ? 'border-gray-200' 
                        : 'border-gray-100 opacity-75'
                  }`}
                >
                  {/* Coupon Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="text-white" size={20} />
                          <span className="text-xl font-bold text-white tracking-wider">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-purple-100 text-sm">{coupon.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 text-white"
                          aria-label="Copy coupon code"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleShowDetails(coupon)}
                          className="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 text-white"
                          aria-label="View coupon details"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Body */}
                  <div className="p-4">
                    {/* Discount Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getDiscountTypeIcon(coupon.discount_type)}
                          <span className="font-semibold text-gray-800">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.value}% OFF` 
                              : `${formatCurrency(coupon.value)} OFF`
                            }
                          </span>
                        </div>
                        {getCustomerScopeBadge(coupon.customer_scope)}
                      </div>
                      
                      {coupon.max_discount_amount && coupon.discount_type === 'percentage' && (
                        <p className="text-sm text-gray-600">
                          Max discount: {formatCurrency(coupon.max_discount_amount)}
                        </p>
                      )}
                    </div>

                    {/* Validity & Usage */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Valid: {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {coupon.used_count} used
                          {coupon.usage_limit !== null && ` / ${coupon.usage_limit} limit`}
                        </span>
                      </div>
                      {coupon.minimum_booking_amount > 0 && (
                        <div className="text-sm text-gray-600">
                          Min. booking: {formatCurrency(coupon.minimum_booking_amount)}
                        </div>
                      )}
                    </div>

                    {/* Eligibility Status */}
                    {!eligible && (
                      <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded">
                        <div className="flex items-center gap-2 text-red-700">
                          <XCircle size={14} />
                          <span className="text-sm font-medium">{reason}</span>
                        </div>
                      </div>
                    )}

                    {/* Estimated Savings */}
                    {eligible && (
                      <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Estimated Savings
                            </span>
                          </div>
                          <span className="font-bold text-blue-800">
                            {formatCurrency(discountAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApplyCoupon(coupon)}
                      disabled={!eligible || isApplied}
                      className={`w-full btn ${
                        isApplied
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : eligible
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'btn-disabled bg-gray-100 text-gray-400'
                      }`}
                      aria-label={isApplied ? 'Coupon applied' : eligible ? 'Apply coupon' : 'Coupon not eligible'}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Applied
                        </>
                      ) : eligible ? (
                        <>
                          Apply Coupon
                          <ArrowRight size={16} className="ml-2" />
                        </>
                      ) : (
                        'Not Eligible'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User's Coupon History */}
          {userCouponHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Your Coupon History
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left font-semibold text-gray-700">Date Used</th>
                      <th className="text-left font-semibold text-gray-700">Coupon Code</th>
                      <th className="text-left font-semibold text-gray-700">Booking ID</th>
                      <th className="text-left font-semibold text-gray-700">Discount Applied</th>
                      <th className="text-left font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCouponHistory.slice(0, 5).map((usage: CouponUsage) => (
                      <tr key={usage.usage_id} className="hover:bg-gray-50">
                        <td className="text-sm text-gray-600">
                          {formatDate(usage.used_at)}
                        </td>
                        <td className="font-medium text-gray-800">
                          {usage.coupon_code || `#${usage.coupon_id}`}
                        </td>
                        <td className="text-sm text-gray-600">
                          #{usage.booking_id}
                        </td>
                        <td className="font-bold text-green-600">
                          {formatCurrency(usage.discount_amount)}
                        </td>
                        <td>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={10} className="mr-1" />
                            Used
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {userCouponHistory.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => window.location.href = '/coupon-history'}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1"
                  >
                    View all {userCouponHistory.length} coupon uses
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coupon Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Info size={16} />
              Coupon Tips & Information
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Percentage Discounts:</span> Applied to the booking subtotal before tax
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Flat Discounts:</span> Deducted directly from the total amount
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Eligibility:</span> Some coupons are only for new or existing customers
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">Minimum Booking:</span> Some coupons require a minimum booking amount
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <div>
                  <span className="font-medium">One Coupon Per Booking:</span> Only one coupon can be applied per booking
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Coupon Details Modal */}
      {showDetailsModal && selectedCouponDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Coupon Details</h3>
                  <div className="flex items-center gap-2">
                    <Tag className="text-white" size={20} />
                    <span className="text-2xl font-bold text-white tracking-wider">
                      {selectedCouponDetails.code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 text-white"
                  aria-label="Close modal"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-gray-800">{selectedCouponDetails.description || 'No description available'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Discount Type</h4>
                    <div className="flex items-center gap-2">
                      {getDiscountTypeIcon(selectedCouponDetails.discount_type)}
                      <span className="font-medium text-gray-800">
                        {selectedCouponDetails.discount_type === 'percentage' 
                          ? `${selectedCouponDetails.value}%` 
                          : formatCurrency(selectedCouponDetails.value)
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">For</h4>
                    {getCustomerScopeBadge(selectedCouponDetails.customer_scope)}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Valid From</h4>
                    <p className="text-gray-800">{formatDate(selectedCouponDetails.start_date)}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Valid Until</h4>
                    <p className="text-gray-800">{formatDate(selectedCouponDetails.end_date)}</p>
                  </div>

                  {selectedCouponDetails.max_discount_amount && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Maximum Discount</h4>
                      <p className="text-gray-800">{formatCurrency(selectedCouponDetails.max_discount_amount)}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Minimum Booking</h4>
                    <p className="text-gray-800">{formatCurrency(selectedCouponDetails.minimum_booking_amount)}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Usage</h4>
                    <p className="text-gray-800">
                      {selectedCouponDetails.used_count} used
                      {selectedCouponDetails.usage_limit !== null && 
                        ` of ${selectedCouponDetails.usage_limit}`
                      }
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    {getStatusBadge(selectedCouponDetails.status)}
                  </div>
                </div>

                {/* Estimated Savings */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Estimated Savings on Current Booking</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700">
                      {formatCurrency(calculateDiscount(selectedCouponDetails))}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Applied to {formatCurrency(bookingTotal)} booking
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleCopyCode(selectedCouponDetails.code);
                      setShowDetailsModal(false);
                    }}
                    className="btn btn-outline flex-1"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Code
                  </button>
                  <button
                    onClick={() => {
                      handleApplyCoupon(selectedCouponDetails);
                      setShowDetailsModal(false);
                    }}
                    className="btn bg-purple-600 hover:bg-purple-700 text-white flex-1"
                    disabled={!isCouponEligible(selectedCouponDetails).eligible}
                  >
                    Apply Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Coupons;