import { PokemonDetails, PokemonSpecies, EvolutionChainResponse } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta';

// DB Constants
const DB_NAME = 'DexIndexDB';
const DB_VERSION = 1;
const STORE_NAME = 'pokemon_store';
const CACHE_KEY = 'all_pokemon_v37_gql'; // Bumped version for new roster

// Specific overrides for Pokemon that have different API names than their display names
const NAME_OVERRIDES: Record<string, string> = {
  "deoxys": "deoxys-normal",
  "wormadam": "wormadam-plant",
  "giratina": "giratina-altered",
  "shaymin": "shaymin-land",
  "basculin": "basculin-red-striped",
  "basculegion": "basculegion-male",
  "darmanitan": "darmanitan-standard",
  "tornadus": "tornadus-incarnate",
  "thundurus": "thundurus-incarnate",
  "landorus": "landorus-incarnate",
  "enamorus": "enamorus-incarnate",
  "keldeo": "keldeo-ordinary",
  "meloetta": "meloetta-aria",
  "aegislash": "aegislash-shield",
  "pumpkaboo": "pumpkaboo-average",
  "gourgeist": "gourgeist-average",
  "zygarde": "zygarde-50",
  "oricorio": "oricorio-baile",
  "lycanroc": "lycanroc-midday",
  "wishiwashi": "wishiwashi-solo",
  "minior": "minior-red-meteor",
  "mimikyu": "mimikyu-disguised",
  "toxtricity": "toxtricity-amped",
  "eiscue": "eiscue-ice",
  "indeedee": "indeedee-male",
  "morpeko": "morpeko-full-belly",
  "urshifu": "urshifu-single-strike",
  "meowstic": "meowstic-male",
  // Gen 9 Overrides
  "dudunsparce": "dudunsparce-two-segment",
  "palafin": "palafin-zero",
  "maushold": "maushold-family-of-four",
  "tatsugiri": "tatsugiri-curly",
  "squawkabilly": "squawkabilly-green-plumage",
  "oinkologne": "oinkologne-male"
};

// --- INDEXED DB HELPERS ---
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const getFromDB = async (key: string): Promise<PokemonDetails[] | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
    });
  } catch (e) {
    console.error("IndexedDB Get Error", e);
    return null;
  }
};

const saveToDB = async (key: string, data: PokemonDetails[]): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: key, data });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (e) {
    console.error("IndexedDB Save Error", e);
  }
};

// Helper to normalize names
export const normalizePokemonName = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (NAME_OVERRIDES[lowerName]) return NAME_OVERRIDES[lowerName];
  return lowerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[♀]/g, '-f')
    .replace(/[♂]/g, '-m')
    .replace(/['.:]/g, '')
    .replace(/\s+/g, '-');
};

// Transform REST Data (Legacy support for single fetches)
const transformPokemonData = (data: any): PokemonDetails => {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types,
    stats: data.stats,
    sprites: {
      front_default: data.sprites.front_default,
      other: {
        'official-artwork': {
          front_default: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default
        },
        home: {
          front_default: data.sprites.other?.home?.front_default || data.sprites.front_default
        }
      }
    },
    abilities: data.abilities,
    species: data.species
  };
};

// GraphQL Batch Fetcher
const fetchPokemonBatchGQL = async (names: string[]): Promise<PokemonDetails[]> => {
  const query = `
    query PokemonDetails($names: [String!]) {
      pokemon_v2_pokemon(where: {name: {_in: $names}}) {
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
          effort
          pokemon_v2_stat {
            name
          }
        }
        pokemon_v2_pokemonabilities {
          is_hidden
          slot
          pokemon_v2_ability {
            name
            id
          }
        }
        pokemon_v2_pokemonspecy {
          name
          id
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { names }
      })
    });

    const json = await response.json();
    if (json.errors) {
       console.warn("GraphQL Errors:", json.errors);
       // Return empty array to handle gracefully, or throw if critical
       return [];
    }
    
    if (!json.data || !json.data.pokemon_v2_pokemon) return [];

    return json.data.pokemon_v2_pokemon.map((p: any) => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      types: p.pokemon_v2_pokemontypes.map((t: any) => ({
        slot: t.slot,
        type: { name: t.pokemon_v2_type.name, url: "" } 
      })),
      stats: p.pokemon_v2_pokemonstats.map((s: any) => ({
        base_stat: s.base_stat,
        effort: s.effort,
        stat: { name: s.pokemon_v2_stat.name, url: "" }
      })),
      abilities: p.pokemon_v2_pokemonabilities.map((a: any) => ({
        is_hidden: a.is_hidden,
        slot: a.slot,
        ability: { 
          name: a.pokemon_v2_ability.name, 
          url: `https://pokeapi.co/api/v2/ability/${a.pokemon_v2_ability.id}/` 
        }
      })),
      species: {
        name: p.pokemon_v2_pokemonspecy?.name || p.name,
        url: p.pokemon_v2_pokemonspecy ? `https://pokeapi.co/api/v2/pokemon-species/${p.pokemon_v2_pokemonspecy.id}/` : ""
      },
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
  } catch (e) {
    console.error("GQL Request failed", e);
    return [];
  }
}

