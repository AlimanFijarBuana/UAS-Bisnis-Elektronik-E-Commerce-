import React from 'react';
import { Mail, Package2 } from 'lucide-react';

const Footer = () => (
    /* Footer Section - Clean & Detailed */
    <footer className="bg-white border-t border-gray-100 mt-32">
        {/* CTA Email Strip */}
        <div className="bg-neutral-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                <div className="max-w-md mb-6 md:mb-0">
                    <h4 className="text-3xl font-black text-white mb-2">Join Our Newsletter</h4>
                    <p className="text-sm text-gray-400">Register to receive information about the latest offers, discount codes, and exclusive deals.</p>
                </div>
                <div className="flex w-full md:w-auto space-x-3">
                    <div className="relative w-full md:w-96">
                        <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full p-4 pl-12 rounded-full text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full transition-colors duration-300 whitespace-nowrap uppercase tracking-wider">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>

        {/* Footer Links and Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 lg:grid-cols-5 gap-10 text-neutral-800">
            {/* Col 1: Help & Support */}
            <div className="col-span-2 lg:col-span-2">
                <h5 className="text-xl font-black mb-6 text-neutral-900">DigitalPoint</h5>
                <p className="text-base text-gray-600 mb-6">
                    The future of premium electronics. Curated for performance, designed for life.
                </p>
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-semibold text-neutral-900 w-16 flex-shrink-0">Address:</span> 585 Market Street, Las Vegas, LA
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-semibold text-neutral-900 w-16 flex-shrink-0">Phone:</span> (546) 512-7856
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                        <span className="font-semibold text-neutral-900 w-16 flex-shrink-0">Email:</span> support@DigitalPoint.com
                    </p>
                </div>
                <div className="flex space-x-4 mt-6">
                    <a href="#" className="p-2 border rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-600 transition-colors"><Mail className="w-5 h-5" /></a>
                    <a href="#" className="p-2 border rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-600 transition-colors"><Package2 className="w-5 h-5" /></a>
                </div>
            </div>

            {/* Col 2: Account */}
            <div>
                <h5 className="text-lg font-black mb-6 text-neutral-900">Account</h5>
                <ul className="space-y-3 text-base text-gray-600">
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">My Profile</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Order History</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Wishlist</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Track Order</a></li>
                </ul>
            </div>

            {/* Col 3: Quick Link */}
            <div>
                <h5 className="text-lg font-black mb-6 text-neutral-900">Information</h5>
                <ul className="space-y-3 text-base text-gray-600">
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Refund Policy</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Use</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQ's</a></li>
                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
                </ul>
            </div>

            {/* Col 4: Download App - Menggunakan Unsplash */}
            <div className='hidden lg:block'>
                <h5 className="text-lg font-black mb-6 text-neutral-900">Download App</h5>
                <div className="space-y-4">
                    <img src="https://images.unsplash.com/photo-1612984587560-6131c93f0b2a?auto=format&fit=crop&w=170&h=50&q=80" alt="App Store" className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow object-cover" />
                    <img src="https://images.unsplash.com/photo-1612984587560-6131c93f0b2a?auto=format&fit=crop&w=170&h=50&q=80" alt="Google Play" className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow object-cover" />
                </div>
            </div>
        </div>

        {/* Footer Bottom Bar (Copyright and Payment) */}
        <div className="border-t border-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p className="mb-2 md:mb-0">
                    Copyright © 2025. All rights reserved by DigitalPoint.
                </p>
            </div>
        </div>
    </footer>
);

export default Footer;