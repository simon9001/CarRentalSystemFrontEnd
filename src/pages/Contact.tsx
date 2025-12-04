import React, { useState } from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'

interface ContactFormData {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

const Contact: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        setTimeout(() => {
            alert(`Thank you ${formData.name}! We'll get back to you within 24 hours.`)
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            })
            setIsSubmitting(false)
        }, 2000)
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-green-800 text-white py-16 px-8 text-center">
                <h1 className="text-6xl mb-4 font-bold">
                    📞 Get in Touch
                </h1>
                <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
                    We'd love to hear from you! Whether you have questions, feedback, or want to make a reservation, we're here to help.
                </p>
            </div>

            {/* Contact Information Cards */}
            <div className="py-12 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '📍',
                            title: 'Visit Us',
                            info: 'G-Town',
                            detail: 'G-Town, Embu 60100',
                            action: 'Get Directions'
                        },
                        {
                            icon: '📞',
                            title: 'Call Us',
                            info: '+254 712 345 678',
                            detail: '+254 700 987 654',
                            action: 'Call Now'
                        },
                        {
                            icon: '🕒',
                            title: 'Opening Hours',
                            info: 'Mon - Sun: 8:00 AM',
                            detail: 'to 10:00 PM',
                            action: 'View Schedule'
                        }
                    ].map((contact, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg text-center transition-transform duration-300 cursor-pointer hover:-translate-y-2"
                        >
                            <div className="text-5xl mb-4">
                                {contact.icon}
                            </div>
                            <h3 className="text-xl text-green-800 mb-4 font-bold">
                                {contact.title}
                            </h3>
                            <p className="text-lg text-gray-800 mb-2 font-semibold">
                                {contact.info}
                            </p>
                            <p className="text-base text-gray-600 mb-6">
                                {contact.detail}
                            </p>
                            <button className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 border-none rounded-full text-sm font-bold cursor-pointer transition-all duration-300">
                                {contact.action}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="py-16 px-8 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-4xl text-green-800 mb-4 font-bold">
                            💬 Send Us a Message
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Have a question, suggestion, or want to make a reservation? Fill out the form below and we'll get back to you as soon as possible.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Name and Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-green-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your email"
                                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-green-800"
                                    />
                                </div>
                            </div>

                            {/* Phone and Subject Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Your phone number"
                                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-green-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none bg-white focus:border-green-800"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="reservation">🍽️ Make a Reservation</option>
                                        <option value="feedback">💬 General Feedback</option>
                                        <option value="complaint">⚠️ Complaint</option>
                                        <option value="catering">🎉 Catering Services</option>
                                        <option value="careers">💼 Career Opportunities</option>
                                        <option value="other">❓ Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    placeholder="Tell us how we can help you..."
                                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none resize-y min-h-32 focus:border-green-800"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-4 border-none rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-green-800 hover:bg-green-900'
                                    } text-white`}
                            >
                                {isSubmitting ? '⏳ Sending...' : '📤 Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Additional Info */}
                    <div>
                        <h3 className="text-3xl text-green-800 mb-6 font-bold">
                            🗺️ Find Us
                        </h3>

                        {/* Map Placeholder */}
                        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center mb-8 border-2 border-gray-300">
                            <div className="text-center text-gray-500">
                                <div className="text-3xl mb-2">🗺️</div>
                                <p className="text-lg font-semibold">Interactive Map</p>
                                <p className="text-sm">123 Delicious Street, Nairobi</p>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="bg-gray-50 p-8 rounded-xl mb-8">
                            <h4 className="text-xl text-green-800 mb-4 font-bold">
                                🕒 Business Hours
                            </h4>
                            {[
                                { day: 'Monday - Thursday', hours: '8:00 AM - 9:00 PM' },
                                { day: 'Friday - Saturday', hours: '8:00 AM - 10:00 PM' },
                                { day: 'Sunday', hours: '9:00 AM - 9:00 PM' }
                            ].map((schedule, index) => (
                                <div key={index} className={`flex justify-between py-2 ${index < 2 ? 'border-b border-gray-300' : ''}`}>
                                    <span className="font-semibold text-gray-800">{schedule.day}</span>
                                    <span className="text-green-800 font-medium">{schedule.hours}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Media */}
                        <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                            <h4 className="text-xl text-green-800 mb-4 font-bold">
                                📱 Follow Us
                            </h4>
                            <div className="flex gap-4 flex-wrap">
                                {['📘 Facebook', '📸 Instagram', '🐦 Twitter', '📺 YouTube'].map((social, index) => (
                                    <button
                                        key={index}
                                        className="bg-gray-50 text-green-800 px-4 py-3 border-2 border-gray-200 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-green-800 hover:text-white"
                                    >
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Contact