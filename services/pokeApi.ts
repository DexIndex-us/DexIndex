import { PokemonListResult, PokemonDetails, PokemonSpecies } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const GQL_ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';

export const STARTER_POKEMON_NAMES = [
  // Gen 1
  "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise",
  "Bulbasaur", "Ivysaur", "Venusaur",
  // Gen 2
  "Cyndaquil", "Quilava", "Typhlosion",
  "Totodile", "Croconaw", "Feraligatr",
  "Chikorita", "Bayleef", "Meganium",
  // Gen 3
  "Torchic", "Combusken", "Blaziken",
  "Mudkip", "Marshtomp", "Swampert",
  "Treecko", "Grovyle", "Sceptile",
  // Gen 4
  "Chimchar", "Monferno", "Infernape",
  "Piplup", "Prinplup", "Empoleon",
  "Turtwig", "Grotle", "Torterra",
  // Gen 5
  "Tepig", "Pignite", "Emboar",
  "Oshawott", "Dewott", "Samurott",
  "Snivy", "Servine", "Serperior",
  // Gen 6
  "Fennekin", "Braixen", "Delphox",
  "Froakie", "Frogadier", "Greninja",
  "Chespin", "Quilladin", "Chesnaught",
  // Gen 7
  "Litten", "Torracat", "Incineroar",
  "Popplio", "Brionne", "Primarina",
  "Rowlet", "Dartrix", "Decidueye",
  // Gen 8
  "Scorbunny", "Raboot", "Cinderace",
  "Sobble", "Drizzile", "Inteleon",
  "Grookey", "Thwackey", "Rillaboom",
  // Gen 9
  "Fuecoco", "Crocalor", "Skeledirge",
  "Quaxly", "Quaxwell", "Quaquaval",
  "Sprigatito", "Floragato", "Meowscarada"
];

export const fetchAllStarterPokemon = async (): Promise<PokemonDetails[]> => {
  const names = STARTER_POKEMON_NAMES.map(n => n.toLowerCase());
  
  const query = `
    query {
      pokemon_v2_pokemon(where: {name: {_in: ${JSON.stringify(names)}}}) {
        id
        name
        height
        weight
        pokemon_v2_pokemontypes {
          slot
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
        pokemon_v2_pokemonabilities {
          is_hidden
          slot
          pokemon_v2_ability {
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();
    
    // Map GraphQL response to PokemonDetails
    return data.pokemon_v2_pokemon.map((p: any) => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      types: p.pokemon_v2_pokemontypes.map((t: any) => ({
        slot: t.slot,
        type: { name: t.pokemon_v2_type.name, url: '' }
      })),
      stats: p.pokemon_v2_pokemonstats.map((s: any) => ({
        base_stat: s.base_stat,
        effort: 0,
        stat: { name: s.pokemon_v2_stat.name, url: '' }
      })),
      abilities: p.pokemon_v2_pokemonabilities.map((a: any) => ({
        is_hidden: a.is_hidden,
        slot: a.slot,
        ability: { name: a.pokemon_v2_ability.name, url: '' }
      })),
      sprites: {
        front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
        other: {
          'official-artwork': {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
          },
          home: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png`
          }
        }
      }
    }));
  } catch (error) {
    console.error("GraphQL fetch failed", error);
    // Fallback if GraphQL fails: return empty array or handle gracefully
    return [];
  }
};

export const fetchPokemonList = async (limit: number = 151, offset: number = 0): Promise<PokemonListResult[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon list');
  const data = await response.json();
  return data.results;
};

export const fetchPokemonDetails = async (url: string): Promise<PokemonDetails> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch pokemon details');
  return response.json();
};

export const fetchPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon species');
  return response.json();
};

export const fetchPokemonDetailsByName = async (name: string): Promise<PokemonDetails> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon details');
  return response.json();
};