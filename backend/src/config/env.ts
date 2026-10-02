import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://lmnbsauvjqursjxocsgf.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'sb_publishable_kUszCv6Cdq8rZgD-v7gY6w_DEkQ9pZA',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'lms-college-5975a',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
};
