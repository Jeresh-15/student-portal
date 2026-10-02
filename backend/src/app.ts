import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import studentRoutes from './modules/student/student.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { studentRepository } from './modules/student/student.repository';
import { successResponse, errorResponse } from './utils/response';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and local dev origins
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'college-lms-student-api',
    version: '1.0.0',
  });
});

/**
 * Development / Test Helper: Issue a development token for an existing registered student
 * e.g. POST /api/auth/dev-student-token with { email: "amirthavarsshan0908@gmail.com" }
 */
app.post('/api/auth/dev-student-token', async (req, res) => {
  try {
    const email = req.body?.email || 'amirthavarsshan0908@gmail.com';
    const { data: user } = await (await import('./lib/supabase')).supabase
      .from('authed_users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return errorResponse(res, 404, `No authed_user found for email ${email}`);
    }

    if (user.role !== 'STUDENT') {
      return errorResponse(res, 403, `User role is ${user.role}, not STUDENT`);
    }

    // Generate signed payload representing Firebase token claims
    const token = jwt.sign(
      {
        uid: user.uid,
        user_id: user.uid,
        sub: user.uid,
        email: user.email,
        name: user.display_name,
        role: user.role,
        auth_time: Math.floor(Date.now() / 1000),
      },
      'lms-dev-secret-key',
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        departmentId: user.department_id,
        classId: user.class_id,
        registerNumber: user.register_number,
      },
    }, 200, 'Student dev token issued');
  } catch (err: any) {
    return errorResponse(res, 500, err?.message || 'Failed to generate dev token');
  }
});

// Mount Student Module API routes
app.use('/api/student', studentRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
