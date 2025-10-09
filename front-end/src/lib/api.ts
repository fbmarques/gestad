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

// Academic Bond Details interface
export interface AcademicBondDetails {
  id: number;
  level: string;
  status: string;
  advisor: string;
  co_advisor: string | null;
  agency: string;
  research_line: string;
  start_date: string | null;
  end_date: string | null;
  title: string | null;
  description: string | null;
  problem_defined: boolean;
  problem_text: string | null;
  question_defined: boolean;
  question_text: string | null;
  objectives_defined: boolean;
  objectives_text: string | null;
  methodology_defined: boolean;
  methodology_text: string | null;
  qualification_status: string | null;
  qualification_date: string | null;
  qualification_completion_date: string | null;
  defense_status: string | null;
  defense_date: string | null;
  defense_completion_date: string | null;
  work_completed: boolean;
}

export interface StudentAcademicBondData {
  student_name: string;
  student_email: string;
  academic_bonds: AcademicBondDetails[];
}

// Discentes API functions
export const getDiscentes = async (): Promise<Discente[]> => {
  // Get active role from localStorage to send to backend
  const activeRole = localStorage.getItem('gestad-active-role') || '';
  const response = await api.get<Discente[]>('/api/discentes', {
    params: { active_role: activeRole }
  });
  return response.data;
};

export const getStudentAcademicBondDetails = async (id: number): Promise<StudentAcademicBondData> => {
  const response = await api.get<StudentAcademicBondData>(`/api/discentes/${id}/academic-bond-details`);
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
  // Get active role from localStorage to send to backend
  const activeRole = localStorage.getItem('gestad-active-role') || '';
  const response = await api.get<StatsCountsResponse>('/api/stats/counts', {
    params: { active_role: activeRole }
  });
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

// Scholarship types
export interface ScholarshipAgency {
  id: number;
  name: string;
  alias: string;
}

export interface UserScholarship {
  is_scholarship_holder: boolean;
  agency: ScholarshipAgency | null;
}

export interface UpdateUserScholarshipRequest {
  agency_id: number | null;
}

export interface UpdateUserScholarshipResponse {
  message: string;
  scholarship: UserScholarship;
}

// Scholarship API functions
export const getStudentAgencies = async (): Promise<ScholarshipAgency[]> => {
  const response = await api.get<ScholarshipAgency[]>('/api/student/agencies');
  return response.data;
};

export const getUserScholarship = async (): Promise<UserScholarship> => {
  const response = await api.get<UserScholarship>('/api/student/scholarship');
  return response.data;
};

export const updateUserScholarship = async (data: UpdateUserScholarshipRequest): Promise<UpdateUserScholarshipResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateUserScholarshipResponse>('/api/student/scholarship', data);
  return response.data;
};

// Research Definitions types
export interface UserResearchDefinitions {
  problem_defined: boolean;
  problem_text: string | null;
  question_defined: boolean;
  question_text: string | null;
  objectives_defined: boolean;
  objectives_text: string | null;
  methodology_defined: boolean;
  methodology_text: string | null;
}

export interface UpdateUserResearchDefinitionsRequest {
  problem_defined?: boolean;
  problem_text?: string | null;
  question_defined?: boolean;
  question_text?: string | null;
  objectives_defined?: boolean;
  objectives_text?: string | null;
  methodology_defined?: boolean;
  methodology_text?: string | null;
}

export interface UpdateUserResearchDefinitionsResponse {
  message: string;
  research_definitions: UserResearchDefinitions;
}

export interface GetUserResearchDefinitionsResponse {
  research_definitions: UserResearchDefinitions;
}

// Research Definitions API functions
export const getUserResearchDefinitions = async (): Promise<UserResearchDefinitions> => {
  const response = await api.get<GetUserResearchDefinitionsResponse>('/api/student/research-definitions');
  return response.data.research_definitions;
};

