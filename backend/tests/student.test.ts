import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

describe('Student Module API Integration Tests', () => {
  let studentToken: string;
  let nonStudentToken: string;
  const studentUid = 'yw9CZsMOEKTNymHmNHdFovTpZvZ2';
  const facultyUid = 'D679ftp5r9QC8zzybJkGAokVZ2d2';

  beforeAll(() => {
    // Generate valid tokens for the test
    studentToken = jwt.sign(
      {
        uid: studentUid,
        user_id: studentUid,
        sub: studentUid,
        email: 'amirthavarsshan0908@gmail.com',
        role: 'STUDENT',
      },
      'test-secret'
    );

    nonStudentToken = jwt.sign(
      {
        uid: facultyUid,
        user_id: facultyUid,
        sub: facultyUid,
        email: 'amirthavarsshan0806@gmail.com',
        role: 'HOD',
      },
      'test-secret'
    );
  });

  it('1. Health check should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('2. Should reject request without token (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/student/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('3. Should reject non-student role (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${nonStudentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('4. GET /api/student/dashboard returns real academic hierarchy', async () => {
    const res = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { data } = res.body;

    expect(data.student).toBeDefined();
    expect(data.student.email).toBe('amirthavarsshan0908@gmail.com');
    expect(data.class).toBeDefined();
    expect(data.class.name).toContain('AI & ML');
    expect(data.batch).toBeDefined();
    expect(data.batch.startYear).toBe(2023);
    expect(data.program).toBeDefined();
    expect(data.program.name).toContain('Artificial Intelligence');
    expect(data.department).toBeDefined();
    expect(data.department.code).toBe('aiml');
    expect(data.classIncharge).toBeDefined();
    expect(data.subjects).toBeInstanceOf(Array);
    expect(data.subjects.length).toBeGreaterThan(0);
  });

  it('5. GET /api/student/profile returns student personal profile', async () => {
    const res = await request(app)
      .get('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('amirthavarsshan0908@gmail.com');
    expect(res.body.data.studentId).toBe('23AIML042');
  });

  it('6. PATCH /api/student/profile updates permitted fields only', async () => {
    const res = await request(app)
      .patch('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bio: 'Updated bio for student portfolio testing',
        city: 'Chennai',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bio).toBe('Updated bio for student portfolio testing');
  });

  it('7. PATCH /api/student/profile rejects modification of academic hierarchy', async () => {
    const res = await request(app)
      .patch('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        role: 'SUPER_ADMIN',
        department_id: 'fake-dept-id',
        class_id: 'fake-class-id',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('8. GET /api/student/class returns student class and resolved hierarchy', async () => {
    const res = await request(app)
      .get('/api/student/class')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toContain('Year II');
    expect(res.body.data.batch).toBeDefined();
    expect(res.body.data.program).toBeDefined();
    expect(res.body.data.department).toBeDefined();
  });

  it('9. GET /api/student/batch returns student batch', async () => {
    const res = await request(app)
      .get('/api/student/batch')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.startYear).toBe(2023);
    expect(res.body.data.endYear).toBe(2026);
  });

  it('10. GET /api/student/program returns student degree program', async () => {
    const res = await request(app)
      .get('/api/student/program')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('UG');
    expect(res.body.data.durationYears).toBe(3);
  });

  it('11. GET /api/student/department returns department details', async () => {
    const res = await request(app)
      .get('/api/student/department')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('aiml');
  });

  it('12. GET /api/student/subjects returns department curriculum subjects', async () => {
    const res = await request(app)
      .get('/api/student/subjects')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Test semester filtering
    const resSem3 = await request(app)
      .get('/api/student/subjects?semester=3')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(resSem3.status).toBe(200);
    expect(resSem3.body.data.every((s: any) => s.semesterNumber === 3)).toBe(true);
  });

  it('13. GET /api/student/class-incharge returns assigned faculty', async () => {
    const res = await request(app)
      .get('/api/student/class-incharge')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.facultyUid).toBe(facultyUid);
  });

  it('14. GET /api/student/academic-years returns academic years', async () => {
    const res = await request(app)
      .get('/api/student/academic-years')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toContain('2026');
  });

  it('15. GET /api/student/semesters returns academic semesters', async () => {
    const res = await request(app)
      .get('/api/student/semesters')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
