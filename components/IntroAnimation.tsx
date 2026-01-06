import React, { useEffect, useState, useRef } from 'react';
import { Logo } from './Logo';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  // Steps: 
  // 'ball': Show shaking pokeball
  // 'pop': Pokeball expands/fades, flash
  // 'reveal': Logo springs in
  // 'exit': Logo zooms in and fades out
  const [step, setStep] = useState<'ball' | 'pop' | 'reveal' | 'exit'>('ball');
  
  // Use a ref to ensure the callback is stable and doesn't trigger effect re-runs
  // This prevents the animation from resetting if the parent component re-renders (e.g. data loading)
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 1. Ball shakes for 2.0s (Fixed duration)
    const timer1 = setTimeout(() => setStep('pop'), 2000);
    
    // 2. Pop lasts very short, triggers reveal immediately
    const timer2 = setTimeout(() => setStep('reveal'), 2100);

    // 3. Reveal holds for 1.5s, then exit
    const timer3 = setTimeout(() => setStep('exit'), 3600);

    // 4. Complete unmount
    const timer4 = setTimeout(() => {
      onCompleteRef.current?.();
    }, 4100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []); // Empty dependency array ensures timing is absolute from mount

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center transition-opacity duration-500 ease-out ${step === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Pokeball Container */}
      <div 
        className={`absolute flex items-center justify-center transition-all duration-300 ease-in
          ${step === 'ball' ? 'opacity-100 scale-100' : 'opacity-0 scale-[2] pointer-events-none'}
        `}
      >
        <div className="relative w-48 h-48 animate-pokeball-shake">
            {/* Ball Body */}
            <div className="w-full h-full rounded-full border-[8px] border-slate-900 bg-white overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 w-full h-1/2 bg-dex-red border-b-[8px] border-slate-900"></div>
                {/* Shine */}
                <div className="absolute top-4 left-6 w-10 h-6 bg-white/20 rounded-full rotate-[-20deg]"></div>
                {/* Shadow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2)]"></div>
            </div>
            
            {/* Center Button Group */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-[8px] border-slate-900 flex items-center justify-center z-10 shadow-lg">
               <div className={`w-8 h-8 rounded-full border border-slate-400 bg-white transition-colors duration-200 ${step === 'pop' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : ''}`}></div>
            </div>
        </div>
      </div>

      {/* Burst Flash */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ease-out ${step === 'pop' ? 'opacity-40' : 'opacity-0'}`}></div>

      {/* Logo & Text Reveal */}
      <div 
        className={`flex flex-col items-center justify-center transform transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275)
          ${step === 'ball' || step === 'pop' ? 'scale-0 opacity-0' : ''}
          ${step === 'reveal' ? 'scale-100 opacity-100' : ''}
          ${step === 'exit' ? 'scale-150 opacity-0' : ''}
        `}
      >
          <div className="drop-shadow-[0_0_30px_rgba(227,53,13,0.6)]">
            <Logo scale={2.5} />
          </div>
          <h1 className="text-6xl font-black text-white mt-10 font-chakra tracking-[0.25em] uppercase drop-shadow-2xl">
            DexIndex
          </h1>
      </div>

      <style>{`
        @keyframes pokeball-shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(0deg); }
        }
        .animate-pokeball-shake {
          /* Matched to 1s so it shakes exactly twice in the 2s window */
          animation: pokeball-shake 1s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  );
};