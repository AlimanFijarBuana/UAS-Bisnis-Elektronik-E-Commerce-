import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Truck, CheckCircle, Clock, XCircle,
    Search, Filter, ArrowLeft, Eye, Download,
    Calendar, MapPin, CreditCard, Scale, AlertCircle,
    Edit, Save, Ban
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const PRIMARY_COLOR = 'indigo';
const API_BASE_URL = 'http://localhost:8080'; // Pastikan base URL API didefinisikan

// ----------------------------------------------------
// 🎯 FUNGSI UNTUK MENGUBAH PATH RELATIF MENJADI URL ABSOLUT
// ----------------------------------------------------
const getFullImageUrl = (path) => {
    if (!path) {
        return null;
    }
    // 1. Jika path sudah URL lengkap (http/https), kembalikan apa adanya
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // 2. Jika hanya path relatif (e.g., /uploads/...)
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const imagePath = path.startsWith('/') ? path : `/${path}`; 
    
    return basePath + imagePath;
};
// ----------------------------------------------------

const formatPriceToIDR = (price) => {
    // Pastikan harga diproses sebagai angka
    const numPrice = typeof price === 'string' ? Number(price) : price;

    if (typeof numPrice !== 'number' || isNaN(numPrice)) {
        console.warn('⚠️ Invalid price detected:', price);
        return 'Rp0';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Gunakan Date object
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Invalid Date';
    }
};

const formatWeight = (weight) => {
    const numWeight = typeof weight === 'string' ? Number(weight) : weight;
    if (numWeight >= 1000) {
        return (numWeight / 1000).toFixed(2) + ' kg';
    } else {
        return numWeight + ' g';
    }
};

const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        'pending': { color: 'yellow', text: 'Menunggu', icon: Clock },
        'processing': { color: 'blue', text: 'Diproses', icon: Package },
        'shipped': { color: 'indigo', text: 'Dikirim', icon: Truck },
        'delivered': { color: 'green', text: 'Sampai', icon: CheckCircle },
        'cancelled': { color: 'red', text: 'Dibatalkan', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    // Perhatikan penggunaan template string untuk warna Tailwind CSS.
    // Ini mungkin memerlukan konfigurasi safelist di Tailwind jika tidak berfungsi.
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            <IconComponent className="w-3 h-3 mr-1" />
            {config.text}
        </span>
    );
};

