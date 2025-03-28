import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/users/register', data),
  login: (data: { emailOrUsername: string; password: string }) =>
    api.post('/users/login', data),
  forgotPassword: (data: { email: string }) => 
    api.post('/users/forgot-password', data),
  verifyOTP: (data: { email: string; otp: string }) => 
    api.post('/users/verify-otp', data),
  getProfile: () => api.get('/users/profile'),
  getLeaderboard: () => api.get('/users/leaderboard'),
  getUserAnswers: () => api.get('/users/answers'),
};

// Questions API
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  getById: (id: string) => api.get(`/questions/${id}`),
  create: (data: { title: string; content: string; tags: string[] }) =>
    api.post('/questions', data),
  update: (id: string, data: { title: string; content: string; tags: string[] }) =>
    api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
  upvote: (id: string) => api.put(`/questions/${id}/upvote`),
  downvote: (id: string) => api.put(`/questions/${id}/downvote`),
};

// Answers API
export const answersAPI = {
  create: (questionId: string, data: { content: string }) =>
    api.post(`/questions/${questionId}/answers`, data),
  update: (id: string, data: { content: string }) =>
    api.put(`/answers/${id}`, data),
  delete: (id: string) => api.delete(`/answers/${id}`),
  accept: (id: string) => api.put(`/answers/${id}/accept`),
  upvote: (id: string) => api.put(`/answers/${id}/upvote`),
  downvote: (id: string) => api.put(`/answers/${id}/downvote`),
};

export default api; 