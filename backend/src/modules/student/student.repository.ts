import { supabase } from '../../lib/supabase';
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
} from './student.types';

export class StudentRepository {
  /**
   * Find authenticated student in authed_users
   */
  async findAuthedUser(uid: string): Promise<StudentContext | null> {
    const { data, error } = await supabase
      .from('authed_users')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      uid: data.uid,
      email: data.email,
      displayName: data.display_name,
      photoURL: data.photo_url,
      role: data.role || 'USER',
      collegeId: data.college_id,
      departmentId: data.department_id,
      classId: data.class_id,
      registerNumber: data.register_number,
    };
  }

  /**
   * Get student profile combining authed_users, users, and profiles
   */
  async getStudentProfile(uid: string): Promise<StudentProfile | null> {
    const authedUser = await this.findAuthedUser(uid);
    if (!authedUser) return null;

    // Load from users table
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, phone, status')
      .eq('firebaseUid', uid)
      .single();

    let profileData: any = null;
    if (userData?.id) {
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('userId', userData.id)
        .single();
      profileData = pData;
    }

    return {
      id: profileData?.id || userData?.id || authedUser.uid,
      userId: userData?.id,
      firstName: profileData?.firstName || null,
      lastName: profileData?.lastName || null,
      displayName: profileData?.displayName || authedUser.displayName,
      studentId: authedUser.registerNumber || profileData?.studentId || null,
      email: authedUser.email,
      phone: profileData?.phone || userData?.phone || null,
      address: profileData?.address || null,
      city: profileData?.city || null,
      state: profileData?.state || null,
      dateOfBirth: profileData?.dateOfBirth || null,
      gender: profileData?.gender || null,
      profilePhotoUrl: profileData?.profilePhotoUrl || authedUser.photoURL,
      enrollmentYear: profileData?.enrollmentYear || null,
      profileCompletionPercentage: profileData?.profileCompletionPercentage || 85,
      accountStatus: userData?.status || 'ACTIVE',
      bio: profileData?.bio || null,
    };
  }

  /**
   * Update student editable profile fields
   */
  async updateStudentProfile(uid: string, updates: StudentUpdateProfileDTO): Promise<StudentProfile | null> {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('firebaseUid', uid)
      .single();

    const now = new Date().toISOString();

    if (userData?.id) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('userId', userData.id)
        .single();

      if (existingProfile?.id) {
        await supabase
          .from('profiles')
          .update({
            ...(updates.phone !== undefined && { phone: updates.phone }),
            ...(updates.address !== undefined && { address: updates.address }),
            ...(updates.city !== undefined && { city: updates.city }),
            ...(updates.state !== undefined && { state: updates.state }),
            ...(updates.profilePhotoUrl !== undefined && { profilePhotoUrl: updates.profilePhotoUrl }),
            ...(updates.bio !== undefined && { bio: updates.bio }),
            updatedAt: now,
          })
          .eq('userId', userData.id);
      } else {
        await supabase.from('profiles').insert([{
          userId: userData.id,
          phone: updates.phone,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          profilePhotoUrl: updates.profilePhotoUrl,
          bio: updates.bio,
          createdAt: now,
          updatedAt: now,
        }]);
      }
    }

    // Also update photo_url in authed_users if updated
    if (updates.profilePhotoUrl !== undefined) {
      await supabase
        .from('authed_users')
        .update({ photo_url: updates.profilePhotoUrl })
        .eq('uid', uid);
    }

    return this.getStudentProfile(uid);
  }

  /**
   * Fetch Class by classId
   */
  async getClassById(classId: string): Promise<ClassInfo | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      batchId: data.batch_id,
      name: data.name,
      currentSemester: data.current_semester || 1,
      facultyUid: data.faculty_uid,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Batch by batchId
   */
  async getBatchById(batchId: string): Promise<BatchInfo | null> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      programId: data.program_id,
      startYear: data.start_year,
      endYear: data.end_year,
      name: `${data.start_year} - ${data.end_year}`,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Program by programId
   */
  async getProgramById(programId: string): Promise<ProgramInfo | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      departmentId: data.department_id,
      name: data.name,
      type: data.type,
      durationYears: data.duration_years,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Department by departmentId
   */
  async getDepartmentById(departmentId: string): Promise<DepartmentInfo | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*, colleges(name)')
      .eq('id', departmentId)
      .single();

    if (error || !data) return null;

    let hodInfo = null;
    if (data.hod_uid) {
      const { data: hodUser } = await supabase
        .from('authed_users')
        .select('uid, display_name, email, photo_url')
        .eq('uid', data.hod_uid)
        .single();
      if (hodUser) {
        hodInfo = {
          uid: hodUser.uid,
          displayName: hodUser.display_name,
          email: hodUser.email,
          photoURL: hodUser.photo_url,
        };
      }
    }

    return {
      id: data.id,
      collegeId: data.college_id,
      name: data.name,
      code: data.code,
      hodUid: data.hod_uid,
      isActive: data.is_active ?? true,
      collegeName: data.colleges?.name || null,
      hod: hodInfo,
    };
  }

  /**
   * Fetch Subjects for Department, optionally filtered by semester
   */
  async getSubjectsByDepartment(departmentId: string, semesterNumber?: number): Promise<SubjectInfo[]> {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('department_id', departmentId)
      .order('semester_number', { ascending: true })
      .order('code', { ascending: true });

    if (semesterNumber !== undefined && !isNaN(semesterNumber)) {
      query = query.eq('semester_number', semesterNumber);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      departmentId: s.department_id,
      name: s.name,
      code: s.code,
      credits: s.credits ?? 3,
      semesterNumber: s.semester_number,
      isActive: s.is_active ?? true,
    }));
  }

  /**
   * Fetch Class Incharge by facultyUid
   */
  async getClassIncharge(facultyUid: string): Promise<ClassInchargeInfo | null> {
    const { data: facultyUser, error } = await supabase
      .from('authed_users')
      .select('*')
      .eq('uid', facultyUid)
      .single();

    if (error || !facultyUser) return null;

    // Load profile info if available
    const { data: userRecord } = await supabase
      .from('users')
      .select('id, phone')
      .eq('firebaseUid', facultyUid)
      .single();

    let profileRecord: any = null;
    if (userRecord?.id) {
      const { data: pRec } = await supabase
        .from('profiles')
        .select('designation, department, phone, profilePhotoUrl')
        .eq('userId', userRecord.id)
        .single();
      profileRecord = pRec;
    }

    return {
      facultyUid: facultyUser.uid,
      name: facultyUser.display_name || 'Faculty Incharge',
      email: facultyUser.email,
      phone: profileRecord?.phone || userRecord?.phone || null,
      photoUrl: profileRecord?.profilePhotoUrl || facultyUser.photo_url || null,
      designation: profileRecord?.designation || 'Class Incharge / Assistant Professor',
      department: profileRecord?.department || 'Department Faculty',
    };
  }

  /**
   * Fetch Academic Years for College
   */
  async getAcademicYears(collegeId: string): Promise<AcademicYearInfo[]> {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('college_id', collegeId)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false });

    if (error || !data) return [];

    return data.map((ay: any) => ({
      id: ay.id,
      collegeId: ay.college_id,
      name: ay.name,
      startDate: ay.start_date,
      endDate: ay.end_date,
      isCurrent: ay.is_current ?? false,
    }));
  }

  /**
   * Fetch Semesters for Academic Year
   */
  async getSemesters(academicYearId?: string): Promise<SemesterInfo[]> {
    let query = supabase
      .from('semesters')
      .select('*, academic_years(id, name, is_current)')
      .order('term_number', { ascending: true });

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((sem: any) => ({
      id: sem.id,
      academicYearId: sem.academic_year_id,
      termNumber: sem.term_number,
      startDate: sem.start_date,
      endDate: sem.end_date,
      academicYear: sem.academic_years ? {
        id: sem.academic_years.id,
        name: sem.academic_years.name,
        isCurrent: sem.academic_years.is_current ?? false,
      } : null,
    }));
  }
}

export const studentRepository = new StudentRepository();
