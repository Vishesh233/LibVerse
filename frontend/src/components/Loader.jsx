import React from 'react';

export const Loader = ({ fullscreen = false }) => {
  const loader = (
    <div className="flex items-center justify-center py-6" role="status">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400/25 border-t-indigo-400 motion-reduce:animate-none"></div>
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
        <div key={i} className="skeleton h-4"></div>
      ))}
    </div>
  );
};

export const SkeletonCard = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton w-full h-64 !rounded-none"></div>
          <div className="p-4">
            <div className="skeleton h-5 mb-3"></div>
            <div className="skeleton h-4 mb-3 w-3/4"></div>
            <div className="skeleton h-8"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
