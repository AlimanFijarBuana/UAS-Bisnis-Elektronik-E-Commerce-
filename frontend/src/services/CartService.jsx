// services/CartService.js
const API_BASE_URL = 'http://localhost:8080';

export const cartService = {
    // Get user's cart
    getCart: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch cart');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    // Add item to cart
    addToCart: async (productId, quantity, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });
            
            if (!response.ok) throw new Error('Failed to add to cart');
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    // Update item quantity
    updateCartItem: async (productId, quantity, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });
            
            if (!response.ok) throw new Error('Failed to update cart');
            return await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (productId, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });
            
            if (!response.ok) throw new Error('Failed to remove from cart');
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    // Clear cart
    clearCart: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to clear cart');
            return await response.json();
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    },

    // Get cart count
    getCartCount: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to get cart count');
            return await response.json();
        } catch (error) {
            console.error('Error getting cart count:', error);
            throw error;
        }
    }
};