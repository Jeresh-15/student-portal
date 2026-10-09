import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudentContext } from '../src/modules/student/student.types';

// Mock DB and Firebase
vi.mock('../src/config/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: vi.fn(),
  },
  verifyFirebaseIdToken: vi.fn(),
}));

vi.mock('../src/config/database', () => ({
  default: {
    authedUser: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    profile: { findUnique: vi.fn() },
    class: { findUnique: vi.fn() },
    batch: { findUnique: vi.fn() },
    program: { findUnique: vi.fn() },
    department: { findUnique: vi.fn() },
    subject: { findMany: vi.fn() },
    academicYear: { findMany: vi.fn() },
    semester: { findMany: vi.fn() },
    classTimetable: { findMany: vi.fn() },
    $queryRawUnsafe: vi.fn(),
  },
}));

import prisma from '../src/config/database';
import {
  studentDataToolService,
  registerStudentDataToolHandlers,
} from '../src/modules/student/ai/studentDataToolService';
import { studentToolRegistry } from '../src/modules/student/ai/toolRegistry';
import { studentService } from '../src/modules/student/student.service';

const db = prisma as any;

const validCollegeId = 'college-alpha-001';
const validDepartmentId = 'dept-cse-101';
const validClassId = 'class-cse-3a';
const validStudentUid = 'student-firebase-uid-123';
const validRegisterNumber = 'REG-2023-CSE-042';
const validEmail = 'student.cse@institution.edu';

const mockStudentContext: StudentContext = {
  uid: validStudentUid,
  email: validEmail,
  displayName: 'Alex Mercer',
  photoURL: null,
  role: 'STUDENT',
  collegeId: validCollegeId,
  departmentId: validDepartmentId,
  classId: validClassId,
  registerNumber: validRegisterNumber,
};

