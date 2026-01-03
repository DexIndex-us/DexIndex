import { PokemonListResult, PokemonDetails, PokemonSpecies } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const GQL_ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';
const CACHE_KEY = 'dexindex_pokemon_cache_v6';

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
  
  // Expanded List (Kanto/Johto)
  "Abra", "Aerodactyl", "Alakazam", "Arbok", "Arcanine", "Beedrill", "Bellsprout", "Butterfree", "Caterpie", "Chansey",
  "Clefable", "Clefairy", "Cloyster", "Cubone", "Dewgong", "Diglett", "Ditto", "Dodrio", "Doduo", "Dragonair",
  "Dragonite", "Dratini", "Drowzee", "Dugtrio", "Eevee", "Ekans", "Electabuzz", "Electrode", "Exeggcute", "Exeggutor",
  "Farfetch'd", "Fearow", "Flareon", "Gastly", "Gengar", "Geodude", "Gloom", "Golbat", "Golduck", "Goldeen",
  "Golem", "Graveler", "Grimer", "Growlithe", "Gyarados", "Haunter", "Hitmonchan", "Hitmonlee", "Horsea", "Hypno",
  "Jigglypuff", "Jolteon", "Jynx", "Kabuto", "Kabutops", "Kadabra", "Kakuna", "Kangaskhan", "Kingler", "Koffing",
  "Krabby", "Lapras", "Lickitung", "Machamp", "Machoke", "Machop", "Magikarp", "Magmar", "Magnemite", "Magneton",
  "Mankey", "Marowak", "Meowth", "Metapod", "Mr. Mime", "Muk", "Nidoking", "Nidoqueen", "Nidoran♀", "Nidoran♂",
  "Nidorina", "Nidorino", "Ninetales", "Oddish", "Omanyte", "Omastar", "Onix", "Paras", "Parasect", "Persian",
  "Pidgeot", "Pidgeotto", "Pidgey", "Pidgey", "Pikachu", "Pinsir", "Poliwag", "Poliwhirl", "Poliwrath", "Ponyta", "Porygon",
  "Primeape", "Psyduck", "Raichu", "Rapidash", "Raticate", "Rattata", "Rhydon", "Rhyhorn", "Sandshrew", "Sandslash",
  "Scyther", "Seadra", "Seaking", "Seel", "Shellder", "Slowbro", "Slowpoke", "Snorlax", "Spearow", "Starmie",
  "Staryu", "Tangela", "Tauros", "Tentacool", "Tentacruel", "Vaporeon", "Venomoth", "Venonat", "Victreebel", "Vileplume",
  "Voltorb", "Vulpix", "Weedle", "Weepinbell", "Weezing", "Wigglytuff", "Zubat",
  "Aipom", "Ampharos", "Ariados", "Azumarill", "Bellossom", "Blissey", "Chinchou", "Cleffa", "Corsola", "Crobat",
  "Delibird", "Donphan", "Dunsparce", "Elekid", "Espeon", "Flaaffy", "Forretress", "Furret", "Girafarig", "Gligar",
  "Granbull", "Heracross", "Hitmontop", "Hoothoot", "Hoppip", "Houndoom", "Houndour", "Igglybuff", "Jumpluff", "Kingdra",
  "Lanturn", "Larvitar", "Ledian", "Ledyba", "Magby", "Magcargo", "Mantine", "Mareep", "Marill", "Miltank",
  "Misdreavus", "Murkrow", "Natu", "Noctowl", "Octillery", "Phanpy", "Pichu", "Piloswine", "Pineco", "Politoed",
  "Porygon2", "Pupitar", "Quagsire", "Qwilfish", "Remoraid", "Scizor", "Sentret", "Shuckle", "Skarmory", "Skiploom",
  "Slowking", "Slugma", "Smeargle", "Smoochum", "Sneasel", "Snubbull", "Spinarak", "Stantler", "Steelix", "Sudowoodo",
  "Sunflora", "Sunkern", "Swinub", "Teddiursa", "Togepi", "Togetic", "Tyranitar", "Tyrogue", "Umbreon", "Unown",
  "Ursaring", "Wobbuffet", "Wooper", "Xatu", "Yanma",

  // Gen 3 Collection
  "Absol", "Aggron", "Altaria", "Anorith", "Armaldo", "Aron", "Azurill", "Bagon", "Baltoy", "Banette", "Barboach", "Beautifly", "Beldum", "Breloom", "Cacnea", "Cacturne", "Camerupt", "Carvanha", "Cascoon", "Castform", "Chimecho", "Clamperl", "Claydol", "Corphish", "Cradily", "Crawdaunt", "Delcatty", "Dusclops", "Duskull", "Dustox", "Electrike", "Exploud", "Feebas", "Flygon", "Gardevoir", "Glalie", "Gorebyss", "Grumpig", "Gulpin", "Hariyama", "Huntail", "Illumise", "Kecleon", "Kirlia", "Lairon", "Lileep", "Linoone", "Lombre", "Lotad", "Loudred", "Ludicolo", "Lunatone", "Luvdisc", "Makuhita", "Manectric", "Masquerain", "Mawile", "Medicham", "Meditite", "Metagross", "Metang", "Mightyena", "Milotic", "Minun", "Nincada", "Ninjask", "Nosepass", "Numel", "Nuzleaf", "Pelipper", "Plusle", "Poochyena", "Ralts", "Relicanth", "Roselia", "Sableye", "Salamence", "Sealeo", "Seedot", "Seviper", "Sharpedo", "Shedinja", "Shelgon", "Shiftry", "Shroomish", "Shuppet", "Silcoon", "Skitty", "Slaking", "Slakoth", "Snorunt", "Solrock", "Spheal", "Spinda", "Spoink", "Surskit", "Swablu", "Swalot", "Swellow", "Taillow", "Torkoal", "Trapinch", "Tropius", "Vibrava", "Vigoroth", "Volbeat", "Wailmer", "Wailord", "Walrein", "Whiscash", "Whismur", "Wingull", "Wurmple", "Wynaut", "Zangoose", "Zigzagoon",

  // Gen 4 (Sinnoh)
  "Abomasnow", "Ambipom", "Bastiodon", "Bibarel", "Bidoof", "Bonsly", "Bronzong", "Bronzor", "Budew", "Buizel", "Buneary", "Burmy", "Carnivine", "Chatot", "Cherrim", "Cherubi", "Chingling", "Combee", "Cranidos", "Croagunk", "Drapion", "Drifblim", "Drifloon", "Dusknoir", "Electivire", "Finneon", "Floatzel", "Froslass", "Gabite", "Gallade", "Garchomp", "Gastrodon", "Gible", "Glaceon", "Glameow", "Gliscor", "Happiny", "Hippopotas", "Hippowdon", "Honchkrow", "Kricketot", "Kricketune", "Leafeon", "Lickilicky", "Lopunny", "Lucario", "Lumineon", "Luxio", "Luxray", "Magmortar", "Magnezone", "Mamoswine", "Mantyke", "Mime Jr.", "Mismagius", "Mothim", "Munchlax", "Pachirisu", "Porygon-Z", "Probopass", "Purugly", "Rampardos", "Rhyperior", "Riolu", "Roserade", "Rotom", "Shellos", "Shieldon", "Shinx", "Skorupi", "Skuntank", "Snover", "Spiritomb", "Staraptor", "Staravia", "Starly", "Stunky", "Tangrowth", "Togekiss", "Toxicroak", "Vespiquen", "Weavile", "Wormadam", "Yanmega",

  // Gen 5 (Unova)
  "Accelgor", "Alomomola", "Amoonguss", "Archen", "Archeops", "Audino", "Axew", "Basculin", "Beartic", "Beheeyem", "Bisharp", "Blitzle", "Boldore", "Bouffalant", "Braviary", "Carracosta", "Chandelure", "Cinccino", "Cofagrigus", "Conkeldurr", "Cottonee", "Crustle", "Cryogonal", "Cubchoo", "Darmanitan", "Darumaka", "Deerling", "Deino", "Drilbur", "Druddigon", "Ducklett", "Duosion", "Durant", "Dwebble", "Eelektrik", "Eelektross", "Elgyem", "Emolga", "Escavalier", "Excadrill", "Ferroseed", "Ferrothorn", "Foongus", "Fraxure", "Frillish", "Galvantula", "Garbodor", "Gigalith", "Golett", "Golurk", "Gothita", "Gothitelle", "Gothorita", "Gurdurr", "Haxorus", "Heatmor", "Herdier", "Hydreigon", "Jellicent", "Joltik", "Karrablast", "Klang", "Klink", "Klinklang", "Krokorok", "Krookodile", "Lampent", "Larvesta", "Leavanny", "Liepard", "Lilligant", "Lillipup", "Litwick", "Mandibuzz", "Maractus", "Mienfoo", "Mienshao", "Minccino", "Munna", "Musharna", "Palpitoad", "Panpour", "Pansage", "Pansear", "Patrat", "Pawniard", "Petilil", "Pidove", "Purrloin", "Reuniclus", "Roggenrola", "Rufflet", "Sandile", "Sawk", "Sawsbuck", "Scolipede", "Scraggy", "Scrafty", "Seismitoad", "Sewaddle", "Shelmet", "Sigilyph", "Simipour", "Simisage", "Simisear", "Solosis", "Stoutland", "Stunfisk", "Swadloon", "Swanna", "Swoobat", "Throh", "Timburr", "Tirtouga", "Tranquill", "Trubbish", "Tympole", "Tynamo", "Unfezant", "Vanillish", "Vanillite", "Vanilluxe", "Venipede", "Volcarona", "Vullaby", "Watchog", "Whimsicott", "Whirlipede", "Woobat", "Yamask", "Zebstrika", "Zoroark", "Zorua", "Zweilous"
];

const normalizeName = (name: string): string => {
  let normalized = name.toLowerCase()
    .replace('♀', '-f')
    .replace('♂', '-m')
    .replace("'", '')
    .replace('.', '')
    .replace(' ', '-');
  
  // Specific PokeAPI mapping for base forms that are hyphenated
  if (normalized === 'wormadam') return 'wormadam-plant';
  if (normalized === 'mime-jr') return 'mime-jr';
  if (normalized === 'basculin') return 'basculin-red-striped';
  if (normalized === 'darmanitan') return 'darmanitan-standard';
  return normalized;
};

export const fetchAllPokemonInCollection = async (): Promise<PokemonDetails[]> => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.warn("Cache invalid, re-fetching...");
    }
  }

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
    
    const results: PokemonDetails[] = data.pokemon_v2_pokemon.map((p: any) => ({
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
        ability: { name: a.pokemon_v2_ability?.name || 'unknown', url: '' }
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

    localStorage.setItem(CACHE_KEY, JSON.stringify(results));
    return results;
  } catch (error) {
    console.error("GraphQL fetch failed", error);
    return [];
  }
};

export const fetchPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon species');
  return response.json();
};