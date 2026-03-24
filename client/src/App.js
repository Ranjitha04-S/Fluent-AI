import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import ReadingPage from './pages/ReadingPage';
import VocabularyPage from './pages/VocabularyPage';
import PracticePage from './pages/PracticePage';
import GrammarPage from './pages/GrammarPage';
import StudioPage from './pages/StudioPage';
import SettingsPage from './pages/SettingsPage';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader-spinner"/></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader-spinner"/></div>;
  return user ? <Navigate to="/dashboard" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/reading" element={<PrivateRoute><Layout><ReadingPage /></Layout></PrivateRoute>} />
      <Route path="/vocabulary" element={<PrivateRoute><Layout><VocabularyPage /></Layout></PrivateRoute>} />
      <Route path="/practice" element={<PrivateRoute><Layout><PracticePage /></Layout></PrivateRoute>} />
      <Route path="/grammar" element={<PrivateRoute><Layout><GrammarPage /></Layout></PrivateRoute>} />
      <Route path="/studio" element={<PrivateRoute><Layout><StudioPage /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
