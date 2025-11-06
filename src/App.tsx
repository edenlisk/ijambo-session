import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Topics } from './pages/Topics';
import { TopicDetail } from './pages/TopicDetail';
import { Quizzes } from './pages/Quizzes';
import { QuizTaking } from './pages/QuizTaking';
import { QuizResult } from './pages/QuizResult';
import { TopicManagement } from './pages/moderator/TopicManagement';
import { ResourceManagement } from './pages/moderator/ResourceManagement';
import { QuizManagement } from './pages/moderator/QuizManagement';
import { QuizQuestions } from './pages/moderator/QuizQuestions';
import { QuizEdit } from './pages/moderator/QuizEdit';
import { AdminUserManagement } from './pages/admin/UserManagement';
import { QuizAnalytics } from './pages/admin/QuizAnalytics';
import { QuizResultsOverview } from './pages/admin/QuizResultsOverview';
import { QuizResultsDetail } from './pages/admin/QuizResultsDetail';
import { UserResultDetail } from './pages/admin/UserResultDetail';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="topics" element={<Topics />} />
            <Route path="topics/:id" element={<TopicDetail />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="quiz/:id" element={<QuizTaking />} />
            <Route path="quiz/:id/result" element={<QuizResult />} />
            <Route path="quiz/:id/result/:attemptId" element={<QuizResult />} />
            
            {/* Moderator Routes */}
            <Route path="moderator/topics" element={
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                <TopicManagement />
              </ProtectedRoute>
            } />
            <Route path="moderator/resources" element={
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                <ResourceManagement />
              </ProtectedRoute>
            } />
            <Route path="moderator/quizzes" element={
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                <QuizManagement />
              </ProtectedRoute>
            } />
            <Route path="moderator/quiz/:id/edit" element={
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                <QuizEdit />
              </ProtectedRoute>
            } />
            <Route path="moderator/quiz/:quizId/questions" element={
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR, UserRole.ADMIN]}>
                <QuizQuestions />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminUserManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/analytics" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <QuizAnalytics />
              </ProtectedRoute>
            } />
            <Route path="admin/quiz-results" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MODERATOR]}>
                <QuizResultsOverview />
              </ProtectedRoute>
            } />
            <Route path="admin/quiz/:id/results" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MODERATOR]}>
                <QuizResultsDetail />
              </ProtectedRoute>
            } />
            <Route path="admin/quiz/:quizId/result/:attemptId" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MODERATOR]}>
                <UserResultDetail />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
