import React from 'react';
import { useApp } from '@/context/AppContext';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user, profile, loading, error } = useApp();

  // The main App component now handles the main loading and auth states.
  // This component can now safely assume the user and profile are loaded,
  // or it can add specific UI for its own loading/error states if needed.

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  // App.tsx handles the case where user is null.
  // We can also handle the case where profile is still null after loading.
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-yellow-400">Finalizing profile setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <Dashboard />
    </div>
  );
};

export default Index;
