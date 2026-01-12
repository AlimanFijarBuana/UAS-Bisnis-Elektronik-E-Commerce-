import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer'; 
import { Mail, User, Lock, ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';

// --- KONFIGURASI API ---
const API_BASE_URL = 'http://localhost:8080'; 
// -----------------------

// Fungsi alert (Toast) - (TETAP SAMA)
const showMessage = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 z-[9999] opacity-0 ${
        isError ? 'bg-red-600' : 'bg-green-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = 1;
        toast.style.transform = 'translate(-50%, 0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000); 
};

// --- Sub-Komponen: Formulir Login ---
const LoginForm = ({ setMode }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username, 
                password
            });

            if (response.data.success) {
                const { token, user } = response.data;
                
                login(token, user); 
                showMessage('Login berhasil!', false); 
                
                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/'); 
                }
                
            } else {
                showMessage(response.data.message || 'Login gagal. Kredensial salah.', true);
            }
        } catch (error) {
            console.error('Login API Error:', error);
            const errorMessage = error.response?.data?.message || 'Login gagal. Cek koneksi server atau kredensial.';
            showMessage(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6 animate-fadeIn h-full flex flex-col justify-center py-8" onSubmit={handleLogin}>
            <h3 className="text-4xl font-extrabold text-neutral-900 mb-2">Welcome Back!</h3>
            <p className="text-gray-500 mb-8 text-md">Enter your details to access your dashboard.</p>

            <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Username or Email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>
            
            <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
                <label className="flex items-center text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    Remember Me
                </label>
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot Password?</a>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 uppercase tracking-wider mt-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Log In <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            <p className='text-center text-sm text-gray-500 pt-6'>
                Don't have an account? 
                <button 
                    type="button" 
                    onClick={() => setMode('register')} 
                    className="text-indigo-600 font-bold hover:text-indigo-800 ml-1 transition-colors"
                    disabled={isLoading}
                >
                    Create one!
                </button>
            </p>
        </form>
    );
};


// --- Sub-Komponen: Formulir Register ---
const RegisterForm = ({ setMode }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            showMessage('Pendaftaran gagal. Konfirmasi password tidak cocok.', true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                email,
                password
            });
            
            if (response.data.success) {
                showMessage(`Pendaftaran berhasil! Silakan login.`, false);
                setMode('login'); 
            } else {
                let errorMessage = response.data.message || 'Pendaftaran gagal.';
                if (response.data.errors) {
                    const errorFields = Object.values(response.data.errors).flat();
                    errorMessage = errorFields.join('. ') || 'Pendaftaran gagal karena kesalahan validasi.';
                }
                showMessage(errorMessage, true);
            }

        } catch (error) {
            console.error('Register API Error:', error);
            const errorMessage = error.response?.data?.message || 'Pendaftaran gagal. Cek koneksi server.';
            showMessage(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6 animate-fadeIn h-full flex flex-col justify-center py-8" onSubmit={handleRegister}>
            <h3 className="text-4xl font-extrabold text-neutral-900 mb-2">Join DigitalPoint</h3>
            <p className="text-gray-500 mb-8 text-md">Create an account to unlock exclusive features.</p>

            <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Choose Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center text-sm pt-2">
                <label className="flex items-start text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" required className="mt-1 mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    I agree to the <a href="#" className="text-green-600 hover:underline ml-1">Terms of Service</a>.
                </label>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 uppercase tracking-wider mt-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Register Now <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            <p className='text-center text-sm text-gray-500 pt-6'>
                Already have an account? 
                <button 
                    type="button" 
                    onClick={() => setMode('login')} 
                    className="text-indigo-600 font-bold hover:text-indigo-800 ml-1 transition-colors"
                    disabled={isLoading}
                >
                    Sign In
                </button>
            </p>
        </form>
    );
};


