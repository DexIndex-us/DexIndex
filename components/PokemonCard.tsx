import React from 'react';
import { PokemonDetails } from '../types';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: PokemonDetails;
  onClick: (pokemon: PokemonDetails) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  // Pad ID with zeros, prioritize customId if it exists
  const displayId = pokemon.customId || pokemon.id;
  const idStr = `#${displayId.toString().padStart(4, '0')}`;
  
  return (
    <div 
      onClick={() => onClick(pokemon)}
      className="group relative bg-slate-800/20 backdrop-blur-md rounded-2xl p-4 cursor-pointer overflow-hidden border border-white/5 hover:bg-slate-700/30 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out"
    >
      {/* Background Gradient Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* ID Number */}
      <div className="absolute top-3 right-4 text-3xl font-black text-white/5 group-hover:text-white/10 transition-colors z-0 font-chakra tracking-widest">
        {idStr}
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Image Container with Glow */}
        <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-0 group-hover:scale-125"></div>
          <img 
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
            alt={pokemon.name}
            className="w-full h-full object-contain drop-shadow-xl group-hover:scale-115 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <h3 className="text-xl font-bold capitalize text-white mb-2 tracking-wide drop-shadow-md">
          {pokemon.name}
        </h3>
        
        <div className="flex gap-1.5 justify-center opacity-90 group-hover:opacity-100 transition-opacity">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
};