// REST Fetch Helpers
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  const fetchWithTimeout = async (resource: string, options: any = {}) => {
    const { timeout = 8000 } = options; 
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await Promise.race([
        fetch(resource, { ...options, signal: controller.signal }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
      ]);
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`404: ${url}`);
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
    }
  }
};

export const fetchPokemonByName = async (nameOrId: string | number): Promise<PokemonDetails | null> => {
  try {
    const normalizedName = typeof nameOrId === 'string' ? normalizePokemonName(nameOrId) : nameOrId;
    const rawData = await fetchWithRetry(`${BASE_URL}/pokemon/${normalizedName}`, 3);
    return transformPokemonData(rawData);
  } catch (error) {
    return null;
  }
};

export const fetchEvolutionChain = async (url: string): Promise<EvolutionChainResponse | null> => {
  try { return await fetchWithRetry(url, 2); } catch { return null; }
};

export const fetchAbilityDescription = async (url: string): Promise<string> => {
  try {
    const data = await fetchWithRetry(url, 2);
    const englishEffect = data.effect_entries?.find((e: any) => e.language.name === 'en');
    if (englishEffect?.short_effect) return englishEffect.short_effect;
    if (englishEffect?.effect) return englishEffect.effect;
    const flavorEntry = data.flavor_text_entries?.find((e: any) => e.language.name === 'en');
    return flavorEntry?.flavor_text.replace(/\f/g, ' ') || "No description available.";
  } catch {
    return "Could not load ability details.";
  }
};

