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
  registration?: string;
  lattes_url?: string;
  orcid?: string;
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

// Courses types
export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  credits: number;
  deleted_at?: string;
}

export interface CourseFormData {
  code: string;
  name: string;
  description?: string;
  credits: number;
}

// Docentes types
export interface DocenteExcluido {
  id: number;
  nome: string;
  email: string;
  linhaPesquisa: string;
  research_line_id?: number;
  is_admin: boolean;
  dataExclusao: string;
}

export interface DocenteData {
  id: number;
  nome: string;
  email: string;
  linhaPesquisa: string;
  research_line_id?: number;
  is_admin: boolean;
}

export interface DocenteFormData {
  nome: string;
  email: string;
  research_line_id: number;
  is_admin: boolean;
}

export interface ResearchLineDropdown {
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

export const getUserAcademicLevels = async (): Promise<string[]> => {
  const response = await api.get<{ levels: string[] }>('/api/user/academic-levels');
  return response.data.levels;
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

// Docentes API functions
export const getDocentes = async (): Promise<DocenteData[]> => {
  const response = await api.get<DocenteData[]>('/api/docentes');
  return response.data;
};

export const getTrashedDocentes = async (): Promise<DocenteExcluido[]> => {
  const response = await api.get<DocenteExcluido[]>('/api/docentes-trashed');
  return response.data;
};

export const createDocente = async (data: DocenteFormData): Promise<DocenteData> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/docentes', data);
  return response.data.docente;
};

export const updateDocente = async (id: number, data: DocenteFormData): Promise<DocenteData> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/docentes/${id}`, data);
  return response.data.docente;
};

export const deleteDocente = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/docentes/${id}`);
};

export const restoreDocente = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/docentes/${id}/restore`);
};

export const resetDocentePassword = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/docentes/${id}/reset-password`);
};

export const getResearchLinesDropdown = async (): Promise<ResearchLineDropdown[]> => {
  const response = await api.get<ResearchLineDropdown[]>('/api/research-lines-dropdown');
  return response.data;
};

// Courses API functions
export const getCourses = async (): Promise<Course[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Course[]>('/api/courses');
  return response.data;
};

export const getTrashedCourses = async (): Promise<Course[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Course[]>('/api/courses-trashed');
  return response.data;
};

export const createCourse = async (data: CourseFormData): Promise<Course> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/courses', data);
  return response.data.data;
};

export const updateCourse = async (id: number, data: CourseFormData): Promise<Course> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/courses/${id}`, data);
  return response.data.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/courses/${id}`);
};

export const restoreCourse = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/courses/${id}/restore`);
};

// Agencies types
export interface Agency {
  id: number;
  apelido: string;
  nome: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  dataExclusao?: string;
}

export interface AgencyFormData {
  name: string;
  alias: string;
  description?: string;
}

// Agencies API functions
export const getAgencies = async (): Promise<Agency[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Agency[]>('/api/agencies');
  return response.data;
};

export const getTrashedAgencies = async (): Promise<Agency[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Agency[]>('/api/agencies-trashed');
  return response.data;
};

export const createAgency = async (data: AgencyFormData): Promise<Agency> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/agencies', data);
  return response.data;
};

export const updateAgency = async (id: number, data: AgencyFormData): Promise<Agency> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/agencies/${id}`, data);
  return response.data;
};

export const deleteAgency = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/agencies/${id}`);
};

export const restoreAgency = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/agencies/${id}/restore`);
};

// Journals types
export interface Journal {
  id: number;
  nome: string;
  instituicao?: string;
  quali?: string;
  issn?: string;
  tipo: string;
  dataExclusao?: string;
}

export interface JournalFormData {
  nome: string;
  instituicao?: string;
  quali?: string;
  issn?: string;
  tipo: string;
  description?: string;
}

// Journals API functions
export const getJournals = async (): Promise<Journal[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Journal[]>('/api/journals');
  return response.data;
};

export const getTrashedJournals = async (): Promise<Journal[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Journal[]>('/api/journals-trashed');
  return response.data;
};

export const createJournal = async (data: JournalFormData): Promise<Journal> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/journals', data);
  return response.data;
};

export const updateJournal = async (id: number, data: JournalFormData): Promise<Journal> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/journals/${id}`, data);
  return response.data;
};

export const deleteJournal = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/journals/${id}`);
};

export const restoreJournal = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/journals/${id}/restore`);
};

// Events types
export interface Event {
  id: number;
  nome: string;
  alias: string;
  tipo: string;
  natureza: string;
  dataExclusao?: string;
}

export interface EventFormData {
  nome: string;
  alias: string;
  tipo: string;
  natureza: string;
}

// Events API functions
export const getEvents = async (): Promise<Event[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Event[]>('/api/events');
  return response.data;
};

export const getTrashedEvents = async (): Promise<Event[]> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.get<Event[]>('/api/events-trashed');
  return response.data;
};

export const createEvent = async (data: EventFormData): Promise<Event> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/events', data);
  return response.data;
};

export const updateEvent = async (id: number, data: EventFormData): Promise<Event> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/events/${id}`);
};

