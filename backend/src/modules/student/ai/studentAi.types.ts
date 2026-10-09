import type { StudentContext } from '../student.types';

/**
 * ============================================================================
 * Canonical Student Chatbot Tool Names (Frozen Contract)
 * ============================================================================
 * Exactly 14 tools: 12 deterministic Student data tools + 2 RAG knowledge tools.
 */
export const STUDENT_TOOL_NAMES = [
  'student.getDashboard',
  'student.getProfile',
  'student.getClass',
  'student.getBatch',
  'student.getProgram',
  'student.getDepartment',
  'student.getSubjects',
  'student.getClassIncharge',
  'student.getAcademicYears',
  'student.getSemesters',
  'student.getTimetable',
  'student.getAttendance',
  'student.searchKnowledge',
  'student.getKnowledgeContext',
] as const;

export type StudentToolName = (typeof STUDENT_TOOL_NAMES)[number];

export function isStudentToolName(name: string): name is StudentToolName {
  return (STUDENT_TOOL_NAMES as readonly string[]).includes(name);
}

/**
 * Chat conversation message
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Tool choice option
 */
export type ToolChoiceOption =
  | 'auto'
  | 'none'
  | { type: 'tool'; name: StudentToolName };

/**
 * Chat Request Body
 */
export interface StudentChatRequest {
  message: string;
  history?: ChatMessage[];
  toolChoice?: ToolChoiceOption;
}

/**
 * Individual tool execution result record
 */
export interface ToolExecutionResult {
  toolName: StudentToolName;
  arguments: Record<string, any>;
  status: 'success' | 'error';
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  executionDurationMs: number;
}

/**
 * Chat Response Payload Data
 */
export interface StudentChatResponseData {
  message: string;
  toolsExecuted: ToolExecutionResult[];
  metadata: {
    uid: string;
    role: string;
    collegeId: string | null;
    departmentId: string | null;
    classId: string | null;
    registerNumber: string | null;
    timestamp: string;
    model: string;
  };
}

/**
 * Generic Tool Handler Signature
 */
export type ToolHandler<TInput = any, TOutput = any> = (
  input: TInput,
  context: StudentContext,
) => Promise<TOutput>;

/**
 * Tool Metadata for tool listing & discovery
 */
export interface ToolMetadata {
  name: StudentToolName;
  description: string;
  category: 'deterministic' | 'rag';
  parameters: Record<string, any>;
  returns: Record<string, any>;
}

/**
 * ============================================================================
 * Tool 1: student.getDashboard
 * ============================================================================
 */
export interface StudentGetDashboardInput {}

