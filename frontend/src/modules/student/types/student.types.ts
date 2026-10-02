export interface StudentProfile {
  id?: string;
  userId?: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  studentId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  profilePhotoUrl: string | null;
  enrollmentYear: number | null;
  profileCompletionPercentage: number;
  accountStatus: string;
  bio: string | null;
}

export interface StudentUpdateProfileDTO {
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhotoUrl?: string | null;
  bio?: string | null;
}

export interface ClassInfo {
  id: string;
  batchId: string;
  name: string;
  currentSemester: number;
  facultyUid: string | null;
  isActive: boolean;
  batch?: BatchInfo | null;
  program?: ProgramInfo | null;
  department?: DepartmentInfo | null;
  classIncharge?: ClassInchargeInfo | null;
}

export interface BatchInfo {
  id: string;
  programId: string;
  startYear: number;
  endYear: number;
  name?: string;
  isActive: boolean;
  program?: ProgramInfo | null;
}

export interface ProgramInfo {
  id: string;
  departmentId: string;
  name: string;
  type: string;
  durationYears: number;
  isActive: boolean;
  department?: DepartmentInfo | null;
}

export interface DepartmentInfo {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  hodUid: string | null;
  isActive: boolean;
  collegeName?: string | null;
  hod?: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
}

export interface SubjectInfo {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  isActive: boolean;
}

export interface ClassInchargeInfo {
  facultyUid: string;
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  designation: string | null;
  department: string | null;
}

export interface AcademicYearInfo {
  id: string;
  collegeId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SemesterInfo {
  id: string;
  academicYearId: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  academicYear?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;
}

export interface StudentDashboardData {
  student: StudentProfile;
  class: ClassInfo | null;
  batch: BatchInfo | null;
  program: ProgramInfo | null;
  department: DepartmentInfo | null;
  classIncharge: ClassInchargeInfo | null;
  academicYear: AcademicYearInfo | null;
  semester: SemesterInfo | null;
  subjects: SubjectInfo[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
