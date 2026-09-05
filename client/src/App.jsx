import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BidderDetail from './pages/BidderDetail';
import TendersList from './pages/TendersList';
import TenderDetail from './pages/TenderDetail';
import UserDashboard from './pages/UserDashboard';
import BlacklistDirectory from './pages/BlacklistDirectory';
import Analytics from './pages/Analytics';
import CartelDetection from './pages/CartelDetection';
import GFRComplianceMatrix from './pages/GFRComplianceMatrix';
import RegistryGateway from './pages/RegistryGateway';
import AuditTrail from './pages/AuditTrail';
import Representations from './pages/Representations';
import DocumentForensics from './pages/DocumentForensics';
import NationalEmblem from './components/NationalEmblem';
import { Accessibility, Shield, Headphones } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function OfficerRoute({ children }) {
  const { user, isOfficer } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isOfficer) {
    return <Navigate to="/vendor" replace />;
  }
  return children;
}

function LoginRoute() {
  const { user, isVendor } = useAuth();

  if (user) {
    return <Navigate to={isVendor ? '/vendor' : '/tenders'} replace />;
  }

  return <Login />;
}

function AppLayout() {
  const { user, isVendor } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // If user is not logged in or is on /login, render only Login screen without sidebar
  if (!user || isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-500 selection:text-white antialiased flex flex-col md:flex-row font-sans">
      {/* Clean White Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Government Portal Masthead Strip */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          {/* National Tricolor Accent Line */}
          <div className="h-1 w-full flex">
            <div className="h-full w-1/3 bg-[#FF671F]"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-[#046A38]"></div>
          </div>

          <div className="px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="font-bold text-[#0B2546]">GeM-CPCL Bid Compliance Portal</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Automated Bidder Verification &bull; Ministry of Petroleum &amp; Natural Gas</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
              <span className="bg-slate-100 text-[#0B2546] font-bold px-2 py-0.5 rounded border border-slate-200">
                BidShield &bull; SIH26100
              </span>
              <span>IST (UTC+5:30)</span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-12">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to={isVendor ? '/vendor' : '/tenders'} replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bidders"
              element={
                <OfficerRoute>
                  <Dashboard />
                </OfficerRoute>
              }
            />
            <Route
              path="/bidder/:bidder_id"
              element={
                <OfficerRoute>
                  <BidderDetail />
                </OfficerRoute>
              }
            />
            <Route
              path="/blacklist"
              element={
                <OfficerRoute>
                  <BlacklistDirectory />
                </OfficerRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <OfficerRoute>
                  <Analytics />
                </OfficerRoute>
              }
            />
            <Route
              path="/cartel-watch"
              element={
                <OfficerRoute>
                  <CartelDetection />
                </OfficerRoute>
              }
            />
            <Route
              path="/document-forensics"
              element={
                <OfficerRoute>
                  <DocumentForensics />
                </OfficerRoute>
              }
            />
            <Route
              path="/gfr-rules"
              element={
                <ProtectedRoute>
                  <GFRComplianceMatrix />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registry-gateway"
              element={
                <ProtectedRoute>
                  <RegistryGateway />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-trail"
              element={
                <OfficerRoute>
                  <AuditTrail />
                </OfficerRoute>
              }
            />
            <Route
              path="/representations"
              element={
                <OfficerRoute>
                  <Representations />
                </OfficerRoute>
              }
            />
            <Route
              path="/tenders"
              element={
                <ProtectedRoute>
                  <TendersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenders/:tender_id"
              element={
                <ProtectedRoute>
                  <TenderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/overview"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/documents"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/apply"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Clean Official Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-600 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-6">
              <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
                <Accessibility className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Accessibility</span>
              </a>
              <span className="text-slate-300">|</span>
              <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Privacy Policy</span>
              </a>
              <span className="text-slate-300">|</span>
              <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
                <Headphones className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Helpdesk</span>
              </a>
            </div>

            <div className="flex items-center space-x-2 text-slate-500">
              <span className="text-[11px] font-medium">Built for Smart India Hackathon 2026</span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">SIH26100</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
