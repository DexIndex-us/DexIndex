import React, { useState, useEffect } from 'react';
import { PokemonDetails, PokemonSpecies } from '../types';
import { fetchPokemonSpecies } from '../services/pokeApi';
import { TypeBadge } from './TypeBadge';
import { StatBar } from './StatBar';

interface PokemonDetailProps {
  pokemon: PokemonDetails;
  onClose: () => void;
}

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose }) => {
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'stats'>('about');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const sData = await fetchPokemonSpecies(pokemon.id);
        if (isMounted) setSpecies(sData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
    
    setActiveTab('about');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
    };
  }, [pokemon]);

  // Get flavor text (English)
  const flavorText = species?.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || "Loading description...";
  const genus = species?.genera.find(g => g.language.name === 'en')?.genus || "";
  
  // Custom ID Logic
  const displayId = pokemon.customId || pokemon.id;

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
        <div className={`w-full md:w-2/5 p-8 flex flex-col items-center justify-center relative overflow-hidden text-white bg-slate-800`}>
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-gradient-to-br from-white/10 to-transparent">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current">
              <path d="M0 0 L100 0 L100 100 L0 100 Z" />
            </svg>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="flex justify-between w-full mb-6 items-end">
              <div>
                <h2 className="text-4xl font-black capitalize tracking-tight text-white">{pokemon.name}</h2>
                <p className="text-white/60 text-lg font-medium">{genus}</p>
              </div>
              <span className="text-2xl font-bold opacity-30 font-chakra">#{displayId.toString().padStart(4, '0')}</span>
            </div>

            <div className="w-64 h-64 md:w-72 md:h-72 relative mb-6 flex justify-center items-center">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl opacity-50"></div>
               <img 
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                alt={pokemon.name}
                className="w-full h-full object-contain drop-shadow-2xl animate-float relative z-10"
              />
            </div>

            <div className="flex gap-2">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Data */}
        <div className="w-full md:w-3/5 bg-slate-900 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5 px-6 pt-6">
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'about' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'stats' ? 'text-dex-blue border-b-2 border-dex-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Base Stats
            </button>
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
                    <span className="text-lg font-medium text-slate-200">{pokemon.height / 10} m</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Weight</span>
                    <span className="text-lg font-medium text-slate-200">{pokemon.weight / 10} kg</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Abilities</span>
                    <div className="flex gap-2 flex-wrap">
                      {pokemon.abilities.map(a => (
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
                {pokemon.stats.map(s => (
                  <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} />
                ))}
                <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                  <p className="text-blue-300 text-sm">
                    <strong>Total:</strong> {pokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};