import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    CheckCircle, Package, Truck, Clock, 
    ArrowLeft, Download, Home, Mail, XCircle 
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';

const PRIMARY_COLOR = 'indigo';
// Durasi penundaan dalam milidetik (20 detik)
const REDIRECT_DELAY_MS = 20000; 

const formatPriceToIDR = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export default function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    // State baru untuk hitungan mundur
    const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000); 

    useEffect(() => {
        let timer;
        let countdownInterval;

        if (location.state && Object.keys(location.state).length > 0) {
            setOrderData(location.state);
            setLoading(false);
            
            // 1. Mulai Hitungan Mundur
            setCountdown(REDIRECT_DELAY_MS / 1000);
            countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // 2. Mulai Timer Redirect
            timer = setTimeout(() => {
                navigate('/orders', { replace: true });
            }, REDIRECT_DELAY_MS);
            
        } else {
            setLoading(false); 
        }

        // Cleanup function
        return () => {
            clearTimeout(timer);
            clearInterval(countdownInterval);
        };
    }, [location, navigate]);


    const handlePrint = () => {
        window.print();
    };

    const handleTrackOrder = () => {
        if (orderData?.orderId) {
            // Hentikan redirect otomatis jika user melakukan aksi manual
            navigate(`/order-tracking/${orderData.orderId}`);
        }
    };
    
    // Tambahkan fungsi untuk membatalkan redirect
    const handleGoHome = () => {
        navigate('/');
    };

    // Fungsi untuk membatalkan otomatisasi dan langsung navigasi
    const handleCancelAutoRedirect = (path) => {
        // Karena timer dan interval di-cleanup saat komponen unmount/navigate, 
        // kita hanya perlu memanggil navigate()
        navigate(path);
    };

    // --- Loading State UI ---
    if (loading) {
        return (
            // ... (Kode UI Loading tetap sama) ...
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    // --- Data Not Found / Manual Redirect State UI ---
    if (!orderData) {
        return (
            // ... (Kode UI Not Found tetap sama) ...
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                    <div className="text-center bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                            Order Data Not Found
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            We couldn't retrieve your order details. Please go back to the home page to start a new transaction.
                        </p>
                        <button
                            onClick={handleGoHome}
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back to Home
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // --- Success State UI ---
    const { orderNumber, totalAmount, orderId } = orderData;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <CheckCircle className="w-24 h-24 text-green-500" />
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Order Confirmed!
                    </h1>
                    
                    {/* ✅ NOTIFIKASI COUNTDOWN */}
                    <p className="text-xl font-medium text-gray-800 mb-4">
                        Redirecting to **Orders History** in <span className='text-indigo-600 font-bold'>{countdown}</span> seconds...
                    </p>
                    {/* END NOTIFIKASI COUNTDOWN */}
                    
                    <p className="text-xl text-gray-600 mb-2">
                        Thank you for your purchase
                    </p>
                    <p className="text-gray-500">
                        We've sent an order confirmation to your email
                    </p>
                </div>

                {/* Order Summary Card (Tetap Sama) */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <Package className="w-6 h-6 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                            </div>
                            <div className="space-y-2 text-gray-600">
                                <p><strong className="text-gray-900">Order Number:</strong><br />{orderNumber}</p>
                                <p><strong className="text-gray-900">Order ID:</strong><br />#{orderId}</p>
                                <p><strong className="text-gray-900">Date:</strong><br />{new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                            </div>
                            <div className="space-y-2 text-gray-600">
                                <p><strong className="text-gray-900">Status:</strong><br />
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Paid
                                    </span>
                                </p>
                                <p><strong className="text-gray-900">Method:</strong><br />Bank Transfer</p>
                                <p><strong className="text-gray-900">Total Amount:</strong><br />
                                    <span className="text-lg font-bold text-rose-600">
                                        {formatPriceToIDR(totalAmount)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <Truck className="w-6 h-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
                            </div>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <Mail className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Check your email for order confirmation</span>
                                </div>
                                <div className="flex items-start">
                                    <Clock className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Order will be processed within 24 hours</span>
                                </div>
                                <div className="flex items-start">
                                    <Truck className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Shipping updates will be sent via email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Timeline (Tetap Sama) */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Order Timeline</h3>
                    
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 transform -translate-x-1/2"></div>
                        
                        <div className="space-y-6">
                            {/* Step 1 - Order Placed */}
                            <div className="relative flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center z-10">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Order Placed</h4>
                                    <p className="text-gray-600 mt-1">Your order has been successfully received</p>
                                    <p className="text-sm text-gray-500 mt-1">Just now</p>
                                </div>
                            </div>

                            {/* Step 2 - Processing */}
                            <div className="relative flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center z-10">
                                    <Package className="w-4 h-4 text-white" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Processing</h4>
                                    <p className="text-gray-600 mt-1">We're preparing your order for shipment</p>
                                    <p className="text-sm text-gray-500 mt-1">Expected: Within 24 hours</p>
                                </div>
                            </div>

                            {/* Step 3 - Shipped */}
                            <div className="relative flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center z-10">
                                    <Truck className="w-4 h-4 text-white" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Shipped</h4>
                                    <p className="text-gray-600 mt-1">Your order is on the way to you</p>
                                    <p className="text-sm text-gray-500 mt-1">Updates will be sent via email</p>
                                </div>
                            </div>

                            {/* Step 4 - Delivered */}
                            <div className="relative flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center z-10">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Delivered</h4>
                                    <p className="text-gray-600 mt-1">Your order has been delivered</p>
                                    <p className="text-sm text-gray-500 mt-1">We'll notify you upon delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        // Menggunakan handleCancelAutoRedirect untuk membatalkan timer
                        onClick={() => handleCancelAutoRedirect('/shop')} 
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </button>
                    
                    <button
                        // Menggunakan handleCancelAutoRedirect untuk membatalkan timer
                        onClick={handleTrackOrder} 
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                    </button>
                    
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Print Receipt
                    </button>
                    
                    <button
                        // Menggunakan handleCancelAutoRedirect untuk membatalkan timer dan langsung ke Orders
                        onClick={() => handleCancelAutoRedirect('/orders')} 
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        View All Orders (Now)
                    </button>
                </div>

                {/* Help Section (Tetap Sama) */}
                <div className="mt-12 text-center">
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">
                            Need Help?
                        </h4>
                        <p className="text-blue-700 mb-4">
                            Our customer service team is here to help with any questions
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a 
                                href="mailto:support@onlinestore.com"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Email Support
                            </a>
                            <span className="text-blue-400 hidden sm:block">•</span>
                            <span className="text-blue-600 font-medium">
                                📞 +62 21-1234-5678
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Print Styles (Tetap Sama) */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    body {
                        background: white !important;
                    }
                    
                    .bg-gray-50 {
                        background: white !important;
                    }
                    
                    .shadow-xl, .shadow-lg {
                        box-shadow: none !important;
                        border: 1px solid #000 !important;
                    }
                }
            `}</style>
        </div>
    );
}