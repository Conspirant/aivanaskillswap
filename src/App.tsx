import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { useApp } from './context/AppContext';

// Pages
import Index from './pages/Index';
import Profile from './pages/Profile';
import SetupProfile from './pages/SetupProfile';
import NotFound from './pages/NotFound';
import CreateSkillCard from './pages/CreateSkillCard';
import MySessions from './pages/MySessions';
import RequestSession from './pages/RequestSession';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Watermark background logo */}
      <img
        src="/logo.png"
        alt="Watermark Logo"
        className="fixed inset-0 w-[60vw] max-w-[700px] min-w-[300px] h-auto m-auto left-0 right-0 top-0 bottom-0 opacity-25 pointer-events-none z-0 select-none"
        style={{
          filter: 'drop-shadow(0 0 64px #a78bfa) drop-shadow(0 0 32px #a78bfa) drop-shadow(0 0 16px #a78bfa)',
          transition: 'opacity 0.5s',
        }}
      />
      {/* Main app content */}
      <div className="relative z-10">
        <Toaster />
        <Routes>
          <Route path="/" element={user ? <Index /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/profile" element={user ? <Profile /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/setup-profile" element={user ? <SetupProfile /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/create-skill-card" element={user ? <CreateSkillCard /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/my-sessions" element={user ? <MySessions /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/request-session" element={user ? <RequestSession /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/leaderboard" element={user ? <Leaderboard /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="/admin" element={user ? <Admin /> : <AuthPage onAuthSuccess={() => {}} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
