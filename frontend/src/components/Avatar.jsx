import React from 'react';
import { assetUrl } from '../utils/assetUrl';

const initialsFromName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar = ({ name, src, size = 8, className = '', role = 'student', onError }) => {
  const initials = initialsFromName(name);
  // Tailwind spacing scale: 1 unit = 0.25rem = 4px → size * 4px
  const sizePx = size * 4;
  const sizeStyle = { width: `${sizePx}px`, height: `${sizePx}px` };
  const initialBgClass = src ? '' : role === 'admin' ? 'bg-purple-600' : 'bg-indigo-600';

  if (src) {
    return (
      <img
        src={assetUrl(src)}
        alt={name || 'avatar'}
        onError={(e) => {
          if (onError) onError(e);
          e.currentTarget.style.display = 'none';
        }}
        style={sizeStyle}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={sizeStyle}
      className={`flex items-center justify-center rounded-full text-white text-sm ${initialBgClass} ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