export const restoreEvent = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/events/${id}/restore`);
};

// Discentes types
export interface Discente {
  id: number;
  nome: string;
  email: string;
  orientador: string;
  orientador_id?: number;
  co_orientador?: string;
  co_orientador_id?: number;
  nivel_pos_graduacao: 'mestrado' | 'doutorado';
  mestrado_status: string;
  doutorado_status: string;
}

export interface DiscenteExcluido {
  id: number;
  nome: string;
  email: string;
  orientador: string;
  co_orientador?: string;
  status_mestrado: string;
  status_doutorado: string;
  data_exclusao: string;
}

export interface DiscenteFormData {
  nome: string;
  email: string;
  orientador_id: number;
  co_orientador_id?: number;
  nivel_pos_graduacao: 'mestrado' | 'doutorado';
}

export interface DocenteDropdown {
  id: number;
  name: string;
}

// Discentes API functions
export const getDiscentes = async (): Promise<Discente[]> => {
  const response = await api.get<Discente[]>('/api/discentes');
  return response.data;
};

export const getTrashedDiscentes = async (): Promise<DiscenteExcluido[]> => {
  const response = await api.get<DiscenteExcluido[]>('/api/discentes-trashed');
  return response.data;
};

export const createDiscente = async (data: DiscenteFormData): Promise<any> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/discentes', data);
  return response.data;
};

export const updateDiscente = async (id: number, data: DiscenteFormData): Promise<any> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.put(`/api/discentes/${id}`, data);
  return response.data;
};

export const deleteDiscente = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.delete(`/api/discentes/${id}`);
};

export const restoreDiscente = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/discentes/${id}/restore`);
};

export const getDocentesDropdown = async (): Promise<DocenteDropdown[]> => {
  const response = await api.get<DocenteDropdown[]>('/api/docentes-dropdown');
  return response.data;
};

export const getDiscenteAvailableLevels = async (id: number): Promise<{ available_levels: string[], current_bonds: any }> => {
  const response = await api.get(`/api/discentes/${id}/available-levels`);
  return response.data;
};

export const resetDiscentePassword = async (id: number): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
  await api.post(`/api/discentes/${id}/reset-password`);
};

// Student (Discente) Module types
export interface StudentData {
  id: number;
  name: string;
  email: string;
  modality: string; // "Mestrado" | "Doutorado"
  advisor: string;
  advisor_id?: number;
  co_advisor?: string;
  co_advisor_id?: number;
  research_line: string;
  academic_bond: {
    id: number;
    level: string;
    status: string;
    start_date?: string;
    end_date?: string;
    title?: string;
    description?: string;
  };
}

// User Basic Info types
export interface UserBasicInfo {
  registration?: string;
  lattes_url?: string;
  orcid?: string;
}

export interface UpdateUserBasicInfoResponse {
  message: string;
  user: {
    registration?: string;
    lattes_url?: string;
    orcid?: string;
  };
}

// Stats types
export interface StatsCountsResponse {
  discentes: number;
  docentes: number;
  linhaspesquisa: number;
  disciplinas: number;
  agencias: number;
  revistas: number;
  eventos: number;
  producoes: number;
}

// Student (Discente) Module API functions
export const getStudentData = async (): Promise<StudentData> => {
  const response = await api.get<StudentData>('/api/student/me');
  return response.data;
};

// Stats API functions
export const getStatsCounts = async (): Promise<StatsCountsResponse> => {
  const response = await api.get<StatsCountsResponse>('/api/stats/counts');
  return response.data;
};

// User Link Period types
export interface UserLinkPeriod {
  start_date?: string;
  end_date?: string;
}

export interface UpdateUserLinkPeriodResponse {
  message: string;
  academic_bond: {
    start_date?: string;
    end_date?: string;
  };
}

export interface GetUserLinkPeriodResponse {
  academic_bond: {
    start_date?: string;
    end_date?: string;
  };
}

// User Basic Info API functions
export const updateUserBasicInfo = async (data: UserBasicInfo): Promise<UpdateUserBasicInfoResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateUserBasicInfoResponse>('/api/discente/basic-info', data);
  return response.data;
};

// User Link Period API functions
export const getUserLinkPeriod = async (): Promise<GetUserLinkPeriodResponse> => {
  const response = await api.get<GetUserLinkPeriodResponse>('/api/student/link-period');
  return response.data;
};

export const updateUserLinkPeriod = async (data: UserLinkPeriod): Promise<UpdateUserLinkPeriodResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateUserLinkPeriodResponse>('/api/student/link-period', data);
  return response.data;
};

export default api;