// Collection Array
const POKEMON_COLLECTION = [
  // --- STARTERS (0001 - 0081) ---
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise",
  "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr",
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert",
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon",
  "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott",
  "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja",
  "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina",
  "Grookey", "Thwackey", "Rillaboom", "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon",
  "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval",

  // --- GEN 1 ADDITIONAL ---
  "Abra", "Aerodactyl", "Alakazam", "Arbok", "Arcanine", "Beedrill", "Bellsprout", "Butterfree", "Caterpie", "Chansey", "Clefable", "Clefairy", "Cloyster", "Cubone", "Dewgong", "Diglett", "Ditto", "Dodrio", "Doduo", "Dragonair", "Dragonite", "Dratini", "Drowzee", "Dugtrio", "Eevee", "Ekans", "Electabuzz", "Electrode", "Exeggcute", "Exeggutor", "Farfetch'd", "Fearow", "Flareon", "Gastly", "Gengar", "Geodude", "Gloom", "Golbat", "Golduck", "Goldeen", "Golem", "Graveler", "Grimer", "Growlithe", "Gyarados", "Haunter", "Hitmonchan", "Hitmonlee", "Horsea", "Hypno", "Jigglypuff", "Jolteon", "Jynx", "Kabuto", "Kabutops", "Kadabra", "Kakuna", "Kangaskhan", "Kingler", "Koffing", "Krabby", "Lapras", "Lickitung", "Machamp", "Machoke", "Machop", "Magikarp", "Magmar", "Magnemite", "Magneton", "Mankey", "Marowak", "Meowth", "Metapod", "Mr. Mime", "Muk", "Nidoking", "Nidoqueen", "Nidoran♀", "Nidoran♂", "Nidorina", "Nidorino", "Ninetales", "Oddish", "Omanyte", "Omastar", "Onix", "Paras", "Parasect", "Persian", "Pidgeot", "Pidgeotto", "Pidgey", "Pikachu", "Pinsir", "Poliwag", "Poliwhirl", "Poliwrath", "Ponyta", "Porygon", "Primeape", "Psyduck", "Raichu", "Rapidash", "Raticate", "Rattata", "Rhydon", "Rhyhorn", "Sandshrew", "Sandslash", "Scyther", "Seadra", "Seaking", "Seel", "Shellder", "Slowbro", "Slowpoke", "Snorlax", "Spearow", "Starmie", "Staryu", "Tangela", "Tauros", "Tentacool", "Tentacruel", "Vaporeon", "Venomoth", "Venonat", "Victreebel", "Vileplume", "Voltorb", "Vulpix", "Weedle", "Weepinbell", "Weezing", "Wigglytuff", "Zubat",

  // --- GEN 2 ADDITIONAL ---
  "Aipom", "Ampharos", "Ariados", "Azumarill", "Bellossom", "Blissey", "Chinchou", "Cleffa", "Corsola", "Crobat", "Delibird", "Donphan", "Dunsparce", "Elekid", "Espeon", "Flaaffy", "Forretress", "Furret", "Girafarig", "Gligar", "Granbull", "Heracross", "Hitmontop", "Hoothoot", "Hoppip", "Houndoom", "Houndour", "Igglybuff", "Jumpluff", "Kingdra", "Lanturn", "Larvitar", "Ledian", "Ledyba", "Magby", "Magcargo", "Mantine", "Mareep", "Marill", "Miltank", "Misdreavus", "Murkrow", "Natu", "Noctowl", "Octillery", "Phanpy", "Pichu", "Piloswine", "Pineco", "Politoed", "Porygon2", "Pupitar", "Quagsire", "Qwilfish", "Remoraid", "Scizor", "Sentret", "Shuckle", "Skarmory", "Skiploom", "Slowking", "Slugma", "Smeargle", "Smoochum", "Sneasel", "Snubbull", "Spinarak", "Stantler", "Steelix", "Sudowoodo", "Sunflora", "Sunkern", "Swinub", "Teddiursa", "Togepi", "Togetic", "Tyranitar", "Tyrogue", "Umbreon", "Unown", "Ursaring", "Wobbuffet", "Wooper", "Xatu", "Yanma",

  // --- GEN 3 ADDITIONAL ---
  "Absol", "Aggron", "Altaria", "Anorith", "Armaldo", "Aron", "Azurill", "Bagon", "Baltoy", "Banette", "Barboach", "Beautifly", "Beldum", "Breloom", "Cacnea", "Cacturne", "Camerupt", "Carvanha", "Cascoon", "Castform", "Chimecho", "Clamperl", "Claydol", "Corphish", "Cradily", "Crawdaunt", "Delcatty", "Dusclops", "Duskull", "Dustox", "Electrike", "Exploud", "Feebas", "Flygon", "Gardevoir", "Glalie", "Gorebyss", "Grumpig", "Gulpin", "Hariyama", "Huntail", "Illumise", "Kecleon", "Kirlia", "Lairon", "Lileep", "Linoone", "Lombre", "Lotad", "Loudred", "Ludicolo", "Lunatone", "Luvdisc", "Makuhita", "Manectric", "Masquerain", "Mawile", "Medicham", "Meditite", "Metagross", "Metang", "Mightyena", "Milotic", "Minun", "Nincada", "Ninjask", "Nosepass", "Numel", "Nuzleaf", "Pelipper", "Plusle", "Poochyena", "Ralts", "Relicanth", "Roselia", "Sableye", "Salamence", "Sealeo", "Seedot", "Seviper", "Sharpedo", "Shedinja", "Shelgon", "Shiftry", "Shroomish", "Shuppet", "Silcoon", "Skitty", "Slaking", "Slakoth", "Snorunt", "Solrock", "Spheal", "Spinda", "Spoink", "Surskit", "Swablu", "Swalot", "Swellow", "Taillow", "Torkoal", "Trapinch", "Tropius", "Vibrava", "Vigoroth", "Volbeat", "Wailmer", "Wailord", "Walrein", "Whiscash", "Whismur", "Wingull", "Wurmple", "Wynaut", "Zangoose", "Zigzagoon",

  // --- GEN 4 ADDITIONAL ---
  "Abomasnow", "Ambipom", "Bastiodon", "Bibarel", "Bidoof", "Bonsly", "Bronzong", "Bronzor", "Budew", "Buizel", "Buneary", "Burmy", "Carnivine", "Chatot", "Cherrim", "Cherubi", "Chingling", "Combee", "Cranidos", "Croagunk", "Drapion", "Drifblim", "Drifloon", "Dusknoir", "Electivire", "Finneon", "Floatzel", "Froslass", "Gabite", "Gallade", "Garchomp", "Gastrodon", "Gible", "Glaceon", "Glameow", "Gliscor", "Happiny", "Hippopotas", "Hippowdon", "Honchkrow", "Kricketot", "Kricketune", "Leafeon", "Lickilicky", "Lopunny", "Lucario", "Lumineon", "Luxio", "Luxray", "Magmortar", "Magnezone", "Mamoswine", "Mantyke", "Mime Jr.", "Mismagius", "Mothim", "Munchlax", "Pachirisu", "Porygon-Z", "Probopass", "Purugly", "Rampardos", "Rhyperior", "Riolu", "Roserade", "Rotom", "Shellos", "Shieldon", "Shinx", "Skorupi", "Skuntank", "Snover", "Spiritomb", "Staraptor", "Staravia", "Starly", "Stunky", "Tangrowth", "Togekiss", "Toxicroak", "Vespiquen", "Weavile", "Wormadam", "Yanmega",

  // --- GEN 5 ADDITIONAL ---
  "Accelgor", "Alomomola", "Amoonguss", "Archen", "Archeops", "Audino", "Axew", "Basculin", "Beartic", "Beheeyem", "Bisharp", "Blitzle", "Boldore", "Bouffalant", "Braviary", "Carracosta", "Chandelure", "Cinccino", "Cofagrigus", "Conkeldurr", "Cottonee", "Crustle", "Cryogonal", "Cubchoo", "Darmanitan", "Darumaka", "Deerling", "Deino", "Drilbur", "Druddigon", "Ducklett", "Duosion", "Durant", "Dwebble", "Eelektrik", "Eelektross", "Elgyem", "Emolga", "Escavalier", "Excadrill", "Ferroseed", "Ferrothorn", "Foongus", "Fraxure", "Frillish", "Galvantula", "Garbodor", "Gigalith", "Golett", "Golurk", "Gothita", "Gothitelle", "Gothorita", "Gurdurr", "Haxorus", "Heatmor", "Herdier", "Hydreigon", "Jellicent", "Joltik", "Karrablast", "Klang", "Klink", "Klinklang", "Krokorok", "Krookodile", "Lampent", "Larvesta", "Leavanny", "Liepard", "Lilligant", "Lillipup", "Litwick", "Mandibuzz", "Maractus", "Mienfoo", "Mienshao", "Minccino", "Munna", "Musharna", "Palpitoad", "Panpour", "Pansage", "Pansear", "Patrat", "Pawniard", "Petilil", "Pidove", "Purrloin", "Reuniclus", "Roggenrola", "Rufflet", "Sandile", "Sawk", "Sawsbuck", "Scolipede", "Scraggy", "Scrafty", "Seismitoad", "Sewaddle", "Shelmet", "Sigilyph", "Simipour", "Simisage", "Simisear", "Solosis", "Stoutland", "Stunfisk", "Swadloon", "Swanna", "Swoobat", "Throh", "Timburr", "Tirtouga", "Tranquill", "Trubbish", "Tympole", "Tynamo", "Unfezant", "Vanillish", "Vanillite", "Vanilluxe", "Venipede", "Volcarona", "Vullaby", "Watchog", "Whimsicott", "Whirlipede", "Woobat", "Yamask", "Zebstrika", "Zoroark", "Zorua", "Zweilous",

  // --- GEN 6 ADDITIONAL ---
  "Aegislash", "Amaura", "Aromatisse", "Aurorus", "Avalugg", "Barbaracle", "Bergmite", "Binacle", "Bunnelby", "Carbink", "Clauncher", "Clawitzer", "Dedenne", "Diggersby", "Doublade", "Dragalge", "Espurr", "Flabébé", "Fletchinder", "Fletchling", "Floette", "Florges", "Furfrou", "Gogoat", "Goodra", "Goomy", "Gourgeist", "Hawlucha", "Heliolisk", "Helioptile", "Honedge", "Inkay", "Klefki", "Litleo", "Malamar", "Meowstic", "Noibat", "Noivern", "Pancham", "Pangoro", "Phantump", "Pumpkaboo", "Pyroar", "Scatterbug", "Skiddo", "Skrelp", "Sliggoo", "Slurpuff", "Spewpa", "Spritzee", "Swirlix", "Sylveon", "Talonflame", "Trevenant", "Tyrantrum", "Tyrunt", "Vivillon",

  // --- GEN 7 ADDITIONAL ---
  "Araquanid", "Bewear", "Bounsweet", "Bruxish", "Charjabug", "Comfey", "Crabominable", "Crabrawler", "Cutiefly", "Dewpider", "Dhelmise", "Drampa", "Fomantis", "Golisopod", "Grubbin", "Gumshoos", "Hakamo-o", "Jangmo-o", "Komala", "Kommo-o", "Lurantis", "Lycanroc", "Mareanie", "Mimikyu", "Minior", "Morelull", "Mudbray", "Mudsdale", "Oranguru", "Oricorio", "Palossand", "Passimian", "Pikipek", "Pyukumuku", "Ribombee", "Rockruff", "Salandit", "Salazzle", "Sandygast", "Shiinotic", "Steenee", "Stufful", "Togedemaru", "Toucannon", "Toxapex", "Trumbeak", "Tsareena", "Turtonator", "Vikavolt", "Wimpod", "Wishiwashi", "Yungoos",

  // --- GEN 8 ADDITIONAL ---
  "Alcremie", "Appletun", "Applin", "Arctovish", "Arctozolt", "Arrokuda", "Barraskewda", "Basculegion", "Blipbug", "Boltund", "Carkol", "Centiskorch", "Chewtle", "Clobbopus", "Coalossal", "Copperajah", "Corviknight", "Corvisquire", "Cramorant", "Cufant", "Cursola", "Dottler", "Dracovish", "Dracozolt", "Dragapult", "Drakloak", "Drednaw", "Dreepy", "Dubwool", "Duraludon", "Eiscue", "Eldegoss", "Falinks", "Flapple", "Frosmoth", "Gossifleur", "Grapploct", "Greedent", "Grimmsnarl", "Hatenna", "Hatterene", "Hattrem", "Impidimp", "Indeedee", "Kleavor", "Milcery", "Morgrem", "Morpeko", "Mr. Rime", "Nickit", "Obstagoon", "Orbeetle", "Overqwil", "Perrserker", "Pincurchin", "Polteageist", "Rolycoly", "Rookidee", "Runerigus", "Sandaconda", "Silicobra", "Sinistea", "Sirfetch'd", "Sizzlipede", "Skwovet", "Sneasler", "Snom", "Stonjourner", "Thievul", "Toxel", "Toxtricity", "Ursaluna", "Wooloo", "Wyrdeer", "Yamper",

  // --- GEN 9 ADDITIONAL ---
  "Annihilape", "Archaludon", "Arboliva", "Arctibax", "Armarouge", "Baxcalibur", "Bellibolt", "Bombirdier", "Brambleghast", "Bramblin", "Capsakid", "Ceruledge", "Cetitan", "Cetoddle", "Charcadet", "Clodsire", "Cyclizar", "Dachsbun", "Dipplin", "Dolliv", "Dondozo", "Dudunsparce", "Espathra", "Farigiraf", "Fidough", "Finizen", "Flamigo", "Flittle", "Frigibax", "Garganacl", "Gholdengo", "Gimmighoul", "Glimmet", "Glimmora", "Grafaiai", "Greavard", "Houndstone", "Hydrapple", "Kilowattrel", "Kingambit", "Klawf", "Lechonk", "Lokix", "Mabosstiff", "Maschiff", "Maushold", "Nacli", "Naclstack", "Nymble", "Oinkologne", "Orthworm", "Palafin", "Pawmi", "Pawmo", "Pawmot", "Poltchageist", "Rabsca", "Rellor", "Revavroom", "Scovillain", "Shroodle", "Sinistcha", "Smoliv", "Spidops", "Squawkabilly", "Tadbulb", "Tandemaus", "Tarountula", "Tatsugiri", "Tinkatink", "Tinkaton", "Tinkatuff", "Toedscool", "Toedscruel", "Varoom", "Veluza", "Wattrel", "Wiglett", "Wugtrio",

  // --- LEGENDARIES (A-Z) ---
  "Articuno", "Azelf", "Calyrex", "Chien-Pao", "Chi-Yu", "Cobalion", "Cosmoem", "Cosmog", "Cresselia", "Dialga", "Enamorus", "Entei", "Eternatus", "Fezandipiti", "Giratina", "Glastrier", "Groudon", "Heatran", "Ho-Oh", "Koraidon", "Kubfu", "Kyogre", "Kyurem", "Landorus", "Latias", "Latios", "Lugia", "Lunala", "Mesprit", "Mewtwo", "Miraidon", "Moltres", "Munkidori", "Necrozma", "Ogerpon", "Okidogi", "Palkia", "Raikou", "Rayquaza", "Regice", "Regidrago", "Regieleki", "Regigigas", "Regirock", "Registeel", "Reshiram", "Silvally", "Solgaleo", "Spectrier", "Suicune", "Tapu Bulu", "Tapu Fini", "Tapu Koko", "Tapu Lele", "Terapagos", "Terrakion", "Thundurus", "Ting-Lu", "Tornadus", "Type: Null", "Urshifu", "Uxie", "Virizion", "Wo-Chien", "Xerneas", "Yveltal", "Zacian", "Zamazenta", "Zapdos", "Zekrom", "Zygarde",

  // --- MYTHICALS (A-Z) ---
  "Arceus", "Celebi", "Darkrai", "Deoxys", "Diancie", "Genesect", "Hoopa", "Jirachi", "Keldeo", "Magearna", "Manaphy", "Marshadow", "Melmetal", "Meloetta", "Meltan", "Mew", "Pecharunt", "Phione", "Shaymin", "Victini", "Volcanion", "Zarude", "Zeraora",

  // --- ULTRA BEASTS (A-Z) ---
  "Blacephalon", "Buzzwole", "Celesteela", "Guzzlord", "Kartana", "Naganadel", "Nihilego", "Pheromosa", "Poipole", "Stakataka", "Xurkitree",

  // --- PARADOX POKEMON (A-Z) ---
  "Brute Bonnet", "Flutter Mane", "Gouging Fire", "Great Tusk", "Iron Boulder", "Iron Bundle", "Iron Crown", "Iron Hands", "Iron Jugulis", "Iron Leaves", "Iron Moth", "Iron Thorns", "Iron Treads", "Iron Valiant", "Raging Bolt", "Roaring Moon", "Sandy Shocks", "Scream Tail", "Slither Wing", "Walking Wake"
];

