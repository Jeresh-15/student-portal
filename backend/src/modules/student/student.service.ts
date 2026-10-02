import { StudentRepository } from './student.repository';
import {
  StudentContext,
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
  StudentDashboardResponse,
} from './student.types';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) {}

  /**
   * Derive and load complete student dashboard
   */
  async getDashboard(studentContext: StudentContext): Promise<StudentDashboardResponse> {
    const profile = await this.getProfile(studentContext);

    let classData: ClassInfo | null = null;
    let batchData: BatchInfo | null = null;
    let programData: ProgramInfo | null = null;
    let deptData: DepartmentInfo | null = null;
    let classInchargeData: ClassInchargeInfo | null = null;

    if (studentContext.classId) {
      classData = await this.studentRepo.getClassById(studentContext.classId);
      if (classData?.batchId) {
        batchData = await this.studentRepo.getBatchById(classData.batchId);
        if (batchData?.programId) {
          programData = await this.studentRepo.getProgramById(batchData.programId);
        }
      }
      if (classData?.facultyUid) {
        classInchargeData = await this.studentRepo.getClassIncharge(classData.facultyUid);
      }
    }

    // Department: derived from program or authed_user department_id
    const resolvedDeptId = programData?.departmentId || studentContext.departmentId;
    if (resolvedDeptId) {
      deptData = await this.studentRepo.getDepartmentById(resolvedDeptId);
    }

    // Subjects: filtered strictly by student's department and current semester
    let subjects: SubjectInfo[] = [];
    if (resolvedDeptId) {
      const currentSem = classData?.currentSemester;
      subjects = await this.studentRepo.getSubjectsByDepartment(resolvedDeptId, currentSem);
      if (subjects.length === 0) {
        // Fallback to all department subjects if current semester has no entries
        subjects = await this.studentRepo.getSubjectsByDepartment(resolvedDeptId);
      }
    }

    // Academic Year & Semesters
    let academicYearData: AcademicYearInfo | null = null;
    let semesterData: SemesterInfo | null = null;

    if (studentContext.collegeId) {
      const academicYears = await this.studentRepo.getAcademicYears(studentContext.collegeId);
      academicYearData = academicYears.find((ay) => ay.isCurrent) || academicYears[0] || null;

      if (academicYearData) {
        const semesters = await this.studentRepo.getSemesters(academicYearData.id);
        const currentSemNum = classData?.currentSemester || 1;
        semesterData = semesters.find((s) => s.termNumber === currentSemNum) || semesters[0] || null;
      }
    }

    return {
      student: profile,
      class: classData,
      batch: batchData,
      program: programData,
      department: deptData,
      classIncharge: classInchargeData,
      academicYear: academicYearData,
      semester: semesterData,
      subjects,
    };
  }

  /**
   * View own profile
   */
  async getProfile(studentContext: StudentContext): Promise<StudentProfile> {
    const profile = await this.studentRepo.getStudentProfile(studentContext.uid);
    if (!profile) {
      throw new NotFoundError('Student profile record not found');
    }
    return profile;
  }

  /**
   * Update permitted profile fields
   */
  async updateProfile(studentContext: StudentContext, updates: StudentUpdateProfileDTO): Promise<StudentProfile> {
    const updated = await this.studentRepo.updateStudentProfile(studentContext.uid, updates);
    if (!updated) {
      throw new NotFoundError('Student profile could not be updated');
    }
    return updated;
  }

  /**
   * View student's own class
   */
  async getClass(studentContext: StudentContext): Promise<ClassInfo> {
    if (!studentContext.classId) {
      throw new NotFoundError('No class assigned to your student profile');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData) {
      throw new NotFoundError('Assigned class not found in system');
    }

    // Hydrate hierarchy
    if (classData.batchId) {
      classData.batch = await this.studentRepo.getBatchById(classData.batchId);
      if (classData.batch?.programId) {
        classData.program = await this.studentRepo.getProgramById(classData.batch.programId);
        if (classData.program?.departmentId) {
          classData.department = await this.studentRepo.getDepartmentById(classData.program.departmentId);
        }
      }
    }

    if (classData.facultyUid) {
      classData.classIncharge = await this.studentRepo.getClassIncharge(classData.facultyUid);
    }

    return classData;
  }

  /**
   * View student's own batch
   */
  async getBatch(studentContext: StudentContext): Promise<BatchInfo> {
    if (!studentContext.classId) {
      throw new NotFoundError('No class assigned, cannot resolve batch');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData || !classData.batchId) {
      throw new NotFoundError('No batch associated with your class');
    }

    const batch = await this.studentRepo.getBatchById(classData.batchId);
    if (!batch) {
      throw new NotFoundError('Batch record not found');
    }

    if (batch.programId) {
      batch.program = await this.studentRepo.getProgramById(batch.programId);
    }

    return batch;
  }

  /**
   * View student's own program
   */
  async getProgram(studentContext: StudentContext): Promise<ProgramInfo> {
    let programId: string | null = null;

    if (studentContext.classId) {
      const classData = await this.studentRepo.getClassById(studentContext.classId);
      if (classData?.batchId) {
        const batch = await this.studentRepo.getBatchById(classData.batchId);
        programId = batch?.programId || null;
      }
    }

    if (!programId) {
      throw new NotFoundError('No academic program associated with your student enrollment');
    }

    const program = await this.studentRepo.getProgramById(programId);
    if (!program) {
      throw new NotFoundError('Program record not found');
    }

    if (program.departmentId) {
      program.department = await this.studentRepo.getDepartmentById(program.departmentId);
    }

    return program;
  }

  /**
   * View student's own department
   */
  async getDepartment(studentContext: StudentContext): Promise<DepartmentInfo> {
    const deptId = studentContext.departmentId;
    if (!deptId) {
      throw new NotFoundError('No department assigned to your student profile');
    }

    const dept = await this.studentRepo.getDepartmentById(deptId);
    if (!dept) {
      throw new NotFoundError('Department record not found');
    }

    return dept;
  }

  /**
   * View department subjects, strictly restricted to student's department
   */
  async getSubjects(studentContext: StudentContext, semesterNumber?: number): Promise<SubjectInfo[]> {
    const deptId = studentContext.departmentId;
    if (!deptId) {
      throw new NotFoundError('No department assigned, cannot load subjects');
    }

    return this.studentRepo.getSubjectsByDepartment(deptId, semesterNumber);
  }

  /**
   * View Class Incharge assigned to student's class
   */
  async getClassIncharge(studentContext: StudentContext): Promise<ClassInchargeInfo> {
    if (!studentContext.classId) {
      throw new NotFoundError('No class assigned to your student profile');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData || !classData.facultyUid) {
      throw new NotFoundError('No Class Incharge assigned to your class');
    }

    const incharge = await this.studentRepo.getClassIncharge(classData.facultyUid);
    if (!incharge) {
      throw new NotFoundError('Class Incharge faculty details could not be found');
    }

    return incharge;
  }

  /**
   * View Academic Years for student's college
   */
  async getAcademicYears(studentContext: StudentContext): Promise<AcademicYearInfo[]> {
    if (!studentContext.collegeId) {
      throw new NotFoundError('No college affiliated with your student profile');
    }

    return this.studentRepo.getAcademicYears(studentContext.collegeId);
  }

  /**
   * View Semesters
   */
  async getSemesters(studentContext: StudentContext): Promise<SemesterInfo[]> {
    if (!studentContext.collegeId) {
      throw new NotFoundError('No college affiliated with your student profile');
    }

    const academicYears = await this.studentRepo.getAcademicYears(studentContext.collegeId);
    const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];

    if (!currentYear) {
      return [];
    }

    return this.studentRepo.getSemesters(currentYear.id);
  }
}

export const studentService = new StudentService(new StudentRepository());