export const updateUserResearchDefinitions = async (data: UpdateUserResearchDefinitionsRequest): Promise<UpdateUserResearchDefinitionsResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateUserResearchDefinitionsResponse>('/api/student/research-definitions', data);
  return response.data;
};

// Academic Requirements types
export interface UserAcademicRequirements {
  qualification_status: 'Not Scheduled' | 'Scheduled' | 'Completed';
  qualification_date: string | null;
  qualification_completion_date: string | null;
  defense_status: 'Not Scheduled' | 'Scheduled' | 'Completed';
  defense_date: string | null;
  defense_completion_date: string | null;
  work_completed: boolean;
}

export interface UpdateUserAcademicRequirementsRequest {
  qualification_status?: 'Not Scheduled' | 'Scheduled' | 'Completed';
  qualification_date?: string | null;
  qualification_completion_date?: string | null;
  defense_status?: 'Not Scheduled' | 'Scheduled' | 'Completed';
  defense_date?: string | null;
  defense_completion_date?: string | null;
  work_completed?: boolean;
}

export interface UpdateUserAcademicRequirementsResponse {
  message: string;
  academic_requirements: UserAcademicRequirements;
}

export interface GetUserAcademicRequirementsResponse {
  academic_requirements: UserAcademicRequirements;
}

// Academic Requirements API functions
export const getUserAcademicRequirements = async (): Promise<UserAcademicRequirements> => {
  const response = await api.get<GetUserAcademicRequirementsResponse>('/api/student/academic-requirements');
  return response.data.academic_requirements;
};

export const updateUserAcademicRequirements = async (data: UpdateUserAcademicRequirementsRequest): Promise<UpdateUserAcademicRequirementsResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateUserAcademicRequirementsResponse>('/api/student/academic-requirements', data);
  return response.data;
};

// Student Disciplines types
export interface StudentDiscipline {
  id: number;
  course_id: number;
  code: string;
  name: string;
  credits: number;
  docente: string;
  docente_id: number | null;
}

export interface StudentDisciplinesResponse {
  disciplines: StudentDiscipline[];
  credits_info: {
    total_credits: number;
    required_credits: number;
    progress_percentage: number;
  };
}

export interface AvailableCourse {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export interface AvailableTeacher {
  id: number;
  name: string;
}

export interface AddStudentDisciplineRequest {
  course_id: number;
  docente_id?: number | null;
}

export interface AddStudentDisciplineResponse {
  message: string;
  discipline: StudentDiscipline;
}

// Student Disciplines API functions
export const getStudentDisciplines = async (): Promise<StudentDisciplinesResponse> => {
  const response = await api.get<StudentDisciplinesResponse>('/api/student/disciplines');
  return response.data;
};

export const addStudentDiscipline = async (data: AddStudentDisciplineRequest): Promise<AddStudentDisciplineResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post<AddStudentDisciplineResponse>('/api/student/disciplines', data);
  return response.data;
};

export const removeStudentDiscipline = async (disciplineId: number): Promise<{ message: string }> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.delete<{ message: string }>(`/api/student/disciplines/${disciplineId}`);
  return response.data;
};

export const getAvailableCourses = async (): Promise<AvailableCourse[]> => {
  const response = await api.get<AvailableCourse[]>('/api/student/available-courses');
  return response.data;
};

export const getAvailableTeachers = async (): Promise<AvailableTeacher[]> => {
  const response = await api.get<AvailableTeacher[]>('/api/student/available-teachers');
  return response.data;
};

// Student Publications types
export interface StudentPublication {
  id: number;
  title: string;
  journal: string;
  journal_id: number;
  submission_date: string;
  approval_date: string | null;
  publication_date: string | null;
  status: 'S' | 'A' | 'P' | 'E' | 'D' | 'I';
  status_display: string;
  can_select_for_pdf: boolean;
}

export interface AvailableJournal {
  id: number;
  name: string;
  qualis: string | null;
}

