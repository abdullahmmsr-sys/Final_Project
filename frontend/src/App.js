import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Landing Pages
import LandingPageEN from './pages/LandingPageEN';
import LandingPageAR from './pages/LandingPageAR';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

// Main Feature Pages
import ComplianceCheckerPage from './pages/ComplianceCheckerPageNew';
import PolicyTemplatesPage from './pages/PolicyTemplatesPage';
import ImprovementAdvisorPage from './pages/ImprovementAdvisorPage';

// Dashboard & Reports
import DashboardPage from './pages/DashboardPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ComparePage from './pages/ComparePage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPageEN />} />
            <Route path="/ar" element={<LandingPageAR />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Main Feature Routes (accessible without auth, but with limited features) */}
            <Route path="/compliance" element={<ComplianceCheckerPage />} />
            <Route path="/templates" element={<PolicyTemplatesPage />} />
            <Route path="/advisor" element={<ImprovementAdvisorPage />} />
            
            {/* Protected Routes (require authentication) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/report/:reportId" element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/compare/:fingerprint" element={
            <ProtectedRoute>
              <ComparePage />
            </ProtectedRoute>
          } />
          
          {/* 404 fallback */}
          <Route path="*" element={<LandingPageEN />} />
        </Routes>
      </Router>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;