export const POKEMON_COLLECTION_NAMES = POKEMON_COLLECTION;

// NEW: ID Mapping for custom numbering
const CUSTOM_ID_MAP = new Map<string, number>();

// Initialize map immediately
POKEMON_COLLECTION_NAMES.forEach((name, index) => {
  const normalized = normalizePokemonName(name);
  const customId = index + 1;
  CUSTOM_ID_MAP.set(normalized, customId);
  CUSTOM_ID_MAP.set(name.toLowerCase(), customId);
});

export const getPokemonCustomId = (name: string): number | undefined => {
  const n = normalizePokemonName(name);
  return CUSTOM_ID_MAP.get(n) || CUSTOM_ID_MAP.get(name.toLowerCase());
};

export const fetchPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
  return await fetchWithRetry(`${BASE_URL}/pokemon-species/${id}`, 1);
};

export const fetchPokemonSpeciesByUrl = async (url: string): Promise<PokemonSpecies> => {
  return await fetchWithRetry(url, 1);
};

export const fetchAllPokemonInCollection = async (
  onProgress?: (count: number, total: number) => void
): Promise<PokemonDetails[]> => {
  
  // 1. Try IndexedDB
  const cachedData = await getFromDB(CACHE_KEY);
  if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
    console.log("Loaded from IndexedDB");
    return cachedData;
  }

  // 2. Fetch from API via GraphQL for maximum speed
  console.log("Fetching fresh data via GraphQL...");
  
  const allNames = POKEMON_COLLECTION_NAMES.map(n => normalizePokemonName(n));
  const BATCH_SIZE = 50; 
  const batches: string[][] = [];
  
  for (let i = 0; i < allNames.length; i += BATCH_SIZE) {
    batches.push(allNames.slice(i, i + BATCH_SIZE));
  }

  const results: PokemonDetails[] = [];
  let completedCount = 0;
  
  // Execute in waves
  const CONCURRENCY = 6;

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const currentBatches = batches.slice(i, i + CONCURRENCY);
    const promises = currentBatches.map(batch => fetchPokemonBatchGQL(batch));
    
    // Wait for all batches in this wave to complete
    const batchResults = await Promise.all(promises);
    
    // Aggregate results
    batchResults.flat().forEach(p => results.push(p));
    
    // Update progress
    completedCount += currentBatches.reduce((acc, b) => acc + b.length, 0);
    if (onProgress) {
      onProgress(Math.min(completedCount, allNames.length), allNames.length);
    }
  }

  // 3. Save to IndexedDB
  if (results.length > 0) {
    await saveToDB(CACHE_KEY, results);
  }

  return results;
};