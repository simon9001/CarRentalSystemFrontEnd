import React, { useState } from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'
import { MapPin, Phone, Clock, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

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
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        
        try {
            // Basic validation
            if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
                throw new Error('Please fill in all required fields')
            }

            if (!validateEmail(formData.email)) {
                throw new Error('Please enter a valid email address')
            }

            if (formData.phone && !validatePhoneNumber(formData.phone)) {
                throw new Error('Please enter a valid Kenyan phone number (format: +2547XXXXXXXX or 07XXXXXXXX)')
            }

            // Send to your backend API
            const response = await fetch('http://localhost:3000/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to send message')
            }

            toast.success('Message sent successfully! Check your email for confirmation.')
            setIsSubmitted(true)
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            })

            // Reset submitted state after 5 seconds
            setTimeout(() => {
                setIsSubmitted(false)
            }, 5000)

        } catch (error: any) {
            console.error('Error sending message:', error)
            setError(error.message || 'Failed to send message. Please try again.')
            toast.error(error.message || 'Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Validate email format
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Validate Kenyan phone number
    const validatePhoneNumber = (phone: string) => {
        const kenyanRegex = /^(\+254|0)[17]\d{8}$/
        return kenyanRegex.test(phone.replace(/\s/g, ''))
    }

    // Format phone number as user types
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        
        if (value.startsWith('0')) {
            value = '+254' + value.substring(1)
        } else if (value.startsWith('254')) {
            value = '+' + value
        }
        
        // Format: +254 712 345 678
        if (value.length > 3) value = value.substring(0, 4) + ' ' + value.substring(4)
        if (value.length > 8) value = value.substring(0, 8) + ' ' + value.substring(8)
        if (value.length > 12) value = value.substring(0, 12) + ' ' + value.substring(12)
        
        setFormData(prev => ({
            ...prev,
            phone: value
        }))
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Toaster position="top-right" richColors />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white py-16 px-8 text-center">
                <h1 className="text-5xl md:text-6xl mb-4 font-bold">
                    📞 Contact PATAMOTI.COM
                </h1>
                <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
                    Need assistance with your rental? Have questions about our services? 
                    Contact our friendly team - we're here to help you 24/7.
                </p>
            </div>

            {/* Contact Information Cards */}
            <div className="py-12 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <MapPin className="w-8 h-8" />,
                            title: 'Head Office',
                            info: 'Nairobi CBD',
                            detail: 'Kimathi Street, Nairobi, Kenya',
                            action: 'Get Directions',
                            actionLink: 'https://maps.google.com/?q=Nairobi+CBD+Kenya'
                        },
                        {
                            icon: <Phone className="w-8 h-8" />,
                            title: 'Call Us',
                            info: '+254 712 345 678',
                            detail: '+254 700 987 654',
                            action: 'Call Now',
                            actionLink: 'tel:+254712345678'
                        },
                        {
                            icon: <Mail className="w-8 h-8" />,
                            title: 'Email Us',
                            info: 'info@patamoti.com',
                            detail: 'support@patamoti.com',
                            action: 'Send Email',
                            actionLink: 'mailto:info@patamoti.com'
                        }
                    ].map((contact, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="text-blue-600">
                                    {contact.icon}
                                </div>
                            </div>
                            <h3 className="text-xl text-gray-900 mb-4 font-bold">
                                {contact.title}
                            </h3>
                            <p className="text-lg text-blue-600 mb-2 font-semibold">
                                {contact.info}
                            </p>
                            <p className="text-base text-gray-600 mb-6">
                                {contact.detail}
                            </p>
                            <a
                                href={contact.actionLink}
                                target={contact.actionLink.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg"
                            >
                                {contact.action}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="py-16 px-8 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Contact Form */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Send className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-4xl text-gray-900 mb-1 font-bold">
                                    Send Us a Message
                                </h2>
                                <p className="text-blue-600 font-medium">
                                    We respond within 24 hours
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Have questions about our fleet, need help with booking, or want to discuss 
                            corporate rental solutions? Fill out the form below and our team will get 
                            back to you promptly.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        {isSubmitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl text-green-800 mb-3 font-bold">
                                    Message Sent Successfully!
                                </h3>
                                <p className="text-green-700 mb-4">
                                    Thank you for contacting PATAMOTI.COM. We have received your message 
                                    and our team will get back to you within 24 hours.
                                </p>
                                <p className="text-green-600 text-sm mb-6">
                                    ✅ Check your email for confirmation
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                {/* Phone and Subject Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            required
                                            placeholder="+254 712 345 678"
                                            // pattern="^(\+254|0)[17]\d{8}$"
                                            title="Please enter a valid Kenyan phone number"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Format: +2547XXXXXXXX or 07XXXXXXXX
                                        </p>
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="Booking Inquiry">🚗 Booking Inquiry</option>
                                            <option value="Fleet Information">🚘 Fleet Information</option>
                                            <option value="Corporate Rental">🏢 Corporate Rental</option>
                                            <option value="Pricing & Rates">💰 Pricing & Rates</option>
                                            <option value="Support & Assistance">🆘 Support & Assistance</option>
                                            <option value="Feedback">💬 Feedback</option>
                                            <option value="Partnership">🤝 Partnership</option>
                                            <option value="Other">❓ Other</option>
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
                                        minLength={10}
                                        placeholder="Tell us how we can assist you with your car rental needs..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 outline-none resize-y min-h-32 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum 10 characters required
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-8 py-4 rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                                        isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:shadow-lg hover:-translate-y-0.5'
                                    } text-white`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending Message...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        By submitting this form, you agree to our Privacy Policy and Terms of Service.
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        You will receive a confirmation email at {formData.email || 'your email'}.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div>
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl text-gray-900 font-bold">
                                        Operating Hours
                                    </h3>
                                    <p className="text-blue-600">Always available for your convenience</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                {[
                                    { day: 'Monday - Friday', hours: '6:00 AM - 10:00 PM' },
                                    { day: 'Saturday', hours: '7:00 AM - 9:00 PM' },
                                    { day: 'Sunday', hours: '8:00 AM - 8:00 PM' },
                                    { day: '24/7 Emergency', hours: 'Always Available', highlight: true }
                                ].map((schedule, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex justify-between py-3 ${index < 3 ? 'border-b border-gray-300' : ''}`}
                                    >
                                        <span className={`font-semibold ${schedule.highlight ? 'text-blue-700' : 'text-gray-800'}`}>
                                            {schedule.day}
                                        </span>
                                        <span className={`font-medium ${schedule.highlight ? 'text-blue-700' : 'text-blue-600'}`}>
                                            {schedule.hours}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Branch Locations */}
                        <div className="mb-10">
                            <h3 className="text-2xl text-gray-900 mb-6 font-bold">
                                🇰🇪 Our Kenyan Branches
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { city: 'Nairobi CBD', address: 'Kimathi Street, Nairobi', phone: '+254 712 345 678' },
                                    { city: 'Mombasa', address: 'Moi Avenue, Mombasa', phone: '+254 734 567 890' },
                                    { city: 'Kisumu', address: 'Oginga Odinga Road, Kisumu', phone: '+254 745 678 901' },
                                    { city: 'Nakuru', address: 'Kenyatta Avenue, Nakuru', phone: '+254 756 789 012' }
                                ].map((branch, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{branch.city}</h4>
                                                <p className="text-gray-600 text-sm">{branch.address}</p>
                                            </div>
                                            <a 
                                                href={`tel:${branch.phone}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                {branch.phone}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Email Status */}
                        <div className="mb-10">
                            <h3 className="text-2xl text-gray-900 mb-4 font-bold">
                                📧 Email Delivery Status
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-800">Instant Confirmation</p>
                                        <p className="text-sm text-green-600">You'll receive an email immediately after submitting</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-800">24-Hour Response</p>
                                        <p className="text-sm text-blue-600">Our team will reply to your inquiry within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-red-800 mb-2">
                                        🆘 Emergency Roadside Assistance
                                    </h4>
                                    <p className="text-red-700 mb-3">
                                        Need immediate help on the road? Call our 24/7 emergency line:
                                    </p>
                                    <a 
                                        href="tel:+254711999000"
                                        className="text-xl font-bold text-red-600 hover:text-red-800"
                                    >
                                        +254 711 999 000
                                    </a>
                                    <p className="text-sm text-red-600 mt-2">
                                        Available 24 hours, 7 days a week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-16 px-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl text-gray-900 mb-12 text-center font-bold">
                        ❓ Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                question: 'How quickly do you respond to inquiries?',
                                answer: 'We respond to all inquiries within 24 hours, usually much faster during business hours.'
                            },
                            {
                                question: 'What information do I need for booking?',
                                answer: 'You need a valid Kenyan ID/Passport, driving license, and a credit/debit card for security deposit.'
                            },
                            {
                                question: 'Do you offer airport pickup/dropoff?',
                                answer: 'Yes, we offer convenient airport services at Jomo Kenyatta International Airport and Moi International Airport.'
                            },
                            {
                                question: 'Can I modify or cancel my booking?',
                                answer: 'Yes, you can modify or cancel your booking up to 24 hours before pickup without any penalty.'
                            },
                            {
                                question: 'How do I know my message was received?',
                                answer: 'You will receive an automated confirmation email immediately after submitting the form.'
                            },
                            {
                                question: 'What if I don\'t receive the confirmation email?',
                                answer: 'Check your spam folder first. If you still don\'t see it, contact us directly at support@patamoti.com.'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {faq.question}
                                </h4>
                                <p className="text-gray-600">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Contact