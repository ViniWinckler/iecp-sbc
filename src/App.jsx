import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import PublicLayout from './components/public/PublicLayout';
import InternalLayout from './components/internal/InternalLayout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import PublicEvents from './pages/PublicEvents';
import Location from './pages/Location';
import Contact from './pages/Contact';
import MemberLogin from './pages/MemberLogin';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import CalendarPage from './pages/CalendarPage';
import Projects from './pages/Projects';
import Announcements from './pages/Announcements';
import Ministries from './pages/Ministries';
import AdminPanel from './pages/AdminPanel';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/quem-somos" element={<AboutUs />} />
        <Route path="/eventos" element={<PublicEvents />} />
        <Route path="/localizacao" element={<Location />} />
        <Route path="/contato" element={<Contact />} />
      </Route>
      <Route path="/login" element={<MemberLogin />} />

      {/* Internal member pages */}
      <Route element={<InternalLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/escalas" element={<Schedules />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/avisos" element={<Announcements />} />
        <Route path="/ministerios" element={<Ministries />} />
        <Route path="/admin" element={<AdminPanel />} />
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
  )
}

export default App