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

// Research Lines types
export interface ResearchLine {
  id: number;
  name: string;
  alias: string;
  description?: string;
  coordinator: string;
  coordinator_id?: number;
  deleted_at?: string;
}

export interface Docente {
  id: number;
  name: string;
}

export interface ResearchLineFormData {
  name: string;
  alias: string;
  description?: string;
  coordinator_id?: number;
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

// Research Lines API functions
export const getResearchLines = async (): Promise<ResearchLine[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<ResearchLine[]>('/api/research-lines');
  return response.data;
};

export const getTrashedResearchLines = async (): Promise<ResearchLine[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<ResearchLine[]>('/api/research-lines-trashed');
  return response.data;
};

export const createResearchLine = async (data: ResearchLineFormData): Promise<ResearchLine> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/research-lines', data);
  return response.data.data;
};

export const updateResearchLine = async (id: number, data: ResearchLineFormData): Promise<ResearchLine> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/research-lines/${id}`, data);
  return response.data.data;
};

export const deleteResearchLine = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/research-lines/${id}`);
};

export const restoreResearchLine = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/research-lines/${id}/restore`);
};

export const getDocentes = async (): Promise<Docente[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Docente[]>('/api/docentes');
  return response.data;
};

export default api;