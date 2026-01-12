import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Menu, X, ShoppingCart, User, Search, ChevronDown, Heart, Package2, List, 
    Laptop, Watch, Smartphone, Grid3X3, Package, Bell, MapPin, Phone,
    Settings, LogOut, UserCircle, Crown, Zap, TrendingUp, Gift, Star,
    Percent, Tag, Flame, ShoppingBag, Award, Shield, Headset
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; 
import { cartService } from '../services/CartService'; 

export const HEADER_HEIGHT_PADDING = "pt-[140px]"; 

const API_BASE_URL = 'http://localhost:8080'; 

// =========================================================
// HELPER FUNCTIONS
// =========================================================
const getInitials = (name) => {
    if (!name) return 'AC'; 
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
        return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'AC';
};

// =========================================================
// NAVIGATION DATA
// =========================================================
const mainNavLinks = [
    { title: 'New Arrivals', href: '/shop', icon: Star, special: true },
    { title: 'Best Sellers', href: '/best', icon: TrendingUp },
    { title: 'Categories', href: '#', isDropdown: true },
    { title: 'Deals', href: '/deals', icon: Percent, badge: 'SALE', badgeColor: 'rose' },
    { title: 'Blog', href: '/blog' },
    { title: 'Contact', href: '/contact', icon: Headset },
];

