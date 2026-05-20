import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import PublicLayout from './components/public/PublicLayout';
import InternalLayout from './components/internal/InternalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import PublicEvents from './pages/PublicEvents';
import Contact from './pages/Contact';
import Dizimos from './pages/Dizimos';
import MemberLogin from './pages/MemberLogin';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import CalendarPage from './pages/CalendarPage';
import Projects from './pages/Projects';
import Announcements from './pages/Announcements';
import Ministries from './pages/Ministries';
import AdminPanel from './pages/AdminPanel';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Páginas públicas ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/quem-somos" element={<AboutUs />} />
        <Route path="/eventos" element={<PublicEvents />} />
        <Route path="/dizimos" element={<Dizimos />} />
        <Route path="/contato" element={<Contact />} />
      </Route>

      {/* ── Login ── */}
      <Route path="/login" element={<MemberLogin />} />

      {/* ── Área interna — exige auth + Status Ativo ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<InternalLayout />}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/escalas"    element={<Schedules />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/projetos"   element={<Projects />} />
          <Route path="/avisos"     element={<Announcements />} />

          {/* Ministérios — Líder ou superior */}
          <Route element={<ProtectedRoute requiredRole="Lider" />}>
            <Route path="/ministerios" element={<Ministries />} />
          </Route>

          {/* Administração — Pastor e Admin */}
          <Route element={<ProtectedRoute requiredRole="Pastor" />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App