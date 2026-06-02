import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireApartment from '@/components/RequireApartment';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import Together from './pages/Together';
import Write from './pages/Write';
import Chat from './pages/Chat';
import MyComplex from './pages/MyComplex';

import Welcome from './pages/onboarding/Welcome';
import PhoneInput from './pages/onboarding/PhoneInput';
import VerifyPhone from './pages/onboarding/VerifyPhone';
import Nickname from './pages/onboarding/Nickname';
import ApartmentSearch from './pages/onboarding/ApartmentSearch';
import GpsVerify from './pages/onboarding/GpsVerify';
import CompleteCard from './pages/onboarding/CompleteCard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">잠시만 기다려주세요...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/onboarding" element={<Welcome />} />
      <Route path="/onboarding/phone" element={<PhoneInput />} />
      <Route path="/onboarding/verify" element={<VerifyPhone />} />
      <Route path="/onboarding/nickname" element={<Nickname />} />
      <Route path="/onboarding/apartment" element={<ApartmentSearch />} />
      <Route path="/onboarding/gps" element={<GpsVerify />} />
      <Route path="/onboarding/card" element={<CompleteCard />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<RequireApartment><Home /></RequireApartment>} />
          <Route path="/together" element={<Together />} />
          <Route path="/write" element={<Write />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/my" element={<MyComplex />} />
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
  )
}

export default App