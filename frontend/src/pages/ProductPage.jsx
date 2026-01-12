import React, { useState, useEffect, useCallback, useMemo } from 'react';
// ⭐ Tambahkan useLocation
import { useNavigate, useLocation } from 'react-router-dom'; 
import {
    ShoppingCart, Heart, Package, Star, Loader2, ArrowLeft, ArrowRight,
    Search, Filter, X, ChevronDown, ChevronUp, Package2, CheckCircle, Shield, Eye
} from 'lucide-react';
// Asumsi path ke komponen ini sudah benar
import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';

// >>> START: IMPORT AUTHENTIKASI DITAMBAHKAN <<<
import { useAuth } from '../context/AuthContext'; 
import { cartService } from '../services/CartService'; // Import cartService
// >>> END: IMPORT AUTHENTIKASI DITAMBAHKAN <<<

// =========================================================
// UTILITIES
// =========================================================
const API_BASE_URL = 'http://localhost:8080';


const apiService = {
    getProducts: async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const response = await fetch(`${API_BASE_URL}/product/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, products: [], error: 'Network or server error' };
        }
    },
};

// UTILITY: Price Formatter
const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// =========================================================
// KOMPONEN BARU: NOTIFIKASI CART (Toast)
// =========================================================
const CartNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isError = message.includes("Please log in") || message.includes("Failed to");
    const bgColorClass = isError ? "bg-red-600 shadow-red-400/50 border-red-300" : "bg-green-600 shadow-green-400/50 border-green-300";
    const IconComponent = isError ? Shield : CheckCircle;

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
            <div className={`flex items-center text-white text-sm font-bold px-6 py-3 rounded-full shadow-2xl space-x-3 border ${bgColorClass}`}>
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">{message}</span>
                <button onClick={onClose} className="ml-2 text-white/80 hover:text-white font-extrabold transition-colors">
                    &times;
                </button>
            </div>
        </div>
    );
};


// =========================================================
// Komponen ProductCard (Diperbarui dengan onProductClick & onAddToCart)
// =========================================================
const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const idrPrice = formatPriceToIDR(product.price);
    const hasDiscount = product.price % 3 !== 0; 
    const discountPercentage = Math.round(Math.random() * 30 + 10);
    const oldPrice = product.price / (1 - discountPercentage / 100);
    const oldIdrPrice = formatPriceToIDR(oldPrice);
    
    const reviewCount = Math.floor(Math.random() * 100) + 20;
    
    const productImageUrl = (product.image && product.image.startsWith('/'))
        ? `${API_BASE_URL}${product.image}`
        : (product.image || `https://placehold.co/256?text=NO+IMG`); 


    return (
        <div 
            className="bg-white p-4 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-indigo-200/50 hover:scale-[1.02] border border-gray-100 relative overflow-hidden group cursor-pointer"
            onClick={() => onProductClick(product.id)}
        >
            
            {hasDiscount && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg">
                        -{discountPercentage}%
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4 flex items-center justify-center h-56 relative overflow-hidden border border-gray-100">
                {product.image ? (
                    <img
                        src={productImageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 rounded-2xl">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                     <button 
                        className="p-3 bg-white rounded-2xl text-gray-700 hover:text-teal-600 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button 
                        className="p-3 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {product.category_name || 'ELECTRONICS'}
                </p>
                <h3 className="text-lg font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
                    {product.name}
                </h3>

                {/* Rating - Display based on simulatedRating */}
                <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < product.simulatedRating ? 'fill-current text-amber-400' : 'text-gray-300'}`} 
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">({reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col space-y-1">
                        <span className="text-xl font-black text-indigo-600">
                            {idrPrice}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-medium">{oldIdrPrice}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// Komponen Filter Sidebar (Tidak Berubah)
// =========================================================
const FilterSidebar = ({ 
    filters, 
    onFilterChange, 
    categories, 
    isMobileFilterOpen, 
    onCloseMobileFilter,
    maxPrice 
}) => {
    const [priceRangeOpen, setPriceRangeOpen] = useState(true);
    const [categoriesOpen, setCategoriesOpen] = useState(true);
    const [ratingOpen, setRatingOpen] = useState(true);

    const ratings = [5, 4, 3, 2, 1];

    const initialMaxPrice = maxPrice || 10000000;
    const currentMinPrice = filters.priceRange?.min ?? 0;
    const currentMaxPrice = filters.priceRange?.max ?? initialMaxPrice;
    
    const handleCategoryChange = (category, isChecked) => {
        const newCategories = isChecked
            ? [...filters.categories, category]
            : filters.categories.filter(c => c !== category);
        onFilterChange({ ...filters, categories: newCategories });
    };

    const handleRatingChange = (rating) => {
        const newMinRating = filters.minRating === rating ? 0 : rating;
        onFilterChange({ ...filters, minRating: newMinRating });
    };

    const handlePriceSliderChange = (e) => {
        const newMaxPrice = parseInt(e.target.value, 10);
        onFilterChange({ 
            ...filters, 
            priceRange: { 
                min: 0, 
                max: newMaxPrice,
                label: `Up to ${formatPriceToIDR(newMaxPrice)}` 
            } 
        });
    };

    return (
        <>
            {/* Mobile Filter Overlay */}
            {isMobileFilterOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onCloseMobileFilter}
                />
            )}

            {/* Sidebar */}
            <div className={`
                bg-white rounded-3xl shadow-xl border border-gray-100 p-6 h-fit transition-all duration-300
                lg:sticky lg:top-24 lg:block
                ${isMobileFilterOpen 
                    ? 'fixed left-4 right-4 top-24 bottom-4 z-50 overflow-y-auto lg:static lg:z-auto' 
                    : 'hidden lg:block'
                }
            `}>
                {/* Mobile Header */}
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button 
                        onClick={onCloseMobileFilter}
                        className="p-2 hover:bg-gray-100 rounded-xl"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Clear All Filters */}
                <div className="mb-6">
                    <button
                        onClick={() => onFilterChange({
                            categories: [],
                            priceRange: null,
                            minRating: 0,
                            searchQuery: ''
                        })}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                        Clear All Filters
                    </button>
                </div>

                {/* Price Range Slider Filter */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <button
                        className="flex justify-between items-center w-full text-left font-bold text-gray-900 mb-4"
                        onClick={() => setPriceRangeOpen(!priceRangeOpen)}
                    >
                        <span>Price Range</span>
                        {priceRangeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {priceRangeOpen && (
                        <div className="space-y-4">
                            <div className="text-lg font-bold text-indigo-600">
                                {formatPriceToIDR(currentMinPrice)} - {formatPriceToIDR(currentMaxPrice)}
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={initialMaxPrice}
                                step="100000" // Langkah 100rb, sesuaikan jika perlu
                                value={currentMaxPrice}
                                onChange={handlePriceSliderChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-600"
                            />
                            <div className='flex justify-between text-xs text-gray-500'>
                                <span>{formatPriceToIDR(0)}</span>
                                <span>{formatPriceToIDR(initialMaxPrice)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories Filter (Checkbox) */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <button
                        className="flex justify-between items-center w-full text-left font-bold text-gray-900 mb-4"
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                    >
                        <span>Categories</span>
                        {categoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {categoriesOpen && (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {categories.map((category, index) => (
                                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category)}
                                        onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rating Filter (Clickable Stars) */}
                <div className="pb-2">
                    <button
                        className="flex justify-between items-center w-full text-left font-bold text-gray-900 mb-4"
                        onClick={() => setRatingOpen(!ratingOpen)}
                    >
                        <span>Customer Rating</span>
                        {ratingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {ratingOpen && (
                        <div className="space-y-3">
                            {ratings.map((rating) => (
                                <div key={rating}>
                                    <button 
                                        className={`flex items-center space-x-1 p-2 rounded-lg transition-colors w-full text-left ${
                                            filters.minRating === rating 
                                                ? 'bg-amber-100 text-amber-800 font-semibold' 
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleRatingChange(rating)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-sm ml-1">{rating}</span>
                                        </div>
                                        {filters.minRating === rating && <X className="w-4 h-4 ml-auto" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// =========================================================
// Komponen Utama ProductPage
// =========================================================

const ITEMS_PER_PAGE = 12;

export default function ProductPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    // ⭐ DITAMBAHKAN: useLocation untuk membaca query parameter
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    const [notification, setNotification] = useState({ isVisible: false, message: '' });
    
    // Filter states - inisialisasi awal dengan nilai default
    const [filters, setFilters] = useState({
        categories: [],
        priceRange: null, 
        minRating: 0,
        searchQuery: ''
    });

    // Fungsi untuk menutup notifikasi
    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    // Handler navigasi ke halaman detail produk
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };
    
    // ⭐ Handler Add to Cart BARU (Menggunakan API Backend)
    const handleAddToCart = useCallback(async (product) => {
        if (!isAuthenticated) {
            setNotification({
                isVisible: true,
                message: "Please log in first to add items to your cart."
            });
            setTimeout(() => navigate('/login'), 1000); 
            return; 
        }

        if (!product || !product.id) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const quantity = 1;
            const itemUnit = product.unit || 'Unit';

            const response = await cartService.addToCart(product.id, quantity, token);
            
            if (response.success) {
                setNotification({
                    isVisible: true,
                    message: response.message || `1 ${itemUnit} ${product.name} successfully added to cart!`
                });
                
                window.dispatchEvent(new Event('cartUpdated'));

            } else {
                setNotification({
                    isVisible: true,
                    message: response.message || 'Failed to add item to cart.'
                });
            }
            
        } catch (err) {
            console.error('Error adding to cart:', err);
            setNotification({
                isVisible: true,
                message: 'Network or server error. Failed to add item to cart.'
            });
        }
        
    }, [isAuthenticated, navigate]); 
    // --- END Handler Add to Cart BARU ---


    // Calculate max price for the slider
    const maxPrice = useMemo(() => {
        return products.length > 0 
            ? Math.ceil(Math.max(...products.map(p => p.price)) / 100000) * 100000
            : 10000000;
    }, [products]);


    // Extract unique categories
    const categories = useMemo(() => 
        [...new Set(products.map(product => product.category_name).filter(Boolean).map(c => c.toUpperCase()))].sort()
    , [products]);

    // ⭐ DITAMBAHKAN: Efek untuk membaca query parameter saat mount/URL berubah
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const categoryQuery = query.get('category');
        
        if (categoryQuery && categoryQuery !== filters.categories[0]) {
            setFilters(prevFilters => ({
                ...prevFilters,
                categories: [categoryQuery], 
                searchQuery: ''
            }));
        } 
        // Opsional: Jika navigasi kembali ke /shop tanpa query, reset filter kategori
        else if (!categoryQuery && filters.categories.length > 0 && location.pathname === '/shop') {
             setFilters(prevFilters => ({
                ...prevFilters,
                categories: [],
            }));
        }
    }, [location.search, location.pathname]);


    // Data Fetching
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');
                const productsResponse = await apiService.getProducts();

                if (productsResponse.success && Array.isArray(productsResponse.products)) {
                    const validProducts = productsResponse.products
                        .filter(p => p.image)
                        .map(p => ({
                            ...p,
                            category_name: p.category_name ? p.category_name.toUpperCase() : 'OTHER',
                            simulatedRating: Math.max(1, (p.id % 5) + 1 - 1),
                            unit: p.unit || 'Unit'
                        })); 
                    setProducts(validProducts);
                } else if (productsResponse.error) {
                    setError(`Products: ${productsResponse.error}`);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Error connecting to server. Please ensure the backend is running on port 8080.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter Application Logic
    useEffect(() => {
        let filtered = products;

        // Search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                (product.category_name && product.category_name.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (filters.categories.length > 0) {
            filtered = filtered.filter(product =>
                filters.categories.includes(product.category_name)
            );
        }

        // Price range filter (from slider)
        if (filters.priceRange && filters.priceRange.max < maxPrice) {
            filtered = filtered.filter(product => {
                return product.price <= filters.priceRange.max;
            });
        }
        else if (filters.priceRange && filters.priceRange.max === maxPrice) {
            // Do nothing, no price filter applied
        }


        // Rating filter
        if (filters.minRating > 0) {
            filtered = filtered.filter(product => {
                return product.simulatedRating >= filters.minRating; 
            });
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [filters, products, maxPrice]);

    // Pagination Logic (No change)
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            document.getElementById('product-grid-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Component for Pagination Buttons (No change)
    const Pagination = useCallback(() => {
        const pageNumbers = [];
        const maxPagesToShow = 5; 
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, currentPage + Math.floor(maxPagesToShow / 2));

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        if (endPage - startPage + 1 < maxPagesToShow) {
            endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        const pageButtonClass = (page) => `w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-colors duration-300 ${
            page === currentPage
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
        }`;

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-12">
                <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button onClick={() => handlePageChange(1)} className={pageButtonClass(1)}>1</button>
                            {startPage > 2 && <span className="text-gray-500">...</span>}
                        </>
                    )}

                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={pageButtonClass(number)}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
                            <button onClick={() => handlePageChange(totalPages)} className={pageButtonClass(totalPages)}>{totalPages}</button>
                        </>
                    )}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
        );
    }, [currentPage, filteredProducts.length, totalPages, startIndex]);

    const MAIN_CONTAINER_CLASS = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className={`${MAIN_CONTAINER_CLASS} py-20`}>
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                        <p className="text-xl font-black text-indigo-600">Loading All Products...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            
            {/* INTEGRASI KOMPONEN NOTIFIKASI */}
            <CartNotification 
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className={`${MAIN_CONTAINER_CLASS} py-16`}>
                {error && (
                    <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                        <span className="font-medium">{error}</span>
                    </div>
                )}
                
                {/* Product Header & Main Search/Filter Button */}
                <div id="product-grid-start" className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b pb-8 space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center space-x-3">
                            <Package2 className="w-8 h-8 text-indigo-600" />
                            <span>All Products ({filteredProducts.length})</span>
                        </h1>
                        <p className="text-lg text-gray-600 mt-2">Browse the complete collection of our premium inventory</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        {/* Search Input in Header for better visibility */}
                        <div className="relative flex-1 lg:w-64">
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        </div>
                        {/* Mobile Filter Button */}
                        <button 
                            className="flex items-center space-x-2 bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm lg:hidden"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                            maxPrice={maxPrice}
                            isMobileFilterOpen={isMobileFilterOpen}
                            onCloseMobileFilter={() => setIsMobileFilterOpen(false)}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Active Filters (No change) */}
                        {(filters.categories.length > 0 || (filters.priceRange && filters.priceRange.max < maxPrice) || filters.minRating > 0 || filters.searchQuery) && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {/* Search Filter Tag */}
                                {filters.searchQuery && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        Search: "{filters.searchQuery}"
                                        <button
                                            onClick={() => setFilters({ ...filters, searchQuery: '' })}
                                            className="ml-2 hover:text-indigo-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {/* Category Filter Tags */}
                                {filters.categories.map(category => (
                                    <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {category}
                                        <button
                                            onClick={() => setFilters({
                                                ...filters,
                                                categories: filters.categories.filter(c => c !== category)
                                            })}
                                            className="ml-2 hover:text-blue-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {/* Price Range Filter Tag (Only show if max is less than the actual maxPrice) */}
                                {filters.priceRange && filters.priceRange.max < maxPrice && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Price: Up to {formatPriceToIDR(filters.priceRange.max)}
                                        <button
                                            onClick={() => setFilters({ ...filters, priceRange: null })}
                                            className="ml-2 hover:text-green-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {/* Rating Filter Tag */}
                                {filters.minRating > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        Rating: {filters.minRating}+ stars
                                        <button
                                            onClick={() => setFilters({ ...filters, minRating: 0 })}
                                            className="ml-2 hover:text-amber-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products */}
                        {paginatedProducts.length > 0 ? (
                            <>
                                {/* Grid: 1 on small, 2 on medium/large, and 3 on extra-large/larger screens */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {paginatedProducts.map((product, index) => (
                                        <ProductCard 
                                            key={product.id || index} 
                                            product={product} 
                                            onProductClick={handleProductClick} 
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && <Pagination />}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => setFilters({
                                        categories: [],
                                        priceRange: null,
                                        minRating: 0,
                                        searchQuery: ''
                                    })}
                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}