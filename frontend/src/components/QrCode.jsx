import React, { useMemo } from 'react';
import { LOGO_BOOK_PATHS, LOGO_COLORS, qrLayout } from '../utils/qrLayout';

/**
 * Desk QR code as an SVG (level H, quiet zone included), optionally with the LibVerse mark in the
 * centre. Same modules as the card PNG and the label sheets (utils/qrLayout).
 */
export const QrCode = ({ value, logo = false, className = '', title, fg = '#000000', bg = '#FFFFFF' }) => {
  const layout = useMemo(() => qrLayout(value, { logo }), [value, logo]);
  const { size, path } = layout;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect width={size} height={size} fill={bg} />
      <path d={path} fill={fg} />
      {layout.logo && (
        <>
          <rect x={layout.logo.tile.x} y={layout.logo.tile.y} width={layout.logo.tile.size} height={layout.logo.tile.size} rx={layout.logo.tile.radius} fill={LOGO_COLORS.tile} shapeRendering="geometricPrecision" />
          <g
            transform={`translate(${layout.logo.icon.x} ${layout.logo.icon.y}) scale(${layout.logo.icon.scale})`}
            fill="none"
            stroke={LOGO_COLORS.icon}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
          >
            {LOGO_BOOK_PATHS.map((d) => <path key={d} d={d} />)}
          </g>
        </>
      )}
    </svg>
  );
};

export default QrCode;