// --- Komponen Utama LoginRegister ---
export default function LoginRegister() {
    const [mode, setMode] = useState('login'); 

    // Tentukan warna utama berdasarkan mode
    const primaryColor = mode === 'login' ? 'bg-indigo-600' : 'bg-green-600';
    const secondaryColor = mode === 'login' ? 'bg-indigo-500' : 'bg-green-500';
    const highlightText = mode === 'login' ? 'text-indigo-600' : 'text-green-600';

    const cardTitle = mode === 'login' ? 'SECURE LOGIN' : 'QUICK REGISTRATION';
    const cardDescription = mode === 'login' 
        ? 'Access millions of products worldwide with one secure login.' 
        : 'Sign up in seconds and start enjoying the best online shopping experience.';

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
            <Navbar />
            
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex items-center justify-center py-20 w-full">
                
                <div 
                    className="w-full max-w-5xl h-[650px] bg-white rounded-3xl shadow-4xl border border-gray-200 overflow-hidden lg:grid lg:grid-cols-2 relative"
                    // Gunakan kelas animasi di sini
                    style={{ 
                        animation: 'popIn 0.8s ease-out' 
                    }}
                >
                    
                    {/* Kolom Kiri: Formulir (Selalu terlihat) */}
                    <div className="p-8 md:p-14 flex flex-col justify-center relative">
                        {/* Tombol switch mode mobile */}
                        <div className="lg:hidden text-center mb-6">
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className={`text-sm font-semibold flex items-center mx-auto ${highlightText} hover:underline`}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Switch to {mode === 'login' ? 'Register' : 'Login'}
                            </button>
                        </div>

                        {mode === 'login' ? (
                            <LoginForm setMode={setMode} />
                        ) : (
                            <RegisterForm setMode={setMode} />
                        )}
                    </div>

                    {/* Kolom Kanan: Visual dan Info (Hanya di Desktop) */}
                    <div 
                        className={`hidden lg:flex flex-col justify-center items-center text-white p-10 transition-all duration-700 ease-in-out ${primaryColor}`}
                        style={{ 
                            backgroundImage: 'linear-gradient(135deg, var(--tw-gradient-stops))',
                            // Gradient color based on mode
                            '--tw-gradient-from': mode === 'login' ? '#4f46e5' : '#10b981',
                            '--tw-gradient-to': mode === 'login' ? '#6366f1' : '#34d399',
                        }}
                    >
                        {/* Menggunakan ikon yang lebih besar sebagai titik fokus */}
                        {mode === 'login' ? 
                            <User className="w-20 h-20 mb-6 opacity-80" /> : 
                            <CheckCircle className="w-20 h-20 mb-6 opacity-80" />
                        }
                        
                        <h2 className="text-4xl font-extrabold text-center mb-3">
                            {cardTitle}
                        </h2>
                        <p className="text-center text-lg max-w-xs opacity-90 mb-8">
                            {cardDescription}
                        </p>
                        
                        {/* Tombol Switch Mode */}
                        <div className="space-y-4 text-center">
                            <h3 className="text-sm font-medium opacity-70">
                                {mode === 'login' ? 'New Customer?' : 'Already Registered?'}
                            </h3>
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                                className={`px-8 py-3 bg-white text-lg font-bold rounded-xl shadow-xl transition-all duration-300 hover:${secondaryColor} hover:text-white ${highlightText}`}
                            >
                                {mode === 'login' ? 'Sign Up Now' : 'Sign In'}
                            </button>
                        </div>
                    </div>

                </div>
                
                <style jsx="true">{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes popIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.4s ease-out;
                    }
                    .shadow-4xl {
                        box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2), 0 20px 40px -10px rgba(99, 102, 241, 0.2);
                    }
                    
                    /* Kelas CSS tambahan untuk tombol switch mode di visual panel */
                    .hover\\:bg-indigo-500:hover {
                        background-color: ${mode === 'login' ? '#6366f1' : '#10b981'};
                    }
                `}</style>
            </main>

            <Footer />
        </div>
    );
}
