import React from 'react';

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8', collapsed = false }) => {
  if (collapsed) {
    return (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path
          d="M8 4L16 2L24 4V14C24 19.5228 20 24 16 26C12 24 8 19.5228 8 14V4Z"
          fill="none"
          stroke="#0E7FE0"
          strokeWidth="2"
        />
        <path
          d="M12 13L15 16L20 11"
          stroke="#0E7FE0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shield icon */}
      <path
        d="M8 5L17 2L26 5V15C26 21 21.5 26 17 28C12.5 26 8 21 8 15V5Z"
        fill="none"
        stroke="#0E7FE0"
        strokeWidth="1.8"
      />
      <path
        d="M12 14L15.5 17.5L22 11"
        stroke="#0E7FE0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wordmark */}
      <text
        x="34"
        y="19"
        fontFamily="Inter, sans-serif"
        fontSize="15"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="0.08em"
      >
        SENTRAX
      </text>
      {/* Subtitle Tagline */}
      <text
        x="34"
        y="28"
        fontFamily="Inter, sans-serif"
        fontSize="6.5"
        fontWeight="600"
        fill="#8FA8C0"
        letterSpacing="0.16em"
      >
        SEE. ANALYZE. PROTECT.
      </text>
    </svg>
  );
};
