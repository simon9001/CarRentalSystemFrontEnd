import React from 'react';
import Navbar from '../Componnents/Navbar';
import Footer from '../Componnents/Footer';
import { Car, MapPin, Shield, Clock, Users, Star, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { useGetVisibleReviewsQuery, useGetReviewStatisticsQuery } from '../features/Api/ReviewApi';

const About: React.FC = () => {
    // Fetch reviews and statistics from backend
    const { data: reviews = [], isLoading: reviewsLoading } = useGetVisibleReviewsQuery();
    const { data: reviewStats, isLoading: statsLoading } = useGetReviewStatisticsQuery();
    
    // Calculate statistics from reviews if not available from API
    const averageRating = reviewStats?.average_rating || 
        (reviews.length > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : '4.8'
        );
    
    const totalReviews = reviewStats?.total_reviews || reviews.length || 50000;
    const topVehicles = reviewStats?.top_vehicles || [];

    // Get top 3 reviews for testimonials
    const topReviews = reviews
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white py-20 px-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
                    <div className="absolute top-1/3 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
                    <div className="absolute bottom-20 left-1/3 w-16 h-16 border-4 border-white rounded-full"></div>
                </div>
                <h1 className="text-5xl md:text-6xl mb-6 font-bold relative">
                    <span className="text-yellow-400">PATAMOTI</span>.COM
                </h1>
                <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-95 mb-6">
                    Kenya's Premier Car Rental Service • Rated {averageRating}★ by {totalReviews.toLocaleString()}+ Customers
                </p>
                <p className="text-lg max-w-2xl mx-auto leading-relaxed opacity-90 mb-8">
                    Your trusted partner for premium car rental experiences across Kenya. 
                    From Nairobi to Mombasa, we're here to make every journey smooth and memorable.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-700/30 px-4 py-2 rounded-full">
                        <MapPin className="w-5 h-5" />
                        <span>Nairobi • Mombasa • Kisumu • Nakuru</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-700/30 px-4 py-2 rounded-full">
                        <Car className="w-5 h-5" />
                        <span>300+ Verified Vehicles</span>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/30 px-4 py-2 rounded-full">
                        <Star className="w-5 h-5" />
                        <span>{averageRating}★ Rating</span>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="py-20 px-8 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10"></div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-50 rounded-2xl -z-10"></div>
                            <img
                                src="https://tse4.mm.bing.net/th/id/OIP.bL_tqk8FxlDrknCvLqApWgHaE8?w=849&h=566&rs=1&pid=ImgDetMain&o=7&rm=3"
                                alt="PATAMOTI.COM Fleet in Kenya"
                                className="w-full rounded-2xl shadow-2xl h-96 object-cover"
                            />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                            <span className="text-lg">🇰🇪</span>
                            <span className="font-semibold">Made in Kenya</span>
                        </div>
                        <h2 className="text-4xl text-gray-900 mb-6 font-bold">
                            Driving Kenya's Mobility Since 2010
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Born and raised in Nairobi, PATAMOTI.COM started with a simple vision: 
                            to provide reliable, affordable, and quality car rentals for Kenyans by Kenyans. 
                            What began with just 3 vehicles has grown into one of Kenya's most trusted 
                            rental services.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Our journey has been marked by an unwavering commitment to our customers 
                            and a deep understanding of Kenya's diverse transportation needs. From 
                            business travel in Nairobi to safari adventures in the Maasai Mara, 
                            we've been there for every mile.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium">NTSA Certified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium">24/7 Kenya Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Local Insurance Partners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-20 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                        <span className="text-lg">✨</span>
                        <span className="font-semibold">Kenyan Values</span>
                    </div>
                    <h2 className="text-4xl text-gray-900 mb-4 font-bold">
                        Harambee Spirit in Every Rental
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Building trust through community, reliability, and exceptional service
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Shield className="w-8 h-8 text-blue-600" />,
                                title: 'Uaminifu (Trust)',
                                description: 'Every vehicle undergoes rigorous NTSA-approved safety checks. Your trust is our most valuable asset.'
                            },
                            {
                                icon: <Clock className="w-8 h-8 text-blue-600" />,
                                title: 'Uthabiti (Reliability)',
                                description: 'We understand Kenyan roads and timelines. Our vehicles are ready when you are, rain or shine.'
                            },
                            {
                                icon: <Users className="w-8 h-8 text-blue-600" />,
                                title: 'Jamii (Community)',
                                description: 'We hire locally, partner with Kenyan businesses, and give back to our communities.'
                            }
                        ].map((value, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl text-gray-900 mb-4 font-bold">
                                    {value.title}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics Section with Live Data */}
            <div className="py-16 px-8 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                number: '300+', 
                                label: 'Verified Vehicles', 
                                icon: '🚗',
                                description: 'From sedans to 4x4s'
                            },
                            { 
                                number: '8+', 
                                label: 'Branch Locations', 
                                icon: '📍',
                                description: 'Across major cities'
                            },
                            { 
                                number: totalReviews.toLocaleString(), 
                                label: 'Happy Customers', 
                                icon: '😊',
                                description: 'And counting'
                            },
                            { 
                                number: `${averageRating}★`, 
                                label: 'Average Rating', 
                                icon: '⭐',
                                description: 'From real reviews'
                            }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-4">
                                <div className="text-5xl mb-3">{stat.icon}</div>
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <p className="text-lg font-medium mb-1">{stat.label}</p>
                                <p className="text-sm opacity-80">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="py-20 px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-semibold">Live Customer Feedback</span>
                        </div>
                        <h2 className="text-4xl text-gray-900 mb-4 font-bold">
                            What Kenyans Are Saying
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Real reviews from real customers across Kenya
                        </p>
                        
                        {/* Overall Rating Display */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="text-6xl font-bold text-yellow-500">{averageRating}</div>
                            <div>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-6 h-6 ${i < Math.floor(Number(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-600">
                                    Based on {totalReviews} verified reviews
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Rated Vehicles */}
                    {topVehicles.length > 0 && (
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Most Loved Vehicles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {topVehicles.slice(0, 3).map((vehicle: any, index: number) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-lg text-gray-900">
                                                {vehicle.make} {vehicle.model}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-bold">{vehicle.average_rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {vehicle.total_reviews} reviews
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{vehicle.year}</span> • 
                                            <span>{vehicle.vehicle_type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Testimonials from Backend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviewsLoading ? (
                            // Loading skeleton
                            [...Array(3)].map((_, index) => (
                                <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-6"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : topReviews.length > 0 ? (
                            topReviews.map((review, index) => (
                                <div
                                    key={review.review_id}
                                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-6 italic">
                                        "{review.comment || 'Excellent service, highly recommended!'}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                                            {review.customer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {review.customer_name}
                                            </h4>
                                            <div className="text-sm text-gray-600">
                                                Rented {review.make} {review.model}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(review.created_at).toLocaleDateString('en-KE', {
                                                    year: 'numeric',
                                                    month: 'long'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Fallback testimonials if no reviews
                            [
                                {
                                    name: 'John Kamau',
                                    review: 'Perfect for my Nairobi-Mombasa road trip! The car was in excellent condition.',
                                    rating: 5,
                                    vehicle: 'Toyota RAV4'
                                },
                                {
                                    name: 'Sarah Achieng',
                                    review: 'Reliable service for my business trips across Kenya. Highly recommended!',
                                    rating: 5,
                                    vehicle: 'Toyota Premio'
                                },
                                {
                                    name: 'David Omondi',
                                    review: 'Best 4x4 rental for our Maasai Mara safari. Professional service throughout.',
                                    rating: 5,
                                    vehicle: 'Land Cruiser'
                                }
                            ].map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-6 italic">
                                        "{testimonial.review}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {testimonial.name}
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                {testimonial.vehicle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Our Fleet Advantage */}
            <div className="py-20 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                            <span className="text-lg">🚘</span>
                            <span className="font-semibold">Kenyan Road Ready</span>
                        </div>
                        <h2 className="text-4xl text-gray-900 mb-4 font-bold">
                            Why PATAMOTI.COM Stands Out
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Tailored for Kenya's unique driving conditions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Kenya-Suitable Fleet',
                                description: 'Vehicles selected for Kenyan roads and weather conditions',
                                features: ['4x4 Safari Vehicles', 'Fuel-Efficient Sedans', '7-Seater Family Cars']
                            },
                            {
                                title: 'Local Expertise',
                                description: 'Our team knows Kenyan routes, traffic, and best practices',
                                features: ['Route Advice', 'Local Traffic Tips', 'Safari Planning']
                            },
                            {
                                title: 'Flexible Kenya Plans',
                                description: 'Rental plans designed for Kenyan travel patterns',
                                features: ['Weekly Nairobi Rentals', 'Monthly Mombasa Packages', 'Safari Specials']
                            },
                            {
                                title: 'Kenyan Support',
                                description: 'Local customer service team that speaks your language',
                                features: ['Swahili Support', '24/7 Roadside Kenya', 'Local Contacts']
                            },
                            {
                                title: 'Transparent Kenya Pricing',
                                description: 'No hidden fees, clear pricing in Kenyan Shillings',
                                features: ['All-Inclusive Rates', 'No Deposit Required', 'Loyalty Discounts']
                            },
                            {
                                title: 'Corporate Kenya Solutions',
                                description: 'Specialized services for Kenyan businesses',
                                features: ['Fleet Management', 'Monthly Billing', 'Nairobi CBD Delivery']
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                            >
                                <h3 className="text-xl text-gray-900 mb-3 font-bold">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {feature.description}
                                </p>
                                <ul className="space-y-2">
                                    {feature.features.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Awards & Recognition */}
            <div className="py-16 px-8 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold">Kenyan Recognition</span>
                    </div>
                    <h2 className="text-4xl text-gray-900 mb-12 font-bold">
                        Awards & Accolades
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { year: '2023', award: 'Best Car Rental Service', org: 'Kenya Tourism Awards' },
                            { year: '2022', award: 'Excellence in Customer Service', org: 'East Africa Business Awards' },
                            { year: '2021', award: 'Most Trusted Kenyan Brand', org: 'Consumer Choice Awards KE' },
                            { year: '2020', award: 'Innovation in Mobility', org: 'Nairobi Business Awards' }
                        ].map((award, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {award.year}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {award.award}
                                </h4>
                                <p className="text-gray-600">
                                    {award.org}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-20 px-8 bg-gradient-to-r from-blue-800 to-indigo-700 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl mb-6 font-bold">
                        Ready to Explore Kenya?
                    </h2>
                    <p className="text-xl mb-8 leading-relaxed opacity-95">
                        Join {totalReviews.toLocaleString()} satisfied customers who trust PATAMOTI.COM. 
                        Book your perfect vehicle today and experience Kenya in comfort and style.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => window.location.href = '/Magariiii'}
                            className="bg-white text-blue-800 px-8 py-4 rounded-full text-lg font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1"
                        >
                            <Car className="w-6 h-6" />
                            Browse Our Kenya Fleet
                        </button>

                        <button 
                            onClick={() => window.location.href = '/contact'}
                            className="bg-transparent text-white px-8 py-4 border-2 border-white rounded-full text-lg font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white hover:text-blue-800"
                        >
                            <MapPin className="w-6 h-6" />
                            Find a Kenyan Branch
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default About