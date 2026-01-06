import React, { useState, useEffect, useRef } from 'react';
import { PokemonDetails, PokemonSpecies, EvolutionChainLink, PokemonAbility } from '../types';
import { fetchPokemonSpecies, fetchPokemonByName, fetchEvolutionChain, getPokemonCustomId, fetchAbilityDescription, fetchPokemonSpeciesByUrl } from '../services/pokeApi';
import { TypeBadge } from './TypeBadge';
import { StatBar } from './StatBar';

interface PokemonDetailProps {
  pokemon: PokemonDetails;
  onClose: () => void;
}

// Helper to extract ID from URL
const getIdFromUrl = (url: string): string => {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1];
};

// Sub-component for individual form items
const FormItem: React.FC<{ 
  name: string; 
  sprite?: string;
  isActive: boolean; 
  onClick: () => void; 
}> = ({ name, sprite, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-xl transition-all border ${
        isActive 
          ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
          : 'bg-slate-800 border-white/5 hover:bg-slate-700'
      }`}
    >
      <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
        {sprite ? (
          <img src={sprite} alt={name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin"></div>
        )}
      </div>
      <span className="text-xs font-bold uppercase text-slate-300 tracking-wide text-center max-w-[100px] break-words">
        {name.replace(/-/g, ' ')}
      </span>
    </button>
  );
};

// Sub-component for evolution node
const EvolutionNode: React.FC<{ 
  link: EvolutionChainLink; 
  onSelect: (name: string) => void;
}> = ({ link, onSelect }) => {
  const id = getIdFromUrl(link.species.url);
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => onSelect(link.species.name)}
        className="group relative flex flex-col items-center cursor-pointer"
      >
        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full border-4 border-slate-700 group-hover:border-dex-blue transition-colors relative flex items-center justify-center mb-2 shadow-lg overflow-hidden">
           <img src={spriteUrl} alt={link.species.name} className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" />
        </div>
        <span className="text-white font-bold capitalize bg-slate-800 px-3 py-1 rounded-full text-sm border border-slate-600 group-hover:border-dex-blue transition-colors">
          {link.species.name}
        </span>
      </div>

      {/* Evolves To (Recursive) */}
      {link.evolves_to.length > 0 && (
        <div className="flex flex-col items-center mt-4 w-full">
           <div className="h-8 w-0.5 bg-slate-600 mb-4"></div> {/* Vertical line */}
           <div className="flex flex-wrap justify-center gap-8 md:gap-12 relative">
              {/* Horizontal Connector for multiple evolutions */}
              {link.evolves_to.length > 1 && (
                 <div className="absolute -top-4 left-0 right-0 h-0.5 bg-slate-600 mx-12"></div>
              )}
              
              {link.evolves_to.map((child, idx) => (
                <div key={idx} className="flex flex-col items-center relative">
                   {/* Vertical connector from horizontal bar */}
                   {link.evolves_to.length > 1 && <div className="h-4 w-0.5 bg-slate-600 absolute -top-4"></div>}
                   <EvolutionNode link={child} onSelect={onSelect} />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose }) => {
  const [displayPokemon, setDisplayPokemon] = useState<PokemonDetails>(pokemon);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChainLink | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'stats' | 'forms' | 'evolution'>('about');
  const [loadingForm, setLoadingForm] = useState(false);
  const [formSprites, setFormSprites] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // Ability Info State
  const [selectedAbility, setSelectedAbility] = useState<{name: string, description: string} | null>(null);
  const [loadingAbility, setLoadingAbility] = useState<string | null>(null);

  // Effect: Sync prop to state when user opens a new Pokemon from outside
  useEffect(() => {
    if (pokemon.id !== displayPokemon.id) {
       setDisplayPokemon(pokemon);
       setActiveTab('about'); // Reset tab on new pokemon
       setSpecies(null);      // Reset species to force reload
       setEvolutionChain(null);
       if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [pokemon]);

  // Effect: Load data whenever displayPokemon changes (handles internal navigation)
  useEffect(() => {
    let isMounted = true;
    
    // We only reset these if we don't have species data or if species data doesn't match current ID
    // (though often forms share species, a full ID change usually warrants a check)
    if (!species) {
        setFormSprites({});
        setSelectedAbility(null);
    }

    const loadData = async () => {
      try {
        let sData;
        // Use species URL if available (handles alternate forms where ID != species ID)
        if (displayPokemon.species?.url) {
           sData = await fetchPokemonSpeciesByUrl(displayPokemon.species.url);
        } else {
           // Fallback mainly for backward compatibility or if data is missing
           sData = await fetchPokemonSpecies(displayPokemon.id);
        }
        
        if (isMounted) {
          setSpecies(sData);
          
          // Load Evolution Chain (only if we don't have one or if it changed - though chains are usually static per species family)
          if (sData.evolution_chain?.url) {
            const evoData = await fetchEvolutionChain(sData.evolution_chain.url);
            if (isMounted && evoData) {
              setEvolutionChain(evoData.chain);
            }
          }
        }
      } catch (err) {
        console.error("Error loading species data:", err);
      }
    };

    loadData();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
    };
  }, [displayPokemon.id, displayPokemon.species]); // Depend on species as well

  // Batched loading of form sprites with safety
  useEffect(() => {
    if (!species?.varieties) return;
    let isMounted = true;

    const fetchSprites = async () => {
      // Filter out varieties we already have
      const toFetch = species.varieties.filter(v => !formSprites[v.pokemon.name]);
      if (toFetch.length === 0) return;

      // Small batch size for safety/smoothness
      const BATCH_SIZE = 3;
      for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        if (!isMounted) return;
        const batch = toFetch.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (v) => {
          try {
            const data = await fetchPokemonByName(v.pokemon.name);
            if (data && isMounted) {
               setFormSprites(prev => ({...prev, [v.pokemon.name]: data.sprites.front_default}));
            }
          } catch (e) {
            console.error(`Failed to load sprite for form ${v.pokemon.name}`, e);
          }
        }));
      }
    };

    fetchSprites();
    return () => { isMounted = false; };
  }, [species, formSprites]);

  const handleFormChange = async (formName: string) => {
    if (formName === displayPokemon.name) return;
    setLoadingForm(true);
    try {
      const newDetails = await fetchPokemonByName(formName);
      if (newDetails) {
        const customId = getPokemonCustomId(newDetails.name) || displayPokemon.customId || newDetails.id;
        setDisplayPokemon({
          ...newDetails,
          customId
        });
        // Scroll content to top to show user the change
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
    } catch (e) {
      console.error("Failed to load form", e);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEvolutionSelect = async (name: string) => {
    setLoadingForm(true);
    try {
      const newDetails = await fetchPokemonByName(name);
      if (newDetails) {
        // Resolve Custom ID for evolution
        const customId = getPokemonCustomId(newDetails.name) || newDetails.id;
        
        // This triggers the useEffect([displayPokemon.id]), reloading species/chain/etc
        setDisplayPokemon({
          ...newDetails,
          customId
        });
        
        // Reset to 'about' to show the new Pokemon's details cleanly
        setActiveTab('about');
        setSpecies(null); // Clear species to force spinner and reload of description
        
        // Reset scroll position
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
    } catch (e) {
      console.error("Failed to load evolution", e);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleAbilityClick = async (ability: PokemonAbility) => {
    if (loadingAbility) return;
    setLoadingAbility(ability.ability.name);
    try {
      const description = await fetchAbilityDescription(ability.ability.url);
      setSelectedAbility({ name: ability.ability.name, description });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAbility(null);
    }
  };

  // Get flavor text (English)
  const flavorText = species?.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || "Loading description...";
  const genus = species?.genera.find(g => g.language.name === 'en')?.genus || "";
  
  // Custom ID Logic
  const displayId = displayPokemon.customId || displayPokemon.id;
  
  // Check if we should show forms tab
  const hasMultipleForms = species?.varieties && species.varieties.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors text-white/70 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Ability Explanation Modal Overlay */}
        {selectedAbility && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" 
            onClick={() => setSelectedAbility(null)}
          >
             <div 
               className="bg-slate-800 p-8 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full relative animate-scale-in"
               onClick={e => e.stopPropagation()}
             >
                <div className="mb-4 flex justify-between items-start">
                  <h4 className="text-2xl font-bold text-white capitalize font-chakra">
                    {selectedAbility.name.replace('-', ' ')}
                  </h4>
                  <button onClick={() => setSelectedAbility(null)} className="text-white/50 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="w-full h-px bg-white/10 mb-4"></div>
                <p className="text-slate-300 leading-relaxed text-lg font-medium">
                  {selectedAbility.description}
                </p>
                <button 
                  className="mt-6 w-full py-3 bg-dex-blue hover:bg-blue-600 rounded-xl text-white font-bold transition-colors shadow-lg shadow-blue-500/20" 
                  onClick={() => setSelectedAbility(null)}
                >
                  Got it
                </button>
             </div>
          </div>
        )}

        {/* Left Side: Visuals */}
        <div className={`w-full md:w-2/5 p-8 flex flex-col items-center justify-center relative overflow-hidden text-white bg-slate-800 transition-colors duration-500`}>
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-gradient-to-br from-white/10 to-transparent">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current">
              <path d="M0 0 L100 0 L100 100 L0 100 Z" />
            </svg>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-6 items-end">
              <div className="flex-1">
                <h2 className="text-4xl font-black capitalize tracking-tight text-white leading-tight">{displayPokemon.name.replace(/-/g, ' ')}</h2>
                <p className="text-white/60 text-lg font-medium">{genus}</p>
              </div>
              <span className="text-2xl font-bold opacity-30 font-chakra ml-2">#{displayId.toString().padStart(4, '0')}</span>
            </div>

            <div className="w-64 h-64 md:w-72 md:h-72 relative mb-6 flex justify-center items-center">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl opacity-50"></div>
              {loadingForm ? (
                 <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <img 
                  src={displayPokemon.sprites.other['official-artwork'].front_default || displayPokemon.sprites.front_default} 
                  alt={displayPokemon.name}
                  key={displayPokemon.name} // Force re-render on change
                  className="w-full h-full object-contain drop-shadow-2xl animate-float relative z-10"
                />
              )}
            </div>

            <div className="flex gap-2">
              {displayPokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Data */}
        <div className="w-full md:w-3/5 bg-slate-900 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5 px-6 pt-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${activeTab === 'about' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Base Stats
            </button>
            <button 
              onClick={() => setActiveTab('evolution')}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${activeTab === 'evolution' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Evolutions
            </button>
            {hasMultipleForms && (
              <button 
                onClick={() => setActiveTab('forms')}
                className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${activeTab === 'forms' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Forms <span className="ml-1 text-xs bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400">{species!.varieties.length}</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div ref={contentRef} className="p-8 overflow-y-auto flex-1 h-[400px]">
            
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="text-white font-bold mb-2">Description</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">{flavorText}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Height</span>
                    <span className="text-lg font-medium text-slate-200">{displayPokemon.height / 10} m</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Weight</span>
                    <span className="text-lg font-medium text-slate-200">{displayPokemon.weight / 10} kg</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Abilities <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 ml-1 font-normal tracking-normal">CLICK FOR INFO</span></span>
                    <div className="flex gap-2 flex-wrap">
                      {displayPokemon.abilities.map(a => (
                        <button 
                          key={a.ability.name} 
                          onClick={() => handleAbilityClick(a)}
                          className={`px-3 py-1 rounded-md text-sm font-medium border capitalize transition-all active:scale-95 flex items-center gap-2 ${
                            a.is_hidden 
                              ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200' 
                              : 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'
                          }`}
                        >
                          {a.ability.name.replace('-', ' ')} {a.is_hidden && '(Hidden)'}
                          {loadingAbility === a.ability.name && (
                             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-2 animate-fade-in-up pt-2">
                {displayPokemon.stats.map(s => (
                  <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} />
                ))}
                <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                  <p className="text-blue-300 text-sm">
                    <strong>Total:</strong> {displayPokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0)}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'evolution' && (
              <div className="h-full flex flex-col items-center justify-center animate-fade-in-up">
                 {!species ? (
                   <div className="w-10 h-10 border-4 border-dex-blue border-t-transparent rounded-full animate-spin"></div>
                 ) : !evolutionChain ? (
                   <div className="text-slate-400">No evolution data available.</div>
                 ) : (
                   <div className="w-full flex justify-center py-4">
                     <EvolutionNode link={evolutionChain} onSelect={handleEvolutionSelect} />
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'forms' && hasMultipleForms && (
              <div className="animate-fade-in-up">
                <p className="text-slate-400 mb-4 text-sm">Select a form to view its details:</p>
                <div className="grid grid-cols-3 gap-3">
                  {species!.varieties.map((variety) => (
                    <FormItem 
                      key={variety.pokemon.name}
                      name={variety.pokemon.name}
                      sprite={formSprites[variety.pokemon.name]}
                      isActive={displayPokemon.name === variety.pokemon.name}
                      onClick={() => handleFormChange(variety.pokemon.name)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};