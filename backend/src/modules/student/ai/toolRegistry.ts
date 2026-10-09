import type { StudentContext } from '../student.types';
import { AppError } from '../../../utils/errors';
import {
  STUDENT_TOOL_NAMES,
  StudentToolName,
  isStudentToolName,
  ToolExecutionResult,
  ToolHandler,
  ToolMetadata,
  StudentGetDashboardInput,
  StudentGetDashboardOutput,
  StudentGetProfileInput,
  StudentGetProfileOutput,
  StudentGetClassInput,
  StudentGetClassOutput,
  StudentGetBatchInput,
  StudentGetBatchOutput,
  StudentGetProgramInput,
  StudentGetProgramOutput,
  StudentGetDepartmentInput,
  StudentGetDepartmentOutput,
  StudentGetSubjectsInput,
  StudentGetSubjectsOutput,
  StudentGetClassInchargeInput,
  StudentGetClassInchargeOutput,
  StudentGetAcademicYearsInput,
  StudentGetAcademicYearsOutput,
  StudentGetSemestersInput,
  StudentGetSemestersOutput,
  StudentGetTimetableInput,
  StudentGetTimetableOutput,
  StudentGetAttendanceInput,
  StudentGetAttendanceOutput,
  StudentSearchKnowledgeInput,
  StudentSearchKnowledgeOutput,
  StudentGetKnowledgeContextInput,
  StudentGetKnowledgeContextOutput,
} from './studentAi.types';
import {
  TOOL_INPUT_SCHEMAS,
  TOOL_OUTPUT_SCHEMAS,
} from './studentAi.validation';

/**
 * ============================================================================
 * Default Stub Handlers
 * ============================================================================
 * These provide deterministic, schema-compliant placeholder execution
 * during Step 1 (Tushar). Ashik (Step 2) and Jeresh (Step 3) will provide
 * live database/RAG implementations via `registerToolHandler`.
 */