export interface AddStudentPublicationRequest {
  journal_id: number;
  title: string;
  submission_date: string;
}

export interface UpdateStudentPublicationRequest {
  approval_date?: string | null;
  publication_date?: string | null;
}

export interface AddStudentPublicationResponse {
  message: string;
  publication: StudentPublication;
}

export interface UpdateStudentPublicationResponse {
  message: string;
  publication: StudentPublication;
}

// Student Publications API functions
export const getStudentPublications = async (): Promise<StudentPublication[]> => {
  const response = await api.get<StudentPublication[]>('/api/student/publications');
  return response.data;
};

export const addStudentPublication = async (data: AddStudentPublicationRequest): Promise<AddStudentPublicationResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post<AddStudentPublicationResponse>('/api/student/publications', data);
  return response.data;
};

export const updateStudentPublication = async (publicationId: number, data: UpdateStudentPublicationRequest): Promise<UpdateStudentPublicationResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<UpdateStudentPublicationResponse>(`/api/student/publications/${publicationId}`, data);
  return response.data;
};

export const removeStudentPublication = async (publicationId: number): Promise<{ message: string }> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.delete<{ message: string }>(`/api/student/publications/${publicationId}`);
  return response.data;
};

export const getAvailableJournals = async (): Promise<AvailableJournal[]> => {
  const response = await api.get<AvailableJournal[]>('/api/student/available-journals');
  return response.data;
};

// Student Event Participations types
export interface StudentEventParticipation {
  id: number;
  event_id: number;
  event_name: string;
  event_alias: string;
  title: string;
  name: string;
  location: string;
  year: number;
  type: 'Conferência' | 'Simpósio' | 'Workshop' | 'Congresso';
}

export interface AvailableEvent {
  id: number;
  nome: string;
  alias: string;
  tipo: string;
  natureza: string;
}

export interface AddStudentEventParticipationRequest {
  event_id: number;
  title: string;
  name: string;
  location: string;
  year: number;
  type: 'Conferência' | 'Simpósio' | 'Workshop' | 'Congresso';
}

export interface AddStudentEventParticipationResponse {
  message: string;
  participation: StudentEventParticipation;
}

// Student Event Participations API functions
export const getStudentEventParticipations = async (): Promise<StudentEventParticipation[]> => {
  const response = await api.get<StudentEventParticipation[]>('/api/student/event-participations');
  return response.data;
};

export const addStudentEventParticipation = async (data: AddStudentEventParticipationRequest): Promise<AddStudentEventParticipationResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post<AddStudentEventParticipationResponse>('/api/student/event-participations', data);
  return response.data;
};

export const removeStudentEventParticipation = async (participationId: number): Promise<{ message: string }> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.delete<{ message: string }>(`/api/student/event-participations/${participationId}`);
  return response.data;
};

export const getAvailableEvents = async (): Promise<AvailableEvent[]> => {
  const response = await api.get<AvailableEvent[]>('/api/student/available-events');
  return response.data;
};

// Publications Management types (for admin/docente)
export interface PublicationForApproval {
  id: number;
  titulo: string;
  discente: string;
  docente: string;
  periodico: string;
  qualis: string;
  dataPublicacao: string;
  status: 'P' | 'D' | 'I';
}

export interface ApprovePublicationResponse {
  message: string;
  publication: any;
}

export interface RejectPublicationResponse {
  message: string;
  publication: any;
}

// Publications Management API functions (for admin/docente)
export const getPendingPublications = async (): Promise<PublicationForApproval[]> => {
  // Get active role from localStorage to send to backend
  const activeRole = localStorage.getItem('gestad-active-role') || '';
  const response = await api.get<PublicationForApproval[]>('/api/publications/pending', {
    params: { active_role: activeRole }
  });
  return response.data;
};

export const getApprovedPublications = async (): Promise<PublicationForApproval[]> => {
  const response = await api.get<PublicationForApproval[]>('/api/publications/approved');
  return response.data;
};

