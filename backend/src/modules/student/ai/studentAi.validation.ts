import { z } from 'zod';
import { STUDENT_TOOL_NAMES } from './studentAi.types';

/**
 * ============================================================================
 * Chat Request & Message Validation Schemas
 * ============================================================================
 */
export const chatRoleSchema = z.enum(['user', 'assistant', 'system']);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(5000, 'Message content cannot exceed 5000 characters'),
});

export const toolChoiceSchema = z.union([
  z.literal('auto'),
  z.literal('none'),
  z.object({
    type: z.literal('tool'),
    name: z.enum(STUDENT_TOOL_NAMES),
  }),
]);

export const studentChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required and cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  history: z
    .array(chatMessageSchema)
    .max(30, 'Conversation history cannot exceed 30 messages')
    .optional()
    .default([]),
  toolChoice: toolChoiceSchema.optional().default('auto'),
});

/**
 * Direct Tool Execution Schema
 */
export const directToolExecutionSchema = z.object({
  toolName: z.enum(STUDENT_TOOL_NAMES, {
    errorMap: () => ({ message: 'Invalid or unknown student tool name' }),
  }),
  arguments: z.record(z.any()).optional().default({}),
});

/**
 * ISO date regex helper: YYYY-MM-DD
 */
export const dateIsoRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ============================================================================
 * Tool 1: student.getDashboard Schemas
 * ============================================================================
 */
export const studentGetDashboardInputSchema = z.object({}).strict();