export const defaultStubHandlers: {
  [K in StudentToolName]: ToolHandler<any, any>;
} = {
  'student.getDashboard': async (
    _input: StudentGetDashboardInput,
    context: StudentContext,
  ): Promise<StudentGetDashboardOutput> => {
    return {
      student: {
        name: context.displayName || 'Student',
        email: context.email,
        studentId: context.registerNumber || context.uid,
        photoUrl: context.photoURL,
        completionPercentage: 85,
      },
      academic: {
        className: 'Class CSE-3A',
        currentSemester: 5,
        batchYears: '2023 - 2027',
        programName: 'B.Tech Computer Science and Engineering',
        degree: 'B.Tech',
        departmentName: 'Computer Science and Engineering',
        departmentCode: 'CSE',
        academicYear: '2025-2026',
        classIncharge: {
          name: 'Dr. Jane Hopper',
          email: 'jane.hopper@college.edu',
          designation: 'Associate Professor',
          cabin: 'Block A, Room 302',
        },
      },
      attendanceSummary: {
        overallPercentage: 88.5,
        totalPresent: 142,
        totalAbsent: 18,
        totalHeld: 160,
        status: 'SAFE',
        safeMargin: 13,
      },
      subjectsCount: 6,
      semestersCount: 8,
      _isStub: true,
    };
  },

  'student.getProfile': async (
    _input: StudentGetProfileInput,
    context: StudentContext,
  ): Promise<StudentGetProfileOutput> => {
    return {
      userId: context.uid,
      firstName: context.displayName ? context.displayName.split(' ')[0] : 'Student',
      lastName: context.displayName ? context.displayName.split(' ').slice(1).join(' ') || null : null,
      displayName: context.displayName || 'Student',
      studentId: context.registerNumber || context.uid,
      email: context.email,
      phone: '+91 9876543210',
      address: '123 University Campus Hostel',
      city: 'Chennai',
      state: 'Tamil Nadu',
      dateOfBirth: '2004-05-15',
      gender: 'Male',
      profilePhotoUrl: context.photoURL,
      enrollmentYear: 2023,
      profileCompletionPercentage: 85,
      accountStatus: 'ACTIVE',
      bio: 'Third-year undergraduate exploring AI and full-stack development.',
      _isStub: true,
    };
  },

  'student.getClass': async (
    _input: StudentGetClassInput,
    context: StudentContext,
  ): Promise<StudentGetClassOutput> => {
    return {
      id: context.classId || 'class-cse-3a',
      batchId: 'batch-2023-2027',
      name: 'Class CSE-3A',
      currentSemester: 5,
      facultyUid: 'fac-incharge-001',
      isActive: true,
      batchName: '2023-2027',
      programName: 'B.Tech Computer Science and Engineering',
      departmentName: 'Computer Science and Engineering',
      _isStub: true,
    };
  },

  'student.getBatch': async (
    _input: StudentGetBatchInput,
    _context: StudentContext,
  ): Promise<StudentGetBatchOutput> => {
    return {
      id: 'batch-2023-2027',
      programId: 'prog-btech-cse',
      startYear: 2023,
      endYear: 2027,
      batchYears: '2023 - 2027',
      _isStub: true,
    };
  },

  'student.getProgram': async (
    _input: StudentGetProgramInput,
    context: StudentContext,
  ): Promise<StudentGetProgramOutput> => {
    return {
      id: 'prog-btech-cse',
      departmentId: context.departmentId || 'dept-cse',
      name: 'B.Tech Computer Science and Engineering',
      code: 'BTECH-CSE',
      degreeType: 'UNDERGRADUATE',
      durationYears: 4,
      _isStub: true,
    };
  },

  'student.getDepartment': async (
    _input: StudentGetDepartmentInput,
    context: StudentContext,
  ): Promise<StudentGetDepartmentOutput> => {
    return {
      id: context.departmentId || 'dept-cse',
      collegeId: context.collegeId || 'college-alpha',
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
      _isStub: true,
    };
  },

  'student.getSubjects': async (
    input: StudentGetSubjectsInput,
    _context: StudentContext,
  ): Promise<StudentGetSubjectsOutput> => {
    const sem = input.semesterNumber || 5;
    const subjects = [
      {
        id: 'subj-cs501',
        departmentId: 'dept-cse',
        name: 'Database Management Systems',
        code: 'CS501',
        credits: 4,
        type: 'THEORY',
        semesterNumber: sem,
      },
      {
        id: 'subj-cs502',
        departmentId: 'dept-cse',
        name: 'Design and Analysis of Algorithms',
        code: 'CS502',
        credits: 4,
        type: 'THEORY',
        semesterNumber: sem,
      },
      {
        id: 'subj-cs503',
        departmentId: 'dept-cse',
        name: 'Software Engineering',
        code: 'CS503',
        credits: 3,
        type: 'THEORY',
        semesterNumber: sem,
      },
      {
        id: 'subj-cs504',
        departmentId: 'dept-cse',
        name: 'Computer Networks',
        code: 'CS504',
        credits: 4,
        type: 'THEORY',
        semesterNumber: sem,
      },
      {
        id: 'subj-cs505',
        departmentId: 'dept-cse',
        name: 'DBMS Laboratory',
        code: 'CS505',
        credits: 2,
        type: 'PRACTICAL',
        semesterNumber: sem,
      },
    ];

    return {
      subjects,
      totalSubjects: subjects.length,
      semesterNumber: sem,
      _isStub: true,
    };
  },

  'student.getClassIncharge': async (
    _input: StudentGetClassInchargeInput,
    _context: StudentContext,
  ): Promise<StudentGetClassInchargeOutput> => {
    return {
      facultyUid: 'fac-incharge-001',
      name: 'Dr. Jane Hopper',
      email: 'jane.hopper@college.edu',
      designation: 'Associate Professor',
      phone: '+91 9444012345',
      cabin: 'Block A, Room 302',
      departmentName: 'Computer Science and Engineering',
      _isStub: true,
    };
  },

  'student.getAcademicYears': async (
    _input: StudentGetAcademicYearsInput,
    context: StudentContext,
  ): Promise<StudentGetAcademicYearsOutput> => {
    const academicYears = [
      {
        id: 'ay-2025-2026',
        collegeId: context.collegeId || 'college-alpha',
        name: '2025-2026',
        startDate: '2025-06-01',
        endDate: '2026-05-31',
        isCurrent: true,
      },
      {
        id: 'ay-2024-2025',
        collegeId: context.collegeId || 'college-alpha',
        name: '2024-2025',
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        isCurrent: false,
      },
    ];

    return {
      academicYears,
      currentAcademicYear: academicYears[0],
      _isStub: true,
    };
  },

  'student.getSemesters': async (
    _input: StudentGetSemestersInput,
    _context: StudentContext,
  ): Promise<StudentGetSemestersOutput> => {
    const semesters = [
      {
        id: 'sem-5',
        semesterNumber: 5,
        name: 'Semester 5 (Odd)',
        startDate: '2025-06-15',
        endDate: '2025-11-30',
        isCurrent: true,
      },
      {
        id: 'sem-6',
        semesterNumber: 6,
        name: 'Semester 6 (Even)',
        startDate: '2025-12-15',
        endDate: '2026-05-15',
        isCurrent: false,
      },
    ];

    return {
      semesters,
      currentSemester: semesters[0],
      _isStub: true,
    };
  },

  'student.getTimetable': async (
    input: StudentGetTimetableInput,
    _context: StudentContext,
  ): Promise<StudentGetTimetableOutput> => {
    const allSlots = [
      {
        id: 'slot-1',
        dayOfWeek: 1, // Monday
        periodNumber: 1,
        startTime: '09:00',
        endTime: '09:50',
        subjectId: 'subj-cs501',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS501',
        facultyName: 'Dr. Jane Hopper',
        roomNumber: 'LH-301',
      },
      {
        id: 'slot-2',
        dayOfWeek: 1,
        periodNumber: 2,
        startTime: '09:50',
        endTime: '10:40',
        subjectId: 'subj-cs502',
        subjectName: 'Design and Analysis of Algorithms',
        subjectCode: 'CS502',
        facultyName: 'Prof. Alan Turing',
        roomNumber: 'LH-301',
      },
      {
        id: 'slot-3',
        dayOfWeek: 1,
        periodNumber: 3,
        startTime: '10:55',
        endTime: '11:45',
        subjectId: 'subj-cs503',
        subjectName: 'Software Engineering',
        subjectCode: 'CS503',
        facultyName: 'Dr. Grace Hopper',
        roomNumber: 'LH-301',
      },
      {
        id: 'slot-4',
        dayOfWeek: 2, // Tuesday
        periodNumber: 1,
        startTime: '09:00',
        endTime: '09:50',
        subjectId: 'subj-cs504',
        subjectName: 'Computer Networks',
        subjectCode: 'CS504',
        facultyName: 'Prof. Claude Shannon',
        roomNumber: 'LH-302',
      },
    ];

    const slots = input.dayOfWeek
      ? allSlots.filter((s) => s.dayOfWeek === input.dayOfWeek)
      : allSlots;

    return {
      className: 'Class CSE-3A',
      slots,
      dayOfWeek: input.dayOfWeek,
      totalSlots: slots.length,
      _isStub: true,
    };
  },

  'student.getAttendance': async (
    input: StudentGetAttendanceInput,
    _context: StudentContext,
  ): Promise<StudentGetAttendanceOutput> => {
    return {
      summary: {
        overallPercentage: 88.5,
        totalPresent: 142,
        totalAbsent: 18,
        totalHeld: 160,
        status: 'SAFE',
        safeMargin: 13,
        isEligible: true,
      },
      subjectBreakdown: [
        {
          subjectId: 'subj-cs501',
          subjectCode: 'CS501',
          subjectName: 'Database Management Systems',
          percentage: 92.5,
          present: 37,
          absent: 3,
          total: 40,
          status: 'SAFE',
        },
        {
          subjectId: 'subj-cs502',
          subjectCode: 'CS502',
          subjectName: 'Design and Analysis of Algorithms',
          percentage: 85.0,
          present: 34,
          absent: 6,
          total: 40,
          status: 'SAFE',
        },
        {
          subjectId: 'subj-cs503',
          subjectCode: 'CS503',
          subjectName: 'Software Engineering',
          percentage: 90.0,
          present: 36,
          absent: 4,
          total: 40,
          status: 'SAFE',
        },
        {
          subjectId: 'subj-cs504',
          subjectCode: 'CS504',
          subjectName: 'Computer Networks',
          percentage: 87.5,
          present: 35,
          absent: 5,
          total: 40,
          status: 'SAFE',
        },
      ],
      selectedDate: input.date,
      _isStub: true,
    };
  },

  'student.searchKnowledge': async (
    input: StudentSearchKnowledgeInput,
    _context: StudentContext,
  ): Promise<StudentSearchKnowledgeOutput> => {
    const results = [
      {
        id: 'chunk-policy-01',
        title: 'Attendance Regulations and Safe Margin Policy',
        content:
          'Students must maintain a minimum of 75% attendance across all registered courses to be eligible for end-semester examinations. Condonation may be requested between 65% and 74% with documented medical verification.',
        category: 'policy',
        sourceDocument: 'Academic_Regulations_2025.pdf',
        relevanceScore: 0.94,
      },
      {
        id: 'chunk-exam-02',
        title: 'Continuous Assessment and Internal Weightage',
        content:
          'Internal marks comprise 40% of the overall course grade based on periodic tests, assignments, and active laboratory participation.',
        category: 'exam',
        sourceDocument: 'Examination_Manual_v3.pdf',
        relevanceScore: 0.88,
      },
    ];

    return {
      query: input.query,
      results,
      totalResults: results.length,
      _isStub: true,
    };
  },

  'student.getKnowledgeContext': async (
    input: StudentGetKnowledgeContextInput,
    _context: StudentContext,
  ): Promise<StudentGetKnowledgeContextOutput> => {
    return {
      documentId: input.documentId,
      title: 'Institutional Academic Handbook',
      content:
        'Official institutional handbook detailing student code of conduct, academic policies, course drop/add rules, leave applications, and examination protocols.',
      category: 'regulations',
      metadata: {
        version: 'v2025.2',
        lastUpdated: '2025-08-01',
        approvedBy: 'Academic Council',
      },
      _isStub: true,
    };
  },
};

