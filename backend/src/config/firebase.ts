import admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App | null = null;

if (!admin.apps.length) {
  try {
    if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
      console.log('✅ Firebase Admin initialized with service account.');
    } else if (env.FIREBASE_PROJECT_ID) {
      firebaseApp = admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
      console.log(`ℹ️ Firebase Admin initialized with Project ID: ${env.FIREBASE_PROJECT_ID}`);
    }
  } catch (err: any) {
    console.warn('⚠️ Firebase Admin initialization notice:', err?.message || err);
  }
} else {
  firebaseApp = admin.app();
}

export const firebaseAuth = admin.apps.length ? admin.auth() : null;
export default admin;