export const studentGetDashboardOutputSchema = z.object({
  student: z.object({
    name: z.string().nullable(),
    email: z.string(),
    studentId: z.string().nullable(),
    photoUrl: z.string().nullable(),
    completionPercentage: z.number().min(0).max(100),
  }),
  academic: z.object({
    className: z.string(),
    currentSemester: z.number(),
    batchYears: z.string(),
    programName: z.string(),
    degree: z.string(),
    departmentName: z.string(),
    departmentCode: z.string(),
    academicYear: z.string(),
    classIncharge: z
      .object({
        name: z.string(),
        email: z.string(),
        designation: z.string(),
        cabin: z.string().nullable(),
      })
      .nullable(),
  }),
  attendanceSummary: z.object({
    overallPercentage: z.number().min(0).max(100),
    totalPresent: z.number().nonnegative(),
    totalAbsent: z.number().nonnegative(),
    totalHeld: z.number().nonnegative(),
    status: z.enum(['SAFE', 'CRITICAL', 'NO_DATA']),
    safeMargin: z.number(),
  }),
  subjectsCount: z.number().nonnegative(),
  semestersCount: z.number().nonnegative(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 2: student.getProfile Schemas
 * ============================================================================
 */
export const studentGetProfileInputSchema = z.object({}).strict();

export const studentGetProfileOutputSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string().nullable(),
  studentId: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  enrollmentYear: z.number().nullable(),
  profileCompletionPercentage: z.number().min(0).max(100),
  accountStatus: z.string(),
  bio: z.string().nullable(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 3: student.getClass Schemas
 * ============================================================================
 */
export const studentGetClassInputSchema = z.object({}).strict();

export const studentGetClassOutputSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  name: z.string(),
  currentSemester: z.number(),
  facultyUid: z.string().nullable(),
  isActive: z.boolean(),
  batchName: z.string().optional(),
  programName: z.string().optional(),
  departmentName: z.string().optional(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 4: student.getBatch Schemas
 * ============================================================================
 */
export const studentGetBatchInputSchema = z.object({}).strict();

export const studentGetBatchOutputSchema = z.object({
  id: z.string(),
  programId: z.string(),
  startYear: z.number(),
  endYear: z.number(),
  batchYears: z.string(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 5: student.getProgram Schemas
 * ============================================================================
 */
export const studentGetProgramInputSchema = z.object({}).strict();

export const studentGetProgramOutputSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  name: z.string(),
  code: z.string(),
  degreeType: z.string(),
  durationYears: z.number(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 6: student.getDepartment Schemas
 * ============================================================================
 */
export const studentGetDepartmentInputSchema = z.object({}).strict();

export const studentGetDepartmentOutputSchema = z.object({
  id: z.string(),
  collegeId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 7: student.getSubjects Schemas
 * ============================================================================
 */
export const studentGetSubjectsInputSchema = z.object({
  semesterNumber: z.number().int().min(1).max(12).optional(),
});

export const studentSubjectItemSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  name: z.string(),
  code: z.string(),
  credits: z.number(),
  type: z.string(),
  semesterNumber: z.number().optional(),
});

export const studentGetSubjectsOutputSchema = z.object({
  subjects: z.array(studentSubjectItemSchema),
  totalSubjects: z.number().nonnegative(),
  semesterNumber: z.number().optional(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 8: student.getClassIncharge Schemas
 * ============================================================================
 */
export const studentGetClassInchargeInputSchema = z.object({}).strict();

export const studentGetClassInchargeOutputSchema = z.object({
  facultyUid: z.string(),
  name: z.string(),
  email: z.string(),
  designation: z.string(),
  phone: z.string().nullable(),
  cabin: z.string().nullable(),
  departmentName: z.string(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 9: student.getAcademicYears Schemas
 * ============================================================================
 */
export const studentGetAcademicYearsInputSchema = z.object({}).strict();

export const studentAcademicYearItemSchema = z.object({
  id: z.string(),
  collegeId: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
});

export const studentGetAcademicYearsOutputSchema = z.object({
  academicYears: z.array(studentAcademicYearItemSchema),
  currentAcademicYear: studentAcademicYearItemSchema.nullable(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 10: student.getSemesters Schemas
 * ============================================================================
 */
export const studentGetSemestersInputSchema = z.object({}).strict();

export const studentSemesterItemSchema = z.object({
  id: z.string(),
  semesterNumber: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
});

export const studentGetSemestersOutputSchema = z.object({
  semesters: z.array(studentSemesterItemSchema),
  currentSemester: studentSemesterItemSchema.nullable(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 11: student.getTimetable Schemas
 * ============================================================================
 */
export const studentGetTimetableInputSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7).optional(),
});

export const studentTimetableSlotItemSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number(),
  periodNumber: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  subjectCode: z.string(),
  facultyName: z.string(),
  roomNumber: z.string().nullable(),
});

export const studentGetTimetableOutputSchema = z.object({
  className: z.string(),
  slots: z.array(studentTimetableSlotItemSchema),
  dayOfWeek: z.number().optional(),
  totalSlots: z.number().nonnegative(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 12: student.getAttendance Schemas
 * ============================================================================
 */
export const studentGetAttendanceInputSchema = z.object({
  date: z
    .string()
    .regex(dateIsoRegex, 'date must be in YYYY-MM-DD format')
    .optional(),
});

export const studentAttendanceSubjectSummarySchema = z.object({
  subjectId: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  percentage: z.number().min(0).max(100),
  present: z.number().nonnegative(),
  absent: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['SAFE', 'CRITICAL', 'NO_DATA']),
});

export const studentPeriodRecordSchema = z.object({
  periodNumber: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  subjectName: z.string(),
  status: z.enum(['PRESENT', 'ABSENT', 'UNRECORDED']),
});

export const studentDailyScheduleSchema = z.object({
  dayName: z.string(),
  dayOfWeek: z.number(),
  dateStr: z.string(),
  periods: z.array(studentPeriodRecordSchema),
});

export const studentGetAttendanceOutputSchema = z.object({
  summary: z.object({
    overallPercentage: z.number().min(0).max(100),
    totalPresent: z.number().nonnegative(),
    totalAbsent: z.number().nonnegative(),
    totalHeld: z.number().nonnegative(),
    status: z.enum(['SAFE', 'CRITICAL', 'NO_DATA']),
    safeMargin: z.number(),
    isEligible: z.boolean(),
  }),
  subjectBreakdown: z.array(studentAttendanceSubjectSummarySchema),
  dailySchedule: z.array(studentDailyScheduleSchema).optional(),
  selectedDate: z.string().optional(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 13: student.searchKnowledge Schemas (RAG)
 * ============================================================================
 */
export const studentSearchKnowledgeInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'query is required and cannot be empty')
    .max(500, 'query cannot exceed 500 characters'),
  category: z
    .enum(['policy', 'regulations', 'exam', 'attendance_rules', 'general'])
    .optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export const studentKnowledgeChunkSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  sourceDocument: z.string(),
  relevanceScore: z.number().min(0).max(1),
});

export const studentSearchKnowledgeOutputSchema = z.object({
  query: z.string(),
  results: z.array(studentKnowledgeChunkSchema),
  totalResults: z.number().nonnegative(),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 14: student.getKnowledgeContext Schemas (RAG)
 * ============================================================================
 */
export const studentGetKnowledgeContextInputSchema = z.object({
  documentId: z.string().trim().min(1, 'documentId is required'),
  topic: z.string().trim().optional(),
});

export const studentGetKnowledgeContextOutputSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.string(),
    approvedBy: z.string(),
  }),
  _isStub: z.boolean().optional(),
});

/**
 * Registry mapping tool name to input schema
 */
export const TOOL_INPUT_SCHEMAS: Record<
  (typeof STUDENT_TOOL_NAMES)[number],
  z.ZodTypeAny
> = {
  'student.getDashboard': studentGetDashboardInputSchema,
  'student.getProfile': studentGetProfileInputSchema,
  'student.getClass': studentGetClassInputSchema,
  'student.getBatch': studentGetBatchInputSchema,
  'student.getProgram': studentGetProgramInputSchema,
  'student.getDepartment': studentGetDepartmentInputSchema,
  'student.getSubjects': studentGetSubjectsInputSchema,
  'student.getClassIncharge': studentGetClassInchargeInputSchema,
  'student.getAcademicYears': studentGetAcademicYearsInputSchema,
  'student.getSemesters': studentGetSemestersInputSchema,
  'student.getTimetable': studentGetTimetableInputSchema,
  'student.getAttendance': studentGetAttendanceInputSchema,
  'student.searchKnowledge': studentSearchKnowledgeInputSchema,
  'student.getKnowledgeContext': studentGetKnowledgeContextInputSchema,
};

/**
 * Registry mapping tool name to output schema
 */
export const TOOL_OUTPUT_SCHEMAS: Record<
  (typeof STUDENT_TOOL_NAMES)[number],
  z.ZodTypeAny
> = {
  'student.getDashboard': studentGetDashboardOutputSchema,
  'student.getProfile': studentGetProfileOutputSchema,
  'student.getClass': studentGetClassOutputSchema,
  'student.getBatch': studentGetBatchOutputSchema,
  'student.getProgram': studentGetProgramOutputSchema,
  'student.getDepartment': studentGetDepartmentOutputSchema,
  'student.getSubjects': studentGetSubjectsOutputSchema,
  'student.getClassIncharge': studentGetClassInchargeOutputSchema,
  'student.getAcademicYears': studentGetAcademicYearsOutputSchema,
  'student.getSemesters': studentGetSemestersOutputSchema,
  'student.getTimetable': studentGetTimetableOutputSchema,
  'student.getAttendance': studentGetAttendanceOutputSchema,
  'student.searchKnowledge': studentSearchKnowledgeOutputSchema,
  'student.getKnowledgeContext': studentGetKnowledgeContextOutputSchema,
};
