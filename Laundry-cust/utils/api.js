// API Configuration and Service
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' // Development
  : 'https://your-production-api.com/api'; // Production - Update this

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    // Store token in AsyncStorage for persistence
    if (token) {
      // You can use AsyncStorage here if needed
      // AsyncStorage.setItem('authToken', token);
    }
  }

  getToken() {
    return this.token;
    // Or retrieve from AsyncStorage
    // return await AsyncStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(mobileNumber, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User endpoints
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePreferences(preferences) {
    return this.request('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Shop endpoints
  async getShops(latitude, longitude) {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude);
    if (longitude) params.append('longitude', longitude);
    
    const query = params.toString();
    return this.request(`/shops${query ? `?${query}` : ''}`);
  }

  async getShopById(shopId) {
    return this.request(`/shops/${shopId}`);
  }

  // Service endpoints
  async getServices() {
    return this.request('/services');
  }

  async getItems() {
    return this.request('/services/items/all');
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(itemData) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateCartItem(itemIndex, quantity) {
    return this.request(`/cart/update/${itemIndex}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemIndex) {
    return this.request(`/cart/remove/${itemIndex}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
  }

  // Payment endpoints
  async createPaymentOrder(amount, orderId) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  }

  async verifyPayment(paymentData) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Address endpoints
  async getAddresses() {
    return this.request('/addresses');
  }

  async createAddress(addressData) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications(isRead) {
    const params = isRead !== undefined ? `?isRead=${isRead}` : '';
    return this.request(`/notifications${params}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateLanguage(language) {
    return this.request('/settings/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  }

  async updateNotificationSettings(settings) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updatePrivacySettings(settings) {
    return this.request('/settings/privacy', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export default new ApiService();
