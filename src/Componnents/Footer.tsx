import React from 'react'
import { Car, MapPin, Phone, Mail, Shield, Clock, CreditCard } from 'lucide-react'

const Footer: React.FC = () => {
    return (
        <footer className="footer sm:footer-horizontal bg-gradient-to-br from-white-900 to-white-800 text-black-900 p-10 border-t-4 border-yellow-500">
            <aside>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-5000 rounded-lg">
                        <Car className="text-blue-9000" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">RentMoti.com</h2>
                        <p className="text-sm text-blue-2000">Your Journey, Our Priority</p>
                    </div>
                </div>
                <p className="text-blue-1000 max-w-xs">
                    Kenya's premier car rental service offering quality vehicles 
                    at affordable rates. Experience the freedom of the road with 
                    RentMoti.
                </p>
            </aside>
            <nav>
                <h6 className="footer-title text-yellow-4000 flex items-center gap-2">
                    <MapPin size={18} />
                    Quick Links
                </h6>
                <a className="link link-hover text-blue-1000 hover:text-yellow-400 transition-colors">Browse Vehicles</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-400 transition-colors">Our Locations</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-400 transition-colors">Special Deals</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-400 transition-colors">Additional Services</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-400 transition-colors">FAQ</a>
            </nav>
            <nav>
                <h6 className="footer-title text-yellow-4000 flex items-center gap-2">
                    <Car size={18} />
                    Our Services
                </h6>
                <a className="link link-hover text-blue-1000 hover:text-yellow-4000 transition-colors">Daily Rental</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-4000 transition-colors">Long Term Rental</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-4000 transition-colors">Airport Pickup</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-4000 transition-colors">Corporate Programs</a>
                <a className="link link-hover text-blue-1000 hover:text-yellow-4000 transition-colors">Chauffeur Service</a>
            </nav>
            <nav>
                <h6 className="footer-title text-yellow-4000 flex items-center gap-2">
                    <Phone size={18} />
                    Contact Us
                </h6>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-yellow-4000" />
                        <span className="text-blue-1000">+254 700 123 456</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-yellow-4000" />
                        <span className="text-blue-1000">support@rentmoti.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-4000" />
                        <span className="text-blue-1000">24/7 Customer Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-yellow-4000" />
                        <span className="text-blue-1000">Nairobi, Mombasa, Kisumu</span>
                    </div>
                </div>
                <div className="mt-6">
                    <h6 className="footer-title text-yellow-4000 flex items-center gap-2">
                        <Shield size={18} />
                        Trust & Security
                    </h6>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-yellow-4000" />
                            <span className="text-blue-1000">Fully Insured Vehicles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-yellow-4000" />
                            <span className="text-blue-1000">Secure Payment Processing</span>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="col-span-4 border-t border-blue-7000 pt-6 mt-6 text-center">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-6">
                        <a className="text-blue-2000 hover:text-yellow-4000 text-sm transition-colors">Terms of Service</a>
                        <a className="text-blue-2000 hover:text-yellow-4000 text-sm transition-colors">Privacy Policy</a>
                        <a className="text-blue-2000 hover:text-yellow-4000 text-sm transition-colors">Cookie Policy</a>
                        <a className="text-blue-2000 hover:text-yellow-4000 text-sm transition-colors">Sitemap</a>
                    </div>
                    <div className="flex items-center gap-2 text-blue-2000 text-sm">
                        <span>🚗</span>
                        <span>Drive Safe, Drive Smart with RentMoti</span>
                    </div>
                </div>
                <p className="text-sm text-blue-2000 mt-4">
                    © {new Date().getFullYear()} RentMoti.com. All rights reserved.
                    <br />
                    Proudly serving Kenya since 2015
                </p>
            </div>
        </footer>
    )
}

export default Footer