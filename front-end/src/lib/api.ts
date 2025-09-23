import axios from 'axios';

const api = axios.create({
  baseURL: window.location.origin,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Role {
  slug: string;
  name: string;
}

export interface UserRolesResponse {
  success: boolean;
  roles: Role[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  theme: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface ThemeUpdateResponse {
  success: boolean;
  theme: boolean;
  message: string;
}

// API functions
export const getUserRoles = async (): Promise<Role[]> => {
  const response = await api.get<UserRolesResponse>('/api/user/roles');
  return response.data.roles;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfileResponse>('/api/user/profile');
  return response.data.user;
};

export const updateUserTheme = async (theme: boolean): Promise<boolean> => {
  const response = await api.put<ThemeUpdateResponse>('/api/user/theme', { theme });
  return response.data.theme;
};

export default api;