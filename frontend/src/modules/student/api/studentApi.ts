import {
  StudentDashboardData,
  StudentProfile,
  StudentUpdateProfileDTO,
  ClassInfo,
  BatchInfo,
  ProgramInfo,
  DepartmentInfo,
  SubjectInfo,
  ClassInchargeInfo,
  AcademicYearInfo,
  SemesterInfo,
  ApiResponse,
} from '../types/student.types';
import { auth } from '../../../config/firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get current Bearer token, preferring Firebase ID token, with fallback to stored token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (err) {
    console.warn('Firebase token retrieval error, checking localStorage:', err);
  }

  return localStorage.getItem('student_token') || localStorage.getItem('lms_token');
}

/**
 * Standard HTTP fetch wrapper with authorization header & error extraction
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    data: null as any,
    error: {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response from server',
    },
  }));

  if (!response.ok || !body.success) {
    const errorMsg = body.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as Error & { code?: string; status?: number };
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }

  return body.data;
}

export const studentApi = {
  // 1. Dashboard
  getDashboard: () => request<StudentDashboardData>('/student/dashboard'),

  // 2. Profile
  getProfile: () => request<StudentProfile>('/student/profile'),
  updateProfile: (data: StudentUpdateProfileDTO) =>
    request<StudentProfile>('/student/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 3. Class
  getClass: () => request<ClassInfo>('/student/class'),

  // 4. Batch
  getBatch: () => request<BatchInfo>('/student/batch'),

  // 5. Program
  getProgram: () => request<ProgramInfo>('/student/program'),

  // 6. Department
  getDepartment: () => request<DepartmentInfo>('/student/department'),

  // 7. Subjects
  getSubjects: (semesterNumber?: number) => {
    const query = semesterNumber ? `?semester=${semesterNumber}` : '';
    return request<SubjectInfo[]>(`/student/subjects${query}`);
  },

  // 8. Class Incharge
  getClassIncharge: () => request<ClassInchargeInfo>('/student/class-incharge'),

  // 9. Academic Years
  getAcademicYears: () => request<AcademicYearInfo[]>('/student/academic-years'),

  // 10. Semesters
  getSemesters: () => request<SemesterInfo[]>('/student/semesters'),

  // Dev Token Generator
  getDevStudentToken: async (email?: string) => {
    const res = await fetch(`${BASE_URL}/auth/dev-student-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (json.success && json.data?.token) {
      localStorage.setItem('student_token', json.data.token);
      localStorage.setItem('student_user', JSON.stringify(json.data.user));
    }
    return json;
  },
};
