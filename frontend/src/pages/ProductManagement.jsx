import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SidebarAdmin from '../components/SidebarAdmin.jsx';
import { Box, Plus, Edit, Trash, Save, XCircle, Image as ImageIcon, Loader2, Scale } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

// ----------------------------------------------------
// 🎯 FUNGSI BARU UNTUK MENGUBAH PATH RELATIF MENJADI URL ABSOLUT
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
  // Pastikan API_BASE_URL (http://localhost:8080) tidak diakhiri slash ganda dengan path
  const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const imagePath = path.startsWith('/') ? path : `/${path}`; 
  
  return basePath + imagePath;
};
// ----------------------------------------------------

const productService = {
  getProducts: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/product/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getCategories: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/product/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createProduct: async (formData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/product/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    console.log('🔄 Create Product Response Status:', response.status);
    const result = await response.json();
    console.log('📦 Create Product Response:', result);
    return result;
  },

  updateProduct: async (id, formData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/product/update/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    console.log('🔄 Update Product Response Status:', response.status);
    const result = await response.json();
    console.log('📦 Update Product Response:', result);
    return result;
  },

  deleteProduct: async (id) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/product/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

const emptyProduct = { 
  id: null, 
  name: '', 
  price: '', 
  categoryId: '', 
  image: '', 
  stock: '', 
  weight: '',
  description: '' 
};

const formatRupiah = (number) => {
  const num = typeof number === 'string' ? Number(number) : number;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const formatWeight = (weight) => {
  const numWeight = typeof weight === 'string' ? Number(weight) : weight;
  if (numWeight >= 1000) {
    return (numWeight / 1000).toFixed(2) + ' kg';
  } else {
    return numWeight + ' g';
  }
};

const ProductModal = ({ isOpen, onClose, productData, isEditing, onSave, categories, isLoading }) => {
  const [formData, setFormData] = useState(emptyProduct);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (productData && productData.id !== null) {
      setFormData({
        ...productData,
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        weight: productData.weight.toString(),
        categoryId: productData.category_id || productData.categoryId || '', 
      });
        // 🎯 PERBAIKAN DI SINI
      setImagePreview(getFullImageUrl(productData.image) || '');
    } else {
      setFormData(emptyProduct);
      setImagePreview('');
    }
    setSelectedImage(null);
    setErrors({});
  }, [productData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'stock' || name === 'weight') {
      // Memastikan hanya angka yang diizinkan, termasuk string kosong
      if (value === '' || /^[0-9]*$/.test(value)) { 
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      setSelectedImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Valid stock is required';
    if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!isEditing && !selectedImage) {
        newErrors.image = 'Product image is required for new products.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    submitData.append('Product[name]', formData.name);
    submitData.append('Product[description]', formData.description);
    submitData.append('Product[price]', formData.price);
    submitData.append('Product[stock]', formData.stock);
    submitData.append('Product[weight]', formData.weight);
    submitData.append('Product[category_id]', formData.categoryId);
    if (selectedImage) {
      submitData.append('Product[imageFile]', selectedImage);
    } else if (isEditing && formData.image) {
      submitData.append('Product[image]', formData.image);
    }

    console.log('📤 FormData contents:');
    for (let [key, value] of submitData.entries()) {
      console.log(`${key}:`, value);
    }

    const productToSave = {
      ...formData,
      formData: submitData
    };
    onSave(productToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-2xl font-bold text-neutral-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600" disabled={isLoading}>
            <XCircle />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='flex space-x-4'>
            <div className='flex-1'>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text" 
                name="name" 
                id="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className='w-1/3'>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
              <div className="relative">
                <input
                  type="text" 
                  name="price" 
                  id="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isLoading}
                  placeholder="e.g., 150000"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* GRID LAYOUT UNTUK CATEGORY, STOCK, WEIGHT*/}
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId" 
                id="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange} 
                required
                className={`w-full p-2 border rounded-md bg-white ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="text" 
                name="stock" 
                id="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
                className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
                placeholder="e.g., 50"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Scale className="w-4 h-4 mr-1" /> Weight (grams)
              </label>
              <input
                type="text" 
                name="weight" 
                id="weight" 
                value={formData.weight} 
                onChange={handleChange} 
                required 
                className={`w-full p-2 border rounded-md ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
                placeholder="e.g., 500"
              />
              {formData.weight && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatWeight(formData.weight)}
                </p>
              )}
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <label className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50">
                  <ImageIcon className='w-5 h-5 mr-2' /> 
                  {selectedImage ? 'Change Image' : (imagePreview ? 'Change Image' : 'Choose Image')}
                  <input 
                    type="file" 
                    className='hidden' 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    disabled={isLoading}
                  />
                </label>
                {(selectedImage || imagePreview) && (
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>

              {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
              {(selectedImage || imagePreview) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={imagePreview || null} // imagePreview sudah dipastikan URL Absolut
                    alt="Product preview" 
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      // Fallback jika URL Absolut pun gagal
                      e.target.src = 'https://placehold.co/128'; // Menggunakan ukuran yang konsisten dengan w-32 h-32
                    }}
                  />
                  {selectedImage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {!selectedImage && isEditing && formData.image && (
                    <p className="text-xs text-gray-500 mt-1">Current Image</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedImage ? 'Uploading...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> 
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductManagement = () => {
// ... (Bagian atas ProductManagement tidak berubah)
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductData, setCurrentProductData] = useState(emptyProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    } else if (isAuthenticated && user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    try {
      setPageLoading(true);
      setError('');
      
      const [categoriesResponse, productsResponse] = await Promise.all([
        productService.getCategories(),
        productService.getProducts()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      } else {
        setError('Failed to load categories');
      }

      if (productsResponse.success) {
        console.log('📸 Product Images Debug:', productsResponse.products.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          isFullUrl: p.image?.startsWith('http')
        })));
        setProducts(productsResponse.products);
      } else {
        setError('Failed to load products');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error connecting to server. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const openModal = (product = null) => {
    setCurrentProductData(product || emptyProduct);
    setIsEditing(!!product);
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setCurrentProductData(emptyProduct);
      setError('');
    }
  };

  const handleSaveProduct = async (productToSave) => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      
      console.log('🚀 Saving product...', {
        isEditing,
        hasImage: !!productToSave.formData.get('Product[imageFile]'),
        formData: productToSave.formData
      });

      if (isEditing) {
        response = await productService.updateProduct(productToSave.id, productToSave.formData);
      } else {
        response = await productService.createProduct(productToSave.formData);
      }

      console.log('✅ Save response:', response);

      if (response.success) {
        await loadData();
        closeModal();
      } else {
        let errorMessage = 'Operation failed';
        
        if (response.message) {
          errorMessage = response.message;
        }
        
        if (response.errors) {
          const allErrors = Object.values(response.errors).flat().join(', ');
          errorMessage = allErrors || errorMessage;
        }
        
        setError(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error saving product:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setError('');
        const response = await productService.deleteProduct(id);
        
        if (response.success) {
          await loadData();
        } else {
          setError(response.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Error deleting product. Please try again.');
      }
    }
  };

  if (isAuthenticated && user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  if (!isAuthenticated || !user || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-indigo-600">Loading Product Data...</p>
        </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      <SidebarAdmin currentPath={location.pathname} />

      <main className="flex-grow p-8 transition-all duration-300" style={{ marginLeft: '16rem' }}>
        <header className="mb-10 flex justify-between items-center pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-black text-neutral-900 flex items-center">
            <Box className="w-8 h-8 mr-3 text-indigo-600" />
            Product Management
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            disabled={pageLoading}
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Product
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" /> Add New Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-3">Image</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Price (Rp)</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">Weight</th><th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                            // 🎯 PERBAIKAN UTAMA: Gunakan getFullImageUrl
                          src={getFullImageUrl(product.image) || "https://placehold.co/60"} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-md" 
                          onError={(e) => {
                            // Mengganti placeholder lama dengan yang stabil
                            e.target.src = 'https://placehold.co/60';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                        {product.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {product.category_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-bold">{formatRupiah(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {formatWeight(product.weight)}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        productData={currentProductData}
        isEditing={isEditing}
        onSave={handleSaveProduct}
        categories={categories}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductManagement;