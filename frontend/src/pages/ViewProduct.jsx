import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Heart, Truck, Headset, CheckCircle, Star,
    Package, ArrowLeft, Loader2, RefreshCw, Shield, Clock,
    Zap, Battery, Camera, Cpu, HardDrive, Monitor,
    Share2, Minus, Plus, ChevronLeft, ChevronRight, Tags, X, Scale,
    Award, TrendingUp, Globe, Lock, Gift
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

const API_BASE_URL = 'http://localhost:8080';
const PRIMARY_COLOR = 'indigo';

const apiService = {
    getProductDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching product detail:', error);
            return { success: false, error: 'Network or server error' };
        }
    }
};

const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const formatWeight = (weight) => {
    const numWeight = typeof weight === 'string' ? Number(weight) : weight;
    if (numWeight >= 1000) {
        return (numWeight / 1000).toFixed(2) + ' kg';
    } else {
        return numWeight + ' g';
    }
};

const CartNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isError = message.includes("Please log in") || message.includes("Failed to");

    return (
        <div className="fixed top-24 right-8 z-50 animate-slide-in">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                isError 
                    ? 'bg-red-500/95 border-red-300/50' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300/50'
            }`}>
                {isError ? <Shield className="w-5 h-5 text-white" /> : <CheckCircle className="w-5 h-5 text-white" />}
                <span className="text-white font-semibold">{message}</span>
                <button onClick={onClose} className="ml-2 text-white/80 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [notification, setNotification] = useState({ isVisible: false, message: '' });
    const [activeTab, setActiveTab] = useState('overview');

    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    useEffect(() => {
        const loadProductDetail = async () => {
            try {
                setLoading(true);
                setError('');
                
                const response = await apiService.getProductDetail(id);
                
                if (response.success && response.product) {
                    setProduct(response.product);
                } else {
                    setError(response.error || 'Product not found');
                    setProduct(null);
                }
            } catch (error) {
                console.error('Error loading product detail:', error);
                setError('Error connecting to server. Please try again.');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProductDetail();
        }
    }, [id]);

    const handleAddToCart = useCallback(async () => {
        if (!isAuthenticated) {
            setNotification({
                isVisible: true,
                message: "Please log in first to add items to your cart."
            });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        if (!product) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const productId = product.id;
            const itemUnit = product.unit || 'Unit';

            const response = await cartService.addToCart(productId, quantity, token);
            
            if (response.success) {
                setNotification({
                    isVisible: true,
                    message: response.message || `${quantity} ${itemUnit} ${product.name} successfully added to cart!`
                });
                
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                setNotification({
                    isVisible: true,
                    message: response.message || 'Failed to add item to cart.'
                });
            }
            
        } catch (err) {
            console.error('Error adding to cart:', err);
            setNotification({
                isVisible: true,
                message: 'Network or server error. Failed to add item to cart.'
            });
        }
    }, [isAuthenticated, product, quantity, navigate]);

    const handleBuyNow = useCallback(async () => {
        if (!isAuthenticated) {
            setNotification({
                isVisible: true,
                message: "Please log in first to proceed to checkout."
            });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        await handleAddToCart();
        navigate('/cart');
    }, [isAuthenticated, handleAddToCart, navigate]);

    const handleShare = () => {
        if (product) {
            navigator.clipboard.writeText(window.location.href);
            setNotification({
                isVisible: true,
                message: `Product link copied to clipboard!`
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="w-full">
                    <div className="flex flex-col justify-center items-center h-96 bg-white">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                        <p className="text-xl font-bold text-indigo-600">Loading Product Details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="w-full px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-3xl mx-auto text-center p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Product Not Found!</h3>
                        <p className="text-gray-600 mb-6">We could not locate the product with ID: {id}</p>
                        {error && <p className="text-red-500 text-sm mb-6 font-medium border border-red-200 p-3 rounded-xl bg-red-50">{error}</p>}
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const productImages = product.images || [product.image];
    
    const discountedPrice = product.price;
    const discountRate = 0.15;
    const originalPrice = Math.round(discountedPrice / (1 - discountRate));

    const defaultFeatures = [
        { icon: Truck, text: 'Fast & Free Shipping' },
        { icon: RefreshCw, text: '30-Day Easy Returns' },
        { icon: Shield, text: '2 Year Official Warranty' },
        { icon: Headset, text: '24/7 Priority Support' }
    ];

    const featuresList = product.features && product.features.length > 0
        ? product.features
        : defaultFeatures;

    const productDetails = product.details && product.details.length > 0 
        ? product.details 
        : [
            { icon: Cpu, label: 'Processor', value: 'Information not available' },
            { icon: Zap, label: 'RAM', value: 'Information not available' },
            { icon: HardDrive, label: 'Storage', value: 'Information not available' },
            { icon: Monitor, label: 'Display', value: 'Information not available' }
        ];

    const premiumFeatures = [
        { icon: Truck, title: 'Express Delivery', desc: 'Same-day in major cities' },
        { icon: Shield, title: 'Premium Warranty', desc: '2-year coverage included' },
        { icon: RefreshCw, title: 'Easy Returns', desc: '30-day money back' },
        { icon: Headset, title: 'VIP Support', desc: 'Priority assistance' },
        { icon: Gift, title: 'Gift Packaging', desc: 'Complimentary service' },
        { icon: Lock, title: 'Secure Payment', desc: 'Protected checkout' }
    ];

    const trustBadges = [
        { icon: Award, text: 'Authorized Reseller' },
        { icon: CheckCircle, text: 'Genuine Products' },
        { icon: Globe, text: 'Global Warranty' },
        { icon: TrendingUp, text: 'Best Seller 2024' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
            <Navbar />
            
            <CartNotification 
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="w-full">
                {/* Breadcrumb Navigation */}
                <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-slate-900 flex items-center font-semibold transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                            <span>Back to Collection</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl flex justify-between items-center">
                            <span className="font-medium">⚠️ {error}</span>
                            <button onClick={() => setError('')} className="text-yellow-700 hover:text-yellow-900 font-bold ml-4">✕</button>
                        </div>
                    </div>
                )}

                {/* Hero Section - Premium Layout */}
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                        {/* Image Gallery - Takes 7 columns */}
                        <div className="lg:col-span-7">
                            <div className="lg:sticky lg:top-28">
                                {/* Main Image */}
                                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl overflow-hidden mb-6 aspect-[4/3] group">
                                    <img
                                        src={productImages[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    
                                    {/* Premium Badge */}
                                    <div className="absolute top-6 left-6 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold text-sm shadow-xl flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-white" />
                                        SAVE 15%
                                    </div>

                                    {/* Navigation Arrows */}
                                    {productImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setSelectedImage((prev) => prev > 0 ? prev - 1 : productImages.length - 1)}
                                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-slate-700" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedImage((prev) => prev < productImages.length - 1 ? prev + 1 : 0)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                                            >
                                                <ChevronRight className="w-6 h-6 text-slate-700" />
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Like & Share Buttons */}
                                    <div className="absolute top-6 right-6 flex gap-3">
                                        <button 
                                            onClick={() => setIsLiked(!isLiked)}
                                            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                                        </button>
                                        <button 
                                            onClick={handleShare}
                                            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <Share2 className="w-5 h-5 text-slate-700" />
                                        </button>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {productImages.length > 1 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {productImages.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`relative bg-slate-100 rounded-2xl overflow-hidden aspect-[4/3] transition-all duration-300 ${
                                                    selectedImage === index 
                                                        ? 'ring-4 ring-slate-900 shadow-xl scale-105' 
                                                        : 'hover:ring-2 ring-slate-300 hover:scale-102'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} view ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info - Takes 5 columns */}
                        <div className="lg:col-span-5">
                            <div className="lg:sticky lg:top-28">
                                {/* Category Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold mb-6">
                                    <Package className="w-4 h-4" />
                                    {product.category_name || 'PRODUCT'}
                                </div>

                                {/* Product Title */}
                                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                    {product.name}
                                </h1>

                                {/* Rating & Reviews */}
                                <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                        <span className="text-lg font-bold text-slate-900">{product.rating || 0}</span>
                                    </div>
                                    <span className="text-slate-600">({(product.reviews || 0).toLocaleString()} reviews)</span>
                                    <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                                        <CheckCircle className="w-5 h-5" />
                                        {product.stock || 0} in stock
                                    </div>
                                    {product.weight && (
                                        <>
                                            <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                                            <span className="text-slate-600 font-semibold flex items-center">
                                                <Scale className="w-4 h-4 mr-1" />
                                                {formatWeight(product.weight)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Pricing */}
                                <div className="mb-10">
                                    <div className="flex items-baseline gap-4 mb-2 flex-wrap">
                                        <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                            {formatPriceToIDR(discountedPrice)}
                                        </span>
                                        <span className="text-2xl text-slate-400 line-through font-medium">
                                            {formatPriceToIDR(originalPrice)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600">Inclusive of all taxes • Free shipping</p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                                        Quantity
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <button 
                                                className="p-4 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 1, parseInt(e.target.value) || 1)))}
                                                className="w-16 text-center text-xl font-bold text-slate-900 focus:outline-none bg-transparent appearance-none"
                                                min="1"
                                                max={product.stock || 1}
                                            />
                                            <button 
                                                className="p-4 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30"
                                                onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
                                                disabled={quantity >= (product.stock || 1)}
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <span className="text-slate-600 font-medium">{product.unit || 'Unit'}</span>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                    <button
                                        onClick={handleAddToCart}
                                        className="px-8 py-5 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                                    >
                                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="px-8 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-2xl hover:shadow-2xl transition-all shadow-xl shadow-slate-900/30 hover:scale-105"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
                                    {trustBadges.map((badge, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <badge.icon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{badge.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Premium Services Highlight */}
                                <div className="space-y-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
                                    <h3 className="font-bold text-lg mb-4">Premium Benefits</h3>
                                    {premiumFeatures.slice(0, 3).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{feature.title}</div>
                                                <div className="text-sm text-white/70">{feature.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Description with Tabs */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200">
                            <div className="flex gap-6 mb-8 border-b border-slate-200 overflow-x-auto">
                                {['overview', 'specifications'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-4 px-2 font-bold capitalize transition-colors relative whitespace-nowrap ${
                                            activeTab === tab 
                                                ? 'text-slate-900' 
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Product Overview</h2>
                                    <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                                        {product.description || "No description available for this product."}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {productDetails.map((detail, index) => (
                                            <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                                        <detail.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                        {detail.label}
                                                    </span>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900 ml-13">
                                                    {detail.value}
                                                </p>
                                            </div>
                                        ))}
                                        {product.weight && (
                                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                                        <Scale className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                        Weight
                                                    </span>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900 ml-13">
                                                    {formatWeight(product.weight)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Premium Services */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-xl border border-slate-200 lg:sticky lg:top-28">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Us</h3>
                                <div className="space-y-4">
                                    {premiumFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 mb-1">{feature.title}</div>
                                                <div className="text-sm text-slate-600">{feature.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}