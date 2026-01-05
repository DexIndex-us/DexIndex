import React, { useState, useEffect, useMemo } from 'react';
import { PokemonDetails } from './types';
import { fetchAllPokemonInCollection, getPokemonCustomId } from './services/pokeApi';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetail } from './components/PokemonDetail';
import { Logo } from './components/Logo';
import { IntroAnimation } from './components/IntroAnimation';
import { Home } from './components/Home';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'dex'>('home');
  const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  useEffect(() => {
    let isMounted = true;
    
    const processData = (details: PokemonDetails[]) => {
       const detailsWithCustomId = details.map(p => ({
          ...p,
          customId: getPokemonCustomId(p.name) || p.id
        }));
        
        // Sort by our custom collection order (which matches customId)
        // If customId is undefined (fallback to API ID), push them to end or handle gracefully
        const sortedList = detailsWithCustomId.sort((a, b) => (a.customId || 99999) - (b.customId || 99999));
        return sortedList;
    };

    const loadPokemon = async () => {
      setLoading(true);
      try {
        // We pass a callback to receive partial results (progressive loading)
        const finalDetails = await fetchAllPokemonInCollection((partialData) => {
          if (isMounted) {
            const processed = processData(partialData);
            setPokemonList(processed);
            // As soon as we have some data, stop the full screen spinner
            if (processed.length > 0) {
              setLoading(false);
            }
          }
        });
        
        // Ensure final consistency
        if (isMounted) {
          const processed = processData(finalDetails);
          setPokemonList(processed);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load pokemon", error);
        if (isMounted) setLoading(false);
      }
    };

    loadPokemon();
    return () => { isMounted = false; };
  }, []);

  const filteredPokemon = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pokemonList;
    return pokemonList.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.id.toString() === term ||
      (p.customId && p.customId.toString().padStart(4, '0').includes(term))
    );
  }, [pokemonList, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-dex-red selection:text-white">
      
      {showIntro && (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1a1f2e] to-slate-900"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className={`relative z-10 transition-opacity duration-300 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        
        {view === 'home' ? (
          <Home onLaunch={() => setView('dex')} />
        ) : (
          <>
            <header className="w-full pt-8 pb-6 flex flex-col items-center px-4 sticky top-0 bg-slate-900/95 backdrop-blur-2xl z-30 border-b border-white/5 shadow-xl">
               <div className="flex items-center gap-4 mb-6">
                 <button 
                   onClick={() => setView('home')} 
                   className="group flex items-center gap-3 transform transition-all active:scale-95"
                 >
                    <div className="hover:scale-110 transition-transform">
                      <Logo scale={0.5} showLabel={false} />
                    </div>
                    <div className="bg-slate-800 group-hover:bg-dex-red border border-white/10 px-4 py-2 rounded-xl transition-all shadow-lg group-hover:shadow-dex-red/20">
                      <span className="text-white font-black text-xs uppercase tracking-widest">Exit Home</span>
                    </div>
                 </button>
               </div>
               
               <div className="w-full max-w-xl relative">
                  <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-dex-red to-dex-blue rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                      <input 
                        type="text" 
                        placeholder="Search Pokemon name or #ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full py-4 pl-14 pr-4 rounded-2xl bg-slate-900/95 border border-white/10 text-white placeholder-slate-400 shadow-2xl focus:outline-none focus:border-dex-red/50 focus:bg-slate-900 transition-all text-lg font-medium"
                      />
                      <svg 
                        className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 z-20 transition-colors ${searchTerm ? 'text-dex-red' : 'text-slate-500 group-focus-within:text-dex-red'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
               </div>
            </header>

            <main className="container mx-auto px-4 py-12 flex-1">
              {loading && pokemonList.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-4">
                   <div className="w-16 h-16 border-4 border-dex-red border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-400 font-medium animate-pulse">Syncing Dex Data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPokemon.map((pokemon) => (
                      <div key={pokemon.id} className="animate-fade-in">
                        <PokemonCard pokemon={pokemon} onClick={setSelectedPokemon} />
                      </div>
                    ))}
                  </div>
                  
                  {filteredPokemon.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-xl text-slate-400">No Pokemon found matching "{searchTerm}"</p>
                    </div>
                  )}
                  
                  {/* Subtle Loading Indicator for background fetching */}
                  {loading && pokemonList.length > 0 && (
                     <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                           <div className="w-5 h-5 border-2 border-dex-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                     </div>
                  )}
                </>
              )}
            </main>
          </>
        )}
      </div>

      {selectedPokemon && (
        <PokemonDetail 
          pokemon={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)} 
        />
      )}
    </div>
  );
};

export default App;