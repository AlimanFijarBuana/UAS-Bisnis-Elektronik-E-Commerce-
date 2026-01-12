import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ⭐ STANDARDISASI: Gunakan 'authToken' secara konsisten
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (apiToken, apiUser) => {
        setToken(apiToken);
        setUser(apiUser);
        localStorage.setItem('authToken', apiToken); // ⭐ GUNAKAN 'authToken'
        localStorage.setItem('user', JSON.stringify(apiUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken'); // ⭐ GUNAKAN 'authToken'
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading, // ⭐ EXPOSE isLoading agar komponen lain bisa tahu status
        login,
        logout
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-indigo-600">Loading Authentication...</p>
                </div>
            </div>
        );
    }
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};