import React from 'react';

/**
 * Original Hacktoberfest-inspired technical editorial vector marks.
 * Minimal, geometric, hand-inked aesthetic. Zero AI cliches, zero emojis.
 */

export const ScoutMark: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 36 }) => (
  <img
    src="/logo.png"
    alt="Learn Faster"
    width={size}
    height={size}
    className={`object-contain select-none pointer-events-none ${className}`}
  />
);

export const RadarCompassGraphic: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="84"
    height="84"
    viewBox="0 0 84 84"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="42" cy="42" r="38" stroke="rgba(180, 160, 220, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" fill="#100c1e" />
    <circle cx="42" cy="42" r="26" stroke="rgba(180, 160, 220, 0.25)" strokeWidth="1.5" fill="#18122c" />
    <circle cx="42" cy="42" r="14" stroke="#c9813c" strokeWidth="1.5" fill="rgba(201, 129, 60, 0.2)" />
    <circle cx="42" cy="42" r="3" fill="#f3effa" />
    <line x1="42" y1="4" x2="42" y2="80" stroke="rgba(180, 160, 220, 0.3)" strokeWidth="1" />
    <line x1="4" y1="42" x2="80" y2="42" stroke="rgba(180, 160, 220, 0.3)" strokeWidth="1" />
    {/* Blip 1: High Yield Target */}
    <circle cx="56" cy="28" r="4.5" fill="#c9813c" stroke="#f3effa" strokeWidth="1" />
    {/* Blip 2: Second Target */}
    <circle cx="28" cy="52" r="3.5" fill="#34d399" stroke="#f3effa" strokeWidth="1" />
  </svg>
);

export const LogicCircuitDiagram: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Logic Gate & Input Traces */}
    <path d="M10 20H35" stroke="rgba(200, 180, 245, 0.6)" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 40H35" stroke="rgba(200, 180, 245, 0.6)" strokeWidth="2" strokeLinecap="round" />
    {/* AND / ALU block */}
    <rect x="35" y="10" width="40" height="40" rx="0" fill="#18122c" stroke="#c9813c" strokeWidth="2" />
    <text x="55" y="34" fontFamily="Outfit, sans-serif" fontSize="12" fontWeight="800" textAnchor="middle" fill="#f3effa">
      ALU
    </text>
    {/* Output trace */}
    <path d="M75 30H105" stroke="#c9813c" strokeWidth="2" strokeLinecap="round" />
    <circle cx="108" cy="30" r="3" fill="#c9813c" stroke="rgba(200, 180, 245, 0.6)" strokeWidth="1.5" />
  </svg>
);

export const CassetteDeckIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="52"
    height="36"
    viewBox="0 0 52 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="48" height="32" rx="0" fill="#141024" stroke="rgba(200, 180, 245, 0.4)" strokeWidth="1.5" />
    <rect x="8" y="7" width="36" height="18" rx="0" fill="#201838" stroke="#c9813c" strokeWidth="1.5" />
    {/* Spools */}
    <circle cx="18" cy="16" r="4.5" fill="rgba(201, 129, 60, 0.25)" stroke="rgba(200, 180, 245, 0.6)" strokeWidth="1.5" />
    <circle cx="18" cy="16" r="2" fill="#c9813c" />
    <circle cx="34" cy="16" r="4.5" fill="rgba(201, 129, 60, 0.25)" stroke="rgba(200, 180, 245, 0.6)" strokeWidth="1.5" />
    <circle cx="34" cy="16" r="2" fill="#c9813c" />
    <line x1="22.5" y1="16" x2="29.5" y2="16" stroke="#c9813c" strokeWidth="1" strokeDasharray="1 1" />
  </svg>
);