// =========================================================
// PREMIUM SEARCH BAR (TOP LAYER)
// =========================================================
const PremiumSearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative flex-1 max-w-3xl">
            <div className={`relative flex items-center transition-all duration-300 ${
                isFocused ? 'scale-[1.02]' : ''
            }`}>
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    isFocused 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl' 
                        : 'bg-transparent'
                }`} />
                
                <div className={`relative w-full flex items-center bg-white rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                    isFocused ? 'border-indigo-500 shadow-indigo-200/50' : 'border-gray-200'
                }`}>
                    <div className={`pl-5 transition-colors duration-300 ${isFocused ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search for products, brands, categories..."
                        className="flex-1 px-4 py-4 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button className="m-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// QUICK LINKS (TOP RIGHT ICONS)
// =========================================================
const QuickLink = ({ icon: Icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="group flex flex-col items-center space-y-1 hover:scale-110 transition-transform duration-300"
    >
        <div className="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 group-hover:border-indigo-300 group-hover:shadow-lg transition-all duration-300">
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
        </div>
        <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">
            {label}
        </span>
    </button>
);

// =========================================================
// CATEGORIES MEGA MENU
// =========================================================
const CategoriesMegaMenu = ({ categories, isOpen, onClose }) => {
    if (!isOpen || categories.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-xl">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black mb-1">Shop by Category</h3>
                                <p className="text-sm text-indigo-100">Explore our premium collections</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                        {categories.map((category, index) => {
                            const gradients = [
                                'from-violet-500 to-purple-600',
                                'from-rose-500 to-pink-600',
                                'from-cyan-500 to-blue-600',
                                'from-amber-500 to-orange-600',
                                'from-teal-500 to-emerald-600',
                                'from-fuchsia-500 to-pink-600',
                            ];
                            const gradient = gradients[index % gradients.length];

                            return (
                                <Link
                                    key={category.id}
                                    to={`/shop?category=${encodeURIComponent(category.name.toUpperCase())}`}
                                    onClick={onClose}
                                    className="group"
                                >
                                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                                        <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                            <Package className="w-7 h-7 text-white" />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 text-center mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {category.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 text-center">
                                            {Math.floor(Math.random() * 50) + 10}+ items
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Featured Banner */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">Authentic Products</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-semibold text-gray-700">Fast Delivery</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Award className="w-5 h-5 text-rose-600" />
                                    <span className="text-sm font-semibold text-gray-700">Premium Quality</span>
                                </div>
                            </div>
                            <Link 
                                to="/shop" 
                                onClick={onClose}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                            >
                                View All Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// NAV LINK WITH DROPDOWN (BOTTOM LAYER)
// =========================================================
const NavLink = ({ link, onDropdownToggle, isDropdownOpen }) => {
    const [isHovered, setIsHovered] = useState(false);
    const LinkComponent = link.href && link.href.startsWith('/') ? Link : 'div';
    const isActive = isDropdownOpen && link.isDropdown;

    const content = (
        <div 
            className={`group relative flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                link.special 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl' 
                    : isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={link.isDropdown ? onDropdownToggle : undefined}
        >
            {link.icon && <link.icon className="w-4 h-4" />}
            <span>{link.title}</span>
            {link.badge && (
                <span className={`px-2 py-0.5 ${
                    link.badgeColor === 'rose' 
                        ? 'bg-rose-500' 
                        : 'bg-indigo-600'
                } text-white text-xs font-black rounded-full animate-pulse`}>
                    {link.badge}
                </span>
            )}
            {link.isDropdown && (
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
            )}
            
            {!link.special && !isActive && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ${
                    isHovered ? 'scale-x-100' : 'scale-x-0'
                }`} />
            )}
        </div>
    );

    if (link.isDropdown || !link.href || link.href === '#') {
        return content;
    }

    return (
        <LinkComponent to={link.href}>
            {content}
        </LinkComponent>
    );
};

// =========================================================
// USER PROFILE MENU (TOP LAYER)
// =========================================================
const UserProfileMenu = ({ user, isAdmin, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const userDisplayName = user?.username || 'Account';
    const initials = getInitials(user?.username);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                        {initials}
                    </div>
                    {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            <Crown className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>
                <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-gray-500">Hello,</p>
                    <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {userDisplayName}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl border-2 border-white/30">
                                {initials}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-lg">{userDisplayName}</p>
                                <p className="text-sm text-indigo-100">{user?.email || 'Premium Member'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-3">
                        <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserCircle className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600">My Profile</p>
                                <p className="text-xs text-gray-500">Account settings</p>
                            </div>
                        </Link>

                        <Link
                            to="/orders"
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-teal-600">My Orders</p>
                                <p className="text-xs text-gray-500">Track orders</p>
                            </div>
                        </Link>

                        <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-rose-600">Wishlist</p>
                                <p className="text-xs text-gray-500">Saved items</p>
                            </div>
                        </Link>

                        {isAdmin && (
                            <>
                                <div className="my-3 border-t border-gray-100" />
                                <Link
                                    to="/admin"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-amber-600">Admin Dashboard</p>
                                        <p className="text-xs text-amber-600/70">Manage store</p>
                                    </div>
                                </Link>
                            </>
                        )}

                        <div className="my-3 border-t border-gray-100" />

                        <button
                            onClick={() => { onLogout(); setIsOpen(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900 group-hover:text-red-600">Log Out</p>
                                <p className="text-xs text-gray-500">See you soon!</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// =========================================================
// CART BUTTON (TOP LAYER)
// =========================================================
const CartButton = ({ count }) => (
    <Link to="/cart" className="relative group">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
            <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                {count > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {count > 9 ? '9+' : count}
                    </div>
                )}
            </div>
            <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-gray-500">Shopping</p>
                <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Cart
                </p>
            </div>
        </div>
    </Link>
);

// =========================================================
// MOBILE MENU
// =========================================================
const MobileMenu = ({ isOpen, onClose, categories, isAuthenticated, user, onLogout, cartCount }) => {
    const userDisplayName = user?.username || 'Guest';
    const initials = getInitials(user?.username);
    const isAdmin = user?.role === 'admin';

    return (
        <div className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Package2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-black">DigitalPoint</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* User Info */}
                {isAuthenticated && (
                    <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-black text-xl">
                            {initials}
                        </div>
                        <div>
                            <p className="font-black text-lg">{userDisplayName}</p>
                            <p className="text-sm text-indigo-100">Premium Member</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-200px)] p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to="/cart"
                        onClick={onClose}
                        className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingCart className="w-6 h-6 text-indigo-600" />
                            {cartCount > 0 && (
                                <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-bold text-gray-900">My Cart</p>
                    </Link>

                    <Link
                        to="/orders"
                        onClick={onClose}
                        className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 hover:shadow-lg transition-all"
                    >
                        <Package className="w-6 h-6 text-teal-600 mb-2" />
                        <p className="text-sm font-bold text-gray-900">My Orders</p>
                    </Link>
                </div>

                {/* Navigation */}
                <div>
                    <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center">
                        <Grid3X3 className="w-4 h-4 mr-2 text-indigo-600" />
                        Navigation
                    </h3>
                    <div className="space-y-2">
                        {mainNavLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.href || '/shop'}
                                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all group"
                                onClick={onClose}
                            >
                                <div className="flex items-center space-x-3">
                                    {link.icon && <link.icon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />}
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">
                                        {link.title}
                                    </span>
                                </div>
                                {link.badge && (
                                    <span className={`px-2 py-1 ${
                                        link.badgeColor === 'rose' ? 'bg-rose-500' : 'bg-indigo-600'
                                    } text-white text-xs font-bold rounded-full`}>
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h3 className="text-sm font-black text-gray-900 mb-3">Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.slice(0, 6).map((category) => (
                            <Link
                                key={category.id}
                                to={`/shop?category=${encodeURIComponent(category.name.toUpperCase())}`}
                                className="p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all"
                                onClick={onClose}
                            >
                                <Package className="w-5 h-5 text-indigo-600 mb-2" />
                                <p className="text-xs font-bold text-gray-900 line-clamp-1">{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Auth Actions */}
                {isAuthenticated ? (
                    <div className="space-y-3">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"
                                onClick={onClose}
                            >
                                <Crown className="w-5 h-5 text-amber-600" />
                                <span className="text-sm font-bold text-amber-600">Admin Dashboard</span>
                            </Link>
                        )}
                        <button
                            onClick={() => { onLogout(); onClose(); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                        >
                            <LogOut className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-bold text-red-600">Log Out</span>
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg"
                        onClick={onClose}
                    >
                        <User className="w-5 h-5" />
                        <span>Sign In / Register</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

// =========================================================
// MAIN NAVBAR COMPONENT
// =========================================================
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/category/list`);
            const data = await response.json();
            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchCartCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setCartCount(0);
                return;
            }
            const response = await cartService.getCartCount(token);
            if (response.success && typeof response.count === 'number') {
                setCartCount(response.count);
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            setCartCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCategories();
        fetchCartCount();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [fetchCartCount]);

    const handleLogoutAndRedirect = () => {
        logout();
        setCartCount(0);
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <>
            {/* Main Navbar - 2 LAYERS */}
            <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-white/95 backdrop-blur-xl shadow-2xl' 
                    : 'bg-white shadow-md'
            }`}>
                
                {/* TOP LAYER - Logo, Search, User Actions */}
                <div className="border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            
                         {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
                            <div className="relative">
                                {/* Glow effect diubah ke biru agar matching */}
                                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                                
                                {/* Background Logo diubah jadi Biru (bukan gradient lagi) */}
                                <div className="relative w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                    <Package2 className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                {/* Teks DigitalPoint diubah jadi Hitam */}
                                <span className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                    DigitalPoint
                                </span>
                                <p className="text-xs font-semibold text-gray-500 -mt-1">Premium E-Commerce</p>
                            </div>
                        </Link>

                            {/* Search Bar (Desktop) */}
                            <div className="hidden lg:block flex-1 mx-8">
                                <PremiumSearchBar />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center space-x-4">
                                {/* Desktop Actions */}
                                <div className="hidden lg:flex items-center space-x-3">
                                    {/* Quick Links */}
                                    <div className="flex items-center space-x-4 pr-4 border-r border-gray-200">
                                        <QuickLink icon={Heart} label="Wishlist" onClick={() => navigate('/wishlist')} />
                                        <QuickLink icon={Bell} label="Alerts" onClick={() => {}} />
                                    </div>

                                    {/* User Menu */}
                                    {isAuthenticated ? (
                                        <UserProfileMenu 
                                            user={user} 
                                            isAdmin={isAdmin}
                                            onLogout={handleLogoutAndRedirect}
                                        />
                                    ) : (
                                        <Link
                                            to="/login"
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Sign In</span>
                                        </Link>
                                    )}

                                    {/* Cart */}
                                    <CartButton count={cartCount} />
                                </div>

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-indigo-300 transition-all"
                                >
                                    {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM LAYER - Navigation Links */}
                <div className={`transition-all duration-300 ${isScrolled ? 'hidden' : 'block'}`}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <nav className="hidden lg:flex items-center justify-between h-16">
                            {/* Left Navigation */}
                            <div className="flex items-center space-x-2">
                                {mainNavLinks.map((link, index) => (
                                    <NavLink 
                                        key={index} 
                                        link={link} 
                                        onDropdownToggle={() => {
                                            if (link.isDropdown) {
                                                setIsCategoriesOpen(!isCategoriesOpen);
                                            }
                                        }}
                                        isDropdownOpen={link.isDropdown && isCategoriesOpen}
                                    />
                                ))}
                            </div>

                            {/* Right Side Promotions */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                                    <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                                    <span className="text-sm font-bold text-rose-600">Flash Sale Ends in 2h</span>
                                </div>
                                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                                    <Gift className="w-4 h-4 text-teal-600" />
                                    <span className="text-sm font-bold text-teal-600">Free Shipping</span>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Categories Mega Menu */}
                <CategoriesMegaMenu 
                    categories={categories}
                    isOpen={isCategoriesOpen}
                    onClose={() => setIsCategoriesOpen(false)}
                />
            </header>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                categories={categories}
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogoutAndRedirect}
                cartCount={cartCount}
            />
        </>
    );
}