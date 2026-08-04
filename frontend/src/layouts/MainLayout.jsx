import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-background-secondary font-sans text-slate-100">
      <div className={`transition-all duration-500 ease-in-out ${isFullscreen ? 'w-0 opacity-0 overflow-hidden' : 'w-64'} flex-shrink-0`}>
        <Sidebar />
      </div>
      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-500 ease-in-out ${isFullscreen ? 'w-full' : ''}`}>
        <Navbar isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
        <main className={`flex-1 overflow-y-auto transition-all duration-500 ${isFullscreen ? 'p-5 sm:p-6 lg:p-8' : 'p-5 sm:p-8 lg:p-10'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
