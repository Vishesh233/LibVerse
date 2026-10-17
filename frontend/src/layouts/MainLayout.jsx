import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key !== 'Escape') return;
      if (isMobileNavOpen) setIsMobileNavOpen(false);
      else if (isFullscreen) setIsFullscreen(false);
    };

    if (isFullscreen || isMobileNavOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen, isMobileNavOpen]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-background-secondary font-sans text-slate-100">
      {/* Desktop sidebar (lg and up) */}
      <div className={`hidden lg:block transition-all duration-500 ease-in-out motion-reduce:transition-none ${isFullscreen ? 'w-0 opacity-0 overflow-hidden' : 'w-64'} flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Mobile / tablet sidebar drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
          <div className="absolute inset-0 modal-overlay" onClick={() => setIsMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-fade-in-up shadow-2xl">
            <Sidebar onNavigate={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-500 ease-in-out ${isFullscreen ? 'w-full' : ''}`}>
        <Navbar
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onOpenMenu={() => setIsMobileNavOpen(true)}
        />
        <main className={`app-main flex-1 overflow-y-auto transition-all duration-500 ${isFullscreen ? 'p-5 sm:p-6 lg:p-8' : 'p-4 sm:p-8 lg:p-10'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
