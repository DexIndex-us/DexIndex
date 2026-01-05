import { PokemonDetails, PokemonSpecies, EvolutionChainResponse } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'dexindex_pokemon_cache_v30';
const CACHE_PREFIX = 'dexindex_pokemon_cache_';

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

// Helper to normalize names for PokeAPI (matches standard PokeAPI naming conventions)
export const normalizePokemonName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  // Check overrides first
  if (NAME_OVERRIDES[lowerName]) {
    return NAME_OVERRIDES[lowerName];
  }

  return lowerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[♀]/g, '-f')           // Handle Nidoran♀
    .replace(/[♂]/g, '-m')           // Handle Nidoran♂
    .replace(/['.:]/g, '')           // Remove special chars (Farfetch'd, Mr. Mime)
    .replace(/\s+/g, '-');           // Spaces to hyphens
};

// Helper to trim API response to only what we need (Fixes Quota Exceeded Error)
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
    abilities: data.abilities
  };
};

// Internal helper for robust fetching with timeout and race condition protection
const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
  const fetchWithTimeout = async (resource: string, options: any = {}) => {
    const { timeout = 6000 } = options; // 6 second timeout
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Promise race ensures we reject if fetch hangs even if abort signal fails weirdly
      const response = await Promise.race([
        fetch(resource, { ...options, signal: controller.signal }),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout")), timeout)
        )
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
        if (res.status === 404) throw new Error(`404 Not Found: ${url}`);
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, i)));
    }
  }
};

// Fetch a single Pokemon by name or ID
export const fetchPokemonByName = async (nameOrId: string | number): Promise<PokemonDetails | null> => {
  try {
    const normalizedName = typeof nameOrId === 'string' ? normalizePokemonName(nameOrId) : nameOrId;
    const rawData = await fetchWithRetry(`${BASE_URL}/pokemon/${normalizedName}`, 2);
    return transformPokemonData(rawData);
  } catch (error) {
    console.warn(`Error fetching ${nameOrId}:`, error);
    return null;
  }
};

export const fetchEvolutionChain = async (url: string): Promise<EvolutionChainResponse | null> => {
  try {
    return await fetchWithRetry(url, 2);
  } catch (error) {
    console.error("Failed to fetch evolution chain", error);
    return null;
  }
};

export const fetchAbilityDescription = async (url: string): Promise<string> => {
  try {
    const data = await fetchWithRetry(url, 2);
    
    // 1. Try to find English short_effect
    const englishEffect = data.effect_entries?.find((e: any) => e.language.name === 'en');
    if (englishEffect?.short_effect) return englishEffect.short_effect;
    if (englishEffect?.effect) return englishEffect.effect;

    // 2. Fallback to flavor_text
    const flavorEntry = data.flavor_text_entries?.find((e: any) => e.language.name === 'en');
    if (flavorEntry?.flavor_text) {
      return flavorEntry.flavor_text.replace(/\f/g, ' '); 
    }

    return "No description available.";
  } catch (error) {
    console.error("Failed to fetch ability description", error);
    return "Could not load ability details.";
  }
};

