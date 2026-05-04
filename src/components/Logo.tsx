import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Border/Shape if needed, but the logo is mostly the letters */}
      
      {/* Stylized "J" - Circuit Style */}
      <path 
        d="M30 25V65C30 73.2843 36.7157 80 45 80" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      <circle cx="30" cy="35" r="4" fill="currentColor" />
      <circle cx="30" cy="50" r="4" fill="currentColor" />
      <circle cx="45" cy="80" r="4" fill="currentColor" />
      
      {/* Stylized "K" - Circuit Style */}
      <path 
        d="M55 25V80" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      <path 
        d="M55 52.5L75 30" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      <path 
        d="M55 52.5L75 75" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      
      {/* Nodes on K */}
      <circle cx="75" cy="30" r="4" fill="currentColor" />
      <circle cx="75" cy="75" r="4" fill="currentColor" />
      <circle cx="55" cy="52.5" r="4" fill="currentColor" />
      <circle cx="55" cy="35" r="4" fill="currentColor" />
    </svg>
  );
};
