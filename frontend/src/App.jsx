import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';

/**
 * App Component
 * Two-column root layout with fixed sidebar and scrollable main content area.
 */
export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleNavClick = (id) => {
    setActiveNav(id);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex">
      {/* Fixed Sidebar */}
      <Sidebar activeNav={activeNav} onNavClick={handleNavClick} />

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px] max-[900px]:ml-[72px] p-6 lg:p-8 min-h-screen overflow-y-auto transition-all duration-200">
        {activeNav === 'dashboard' ? (
          <Dashboard />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#161A22] border border-[#222734] flex items-center justify-center text-xl">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-white capitalize">
              {activeNav}
            </h2>
            <p className="text-sm text-gray-400 max-w-sm">
              This module is currently in development. Full functionality is coming soon.
            </p>
            <button
              type="button"
              onClick={() => setActiveNav('dashboard')}
              className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
