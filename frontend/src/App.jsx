import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ValuationPage } from './pages/ValuationPage';
import { SellDevicePage } from './pages/SellDevicePage';
import { ExchangeDevicePage } from './pages/ExchangeDevicePage';
import { RepairPage } from './pages/RepairPage';
import { TrackingPage } from './pages/TrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AgentDashboard } from './pages/AgentDashboard';

export const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Public Routes with standard Layout */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <LandingPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <LoginPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/register"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <RegisterPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <ForgotPasswordPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/valuation"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <ValuationPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/repair"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <RepairPage />
              </main>
              <Footer />
            </>
          }
        />

        {/* Protected Customer Routes */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-1">
                <SellDevicePage />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exchange"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-1">
                <ExchangeDevicePage />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-1">
                <TrackingPage />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Agent Route */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
