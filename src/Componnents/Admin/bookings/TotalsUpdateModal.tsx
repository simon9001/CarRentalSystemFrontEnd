// src/components/admin/bookings/TotalsUpdateModal.tsx
import React, { useState } from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import Swal from 'sweetalert2';

interface TotalsUpdateModalProps {
  booking: BookingDetailsResponse;
  onClose: () => void;
}

const TotalsUpdateModal: React.FC<TotalsUpdateModalProps> = ({ booking, onClose }) => {
  const [formData, setFormData] = useState({
    calculated_total: booking.calculated_total,
    discount_amount: booking.discount_amount,
    extra_charges: booking.extra_charges,
    final_total: booking.final_total
  });

  const [updateTotals, { isLoading }] = BookingApi.useUpdateBookingTotalsMutation();

  const handleChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFinalTotal = () => {
    return formData.calculated_total - formData.discount_amount + formData.extra_charges;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTotal = calculateFinalTotal();
    
    try {
      await updateTotals({
        bookingId: booking.booking_id,
        calculatedTotal: formData.calculated_total,
        discountAmount: formData.discount_amount,
        finalTotal: finalTotal,
        extraCharges: formData.extra_charges
      }).unwrap();

      Swal.fire('Success!', 'Booking totals updated successfully', 'success');
      onClose();
    } catch (error) {
      Swal.fire('Error!', 'Failed to update booking totals', 'error');
    }
  };

  const hasChanges = 
    formData.calculated_total !== booking.calculated_total ||
    formData.discount_amount !== booking.discount_amount ||
    formData.extra_charges !== booking.extra_charges;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Update Booking Totals</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Calculated Total</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.calculated_total}
                onChange={(e) => handleChange('calculated_total', parseFloat(e.target.value) || 0)}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Discount Amount</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_amount}
                onChange={(e) => handleChange('discount_amount', parseFloat(e.target.value) || 0)}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Extra Charges</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.extra_charges}
                onChange={(e) => handleChange('extra_charges', parseFloat(e.target.value) || 0)}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Final Total (Auto-calculated)</span>
              </label>
              <input
                type="number"
                value={calculateFinalTotal()}
                className="input input-bordered bg-gray-100"
                readOnly
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Calculated Total:</span>
                <span>${formData.calculated_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${formData.discount_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Extra Charges:</span>
                <span>+${formData.extra_charges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Final Total:</span>
                <span>${calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? 'Updating...' : 'Update Totals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TotalsUpdateModal;