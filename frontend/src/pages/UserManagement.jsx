import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SidebarAdmin from '../components/SidebarAdmin.jsx';
import { Users, Plus, Edit, Trash, Save, XCircle, Mail, Shield, Loader2 } from 'lucide-react';

// Service untuk API calls
const API_BASE_URL = 'http://localhost:8080';

const userService = {
  getUsers: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createUser: async (userData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  updateUser: async (id, userData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/update/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  deleteUser: async (id) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

const emptyUser = { id: null, username: '', email: '', role: 'user', status: 'Active' };
const ROLES = ['user', 'admin'];

// --- Komponen Modal DIPISAHKAN ---
const UserModal = ({ isOpen, onClose, userData, isEditing, onSave, currentUser, isLoading }) => {
    const [formData, setFormData] = useState(emptyUser);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (userData && userData.id !== null) {
            setFormData(userData);
        } else {
            setFormData(emptyUser);
        }
        setErrors({});
    }, [userData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.role) newErrors.role = 'Role is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const userToSave = {
            ...formData,
            id: isEditing ? Number(formData.id) : null,
        };
        
        onSave(userToSave);
    };
    
    const isCurrentUserAdmin = currentUser.role === 'admin' && currentUser.id === formData.id;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-5">
                    <h3 className="text-2xl font-bold text-neutral-900">
                        {isEditing ? `Edit User: ${formData.username}` : 'Add New User'}
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
                    
                    {/* Baris 1: Username & Email */}
                    <div className='flex space-x-4'>
                        <div className='flex-1'>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text" 
                                name="username" 
                                id="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                required
                                className={`w-full p-2 border rounded-md ${
                                    errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isEditing || isLoading}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                            )}
                        </div>
                        <div className='flex-1'>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email" 
                                name="email" 
                                id="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required
                                className={`w-full p-2 border rounded-md ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Baris 2: Role & Status */}
                    <div className='flex space-x-4'>
                        <div className='flex-1'>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                name="role" 
                                id="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                required
                                className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white ${
                                    errors.role ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isCurrentUserAdmin || isLoading}
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                            {errors.role && (
                                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                            )}
                            {isCurrentUserAdmin && <p className='text-xs text-yellow-600 mt-1'>Cannot change own role.</p>}
                        </div>
                        <div className='flex-1'>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status" 
                                id="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                disabled={isLoading}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
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
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> 
                                    {isEditing ? 'Save Changes' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const { isAuthenticated, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State CRUD
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(emptyUser); 
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    // Load users from API on component mount
    useEffect(() => {
        if (isAuthenticated && currentUser?.role === 'admin') {
            loadUsers();
        } else if (isAuthenticated && currentUser?.role !== 'admin') {
            navigate('/');
        }
    }, [isAuthenticated, currentUser, navigate]);

    const loadUsers = async () => {
        try {
            setPageLoading(true);
            setError('');
            const response = await userService.getUsers();
            
            if (response.success) {
                setUsers(response.users);
            } else {
                setError(response.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Error connecting to server. Please try again.');
        } finally {
            setPageLoading(false);
        }
    };

    const openModal = (user = null) => {
        setCurrentUserData(user || emptyUser);
        setIsEditing(!!user);
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        if (!isLoading) {
            setIsModalOpen(false);
            setCurrentUserData(emptyUser);
            setError('');
        }
    };

    const handleSaveUser = async (userToSave) => {
        setIsLoading(true);
        setError('');

        try {
            let response;
            
            if (isEditing) {
                response = await userService.updateUser(userToSave.id, {
                    email: userToSave.email,
                    role: userToSave.role,
                    username: userToSave.username
                    // Status tidak dikirim karena tidak ada di database
                });
            } else {
                response = await userService.createUser({
                    username: userToSave.username,
                    email: userToSave.email,
                    role: userToSave.role
                    // Status tidak dikirim karena tidak ada di database
                });
            }

            if (response.success) {
                await loadUsers(); // Reload data dari server
                closeModal();
            } else {
                setError(response.message || 'Operation failed');
                if (response.errors) {
                    // Handle validation errors from server
                    const errorMsg = Object.values(response.errors)[0];
                    setError(errorMsg || 'Validation error');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) {
            alert("You cannot delete your own admin account!");
            return;
        }

        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                setError('');
                const response = await userService.deleteUser(id);
                
                if (response.success) {
                    await loadUsers(); // Reload data dari server
                } else {
                    setError(response.message || 'Delete failed');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                setError('Error deleting user. Please try again.');
            }
        }
    };

    // Redirect if not admin
    if (isAuthenticated && currentUser?.role !== 'admin') {
        navigate('/');
        return null;
    }

    // Loading state
    if (!isAuthenticated || !currentUser || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-xl font-medium text-indigo-600">Loading User Data...</p>
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
                        <Users className="w-8 h-8 mr-3 text-indigo-600" />
                        User Management
                    </h1>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                        disabled={pageLoading}
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New User
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

                {/* Users Table */}
                <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    {users.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first user.</p>
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2 inline" /> Add New User
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                        <th className="px-6 py-3">User ID</th>
                                        <th className="px-6 py-3">Username</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{user.id}</td>
                                            <td className="px-6 py-4">
                                                <p className='font-medium'>@{user.username}</p> 
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role === 'admin' 
                                                        ? 'bg-indigo-100 text-indigo-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                                <button 
                                                    onClick={() => openModal(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={user.id === currentUser.id}
                                                    title={user.id === currentUser.id ? "Cannot delete your own account" : "Delete User"}
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
            <UserModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                userData={currentUserData}
                isEditing={isEditing}
                onSave={handleSaveUser}
                currentUser={currentUser}
                isLoading={isLoading}
            />

        </div>
    );
};

export default UserManagement;