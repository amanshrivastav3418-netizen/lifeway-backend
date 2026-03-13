/**
 * API Service - Handles all backend API calls
 * Manages authentication tokens and HTTP requests
 * 
 * Configuration:
 * - For Production (Hostinger Frontend → Render Backend): Update API_BASE_URL below
 * - For Local Development: Use http://localhost:3000/api
 * 
 * @version 2.0
 * @requires Hostinger Frontend (this file)
 * @requires Render Backend (Node.js/Express)
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================
// IMPORTANT: Updated for Hostinger deployment
// All requests go to same server (no CORS needed)
// 
// Development: http://localhost:3000/api
// Production (Hostinger): https://lifewaycomputer.org/api
// 

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://lifewaycomputer.org/api'; // Hostinger production URL

const TOKEN_KEY = 'lifeway_auth_token';
const USER_KEY = 'lifeway_user_data';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * APIService Class - Centralized API communication
 * Handles all HTTP requests with automatic error handling and token management
 */
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem(TOKEN_KEY);
    this.requestTimeout = API_TIMEOUT;
    
    console.log(`🌐 API Service initialized: ${this.baseURL}`);
  }

  // ========================================================================
  // Token Management
  // ========================================================================
  
  setToken(token) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken() {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem(USER_KEY);
  }

  // ========================================================================
  // Header Management
  // ========================================================================

  getHeaders(isFormData = false) {
    const headers = {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    };

    // Add JWT token to headers if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // For FormData, let browser set Content-Type
    if (isFormData) {
      delete headers['Content-Type'];
    }

    return headers;

  // ========================================================================
  // Request Handling with Timeout & Retry
  // ========================================================================

  /**
   * Generic HTTP request method with timeout and error handling
   * Handles token refresh and automatic logout on 401
   * 
   * @param {string} endpoint - API endpoint (e.g., '/auth/login')
   * @param {object} options - Fetch options (method, body, headers, etc.)
   * @returns {Array} [success, data, error, status]
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = this.getHeaders(isFormData);

    const config = {
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      ...options,
    };

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout)
      );

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]);

      // Handle 401 Unauthorized - Token expired
      if (response.status === 401) {
        console.warn('⚠️ Unauthorized (401) - Token may have expired');
        this.removeToken();
        this.removeUser();
        
        // Show login page
        if (window.location.pathname !== '/index.html' && !window.location.search.includes('page=login')) {
          window.location.href = window.location.pathname + '?page=login';
        }
        
        return {
          success: false,
          error: 'Session expired. Please login again.',
          status: 401,
          data: null
        };
      }

      // Try to parse response as JSON
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: response.statusText };
      }

      // Check if response was OK
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ API Error [${response.status}] ${endpoint}:`, errorMessage);
        
        return {
          success: false,
          error: errorMessage,
          status: response.status,
          data: null
        };
      }

      console.log(`✓ API Success [${response.status}] ${endpoint}`);
      
      return {
        success: true,
        data: data.data || data,
        error: null,
        status: response.status
      };

    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error.message);
      
      // Distinguish between network errors and timeouts
      const errorMessage = error.message === 'Request timeout'
        ? 'Request timeout. Please check your connection and try again.'
        : error.message || 'Network error. Please try again.';
      
      return {
        success: false,
        error: errorMessage,
        status: 0,
        data: null
      };
    }
  }

  /**
   * Health check - Verify backend is accessible
   * @returns {boolean}
   */
  async healthCheck() {
    const result = await this.request('/health');
    return result.success;
  }

  // ========================================================================
  // Authentication API Methods
  // ========================================================================

  async login(enrollmentNo, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ enrollmentNo, password }),
    });

    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  async registerStudent(formData) {
    const response = await this.request('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  async registerCenter(formData) {
    const response = await this.request('/auth/register-center', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.removeToken();
    this.removeUser();
  }

  async changePassword(oldPassword, newPassword, confirmPassword) {
    return await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    });
  }

  // ========================================================================
  // Student APIs
  async getMyProfile() {
    return await this.request('/students/profile/me');
  }

  async updateProfile(formData) {
    return await this.request('/students/profile/me', {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  }

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    return await this.request('/students/profile/photo', {
      method: 'POST',
      body: formData,
    });
  }

  async getMyEnrollments() {
    return await this.request('/students/enrollments/my');
  }

  // Course APIs
  async getAllCourses(category = null) {
    let endpoint = '/courses';
    if (category) {
      endpoint += `?category=${encodeURIComponent(category)}`;
    }
    return await this.request(endpoint);
  }

  async getCourseById(id) {
    return await this.request(`/courses/${id}`);
  }

  async getCourseCategories() {
    return await this.request('/courses/categories');
  }

  async enrollCourse(courseId) {
    return await this.request('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  // Enrollment APIs
  async getEnrollments() {
    return await this.request('/enrollments');
  }

  async getEnrollment(id) {
    return await this.request(`/enrollments/${id}`);
  }

  async updateEnrollment(id, data) {
    return await this.request(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Document APIs
  async getMyDocuments() {
    return await this.request('/documents/my');
  }

  async getDocument(id) {
    return await this.request(`/documents/${id}`);
  }

  async verifyDocument(documentNumber) {
    return await this.request(`/documents/verify/${documentNumber}`);
  }

  // Center APIs
  async getCenters() {
    return await this.request('/centers');
  }

  async getMyCenterDetails() {
    return await this.request('/centers/my-center');
  }

  async updateCenterDetails(id, data) {
    return await this.request(`/centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Staff APIs
  async getStaffList() {
    return await this.request('/staff');
  }

  async getStaffMember(id) {
    return await this.request(`/staff/${id}`);
  }

  async updateStaffDetails(id, data) {
    return await this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard APIs
  async getStudentDashboard() {
    return await this.request('/dashboard/student');
  }

  async getCenterDashboard() {
    return await this.request('/dashboard/center');
  }

  async getAdminDashboard() {
    return await this.request('/dashboard/admin');
  }

  async getStaffDashboard() {
    return await this.request('/dashboard/staff');
  }

  // User APIs
  async getMyUser() {
    return await this.request('/users/me');
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken() {
    return this.token;
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token = null;
  }

  // Helper: Check if user has permission for a route
  canAccess(requiredRole) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    return userRole === requiredRole || userRole === 'super_admin';
  }
}

// Create global API service instance
const apiService = new APIService();