const PaymentStatusBadge = ({ status, isEditing, onChange, onSave, onCancel, loading }) => {
    const statusConfig = {
        'pending': { color: 'yellow', text: 'Menunggu Pembayaran' },
        'paid': { color: 'green', text: 'Lunas' },
        'failed': { color: 'red', text: 'Gagal' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2">
                <select
                    value={status}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="pending">Menunggu Pembayaran</option>
                    <option value="paid">Lunas</option>
                    <option value="failed">Gagal</option>
                </select>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Save"
                >
                    <Save className="w-3 h-3" />
                </button>
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Cancel"
                >
                    <Ban className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                {config.text}
            </span>
            {status === 'pending' && (
                <button
                    onClick={() => onChange('edit')}
                    className="text-gray-500 hover:text-indigo-600"
                    title="Edit Payment Status"
                >
                    <Edit className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

const ShippingMethodBadge = ({ method }) => {
    const methodConfig = {
        'standard': { color: 'gray', text: 'Standard' },
        'express': { color: 'blue', text: 'Express' },
        'same_day': { color: 'purple', text: 'Same Day' }
    };

    const config = methodConfig[method] || methodConfig.standard;

    // Perhatikan penggunaan template string untuk warna Tailwind CSS.
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            {config.text}
        </span>
    );
};

export default function Orders() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // State untuk edit payment status
    const [editingPayment, setEditingPayment] = useState(null);
    const [tempPaymentStatus, setTempPaymentStatus] = useState('');
    const [updatingPayment, setUpdatingPayment] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadOrders();
    }, [isAuthenticated, navigate]);

    const loadOrders = async () => {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('authToken');

        try {
            console.log('🔄 Loading orders for user:', user?.id);
            
            const response = await fetch(`${API_BASE_URL}/order/list`, { // Menggunakan API_BASE_URL
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📦 Orders API Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📦 Orders API Result:', result);

            if (result.success) {
                console.log('✅ Orders loaded:', result.orders);
                
                if (result.orders && Array.isArray(result.orders)) {
                    setOrders(result.orders);
                    
                    result.orders.forEach((order, index) => {
                        console.log(`📊 Order ${index}:`, {
                            id: order.id,
                            order_number: order.order_number,
                            total_amount: order.total_amount,
                            type: typeof order.total_amount,
                            items_count: order.items_count
                        });
                    });
                } else {
                    console.warn('⚠️ No orders array in response');
                    setOrders([]);
                }
            } else {
                setError(result.message || 'Failed to load orders');
                setOrders([]);
            }
        } catch (err) {
            console.error('❌ Error loading orders:', err);
            setError('Failed to connect to server. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetail = async (orderId) => {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/order/view/${orderId}`, { // Menggunakan API_BASE_URL
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setSelectedOrder(result.order);
                setShowDetailModal(true);
            } else {
                alert(result.message || 'Failed to load order details');
            }
        } catch (err) {
            console.error('Error loading order detail:', err);
            alert('Failed to load order details');
        }
    };

    // Fungsi untuk update payment status
    const updatePaymentStatus = async (orderId, newStatus) => {
        setUpdatingPayment(true);
        const token = localStorage.getItem('authToken');

        try {
            console.log('🔄 Updating payment status for order:', orderId, 'to:', newStatus);

            const response = await fetch(`${API_BASE_URL}/order/update-payment/${orderId}`, { // Menggunakan API_BASE_URL
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📦 Update payment status result:', result);

            if (result.success) {
                // Update local state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { ...order, payment_status: newStatus }
                            : order
                    )
                );
                
                // Update selected order jika sedang dilihat
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, payment_status: newStatus }));
                }

                alert('Payment status updated successfully!');
            } else {
                alert(result.message || 'Failed to update payment status');
            }
        } catch (err) {
            console.error('❌ Error updating payment status:', err);
            alert('Failed to update payment status due to network error');
        } finally {
            setUpdatingPayment(false);
            setEditingPayment(null);
            setTempPaymentStatus('');
        }
    };

    // Handler untuk mulai edit payment status
    const startEditPayment = (orderId, currentStatus) => {
        setEditingPayment(orderId);
        setTempPaymentStatus(currentStatus);
    };

    // Handler untuk save payment status
    const savePaymentStatus = (orderId) => {
        if (tempPaymentStatus) {
            updatePaymentStatus(orderId, tempPaymentStatus);
        }
    };

    // Handler untuk cancel edit
    const cancelEditPayment = () => {
        setEditingPayment(null);
        setTempPaymentStatus('');
    };

    // Handler untuk change payment status
    const handlePaymentStatusChange = (newStatus) => {
        setTempPaymentStatus(newStatus);
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.shipping_info?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        // Catatan: filter tanggal diabaikan untuk saat ini karena `dateFilter` belum diimplementasikan di sini
        return matchesSearch && matchesStatus;
    });

    const handlePrintInvoice = (order) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${order.order_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .total { font-weight: bold; font-size: 1.2em; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE</h1>
                        <h2>${order.order_number}</h2>
                    </div>
                    <div class="section">
                        <h3>Order Details</h3>
                        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
                    </div>
                    <div class="section">
                        <h3>Shipping Information</h3>
                        <p><strong>Name:</strong> ${order.shipping_info?.fullName || 'N/A'}</p>
                        <p><strong>Address:</strong> ${order.shipping_info?.address || 'N/A'}</p>
                        <p><strong>City:</strong> ${order.shipping_info?.city || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${order.shipping_info?.phone || 'N/A'}</p>
                    </div>
                    <p>Thank you for your order!</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Debug component
    console.log('🎯 Current orders state:', {
        ordersCount: orders.length,
        filteredCount: filteredOrders.length,
        orders: orders
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-xl font-semibold text-gray-600">Loading your orders...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <button 
                            onClick={() => navigate('/shop')}
                            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors mr-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Shop
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            My Orders
                        </h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Debug Info - Hanya di development */}
                {process.env.NODE_ENV === 'development' && orders.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-blue-700">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Debug: {orders.length} orders loaded</span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search by order number or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">
                            {orders.length === 0 
                                ? "You haven't placed any orders yet." 
                                : "No orders match your search criteria."}
                        </p>
                        {orders.length === 0 && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                            >
                                Start Shopping
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => {
                            console.log('🎨 Rendering order:', order.order_number, 'Total:', order.total_amount);
                            
                            // Tentukan status yang akan ditampilkan. Jika sedang diedit, gunakan temp status.
                            const displayPaymentStatus = editingPayment === order.id ? tempPaymentStatus : order.payment_status;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-center mb-4 lg:mb-0">
                                                <Package className="w-8 h-8 text-indigo-600 mr-3" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Order #{order.order_number}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <OrderStatusBadge status={order.status} />
                                                <PaymentStatusBadge 
                                                    status={displayPaymentStatus} // Tampilkan status yang benar (temp atau asli)
                                                    isEditing={editingPayment === order.id}
                                                    onChange={(action) => {
                                                        if (action === 'edit') {
                                                            startEditPayment(order.id, order.payment_status);
                                                        } else {
                                                            handlePaymentStatusChange(action);
                                                        }
                                                    }}
                                                    onSave={() => savePaymentStatus(order.id)}
                                                    onCancel={cancelEditPayment}
                                                    loading={updatingPayment}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Content */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            {/* Shipping Info */}
                                            <div className="lg:col-span-2">
                                                <div className="flex items-start mb-4">
                                                    <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Shipping Address</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {order.shipping_info?.fullName || 'N/A'}<br />
                                                            {order.shipping_info?.address || 'N/A'}<br />
                                                            {order.shipping_info?.city || 'N/A'} - {order.shipping_info?.postalCode || ''}<br />
                                                            📞 {order.shipping_info?.phone || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Summary */}
                                            <div>
                                                <div className="flex items-start mb-4">
                                                    <CreditCard className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Payment & Shipping</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Method: {order.payment_method}<br />
                                                            Shipping: <ShippingMethodBadge method={order.shipping_method} />
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div>
                                                <div className="flex items-start">
                                                    <Scale className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Total</h4>
                                                        <p className="text-2xl font-bold text-rose-600">
                                                            {formatPriceToIDR(Number(order.total_amount))}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                                            <button
                                                onClick={() => loadOrderDetail(order.id)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handlePrintInvoice(order)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Print Invoice
                                            </button>
                                            {order.status === 'delivered' && (
                                                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Rate Order
                                                </button>
                                            )}
                                            {order.status === 'pending' && order.payment_status === 'pending' && (
                                                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Order Details - #{selectedOrder.order_number}
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
                                    <p className="text-sm text-gray-600">
                                        <strong>Name:</strong> {selectedOrder.shipping_info?.fullName || 'N/A'}<br />
                                        <strong>Email:</strong> {selectedOrder.shipping_info?.email || 'N/A'}<br />
                                        <strong>Phone:</strong> {selectedOrder.shipping_info?.phone || 'N/A'}<br />
                                        <strong>Address:</strong> {selectedOrder.shipping_info?.address || 'N/A'}<br />
                                        <strong>City:</strong> {selectedOrder.shipping_info?.city || 'N/A'}<br />
                                        <strong>Postal Code:</strong> {selectedOrder.shipping_info?.postalCode || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                                    <p className="text-sm text-gray-600">
                                        <strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}<br />
                                        <strong>Status:</strong> <OrderStatusBadge status={selectedOrder.status} /><br />
                                        {/* Status Pembayaran di Modal Detail */}
                                        <strong>Payment:</strong> 
                                        <PaymentStatusBadge 
                                            status={editingPayment === selectedOrder.id ? tempPaymentStatus : selectedOrder.payment_status}
                                            isEditing={editingPayment === selectedOrder.id}
                                            onChange={(action) => {
                                                if (action === 'edit') {
                                                    startEditPayment(selectedOrder.id, selectedOrder.payment_status);
                                                } else {
                                                    handlePaymentStatusChange(action);
                                                }
                                            }}
                                            onSave={() => savePaymentStatus(selectedOrder.id)}
                                            onCancel={cancelEditPayment}
                                            loading={updatingPayment}
                                        />
                                        <br />
                                        <strong>Shipping Method:</strong> <ShippingMethodBadge method={selectedOrder.shipping_method} /><br />
                                        <strong>Total Weight:</strong> {formatWeight(selectedOrder.total_weight)}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            // 🖼️ PERBAIKAN: Gunakan getFullImageUrl untuk menampilkan gambar
                                                            src={getFullImageUrl(item.product_image) || 'https://via.placeholder.com/50'}
                                                            alt={item.product_name}
                                                            className="w-10 h-10 object-cover rounded mr-3"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/50';
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                                            {item.weight > 0 && (
                                                                <div className="text-xs text-gray-500">Weight: {formatWeight(item.weight)}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatPriceToIDR(Number(item.price))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {formatPriceToIDR(Number(item.price) * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                Subtotal:
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatPriceToIDR(Number(selectedOrder.total_amount) - Number(selectedOrder.shipping_cost))}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                Shipping:
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatPriceToIDR(Number(selectedOrder.shipping_cost))}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                Total:
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-rose-600">
                                                {formatPriceToIDR(Number(selectedOrder.total_amount))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}