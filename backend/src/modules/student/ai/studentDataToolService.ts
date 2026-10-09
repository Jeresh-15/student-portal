import type { StudentContext } from '../student.types';
import { studentService } from '../student.service';
import { AppError } from '../../../utils/errors';
import { studentToolRegistry } from './toolRegistry';
import type {
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
} from './studentAi.types';

/**
 * Helper to parse day of week string to integer (1 = Monday ... 5 = Friday)
 */
function parseDayOfWeek(dayStr: string): number {
  const d = (dayStr || '').trim().toLowerCase();
  if (d.includes('mon')) return 1;
  if (d.includes('tue')) return 2;
  if (d.includes('wed')) return 3;
  if (d.includes('thu')) return 4;
  if (d.includes('fri')) return 5;
  if (d.includes('sat')) return 6;
  if (d.includes('sun')) return 7;
  return 1;
}

/**
 * Helper to parse period string into period number
 */
function parsePeriodNumber(periodStr: string, fallbackIndex: number): number {
  const match = (periodStr || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : fallbackIndex + 1;
}

/**
 * ============================================================================
 * StudentDataToolService
 * ============================================================================
 * Implements deterministic Student data tools matching the canonical tool
 * contract (Tools 1 to 12).
 *
 * Reuses existing `studentService` and `studentRepository` logic directly.
 * Zero IDOR: All data access is strictly bound to token-derived `studentContext`.
 *
 * Author: Ashik (Step 2)
 * Branch: feature/student-tools
 * ============================================================================
 */
export class StudentDataToolService {
  /**
   * Enforce verified Student authorization context and boundaries.
   */
  private assertContext(context: StudentContext): void {
    if (!context || !context.uid) {
      throw new AppError(403, 'FORBIDDEN', 'Missing verified student authorization context');
    }
    const role = (context.role || '').toUpperCase();
    if (role !== 'STUDENT') {
      throw new AppError(403, 'FORBIDDEN', 'Unauthorized: STUDENT role required');
    }
  }

  // ==========================================================================
  // Tool 1: student.getDashboard
  // ==========================================================================
  async getDashboard(
    _input: StudentGetDashboardInput,
    context: StudentContext,
  ): Promise<StudentGetDashboardOutput> {
    this.assertContext(context);

    const data = await studentService.getDashboard(context);

    // Fetch attendance summary for the dashboard
    const att = await studentService.getAttendance(context);
    const summary = att.summary;

    const status: 'SAFE' | 'CRITICAL' | 'NO_DATA' =
      summary.totalSessions === 0
        ? 'NO_DATA'
        : summary.percentage >= 75
        ? 'SAFE'
        : 'CRITICAL';

    return {
      student: {
        name: data.student.displayName || data.student.firstName || 'Student',
        email: data.student.email,
        studentId: data.student.studentId || context.registerNumber,
        photoUrl: data.student.profilePhotoUrl,
        completionPercentage: data.student.profileCompletionPercentage,
      },
      academic: {
        className: data.class?.name || 'Class Assigned',
        currentSemester: data.class?.currentSemester || 1,
        batchYears: data.batch ? `${data.batch.startYear} - ${data.batch.endYear}` : '2023 - 2027',
        programName: data.program?.name || 'Academic Degree',
        degree: data.program?.type || 'B.Tech',
        departmentName: data.department?.name || 'Department',
        departmentCode: data.department?.code || 'DEPT',
        academicYear: data.academicYear?.name || '2025-2026',
        classIncharge: data.classIncharge
          ? {
              name: data.classIncharge.name,
              email: data.classIncharge.email,
              designation: data.classIncharge.designation || 'Class Incharge',
              cabin: null,
            }
          : null,
      },
      attendanceSummary: {
        overallPercentage: summary.percentage,
        totalPresent: summary.presentCount,
        totalAbsent: summary.absentCount,
        totalHeld: summary.totalSessions,
        status,
        safeMargin: summary.safeMargin,
      },
      subjectsCount: data.subjects?.length || 0,
      semestersCount: 8,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 2: student.getProfile
  // ==========================================================================
  async getProfile(
    _input: StudentGetProfileInput,
    context: StudentContext,
  ): Promise<StudentGetProfileOutput> {
    this.assertContext(context);

    const data = await studentService.getProfile(context);

    return {
      id: data.id,
      userId: data.userId || context.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName || data.firstName || 'Student',
      studentId: data.studentId || context.registerNumber,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      profilePhotoUrl: data.profilePhotoUrl,
      enrollmentYear: data.enrollmentYear,
      profileCompletionPercentage: data.profileCompletionPercentage,
      accountStatus: data.accountStatus,
      bio: data.bio,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 3: student.getClass
  // ==========================================================================
  async getClass(
    _input: StudentGetClassInput,
    context: StudentContext,
  ): Promise<StudentGetClassOutput> {
    this.assertContext(context);

    const cls = await studentService.getClass(context);

    return {
      id: cls.id,
      batchId: cls.batchId,
      name: cls.name,
      currentSemester: cls.currentSemester,
      facultyUid: cls.facultyUid,
      isActive: cls.isActive,
      batchName: cls.batch ? `${cls.batch.startYear} - ${cls.batch.endYear}` : undefined,
      programName: cls.program?.name,
      departmentName: cls.department?.name,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 4: student.getBatch
  // ==========================================================================
  async getBatch(
    _input: StudentGetBatchInput,
    context: StudentContext,
  ): Promise<StudentGetBatchOutput> {
    this.assertContext(context);

    const batch = await studentService.getBatch(context);

    return {
      id: batch.id,
      programId: batch.programId,
      startYear: batch.startYear,
      endYear: batch.endYear,
      batchYears: `${batch.startYear} - ${batch.endYear}`,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 5: student.getProgram
  // ==========================================================================
  async getProgram(
    _input: StudentGetProgramInput,
    context: StudentContext,
  ): Promise<StudentGetProgramOutput> {
    this.assertContext(context);

    const prog = await studentService.getProgram(context);

    return {
      id: prog.id,
      departmentId: prog.departmentId,
      name: prog.name,
      code: prog.name.split(' ').map((w) => w[0]).join('').toUpperCase() || 'PROG',
      degreeType: prog.type || 'UNDERGRADUATE',
      durationYears: prog.durationYears,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 6: student.getDepartment
  // ==========================================================================
  async getDepartment(
    _input: StudentGetDepartmentInput,
    context: StudentContext,
  ): Promise<StudentGetDepartmentOutput> {
    this.assertContext(context);

    const dept = await studentService.getDepartment(context);

    return {
      id: dept.id,
      collegeId: dept.collegeId,
      name: dept.name,
      code: dept.code,
      description: dept.collegeName || null,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 7: student.getSubjects
  // ==========================================================================
  async getSubjects(
    input: StudentGetSubjectsInput,
    context: StudentContext,
  ): Promise<StudentGetSubjectsOutput> {
    this.assertContext(context);

    const subjects = await studentService.getSubjects(context, input.semesterNumber);

    return {
      subjects: subjects.map((s) => ({
        id: s.id,
        departmentId: s.departmentId,
        name: s.name,
        code: s.code,
        credits: s.credits,
        type: s.name.toLowerCase().includes('lab') ? 'PRACTICAL' : 'THEORY',
        semesterNumber: s.semesterNumber,
      })),
      totalSubjects: subjects.length,
      semesterNumber: input.semesterNumber,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 8: student.getClassIncharge
  // ==========================================================================
  async getClassIncharge(
    _input: StudentGetClassInchargeInput,
    context: StudentContext,
  ): Promise<StudentGetClassInchargeOutput> {
    this.assertContext(context);

    const incharge = await studentService.getClassIncharge(context);

    return {
      facultyUid: incharge.facultyUid,
      name: incharge.name,
      email: incharge.email,
      designation: incharge.designation || 'Class Incharge / Assistant Professor',
      phone: incharge.phone,
      cabin: null,
      departmentName: incharge.department || 'Department Faculty',
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 9: student.getAcademicYears
  // ==========================================================================
  async getAcademicYears(
    _input: StudentGetAcademicYearsInput,
    context: StudentContext,
  ): Promise<StudentGetAcademicYearsOutput> {
    this.assertContext(context);

    const ays = await studentService.getAcademicYears(context);
    const currentAcademicYear = ays.find((ay) => ay.isCurrent) || ays[0] || null;

    return {
      academicYears: ays.map((ay) => ({
        id: ay.id,
        collegeId: ay.collegeId,
        name: ay.name,
        startDate: ay.startDate,
        endDate: ay.endDate,
        isCurrent: ay.isCurrent,
      })),
      currentAcademicYear: currentAcademicYear
        ? {
            id: currentAcademicYear.id,
            collegeId: currentAcademicYear.collegeId,
            name: currentAcademicYear.name,
            startDate: currentAcademicYear.startDate,
            endDate: currentAcademicYear.endDate,
            isCurrent: currentAcademicYear.isCurrent,
          }
        : null,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 10: student.getSemesters
  // ==========================================================================
  async getSemesters(
    _input: StudentGetSemestersInput,
    context: StudentContext,
  ): Promise<StudentGetSemestersOutput> {
    this.assertContext(context);

    const sems = await studentService.getSemesters(context);
    const currentSemester = sems[0] || null;

    return {
      semesters: sems.map((s, idx) => ({
        id: s.id,
        semesterNumber: s.termNumber || idx + 1,
        name: `Semester ${s.termNumber || idx + 1}`,
        startDate: s.startDate,
        endDate: s.endDate,
        isCurrent: idx === 0,
      })),
      currentSemester: currentSemester
        ? {
            id: currentSemester.id,
            semesterNumber: currentSemester.termNumber || 1,
            name: `Semester ${currentSemester.termNumber || 1}`,
            startDate: currentSemester.startDate,
            endDate: currentSemester.endDate,
            isCurrent: true,
          }
        : null,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 11: student.getTimetable
  // ==========================================================================
  async getTimetable(
    input: StudentGetTimetableInput,
    context: StudentContext,
  ): Promise<StudentGetTimetableOutput> {
    this.assertContext(context);

    const allSlots = await studentService.getClassTimetable(context);

    const mappedSlots = allSlots.map((s, idx) => ({
      id: s.id,
      dayOfWeek: parseDayOfWeek(s.day_of_week),
      periodNumber: parsePeriodNumber(s.period, idx),
      startTime: s.start_time || '09:00',
      endTime: s.end_time || '09:50',
      subjectId: s.id,
      subjectName: s.subject_name,
      subjectCode: s.subject_code || 'SUBJ',
      facultyName: s.faculty_name || 'Faculty',
      roomNumber: s.room || null,
    }));

    const filteredSlots = input.dayOfWeek
      ? mappedSlots.filter((slot) => slot.dayOfWeek === input.dayOfWeek)
      : mappedSlots;

    return {
      className: allSlots[0]?.subject_name ? 'Enrolled Class' : 'Class Timetable',
      slots: filteredSlots,
      dayOfWeek: input.dayOfWeek,
      totalSlots: filteredSlots.length,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 12: student.getAttendance
  // ==========================================================================
  async getAttendance(
    input: StudentGetAttendanceInput,
    context: StudentContext,
  ): Promise<StudentGetAttendanceOutput> {
    this.assertContext(context);

    const attendanceData = await studentService.getAttendance(context, input.date);
    const summary = attendanceData.summary;

    const status: 'SAFE' | 'CRITICAL' | 'NO_DATA' =
      summary.totalSessions === 0
        ? 'NO_DATA'
        : summary.percentage >= 75
        ? 'SAFE'
        : 'CRITICAL';

    return {
      summary: {
        overallPercentage: summary.percentage,
        totalPresent: summary.presentCount,
        totalAbsent: summary.absentCount,
        totalHeld: summary.totalSessions,
        status,
        safeMargin: summary.safeMargin,
        isEligible: summary.percentage >= 75.0,
      },
      subjectBreakdown: attendanceData.subjectBreakdown.map((s) => ({
        subjectId: s.id,
        subjectCode: s.code,
        subjectName: s.name,
        percentage: s.percentage,
        present: s.attended,
        absent: s.absent,
        total: s.held,
        status: s.status,
      })),
      dailySchedule: attendanceData.dailySchedule?.map((d) => ({
        dayName: d.dayName,
        dayOfWeek: parseDayOfWeek(d.dayOfWeek),
        dateStr: d.dateStr,
        periods: d.periods.map((p, idx) => ({
          periodNumber: p.period || idx + 1,
          startTime: p.timeSlot?.split('-')[0]?.trim() || '09:00',
          endTime: p.timeSlot?.split('-')[1]?.trim() || '09:50',
          subjectName: p.courseName,
          status: (p.status === 'PRESENT' || p.status === 'ABSENT' ? p.status : 'UNRECORDED') as
            | 'PRESENT'
            | 'ABSENT'
            | 'UNRECORDED',
        })),
      })),
      selectedDate: input.date,
      _isStub: false,
    };
  }
}

export const studentDataToolService = new StudentDataToolService();

/**
 * Register all 12 deterministic Student data tools with the canonical registry.
 */
export function registerStudentDataToolHandlers(): void {
  studentToolRegistry.registerToolHandler(
    'student.getDashboard',
    (input: StudentGetDashboardInput, ctx: StudentContext) =>
      studentDataToolService.getDashboard(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getProfile',
    (input: StudentGetProfileInput, ctx: StudentContext) =>
      studentDataToolService.getProfile(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getClass',
    (input: StudentGetClassInput, ctx: StudentContext) =>
      studentDataToolService.getClass(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getBatch',
    (input: StudentGetBatchInput, ctx: StudentContext) =>
      studentDataToolService.getBatch(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getProgram',
    (input: StudentGetProgramInput, ctx: StudentContext) =>
      studentDataToolService.getProgram(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getDepartment',
    (input: StudentGetDepartmentInput, ctx: StudentContext) =>
      studentDataToolService.getDepartment(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getSubjects',
    (input: StudentGetSubjectsInput, ctx: StudentContext) =>
      studentDataToolService.getSubjects(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getClassIncharge',
    (input: StudentGetClassInchargeInput, ctx: StudentContext) =>
      studentDataToolService.getClassIncharge(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getAcademicYears',
    (input: StudentGetAcademicYearsInput, ctx: StudentContext) =>
      studentDataToolService.getAcademicYears(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getSemesters',
    (input: StudentGetSemestersInput, ctx: StudentContext) =>
      studentDataToolService.getSemesters(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getTimetable',
    (input: StudentGetTimetableInput, ctx: StudentContext) =>
      studentDataToolService.getTimetable(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getAttendance',
    (input: StudentGetAttendanceInput, ctx: StudentContext) =>
      studentDataToolService.getAttendance(input, ctx),
  );
}

// Auto-register upon module load
registerStudentDataToolHandlers();
