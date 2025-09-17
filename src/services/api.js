import axios from 'axios';

const API_BASE_URL =  'https://m-s-t-b.onrender.com/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Todo endpoints
  async getTodos(params = {}) {
    const response = await this.api.get('/todos', { params });
    return response.data;
  }

  async getTodoById(id) {
    const response = await this.api.get(`/todos/${id}`);
    return response.data;
  }

  async createTodo(todoData) {
    const response = await this.api.post('/todos', todoData);
    return response.data;
  }

  async updateTodo(id, todoData) {
    const response = await this.api.put(`/todos/${id}`, todoData);
    return response.data;
  }

  async deleteTodo(id) {
    const response = await this.api.delete(`/todos/${id}`);
    return response.data;
  }

  
async addUser(userData) {
  const response = await this.api.post('/admin/users', userData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}


  async getTodaysTodos() {
    const response = await this.api.get('/todos/today');
    return response.data;
  }

  async getOverdueTodos() {
    const response = await this.api.get('/todos/overdue');
    return response.data;
  }

  // User/Profile endpoints
  async updateProfile(userData) {
    const response = await this.api.put('/users/profile', userData);
    return response.data;
  }

  async uploadProfileImage(formData) {
    const response = await this.api.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getUserStats() {
    const response = await this.api.get('/users/stats');
    return response.data;
  }

  async changePassword(passwordData) {
    const response = await this.api.put('/users/password', passwordData);
    return response.data;
  }

  async deleteAccount() {
    const response = await this.api.delete('/users/account');
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard() {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }
// Admin assignment functionality
async assignTodoToUser(todoData) {
  const response = await this.api.post('/todos/assign', todoData);
  return response.data;
}

// Get users for assignment dropdow
// 
// Replace the existing admin methods in your ApiService class with these updated ones:

// Admin assignment functionality - UPDATE THIS METHOD


// Get users for assignment dropdown - UPDATE THIS METHOD
async getUsersForAssignment() {
  const response = await this.api.get('/admin/users'); // Use existing endpoint
  return response.data;
}

// Add this new method for getting all users (simpler version)
async getUsers(params = {}) {
  const response = await this.api.get('/admin/users', { params });
  return response.data;
}


// Get todos by group (enhanced grouping)
async getTodosByGroup(group) {
  const response = await this.api.get(`/todos/group/${group}`);
  return response.data;
}

// Search todos
async searchTodos(params) {
  const response = await this.api.get('/todos/search', { params });
  return response.data;
}

  async getAdminUsers(params = {}) {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async getUserDetails(userId, params = {}) {
    const response = await this.api.get(`/admin/users/${userId}`, { params });
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await this.api.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async getAllTodos(params = {}) {
    const response = await this.api.get('/admin/todos', { params });
    return response.data;
  }

  async getAdminReports() {
    const response = await this.api.get('/admin/reports');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;