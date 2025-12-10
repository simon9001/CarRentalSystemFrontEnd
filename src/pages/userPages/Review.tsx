import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { Star, Clock, Edit, Trash2, MessageSquare, Car, PlusCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { ReviewApi } from '../../features/Api/ReviewApi'
import { BookingApi } from '../../features/Api/BookingApi'
import { useSelector } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import type { Review } from '../../features/Api/ReviewApi'
import { apiDomain } from '../../apiDomain/ApiDomain'

const Reviews: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [showNewReviewModal, setShowNewReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [bookingsWithoutReviews, setBookingsWithoutReviews] = useState<any[]>([]);

    // Get all reviews
    const { data: customerReviews, isLoading, error, refetch } = ReviewApi.useGetAllReviewsQuery(undefined, {
        skip: !isAuthenticated
    });
    
    // Get customer's completed bookings
    const { data: customerBookings, refetch: refetchBookings } = BookingApi.useGetBookingsByCustomerQuery(
        isAuthenticated && user ? user.user_id : skipToken,
        { skip: !isAuthenticated }
    );

    // RTK mutations
    const [updateReview] = ReviewApi.useUpdateReviewMutation()
    const [deleteReview] = ReviewApi.useDeleteReviewMutation()
    const [createReview] = ReviewApi.useCreateReviewMutation()

    // Filter reviews for current customer
    const userReviews = customerReviews?.filter(review => 
        review.customer_name === user?.username || review.customer_name === user?.email
    ) || [];

    // Get completed bookings without reviews
    useEffect(() => {
        if (customerBookings) {
            console.log('=== BOOKINGS DEBUG ===');
            console.log('Total bookings:', customerBookings.length);
            
            const statusCounts: Record<string, number> = {};
            customerBookings.forEach((booking: any) => {
                const status = booking.booking_status || 'unknown';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            console.log('Status counts:', statusCounts);
            
            // Check if any bookings have "completed" status
            const completedBookings = customerBookings.filter((b: any) => 
                b.booking_status?.toLowerCase() === 'Completed'
            );
            console.log('Completed bookings found:', completedBookings.length);
            
            if (completedBookings.length === 0) {
                console.log('No completed bookings found. Available bookings:');
                customerBookings.forEach((b: any) => {
                    console.log(`- Booking #${b.booking_id}: ${b.make} ${b.model} (${b.booking_status})`);
                });
            }
        }
    }, [customerBookings]);
    // Helper function to render star rating
    const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => onChange?.(star) : undefined}
                        className={interactive ? "focus:outline-none" : ""}
                    >
                        <Star
                            size={interactive ? 24 : 16}
                            className={`mr-1 transition-colors ${
                                star <= rating 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                            } ${interactive ? 'hover:text-yellow-400 hover:fill-yellow-400' : ''}`}
                        />
                    </button>
                ))}
                {!interactive && (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                        {rating.toFixed(1)}
                    </span>
                )}
            </div>
        );
    };

    // Helper function to get rating badge color
    const getRatingBadge = (rating: number) => {
        const ratingConfig = {
            5: { color: 'bg-green-100 text-green-800', label: 'Excellent' },
            4: { color: 'bg-blue-100 text-blue-800', label: 'Good' },
            3: { color: 'bg-yellow-100 text-yellow-800', label: 'Average' },
            2: { color: 'bg-orange-100 text-orange-800', label: 'Poor' },
            1: { color: 'bg-red-100 text-red-800', label: 'Bad' },
        };
        const config = ratingConfig[rating as keyof typeof ratingConfig] || ratingConfig[3];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate rental duration
    const getRentalDuration = (pickupDate: string, returnDate: string) => {
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        const diffTime = Math.abs(returnD.getTime() - pickup.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    };

    // Handle new review submission
    const handleSubmitReview = async () => {
        if (!selectedBooking || !user?.user_id) return;

        try {
            await createReview({
                booking_id: selectedBooking.booking_id,
                customer_id: user.user_id,
                rating: newReview.rating,
                comment: newReview.comment || undefined
            }).unwrap();

            Swal.fire({
                title: "Success!",
                text: "Thank you for your review!",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

            // Reset form and refetch data
            setShowNewReviewModal(false);
            setSelectedBooking(null);
            setNewReview({ rating: 5, comment: '' });
            refetch();
            refetchBookings();
        } catch (error: any) {
            console.error('Review submission error:', error);
            Swal.fire({
                title: "Error",
                text: error?.data?.error || "Failed to submit review. Please try again.",
                icon: "error"
            });
        }
    };

    // Handle edit review
    const handleEditReview = async (review_id: number, currentRating: number, currentComment?: string) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Review",
            html: `
                <div class="text-left">
                    <label class="block mb-2 text-sm font-medium text-gray-700">Rating (1-5)</label>
                    <select id="rating" class="swal2-input mb-4">
                        <option value="1" ${currentRating === 1 ? 'selected' : ''}>★☆☆☆☆ (1)</option>
                        <option value="2" ${currentRating === 2 ? 'selected' : ''}>★★☆☆☆ (2)</option>
                        <option value="3" ${currentRating === 3 ? 'selected' : ''}>★★★☆☆ (3)</option>
                        <option value="4" ${currentRating === 4 ? 'selected' : ''}>★★★★☆ (4)</option>
                        <option value="5" ${currentRating === 5 ? 'selected' : ''}>★★★★★ (5)</option>
                    </select>
                    <label class="block mb-2 text-sm font-medium text-gray-700">Comment</label>
                    <textarea id="comment" class="swal2-textarea" placeholder="Share your experience...">${currentComment || ''}</textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Update Review",
            preConfirm: () => {
                const rating = parseInt((document.getElementById('rating') as HTMLSelectElement).value);
                const comment = (document.getElementById('comment') as HTMLTextAreaElement).value;
                
                if (rating < 1 || rating > 5) {
                    Swal.showValidationMessage('Rating must be between 1 and 5');
                    return false;
                }
                
                return { rating, comment: comment || null };
            }
        });

        if (formValues) {
            try {
                await updateReview({
                    review_id,
                    ...formValues
                }).unwrap();
                Swal.fire("Updated!", "Your review has been updated.", "success");
                refetch();
            } catch (error) {
                Swal.fire("Error", "Failed to update review. Please try again.", "error");
            }
        }
    };

    // Handle delete review
    const handleDeleteReview = async (review_id: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f44336",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteReview(review_id).unwrap();
                    Swal.fire("Deleted!", "Your review has been deleted.", "success");
                    refetch();
                    refetchBookings();
                } catch (error) {
                    Swal.fire("Error", "Failed to delete review. Please try again.", "error");
                }
            }
        });
    };

    return (
        <DashboardLayout>
            {/* New Review Modal */}
            {showNewReviewModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Submit Review for Booking #{selectedBooking.booking_id}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vehicle:</span>
                                            <span className="font-semibold">{selectedBooking.make} {selectedBooking.model}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rental Period:</span>
                                            <span className="font-semibold">
                                                {formatDate(selectedBooking.pickup_date)} - {formatDate(selectedBooking.return_date)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-semibold">
                                                {getRentalDuration(selectedBooking.pickup_date, selectedBooking.return_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating
                                    </label>
                                    {renderStars(newReview.rating, true, (rating) => 
                                        setNewReview({...newReview, rating})
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Review (Optional)
                                    </label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                        placeholder="Tell us about your experience with this vehicle..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Share what you liked or any suggestions for improvement.
                                    </p>
                                </div>
                                
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        Review Guidelines
                                    </h4>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Be honest and constructive in your feedback</li>
                                        <li>• Focus on the vehicle condition and rental experience</li>
                                        <li>• Avoid personal information or offensive language</li>
                                        <li>• Your review helps other customers make decisions</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowNewReviewModal(false);
                                        setSelectedBooking(null);
                                        setNewReview({ rating: 5, comment: '' });
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Star className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Reviews</h1>
                        <p className="text-sm text-gray-600">Manage and submit reviews for your completed bookings</p>
                    </div>
                </div>
                {bookingsWithoutReviews.length > 0 && (
                    <button
                        onClick={() => {
                            // Show modal to select booking to review
                            const bookingsOptions = bookingsWithoutReviews.map(booking => 
                                `${booking.make} ${booking.model} (${formatDate(booking.pickup_date)} - ${formatDate(booking.return_date)})`
                            );
                            
                            Swal.fire({
                                title: "Select Booking to Review",
                                input: "select",
                                inputOptions: Object.fromEntries(
                                    bookingsWithoutReviews.map((booking, index) => [
                                        index.toString(),
                                        `${booking.make} ${booking.model} (Booking #${booking.booking_id})`
                                    ])
                                ),
                                inputPlaceholder: "Choose a booking",
                                showCancelButton: true,
                                confirmButtonColor: "#2563eb",
                                cancelButtonColor: "#6b7280",
                                confirmButtonText: "Continue",
                                cancelButtonText: "Cancel"
                            }).then((result) => {
                                if (result.isConfirmed && result.value !== undefined) {
                                    const selectedIndex = parseInt(result.value);
                                    setSelectedBooking(bookingsWithoutReviews[selectedIndex]);
                                    setShowNewReviewModal(true);
                                }
                            });
                        }}
                        className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Submit New Review
                    </button>
                )}
            </div>

            {/* Pending Reviews Section */}
            {bookingsWithoutReviews.length > 0 && (
                <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-yellow-800">Pending Reviews</h4>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            You have {bookingsWithoutReviews.length} completed booking{bookingsWithoutReviews.length !== 1 ? 's' : ''} without reviews.
                                            Help others by sharing your experience!
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (bookingsWithoutReviews.length > 0) {
                                                setSelectedBooking(bookingsWithoutReviews[0]);
                                                setShowNewReviewModal(true);
                                            }
                                        }}
                                        className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                                    >
                                        Review Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    <span className="ml-3 text-gray-600">Loading your reviews...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <XCircle className="mx-auto text-red-500 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reviews</h3>
                    <p className="text-red-600">Unable to fetch your reviews. Please try again later.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <Star className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Reviews</p>
                                    <p className="text-2xl font-bold text-gray-800">{userReviews.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                    <Star className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Average Rating</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {userReviews.length > 0 
                                            ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / 
                                              userReviews.length).toFixed(1)
                                            : '0.0'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                    <Car className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Vehicles Reviewed</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {userReviews.length > 0 
                                            ? new Set(userReviews.map(r => `${r.make} ${r.model}`)).size
                                            : 0
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                    <Clock className="text-yellow-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending Reviews</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {bookingsWithoutReviews.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    {userReviews.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                            <p className="text-gray-500 mb-4">
                                {bookingsWithoutReviews.length > 0 
                                    ? "You have completed bookings waiting for your review!"
                                    : "You haven't submitted any reviews yet. Complete a booking to leave a review."
                                }
                            </p>
                            {bookingsWithoutReviews.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (bookingsWithoutReviews.length > 0) {
                                            setSelectedBooking(bookingsWithoutReviews[0]);
                                            setShowNewReviewModal(true);
                                        }
                                    }}
                                    className="btn bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <PlusCircle size={18} className="mr-2" />
                                    Submit Your First Review
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left font-semibold text-gray-700">Vehicle</th>
                                                <th className="text-left font-semibold text-gray-700">Rating</th>
                                                <th className="text-left font-semibold text-gray-700">Review</th>
                                                <th className="text-left font-semibold text-gray-700">Rental Period</th>
                                                <th className="text-left font-semibold text-gray-700">Date Reviewed</th>
                                                <th className="text-center font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userReviews.map((review: Review) => (
                                                <tr key={review.review_id} className="hover:bg-gray-50">
                                                    <td>
                                                        <div>
                                                            <div className="font-bold text-gray-800">
                                                                {review.make} {review.model} ({review.year})
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {review.registration_number} • {review.color}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex flex-col">
                                                            {renderStars(review.rating)}
                                                            {getRatingBadge(review.rating)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="max-w-xs">
                                                            <p className="text-gray-800">
                                                                {review.comment || <span className="text-gray-400 italic">No comment provided</span>}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="text-sm">
                                                            <div className="text-gray-700">
                                                                {formatDate(review.pickup_date)} → {formatDate(review.return_date)}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {getRentalDuration(review.pickup_date, review.return_date)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-sm text-gray-600">
                                                        {formatDate(review.created_at)}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditReview(review.review_id, review.rating, review.comment || undefined)}
                                                                className="btn btn-outline btn-info btn-xs"
                                                                title="Edit Review"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReview(review.review_id)}
                                                                className="btn btn-outline btn-error btn-xs"
                                                                title="Delete Review"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Statistics Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = userReviews.filter(r => r.rating === rating).length;
                                        const percentage = userReviews.length > 0 ? (count / userReviews.length) * 100 : 0;
                                        return (
                                            <div key={rating} className="text-center">
                                                <div className="text-2xl font-bold text-gray-800">{count}</div>
                                                <div className="flex justify-center mb-1">
                                                    {renderStars(rating)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}

export default Reviews;