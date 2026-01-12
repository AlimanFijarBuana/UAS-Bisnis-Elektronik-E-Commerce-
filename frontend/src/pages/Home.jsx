import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Heart, RefreshCw, Truck, Headset, CheckCircle, Star, Mail, ArrowRight,
    Loader2, Sparkles, Clock, TrendingUp, Eye, Shield, Award, Zap, Gift, Crown,
    Package, Users, Send, Flame, X, Share2, Gem, Tag, Box, ChevronRight
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

import HeroIpadImage from '../assets/Ipad.png';
import MacbookAirImage from '../assets/Smarthome.png';
import SamsungS24Image from '../assets/Iphone.png';

const API_BASE_URL = 'http://localhost:8080';
const PLACEHOLDER_URL = `https://placehold.co/100x100?text=NO+IMG`;

const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
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

const apiService = {
    getProducts: async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = await fetch(`${API_BASE_URL}/product/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, products: [], error: 'Network or server error' };
        }
    },
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/categories`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, categories: [], error: 'Network or server error' };
        }
    }
};

const PremiumProductCard = ({ product, onProductClick, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    const productImageUrl = (product.image && product.image.startsWith('/'))
        ? `${API_BASE_URL}${product.image}`
        : 'https://dummyimage.com/400x400/f3f4f6/9ca3af&text=No+Image';

    const discount = Math.round(Math.random() * 40 + 10);
    const rating = (4.5 + Math.random() * 0.5).toFixed(1);
    const reviews = Math.floor(Math.random() * 500) + 50;

    return (
        <div 
            className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                    src={productImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://dummyimage.com/400x400/f3f4f6/9ca3af&text=No+Image'; }}
                />

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl">
                        -{discount}%
                    </span>
                    {Math.random() > 0.5 && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1">
                            <Flame className="w-3 h-3" />HOT
                        </span>
                    )}
                </div>

                <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                        className={`p-3 rounded-xl backdrop-blur-xl shadow-xl transition-all hover:scale-110 ${
                            isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                        className="p-3 bg-white/90 backdrop-blur-xl rounded-xl text-slate-700 shadow-xl hover:scale-110 transition-all"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-white/90 backdrop-blur-xl rounded-xl text-slate-700 shadow-xl hover:scale-110 transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 flex items-center justify-center gap-2 transition-all"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>

            <div className="p-6" onClick={() => onProductClick(product.id)}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {product.category_name || 'Electronics'}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-900">{rating}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-slate-700 transition-colors cursor-pointer">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-slate-900">
                            {formatPriceToIDR(product.price)}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                            {formatPriceToIDR(product.price * (1 + discount / 100))}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {reviews}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryCard = ({ category, index, onClick }) => {
    const gradients = [
        { bg: 'from-violet-500 to-purple-600', text: 'text-violet-100' },
        { bg: 'from-rose-500 to-pink-600', text: 'text-rose-100' },
        { bg: 'from-cyan-500 to-blue-600', text: 'text-cyan-100' },
        { bg: 'from-amber-500 to-orange-600', text: 'text-amber-100' },
        { bg: 'from-teal-500 to-emerald-600', text: 'text-teal-100' },
        { bg: 'from-fuchsia-500 to-pink-600', text: 'text-fuchsia-100' },
    ];

    const colorScheme = gradients[index % gradients.length];

    return (
        <div 
            onClick={onClick}
            className={`group relative bg-gradient-to-br ${colorScheme.bg} rounded-3xl p-8 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {category.image ? (
                        <img
                            src={`${API_BASE_URL}${category.image}`}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded-xl"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <Package className="w-8 h-8 text-white" />
                    )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform">
                    {category.name}
                </h3>
                <p className={`${colorScheme.text} mb-4 font-medium`}>
                    {Math.floor(Math.random() * 100) + 20}+ Products
                </p>
                <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Explore Now</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                </div>
            </div>
        </div>
    );
};

const DealCountdown = ({ title, discount, bgGradient, Icon }) => {
    const [time, setTime] = useState({ hours: 12, minutes: 34, seconds: 56 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative bg-gradient-to-br ${bgGradient} rounded-3xl p-8 text-white overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-500`}>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-black">{discount}</div>
                        <div className="text-sm opacity-90 font-semibold">Discount</div>
                    </div>
                </div>

                <h3 className="text-3xl font-black mb-2">{title}</h3>
                <p className="text-white/80 mb-6 font-medium">Limited time only, don't miss out!</p>

                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5" />
                    <div className="flex gap-2">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[3rem] text-center">
                            <span className="text-xl font-black">{String(time.hours).padStart(2, '0')}</span>
                        </div>
                        <span className="text-xl font-black">:</span>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[3rem] text-center">
                            <span className="text-xl font-black">{String(time.minutes).padStart(2, '0')}</span>
                        </div>
                        <span className="text-xl font-black">:</span>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[3rem] text-center">
                            <span className="text-xl font-black">{String(time.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-white text-slate-900 font-bold py-3.5 px-6 rounded-2xl hover:bg-slate-100 transition-all shadow-xl">
                    Shop Now
                </button>
            </div>
        </div>
    );
};

const SideFeaturedCard = ({ title, subtitle, displayPrice, bgColorClass, dummyImage, linkTo }) => (
    <a
        href={linkTo}
        className={`grid grid-cols-3 p-6 rounded-3xl shadow-xl border border-gray-100 h-[calc((500px-24px)/2)] overflow-hidden ${bgColorClass} cursor-pointer hover:shadow-indigo-200/50 transition-shadow duration-300`}
        onClick={(e) => { e.preventDefault(); window.location.href = linkTo; }}
    >
        <div className="col-span-2 flex flex-col justify-center pr-4">
            <p className="text-sm font-semibold text-gray-500 mb-1">{subtitle}</p>
            <h3 className="text-xl font-black text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">{title}</h3>
            <div className="flex items-baseline mb-3">
                <span className="text-lg font-black text-indigo-700">{displayPrice}</span>
            </div>
            <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2">
                View Details <ArrowRight className="w-3 h-3 ml-1" />
            </span>
        </div>
        <div className="col-span-1 h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
            <img
                src={dummyImage || PLACEHOLDER_URL}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        </div>
    </a>
);

const PremiumFeatureShowcase = ({ icon: Icon, title, description, stat, bgColor }) => (
    <div className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-300 transition-all duration-300 overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
        
        <div className="relative z-10 flex items-start space-x-4">
            <div className={`p-4 ${bgColor} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
                <h4 className="text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <div className="text-2xl font-black text-indigo-600">{stat}</div>
            </div>
        </div>
    </div>
);

const TestimonialCard = ({ name, role, content, rating, avatar }) => (
    <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-slate-900 transition-all duration-300 shadow-lg hover:shadow-2xl">
        <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            ))}
        </div>
        <p className="text-slate-700 text-lg leading-relaxed mb-6 font-medium">
            "{content}"
        </p>
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {avatar}
            </div>
            <div>
                <div className="font-black text-slate-900 text-lg">{name}</div>
                <div className="text-slate-600">{role}</div>
            </div>
        </div>
    </div>
);

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ isVisible: false, message: '' });

    const navigate = useNavigate();

    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const handleShopNowClick = useCallback(() => {
        navigate('/shop');
    }, [navigate]);

    const handleCategoryClick = useCallback((categoryName) => {
        // Navigate ke shop page dengan category filter
        navigate(`/shop?category=${encodeURIComponent(categoryName.toUpperCase())}`);
    }, [navigate]);

    const handleAddToCart = useCallback(async (product) => {
        if (!isAuthenticated) {
            setNotification({
                isVisible: true,
                message: "Please log in first to add items to your cart."
            });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await cartService.addToCart(product.id, 1, token);

            setNotification({
                isVisible: true,
                message: response.message || `${product.name} added to cart!`
            });

            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error('Error adding to cart:', err);
            setNotification({
                isVisible: true,
                message: err.message || 'Failed to add item to cart.'
            });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] = await Promise.all([
                    apiService.getProducts(),
                    apiService.getCategories()
                ]);

                if (productsResponse.success) {
                    setProducts(productsResponse.products.map(p => ({ ...p, unit: p.unit || 'Unit' })));
                }

                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.categories);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Error connecting to server.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-[1600px] mx-auto px-8 py-20">
                    <div className="flex flex-col justify-center items-center h-96 bg-white rounded-3xl shadow-2xl border border-slate-200">
                        <Loader2 className="w-16 h-16 animate-spin text-slate-900 mb-6" />
                        <p className="text-2xl font-bold text-slate-900">Loading Premium Experience...</p>
                        <p className="text-slate-600 mt-2">Preparing exclusive deals for you</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
            <Navbar />

            <CartNotification
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

                {error && (
                    <div className="my-6 p-6 bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6" />
                                <span className="font-semibold">{error}</span>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="text-red-800 hover:text-red-900 font-bold"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Hero Section - Original Style */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 pt-6">
                    {/* HERO UTAMA */}
                    <div
                        className="lg:col-span-2 bg-neutral-900 text-white rounded-3xl shadow-2xl overflow-hidden h-[500px] grid grid-cols-3 cursor-pointer"
                        onClick={handleShopNowClick}
                    >
                        <div className="col-span-2 p-12 flex flex-col justify-center relative">
                            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">Mobile & Tablets</p>
                            <h2 className="text-5xl font-extrabold mb-4 leading-tight">IPAD PRO 11</h2>
                            <p className="text-base text-gray-300 mb-8 line-clamp-3">
                                Performa grafis dan AI superior. Ditenagai chip M4 terbaru untuk kreasi tanpa batas.
                            </p>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-white">{formatPriceToIDR(32500000)}</span>
                                <span className="text-lg text-indigo-300 line-through ml-4 hidden sm:inline">{formatPriceToIDR(38990000)}</span>
                            </div>
                            <button
                                className="self-start bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-xl hover:shadow-indigo-500/50 uppercase tracking-wider"
                                onClick={handleShopNowClick}
                            >
                                Shop Now <ArrowRight className="w-5 h-5 ml-2 inline" />
                            </button>

                            <div className="absolute bottom-6 left-12 flex space-x-2">
                                <div className="w-8 h-2 bg-white rounded-full"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                            </div>
                        </div>

                        <div className="col-span-1 h-full flex items-center justify-center bg-white rounded-tl-3xl rounded-bl-3xl overflow-hidden">
                            <img
                                src={HeroIpadImage}
                                alt="iPad Pro 11"
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* SIDE FEATURED CARDS */}
                    <div className="lg:col-span-1 space-y-6">
                        <SideFeaturedCard
                            title="Smart Security Home Camera"
                            subtitle="Smart Home"
                            displayPrice={formatPriceToIDR(19500000)}
                            bgColorClass='bg-blue-100/50'
                            dummyImage={MacbookAirImage}
                            linkTo='/shop'
                        />
                        <SideFeaturedCard
                            title="Iphone 17 Pro"
                            subtitle="Mobile & Tablets"
                            displayPrice={formatPriceToIDR(14500000)}
                            bgColorClass='bg-stone-200/50'
                            dummyImage={SamsungS24Image}
                            linkTo='/shop'
                        />
                    </div>
                </section>

                {/* Premium Features - Original Style */}
                <section className="mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PremiumFeatureShowcase
                            icon={Truck}
                            title="Fast Delivery"
                            description="Express shipping worldwide"
                            stat="24-48h"
                            bgColor="bg-gradient-to-br from-teal-500 to-emerald-600"
                        />
                        <PremiumFeatureShowcase
                            icon={Shield}
                            title="Secure Payment"
                            description="100% protected transactions"
                            stat="SSL"
                            bgColor="bg-gradient-to-br from-indigo-500 to-purple-600"
                        />
                        <PremiumFeatureShowcase
                            icon={Award}
                            title="Premium Quality"
                            description="Authentic products only"
                            stat="100%"
                            bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
                        />
                        <PremiumFeatureShowcase
                            icon={Headset}
                            title="24/7 Support"
                            description="Always here to help"
                            stat="Live"
                            bgColor="bg-gradient-to-br from-rose-500 to-pink-600"
                        />
                    </div>
                </section>

                {/* Flash Deals */}
                <section className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-black text-slate-900 mb-4">Flash Deals & Promotions</h2>
                        <p className="text-xl text-slate-600">Limited time offers you can't miss</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DealCountdown
                            title="Flash Sale"
                            discount="50% OFF"
                            bgGradient="from-rose-500 via-pink-500 to-fuchsia-500"
                            Icon={Flame}
                        />
                        <DealCountdown
                            title="Weekend Deal"
                            discount="35% OFF"
                            bgGradient="from-slate-900 via-slate-800 to-slate-700"
                            Icon={Gift}
                        />
                        <DealCountdown
                            title="New Launch"
                            discount="40% OFF"
                            bgGradient="from-teal-500 via-cyan-500 to-blue-500"
                            Icon={Sparkles}
                        />
                    </div>
                </section>

                {/* Categories */}
                {categories.length > 0 && (
                    <section className="py-16">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-5xl font-black text-slate-900 mb-3">Explore Categories</h2>
                                <p className="text-xl text-slate-600">Shop by your favorite categories</p>
                            </div>
                            <button
                                onClick={handleShopNowClick}
                                className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl"
                            >
                                <span>View All</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.slice(0, 8).map((category, index) => (
                                <CategoryCard 
                                    key={category.id} 
                                    category={category} 
                                    index={index}
                                    onClick={() => handleCategoryClick(category.name)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Products */}
                <section className="py-16">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-5xl font-black text-slate-900">Trending Products</h2>
                                <p className="text-xl text-slate-600 mt-2">Most popular items this week</p>
                            </div>
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.slice(0, 8).map((product) => (
                                <PremiumProductCard
                                    key={product.id}
                                    product={product}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl shadow-2xl border border-slate-200">
                            <Package className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Products Available</h3>
                            <p className="text-slate-600 text-lg">Check back soon for new arrivals!</p>
                        </div>
                    )}
                </section>

                {/* Testimonials */}
                <section className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-black text-slate-900 mb-4">What Our Customers Say</h2>
                        <p className="text-xl text-slate-600">Trusted by thousands of happy shoppers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Sarah Johnson"
                            role="Verified Buyer"
                            content="Amazing quality and fast shipping! The products exceeded my expectations. Will definitely shop here again."
                            rating={5}
                            avatar="SJ"
                        />
                        <TestimonialCard
                            name="Michael Chen"
                            role="Premium Member"
                            content="Best online shopping experience I've had. Customer service is top-notch and prices are unbeatable."
                            rating={5}
                            avatar="MC"
                        />
                        <TestimonialCard
                            name="Emma Wilson"
                            role="Regular Customer"
                            content="Love the variety and quality. The website is easy to navigate and checkout is seamless. Highly recommend!"
                            rating={5}
                            avatar="EW"
                        />
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-16 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.2),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.2),transparent_50%)]" />
                        
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-6xl font-black mb-3">50K+</div>
                                <div className="text-slate-300 text-lg">Happy Customers</div>
                            </div>
                            <div>
                                <div className="text-6xl font-black mb-3">100+</div>
                                <div className="text-slate-300 text-lg">Premium Products</div>
                            </div>
                            <div>
                                <div className="text-6xl font-black mb-3">4.9</div>
                                <div className="text-slate-300 text-lg">Average Rating</div>
                            </div>
                            <div>
                                <div className="text-6xl font-black mb-3">24/7</div>
                                <div className="text-slate-300 text-lg">Customer Support</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16">
                    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden p-16">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />
                        </div>
                        
                        <div className="relative z-10 text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
                                <Mail className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-5xl font-black text-white mb-6">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="text-xl text-slate-300 mb-10">
                                Get exclusive deals, new arrivals, and special promotions delivered to your inbox
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 w-full px-8 py-5 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all text-lg"
                                />
                                <button className="w-full sm:w-auto bg-white text-slate-900 font-bold px-10 py-5 rounded-2xl hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-3 group">
                                    <span>Subscribe</span>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="py-16">
                    <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-slate-200">
                        <div className="text-center mb-12">
                            <h3 className="text-4xl font-black text-slate-900 mb-3">Why Shop With Us?</h3>
                            <p className="text-xl text-slate-600">Your trusted partner in premium shopping</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                            {[
                                { icon: CheckCircle, text: "Verified Products", color: "from-emerald-500 to-teal-600" },
                                { icon: Shield, text: "Secure Checkout", color: "from-blue-500 to-cyan-600" },
                                { icon: Truck, text: "Fast Shipping", color: "from-purple-500 to-pink-600" },
                                { icon: RefreshCw, text: "Easy Returns", color: "from-amber-500 to-orange-600" },
                                { icon: Award, text: "Best Quality", color: "from-rose-500 to-pink-600" }
                            ].map((item, index) => (
                                <div key={index} className="text-center group cursor-pointer">
                                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all`}>
                                        <item.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                        {item.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 pb-24">
                    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.3),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.3),transparent_50%)]" />
                        
                        <div className="relative z-10 p-20 text-center text-white">
                            <h2 className="text-6xl font-black mb-8">Ready to Start Shopping?</h2>
                            <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
                                Join thousands of satisfied customers and experience premium online shopping today
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={handleShopNowClick}
                                    className="bg-white text-slate-900 font-bold px-12 py-5 rounded-2xl hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 text-lg"
                                >
                                    Browse Products
                                </button>
                                <button className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-12 py-5 rounded-2xl hover:bg-white/20 transition-all text-lg">
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}