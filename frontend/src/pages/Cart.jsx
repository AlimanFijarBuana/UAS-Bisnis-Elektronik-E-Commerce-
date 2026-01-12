import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Trash2, ArrowLeft, Loader2, Minus, Plus, Zap, 
    Package, Lock, Sparkles, Gift, CheckCircle2, Star, Shield
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

const formatPriceToIDR = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export default function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); 
    
    const [cartData, setCartData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingItem, setRemovingItem] = useState(null);
    
    // Mapping data dari nested structure
    const cartItems = cartData?.items?.map(item => ({
        product_id: item.product_id,
        name: item.product?.name || 'Unknown Product',
        price: item.price_at_addition || 0,
        quantity: item.quantity,
        image: item.product?.image,
        unit: item.product?.unit || 'Unit'
    })) || [];

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('authToken'); 

        if (!isAuthenticated || !token) {
            setLoading(false);
            if (!isAuthenticated) {
                setError('Please log in to view your cart.');
                setTimeout(() => navigate('/login'), 1500); 
            }
            return;
        }

        try {
            const response = await cartService.getCart(token);
            
            console.log('🛒 Cart Response:', response);
            
            if (response.success) {
                setCartData(response.cart);
            } else {
                setError(response.message || 'Failed to load cart data from server.');
                setCartData(null);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to connect to server or session expired. Please log in again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        loadCart();
        window.addEventListener('cartUpdated', loadCart); 
        
        return () => {
             window.removeEventListener('cartUpdated', loadCart);
        };
    }, [loadCart]);

    const updateQuantity = useCallback(async (productId, newQuantity) => {
        const quantity = Math.max(1, newQuantity);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            alert("Session expired. Please log in.");
            navigate('/login');
            return;
        }

        try {
            const response = await cartService.updateCartItem(productId, quantity, token);
            
            if (response.success) {
                loadCart(); 
                window.dispatchEvent(new Event('cartUpdated')); 
            } else {
                alert(response.message || 'Failed to update quantity. Please check product stock.');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please check server connection.');
        }
    }, [loadCart, navigate]);

    const removeItem = useCallback(async (productId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) {
            return;
        }

        setRemovingItem(productId);
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert("Session expired. Please log in.");
            navigate('/login');
            setRemovingItem(null);
            return;
        }

        try {
            const response = await cartService.removeFromCart(productId, token);
            
            if (response.success) {
                alert('Item removed successfully!');
                loadCart(); 
                window.dispatchEvent(new Event('cartUpdated')); 
            } else {
                alert(response.message || 'Failed to remove item.');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please check server connection.');
        } finally {
            setRemovingItem(null);
        }
    }, [loadCart, navigate]);

    // Hitung totals
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const subtotal = cartData?.total_price || cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="w-full">
                    <div className="flex flex-col justify-center items-center h-96 bg-white">
                        <div className="relative">
                            <div className="absolute inset-0 bg-slate-900 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-16 h-16 animate-spin text-slate-900 relative z-10" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 mt-6">
                            Loading Your Premium Cart...
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 rounded-3xl shadow-2xl border-2 border-red-200 p-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center">
                            <Zap className="w-20 h-20 text-red-500 mx-auto mb-6" />
                            <h3 className="text-4xl font-black text-red-900 mb-4">Oops! Something Went Wrong</h3>
                            <p className="text-red-700 text-lg mb-8 max-w-md mx-auto">{error}</p>
                            <button 
                                onClick={() => navigate('/login')} 
                                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                                Back to Login
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-16">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-3xl opacity-20 -mr-48 -mt-48"></div>
                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6 shadow-lg">
                                <ShoppingCart className="w-12 h-12 text-slate-700" />
                            </div>
                            <h3 className="text-5xl font-black text-slate-900 mb-4">
                                Your Cart Awaits
                            </h3>
                            <p className="text-slate-600 text-xl mb-10 max-w-lg mx-auto">
                                Start your premium shopping experience and discover our curated collection
                            </p>
                            <button 
                                onClick={() => navigate('/shop')}
                                className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                Start Shopping
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
            <Navbar />
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Premium Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 mb-3">
                                Shopping Cart
                            </h1>
                            <p className="text-slate-600 text-lg flex items-center">
                                <Package className="w-5 h-5 mr-2 text-slate-900" />
                                {totalQuantity} {totalQuantity > 1 ? 'Premium Items' : 'Premium Item'} Selected
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/shop')}
                            className="hidden md:flex items-center px-6 py-3 text-white bg-slate-900 hover:bg-slate-800 border-2 border-slate-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                        </button>
                    </div>
                    <div className="mt-6 h-1 bg-slate-900 rounded-full w-32"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item, index) => (
                            <div 
                                key={item.product_id || index} 
                                className="group relative bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-900"
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/0 via-slate-800/0 to-slate-900/0 group-hover:from-slate-900/5 group-hover:via-slate-800/5 group-hover:to-slate-900/5 transition-all duration-300"></div>
                                
                                <div className="relative flex items-center p-6">
                                    {/* Product Image */}
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-slate-900 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                        <img
                                            src={item.image ? 
                                                (item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`) 
                                                : 'https://dummyimage.com/400x400/f3f4f6/9ca3af&text=No+Image'}
                                            alt={item.name}
                                            className="relative w-32 h-32 object-cover rounded-2xl border-2 border-slate-200 shadow-md group-hover:border-slate-900 transition-all duration-300"
                                            onError={(e) => { e.target.src = 'https://dummyimage.com/400x400/f3f4f6/9ca3af&text=No+Image'; }}
                                        />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-grow ml-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div className="flex-1">
                                            <h2 
                                                className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors cursor-pointer mb-2"
                                                onClick={() => navigate(`/product/${item.product_id}`)}
                                            >
                                                {item.name}
                                            </h2>
                                            
                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-900 text-sm font-bold rounded-full border border-slate-200">
                                                    {formatPriceToIDR(item.price)}
                                                </span>
                                                <span className="text-slate-500 text-sm">per {item.unit}</span>
                                            </div>
                                            
                                            {/* Quantity Control */}
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center bg-slate-100 rounded-full border-2 border-slate-900 shadow-inner">
                                                    <button 
                                                        className="p-3 text-slate-900 hover:bg-slate-200 rounded-full disabled:opacity-30 transition-all hover:scale-110"
                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-12 text-center font-black text-slate-900 text-lg">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        className="p-3 text-slate-900 hover:bg-slate-200 rounded-full transition-all hover:scale-110"
                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="text-slate-600 font-semibold">{item.unit}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Price & Remove */}
                                        <div className="text-right flex flex-col items-end space-y-4">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 mb-1">Total Price</p>
                                                <p className="text-3xl font-black text-slate-900">
                                                    {formatPriceToIDR(item.price * item.quantity)}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.product_id)}
                                                disabled={removingItem === item.product_id}
                                                className="group/btn flex items-center px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                                                aria-label="Remove item"
                                            >
                                                {removingItem === item.product_id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                                )}
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Premium Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden">
                            {/* Header with Dark Theme */}
                            <div className="relative bg-slate-900 p-6">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(148,163,184,0.2),transparent_50%)]"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-white flex items-center">
                                        <Sparkles className="w-6 h-6 mr-2" />
                                        Order Summary
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Items Count */}
                                <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border-2 border-slate-200">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shadow-md mr-3">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-bold text-slate-700">Total Items</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{totalQuantity}</span>
                                </div>

                                {/* Benefits Badge */}
                                <div className="relative p-4 bg-slate-100 rounded-xl border-2 border-slate-900 overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                        <Star className="w-12 h-12 text-slate-300" />
                                    </div>
                                    <div className="relative flex items-start">
                                        <Gift className="w-5 h-5 text-slate-900 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Premium Benefits</p>
                                            <p className="text-xs text-slate-700 mt-1">Free shipping on orders over Rp500k</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="space-y-3 pb-6 border-b-2 border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-semibold">Subtotal</span>
                                        <span className="text-xl font-bold text-slate-900">{formatPriceToIDR(subtotal)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="relative p-6 bg-slate-900 rounded-2xl border-2 border-slate-900">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-slate-300 mb-1">Order Total</p>
                                            <p className="text-4xl font-black text-white">
                                                {formatPriceToIDR(total)}
                                            </p>
                                        </div>
                                        <Gift className="w-12 h-12 text-slate-700" />
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <div className="relative flex items-center justify-center">
                                        <Lock className="w-5 h-5 mr-2" />
                                        Secure Checkout
                                        <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                    </div>
                                </button>

                                {/* Continue Shopping - Mobile */}
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="w-full md:hidden flex items-center justify-center text-white bg-slate-800 hover:bg-slate-700 border-2 border-slate-900 font-bold py-4 rounded-2xl transition-all duration-300"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                                </button>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t-2 border-slate-200">
                                    <div className="text-center p-2">
                                        <Lock className="w-5 h-5 mx-auto text-slate-900 mb-1" />
                                        <p className="text-xs text-slate-600 font-semibold">Secure</p>
                                    </div>
                                    <div className="text-center p-2">
                                        <Zap className="w-5 h-5 mx-auto text-slate-900 mb-1" />
                                        <p className="text-xs text-slate-600 font-semibold">Fast</p>
                                    </div>
                                    <div className="text-center p-2">
                                        <CheckCircle2 className="w-5 h-5 mx-auto text-slate-900 mb-1" />
                                        <p className="text-xs text-slate-600 font-semibold">Trusted</p>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 text-center flex items-center justify-center pt-2">
                                    <Shield className='w-3 h-3 mr-1 text-slate-900'/> 
                                    Cart synced with server
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}