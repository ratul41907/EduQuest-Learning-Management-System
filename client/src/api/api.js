import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/v2';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || 
                    error.response?.data?.message || 
                    'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ==================== COURSES ====================
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/enrollments/my-courses'),
};

// ==================== LESSONS ====================
export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  markComplete: (id) => api.post(`/lessons/${id}/complete`),
  getProgress: (courseId) => api.get(`/lessons/progress/${courseId}`),
};

// ==================== QUIZZES ====================
export const quizAPI = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  attempt: (id, answers) => api.post(`/quizzes/${id}/attempt`, { answers }),
  getMyAttempts: (quizId) => api.get(`/quizzes/${quizId}/my-attempts`),
  getAttemptById: (attemptId) => api.get(`/quiz-attempts/${attemptId}`),
};

// ==================== LEADERBOARD ====================
export const leaderboardAPI = {
  getAllTime: (limit = 10) => api.get('/leaderboard/all-time', { params: { limit } }),
  getWeekly: (limit = 10) => api.get('/leaderboard/weekly', { params: { limit } }),
};
// ==================== CERTIFICATES ====================
export const certificateAPI = {
  getMyCertificates: () => api.get('/certificates/my'),
  getById: (id) => api.get(`/certificates/${id}`),
  download: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
};

// ==================== NOTIFICATIONS ====================
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/my'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
// ==================== BADGES ====================
export const badgeAPI = {
  getAll: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/my-badges'),
};

// ==================== ADMIN ====================
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;