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
import { Landmark, ShieldCheck } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginRoute() {
  const { user, isVendor } = useAuth();

  if (user) {
    return <Navigate to={isVendor ? '/vendor' : '/'} replace />;
  }

  return <Login />;
}

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // If user is not logged in or is on /login, render only Login screen without sidebar
  if (!user || isLoginPage) {
    return (
      <main className="min-h-screen bg-gov-slateBg">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gov-slateBg text-slate-900 selection:bg-gov-saffron selection:text-white antialiased flex flex-col md:flex-row">
      {/* Left Sidebar Navigation (Govt Deep Navy) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Government Portal Masthead Strip */}
        <header className="bg-white border-b border-slate-200">
          {/* Micro Tricolor Accent Line */}
          <div className="h-1 w-full flex">
            <div className="h-full w-1/3 bg-gov-saffron"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-gov-green"></div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">भारत सरकार &bull; Government of India</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium">Ministry of Petroleum & Natural Gas &bull; CPCL</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
              <span className="bg-slate-100 text-gov-navy px-2 py-0.5 rounded border border-slate-200 font-bold">
                GeM SIH26100
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
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bidder/:bidder_id"
              element={
                <ProtectedRoute>
                  <BidderDetail />
                </ProtectedRoute>
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

        <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-600 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gov-navy">BidShield</span>
              <span className="text-slate-300">&bull;</span>
              <span>GeM Pre-Qualification & Statutory Verification Engine</span>
              <span className="bg-gov-saffronLight text-gov-saffronDark font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-gov-saffron/30">
                GFR 2017
              </span>
            </div>
            <div className="text-slate-500 text-[11px] font-mono">
              Chennai Petroleum Corporation Limited (CPCL) &bull; National Informatics Guidelines
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