// Combined Collection: 
// 1. Starters (Gen 1-9) 
// 2. Gen 1 Additional (A-Z)
// 3. Gen 2 Additional (A-Z)
// 4. Gen 3 Additional (A-Z)
// 5. Gen 4 Additional (A-Z)
// 6. Gen 5 Additional (A-Z)
// 7. Gen 6 Additional (A-Z)
// 8. Gen 7 Additional (A-Z)
// 9. Gen 8 Additional (A-Z)
// 10. Gen 9 Additional (A-Z)
const POKEMON_COLLECTION = [
  // --- STARTERS (0001 - 0081) ---
  // Gen 1
  "Bulbasaur", "Ivysaur", "Venusaur",
  "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise",
  // Gen 2
  "Chikorita", "Bayleef", "Meganium",
  "Cyndaquil", "Quilava", "Typhlosion",
  "Totodile", "Croconaw", "Feraligatr",
  // Gen 3
  "Treecko", "Grovyle", "Sceptile",
  "Torchic", "Combusken", "Blaziken",
  "Mudkip", "Marshtomp", "Swampert",
  // Gen 4
  "Turtwig", "Grotle", "Torterra",
  "Chimchar", "Monferno", "Infernape",
  "Piplup", "Prinplup", "Empoleon",
  // Gen 5
  "Snivy", "Servine", "Serperior",
  "Tepig", "Pignite", "Emboar",
  "Oshawott", "Dewott", "Samurott",
  // Gen 6
  "Chespin", "Quilladin", "Chesnaught",
  "Fennekin", "Braixen", "Delphox",
  "Froakie", "Frogadier", "Greninja",
  // Gen 7
  "Rowlet", "Dartrix", "Decidueye",
  "Litten", "Torracat", "Incineroar",
  "Popplio", "Brionne", "Primarina",
  // Gen 8
  "Grookey", "Thwackey", "Rillaboom",
  "Scorbunny", "Raboot", "Cinderace",
  "Sobble", "Drizzile", "Inteleon",
  // Gen 9
  "Sprigatito", "Floragato", "Meowscarada",
  "Fuecoco", "Crocalor", "Skeledirge",
  "Quaxly", "Quaxwell", "Quaquaval",

  // --- GEN 1 ADDITIONAL (0082 - 0217) ---
  "Abra", "Aerodactyl", "Alakazam", "Arbok", "Arcanine", 
  "Beedrill", "Bellsprout", "Butterfree", 
  "Caterpie", "Chansey", "Clefable", "Clefairy", "Cloyster", "Cubone", 
  "Dewgong", "Diglett", "Ditto", "Dodrio", "Doduo", "Dragonair", "Dragonite", "Dratini", "Drowzee", "Dugtrio", 
  "Eevee", "Ekans", "Electabuzz", "Electrode", "Exeggcute", "Exeggutor", 
  "Farfetch'd", "Fearow", "Flareon", 
  "Gastly", "Gengar", "Geodude", "Gloom", "Golbat", "Golduck", "Goldeen", "Golem", "Graveler", "Grimer", "Growlithe", "Gyarados", 
  "Haunter", "Hitmonchan", "Hitmonlee", "Horsea", "Hypno", 
  "Jigglypuff", "Jolteon", "Jynx", 
  "Kabuto", "Kabutops", "Kadabra", "Kakuna", "Kangaskhan", "Kingler", "Koffing", "Krabby", 
  "Lapras", "Lickitung", 
  "Machamp", "Machoke", "Machop", "Magikarp", "Magmar", "Magnemite", "Magneton", "Mankey", "Marowak", "Meowth", "Metapod", "Mr. Mime", "Muk", 
  "Nidoking", "Nidoqueen", "Nidoran♀", "Nidoran♂", "Nidorina", "Nidorino", "Ninetales", 
  "Oddish", "Omanyte", "Omastar", "Onix", 
  "Paras", "Parasect", "Persian", "Pidgeot", "Pidgeotto", "Pidgey", "Pikachu", "Pinsir", "Poliwag", "Poliwhirl", "Poliwrath", "Ponyta", "Porygon", "Primeape", "Psyduck", 
  "Raichu", "Rapidash", "Raticate", "Rattata", "Rhydon", "Rhyhorn", 
  "Sandshrew", "Sandslash", "Scyther", "Seadra", "Seaking", "Seel", "Shellder", "Slowbro", "Slowpoke", "Snorlax", "Spearow", "Starmie", "Staryu", 
  "Tangela", "Tauros", "Tentacool", "Tentacruel", 
  "Vaporeon", "Venomoth", "Venonat", "Victreebel", "Vileplume", "Voltorb", "Vulpix", 
  "Weedle", "Weepinbell", "Weezing", "Wigglytuff", 
  "Zubat",

  // --- GEN 2 ADDITIONAL (0218 - 0302) ---
  "Aipom", "Ampharos", "Ariados", "Azumarill", 
  "Bellossom", "Blissey", 
  "Chinchou", "Cleffa", "Corsola", "Crobat", 
  "Delibird", "Donphan", "Dunsparce", 
  "Elekid", "Espeon", 
  "Flaaffy", "Forretress", "Furret", 
  "Girafarig", "Gligar", "Granbull", 
  "Heracross", "Hitmontop", "Hoothoot", "Hoppip", "Houndoom", "Houndour", 
  "Igglybuff", "Jumpluff", 
  "Kingdra", 
  "Lanturn", "Larvitar", "Ledian", "Ledyba", 
  "Magby", "Magcargo", "Mantine", "Mareep", "Marill", "Miltank", "Misdreavus", "Murkrow", 
  "Natu", "Noctowl", 
  "Octillery", 
  "Phanpy", "Pichu", "Piloswine", "Pineco", "Politoed", "Porygon2", "Pupitar", 
  "Quagsire", "Qwilfish", 
  "Remoraid", 
  "Scizor", "Sentret", "Shuckle", "Skarmory", "Skiploom", "Slowking", "Slugma", "Smeargle", "Smoochum", "Sneasel", "Snubbull", "Spinarak", "Stantler", "Steelix", "Sudowoodo", "Sunflora", "Sunkern", "Swinub", 
  "Teddiursa", "Togepi", "Togetic", "Tyranitar", "Tyrogue", 
  "Umbreon", "Unown", "Ursaring", 
  "Wobbuffet", "Wooper", 
  "Xatu", 
  "Yanma",

  // --- GEN 3 ADDITIONAL (0303 - 0435) ---
  "Absol", "Aggron", "Altaria", "Anorith", "Armaldo", "Aron", "Azurill",
  "Bagon", "Baltoy", "Banette", "Barboach", "Beautifly", "Beldum", "Breloom",
  "Cacnea", "Cacturne", "Camerupt", "Carvanha", "Cascoon", "Castform", "Chimecho", "Clamperl", "Claydol", "Corphish", "Cradily", "Crawdaunt",
  "Delcatty", "Dusclops", "Duskull", "Dustox",
  "Electrike", "Exploud",
  "Feebas", "Flygon",
  "Gardevoir", "Glalie", "Gorebyss", "Grumpig", "Gulpin",
  "Hariyama", "Huntail",
  "Illumise",
  "Kecleon", "Kirlia",
  "Lairon", "Lileep", "Linoone", "Lombre", "Lotad", "Loudred", "Ludicolo", "Lunatone", "Luvdisc",
  "Makuhita", "Manectric", "Masquerain", "Mawile", "Medicham", "Meditite", "Metagross", "Metang", "Mightyena", "Milotic", "Minun",
  "Nincada", "Ninjask", "Nosepass", "Numel", "Nuzleaf",
  "Pelipper", "Plusle", "Poochyena",
  "Ralts", "Relicanth", "Roselia",
  "Sableye", "Salamence", "Sealeo", "Seedot", "Seviper", "Sharpedo", "Shedinja", "Shelgon", "Shiftry", "Shroomish", "Shuppet", "Silcoon", "Skitty", "Slaking", "Slakoth", "Snorunt", "Solrock", "Spheal", "Spinda", "Spoink", "Surskit", "Swablu", "Swalot", "Swellow",
  "Taillow", "Torkoal", "Trapinch", "Tropius",
  "Vibrava", "Vigoroth", "Volbeat",
  "Wailmer", "Wailord", "Walrein", "Whiscash", "Whismur", "Wingull", "Wurmple", "Wynaut",
  "Zangoose", "Zigzagoon",

  // --- GEN 4 ADDITIONAL (0436 - 0493) ---
  "Abomasnow", "Ambipom", 
  "Bastiodon", "Bibarel", "Bidoof", "Bonsly", "Bronzong", "Bronzor", "Budew", "Buizel", "Buneary", "Burmy",
  "Carnivine", "Chatot", "Cherrim", "Cherubi", "Chingling", "Combee", "Cranidos", "Croagunk",
  "Drapion", "Drifblim", "Drifloon", "Dusknoir",
  "Electivire",
  "Finneon", "Floatzel", "Froslass",
  "Gabite", "Gallade", "Garchomp", "Gastrodon", "Gible", "Glaceon", "Glameow", "Gliscor",
  "Happiny", "Hippopotas", "Hippowdon", "Honchkrow",
  "Kricketot", "Kricketune",
  "Leafeon", "Lickilicky", "Lopunny", "Lucario", "Lumineon", "Luxio", "Luxray",
  "Magmortar", "Magnezone", "Mamoswine", "Mantyke", "Mime Jr.", "Mismagius", "Mothim", "Munchlax",
  "Pachirisu", "Porygon-Z", "Probopass", "Purugly",
  "Rampardos", "Rhyperior", "Riolu", "Roserade", "Rotom",
  "Shellos", "Shieldon", "Shinx", "Skorupi", "Skuntank", "Snover", "Spiritomb", "Staraptor", "Staravia", "Starly", "Stunky",
  "Tangrowth", "Togekiss", "Toxicroak",
  "Vespiquen",
  "Weavile", "Wormadam",
  "Yanmega",

  // --- GEN 5 ADDITIONAL (0494 - 0637) ---
  "Accelgor", "Alomomola", "Amoonguss", "Archen", "Archeops", "Audino", "Axew",
  "Basculin", "Beartic", "Beheeyem", "Bisharp", "Blitzle", "Boldore", "Bouffalant", "Braviary",
  "Carracosta", "Chandelure", "Cinccino", "Cofagrigus", "Conkeldurr", "Cottonee", "Crustle", "Cryogonal", "Cubchoo",
  "Darmanitan", "Darumaka", "Deerling", "Deino", "Drilbur", "Druddigon", "Ducklett", "Duosion", "Durant", "Dwebble",
  "Eelektrik", "Eelektross", "Elgyem", "Emolga", "Escavalier", "Excadrill",
  "Ferroseed", "Ferrothorn", "Foongus", "Fraxure", "Frillish",
  "Galvantula", "Garbodor", "Gigalith", "Golett", "Golurk", "Gothita", "Gothitelle", "Gothorita", "Gurdurr",
  "Haxorus", "Heatmor", "Herdier", "Hydreigon",
  "Jellicent", "Joltik",
  "Karrablast", "Klang", "Klink", "Klinklang", "Krokorok", "Krookodile",
  "Lampent", "Larvesta", "Leavanny", "Liepard", "Lilligant", "Lillipup", "Litwick",
  "Mandibuzz", "Maractus", "Mienfoo", "Mienshao", "Minccino", "Munna", "Musharna",
  "Palpitoad", "Panpour", "Pansage", "Pansear", "Patrat", "Pawniard", "Petilil", "Pidove", "Purrloin",
  "Reuniclus", "Roggenrola", "Rufflet",
  "Sandile", "Sawk", "Sawsbuck", "Scolipede", "Scraggy", "Scrafty", "Seismitoad", "Sewaddle", "Shelmet", "Sigilyph", "Simipour", "Simisage", "Simisear", "Solosis", "Stoutland", "Stunfisk", "Swadloon", "Swanna", "Swoobat",
  "Throh", "Timburr", "Tirtouga", "Tranquill", "Trubbish", "Tympole", "Tynamo",
  "Unfezant",
  "Vanillish", "Vanillite", "Vanilluxe", "Venipede", "Volcarona", "Vullaby",
  "Watchog", "Whimsicott", "Whirlipede", "Woobat",
  "Yamask",
  "Zebstrika", "Zoroark", "Zorua", "Zweilous",

  // --- GEN 6 ADDITIONAL (0638+) ---
  "Aegislash", "Amaura", "Aromatisse", "Aurorus", "Avalugg", 
  "Barbaracle", "Bergmite", "Binacle", "Bunnelby", 
  "Carbink", "Clauncher", "Clawitzer", 
  "Dedenne", "Diggersby", "Doublade", "Dragalge", 
  "Espurr", 
  "Flabébé", "Fletchinder", "Fletchling", "Floette", "Florges", "Furfrou", 
  "Gogoat", "Goodra", "Goomy", "Gourgeist", 
  "Hawlucha", "Heliolisk", "Helioptile", "Honedge", 
  "Inkay", 
  "Klefki", 
  "Litleo", 
  "Malamar", "Meowstic", 
  "Noibat", "Noivern", 
  "Pancham", "Pangoro", "Phantump", "Pumpkaboo", "Pyroar", 
  "Scatterbug", "Skiddo", "Skrelp", "Sliggoo", "Slurpuff", "Spewpa", "Spritzee", "Swirlix", "Sylveon", 
  "Talonflame", "Trevenant", "Tyrantrum", "Tyrunt", 
  "Vivillon",

  // --- GEN 7 ADDITIONAL ---
  "Araquanid", "Bewear", "Bounsweet", "Bruxish", 
  "Charjabug", "Comfey", "Crabominable", "Crabrawler", "Cutiefly", 
  "Dewpider", "Dhelmise", "Drampa", 
  "Fomantis", 
  "Golisopod", "Grubbin", "Gumshoos", 
  "Hakamo-o", 
  "Jangmo-o", 
  "Komala", "Kommo-o", 
  "Lurantis", "Lycanroc", 
  "Mareanie", "Mimikyu", "Minior", "Morelull", "Mudbray", "Mudsdale", 
  "Oranguru", "Oricorio", 
  "Palossand", "Passimian", "Pikipek", "Pyukumuku", 
  "Ribombee", "Rockruff", 
  "Salandit", "Salazzle", "Sandygast", "Shiinotic", "Steenee", "Stufful", 
  "Togedemaru", "Toucannon", "Toxapex", "Trumbeak", "Tsareena", "Turtonator", 
  "Vikavolt", 
  "Wimpod", "Wishiwashi", 
  "Yungoos",

  // --- GEN 8 ADDITIONAL ---
  "Alcremie", "Appletun", "Applin", "Arctovish", "Arctozolt", "Arrokuda", 
  "Barraskewda", "Basculegion", "Blipbug", "Boltund", 
  "Carkol", "Centiskorch", "Chewtle", "Clobbopus", "Coalossal", "Copperajah", "Corviknight", "Corvisquire", "Cramorant", "Cufant", "Cursola", 
  "Dottler", "Dracovish", "Dracozolt", "Dragapult", "Drakloak", "Drednaw", "Dreepy", "Dubwool", "Duraludon", 
  "Eiscue", "Eldegoss", 
  "Falinks", "Flapple", "Frosmoth", 
  "Gossifleur", "Grapploct", "Greedent", "Grimmsnarl", 
  "Hatenna", "Hatterene", "Hattrem", 
  "Impidimp", "Indeedee", 
  "Kleavor", 
  "Milcery", "Morgrem", "Morpeko", "Mr. Rime", 
  "Nickit", 
  "Obstagoon", "Orbeetle", "Overqwil", 
  "Perrserker", "Pincurchin", "Polteageist", 
  "Rolycoly", "Rookidee", "Runerigus", 
  "Sandaconda", "Silicobra", "Sinistea", "Sirfetch'd", "Sizzlipede", "Skwovet", "Sneasler", "Snom", "Stonjourner", 
  "Thievul", "Toxel", "Toxtricity", 
  "Ursaluna", 
  "Wooloo", "Wyrdeer", 
  "Yamper",

  // --- GEN 9 ADDITIONAL ---
  "Annihilape", "Archaludon", "Arboliva", "Arctibax", "Armarouge", 
  "Baxcalibur", "Bellibolt", "Bombirdier", "Brambleghast", "Bramblin", 
  "Capsakid", "Ceruledge", "Cetitan", "Cetoddle", "Charcadet", "Clodsire", "Cyclizar", 
  "Dachsbun", "Dipplin", "Dolliv", "Dondozo", "Dudunsparce", 
  "Espathra", 
  "Farigiraf", "Fidough", "Finizen", "Flamigo", "Flittle", "Frigibax", 
  "Garganacl", "Gholdengo", "Gimmighoul", "Glimmet", "Glimmora", "Grafaiai", "Greavard", 
  "Houndstone", "Hydrapple", 
  "Kilowattrel", "Kingambit", "Klawf", 
  "Lechonk", "Lokix", 
  "Mabosstiff", "Maschiff", "Maushold", 
  "Nacli", "Naclstack", "Nymble", 
  "Oinkologne", "Orthworm", 
  "Palafin", "Pawmi", "Pawmo", "Pawmot", "Poltchageist", 
  "Rabsca", "Rellor", "Revavroom", 
  "Scovillain", "Shroodle", "Sinistcha", "Smoliv", "Spidops", "Squawkabilly", 
  "Tadbulb", "Tandemaus", "Tarountula", "Tatsugiri", "Tinkatink", "Tinkaton", "Tinkatuff", "Toedscool", "Toedscruel", 
  "Varoom", "Veluza", 
  "Wattrel", "Wiglett", "Wugtrio"
];

