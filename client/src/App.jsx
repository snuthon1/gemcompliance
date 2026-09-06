import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { Accessibility, Shield, Headphones, LogOut } from 'lucide-react';

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
  const { user, logout, isVendor, isOfficer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 selection:bg-amber-500 selection:text-white antialiased flex flex-col md:flex-row font-sans">
      {/* Executive Government Navy Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Official Government Masthead */}
        <header className="sticky top-0 z-30 shadow-xs">
          {/* 1. Official GoI Accessibility & Authority Strip */}
          <div className="bg-[#07182D] text-slate-300 px-4 sm:px-8 py-1 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-1 border-b border-slate-700/80">
            <div className="flex items-center space-x-2.5">
              <span className="font-semibold text-white">भारत सरकार</span>
              <span className="text-slate-500">|</span>
              <span>Government of India</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-300 font-medium">पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय (MoPNG)</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NIC / CERT-In Audited
              </span>
              <span className="text-slate-600">|</span>
              <span>English / हिन्दी</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">IST (UTC+5:30)</span>
            </div>
          </div>

          {/* 2. National Tricolor Line */}
          <div className="h-1 w-full flex">
            <div className="h-full w-1/3 bg-[#FF671F]"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-[#046A38]"></div>
          </div>

          {/* 3. Official Departmental Masthead */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            {/* Left: National Emblem + CPCL Circular Logo + Dual Language Authority */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <NationalEmblem className="w-7 h-9 shrink-0 hidden sm:block" color="#0B2546" />
              <div className="hidden sm:block h-8 w-[1px] bg-slate-300"></div>
              <img
                src="/cpcl_logo.png"
                alt="CPCL Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xs sm:text-sm font-black text-[#0B2546] tracking-tight leading-tight">
                    चेन्नई पेट्रोलियम कॉर्पोरेशन लिमिटेड &bull; CPCL
                  </h1>
                  <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                    A Govt. of India Enterprise
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium leading-tight">
                  Central Public Procurement &amp; Statutory Bidder Compliance Monitoring System
                </span>
              </div>
            </div>

            {/* Right: User Profile, Role Badge & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div className="hidden lg:inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>SIH26100 Mandate</span>
              </div>

              {user && (
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                  <div className="w-6 h-6 rounded bg-[#0B2546] text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : (isOfficer ? 'GO' : 'VN')}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                      {user.name || user.company_name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {isOfficer ? 'Procurement Officer' : 'Registered Vendor'}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                title="Sign out of official session"
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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

        {/* Official Government Multi-tier Footer */}
        <footer className="bg-[#07182D] text-slate-300 text-xs border-t-4 border-t-[#0B2546] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-[11px] text-slate-300 pb-4 border-b border-slate-800">
              <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                National Portal of India (india.gov.in)
              </a>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                Government e-Marketplace (gem.gov.in)
              </a>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <a href="https://eprocure.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                Central Public Procurement Portal (eprocure.gov.in)
              </a>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <a href="https://mopng.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                Ministry of Petroleum &amp; Natural Gas
              </a>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <a href="https://cpcl.co.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
                CPCL Official Website
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
              <div className="space-y-0.5 text-center sm:text-left">
                <p>&copy; 2026 Chennai Petroleum Corporation Limited. Content owned, maintained and updated by CPCL Procurement Cell.</p>
                <p className="text-slate-500">Developed for Smart India Hackathon 2026 &bull; Problem Statement ID: SIH26100 (CPCL / MoPNG)</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                  CERT-In Baseline Audited
                </span>
                <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                  W3C HTML5 Validated
                </span>
              </div>
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
