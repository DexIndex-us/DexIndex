import React, { useState, useEffect } from 'react';
import { PokemonDetails, PokemonSpecies } from '../types';
import { fetchPokemonSpecies, fetchPokemonByName } from '../services/pokeApi';
import { TypeBadge } from './TypeBadge';
import { StatBar } from './StatBar';

interface PokemonDetailProps {
  pokemon: PokemonDetails;
  onClose: () => void;
}

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

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose }) => {
  const [displayPokemon, setDisplayPokemon] = useState<PokemonDetails>(pokemon);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'stats' | 'forms'>('about');
  const [loadingForm, setLoadingForm] = useState(false);
  const [formSprites, setFormSprites] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    // Reset display pokemon when prop changes
    setDisplayPokemon(pokemon);
    setActiveTab('about');
    setSpecies(null);
    setFormSprites({});

    const loadData = async () => {
      try {
        // Fetch species using the base ID
        const sData = await fetchPokemonSpecies(pokemon.id);
        if (isMounted) setSpecies(sData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
    };
  }, [pokemon]);

  // Batched loading of form sprites
  useEffect(() => {
    if (!species?.varieties) return;
    let isMounted = true;

    const fetchSprites = async () => {
      // Filter out varieties we already have
      const toFetch = species.varieties.filter(v => !formSprites[v.pokemon.name]);
      if (toFetch.length === 0) return;

      // Fetch in batches of 5 to avoid network congestion for mons with many forms
      const BATCH_SIZE = 5;
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
        // Preserve customId from original prop if possible, or keep existing id logic
        setDisplayPokemon({
          ...newDetails,
          customId: pokemon.customId // Keep the user-facing number consistent
        });
      }
    } catch (e) {
      console.error("Failed to load form", e);
    } finally {
      setLoadingForm(false);
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
          <div className="p-8 overflow-y-auto flex-1 h-[400px]">
            
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
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Abilities</span>
                    <div className="flex gap-2 flex-wrap">
                      {displayPokemon.abilities.map(a => (
                        <span key={a.ability.name} className={`px-3 py-1 rounded-md text-sm font-medium border capitalize ${a.is_hidden ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-600 bg-slate-700 text-slate-200'}`}>
                          {a.ability.name.replace('-', ' ')} {a.is_hidden && '(Hidden)'}
                        </span>
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