/**
 * Metadata for all 14 canonical tools
 */
export const CANONICAL_TOOL_METADATA: Record<StudentToolName, ToolMetadata> = {
  'student.getDashboard': {
    name: 'student.getDashboard',
    description:
      "Retrieves the authenticated student's unified academic dashboard, including profile overview, class info, semester, attendance summary, and counts.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Unified student academic dashboard data',
    },
  },
  'student.getProfile': {
    name: 'student.getProfile',
    description:
      "Retrieves the authenticated student's personal profile, contact information, enrollment details, and completion percentage.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Student profile details',
    },
  },
  'student.getClass': {
    name: 'student.getClass',
    description:
      "Retrieves the authenticated student's enrolled class information, section, semester, batch, program, and department hierarchy.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Class hierarchy and metadata',
    },
  },
  'student.getBatch': {
    name: 'student.getBatch',
    description:
      "Retrieves the student's batch details including academic start year, expected graduation year, and program linkage.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Batch start/end years and identifiers',
    },
  },
  'student.getProgram': {
    name: 'student.getProgram',
    description:
      "Retrieves the academic degree program information (e.g., B.Tech, M.Tech), program code, and duration.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Program name, code, degree type, and duration',
    },
  },
  'student.getDepartment': {
    name: 'student.getDepartment',
    description:
      "Retrieves the student's academic department details, department code, and college affiliation.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Department name, code, and college ID',
    },
  },
  'student.getSubjects': {
    name: 'student.getSubjects',
    description:
      "Retrieves the registered subjects/courses for the student, optionally filtered by semester number, including course codes and credits.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {
        semesterNumber: {
          type: 'number',
          description: 'Optional semester number (1-12) to filter subjects',
        },
      },
    },
    returns: {
      type: 'object',
      description: 'List of registered subjects with credits and codes',
    },
  },
  'student.getClassIncharge': {
    name: 'student.getClassIncharge',
    description:
      "Retrieves contact and office details for the authenticated student's assigned Class Incharge / faculty mentor.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'Class Incharge faculty name, email, designation, and cabin',
    },
  },
  'student.getAcademicYears': {
    name: 'student.getAcademicYears',
    description:
      "Retrieves institutional academic years and identifies the currently active academic calendar year.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'List of academic years with current year flag',
    },
  },
  'student.getSemesters': {
    name: 'student.getSemesters',
    description:
      "Retrieves list of academic semesters and marks the current active semester.",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {},
    },
    returns: {
      type: 'object',
      description: 'List of semesters with active semester indicator',
    },
  },
  'student.getTimetable': {
    name: 'student.getTimetable',
    description:
      "Retrieves the verified master weekly class timetable, schedule periods, faculty names, and room numbers. Can filter by dayOfWeek (1=Mon..5=Fri).",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {
        dayOfWeek: {
          type: 'number',
          description: 'Day of week: 1 (Monday) through 5 (Friday)',
        },
      },
    },
    returns: {
      type: 'object',
      description: 'Timetable slots with period numbers, subjects, rooms, and faculty',
    },
  },
  'student.getAttendance': {
    name: 'student.getAttendance',
    description:
      "Retrieves verified attendance records, overall percentage, 75% exam eligibility, safe margin buffer, and per-subject attendance breakdown. Optionally takes a date (YYYY-MM-DD).",
    category: 'deterministic',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Optional specific date in YYYY-MM-DD format',
        },
      },
    },
    returns: {
      type: 'object',
      description: 'Attendance metrics, percentage, safe margins, and subject breakdown',
    },
  },
  'student.searchKnowledge': {
    name: 'student.searchKnowledge',
    description:
      "Retrieves institutional policies, academic regulations, examination procedures, and student handbooks via RAG semantic search.",
    category: 'rag',
    parameters: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'Question or search phrase regarding college policies or regulations',
        },
        category: {
          type: 'string',
          enum: ['policy', 'regulations', 'exam', 'attendance_rules', 'general'],
        },
        limit: {
          type: 'number',
          description: 'Max number of chunks to return (default 5)',
        },
      },
    },
    returns: {
      type: 'object',
      description: 'Relevant policy and regulation knowledge chunks with source citations',
    },
  },
  'student.getKnowledgeContext': {
    name: 'student.getKnowledgeContext',
    description:
      "Retrieves complete contextual guidance from a specific institutional document or handbook topic.",
    category: 'rag',
    parameters: {
      type: 'object',
      required: ['documentId'],
      properties: {
        documentId: {
          type: 'string',
          description: 'Document identifier for the handbook or regulation file',
        },
        topic: {
          type: 'string',
          description: 'Specific section topic within the document',
        },
      },
    },
    returns: {
      type: 'object',
      description: 'Detailed policy context, approval metadata, and guidelines',
    },
  },
};

