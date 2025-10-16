import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SessionDetails from './pages/SessionDetails';
import CreateSession from './pages/CreateSession';
import ScanAttendance from './pages/ScanAttendance';
import AttendSession from './pages/AttendSession';
import ClassManagement from './pages/ClassManagement';
import AttendanceScan from './pages/AttendanceScan';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          
          {/* Simple attend route - auto attendance when scan QR */}
          <Route path="/attend/:sessionId" element={
            <ProtectedRoute>
              <AttendSession />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/scan" replace />} />
            <Route path="scan" element={<ScanAttendance />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="create-session" element={<CreateSession />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="sessions/:id" element={<SessionDetails />} />
            <Route path="attendance-scan" element={<AttendanceScan />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;