export const POKEMON_COLLECTION_NAMES = POKEMON_COLLECTION;

// NEW: ID Mapping for custom numbering
const CUSTOM_ID_MAP = new Map<string, number>();

// Initialize map immediately
POKEMON_COLLECTION_NAMES.forEach((name, index) => {
  const normalized = normalizePokemonName(name);
  const customId = index + 1;
  CUSTOM_ID_MAP.set(normalized, customId);
  // Also map the original name lowercased just in case
  CUSTOM_ID_MAP.set(name.toLowerCase(), customId);
});

export const getPokemonCustomId = (name: string): number | undefined => {
  const n = normalizePokemonName(name);
  return CUSTOM_ID_MAP.get(n) || CUSTOM_ID_MAP.get(name.toLowerCase());
};

export const fetchPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
  return await fetchWithRetry(`${BASE_URL}/pokemon-species/${id}`, 1);
};

const cleanupOldCaches = () => {
  try {
    // Loop backwards to safely remove items without affecting the index of remaining items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      // Clean up any cache that starts with prefix but isn't current
      if (key && key.startsWith(CACHE_PREFIX) && key !== CACHE_KEY) {
        console.log(`Upgrading cache: Removing old version ${key}`);
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn("Failed to cleanup cache", e);
  }
};

export const fetchAllPokemonInCollection = async (onIntermediate?: (data: PokemonDetails[]) => void): Promise<PokemonDetails[]> => {
  // 1. Cleanup old caches to free up space
  cleanupOldCaches();

  // 2. Check current Local Storage Cache
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("Loaded from cache");
        if (onIntermediate) onIntermediate(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Invalid cache, removing...", e);
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // 3. Fetch from API with Sliding Window Concurrency
  // This is much smoother than strict batching. It always keeps X requests active.
  console.log("Fetching fresh data...");
  
  const results: (PokemonDetails | null)[] = new Array(POKEMON_COLLECTION_NAMES.length).fill(null);
  let nextIndex = 0;
  let completedCount = 0;
  
  // Concurrency Limit: 24 is safe for browsers and very fast.
  const CONCURRENCY_LIMIT = 24;
  // Update UI every 5 items for smooth "bit-by-bit" feel
  const UPDATE_THRESHOLD = 5;

  const worker = async () => {
    while (nextIndex < POKEMON_COLLECTION_NAMES.length) {
      // Atomic increment
      const i = nextIndex++;
      
      // Bounds check
      if (i >= POKEMON_COLLECTION_NAMES.length) break;
      
      const name = POKEMON_COLLECTION_NAMES[i];
      try {
        results[i] = await fetchPokemonByName(name);
      } catch (error) {
        console.error(`Error fetching ${name}`, error);
        results[i] = null;
      }

      completedCount++;
      
      // Smooth Progressive Update
      if (onIntermediate && completedCount % UPDATE_THRESHOLD === 0) {
        const currentValid = results.filter((p): p is PokemonDetails => p !== null);
        onIntermediate(currentValid);
      }
    }
  };

  // Launch workers
  const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
  await Promise.all(workers);

  const validResults = results.filter((p): p is PokemonDetails => p !== null);

  // 4. Save to Cache with Error Handling for Quota
  try {
    if (validResults.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validResults));
    }
  } catch (e: any) {
    // Specifically handle QuotaExceededError
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn("LocalStorage quota exceeded. Clearing all app caches and retrying...");
      try {
        localStorage.clear(); // Nuclear option for the app's scope
        localStorage.setItem(CACHE_KEY, JSON.stringify(validResults));
        console.log("Saved to cache after clear.");
      } catch (retryError) {
        console.error("Still cannot save to cache after clear. App will function without persistence.", retryError);
      }
    } else {
      console.error("Failed to save to cache", e);
    }
  }

  return validResults;
};