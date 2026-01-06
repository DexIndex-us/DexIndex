
export interface PokemonListResult {
  name: string;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonDetails {
  id: number;
  customId?: number; // Added for custom numbering support
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
      home: {
        front_default: string;
      };
    };
  };
  abilities: PokemonAbility[];
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
}

export interface PokemonFullData extends PokemonDetails {
  speciesData?: PokemonSpecies;
}

// Evolution Chain Types
export interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
  is_baby: boolean;
  evolution_details: {
    min_level?: number;
    trigger?: {
      name: string;
    };
    item?: {
      name: string;
    };
    // Add other trigger details as needed
  }[];
}

export interface EvolutionChainResponse {
  chain: EvolutionChainLink;
  id: number;
}

// Map standard types to Tailwind colors
export const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-neutral-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-600',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-800',
  dragon: 'bg-indigo-600',
  dark: 'bg-neutral-800',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300',
};