/**
 * ============================================================================
 * Canonical Student Tool Registry Class
 * ============================================================================
 */
export class StudentToolRegistry {
  private handlers: Map<StudentToolName, ToolHandler<any, any>>;

  constructor() {
    this.handlers = new Map();
    this.resetToDefaultStub();
  }

  /**
   * Reset all handlers (or a specific handler) to default stubs.
   */
  public resetToDefaultStub(toolName?: StudentToolName): void {
    if (toolName) {
      this.handlers.set(toolName, defaultStubHandlers[toolName]);
    } else {
      STUDENT_TOOL_NAMES.forEach((name) => {
        this.handlers.set(name, defaultStubHandlers[name]);
      });
    }
  }

  /**
   * Register a custom tool handler.
   * This is the exact extension hook consumed by Ashik (Step 2) for live data tools
   * and Jeresh (Step 3) for live RAG tools.
   */
  public registerToolHandler<TInput, TOutput>(
    toolName: StudentToolName,
    handler: ToolHandler<TInput, TOutput>,
  ): void {
    if (!isStudentToolName(toolName)) {
      throw new AppError(400, 'UNKNOWN_TOOL', `Cannot register unknown tool: ${toolName}`);
    }
    this.handlers.set(toolName, handler);
  }

  /**
   * Returns metadata for all 14 canonical tools.
   */
  public getRegisteredTools(): ToolMetadata[] {
    return STUDENT_TOOL_NAMES.map((name) => CANONICAL_TOOL_METADATA[name]);
  }

