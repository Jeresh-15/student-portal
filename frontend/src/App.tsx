import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Pages
import { Login } from './pages/Login';
import { StudentLayout } from './modules/student/components/StudentLayout';
import { StudentDashboard } from './modules/student/pages/StudentDashboard';
import { StudentProfilePage } from './modules/student/pages/StudentProfilePage';
import { StudentClassPage } from './modules/student/pages/StudentClassPage';
import { StudentBatchPage } from './modules/student/pages/StudentBatchPage';
import { StudentProgramPage } from './modules/student/pages/StudentProgramPage';
import { StudentDepartmentPage } from './modules/student/pages/StudentDepartmentPage';
import { StudentSubjectsPage } from './modules/student/pages/StudentSubjectsPage';
import { StudentClassInchargePage } from './modules/student/pages/StudentClassInchargePage';
import { StudentAcademicYearsPage } from './modules/student/pages/StudentAcademicYearsPage';
import { StudentSemestersPage } from './modules/student/pages/StudentSemestersPage';
import { StudentAttendancePage } from './modules/student/pages/StudentAttendancePage';

const ProtectedStudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('student_token') || localStorage.getItem('lms_token');
  const [firebaseUser, setFirebaseUser] = useState<any>(auth.currentUser);
  const [checkingAuth, setCheckingAuth] = useState(!token);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-body-sm text-on-surface-variant">
        Verifying student session...
      </div>
    );
  }

  // Allow access if either Firebase user is signed in or student token exists
  if (!firebaseUser && !token) {
    return <Navigate to="/login" replace />;
  }

  return <StudentLayout>{children}</StudentLayout>;
};

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Student Protected Module Routes */}
          <Route
            path="/student"
            element={
              <ProtectedStudentRoute>
                <StudentDashboard />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedStudentRoute>
                <StudentAttendancePage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedStudentRoute>
                <StudentProfilePage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/class"
            element={
              <ProtectedStudentRoute>
                <StudentClassPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/batch"
            element={
              <ProtectedStudentRoute>
                <StudentBatchPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/program"
            element={
              <ProtectedStudentRoute>
                <StudentProgramPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/department"
            element={
              <ProtectedStudentRoute>
                <StudentDepartmentPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/subjects"
            element={
              <ProtectedStudentRoute>
                <StudentSubjectsPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/class-incharge"
            element={
              <ProtectedStudentRoute>
                <StudentClassInchargePage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/academic-calendar"
            element={
              <ProtectedStudentRoute>
                <StudentAcademicYearsPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/academic-years"
            element={
              <ProtectedStudentRoute>
                <StudentAcademicYearsPage />
              </ProtectedStudentRoute>
            }
          />
          <Route
            path="/student/semesters"
            element={
              <ProtectedStudentRoute>
                <StudentSemestersPage />
              </ProtectedStudentRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/student" replace />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
