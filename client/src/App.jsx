import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BidderDetail from './pages/BidderDetail';
import TendersList from './pages/TendersList';
import TenderDetail from './pages/TenderDetail';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<Login />} />

              {/* Officer-Only Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bidder/:bidder_id"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <BidderDetail />
                  </ProtectedRoute>
                }
              />

              {/* Shared Routes (Officer and Vendor can view tenders) */}
              <Route
                path="/tenders"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'VENDOR']}>
                    <TendersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/:tender_id"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'VENDOR']}>
                    <TenderDetail />
                  </ProtectedRoute>
                }
              />

              {/* Vendor-Only Workspace Routes */}
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portal"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>BidShield &bull; GeM Integrated Bid Compliance Verification Platform &bull; SIH26100</span>
              <span className="text-slate-400">Chennai Petroleum Corporation Limited (CPCL) / MoPNG</span>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
