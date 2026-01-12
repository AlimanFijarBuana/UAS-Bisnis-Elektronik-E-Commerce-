import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SidebarAdmin from '../components/SidebarAdmin.jsx';
import { List, Plus, Edit, Trash, Save, XCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

// API Base URL
const API_BASE_URL = 'http://localhost:8080';

// Service untuk API calls (TETAP SAMA)
const categoryService = {
  getCategories: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/category/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createCategory: async (formData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/category/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  updateCategory: async (id, formData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/category/update/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  deleteCategory: async (id) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/category/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

const emptyCategory = { id: null, name: '', slug: '', image: '' };

// --- Komponen Modal ---
const CategoryModal = ({ isOpen, onClose, categoryData, isEditing, onSave, isLoading }) => {
  const [formData, setFormData] = useState(emptyCategory);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoryData && categoryData.id !== null) {
      setFormData(categoryData);
      // Jika ada URL gambar lama, gunakan sebagai preview
      setImagePreview(categoryData.image ? `${API_BASE_URL}${categoryData.image}` : '');
    } else {
      setFormData(emptyCategory);
      setImagePreview('');
    }
    setSelectedImage(null);
    setErrors({});
  }, [categoryData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newSlug = formData.slug;

    if (name === 'name') {
      // Auto-generate slug dari nama
      newSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value, slug: newSlug }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setSelectedImage(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
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
    // Hapus data URL gambar lama dari form data agar server tahu gambar dihapus/kosong
    setFormData(prev => ({ ...prev, image: '' })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
    // VALIDASI TAMBAHAN: Untuk Create, gambar wajib diunggah
    if (!isEditing && !selectedImage) {
        newErrors.image = 'Category image is required for new categories.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('slug', formData.slug);
    
    // 1. Jika ada file baru yang dipilih, unggah file tersebut
    if (selectedImage) {
      submitData.append('image', selectedImage);
    } 
    // 2. Jika tidak ada file baru, tapi form data 'image' kosong (artinya dihapus oleh user),
    //    kita kirimkan sinyal untuk menghapus gambar lama di server (misalnya dengan nilai 'null' atau string kosong)
    else if (isEditing && formData.image === '') {
        submitData.append('image', '');
    }
    // 3. Jika tidak ada file baru dan tidak dihapus, biarkan saja FormData,
    //    Controller Yii akan tahu tidak ada perubahan pada gambar.

    const categoryToSave = {
      ...formData,
      formData: submitData
    };
    
    onSave(categoryToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-2xl font-bold text-neutral-900">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-red-600"
            disabled={isLoading}
          >
            <XCircle />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className={`w-full p-2 border bg-gray-50 rounded-md ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              title="Slug is auto-generated but can be manually edited."
            />
            {errors.slug && (
              <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            <div className="space-y-3">
              {/* File Upload */}
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

              {errors.image && (
                <p className="text-red-500 text-xs">{errors.image}</p>
              )}

              {/* Image Preview */}
              {(imagePreview || selectedImage) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Category preview" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                  {selectedImage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {!selectedImage && formData.image && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current Image URL: {formData.image.length > 30 ? formData.image.substring(0, 30) + '...' : formData.image}
                    </p>
                  )}
                </div>
              )}
              
              {/* Bagian input URL yang dihapus */}
              {/* <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">Or enter image URL:</p>
                <input
                  type="text" 
                  name="image" 
                  value={formData.image} 
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isLoading || selectedImage}
                />
              </div> */}

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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> 
                  {isEditing ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Komponen Utama ---
const CategoryManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State CRUD
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategoryData, setCurrentCategoryData] = useState(emptyCategory);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data from API
  useEffect(() => {
    // Redirect jika belum login
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    
    // Redirect jika bukan admin (setelah data user dimuat)
    if (isAuthenticated && user?.role === 'admin') {
      loadCategories();
    } else if (isAuthenticated && user?.role && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const loadCategories = async () => {
    try {
      setPageLoading(true);
      setError('');
      
      const response = await categoryService.getCategories();

      if (response.success) {
        setCategories(response.categories);
      } else {
        setError(response.message || 'Failed to load categories');
      }

    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Error connecting to server. Please check API URL and connection.');
    } finally {
      setPageLoading(false);
    }
  };

  const openModal = (category = null) => {
    setCurrentCategoryData(category || emptyCategory);
    setIsEditing(!!category);
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setCurrentCategoryData(emptyCategory);
      setError('');
    }
  };

  const handleSaveCategory = async (categoryToSave) => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (isEditing) {
        response = await categoryService.updateCategory(categoryToSave.id, categoryToSave.formData);
      } else {
        response = await categoryService.createCategory(categoryToSave.formData);
      }

      if (response.success) {
        await loadCategories(); // Reload data from server
        closeModal();
      } else {
        // Penanganan error dari response API
        let errorMessage = response.message || 'Operation failed';
        if (response.errors) {
          // Ambil pesan error pertama dari validasi Yii
          const firstErrorKey = Object.keys(response.errors)[0];
          if (firstErrorKey) {
            errorMessage = response.errors[firstErrorKey].join(', ') || 'Validation error';
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        setError('');
        const response = await categoryService.deleteCategory(id);
        
        if (response.success) {
          await loadCategories(); // Reload data from server
        } else {
          setError(response.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Error deleting category. Please try again.');
      }
    }
  };

  // Redirecting... (disederhanakan karena sudah ada di useEffect)
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-indigo-600">Loading Categories...</p>
        </div>
      </div>
    );
  }

  // Jika otentikasi gagal atau bukan admin, navigasi sudah diurus oleh useEffect
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      <SidebarAdmin currentPath={location.pathname} />

      <main className="flex-grow p-8 transition-all duration-300" style={{ marginLeft: '16rem' }}>
        <header className="mb-10 flex justify-between items-center pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-black text-neutral-900 flex items-center">
            <List className="w-8 h-8 mr-3 text-indigo-600" />
            Category Management
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            disabled={pageLoading}
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Category
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')} 
                className="text-red-700 hover:text-red-900"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" /> Add New Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-3">Image</th>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={category.image ? `${API_BASE_URL}${category.image}` : 'https://via.placeholder.com/60?text=No+Image'} 
                          alt={category.name} 
                          className="w-12 h-12 object-cover rounded-md" 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{category.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <button 
                          onClick={() => openModal(category)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Category"
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

      {/* Modal CRUD */}
      <CategoryModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        categoryData={currentCategoryData}
        isEditing={isEditing}
        onSave={handleSaveCategory}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CategoryManagement;