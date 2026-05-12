/**
 * API Client for House of Styles Backend
 * Handles all communication with the Express API
 */

class APIClient {
  constructor(baseURL) {
    if (!baseURL) {
      if (window.HOS_CONFIG?.apiBaseUrl) {
        this.baseURL = window.HOS_CONFIG.apiBaseUrl;
      } else {
      // Auto-detect base URL
      if (window.location.protocol === 'file:') {
        // We are likely in an Android/iOS app WebView
        this.baseURL = 'http://10.0.2.2:5001/api'; // Android emulator address
      } else {
        // Use the current hostname so it works on other devices on the same Wi-Fi
        const hostname = window.location.hostname || 'localhost';
        this.baseURL = `http://${hostname}:5001/api`;
      }
      }
    } else {
      this.baseURL = baseURL;
    }
    this.token = this.getToken();
    this.user = this.getUser();
  }

  // Token Management
  setToken(token) {
    this.token = token;
    localStorage.setItem('houseOfTailor-token', token);
  }

  getToken() {
    return localStorage.getItem('houseOfTailor-token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('houseOfTailor-token');
    localStorage.removeItem('houseOfTailor-user');
    this.user = null;
  }

  // User Management
  setUser(user) {
    this.user = user;
    localStorage.setItem('houseOfTailor-user', JSON.stringify(user));
  }

  getUser() {
    try {
      const user = localStorage.getItem('houseOfTailor-user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API Response] ${response.status} from ${url}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      // Fallback for visual testing if backend is unreachable
      if (endpoint.startsWith('/products')) {
        console.warn('Backend unreachable. Check if server is running at:', this.baseURL);
      }
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  async register(email, password, firstName, lastName, phone) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    });

    if (response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
      this.setUser(response.user);
    }

    return response;
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', { method: 'POST' });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // ==================== PRODUCT ENDPOINTS ====================

  async getProducts(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.category) params.append('category', options.category);
    if (options.audience) params.append('audience', options.audience);
    if (options.search) params.append('search', options.search);
    if (options.isFeatured) params.append('isFeatured', options.isFeatured);

    return this.request(`/products?${params.toString()}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async addProductReview(productId, rating, comment) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // ==================== ORDER ENDPOINTS ====================

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);

    return this.request(`/orders?${params.toString()}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id, cancelReason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancelReason }),
    });
  }

  // ==================== CUSTOM ORDER ENDPOINTS ====================

  async createCustomOrder(customOrderData) {
    return this.request('/custom-orders', {
      method: 'POST',
      body: JSON.stringify(customOrderData),
    });
  }

  async getCustomOrders(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);

    return this.request(`/custom-orders?${params.toString()}`);
  }

  async getCustomOrder(id) {
    return this.request(`/custom-orders/${id}`);
  }

  async acceptCustomOrder(id) {
    return this.request(`/custom-orders/${id}/accept`, { method: 'POST' });
  }

  async rejectCustomOrder(id, rejectionReason) {
    return this.request(`/custom-orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async communicateCustomOrder(id, message, attachments = []) {
    return this.request(`/custom-orders/${id}/communicate`, {
      method: 'POST',
      body: JSON.stringify({ message, attachments }),
    });
  }

  // ==================== USER ENDPOINTS ====================

  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getUserMembership() {
    return this.request('/users/membership');
  }

  async addShippingAddress(addressData) {
    return this.request('/users/add-shipping-address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateShippingAddress(addressId, addressData) {
    return this.request(`/users/shipping-address/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteShippingAddress(addressId) {
    return this.request(`/users/shipping-address/${addressId}`, {
      method: 'DELETE',
    });
  }

  async getAllUsers(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.search) params.append('search', options.search);
    if (options.role) params.append('role', options.role);

    return this.request(`/users?${params.toString()}`);
  }

  // ==================== MEMBERSHIP ENDPOINTS ====================

  async getMembershipTiers() {
    return this.request('/memberships');
  }

  async getMembershipTier(id) {
    return this.request(`/memberships/${id}`);
  }

  async upgradeMembership(tierName, duration = 'annual') {
    return this.request('/memberships/upgrade', {
      method: 'POST',
      body: JSON.stringify({ tierName, duration }),
    });
  }

  async cancelMembership() {
    return this.request('/memberships/cancel', { method: 'POST' });
  }

  async createMembershipTier(tierData) {
    return this.request('/memberships', {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  }

  async updateMembershipTier(id, tierData) {
    return this.request(`/memberships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  }

  // ==================== PAYMENT ENDPOINTS ====================

  async createPaymentIntent(orderId) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async initiateUPIPayment(orderId, upiId) {
    return this.request('/payments/upi-initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, upiId }),
    });
  }

  async confirmPayment(orderId, paymentMethod, transactionId) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentMethod, transactionId }),
    });
  }

  // ==================== STYLE ENDPOINTS ====================

  async createStyle(styleData) {
    return this.request('/styles', {
      method: 'POST',
      body: JSON.stringify(styleData),
    });
  }

  async getStyles(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.category) params.append('category', options.category);
    if (options.isFeatured) params.append('isFeatured', options.isFeatured);

    return this.request(`/styles?${params.toString()}`);
  }

  async getStyle(id) {
    return this.request(`/styles/${id}`);
  }

  async updateStyle(id, styleData) {
    return this.request(`/styles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(styleData),
    });
  }

  async deleteStyle(id) {
    return this.request(`/styles/${id}`, { method: 'DELETE' });
  }

  async likeStyle(id) {
    return this.request(`/styles/${id}/like`, { method: 'POST' });
  }

  async unlikeStyle(id) {
    return this.request(`/styles/${id}/unlike`, { method: 'POST' });
  }

  async saveStyle(id) {
    return this.request(`/styles/${id}/save`, { method: 'POST' });
  }

  async unsaveStyle(id) {
    return this.request(`/styles/${id}/unsave`, { method: 'POST' });
  }

  async commentStyle(id, text) {
    return this.request(`/styles/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    return this.request('/health');
  }
}

// Initialize global API client
const api = new APIClient();
