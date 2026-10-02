import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      localStorage.setItem('student_token', idToken);
      localStorage.setItem('student_user', JSON.stringify({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      }));
      navigate('/student');
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setError(err.message || 'Firebase Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevStudentLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/auth/dev-student-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'amirthavarsshan0908@gmail.com' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to authenticate student');
      }
      localStorage.setItem('student_token', data.data.token);
      localStorage.setItem('student_user', JSON.stringify(data.data.student));
      navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Dev student authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs p-8 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="w-12 h-12 bg-[#0b1727] text-white rounded-lg flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
            LMS
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Student Portal
            </h1>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              College LMS Module
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Sign in to access your verified academic hierarchy, department subjects, class roster, and institutional records.
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Firebase Google SSO */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-xs"
            type="button"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Authenticating...' : 'Sign in with Google Account'}</span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Or Live Database Student
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quick Demo Student Sign In */}
          <button
            onClick={handleDevStudentLogin}
            disabled={loading}
            className="w-full h-10 bg-[#0b1727] text-white hover:bg-[#13243c] rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">school</span>
            <span>Enter as Enrolled Student (Amirtha Varsshan)</span>
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[1rem]">lock</span>
            <span>Institutional Security Rule</span>
          </div>
          <p>
            Your student academic context (department, class, batch, and program) is strictly derived from your authenticated database record.
          </p>
        </div>
      </div>
    </div>
  );
};
