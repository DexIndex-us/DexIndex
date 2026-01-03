import React from 'react';

interface LogoProps {
  scale?: number;
  showLabel?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ scale = 1, showLabel = true, className = '' }) => {
  // Base size of the logo in pixels (equivalent to w-44/h-44 i.e., 11rem)
  const baseSize = 176;
  const size = baseSize * scale;

  return (
    <div 
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative w-44 h-44 rounded-[2.5rem] shadow-2xl bg-slate-900 border-[8px] border-slate-900 overflow-hidden ring-1 ring-white/20 transform transition-transform duration-500 ease-out hover:scale-105">
          
          {/* Top Half (Red) */}
          <div className="absolute top-0 w-full h-[58%] bg-gradient-to-br from-dex-red to-[#C02500] flex justify-between p-4 z-0">
             {/* Gloss Highlight */}
             <div className="absolute top-2 left-4 right-4 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-full opacity-60"></div>
          </div>

          {/* Decor - Top Buttons */}
          <div className="absolute top-4 left-5 w-4 h-4 rounded-full bg-blue-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-blue-500/50 z-10 animate-pulse"></div>
          <div className="absolute top-4 right-5 flex flex-col gap-1.5 z-10">
               <div className="w-6 h-1.5 bg-red-900/40 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"></div>
               <div className="w-6 h-1.5 bg-red-900/40 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"></div>
          </div>

          {/* Center Screen Assembly */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              {/* Screen Bezel */}
              <div className="w-24 h-20 bg-slate-800 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-slate-700 flex items-center justify-center relative overflow-hidden">
                  {/* Screen background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black opacity-80"></div>
                  
                  {/* DI Text */}
                  <h1 className="relative text-6xl font-black tracking-tighter text-dex-red z-10" 
                      style={{ 
                        fontFamily: 'Impact, sans-serif', 
                        textShadow: '2px 2px 0px #3f0a02',
                        WebkitTextStroke: '1px #5e1307'
                      }}>
                    DI
                  </h1>

                  {/* Glass Reflection */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rotate-45 blur-md"></div>
              </div>
          </div>

          {/* Bottom Half Text (Optional) */}
          {showLabel && (
            <div className="absolute bottom-4 left-0 right-0 text-center z-10">
              <span className="font-sans font-bold text-white tracking-wider text-sm drop-shadow-md opacity-90">DexIndex</span>
            </div>
          )}
          
          {/* Subtle texture for grip */}
          <div className="absolute bottom-0 w-full h-[42%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWYyOTM3Ii8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzNzQxNTEiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>

        </div>
      </div>
    </div>
  );
};