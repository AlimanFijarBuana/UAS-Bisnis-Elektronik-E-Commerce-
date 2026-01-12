import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarAdmin from '../components/SidebarAdmin';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    Users, Package, TrendingUp, LayoutDashboard, Loader2, 
    ShoppingCart, DollarSign, AlertCircle, CheckCircle, Clock,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

// --- Helper Function: Get Initials ---
const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
        return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'AD';
};

const AdminDashboard = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        orderStats: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Autentikasi dan Redirect ---
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user && user.role !== 'admin') {
            navigate('/');
        }

        if (isAuthenticated && user?.role === 'admin') {
            loadDashboardData();
        }
    }, [isAuthenticated, user, navigate]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('authToken');

        try {
            // Load data dari berbagai endpoint
            const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/user/list`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_BASE_URL}/product/list`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_BASE_URL}/order/admin-list`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
            ]);

            // Handle errors
            if (!usersResponse.ok || !productsResponse.ok || !ordersResponse.ok) {
                throw new Error('Failed to load dashboard data');
            }

            const [usersData, productsData, ordersData] = await Promise.all([
                usersResponse.json(),
                productsResponse.json(),
                ordersResponse.json()
            ]);

            if (usersData.success && productsData.success && ordersData.success) {
                const orders = ordersData.orders || [];
                
                // Calculate statistics
                const orderStats = {
                    pending: 0,
                    processing: 0,
                    shipped: 0,
                    delivered: 0,
                    cancelled: 0
                };

                let totalRevenue = 0;

                orders.forEach(order => {
                    // Count orders by status
                    orderStats[order.status] = (orderStats[order.status] || 0) + 1;
                    
                    // Calculate revenue from delivered and paid orders
                    if (order.status === 'delivered' && order.payment_status === 'paid') {
                        totalRevenue += Number(order.total_amount);
                    }
                });

                // Get recent orders (last 5)
                const recentOrders = orders
                    .slice(0, 5)
                    .map(order => ({
                        id: order.id,
                        order_number: order.order_number,
                        customer: order.shipping_info?.fullName || order.user?.email || 'N/A',
                        status: order.status,
                        total_amount: order.total_amount,
                        created_at: order.created_at
                    }));

                setDashboardData({
                    totalUsers: usersData.users?.length || 0,
                    totalProducts: productsData.products?.length || 0,
                    totalOrders: orders.length,
                    totalRevenue: totalRevenue,
                    recentOrders: recentOrders,
                    orderStats: orderStats
                });

            } else {
                setError('Failed to load dashboard data from server');
            }

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Data user yang aman
    const welcomeName = user?.username || 'Admin';
    const initials = getInitials(user?.username);

    // Format currency
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            'pending': { color: 'yellow', text: 'Pending' },
            'processing': { color: 'blue', text: 'Processing' },
            'shipped': { color: 'indigo', text: 'Shipped' },
            'delivered': { color: 'green', text: 'Delivered' },
            'cancelled': { color: 'red', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                {config.text}
            </span>
        );
    };

    // Stats cards data
    const stats = [
        { 
            title: "Total Users", 
            value: dashboardData.totalUsers.toString(), 
            icon: Users, 
            color: "text-blue-600", 
            bg: "bg-blue-50",
            description: "Registered users"
        },
        { 
            title: "Total Products", 
            value: dashboardData.totalProducts.toString(), 
            icon: Package, 
            color: "text-green-600", 
            bg: "bg-green-50",
            description: "Active products"
        },
        { 
            title: "Total Orders", 
            value: dashboardData.totalOrders.toString(), 
            icon: ShoppingCart, 
            color: "text-purple-600", 
            bg: "bg-purple-50",
            description: "All time orders"
        },
        { 
            title: "Total Revenue", 
            value: formatPriceToIDR(dashboardData.totalRevenue), 
            icon: DollarSign, 
            color: "text-amber-600", 
            bg: "bg-amber-50",
            description: "From delivered orders"
        }
    ];

    // Order status distribution
    const orderStatusData = [
        { status: 'pending', count: dashboardData.orderStats.pending, color: 'bg-yellow-500', icon: Clock },
        { status: 'processing', count: dashboardData.orderStats.processing, color: 'bg-blue-500', icon: Loader2 },
        { status: 'shipped', count: dashboardData.orderStats.shipped, color: 'bg-indigo-500', icon: Package },
        { status: 'delivered', count: dashboardData.orderStats.delivered, color: 'bg-green-500', icon: CheckCircle },
        { status: 'cancelled', count: dashboardData.orderStats.cancelled, color: 'bg-red-500', icon: AlertCircle }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <SidebarAdmin currentPath={location.pathname} />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
                        <p className="text-sm text-gray-500 mt-2">Fetching data from server</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* Sidebar */}
            <SidebarAdmin currentPath={location.pathname} />

            {/* Konten Utama */}
            <main className="flex-grow p-8 transition-all duration-300 ml-64">
                
                {/* Header */}
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <LayoutDashboard className="w-8 h-8 mr-3 text-indigo-600" />
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mt-2">Welcome back, here's what's happening today.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div 
                            className="w-10 h-10 rounded-full border-2 border-indigo-600 object-cover flex items-center justify-center font-bold text-white bg-indigo-500 text-sm"
                            title={welcomeName}
                        >
                            {initials}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Welcome back</p>
                            <p className="font-semibold text-gray-900">{welcomeName}</p>
                        </div>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-3" />
                                <span>{error}</span>
                            </div>
                            <button 
                                onClick={() => setError('')} 
                                className="text-red-700 hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                                </div>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Status Distribution */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                            <div className="space-y-4">
                                {orderStatusData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                                            <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                <button 
                                    onClick={() => navigate('/admin/orders')}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                                >
                                    View All
                                    <ArrowUpRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                            
                            {dashboardData.recentOrders.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No orders found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">#{order.order_number}</span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>{order.customer}</span>
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-gray-900">
                                                    {formatPriceToIDR(order.total_amount)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                        <h4 className="font-semibold mb-2">Manage Products</h4>
                        <p className="text-indigo-100 text-sm mb-4">Add, edit, or remove products from your store</p>
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            Go to Products
                        </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-white">
                        <h4 className="font-semibold mb-2">View Orders</h4>
                        <p className="text-green-100 text-sm mb-4">Manage and track customer orders</p>
                        <button 
                            onClick={() => navigate('/admin/orders')}
                            className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            Go to Orders
                        </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl text-white">
                        <h4 className="font-semibold mb-2">User Management</h4>
                        <p className="text-blue-100 text-sm mb-4">Manage user accounts and permissions</p>
                        <button 
                            onClick={() => navigate('/admin/users')}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            Go to Users
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;