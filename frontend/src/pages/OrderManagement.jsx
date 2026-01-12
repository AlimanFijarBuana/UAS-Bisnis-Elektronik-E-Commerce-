import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Package, Truck, CheckCircle, Clock, XCircle,
    Search, Filter, Eye, Download, Edit, Save, Ban,
    Calendar, MapPin, CreditCard, Scale, Users, DollarSign,
    ArrowLeft, RefreshCw, MoreVertical, AlertCircle, Loader2
} from 'lucide-react';

import SidebarAdmin from '../components/SidebarAdmin.jsx';
import { useAuth } from '../context/AuthContext';

const PRIMARY_COLOR = 'indigo';
const API_BASE_URL = 'http://localhost:8080';

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
    const numPrice = typeof price === 'string' ? Number(price) : price;

    if (typeof numPrice !== 'number' || isNaN(numPrice)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            <IconComponent className="w-3 h-3 mr-1" />
            {config.text}
        </span>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        'pending': { color: 'yellow', text: 'Menunggu Pembayaran' },
        'paid': { color: 'green', text: 'Lunas' },
        'failed': { color: 'red', text: 'Gagal' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            {config.text}
        </span>
    );
};

const StatusDropdown = ({ currentStatus, onStatusChange, loading }) => {
    const statusOptions = [
        { value: 'pending', label: 'Menunggu', color: 'yellow' },
        { value: 'processing', label: 'Diproses', color: 'blue' },
        { value: 'shipped', label: 'Dikirim', color: 'indigo' },
        { value: 'delivered', label: 'Sampai', color: 'green' },
        { value: 'cancelled', label: 'Dibatalkan', color: 'red' }
    ];
    const currentColor = statusOptions.find(s => s.value === currentStatus)?.color || 'gray';

    return (
        <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={loading}
            className={`text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-${PRIMARY_COLOR}-500 bg-${currentColor}-100`}
        >
            {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

const PaymentStatusDropdown = ({ currentStatus, onStatusChange, loading }) => {
    const statusOptions = [
        { value: 'pending', label: 'Menunggu Pembayaran', color: 'yellow' },
        { value: 'paid', label: 'Lunas', color: 'green' },
        { value: 'failed', label: 'Gagal', color: 'red' }
    ];
    const currentColor = statusOptions.find(s => s.value === currentStatus)?.color || 'gray';

    return (
        <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={loading}
            className={`text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-${PRIMARY_COLOR}-500 bg-${currentColor}-100`}
        >
            {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default function OrderManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // State untuk filter dan search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // State untuk editing
    const [editingOrder, setEditingOrder] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [tempPaymentStatus, setTempPaymentStatus] = useState('');
    const [updatingOrder, setUpdatingOrder] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0
    });

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin');
            return;
        }
        loadOrders();
    }, [isAuthenticated, user, navigate]);

    const loadOrders = async () => {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('authToken');

        try {
            console.log('🔄 Loading admin orders from:', `${API_BASE_URL}/order/admin-list`);
            
            const response = await fetch(`${API_BASE_URL}/order/admin-list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📦 Admin orders response status:', response.status);

            // Handle CORS dan network errors
            if (response.status === 0) {
                throw new Error('CORS/Network Error: Cannot connect to backend server.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📦 Admin orders result:', result);

            if (result.success) {
                setOrders(result.orders || []);
                calculateStats(result.orders || []);
            } else {
                setError(result.message || 'Failed to load orders');
            }
        } catch (err) {
            console.error('❌ Error loading admin orders:', err);
            
            // Enhanced error handling
            if (err.message.includes('CORS') || err.message.includes('Network') || err.name === 'TypeError') {
                setError(`
                    Connection Error: Cannot reach admin orders API.
                    
                    Possible issues:
                    1. Backend server not running on port 8080
                    2. CORS not configured for admin routes
                    3. Vite proxy not configured properly
                    
                    Check:
                    - Backend is running: http://localhost:8080
                    - Vite config has proxy setup
                    - Browser console for detailed errors
                    
                    Error: ${err.message}
                `);
            } else {
                setError(err.message || 'Failed to connect to server. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersData) => {
        const stats = {
            total: ordersData.length,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            revenue: 0
        };

        ordersData.forEach(order => {
            // Count by status
            stats[order.status] = (stats[order.status] || 0) + 1;
            
            // Calculate revenue from delivered orders
            if (order.status === 'delivered' && order.payment_status === 'paid') {
                stats.revenue += Number(order.total_amount); 
            }
        });

        setStats(stats);
    };

    const loadOrderDetail = async (orderId) => {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/order/admin-view/${orderId}`, {
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
                setEditingOrder(null); 
                setTempStatus(result.order.status);
                setTempPaymentStatus(result.order.payment_status);
                setShowDetailModal(true);
            } else {
                alert(result.message || 'Failed to load order details');
            }
        } catch (err) {
            console.error('Error loading order detail:', err);
            alert('Failed to load order details');
        }
    };

    const updateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
        setUpdatingOrder(true);
        const token = localStorage.getItem('authToken');

        try {
            const updateData = {
                status: newStatus,
                payment_status: newPaymentStatus
            };

            const response = await fetch(`${API_BASE_URL}/order/admin-update/${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                const updatedOrders = orders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus, payment_status: newPaymentStatus }
                        : order
                );

                setOrders(updatedOrders);
                calculateStats(updatedOrders);
                
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ 
                        ...prev, 
                        status: newStatus,
                        payment_status: newPaymentStatus
                    }));
                }
                
                alert('Order updated successfully!');
            } else {
                alert(result.message || 'Failed to update order');
            }
        } catch (err) {
            console.error('❌ Error updating order:', err);
            alert('Failed to update order due to network error');
        } finally {
            setUpdatingOrder(false);
            setEditingOrder(null);
            setTempStatus('');
            setTempPaymentStatus('');
        }
    };

    // --- Handlers for Editing ---
    const startEditOrder = (orderId, currentStatus, currentPaymentStatus) => {
        setEditingOrder(orderId);
        setTempStatus(currentStatus);
        setTempPaymentStatus(currentPaymentStatus);
    };

    const saveOrderChanges = (orderId) => {
        if (tempStatus && tempPaymentStatus) {
            updateOrderStatus(orderId, tempStatus, tempPaymentStatus);
        } else {
            alert('Order Status and Payment Status must be selected.');
        }
    };

    const cancelEditOrder = () => {
        setEditingOrder(null);
        setTempStatus('');
        setTempPaymentStatus('');
    };

    const handleStatusChange = (newStatus) => {
        setTempStatus(newStatus);
    };

    const handlePaymentStatusChange = (newPaymentStatus) => {
        setTempPaymentStatus(newPaymentStatus);
    };
    // --- End Handlers for Editing ---

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.shipping_info?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const handlePrintInvoice = (order) => {
        const subtotal = Number(order.total_amount) - Number(order.shipping_cost);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${order.order_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; border-top: 1px solid #eee; padding-top: 10px; }
                        h3 { margin-top: 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .summary td { border: none; padding: 5px 0; }
                        .total { font-weight: bold; font-size: 1.2em; color: #dc2626; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE #${order.order_number}</h1>
                        <p>Issued on: ${formatDate(order.created_at)}</p>
                    </div>
                    
                    <div class="section">
                        <h3>Customer & Shipping Details</h3>
                        <p><strong>Customer:</strong> ${order.shipping_info?.fullName || 'N/A'} (${order.user?.email || 'N/A'})</p>
                        <p><strong>Address:</strong> ${order.shipping_info?.address || 'N/A'}, ${order.shipping_info?.city || 'N/A'} ${order.shipping_info?.postalCode || ''}</p>
                        <p><strong>Phone:</strong> ${order.shipping_info?.phone || 'N/A'}</p>
                        <p><strong>Status:</strong> ${order.status} | <strong>Payment:</strong> ${order.payment_status}</p>
                    </div>

                    <div class="section">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items?.map(item => `
                                    <tr>
                                        <td>${item.product_name}</td>
                                        <td>${formatPriceToIDR(Number(item.price))}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatPriceToIDR(Number(item.price) * item.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <table class="summary">
                            <tr>
                                <td colspan="3" style="text-align: right;">Subtotal:</td>
                                <td>${formatPriceToIDR(subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right;">Shipping Cost:</td>
                                <td>${formatPriceToIDR(Number(order.shipping_cost))}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right;" class="total">TOTAL AMOUNT:</td>
                                <td class="total">${formatPriceToIDR(Number(order.total_amount))}</td>
                            </tr>
                        </table>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <SidebarAdmin currentPath={location.pathname} />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-gray-600">Loading admin orders...</p>
                        <p className="text-sm text-gray-500 mt-2">Fetching data from server</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* 🎯 SIDEBAR ADMIN */}
            <SidebarAdmin currentPath={location.pathname} />
            
            {/* MAIN CONTENT */}
            <main className="flex-grow p-8 transition-all duration-300 ml-64">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Order Management
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={loadOrders}
                            disabled={loading}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <div className="text-sm text-gray-600">
                            {filteredOrders.length} of {orders.length} orders
                        </div>
                    </div>
                </div>

                {/* Enhanced Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                                <div className="font-semibold mb-2">Connection Error</div>
                                <div className="text-sm whitespace-pre-line">{error}</div>
                            </div>
                            <button 
                                onClick={() => setError('')} 
                                className="text-red-700 hover:text-red-900 ml-4 flex-shrink-0"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-sm text-gray-600">Total Orders</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
                                <p className="text-sm text-gray-600">Processing</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <Truck className="w-8 h-8 text-indigo-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
                                <p className="text-sm text-gray-600">Shipped</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                                <p className="text-sm text-gray-600">Delivered</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <XCircle className="w-8 h-8 text-red-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                                <p className="text-sm text-gray-600">Cancelled</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex items-center">
                            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{formatPriceToIDR(stats.revenue)}</p>
                                <p className="text-sm text-gray-600">Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search by order number, name, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
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

                        {/* Payment Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Payment</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
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

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                    const isEditing = editingOrder === order.id;
                                    const displayStatus = isEditing ? tempStatus : order.status;
                                    const displayPaymentStatus = isEditing ? tempPaymentStatus : order.payment_status;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.order_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.shipping_info?.fullName || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.user?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatPriceToIDR(Number(order.total_amount))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isEditing ? (
                                                    <StatusDropdown
                                                        currentStatus={displayStatus}
                                                        onStatusChange={handleStatusChange}
                                                        loading={updatingOrder}
                                                    />
                                                ) : (
                                                    <OrderStatusBadge status={order.status} />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isEditing ? (
                                                    <PaymentStatusDropdown
                                                        currentStatus={displayPaymentStatus}
                                                        onStatusChange={handlePaymentStatusChange}
                                                        loading={updatingOrder}
                                                    />
                                                ) : (
                                                    <PaymentStatusBadge status={order.payment_status} />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {isEditing ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => saveOrderChanges(order.id)}
                                                            disabled={updatingOrder}
                                                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                                            title="Save Changes"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditOrder}
                                                            disabled={updatingOrder}
                                                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                            title="Cancel Edit"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => loadOrderDetail(order.id)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => startEditOrder(order.id, order.status, order.payment_status)}
                                                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                                            title="Edit Order"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePrintInvoice(order)}
                                                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-50 transition-colors"
                                                            title="Print Invoice"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-600">
                                {orders.length === 0 
                                    ? 'No orders have been placed yet.' 
                                    : 'No orders match your search criteria.'}
                            </p>
                        </div>
                    )}
                </div>
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
                                        <strong>Customer:</strong> {selectedOrder.user?.email || 'N/A'}<br />
                                        
                                        {/* Status dropdowns di modal detail */}
                                        <div className="mt-2 space-y-2">
                                            <div className='flex items-center space-x-2'>
                                                <strong className='w-24'>Order Status:</strong>
                                                <StatusDropdown
                                                    currentStatus={editingOrder === selectedOrder.id ? tempStatus : selectedOrder.status}
                                                    onStatusChange={handleStatusChange}
                                                    loading={updatingOrder}
                                                />
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <strong className='w-24'>Payment Status:</strong>
                                                <PaymentStatusDropdown
                                                    currentStatus={editingOrder === selectedOrder.id ? tempPaymentStatus : selectedOrder.payment_status}
                                                    onStatusChange={handlePaymentStatusChange}
                                                    loading={updatingOrder}
                                                />
                                            </div>
                                        </div>
                                        
                                        <br />
                                        <strong>Shipping Method:</strong> {selectedOrder.shipping_method}<br />
                                        <strong>Total Weight:</strong> {formatWeight(selectedOrder.total_weight)}
                                    </p>
                                </div>
                            </div>

                            {/* Edit Actions for Modal */}
                            <div className="flex justify-end space-x-3 mb-6">
                                {editingOrder === selectedOrder.id ? (
                                    <>
                                        <button
                                            onClick={cancelEditOrder}
                                            disabled={updatingOrder}
                                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => saveOrderChanges(selectedOrder.id)}
                                            disabled={updatingOrder || (tempStatus === selectedOrder.status && tempPaymentStatus === selectedOrder.payment_status)}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => startEditOrder(selectedOrder.id, selectedOrder.status, selectedOrder.payment_status)}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Order
                                    </button>
                                )}
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
                                                            src={getFullImageUrl(item.product_image) || '50'}
                                                            alt={item.product_name}
                                                            className="w-10 h-10 object-cover rounded mr-3"
                                                            onError={(e) => {
                                                                e.target.src = '50';
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
                                                Shipping Cost:
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatPriceToIDR(Number(selectedOrder.shipping_cost))}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                Total Amount:
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-green-600 text-lg">
                                                {formatPriceToIDR(Number(selectedOrder.total_amount))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Order Notes */}
                            {selectedOrder.notes && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800 mb-2">Order Notes</h4>
                                    <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Action Buttons Footer Modal */}
                            <div className="pt-6 mt-8 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}