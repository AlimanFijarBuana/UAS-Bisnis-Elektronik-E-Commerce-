import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Package, TrendingUp, LayoutDashboard, Settings, LogOut, List, Box, ShoppingCart } from 'lucide-react'; 
// Import ShoppingCart icon

const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Manage Users", icon: Users, href: "/admin/users" },
    { name: "Manage Products", icon: Box, href: "/admin/products" },
    { name: "Manage Categories", icon: List, href: "/admin/categories" },
    { name: "Manage Orders", icon: ShoppingCart, href: "/admin/orders" }, // TAUTAN BARU
    { name: "Settings", icon: Settings, href: "/admin/settings" },
];

const SidebarAdmin = ({ currentPath }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 flex flex-col bg-gray-800 text-white shadow-xl min-h-screen fixed top-0 left-0 z-10">
            <div className="p-6 text-center border-b border-gray-700">
                <h2 className="text-2xl font-black text-indigo-400 flex items-center justify-center">
                    <Shield className="w-6 h-6 mr-2" /> AdminPanel
                </h2>
            </div>
            
            <nav className="flex-grow p-4 space-y-2">
                {sidebarLinks.map((item) => {
                    const isActive = item.href === currentPath;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? 'bg-indigo-600 text-white font-bold' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg text-red-400 bg-gray-700 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default SidebarAdmin;