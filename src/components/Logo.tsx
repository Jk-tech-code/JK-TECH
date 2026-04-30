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
      {/* Background Shape */}
      <rect width="100" height="100" rx="16" fill="#0F172A" />
      
      {/* "J" Shape with tech lines */}
      <path 
        d="M35 30H45V60C45 65.5228 40.5228 70 35 70C29.4772 70 25 65.5228 25 60" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <circle cx="45" cy="45" r="3" fill="currentColor" />
      <circle cx="35" cy="70" r="3" fill="currentColor" />
      
      {/* "K" Shape with tech lines */}
      <path 
        d="M55 30V70" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <path 
        d="M55 50L75 30" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <path 
        d="M55 50L75 70" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      
      {/* Tech Circles/Nodes */}
      <circle cx="75" cy="30" r="3" fill="currentColor" />
      <circle cx="75" cy="70" r="3" fill="currentColor" />
      <circle cx="55" cy="50" r="3" fill="currentColor" />
    </svg>
  );
};
