import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Mengambil state otentikasi
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Komponen yang melindungi rute.
 * @param {array} allowedRoles - Array of strings yang berisi role yang diizinkan (e.g., ['admin', 'manager'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
    // Ambil status otentikasi dan data user dari konteks
    const { isAuthenticated, user } = useAuth();

    // 1. Cek Status Login
    if (!isAuthenticated) {
        // Jika TIDAK login, arahkan ke halaman login
        // 'replace' memastikan pengguna tidak bisa kembali ke halaman yang dilarang dengan tombol back
        return <Navigate to="/login" replace />;
    }

    // 2. Cek Role (Jika 'allowedRoles' didefinisikan)
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Jika login, tetapi role TIDAK ADA dalam daftar yang diizinkan (misal: user biasa mencoba akses /admin)
        // Arahkan ke halaman utama atau halaman 403 (Unauthorized)
        return <Navigate to="/" replace />; 
    }

    // 3. Akses Diizinkan
    // Jika lolos semua cek (sudah login dan memiliki role yang sesuai), 
    // tampilkan komponen anak (yaitu halaman yang dilindungi: Dashboard, Profile, dll.)
    return <Outlet />;
};

export default ProtectedRoute;