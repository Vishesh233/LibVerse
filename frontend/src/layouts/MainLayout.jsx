import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

/** Thin strip above the navbar for the shared live-demo accounts */
const DemoBanner = () => (
  <div role="note" className="flex-shrink-0 border-b border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-center text-xs font-medium text-amber-100 print:hidden">
    You&apos;re viewing a demo account. Data resets daily.
  </div>
);

export const MainLayout = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();

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
    // Print (Reports "Print / Save as PDF"): no app chrome, full-height content instead of a scroll box
    <div className="flex h-screen bg-gradient-to-b from-background to-background-secondary font-sans text-slate-100 print:block print:h-auto print:bg-none">
      {/* Desktop sidebar (lg and up) */}
      <div className={`hidden lg:block print:!hidden transition-all duration-500 ease-in-out motion-reduce:transition-none ${isFullscreen ? 'w-0 opacity-0 overflow-hidden' : 'w-64'} flex-shrink-0`}>
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

      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-500 ease-in-out print:block ${isFullscreen ? 'w-full' : ''}`}>
        {user?.isDemo && <DemoBanner />}
        <Navbar
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onOpenMenu={() => setIsMobileNavOpen(true)}
        />
        <main className={`app-main flex-1 overflow-y-auto transition-all duration-500 print:overflow-visible print:!p-0 ${isFullscreen ? 'p-5 sm:p-6 lg:p-8' : 'p-4 sm:p-8 lg:p-10'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
