import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service';
import { updateProfileSchema } from './student.validation';
import { successResponse } from '../../utils/response';

export class StudentController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getDashboard(req.studentContext!);
      return successResponse(res, data, 200, 'Student dashboard loaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getProfile(req.studentContext!);
      return successResponse(res, data, 200, 'Student profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const data = await studentService.updateProfile(req.studentContext!, validated);
      return successResponse(res, data, 200, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getClass(req.studentContext!);
      return successResponse(res, data, 200, 'Class information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getBatch(req.studentContext!);
      return successResponse(res, data, 200, 'Batch information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getProgram(req.studentContext!);
      return successResponse(res, data, 200, 'Program information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getDepartment(req.studentContext!);
      return successResponse(res, data, 200, 'Department information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const semesterQuery = req.query.semester as string | undefined;
      const semesterNumber = semesterQuery ? parseInt(semesterQuery, 10) : undefined;
      const data = await studentService.getSubjects(req.studentContext!, semesterNumber);
      return successResponse(res, data, 200, 'Department subjects retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getClassIncharge(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getClassIncharge(req.studentContext!);
      return successResponse(res, data, 200, 'Class Incharge faculty details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAcademicYears(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAcademicYears(req.studentContext!);
      return successResponse(res, data, 200, 'Academic years retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getSemesters(req.studentContext!);
      return successResponse(res, data, 200, 'Semesters retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
