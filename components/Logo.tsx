import React from 'react';

interface LogoProps {
  scale?: number;
  showLabel?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ scale = 1, showLabel = true, className = '' }) => {
  // Base size reference
  const baseSize = 176;
  const size = baseSize * scale;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: showLabel ? size * 1.2 : size }}
    >
      <div 
        className="relative transition-transform duration-500 ease-out hover:scale-105 drop-shadow-2xl"
        style={{ width: size, height: size }}
      >
        <img 
          src="/logo.png" 
          alt="DexIndex Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if image is missing
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.classList.add('bg-dex-red', 'rounded-3xl', 'border-4', 'border-slate-900');
            e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full text-white font-black text-4xl">DI</div>';
          }}
        />
      </div>

      {/* Bottom Half Text */}
      {showLabel && (
        <div className="mt-2 text-center z-10">
          <span className="font-sans font-bold text-white tracking-wider text-sm drop-shadow-md opacity-90" style={{ fontSize: `${14 * scale}px` }}>DexIndex</span>
        </div>
      )}
    </div>
  );
};