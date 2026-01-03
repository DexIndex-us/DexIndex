import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'bursting' | 'zooming'>('idle');

  useEffect(() => {
    // Sequence Timeline - Exactly 3 seconds total
    const shakeTimer = setTimeout(() => setPhase('shaking'), 400);
    const burstTimer = setTimeout(() => setPhase('bursting'), 1900); // Shaking for 1.5s
    const zoomTimer = setTimeout(() => setPhase('zooming'), 2600);   // Show logo reveal for 0.7s
    const finishTimer = setTimeout(onComplete, 3000);              // Final 0.4s zoom out

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(burstTimer);
      clearTimeout(zoomTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-out`}
      style={{ 
        background: 'linear-gradient(115deg, #E3350D 0%, #E3350D 70%, #3B4CCA 70%, #3B4CCA 100%)',
        opacity: phase === 'zooming' ? 0 : 1,
        pointerEvents: 'none'
      }}
    >
      
      {/* Central Content (Logo & Name) */}
      <div className={`absolute inset-0 flex items-center justify-center gap-6 sm:gap-12 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${phase === 'idle' || phase === 'shaking' ? 'scale-0 opacity-0' : ''}
        ${phase === 'bursting' ? 'scale-100 opacity-100' : ''}
        ${phase === 'zooming' ? 'scale-[4] opacity-0 blur-sm' : ''}
      `}>
          {/* Left: Icon */}
          <div className="drop-shadow-2xl relative z-10">
             <Logo scale={1.2} showLabel={false} />
          </div>
          
          {/* Right: Name */}
          <div className="flex flex-col justify-center z-10">
             <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-none font-chakra drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
               DEX
             </h1>
             <h1 className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tighter leading-none font-chakra drop-shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
               INDEX
             </h1>
          </div>
      </div>

      {/* Pokeball (The Cover) */}
      <div className={`relative transition-all duration-300
         ${phase === 'bursting' || phase === 'zooming' ? 'scale-[3] opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
      `}>
         {/* Pokeball Graphic */}
         <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full border-[12px] border-slate-900 bg-white relative overflow-hidden shadow-2xl
            ${phase === 'shaking' ? 'animate-shake' : ''}
         `}>
            {/* Top Half */}
            <div className="absolute top-0 w-full h-1/2 bg-dex-red border-b-[6px] border-slate-900">
               {/* Shine */}
               <div className="absolute top-4 left-6 w-8 h-4 bg-white/30 rounded-full -rotate-12"></div>
            </div>
            
            {/* Center Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border-[12px] border-slate-900 z-10 flex items-center justify-center">
               <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-slate-300 bg-white transition-colors duration-200 ${phase === 'shaking' ? 'bg-red-200 animate-pulse' : ''}`}></div>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-10deg); }
          40% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};