  /**
   * Returns metadata for a specific tool.
   */
  public getToolMetadata(toolName: string): ToolMetadata {
    if (!isStudentToolName(toolName)) {
      throw new AppError(400, 'UNKNOWN_TOOL', `Tool '${toolName}' is not recognized`);
    }
    return CANONICAL_TOOL_METADATA[toolName];
  }

  /**
   * Safely executes a registered tool with full validation, execution timing,
   * error isolation, and output contract validation.
   */
  public async executeTool(
    toolName: string,
    rawArgs: Record<string, any> = {},
    context: StudentContext,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Tool name validation
    if (!isStudentToolName(toolName)) {
      return {
        toolName: toolName as any,
        arguments: rawArgs,
        status: 'error',
        error: {
          code: 'UNKNOWN_TOOL',
          message: `Tool '${toolName}' is not a recognized canonical student tool. Available tools: ${STUDENT_TOOL_NAMES.join(', ')}`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 2. Validate tool input arguments
    const inputSchema = TOOL_INPUT_SCHEMAS[toolName];
    const parseResult = inputSchema.safeParse(rawArgs);

    if (!parseResult.success) {
      return {
        toolName,
        arguments: rawArgs,
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Malformed arguments for tool '${toolName}'`,
          details: parseResult.error.errors,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 3. Retrieve handler
    const handler = this.handlers.get(toolName);
    if (!handler) {
      return {
        toolName,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: 'HANDLER_NOT_FOUND',
          message: `No execution handler registered for tool '${toolName}'`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 4. Execute handler with trusted context
    try {
      const output = await handler(parseResult.data, context);

      // 5. Validate output schema
      const outputSchema = TOOL_OUTPUT_SCHEMAS[toolName];
      const outputValidation = outputSchema.safeParse(output);

      if (!outputValidation.success) {
        return {
          toolName,
          arguments: parseResult.data,
          status: 'error',
          error: {
            code: 'OUTPUT_CONTRACT_VIOLATION',
            message: `Tool '${toolName}' output violated the canonical contract`,
            details: outputValidation.error.errors,
          },
          executionDurationMs: Date.now() - startTime,
        };
      }

      return {
        toolName,
        arguments: parseResult.data,
        status: 'success',
        result: outputValidation.data,
        executionDurationMs: Date.now() - startTime,
      };
    } catch (executionError: any) {
      return {
        toolName,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: executionError?.code || 'EXECUTION_FAILED',
          message: executionError?.message || 'Tool execution encountered an unexpected error',
          details: executionError?.details || null,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }
  }
}

export const studentToolRegistry = new StudentToolRegistry();
