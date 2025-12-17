import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`${className} relative flex items-center justify-center cursor-pointer select-none group`}>
      {/* Glow Effect Layer - Simplified for Performance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-white/10 to-orange-100/10 rounded-full pointer-events-none z-0"></div>
      
      {/* Logo Image */}
      <img 
        src="/logo.png" 
        alt="شعار المتجر" 
        className="relative z-10 w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
      />
    </div>
  );
};