export const getRejectedPublications = async (): Promise<PublicationForApproval[]> => {
  const response = await api.get<PublicationForApproval[]>('/api/publications/rejected');
  return response.data;
};

export const approvePublication = async (publicationId: number): Promise<ApprovePublicationResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<ApprovePublicationResponse>(`/api/publications/${publicationId}/approve`);
  return response.data;
};

export const rejectPublication = async (publicationId: number): Promise<RejectPublicationResponse> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.patch<RejectPublicationResponse>(`/api/publications/${publicationId}/reject`);
  return response.data;
};

// Dashboard types
export interface DashboardStats {
  activeStudents: number;
  coursesOffered: number;
  scheduledDefenses: number;
  defensesNext30Days: number;
  publicationsLast12Months: number;
  publicationsTrend: number;
}

export interface ResearchDefinitionsPercentages {
  problem: number;
  question: number;
  objectives: number;
  methodology: number;
}

export interface AcademicDistribution {
  name: string;
  value: number;
}

export interface PublicationByQualis {
  qualis: string;
  count: number;
}

export interface ScholarshipDistribution {
  name: string;
  value: number;
}

export interface EventMonthly {
  month: string;
  events: number;
}

export interface TopProfessor {
  name: string;
  students: number;
}

export interface TopJournal {
  alias: string;
  name: string;
  publications: number;
}

export interface AlertData {
  type: string;
  title: string;
  description: string;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  researchDefinitionsPercentages: ResearchDefinitionsPercentages;
  academicDistribution: AcademicDistribution[];
  publicationsByQualis: PublicationByQualis[];
  scholarshipData: ScholarshipDistribution[];
  scholarshipPercentage: number;
  eventsMonthly: EventMonthly[];
  totalEventsLast12Months: number;
  topProfessors: TopProfessor[];
  topJournals: TopJournal[];
  alertsData: AlertData[];
}

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await api.get<DashboardStatsResponse>('/api/dashboard/stats');
  return response.data;
};

export const getDashboardStatsDocente = async (): Promise<DashboardStatsResponse> => {
  const response = await api.get<DashboardStatsResponse>('/api/dashboard/docente-stats');
  return response.data;
};

// Messages types
export interface MessageDiscente {
  id: string;
  nome: string;
  tipo: 'mestrado' | 'doutorado';
  ultimaMensagem?: string;
  horaUltimaMensagem?: string;
  mensagensNaoLidas?: number;
}

export interface ReadDetail {
  user_id: number;
  user_name: string;
  read_at: string;
}

export interface MessageData {
  id: string;
  text: string;
  sender: 'user' | 'other' | 'advisor' | 'co-advisor' | 'student';
  senderName?: string;
  senderId?: number;
  timestamp: string;
  isRead?: boolean;
  readAt?: string;
  isReadByUser?: boolean;
  readBy?: number[];
  readDetails?: ReadDetail[];
}

export interface SendMessageRequest {
  recipient_id: number;
  subject?: string;
  body: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AdvisorData {
  id: number;
  name: string;
  type: string;
}

export interface UnreadCountResponse {
  count: number;
}

// Messages API functions
export const getStudentsForTeacher = async (): Promise<MessageDiscente[]> => {
  const response = await api.get<MessageDiscente[]>('/api/messages/students');
  return response.data;
};

export const getAdvisorsForStudent = async (): Promise<AdvisorData[]> => {
  const response = await api.get<AdvisorData[]>('/api/messages/advisors');
  return response.data;
};

export const getConversation = async (userId: number): Promise<MessageData[]> => {
  const response = await api.get<MessageData[]>(`/api/messages/conversation/${userId}`);
  return response.data;
};

export const sendMessage = async (data: SendMessageRequest): Promise<MessageData> => {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post<MessageData>('/api/messages/send', data);
  return response.data;
};

export const getUnreadMessageCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>('/api/messages/unread-count');
  return response.data.count;
};

export default api;