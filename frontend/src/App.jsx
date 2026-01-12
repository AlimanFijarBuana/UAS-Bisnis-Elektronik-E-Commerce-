import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import ScrollToTop
import ScrollToTop from "./components/ScrollToTop";

// Semua import Page disesuaikan tanpa ekstensi untuk mengatasi error resolusi
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister"; 
import AdminDashboard from "./pages/AdminDashboard";
import CategoryManagement from "./pages/CategoryManagement";
import ProductManagement from "./pages/ProductManagement";
import UserManagement from "./pages/UserManagement"; 
import OrderManagement from "./pages/OrderManagement";
import ProductPage from "./pages/ProductPage";
import ViewProduct from "./pages/ViewProduct"; 
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";

// Import Context disesuaikan
import { AuthProvider } from "./context/AuthContext"; 
// Import ProtectedRoute disesuaikan
import ProtectedRoute from "./components/ProtectedRoute"; 

// Komponen placeholder yang tersisa
const Placeholder = ({ title }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 lg:ml-64">
        <h1 className="text-3xl font-black text-red-600">Route: {title} (BELUM DIIMPLEMENTASIKAN)</h1>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                {/* PENTING: ScrollToTop harus berada di dalam <Router> */}
                <ScrollToTop />
                
                <Routes>
                    {/* ----------------------------------------------------------------- */}
                    {/* RUTE PUBLIK (Tidak memerlukan login) */}
                    {/* ----------------------------------------------------------------- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginRegister />} /> 
                    <Route path="/register" element={<LoginRegister />} /> 
                    <Route path="/shop" element={<ProductPage />}/> 
                    <Route path="/product/:id" element={<ViewProduct />} />
                    
                    {/* ----------------------------------------------------------------- */}
                    {/* 🔒 RUTE PENGGUNA TERPROTEKSI (Hanya Membutuhkan Login) */}
                    {/* Karena 'allowedRoles' dihilangkan, rute ini hanya memeriksa isAuthenticated */}
                    {/* ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute />}>
                        {/* Rute Keranjang & Checkout dipindahkan ke sini */}
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout/>}/>
                        <Route path="/ordersuccess" element={<OrderSuccess />} /> 
                        <Route path="/orders" element={<Orders />} /> 
                    </Route>

                    {/* ----------------------------------------------------------------- */}
                    {/* 🔒 RUTE ADMIN (DILINDUNGI KHUSUS) */}
                    {/* Hanya dapat diakses oleh user dengan role 'admin' */}
                    {/* ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} /> 
                        <Route path="/admin/products" element={<ProductManagement />} />
                        <Route path="/admin/categories" element={<CategoryManagement />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/orders" element={<OrderManagement />} />
                        <Route path="/admin/settings" element={<Placeholder title="Settings" />} />
                    </Route>
                    
                    {/* Opsional: Rute 404 Not Found */}
                    <Route path="*" element={<Placeholder title="404 Not Found" />} />
                    
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;