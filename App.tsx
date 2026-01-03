import React, { useState, useEffect } from 'react';
import { PokemonDetails } from './types';
import { fetchAllPokemonInCollection, POKEMON_COLLECTION_NAMES } from './services/pokeApi';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetail } from './components/PokemonDetail';
import { Logo } from './components/Logo';
import { IntroAnimation } from './components/IntroAnimation';

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadPokemon = async () => {
      setLoading(true);
      try {
        const details = await fetchAllPokemonInCollection();
        
        if (isMounted) {
          const detailsWithCustomId = details.map(p => {
             // Use original names array for custom indexing to ensure specific requested order
             const index = POKEMON_COLLECTION_NAMES.findIndex(
               name => {
                 const normalized = name.toLowerCase()
                  .replace('♀', '-f')
                  .replace('♂', '-m')
                  .replace("'", '')
                  .replace('.', '')
                  .replace(' ', '-');
                 return normalized === p.name.toLowerCase();
               }
             );
             return {
               ...p,
               customId: index >= 0 ? index + 1 : 9999
             };
          });

          const sortedList = detailsWithCustomId.sort((a, b) => (a.customId || 0) - (b.customId || 0));
          setPokemonList(sortedList);
        }
      } catch (error) {
        console.error("Failed to load pokemon", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPokemon();
    return () => { isMounted = false; };
  }, []);

  const filteredPokemon = pokemonList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString() === searchTerm ||
    (p.customId && p.customId.toString() === searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-dex-red selection:text-white">
      
      {showIntro && (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1a1f2e] to-slate-900"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-dex-red/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] bg-dex-blue/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.25] grayscale brightness-150 transform scale-[2] sm:scale-[3] mix-blend-overlay">
          <Logo showLabel={false} />
        </div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className={`w-full pt-16 pb-10 flex flex-col items-center px-4 relative z-10 transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
         <div className="drop-shadow-2xl">
            <Logo />
         </div>
         
         <div className="w-full max-w-xl relative z-10 animate-fade-in-up mt-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-dex-red to-dex-blue rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <input 
                  type="text" 
                  placeholder="Search Pokemon name or #ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="relative w-full py-4 pl-14 pr-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white placeholder-slate-400 shadow-2xl focus:outline-none focus:border-dex-red/50 focus:bg-slate-900 transition-all text-lg font-medium"
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
      </div>

      <main className={`container mx-auto px-4 pb-12 flex-1 relative z-10 transition-opacity duration-1000 delay-300 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        {loading ? (
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
          </>
        )}
      </main>

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