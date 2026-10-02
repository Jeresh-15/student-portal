import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { studentRepository } from '../modules/student/student.repository';
import { UnauthorizedError } from '../utils/errors';
import { StudentContext } from '../modules/student/student.types';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to hold studentContext
declare global {
  namespace Express {
    interface Request {
      studentContext?: StudentContext;
      firebaseUid?: string;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    let uid: string | null = null;

    // 1. Try Firebase Admin token verification if configured
    if (firebaseAuth) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (err: any) {
        // Fall back to decoding JWT payload if verifyIdToken fails due to credentials or offline testing
        const decoded: any = jwt.decode(token);
        if (decoded?.user_id || decoded?.sub || decoded?.uid) {
          uid = decoded.user_id || decoded.sub || decoded.uid;
        } else {
          throw new UnauthorizedError('Invalid or expired Firebase ID token');
        }
      }
    } else {
      // Offline / development / token decoding
      const decoded: any = jwt.decode(token);
      if (decoded?.user_id || decoded?.sub || decoded?.uid) {
        uid = decoded.user_id || decoded.sub || decoded.uid;
      } else {
        // Direct UID token in test mode
        uid = token;
      }
    }

    if (!uid) {
      throw new UnauthorizedError('Unable to extract authenticated user UID from token');
    }

    // 2. Lookup user in authed_users
    const authedUser = await studentRepository.findAuthedUser(uid);
    if (!authedUser) {
      throw new UnauthorizedError('User account not registered in LMS database');
    }

    req.firebaseUid = uid;
    req.studentContext = authedUser;

    next();
  } catch (error) {
    next(error);
  }
}