export interface StudentGetDashboardOutput {
  student: {
    name: string | null;
    email: string;
    studentId: string | null;
    photoUrl: string | null;
    completionPercentage: number;
  };
  academic: {
    className: string;
    currentSemester: number;
    batchYears: string;
    programName: string;
    degree: string;
    departmentName: string;
    departmentCode: string;
    academicYear: string;
    classIncharge: {
      name: string;
      email: string;
      designation: string;
      cabin: string | null;
    } | null;
  };
  attendanceSummary: {
    overallPercentage: number;
    totalPresent: number;
    totalAbsent: number;
    totalHeld: number;
    status: 'SAFE' | 'CRITICAL' | 'NO_DATA';
    safeMargin: number;
  };
  subjectsCount: number;
  semestersCount: number;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 2: student.getProfile
 * ============================================================================
 */
export interface StudentGetProfileInput {}

export interface StudentGetProfileOutput {
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
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 3: student.getClass
 * ============================================================================
 */
export interface StudentGetClassInput {}

export interface StudentGetClassOutput {
  id: string;
  batchId: string;
  name: string;
  currentSemester: number;
  facultyUid: string | null;
  isActive: boolean;
  batchName?: string;
  programName?: string;
  departmentName?: string;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 4: student.getBatch
 * ============================================================================
 */
export interface StudentGetBatchInput {}

export interface StudentGetBatchOutput {
  id: string;
  programId: string;
  startYear: number;
  endYear: number;
  batchYears: string;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 5: student.getProgram
 * ============================================================================
 */
export interface StudentGetProgramInput {}

export interface StudentGetProgramOutput {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  degreeType: string;
  durationYears: number;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 6: student.getDepartment
 * ============================================================================
 */
export interface StudentGetDepartmentInput {}

export interface StudentGetDepartmentOutput {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  description: string | null;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 7: student.getSubjects
 * ============================================================================
 */
export interface StudentGetSubjectsInput {
  semesterNumber?: number;
}

export interface StudentSubjectItem {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  credits: number;
  type: string;
  semesterNumber?: number;
}

export interface StudentGetSubjectsOutput {
  subjects: StudentSubjectItem[];
  totalSubjects: number;
  semesterNumber?: number;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 8: student.getClassIncharge
 * ============================================================================
 */
export interface StudentGetClassInchargeInput {}

export interface StudentGetClassInchargeOutput {
  facultyUid: string;
  name: string;
  email: string;
  designation: string;
  phone: string | null;
  cabin: string | null;
  departmentName: string;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 9: student.getAcademicYears
 * ============================================================================
 */
export interface StudentGetAcademicYearsInput {}

export interface StudentAcademicYearItem {
  id: string;
  collegeId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface StudentGetAcademicYearsOutput {
  academicYears: StudentAcademicYearItem[];
  currentAcademicYear: StudentAcademicYearItem | null;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 10: student.getSemesters
 * ============================================================================
 */
export interface StudentGetSemestersInput {}

export interface StudentSemesterItem {
  id: string;
  semesterNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface StudentGetSemestersOutput {
  semesters: StudentSemesterItem[];
  currentSemester: StudentSemesterItem | null;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 11: student.getTimetable
 * ============================================================================
 */
export interface StudentGetTimetableInput {
  dayOfWeek?: number; // 1 = Monday ... 5 = Friday
}

export interface StudentTimetableSlotItem {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  roomNumber: string | null;
}

export interface StudentGetTimetableOutput {
  className: string;
  slots: StudentTimetableSlotItem[];
  dayOfWeek?: number;
  totalSlots: number;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 12: student.getAttendance
 * ============================================================================
 */
export interface StudentGetAttendanceInput {
  date?: string; // YYYY-MM-DD
}

export interface StudentAttendanceSubjectSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  percentage: number;
  present: number;
  absent: number;
  total: number;
  status: 'SAFE' | 'CRITICAL' | 'NO_DATA';
}

export interface StudentGetAttendanceOutput {
  summary: {
    overallPercentage: number;
    totalPresent: number;
    totalAbsent: number;
    totalHeld: number;
    status: 'SAFE' | 'CRITICAL' | 'NO_DATA';
    safeMargin: number;
    isEligible: boolean; // >= 75%
  };
  subjectBreakdown: StudentAttendanceSubjectSummary[];
  dailySchedule?: Array<{
    dayName: string;
    dayOfWeek: number;
    dateStr: string;
    periods: Array<{
      periodNumber: number;
      startTime: string;
      endTime: string;
      subjectName: string;
      status: 'PRESENT' | 'ABSENT' | 'UNRECORDED';
    }>;
  }>;
  selectedDate?: string;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 13: student.searchKnowledge (RAG)
 * ============================================================================
 */
export interface StudentSearchKnowledgeInput {
  query: string;
  category?: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
  limit?: number;
}

export interface StudentKnowledgeChunk {
  id: string;
  title: string;
  content: string;
  category: string;
  sourceDocument: string;
  relevanceScore: number;
}

export interface StudentSearchKnowledgeOutput {
  query: string;
  results: StudentKnowledgeChunk[];
  totalResults: number;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 14: student.getKnowledgeContext (RAG)
 * ============================================================================
 */
export interface StudentGetKnowledgeContextInput {
  documentId: string;
  topic?: string;
}

export interface StudentGetKnowledgeContextOutput {
  documentId: string;
  title: string;
  content: string;
  category: string;
  metadata: {
    version: string;
    lastUpdated: string;
    approvedBy: string;
  };
  _isStub?: boolean;
}
