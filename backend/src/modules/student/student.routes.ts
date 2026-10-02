import { Router } from 'express';
import { studentController } from './student.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireStudentRole } from '../../middleware/role.middleware';

const router = Router();

// Protect all /api/student/* endpoints with Firebase Authentication & STUDENT role verification
router.use(authMiddleware);
router.use(requireStudentRole);

// 1. Dashboard API
router.get('/dashboard', (req, res, next) => studentController.getDashboard(req, res, next));

// 2. Profile APIs
router.get('/profile', (req, res, next) => studentController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => studentController.updateProfile(req, res, next));

// 3. Class API
router.get('/class', (req, res, next) => studentController.getClass(req, res, next));

// 4. Batch API
router.get('/batch', (req, res, next) => studentController.getBatch(req, res, next));

// 5. Program API
router.get('/program', (req, res, next) => studentController.getProgram(req, res, next));

// 6. Department API
router.get('/department', (req, res, next) => studentController.getDepartment(req, res, next));

// 7. Subjects API
router.get('/subjects', (req, res, next) => studentController.getSubjects(req, res, next));

// 8. Class Incharge API
router.get('/class-incharge', (req, res, next) => studentController.getClassIncharge(req, res, next));

// 9. Academic Years API
router.get('/academic-years', (req, res, next) => studentController.getAcademicYears(req, res, next));

// 10. Semesters API
router.get('/semesters', (req, res, next) => studentController.getSemesters(req, res, next));

export default router;