describe('Student Data Tools Suite (Step 2 — Ashik)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerStudentDataToolHandlers();
  });

  describe('1. Security & RBAC Enforcement', () => {
    it('throws 403 when StudentContext is missing', async () => {
      await expect(
        studentDataToolService.getAttendance({}, null as any),
      ).rejects.toThrow('Missing verified student authorization context');
    });

    it('throws 403 when caller has non-STUDENT role', async () => {
      const unauthorizedContext = {
        ...mockStudentContext,
        role: 'FACULTY',
      };

      await expect(
        studentDataToolService.getAttendance({}, unauthorizedContext),
      ).rejects.toThrow('Unauthorized: STUDENT role required');
    });

    it('throws 403 when caller is HOD or ADMIN trying to access student data tools', async () => {
      const hodContext = {
        ...mockStudentContext,
        role: 'HOD',
      };

      await expect(
        studentDataToolService.getDashboard({}, hodContext),
      ).rejects.toThrow('Unauthorized: STUDENT role required');
    });
  });

  describe('2. Deterministic Tool Execution & Output Contracts', () => {
    it('student.getDashboard returns complete unified dashboard with _isStub: false', async () => {
      vi.spyOn(studentService, 'getDashboard').mockResolvedValueOnce({
        student: {
          firstName: 'Alex',
          lastName: 'Mercer',
          displayName: 'Alex Mercer',
          studentId: validRegisterNumber,
          email: validEmail,
          phone: '+91 9876543210',
          address: 'Campus Hostel',
          city: 'Chennai',
          state: 'Tamil Nadu',
          dateOfBirth: '2004-05-15',
          gender: 'Male',
          profilePhotoUrl: null,
          enrollmentYear: 2023,
          profileCompletionPercentage: 90,
          accountStatus: 'ACTIVE',
          bio: 'Student bio',
        },
        class: {
          id: validClassId,
          batchId: 'batch-2023-2027',
          name: 'Class CSE-3A',
          currentSemester: 5,
          facultyUid: 'fac-001',
          isActive: true,
        },
        batch: {
          id: 'batch-2023-2027',
          programId: 'prog-btech-cse',
          startYear: 2023,
          endYear: 2027,
          name: '2023 - 2027',
          isActive: true,
        },
        program: {
          id: 'prog-btech-cse',
          departmentId: validDepartmentId,
          name: 'B.Tech Computer Science and Engineering',
          type: 'B.Tech',
          durationYears: 4,
          isActive: true,
        },
        department: {
          id: validDepartmentId,
          collegeId: validCollegeId,
          name: 'Computer Science and Engineering',
          code: 'CSE',
          hodUid: 'hod-001',
          isActive: true,
        },
        classIncharge: {
          facultyUid: 'fac-001',
          name: 'Dr. Jane Hopper',
          email: 'jane.hopper@college.edu',
          phone: '+91 9444012345',
          photoUrl: null,
          designation: 'Associate Professor',
          department: 'CSE',
        },
        academicYear: {
          id: 'ay-2025-2026',
          collegeId: validCollegeId,
          name: '2025-2026',
          startDate: '2025-06-01',
          endDate: '2026-05-31',
          isCurrent: true,
        },
        semester: {
          id: 'sem-5',
          academicYearId: 'ay-2025-2026',
          termNumber: 5,
          startDate: '2025-06-15',
          endDate: '2025-11-30',
        },
        subjects: [],
      });

      vi.spyOn(studentService, 'getAttendance').mockResolvedValueOnce({
        summary: {
          totalSessions: 100,
          attendedSessions: 85,
          presentCount: 80,
          lateCount: 5,
          absentCount: 15,
          excusedCount: 0,
          percentage: 85.0,
          isEligible: true,
          safeMargin: 13,
          todayTotal: 4,
          todayAttended: 4,
          todayPresent: 4,
          todayLate: 0,
          todayAbsent: 0,
          todayExcused: 0,
          todayEffectivePercentage: 100,
        },
        subjectBreakdown: [],
        dailySchedule: [],
      });

      const res = await studentDataToolService.getDashboard({}, mockStudentContext);

      expect(res.student.name).toBe('Alex Mercer');
      expect(res.student.email).toBe(validEmail);
      expect(res.academic.className).toBe('Class CSE-3A');
      expect(res.attendanceSummary.overallPercentage).toBe(85.0);
      expect(res.attendanceSummary.status).toBe('SAFE');
      expect(res._isStub).toBe(false);
    });

    it('student.getProfile returns student profile and contact information', async () => {
      vi.spyOn(studentService, 'getProfile').mockResolvedValueOnce({
        id: 'prof-123',
        userId: validStudentUid,
        firstName: 'Alex',
        lastName: 'Mercer',
        displayName: 'Alex Mercer',
        studentId: validRegisterNumber,
        email: validEmail,
        phone: '+91 9876543210',
        address: '123 University Campus Hostel',
        city: 'Chennai',
        state: 'Tamil Nadu',
        dateOfBirth: '2004-05-15',
        gender: 'Male',
        profilePhotoUrl: null,
        enrollmentYear: 2023,
        profileCompletionPercentage: 85,
        accountStatus: 'ACTIVE',
        bio: 'Student Bio',
      });

      const res = await studentDataToolService.getProfile({}, mockStudentContext);

      expect(res.userId).toBe(validStudentUid);
      expect(res.displayName).toBe('Alex Mercer');
      expect(res.phone).toBe('+91 9876543210');
      expect(res._isStub).toBe(false);
    });

    it('student.getClass returns class information and hierarchy', async () => {
      vi.spyOn(studentService, 'getClass').mockResolvedValueOnce({
        id: validClassId,
        batchId: 'batch-2023-2027',
        name: 'Class CSE-3A',
        currentSemester: 5,
        facultyUid: 'fac-001',
        isActive: true,
        batch: {
          id: 'batch-2023-2027',
          programId: 'prog-btech-cse',
          startYear: 2023,
          endYear: 2027,
          isActive: true,
        },
        program: {
          id: 'prog-btech-cse',
          departmentId: validDepartmentId,
          name: 'B.Tech CSE',
          type: 'B.Tech',
          durationYears: 4,
          isActive: true,
        },
        department: {
          id: validDepartmentId,
          collegeId: validCollegeId,
          name: 'Computer Science and Engineering',
          code: 'CSE',
          hodUid: 'hod-001',
          isActive: true,
        },
      });

      const res = await studentDataToolService.getClass({}, mockStudentContext);

      expect(res.id).toBe(validClassId);
      expect(res.name).toBe('Class CSE-3A');
      expect(res.batchName).toBe('2023 - 2027');
      expect(res._isStub).toBe(false);
    });

    it('student.getBatch returns batch details', async () => {
      vi.spyOn(studentService, 'getBatch').mockResolvedValueOnce({
        id: 'batch-2023-2027',
        programId: 'prog-btech-cse',
        startYear: 2023,
        endYear: 2027,
        isActive: true,
      });

      const res = await studentDataToolService.getBatch({}, mockStudentContext);

      expect(res.id).toBe('batch-2023-2027');
      expect(res.startYear).toBe(2023);
      expect(res.endYear).toBe(2027);
      expect(res._isStub).toBe(false);
    });

    it('student.getProgram returns program details', async () => {
      vi.spyOn(studentService, 'getProgram').mockResolvedValueOnce({
        id: 'prog-btech-cse',
        departmentId: validDepartmentId,
        name: 'B.Tech Computer Science and Engineering',
        type: 'UNDERGRADUATE',
        durationYears: 4,
        isActive: true,
      });

      const res = await studentDataToolService.getProgram({}, mockStudentContext);

      expect(res.id).toBe('prog-btech-cse');
      expect(res.name).toBe('B.Tech Computer Science and Engineering');
      expect(res.degreeType).toBe('UNDERGRADUATE');
      expect(res._isStub).toBe(false);
    });

    it('student.getDepartment returns department details', async () => {
      vi.spyOn(studentService, 'getDepartment').mockResolvedValueOnce({
        id: validDepartmentId,
        collegeId: validCollegeId,
        name: 'Computer Science and Engineering',
        code: 'CSE',
        hodUid: 'hod-001',
        isActive: true,
      });

      const res = await studentDataToolService.getDepartment({}, mockStudentContext);

      expect(res.id).toBe(validDepartmentId);
      expect(res.code).toBe('CSE');
      expect(res._isStub).toBe(false);
    });

    it('student.getSubjects returns subject list with credits', async () => {
      vi.spyOn(studentService, 'getSubjects').mockResolvedValueOnce([
        {
          id: 'subj-cs501',
          departmentId: validDepartmentId,
          name: 'Database Management Systems',
          code: 'CS501',
          credits: 4,
          semesterNumber: 5,
          isActive: true,
        },
        {
          id: 'subj-cs505',
          departmentId: validDepartmentId,
          name: 'DBMS Lab',
          code: 'CS505',
          credits: 2,
          semesterNumber: 5,
          isActive: true,
        },
      ]);

      const res = await studentDataToolService.getSubjects({ semesterNumber: 5 }, mockStudentContext);

      expect(res.totalSubjects).toBe(2);
      expect(res.subjects[0].code).toBe('CS501');
      expect(res.subjects[0].type).toBe('THEORY');
      expect(res.subjects[1].type).toBe('PRACTICAL');
      expect(res._isStub).toBe(false);
    });

    it('student.getClassIncharge returns assigned mentor details', async () => {
      vi.spyOn(studentService, 'getClassIncharge').mockResolvedValueOnce({
        facultyUid: 'fac-incharge-001',
        name: 'Dr. Jane Hopper',
        email: 'jane.hopper@college.edu',
        phone: '+91 9444012345',
        photoUrl: null,
        designation: 'Associate Professor',
        department: 'Computer Science and Engineering',
      });

      const res = await studentDataToolService.getClassIncharge({}, mockStudentContext);

      expect(res.facultyUid).toBe('fac-incharge-001');
      expect(res.name).toBe('Dr. Jane Hopper');
      expect(res.email).toBe('jane.hopper@college.edu');
      expect(res._isStub).toBe(false);
    });

    it('student.getAcademicYears and student.getSemesters return calendar data', async () => {
      vi.spyOn(studentService, 'getAcademicYears').mockResolvedValueOnce([
        {
          id: 'ay-2025-2026',
          collegeId: validCollegeId,
          name: '2025-2026',
          startDate: '2025-06-01',
          endDate: '2026-05-31',
          isCurrent: true,
        },
      ]);

      const ayRes = await studentDataToolService.getAcademicYears({}, mockStudentContext);
      expect(ayRes.academicYears.length).toBe(1);
      expect(ayRes.currentAcademicYear?.isCurrent).toBe(true);

      vi.spyOn(studentService, 'getSemesters').mockResolvedValueOnce([
        {
          id: 'sem-5',
          academicYearId: 'ay-2025-2026',
          termNumber: 5,
          startDate: '2025-06-15',
          endDate: '2025-11-30',
        },
      ]);

      const semRes = await studentDataToolService.getSemesters({}, mockStudentContext);
      expect(semRes.semesters.length).toBe(1);
      expect(semRes.semesters[0].semesterNumber).toBe(5);
    });

    it('student.getTimetable filters slots by dayOfWeek', async () => {
      vi.spyOn(studentService, 'getClassTimetable').mockResolvedValue([
        {
          id: 'slot-1',
          class_id: validClassId,
          day_of_week: 'Monday',
          period: 'Period 1',
          start_time: '09:00',
          end_time: '09:50',
          subject_name: 'DBMS',
          subject_code: 'CS501',
          faculty_name: 'Dr. Jane Hopper',
          room: 'LH-301',
        },
        {
          id: 'slot-2',
          class_id: validClassId,
          day_of_week: 'Tuesday',
          period: 'Period 1',
          start_time: '09:00',
          end_time: '09:50',
          subject_name: 'Algorithms',
          subject_code: 'CS502',
          faculty_name: 'Prof. Alan Turing',
          room: 'LH-302',
        },
      ]);

      const mondayRes = await studentDataToolService.getTimetable({ dayOfWeek: 1 }, mockStudentContext);
      expect(mondayRes.totalSlots).toBe(1);
      expect(mondayRes.slots[0].subjectCode).toBe('CS501');

      const allRes = await studentDataToolService.getTimetable({}, mockStudentContext);
      expect(allRes.totalSlots).toBe(2);
    });

    it('student.getAttendance computes CRITICAL status when below 75%', async () => {
      vi.spyOn(studentService, 'getAttendance').mockResolvedValueOnce({
        summary: {
          totalSessions: 100,
          attendedSessions: 68,
          presentCount: 65,
          lateCount: 3,
          absentCount: 32,
          excusedCount: 0,
          percentage: 68.0,
          isEligible: false,
          safeMargin: -28,
          todayTotal: 4,
          todayAttended: 3,
          todayPresent: 3,
          todayLate: 0,
          todayAbsent: 1,
          todayExcused: 0,
          todayEffectivePercentage: 75,
        },
        subjectBreakdown: [
          {
            id: 'subj-1',
            code: 'CS501',
            name: 'DBMS',
            held: 50,
            attended: 34,
            excused: 0,
            absent: 16,
            percentage: 68.0,
            status: 'CRITICAL',
          },
        ],
        dailySchedule: [],
      });

      const res = await studentDataToolService.getAttendance({}, mockStudentContext);

      expect(res.summary.overallPercentage).toBe(68.0);
      expect(res.summary.status).toBe('CRITICAL');
      expect(res.summary.isEligible).toBe(false);
      expect(res.summary.safeMargin).toBe(-28);
      expect(res.subjectBreakdown[0].status).toBe('CRITICAL');
    });

    it('student.getAttendance returns NO_DATA status when zero sessions held', async () => {
      vi.spyOn(studentService, 'getAttendance').mockResolvedValueOnce({
        summary: {
          totalSessions: 0,
          attendedSessions: 0,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          excusedCount: 0,
          percentage: 0,
          isEligible: true,
          safeMargin: 0,
          todayTotal: 0,
          todayAttended: 0,
          todayPresent: 0,
          todayLate: 0,
          todayAbsent: 0,
          todayExcused: 0,
          todayEffectivePercentage: 0,
        },
        subjectBreakdown: [],
        dailySchedule: [],
      });

      const res = await studentDataToolService.getAttendance({}, mockStudentContext);

      expect(res.summary.totalHeld).toBe(0);
      expect(res.summary.status).toBe('NO_DATA');
    });
  });

  describe('3. Execution through StudentToolRegistry Pipeline', () => {
    it('executes student.getAttendance via studentToolRegistry with registered live handler', async () => {
      vi.spyOn(studentService, 'getAttendance').mockResolvedValueOnce({
        summary: {
          totalSessions: 80,
          attendedSessions: 72,
          presentCount: 70,
          lateCount: 2,
          absentCount: 8,
          excusedCount: 0,
          percentage: 90.0,
          isEligible: true,
          safeMargin: 16,
          todayTotal: 0,
          todayAttended: 0,
          todayPresent: 0,
          todayLate: 0,
          todayAbsent: 0,
          todayExcused: 0,
          todayEffectivePercentage: 0,
        },
        subjectBreakdown: [],
        dailySchedule: [],
      });

      const result = await studentToolRegistry.executeTool(
        'student.getAttendance',
        {},
        mockStudentContext,
      );

      expect(result.status).toBe('success');
      expect(result.toolName).toBe('student.getAttendance');
      expect(result.result.summary.overallPercentage).toBe(90.0);
      expect(result.result._isStub).toBe(false);
    });

    it('executes student.getProfile via studentToolRegistry with registered live handler', async () => {
      vi.spyOn(studentService, 'getProfile').mockResolvedValueOnce({
        id: 'prof-999',
        userId: validStudentUid,
        firstName: 'Alex',
        lastName: 'Mercer',
        displayName: 'Alex Mercer',
        studentId: validRegisterNumber,
        email: validEmail,
        phone: '+91 9876543210',
        address: 'Campus Hostel',
        city: 'Chennai',
        state: 'Tamil Nadu',
        dateOfBirth: '2004-05-15',
        gender: 'Male',
        profilePhotoUrl: null,
        enrollmentYear: 2023,
        profileCompletionPercentage: 95,
        accountStatus: 'ACTIVE',
        bio: 'Bio text',
      });

      const result = await studentToolRegistry.executeTool(
        'student.getProfile',
        {},
        mockStudentContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.email).toBe(validEmail);
      expect(result.result._isStub).toBe(false);
    });
  });
});
