import React from 'react';
import { Logo } from './Logo';

interface HomeProps {
  onLaunch: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLaunch }) => {
  
  const handleLaunch = () => {
    // Wrap in timeout to allow the button click animation/state to render 
    // before the heavy main thread work of mounting the Dex view begins.
    setTimeout(() => {
      onLaunch();
    }, 10);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dex-red/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dex-blue/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24 animate-fade-in-up">
          
          <Logo scale={1.5} className="mb-8 drop-shadow-[0_0_30px_rgba(227,53,13,0.3)]" />
          <h1 className="text-5xl md:text-7xl font-black text-white font-chakra tracking-tight mb-4 uppercase italic">
            DexIndex
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-dex-blue tracking-[0.2em] uppercase mb-4">
            Pokémon Navigation Reimagined
          </h2>
        </div>

        {/* Organization Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-24 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-dex-red/30 transition-colors group">
            <div className="w-12 h-12 bg-dex-red/10 rounded-xl flex items-center justify-center mb-6 text-dex-red font-chakra font-bold text-xl">01</div>
            <h3 className="text-white font-bold text-xl mb-3">Starters First</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The first 81 entries are reserved for the starters and their evolutions from Gen 1 to Gen 9.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-dex-blue/30 transition-colors group">
            <div className="w-12 h-12 bg-dex-blue/10 rounded-xl flex items-center justify-center mb-6 text-dex-blue font-chakra font-bold text-xl">02</div>
            <h3 className="text-white font-bold text-xl mb-3">Sequential A-Z</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Regions are organized alphabetically, providing a systematic and intuitive research path.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-colors group">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-white font-chakra font-bold text-xl">03</div>
            <h3 className="text-white font-bold text-xl mb-3">Master Roster</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Now including Galar, Hisui, and Paldea! Legendaries, Mythicals, and Paradox forms complete the collection.
            </p>
          </div>
        </div>

        {/* Makers Section */}
        <div className="w-full mb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-3xl font-black text-white font-chakra uppercase tracking-tight mb-8 text-center">
            Created by:
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-dex-red/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-dex-red/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-dex-red/10 transition-colors"></div>
              <h3 className="text-2xl font-black text-white mb-1">Pavionalon</h3>
              <p className="text-dex-red font-bold text-xs uppercase tracking-[0.2em] mb-4">Maker</p>
              <p className="text-slate-400 leading-relaxed">
                A key maker of the DexIndex project, bringing valuable insights and dedication to reimagining Pokémon navigation and organization.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-dex-blue/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-dex-blue/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-dex-blue/10 transition-colors"></div>
              <h3 className="text-2xl font-black text-white mb-1">Dote</h3>
              <p className="text-dex-blue font-bold text-xs uppercase tracking-[0.2em] mb-4">Maker</p>
              <p className="text-slate-400 leading-relaxed">
                An essential maker of DexIndex, helping to shape the vision and implementation of this next-generation Pokédex experience.
              </p>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto px-6 py-8 bg-white/5 rounded-3xl border border-white/5 mb-16">
             <p className="text-slate-300 font-medium italic mb-2">
               "Thank you to all who made DexIndex possible. Together, we're revolutionizing how trainers interact with Pokémon information!"
             </p>
          </div>
        </div>

        {/* Discord & Support Section */}
        <div className="w-full max-w-2xl flex flex-col gap-4 animate-fade-in-up mb-8" style={{ animationDelay: '0.5s' }}>
           <a 
             href="https://discord.gg/DX53kQSYJr" 
             target="_blank" 
             rel="noopener noreferrer"
             className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-indigo-600/30 transition-colors group"
           >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.513 13.513 0 0 0-.573 1.173 18.35 18.35 0 0 0-2.775-.138 18.35 18.35 0 0 0-2.776.138 14.507 14.507 0 0 0-.573-1.173.074.074 0 0 0-.078-.037 19.78 19.78 0 0 0-4.886 1.515.07.07 0 0 0-.03.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </div>
                <div>
                   <span className="block text-white font-bold text-sm">IF ANY QUESTION GO TO THIS LINK</span>
                   <span className="text-indigo-300 text-xs">Join our Discord Community</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </a>
        </div>

        {/* Footer Navigation Guide */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-center gap-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <div className="absolute -inset-2 bg-dex-red opacity-0 group-hover:opacity-20 blur-lg rounded-full transition-opacity"></div>
                 <Logo scale={0.3} showLabel={false} className="relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-dex-red font-bold text-xs uppercase tracking-widest mb-1">Navigation Tip</span>
                <p className="text-white text-sm">Click the <span className="font-bold">DI Icon</span> or the <span className="text-dex-red font-bold underline">EXIT</span> button to return home.</p>
              </div>
           </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center mb-20 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <button 
            onClick={handleLaunch}
            className="group relative px-16 py-6 rounded-2xl bg-white text-slate-900 font-black text-2xl tracking-wider uppercase transition-all duration-300 hover:bg-dex-red hover:text-white hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.1)]"
          >
            Enter the Pokedex
            <div className="absolute inset-0 rounded-2xl bg-white blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
};