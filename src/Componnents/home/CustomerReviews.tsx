import React, { useState, useEffect } from 'react'
import { Star, MapPin, User } from 'lucide-react'
import { useGetVisibleReviewsQuery } from '../../features/Api/ReviewApi';

interface Review {
    review_id: number;
    customer_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
    registration_number: string;
    color: string;
    make: string;
    model: string;
    year: number;
    pickup_date: string;
    return_date: string;
}

const CustomerReviews: React.FC = () => {
    const [currentReview, setCurrentReview] = useState(0)
    
    // Fetch reviews from backend
    const { data: reviews = [], isLoading, error } = useGetVisibleReviewsQuery()

    // Auto-rotate reviews every 4 seconds
    useEffect(() => {
        if (reviews.length > 0) {
            const timer = setInterval(() => {
                setCurrentReview((prev) => (prev + 1) % reviews.length)
            }, 4000)

            return () => clearInterval(timer)
        }
    }, [reviews.length])

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-5 h-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ))
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
    }

    // Get vehicle display name
    const getVehicleName = (review: Review) => {
        return `${review.make} ${review.model} ${review.year}`
    }

    // Generate avatar color based on customer name
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-orange-100 text-orange-600',
            'bg-pink-100 text-pink-600',
            'bg-indigo-100 text-indigo-600'
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (isLoading) {
        return (
            <div className="py-16 px-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="loading loading-spinner loading-lg text-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading customer reviews...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-16 px-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="text-red-600 text-lg mb-4">⚠️</div>
                    <p className="text-gray-600">Unable to load reviews at the moment.</p>
                </div>
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="py-16 px-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="text-4xl mb-4">🌟</div>
                    <h2 className="text-3xl font-bold text-blue-800 mb-4">
                        Customer Reviews
                    </h2>
                    <p className="text-xl text-gray-600">
                        Be the first to leave a review after your rental experience!
                    </p>
                </div>
            </div>
        )
    }

    const currentReviewData = reviews[currentReview]

    return (
        <div className="py-16 px-8 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-blue-800 mb-4">
                        🌟 What Our Customers Say
                    </h2>
                    <p className="text-xl text-gray-600">
                        Don't just take our word for it - hear from our valued customers!
                    </p>
                </div>

                {/* Main Review Display */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-105 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Customer Avatar */}
                        <div className="shrink-0">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(currentReviewData.customer_name)}`}>
                                {getInitials(currentReviewData.customer_name)}
                            </div>
                        </div>

                        {/* Review Content */}
                        <div className="text-center lg:text-left flex-1">
                            <div className="flex justify-center lg:justify-start mb-3">
                                {renderStars(currentReviewData.rating)}
                            </div>

                            <blockquote className="text-xl text-gray-700 mb-4 italic leading-relaxed">
                                "{currentReviewData.comment || `Great experience with the ${getVehicleName(currentReviewData)}. Would definitely rent again!`}"
                            </blockquote>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center lg:text-left">
                                <div className="font-bold text-lg text-blue-800">
                                    {currentReviewData.customer_name}
                                </div>
                                <div className="flex items-center justify-center lg:justify-start gap-1 text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>Rented {getVehicleName(currentReviewData)}</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {formatDate(currentReviewData.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Navigation Dots */}
                {reviews.length > 1 && (
                    <div className="flex justify-center gap-3 mb-8">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentReview(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentReview
                                    ? 'bg-blue-600 scale-125'
                                    : 'bg-gray-300 hover:bg-blue-400'
                                    }`}
                                aria-label={`View review ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* All Reviews Preview */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.slice(0, 6).map((review, index) => (
                        <div
                            key={review.review_id}
                            onClick={() => setCurrentReview(index)}
                            className={`bg-white p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${index === currentReview ? 'ring-2 ring-blue-400 scale-105' : ''
                                }`}
                        >
                            <div className="text-center">
                                {/* Customer Avatar */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3 ${getAvatarColor(review.customer_name)}`}>
                                    {getInitials(review.customer_name)}
                                </div>
                                
                                {/* Rating Stars */}
                                <div className="flex justify-center mb-2">
                                    {renderStars(review.rating)}
                                </div>
                                
                                {/* Comment Preview */}
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {review.comment || `Great experience with ${review.make} ${review.model}`}
                                </p>
                                
                                {/* Customer Info */}
                                <h4 className="font-bold text-blue-800 mb-1">{review.customer_name}</h4>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{getVehicleName(review)}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatDate(review.created_at)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-800">{reviews.length}</div>
                            <div className="text-sm text-gray-600">Total Reviews</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-800">
                                {reviews.length > 0 
                                    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                                    : '0.0'
                                }
                            </div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-800">
                                {reviews.filter(review => review.rating === 5).length}
                            </div>
                            <div className="text-sm text-gray-600">5-Star Reviews</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-800">
                                {new Set(reviews.map(review => review.customer_name)).size}
                            </div>
                            <div className="text-sm text-gray-600">Happy Customers</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerReviews