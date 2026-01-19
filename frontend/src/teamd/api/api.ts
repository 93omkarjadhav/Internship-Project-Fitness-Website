import axios from "axios";

const apiBase = `${import.meta.env.VITE_BACKEND_URL}/api`;
const WELLNESS_BASE = "/wellness";

export const api = axios.create({
  baseURL: apiBase,
});

api.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    return Promise.reject(error);
  }
);

export const loginUser = (credentials: { email: string; password: string }) =>
  api.post("/auth/signin", credentials);

export const registerUser = (credentials: {
  email: string;
  password: string;
  name?: string;
  gender?: 'Female' | 'Male' | 'Other';
}) => api.post("/auth/signup", credentials);

export const forgotPassword = (data: { email: string }) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (data: {
  email: string;
  token: string;
  newPassword: string;
}) => api.post("/auth/reset-password", data);

export const getUserProfile = () => api.get(`${WELLNESS_BASE}/profile`);

export const updateUserProfile = (data: {
  fullName?: string;
  country?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  profile_image_url?: string | null;
}) => api.put(`${WELLNESS_BASE}/profile`, data);

export const updateUserProfileWithHeader = (_userId: string | null, data: any) =>
  updateUserProfile(data);

export const updateSecuritySettings = (data: {
  enablePin?: boolean;
  biometricLogin?: boolean;
  rememberLogin?: boolean;
  useFaceId?: boolean;
  accountRecovery?: boolean;
}) => api.put(`${WELLNESS_BASE}/security`, data);

export const changePassword = (data: { password: string }) =>
  api.put(`${WELLNESS_BASE}/change-password`, data);

export const setPasscodee = (data: { passcode: string }) =>
  api.post(`${WELLNESS_BASE}/passcode`, data);

export const getNotifications = () => api.get(`${WELLNESS_BASE}/notifications`);

export const updateNotifications = (data: {
  activityReminder?: boolean;
  pushNotification?: boolean;
  nutritionReminder?: boolean;
  aiRecommendations?: boolean;
  weeklyInsight?: boolean;
}) => api.put(`${WELLNESS_BASE}/notifications`, data);

export const getStreakData = () => api.get(`${WELLNESS_BASE}/streak`);

export const submitFeedback = (data: { rating: number; feedback: string }) =>
  api.post(`${WELLNESS_BASE}/feedback`, data);

export const deleteAccount = () => api.delete(`${WELLNESS_BASE}/account`);

export const getHelpArticles = () => api.get(`${WELLNESS_BASE}/help`);

export const uploadProfileImage = (formData: FormData) =>
  api.post(`${WELLNESS_BASE}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
