import React from 'react';

interface LogoProps {
  scale?: number;
  showLabel?: boolean; // Kept for compatibility, though text is now integrated
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ scale = 1, className = '' }) => {
  // Base scale calculation
  const size = 120 * scale; 
  
  return (
    <div 
      className={`relative select-none ${className}`} 
      style={{ width: size, height: size }}
      aria-label="DexIndex Logo"
    >
      {/* External Buttons - Positioned relative to main container */}
      {/* Top Left (Grey) */}
      <div 
        className="absolute w-[20%] h-[8%] bg-slate-400 rounded-t-sm border-2 border-slate-900 z-0"
        style={{ top: '-4%', left: '15%' }}
      />
      {/* Top Right (Red) */}
      <div 
        className="absolute w-[15%] h-[6%] bg-red-600 rounded-t-sm border-2 border-slate-900 z-0"
        style={{ top: '-3%', right: '15%' }}
      />
      {/* Side Button (Left) */}
      <div 
        className="absolute w-[6%] h-[15%] bg-slate-700 rounded-l-sm border-2 border-slate-900 z-0"
        style={{ top: '20%', left: '-3%' }}
      />

      {/* Main Body */}
      <div className="relative w-full h-full z-10 rounded-[22%] overflow-hidden border-[3px] border-slate-900 shadow-2xl bg-slate-900 flex flex-col">
        
        {/* Top Section (Red) */}
        <div className="h-[55%] w-full bg-[#E3350D] relative border-b-[3px] border-slate-900 box-border">
            {/* Vents */}
            <div className="absolute top-[12%] right-[8%] flex flex-col gap-[3px]">
               <div className="w-[18px] h-[3px] bg-black/20 rounded-full"></div>
               <div className="w-[18px] h-[3px] bg-black/20 rounded-full"></div>
            </div>
        </div>

        {/* Bottom Section (Black/Dark) */}
        <div className="h-[45%] w-full bg-[#1F2937] relative flex items-end justify-center pb-[8%]">
            <span 
              className="text-white font-sans font-bold tracking-tight leading-none"
              style={{ fontSize: `${16 * scale}px` }}
            >
              DexIndex
            </span>
        </div>

        {/* Center Logo Plate */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[45%] bg-[#1F2937] rounded-xl border-[3px] border-slate-900 flex items-center justify-center shadow-lg"
          style={{ marginTop: '-2%' }} 
        >
           {/* The D and I */}
           <div className="relative w-full h-full flex items-center justify-center">
              {/* Using CSS shapes/text for D I */}
              <div 
                className="font-black text-[#E3350D] tracking-tighter flex items-center justify-center"
                style={{ 
                  fontFamily: 'Chakra Petch, sans-serif', 
                  fontSize: `${48 * scale}px`,
                  textShadow: '2px 2px 0px #000',
                  columnGap: '0.1em'
                }}
              >
                 <span>D</span>
                 <span>I</span>
              </div>
              
              {/* Highlight Gloss */}
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-white/10 to-transparent rounded-tr-lg pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
};