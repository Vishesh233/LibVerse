import React from 'react';

export const Loader = ({ fullscreen = false }) => {
  const loader = (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400"></div>
      <span className="ml-3 text-slate-300">Loading...</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="card p-8">
          {loader}
        </div>
      </div>
    );
  }

  return loader;
};

export const Skeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      ))}
    </div>
  );
};

export const SkeletonCard = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="w-full h-64 bg-slate-800 animate-pulse"></div>
          <div className="p-4">
            <div className="h-5 bg-slate-700 rounded animate-pulse mb-3"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse mb-3 w-3/4"></div>
            <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
