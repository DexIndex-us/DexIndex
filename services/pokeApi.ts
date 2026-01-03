import { PokemonListResult, PokemonDetails, PokemonSpecies } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const GQL_ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';

export const POKEMON_COLLECTION_NAMES = [
  // Starters (1-81)
  "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Bulbasaur", "Ivysaur", "Venusaur",
  "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr", "Chikorita", "Bayleef", "Meganium",
  "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Treecko", "Grovyle", "Sceptile",
  "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Turtwig", "Grotle", "Torterra",
  "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott", "Snivy", "Servine", "Serperior",
  "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja", "Chespin", "Quilladin", "Chesnaught",
  "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina", "Rowlet", "Dartrix", "Decidueye",
  "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon", "Grookey", "Thwackey", "Rillaboom",
  "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Sprigatito", "Floragato", "Meowscarada",
  
  // Expanded List (Starting at 82)
  "Abra", "Aerodactyl", "Alakazam", "Arbok", "Arcanine", "Beedrill", "Bellsprout", "Butterfree", "Caterpie", "Chansey",
  "Clefable", "Clefairy", "Cloyster", "Cubone", "Dewgong", "Diglett", "Ditto", "Dodrio", "Doduo", "Dragonair",
  "Dragonite", "Dratini", "Drowzee", "Dugtrio", "Eevee", "Ekans", "Electabuzz", "Electrode", "Exeggcute", "Exeggutor",
  "Farfetch'd", "Fearow", "Flareon", "Gastly", "Gengar", "Geodude", "Gloom", "Golbat", "Golduck", "Goldeen",
  "Golem", "Graveler", "Grimer", "Growlithe", "Gyarados", "Haunter", "Hitmonchan", "Hitmonlee", "Horsea", "Hypno",
  "Jigglypuff", "Jolteon", "Jynx", "Kabuto", "Kabutops", "Kadabra", "Kakuna", "Kangaskhan", "Kingler", "Koffing",
  "Krabby", "Lapras", "Lickitung", "Machamp", "Machoke", "Machop", "Magikarp", "Magmar", "Magnemite", "Magneton",
  "Mankey", "Marowak", "Meowth", "Metapod", "Mr. Mime", "Muk", "Nidoking", "Nidoqueen", "Nidoran♀", "Nidoran♂",
  "Nidorina", "Nidorino", "Ninetales", "Oddish", "Omanyte", "Omastar", "Onix", "Paras", "Parasect", "Persian",
  "Pidgeot", "Pidgeotto", "Pidgey", "Pikachu", "Pinsir", "Poliwag", "Poliwhirl", "Poliwrath", "Ponyta", "Porygon",
  "Primeape", "Psyduck", "Raichu", "Rapidash", "Raticate", "Rattata", "Rhydon", "Rhyhorn", "Sandshrew", "Sandslash",
  "Scyther", "Seadra", "Seaking", "Seel", "Shellder", "Slowbro", "Slowpoke", "Snorlax", "Spearow", "Starmie",
  "Staryu", "Tangela", "Tauros", "Tentacool", "Tentacruel", "Vaporeon", "Venomoth", "Venonat", "Victreebel", "Vileplume",
  "Voltorb", "Vulpix", "Weedle", "Weepinbell", "Weezing", "Wigglytuff", "Zubat"
];

// Helper to normalize names for PokeAPI
const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .replace('♀', '-f')
    .replace('♂', '-m')
    .replace("'", '')
    .replace('.', '')
    .replace(' ', '-');
};

export const fetchAllPokemonInCollection = async (): Promise<PokemonDetails[]> => {
  const apiNames = POKEMON_COLLECTION_NAMES.map(n => normalizeName(n));
  
  const query = `
    query {
      pokemon_v2_pokemon(where: {name: {_in: ${JSON.stringify(apiNames)}}}) {
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
    if (!data) return [];
    
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
