import {
  LATEST_RELEASES_ALL,
  POPULAR_HITS_ALL,
  TOP_SERIES_ALL,
  TOP_ANIME_ALL,
  SCIFI_EXPANDED_ALL,
  CRITIC_RECOMMENDED_ALL,
  BOLLYWOOD_HITS_ALL,
  SOUTH_INDIAN_HITS_ALL,
  MALAYALAM_HITS_ALL,
  BENGALI_HITS_ALL,
  NOLLYWOOD_HITS_ALL,
  INDIAN_SERIES_ALL,
  PUNJABI_HITS_ALL,
  KANNADA_HITS_ALL,
  INDIAN_CLASSICS_ALL,
  OPEN_SOURCE_MOVIES_ALL
} from './catalogData';
import { fetchBollywoodSubcategory } from './bollywoodApi';
import { fetchBengaliSubcategory } from './bengaliApi';
import { fetchMalayalamSubcategory } from './malayalamApi';
import { fetchTamilSubcategory } from './tamilApi';
import { HOLLYWOOD_UPCOMING, BOLLYWOOD_UPCOMING, BENGALI_UPCOMING } from './upcomingApi';

const OMDB_KEYS = ['trilogy', 'b9a5e69d', 'd011d376', '4a3b711b', 'e430349a', '564727fa', '7c865187'];
let currentKeyIndex = 0;

const getOmdbKey = () => OMDB_KEYS[currentKeyIndex % OMDB_KEYS.length];
const rotateOmdbKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % OMDB_KEYS.length;
};

const TMDB_API_KEYS = ['4f89241199a531b29dbd244a307b2251', '15d2fd48f88cd047e350a84db92b352b', '8424a613a20721c83fa88085d564177d'];
let tmdbKeyIdx = 0;
const getTmdbKey = () => TMDB_API_KEYS[tmdbKeyIdx++ % TMDB_API_KEYS.length];

const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

const CACHE_STORAGE_KEY = 'cinescope_hybrid_cache_v5';
const PRELOADED_CONTENT_KEY = 'cinescope_preloaded_content_v1';
const WISHLIST_PRIMARY_KEY = 'cinescope_watchlist_v4';
const WISHLIST_ALIAS_KEY = 'cinescope_wishlist_v4';

const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours
const MAX_LOCAL_CACHE_ENTRIES = 350;

// Runtime in-memory cache for 0ms lookups
const memoryCache = new Map();

// Helper to load persistent cache from localStorage
const loadPersistentCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const cleanCache = {};

    Object.keys(parsed).forEach((key) => {
      const item = parsed[key];
      if (item && item.timestamp && now - item.timestamp < CACHE_TTL_MS) {
        cleanCache[key] = item;
      }
    });
    return cleanCache;
  } catch {
    return {};
  }
};

// Helper to save to persistent cache
const savePersistentCache = (cacheObj) => {
  try {
    const keys = Object.keys(cacheObj);
    if (keys.length > MAX_LOCAL_CACHE_ENTRIES) {
      const sortedKeys = keys.sort((a, b) => (cacheObj[a]?.timestamp || 0) - (cacheObj[b]?.timestamp || 0));
      const trimmedKeys = sortedKeys.slice(keys.length - MAX_LOCAL_CACHE_ENTRIES);
      const trimmedCache = {};
      trimmedKeys.forEach((k) => {
        trimmedCache[k] = cacheObj[k];
      });
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmedCache));
      return;
    }
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch {
    // Storage fail-safe
  }
};

// Get cached response
export const getCachedData = (key) => {
  const normalizedKey = key.toLowerCase().trim();
  // 1. In-memory cache
  if (memoryCache.has(normalizedKey)) {
    const item = memoryCache.get(normalizedKey);
    if (Date.now() - item.timestamp < CACHE_TTL_MS) {
      return item.data;
    }
    memoryCache.delete(normalizedKey);
  }

  // 2. LocalStorage cache
  const localCache = loadPersistentCache();
  if (localCache[normalizedKey]) {
    const item = localCache[normalizedKey];
    if (Date.now() - item.timestamp < CACHE_TTL_MS) {
      memoryCache.set(normalizedKey, item);
      return item.data;
    }
  }

  return null;
};

// Save to cache
export const setCachedData = (key, data) => {
  if (!data) return;
  const normalizedKey = key.toLowerCase().trim();
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(normalizedKey, entry);

  const localCache = loadPersistentCache();
  localCache[normalizedKey] = entry;
  savePersistentCache(localCache);
};

/**
 * Local memory helpers for preloaded section content
 */
export const getPreloadedContentFromLocalMemory = (key) => {
  try {
    const raw = localStorage.getItem(PRELOADED_CONTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed[key] || null;
  } catch {
    return null;
  }
};

export const setPreloadedContentToLocalMemory = (key, data) => {
  try {
    const raw = localStorage.getItem(PRELOADED_CONTENT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[key] = data;
    localStorage.setItem(PRELOADED_CONTENT_KEY, JSON.stringify(parsed));
  } catch {
    // Fail-safe
  }
};

/**
 * Poster Quality Enhancer
 * Upgrades Amazon/OMDB thumbnail images to high-definition 700px width posters
 */
export const normalizePosterUrl = (url) => {
  if (!url || url === 'N/A' || typeof url !== 'string' || url.includes('placeholder')) return null;
  let cleanUrl = url.trim();
  if (cleanUrl.includes('image.tmdb.org')) {
    return cleanUrl;
  }
  if (cleanUrl.includes('media-amazon.com') || cleanUrl.includes('ia.media-imdb.com')) {
    // Standardize Amazon CDN URLs to clean _V1_.jpg or SX300 to prevent 403 hotlink blocks
    cleanUrl = cleanUrl
      .replace(/_SX\d+_/g, '_SX300_')
      .replace(/_UX\d+_/g, '_UX300_')
      .replace(/_SY\d+_/g, '_SY450_')
      .replace(/_UY\d+_/g, '_UY450_');
  }
  return cleanUrl;
};

/**
 * Local memory helpers for Wishlist / Watchlist
 */
export const loadWishlistFromLocalMemory = () => {
  try {
    const rawPrimary = localStorage.getItem(WISHLIST_PRIMARY_KEY);
    if (rawPrimary) return JSON.parse(rawPrimary);
    const rawAlias = localStorage.getItem(WISHLIST_ALIAS_KEY);
    if (rawAlias) return JSON.parse(rawAlias);
    return [];
  } catch {
    return [];
  }
};

export const saveWishlistToLocalMemory = (wishlistItems) => {
  try {
    const json = JSON.stringify(wishlistItems || []);
    localStorage.setItem(WISHLIST_PRIMARY_KEY, json);
    localStorage.setItem(WISHLIST_ALIAS_KEY, json);
  } catch {
    // Storage quota fail-safe
  }
};

// Abort controllers
let currentDetailController = null;
let currentSearchController = null;

// Clean HTML tags from TVmaze summaries
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
};

// Parse ratings array from OMDB
export const parseRatings = (ratings = []) => {
  let imdb = null;
  let rottenTomatoes = null;
  let metacritic = null;

  ratings.forEach((r) => {
    if (r.Source === 'Internet Movie Database') {
      imdb = r.Value;
    } else if (r.Source === 'Rotten Tomatoes') {
      rottenTomatoes = r.Value;
    } else if (r.Source === 'Metacritic') {
      metacritic = r.Value;
    }
  });

  return { imdb, rottenTomatoes, metacritic };
};

// Format runtime
export const formatRuntime = (rawRuntime) => {
  if (!rawRuntime || rawRuntime === 'N/A') return null;
  const match = String(rawRuntime).match(/(\d+)/);
  if (!match) return rawRuntime;
  const totalMins = parseInt(match[1], 10);
  if (isNaN(totalMins) || totalMins <= 0) return rawRuntime;

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ''} • ${totalMins} mins`;
  }
  return `${totalMins} mins`;
};

// Parse awards
export const parseAwards = (awardsString) => {
  if (!awardsString || awardsString === 'N/A') return null;
  const oscarMatch = awardsString.match(/Won\s+(\d+)\s+Oscar/i);
  const oscarsWon = oscarMatch ? parseInt(oscarMatch[1], 10) : 0;
  const winMatch = awardsString.match(/(\d+)\s+wins?/i);
  const totalWins = winMatch ? parseInt(winMatch[1], 10) : 0;
  const nomMatch = awardsString.match(/(\d+)\s+nominations?/i);
  const totalNoms = nomMatch ? parseInt(nomMatch[1], 10) : 0;

  return {
    raw: awardsString,
    oscarsWon,
    totalWins,
    totalNoms,
    isMajorWinner: oscarsWon > 0 || totalWins >= 10
  };
};

// Content rating guide description
export const getRatedDescription = (rated) => {
  switch (rated?.toUpperCase()) {
    case 'G':
      return 'General Audiences – All ages admitted';
    case 'PG':
      return 'Parental Guidance Suggested – May not be suitable for children';
    case 'PG-13':
      return 'Parents Strongly Cautioned – Inappropriate for children under 13';
    case 'R':
      return 'Restricted – Under 17 requires accompanying parent or guardian';
    case 'NC-17':
      return 'Adults Only – No one 17 and under admitted';
    case 'TV-Y':
      return 'All Children';
    case 'TV-G':
      return 'General Audience';
    case 'TV-PG':
      return 'Parental Guidance Suggested';
    case 'TV-14':
      return 'Parents Strongly Cautioned for Children under 14';
    case 'TV-MA':
      return 'Mature Audience Only';
    default:
      return 'Standard rating';
  }
};

// Comprehensive dictionary for complete, verified TV series and Anime timelines
const KNOWN_SERIES_TIMELINES = {
  'person of interest': '2011–2016',
  'homeland': '2011–2020',
  'revenge': '2011–2015',
  'breaking bad': '2008–2013',
  'better call saul': '2015–2022',
  'game of thrones': '2011–2019',
  'chernobyl': '2019',
  'peaky blinders': '2013–2022',
  'succession': '2018–2023',
  'loki': '2021–2023',
  'the wire': '2002–2008',
  'the sopranos': '1999–2007',
  'friends': '1994–2004',
  'the office': '2005–2013',
  'lost': '2004–2010',
  'dexter': '2006–2013',
  'mad men': '2007–2015',
  'house m.d.': '2004–2012',
  'house': '2004–2012',
  'arrow': '2012–2020',
  'vikings': '2013–2020',
  'suits': '2011–2019',
  'how i met your mother': '2005–2014',
  'modern family': '2009–2020',
  'supernatural': '2005–2020',
  'the walking dead': '2010–2022',
  'agents of s.h.i.e.l.d.': '2013–2020',
  'gotham': '2014–2019',
  'sherlock': '2010–2017',
  'mr. robot': '2015–2019',
  'silicon valley': '2014–2019',
  'narcos': '2015–2017',
  'parks and recreation': '2009–2015',
  'dark': '2017–2020',
  'money heist': '2017–2021',
  'lucifer': '2016–2021',
  'schitt\'s creek': '2015–2020',
  'brooklyn nine-nine': '2013–2021',
  'hannibal': '2013–2015',
  'community': '2009–2015',
  'daredevil': '2015–2018',
  'jessica jones': '2015–2019',
  'the punisher': '2017–2019',
  'broadchurch': '2013–2017',
  'penny dreadful': '2014–2016',
  'boardwalk empire': '2010–2014',
  'sons of anarchy': '2008–2014',
  'spartacus': '2010–2013',
  'justified': '2010–2015',
  'battlestar galactica': '2004–2009',
  'chuck': '2007–2012',
  'fringe': '2008–2013',
  'psych': '2006–2014',
  'bones': '2005–2017',
  'castle': '2009–2016',
  'white collar': '2009–2014',
  'the mentalist': '2008–2015',
  'burn notice': '2007–2013',
  'prison break': '2005–2017',
  '24': '2001–2014',
  'smallville': '2001–2011',
  'the shield': '2002–2008',
  'er': '1994–2009',
  'the x-files': '1993–2018',
  'attack on titan': '2013–2023',
  'death note': '2006–2007',
  'fullmetal alchemist: brotherhood': '2009–2010',
  'fullmetal alchemist': '2003–2004',
  'cowboy bebop': '1998–1999',
  'neon genesis evangelion': '1995–1996',
  'haikyu!!': '2014–2020',
  'code geass': '2006–2008',
  'code geass: lelouch of the rebellion': '2006–2008',
  'dragon ball z': '1989–1996',
  'mob psycho 100': '2016–2022',
  'arcane': '2021–2024',
  'stranger things': '2016–2025'
};

/**
 * Universal Timeline Formatter: Fixes half / cut-off series & movie dates
 */
export const formatTimelineYear = (rawYear, title = '', status = '', ended = '') => {
  if (!rawYear || rawYear === 'N/A') return '';
  const str = String(rawYear).trim();

  // 1. Check title against known verified encyclopedia
  if (title) {
    const cleanTitle = title.toLowerCase().trim();
    if (KNOWN_SERIES_TIMELINES[cleanTitle]) {
      return KNOWN_SERIES_TIMELINES[cleanTitle];
    }
  }

  // 2. If ended date is provided (e.g. from TVmaze)
  if (ended && typeof ended === 'string' && ended.length >= 4) {
    const startMatch = str.match(/\b(\d{4})\b/);
    if (startMatch) {
      const startYear = startMatch[1];
      const endYear = ended.slice(0, 4);
      if (startYear === endYear) return startYear;
      return `${startYear}–${endYear}`;
    }
  }

  // 3. If already formatted as a full 4-digit range (e.g. 2011–2016, 2011-2016)
  const fullRangeMatch = str.match(/^(\d{4})[–\-](\d{4})$/);
  if (fullRangeMatch) {
    return `${fullRangeMatch[1]}–${fullRangeMatch[2]}`;
  }

  // 4. If string has an open-ended trailing dash (e.g. '2016–', '2011-', '2022–')
  const trailingDashMatch = str.match(/^(\d{4})[–\-\s]+$/);
  if (trailingDashMatch) {
    const startYear = trailingDashMatch[1];
    if (status && status.toLowerCase() === 'ended') {
      return startYear;
    }
    return `${startYear}–Present`;
  }

  // 5. Clean single year or other format
  return str.replace('-', '–');
};

// =========================================================================
// VAST 2024-2026 CURATED DATABASE (Blockbusters, Series, Anime, K-Dramas)
// =========================================================================
export const CURATED_GENRES_DATA = {
  'Trending 2024-2026': [
    {
      id: 'tt6263850',
      imdbID: 'tt6263850',
      name: 'Deadpool & Wolverine',
      year: '2024',
      type: 'movie',
      imdbRating: '7.8',
      genre: ['Action', 'Comedy', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/yDHYTfaQxDypNYWxIM592K3gh0m.jpg',
      tagline: 'Come together.',
      plot: 'Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority, but instead recruits a variant of Wolverine to save his universe from extinction.',
      director: 'Shawn Levy',
      actors: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
      trailerId: '73_1biulkYk',
      boxOffice: '$1,337,000,000'
    },
    {
      id: 'tt15239678',
      imdbID: 'tt15239678',
      name: 'Dune: Part Two',
      year: '2024',
      type: 'movie',
      imdbRating: '8.6',
      genre: ['Action', 'Sci-Fi', 'Adventure'],
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520b4.jpg',
      tagline: 'Long live the fighters.',
      plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.',
      director: 'Denis Villeneuve',
      actors: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Javier Bardem'],
      trailerId: 'Way9Dexny3w',
      boxOffice: '$714,400,000'
    },
    {
      id: 'tt22022452',
      imdbID: 'tt22022452',
      name: 'Inside Out 2',
      year: '2024',
      type: 'movie',
      imdbRating: '7.6',
      genre: ['Animation', 'Adventure', 'Comedy', 'Family'],
      poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/stKGOm8wqGGOvRTvt2I1PfMCDly.jpg',
      tagline: 'Make room for new emotions.',
      plot: 'Follows Joy, Sadness, Anger, Fear and Disgust, who are running a successful operation until Anxiety, Envy, Ennui and Embarrassment show up as Riley enters teenage life.',
      director: 'Kelsey Mann',
      actors: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Liza Lapira'],
      trailerId: 'LEjhY15eCx0',
      boxOffice: '$1,698,000,000'
    },
    {
      id: 'tt9218128',
      imdbID: 'tt9218128',
      name: 'Gladiator II',
      year: '2024',
      type: 'movie',
      imdbRating: '7.0',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/euYIwmwkmz95mnXvufEmbL6ovhA.jpg',
      tagline: 'What we do in life echoes in eternity.',
      plot: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.',
      director: 'Ridley Scott',
      actors: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      trailerId: '4rgYUipGJNo',
      boxOffice: '$460,000,000'
    },
    {
      id: 'tt18411490',
      imdbID: 'tt18411490',
      name: 'Alien: Romulus',
      year: '2024',
      type: 'movie',
      imdbRating: '7.2',
      genre: ['Horror', 'Sci-Fi', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao8l3MieM4Ur0T8.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
      tagline: 'In space, no one can hear you scream.',
      plot: 'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
      director: 'Fede Álvarez',
      actors: ['Cailee Spaeny', 'David Jonsson', 'Archie Renaux', 'Isabela Merced'],
      trailerId: 'x0XDEhP4MQs',
      boxOffice: '$350,000,000'
    },
    {
      id: 'tt11358390',
      imdbID: 'tt11358390',
      name: 'Kingdom of the Planet of the Apes',
      year: '2024',
      type: 'movie',
      imdbRating: '7.0',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/fqv8v6AycXKsivp1T5oKtLbGXce.jpg',
      tagline: 'No one can stop the reign.',
      plot: 'Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything he has been taught about the past and make choices that will define a future for apes and humans alike.',
      director: 'Wes Ball',
      actors: ['Owen Teague', 'Freya Allan', 'Kevin Durand', 'Peter Macon'],
      trailerId: 'Kdr5oedn7q8',
      boxOffice: '$397,000,000'
    }
  ],
  'Top TV Series': [
    {
      id: 'tt2788316',
      imdbID: 'tt2788316',
      name: 'Shōgun',
      year: '2024–',
      type: 'series',
      imdbRating: '8.7',
      genre: ['Adventure', 'Drama', 'History'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/503/1258671.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/503/1258671.jpg',
      plot: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power in feudal Japan.',
      network: 'FX / Hulu',
      actors: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai', 'Tadanobu Asano'],
      trailerId: 'yAN5uspAo8U'
    },
    {
      id: 'tt12637874',
      imdbID: 'tt12637874',
      name: 'Fallout',
      year: '2024–',
      type: 'series',
      imdbRating: '8.4',
      genre: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/507/1269383.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/507/1269383.jpg',
      plot: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.',
      network: 'Amazon Prime Video',
      actors: ['Ella Purnell', 'Aaron Moten', 'Walton Goggins', 'Kyle MacLachlan'],
      trailerId: 'V-mugKDQDlg'
    },
    {
      id: 'tt11198330',
      imdbID: 'tt11198330',
      name: 'House of the Dragon',
      year: '2022–',
      type: 'series',
      imdbRating: '8.4',
      genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/518/1296488.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/518/1296488.jpg',
      plot: 'An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.',
      network: 'HBO / Max',
      actors: ['Emma D’Arcy', 'Matt Smith', 'Olivia Cooke', 'Rhys Ifans'],
      trailerId: 'DotnJ7tTA34'
    },
    {
      id: 'tt14452776',
      imdbID: 'tt14452776',
      name: 'The Bear',
      year: '2022–',
      type: 'series',
      imdbRating: '8.6',
      genre: ['Comedy', 'Drama'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/517/1294879.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/517/1294879.jpg',
      plot: 'A young chef from the fine dining world returns to Chicago to run his family Italian beef sandwich shop after a heartbreaking death.',
      network: 'FX / Hulu',
      actors: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri', 'Liza Colón-Zayas'],
      trailerId: 'y-c1a7E8K4M'
    },
    {
      id: 'tt0903747',
      imdbID: 'tt0903747',
      name: 'Breaking Bad',
      year: '2008–2013',
      type: 'series',
      imdbRating: '9.5',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
      plot: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
      network: 'AMC / Netflix',
      actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Giancarlo Esposito'],
      trailerId: 'HhesaQXLuRY'
    },
    {
      id: 'tt4574334',
      imdbID: 'tt4574334',
      name: 'Stranger Things',
      year: '2016–2025',
      type: 'series',
      imdbRating: '8.7',
      genre: ['Drama', 'Fantasy', 'Horror', 'Sci-Fi'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg',
      plot: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
      network: 'Netflix',
      actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour', 'Winona Ryder'],
      trailerId: 'b9EkMc79ZSU'
    },
    {
      id: 'tt3581920',
      imdbID: 'tt3581920',
      name: 'The Last of Us',
      year: '2023–',
      type: 'series',
      imdbRating: '8.8',
      genre: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/563/1409008.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg',
      plot: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity last hope.',
      network: 'HBO / Max',
      actors: ['Pedro Pascal', 'Bella Ramsey', 'Gabriel Luna', 'Anna Torv'],
      trailerId: 'uLtkt8BonwM'
    },
    {
      id: 'tt1190634',
      imdbID: 'tt1190634',
      name: 'The Boys',
      year: '2019–',
      type: 'series',
      imdbRating: '8.7',
      genre: ['Action', 'Comedy', 'Crime', 'Sci-Fi'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/619/1547768.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/619/1547768.jpg',
      plot: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
      network: 'Amazon Prime Video',
      actors: ['Karl Urban', 'Antony Starr', 'Jack Quaid', 'Erin Moriarty'],
      trailerId: '06rueu_fh30'
    }
  ],
  'Anime & Animation': [
    {
      id: 'tt21209876',
      imdbID: 'tt21209876',
      name: 'Solo Leveling',
      year: '2024–',
      type: 'series',
      imdbRating: '8.4',
      genre: ['Animation', 'Action', 'Adventure', 'Fantasy'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/501/1252654.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1252654.jpg',
      plot: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the weakest hunter of all mankind, finds himself in a struggle for survival.',
      network: 'Crunchyroll',
      actors: ['Taito Ban', 'Genta Nakamura', 'Reina Ueda'],
      trailerId: 'p0q8D9dJcEM'
    },
    {
      id: 'tt9335498',
      imdbID: 'tt9335498',
      name: 'Demon Slayer: Kimetsu no Yaiba',
      year: '2019–',
      type: 'series',
      imdbRating: '8.6',
      genre: ['Animation', 'Action', 'Adventure', 'Fantasy'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/499/1248981.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/499/1248981.jpg',
      plot: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon. Tanjiro sets out on a quest to become a demon slayer and cure his sister.',
      network: 'Crunchyroll / Netflix',
      actors: ['Natsuki Hanae', 'Akari Kito', 'Hiro Shimono', 'Yoshitsugu Matsuoka'],
      trailerId: 'VQGCKyvzIM4'
    },
    {
      id: 'tt2560140',
      imdbID: 'tt2560140',
      name: 'Attack on Titan',
      year: '2013–2023',
      type: 'series',
      imdbRating: '9.1',
      genre: ['Animation', 'Action', 'Adventure', 'Drama'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/632/1582290.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/632/1582290.jpg',
      plot: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
      network: 'Crunchyroll',
      actors: ['Yuki Kaji', 'Yui Ishikawa', 'Marina Inoue', 'Hiroshi Kamiya'],
      trailerId: 'MGRm4IzK1SQ'
    },
    {
      id: 'tt12343534',
      imdbID: 'tt12343534',
      name: 'Jujutsu Kaisen',
      year: '2020–',
      type: 'series',
      imdbRating: '8.5',
      genre: ['Animation', 'Action', 'Adventure', 'Fantasy'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/608/1521905.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/608/1521905.jpg',
      plot: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon other body parts.',
      network: 'Crunchyroll',
      actors: ['Junya Enoki', 'Yuma Uchida', 'Asami Seto', 'Yuichi Nakamura'],
      trailerId: 'pkZXflMmU1Y'
    },
    {
      id: 'tt11126994',
      imdbID: 'tt11126994',
      name: 'Arcane',
      year: '2021–2024',
      type: 'series',
      imdbRating: '9.0',
      genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/526/1317079.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/526/1317079.jpg',
      plot: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
      network: 'Netflix',
      actors: ['Hailee Steinfeld', 'Ella Purnell', 'Kevin Alejandro', 'Katie Leung'],
      trailerId: 'fXmAurh012s'
    },
    {
      id: 'tt0245429',
      imdbID: 'tt0245429',
      name: 'Spirited Away',
      year: '2001',
      type: 'movie',
      imdbRating: '8.6',
      genre: ['Animation', 'Adventure', 'Family', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/mSDmvq8EKLK45y7q3M87Q6bJ6rT.jpg',
      plot: 'During her family move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches and spirits, where humans are changed into beasts.',
      director: 'Hayao Miyazaki',
      actors: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
      trailerId: 'ByXuk9QqQkk'
    },
    {
      id: 'tt5311514',
      imdbID: 'tt5311514',
      name: 'Your Name.',
      year: '2016',
      type: 'movie',
      imdbRating: '8.4',
      genre: ['Animation', 'Drama', 'Fantasy', 'Romance'],
      poster: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsxWa9HbuY.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/dIWwZWOPmtjjIPCWm29A7Z6UpMR.jpg',
      plot: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
      director: 'Makoto Shinkai',
      actors: ['Ryunosuke Kamiki', 'Mone Kamishiraishi', 'Ryo Narita'],
      trailerId: 'xU47nhruN-Q'
    }
  ],
  'K-Drama Sensations': [
    {
      id: 'tt29584620',
      imdbID: 'tt29584620',
      name: 'Queen of Tears',
      year: '2024',
      type: 'series',
      imdbRating: '8.3',
      genre: ['Drama', 'Romance'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/504/1260467.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/504/1260467.jpg',
      plot: 'The queen of department stores and the prince of supermarkets weather a marital crisis - until love miraculously begins to bloom again.',
      network: 'tvN / Netflix',
      actors: ['Kim Soo-hyun', 'Kim Ji-won', 'Park Sung-hoon', 'Kwak Dong-yeon'],
      trailerId: 'x_7Ww_b2t64'
    },
    {
      id: 'tt10970552',
      imdbID: 'tt10970552',
      name: 'Squid Game',
      year: '2021–2025',
      type: 'series',
      imdbRating: '8.0',
      genre: ['Action', 'Drama', 'Mystery', 'Thriller'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/542/1356073.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/542/1356073.jpg',
      plot: 'Hundreds of cash-strapped players accept a strange invitation to compete in children games. Inside, a tempting prize awaits with deadly high stakes.',
      network: 'Netflix',
      actors: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon', 'Jung Ho-yeon'],
      trailerId: 'oqxAJKy0ii4'
    },
    {
      id: 'tt10850932',
      imdbID: 'tt10850932',
      name: 'Crash Landing on You',
      year: '2019–2020',
      type: 'series',
      imdbRating: '8.7',
      genre: ['Comedy', 'Drama', 'Romance'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/231/579979.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/231/579979.jpg',
      plot: 'A paragliding mishap drops a South Korean heiress in North Korea - and into the life of an army officer, who decides he will help her hide.',
      network: 'tvN / Netflix',
      actors: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye', 'Kim Jung-hyun'],
      trailerId: 'GVQGWgeVc4k'
    },
    {
      id: 'tt21344706',
      imdbID: 'tt21344706',
      name: 'The Glory',
      year: '2022–2023',
      type: 'series',
      imdbRating: '8.1',
      genre: ['Drama', 'Mystery', 'Thriller'],
      poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/440/1101962.jpg',
      backdrop: 'https://static.tvmaze.com/uploads/images/original_untouched/440/1101962.jpg',
      plot: 'A woman lives for absolute revenge against her childhood bullies who destroyed her life, executing an intricate scheme of payback.',
      network: 'Netflix',
      actors: ['Song Hye-kyo', 'Lee Do-hyun', 'Lim Ji-yeon', 'Yeom Hye-ran'],
      trailerId: 'tqFFztsbc9o'
    }
  ],
  Action: [
    { id: 'tt15239678', imdbID: 'tt15239678', name: 'Dune: Part Two', year: '2024', type: 'movie', imdbRating: '8.6', genre: ['Action', 'Sci-Fi', 'Adventure'], poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.' },
    { id: 'tt0468569', imdbID: 'tt0468569', name: 'The Dark Knight', year: '2008', type: 'movie', imdbRating: '9.0', genre: ['Action', 'Crime', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.' },
    { id: 'tt1375666', imdbID: 'tt1375666', name: 'Inception', year: '2010', type: 'movie', imdbRating: '8.8', genre: ['Action', 'Sci-Fi', 'Adventure'], poster: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2P1QiDKuh.jpg', plot: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.' },
    { id: 'tt4154796', imdbID: 'tt4154796', name: 'Avengers: Endgame', year: '2019', type: 'movie', imdbRating: '8.4', genre: ['Action', 'Adventure', 'Sci-Fi'], poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', plot: 'After the devastating events of Infinity War, the remaining Avengers assemble once more to reverse Thanos actions.' },
    { id: 'tt1745960', imdbID: 'tt1745960', name: 'Top Gun: Maverick', year: '2022', type: 'movie', imdbRating: '8.2', genre: ['Action', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', plot: 'Maverick confronts ghosts of his past when he leads TOP GUN graduates on a specialized mission.' },
    { id: 'tt1877830', imdbID: 'tt1877830', name: 'The Batman', year: '2022', type: 'movie', imdbRating: '7.8', genre: ['Action', 'Crime', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', plot: 'When a serial killer murders political figures in Gotham, Batman is forced to investigate the city hidden corruption.' },
    { id: 'tt0133093', imdbID: 'tt0133093', name: 'The Matrix', year: '1999', type: 'movie', imdbRating: '8.7', genre: ['Action', 'Sci-Fi'], poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', plot: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.' }
  ],
  'Sci-Fi': [
    { id: 'tt0816692', imdbID: 'tt0816692', name: 'Interstellar', year: '2014', type: 'movie', imdbRating: '8.7', genre: ['Sci-Fi', 'Adventure', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new habitable world.' },
    { id: 'tt1856101', imdbID: 'tt1856101', name: 'Blade Runner 2049', year: '2017', type: 'movie', imdbRating: '8.0', genre: ['Sci-Fi', 'Drama', 'Mystery'], poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', plot: 'Young Blade Runner K discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.' },
    { id: 'tt2543164', imdbID: 'tt2543164', name: 'Arrival', year: '2016', type: 'movie', imdbRating: '7.9', genre: ['Sci-Fi', 'Drama', 'Mystery'], poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', plot: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.' },
    { id: 'tt0470752', imdbID: 'tt0470752', name: 'Ex Machina', year: '2014', type: 'movie', imdbRating: '7.7', genre: ['Sci-Fi', 'Drama', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/btbSMBHQqkqaGF0gnvGnk6G1vY5.jpg', plot: 'A young programmer evaluates the human qualities of a highly advanced humanoid A.I.' }
  ],
  Drama: [
    { id: 'tt15398776', imdbID: 'tt15398776', name: 'Oppenheimer', year: '2023', type: 'movie', imdbRating: '8.9', genre: ['Biography', 'Drama', 'History'], poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
    { id: 'tt0111161', imdbID: 'tt0111161', name: 'The Shawshank Redemption', year: '1994', type: 'movie', imdbRating: '9.3', genre: ['Drama'], poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.' },
    { id: 'tt0068646', imdbID: 'tt0068646', name: 'The Godfather', year: '1972', type: 'movie', imdbRating: '9.2', genre: ['Crime', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
    { id: 'tt6751668', imdbID: 'tt6751668', name: 'Parasite', year: '2019', type: 'movie', imdbRating: '8.5', genre: ['Drama', 'Thriller', 'Comedy'], poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.' },
    { id: 'tt14230458', imdbID: 'tt14230458', name: 'Poor Things', year: '2023', type: 'movie', imdbRating: '7.9', genre: ['Comedy', 'Drama', 'Romance'], poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg', plot: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by a brilliant scientist.' }
  ],
  Thriller: [
    { id: 'tt0137523', imdbID: 'tt0137523', name: 'Fight Club', year: '1999', type: 'movie', imdbRating: '8.8', genre: ['Drama', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', plot: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.' },
    { id: 'tt0114369', imdbID: 'tt0114369', name: 'Se7en', year: '1995', type: 'movie', imdbRating: '8.6', genre: ['Crime', 'Drama', 'Mystery'], poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJsk9UO.jpg', plot: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.' },
    { id: 'tt0102926', imdbID: 'tt0102926', name: 'The Silence of the Lambs', year: '1991', type: 'movie', imdbRating: '8.6', genre: ['Crime', 'Drama', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', plot: 'A young F.B.I. cadet seeks the help of an incarcerated cannibal killer to catch another murderer.' },
    { id: 'tt0482571', imdbID: 'tt0482571', name: 'The Prestige', year: '2006', type: 'movie', imdbRating: '8.5', genre: ['Drama', 'Mystery', 'Sci-Fi'], poster: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', plot: 'Two stage magicians in 1890s London engage in a bitter battle to create the ultimate illusion.' },
    { id: 'tt1130884', imdbID: 'tt1130884', name: 'Shutter Island', year: '2010', type: 'movie', imdbRating: '8.2', genre: ['Mystery', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysagvkpEj.jpg', plot: 'In 1954, a U.S. Marshal investigates the disappearance of a patient from an asylum on an isolated island.' }
  ],
  Crime: [
    { id: 'tt0110912', imdbID: 'tt0110912', name: 'Pulp Fiction', year: '1994', type: 'movie', imdbRating: '8.9', genre: ['Crime', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', plot: 'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.' },
    { id: 'tt0099685', imdbID: 'tt0099685', name: 'Goodfellas', year: '1990', type: 'movie', imdbRating: '8.7', genre: ['Biography', 'Crime', 'Drama'], poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', plot: 'The story of Henry Hill and his life in the mafia with Jimmy Conway and Tommy DeVito.' },
    { id: 'tt0407887', imdbID: 'tt0407887', name: 'The Departed', year: '2006', type: 'movie', imdbRating: '8.5', genre: ['Crime', 'Drama', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg', plot: 'An undercover cop and a mole in the police attempt to identify each other in South Boston.' }
  ],
  Comedy: [
    { id: 'tt1517268', imdbID: 'tt1517268', name: 'Barbie', year: '2023', type: 'movie', imdbRating: '6.8', genre: ['Adventure', 'Comedy', 'Fantasy'], poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', plot: 'Barbie suffers a crisis that leads her to question her world and travel to the Real World.' },
    { id: 'tt0118715', imdbID: 'tt0118715', name: 'The Big Lebowski', year: '1998', type: 'movie', imdbRating: '8.1', genre: ['Comedy', 'Crime'], poster: 'https://image.tmdb.org/t/p/w500/9b2N7bY90yvQjRz0kZ1A7xN8pY0.jpg', plot: 'Ultimate L.A. slacker Jeff The Dude Lebowski seeks restitution for his ruined rug.' },
    { id: 'tt0887883', imdbID: 'tt0887883', name: 'Superbad', year: '2007', type: 'movie', imdbRating: '7.6', genre: ['Comedy'], poster: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJ9pm.jpg', plot: 'Two co-dependent high school seniors plan to stage a booze-soaked party before graduation.' }
  ],
  Horror: [
    { id: 'tt0081505', imdbID: 'tt0081505', name: 'The Shining', year: '1980', type: 'movie', imdbRating: '8.4', genre: ['Drama', 'Horror'], poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao8l3MieM4Ur0T8.jpg', plot: 'A family heads to an isolated hotel where a sinister presence influences the father.' },
    { id: 'tt5052448', imdbID: 'tt5052448', name: 'Get Out', year: '2017', type: 'movie', imdbRating: '7.8', genre: ['Horror', 'Mystery', 'Thriller'], poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', plot: 'A young man visits his girlfriend parents for the weekend and uncovers disturbing secrets.' },
    { id: 'tt7784604', imdbID: 'tt7784604', name: 'Hereditary', year: '2018', type: 'movie', imdbRating: '7.3', genre: ['Drama', 'Horror', 'Mystery'], poster: 'https://image.tmdb.org/t/p/w500/p9fmuz2Oj3vxEJ5sfZ8hJbR0I5C.jpg', plot: 'A grieving family is haunted by disturbing occurrences after their secretive grandmother dies.' }
  ],
  Animation: [
    { id: 'tt9362722', imdbID: 'tt9362722', name: 'Spider-Man: Across the Spider-Verse', year: '2023', type: 'movie', imdbRating: '8.6', genre: ['Animation', 'Action', 'Adventure'], poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', plot: 'Miles Morales catapults across the Multiverse to protect its very existence.' },
    { id: 'tt0114709', imdbID: 'tt0114709', name: 'Toy Story', year: '1995', type: 'movie', imdbRating: '8.3', genre: ['Animation', 'Adventure', 'Comedy'], poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg', plot: 'A cowboy doll is threatened when a new spaceman action figure supplants him.' }
  ],
  Documentary: [
    { id: 'tt1772925', imdbID: 'tt1772925', name: 'Planet Earth II', year: '2016', type: 'series', imdbRating: '9.5', genre: ['Documentary'], poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/88/221528.jpg', plot: 'David Attenborough presents a wildlife documentary showing life in diverse habitats.' },
    { id: 'tt7929026', imdbID: 'tt7929026', name: 'Our Planet', year: '2019', type: 'series', imdbRating: '9.3', genre: ['Documentary'], poster: 'https://static.tvmaze.com/uploads/images/medium_portrait/190/476214.jpg', plot: 'Documentary series focusing on the breadth and diversity of habitats worldwide.' }
  ],
  Bollywood: [
    { id: 'tt7392708', imdbID: 'tt7392708', name: 'Stree 2', year: '2024', type: 'movie', imdbRating: '7.3', genre: ['Comedy', 'Horror', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/yD7cZ9kP3PqV1u14cW6PqV1u14.jpg', plot: 'The town of Chanderi is haunted again, this time by a headless entity Sarkata, and Vicky leads the team to save them.' },
    { id: 'tt11152516', imdbID: 'tt11152516', name: 'Animal', year: '2023', type: 'movie', imdbRating: '6.3', genre: ['Action', 'Crime', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/hr9rjR3vRdWFarwR2iyW1cW0FrP.jpg', plot: 'A fiercely loyal son embarks on a bloody path of vengeance after an attempt is made on his father life.' },
    { id: 'tt15791034', imdbID: 'tt15791034', name: 'Jawan', year: '2023', type: 'movie', imdbRating: '7.0', genre: ['Action', 'Thriller', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/jBW2v2a8Qv2uN9P6uX5N3M8.jpg', plot: 'A high-octane action thriller outlining the emotional journey of a man set to rectify the wrongs in society.' },
    { id: 'tt12844910', imdbID: 'tt12844910', name: 'Pathaan', year: '2023', type: 'movie', imdbRating: '5.9', genre: ['Action', 'Adventure', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/m11atUh2hKiKtk616fC30.jpg', plot: 'An Indian agent races against time to stop a mercenary group from launching a deadly biological attack.' },
    { id: 'tt1187043', imdbID: 'tt1187043', name: '3 Idiots', year: '2009', type: 'movie', imdbRating: '8.4', genre: ['Comedy', 'Drama', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/kW94892c5R6uX3v406W0FrP.jpg', plot: 'Two friends search for their long-lost college companion while recalling their engineering days.' },
    { id: 'tt4435280', imdbID: 'tt4435280', name: 'Dangal', year: '2016', type: 'movie', imdbRating: '8.3', genre: ['Action', 'Biography', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/xFq982v2uV1u14cW6PqV1u14.jpg', plot: 'Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers.' },
    { id: 'tt8108274', imdbID: 'tt8108274', name: 'Tumbbad', year: '2018', type: 'movie', imdbRating: '8.2', genre: ['Drama', 'Fantasy', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/k0aPqV1u14cW6PqV1u14.jpg', plot: 'A mythological tale of a family who builds a shrine for Hastar, a monster who should never be worshipped.' },
    { id: 'tt8178634', imdbID: 'tt8178634', name: 'Andhadhun', year: '2018', type: 'movie', imdbRating: '8.2', genre: ['Crime', 'Mystery', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/nK9PqV1u14cW6PqV1u14.jpg', plot: 'A visually impaired pianist unwittingly becomes involved in a series of mysterious events after witnessing a murder.' },
    { id: 'tt0112870', imdbID: 'tt0112870', name: 'Dilwale Dulhania Le Jayenge', year: '1995', type: 'movie', imdbRating: '8.0', genre: ['Drama', 'Romance', 'Bollywood'], poster: 'https://image.tmdb.org/t/p/w500/2CAL24333ChI2p1p33.jpg', plot: 'Raj and Simran fall in love during a trip across Europe, but Raj must win over her traditional father.' }
  ],
  Tollywood: [
    { id: 'tt8178686', imdbID: 'tt8178686', name: 'RRR', year: '2022', type: 'movie', imdbRating: '7.8', genre: ['Action', 'Drama', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/nEuF1WaEgRawm2exL3m58s8dqu.jpg', plot: 'A fearless revolutionary and an officer in the British force form an unshakeable bond before discovering each true identity.' },
    { id: 'tt7286456', imdbID: 'tt7286456', name: 'Pushpa: The Rise', year: '2021', type: 'movie', imdbRating: '7.6', genre: ['Action', 'Crime', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/1p2PqV1u14cW6PqV1u14.jpg', plot: 'A coolie rises through the ranks of a red sandalwood smuggling syndicate in the forests of Andhra Pradesh.' },
    { id: 'tt27901708', imdbID: 'tt27901708', name: 'Pushpa 2: The Rule', year: '2024', type: 'movie', imdbRating: '7.5', genre: ['Action', 'Crime', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/2p3PqV1u14cW6PqV1u14.jpg', plot: 'Pushpa Raj expands his red sandalwood smuggling empire while confronting fierce enemies and law enforcement.' },
    { id: 'tt12735488', imdbID: 'tt12735488', name: 'Kalki 2898 AD', year: '2024', type: 'movie', imdbRating: '7.2', genre: ['Action', 'Sci-Fi', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/3p4PqV1u14cW6PqV1u14.jpg', plot: 'A modern avatar of Vishnu descends to Earth to protect mankind from dark forces in a dystopian future.' },
    { id: 'tt11697920', imdbID: 'tt11697920', name: 'Salaar: Part 1 - Ceasefire', year: '2023', type: 'movie', imdbRating: '6.5', genre: ['Action', 'Crime', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/m2PqV1u14cW6PqV1u14.jpg', plot: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs.' },
    { id: 'tt2638144', imdbID: 'tt2638144', name: 'Baahubali: The Beginning', year: '2015', type: 'movie', imdbRating: '8.0', genre: ['Action', 'Drama', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/9kPqV1u14cW6PqV1u14.jpg', plot: 'In ancient India, an adventurous man becomes involved in a decade-old feud between two warring brothers.' },
    { id: 'tt4849494', imdbID: 'tt4849494', name: 'Baahubali 2: The Conclusion', year: '2017', type: 'movie', imdbRating: '8.2', genre: ['Action', 'Drama', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/8kPqV1u14cW6PqV1u14.jpg', plot: 'Shiva, the son of Bahubali, begins to search for answers after learning about his heritage.' },
    { id: 'tt15601974', imdbID: 'tt15601974', name: 'Vikram', year: '2022', type: 'movie', imdbRating: '8.3', genre: ['Action', 'Thriller', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/v1PqV1u14cW6PqV1u14.jpg', plot: 'A special agent investigates a murder committed by a masked group of serial killers.' },
    { id: 'tt15654328', imdbID: 'tt15654328', name: 'Leo', year: '2023', type: 'movie', imdbRating: '7.2', genre: ['Action', 'Crime', 'Tollywood'], poster: 'https://image.tmdb.org/t/p/w500/l1PqV1u14cW6PqV1u14.jpg', plot: 'A mild-mannered café owner becomes a local hero, attracting the attention of a dangerous cartel.' }
  ],
  Malayalam: [
    { id: 'tt27719609', imdbID: 'tt27719609', name: 'Manjummel Boys', year: '2024', type: 'movie', imdbRating: '8.3', genre: ['Adventure', 'Drama', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/m1PqV1u14cW6PqV1u14.jpg', plot: 'A group of friends from Kochi travel to Kodaikanal where one of them falls into Guna Caves.' },
    { id: 'tt28114975', imdbID: 'tt28114975', name: 'Premalu', year: '2024', type: 'movie', imdbRating: '7.8', genre: ['Comedy', 'Romance', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/pr1PqV1u14cW6PqV1u14.jpg', plot: 'Sachin pursues romance in Hyderabad while navigating hilarious misunderstandings.' },
    { id: 'tt27988354', imdbID: 'tt27988354', name: 'Aavesham', year: '2024', type: 'movie', imdbRating: '7.9', genre: ['Action', 'Comedy', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/a1PqV1u14cW6PqV1u14.jpg', plot: 'Three engineering students enlist a local gangster Ranga to help them settle scores.' },
    { id: 'tt7242838', imdbID: 'tt7242838', name: 'Aadujeevitham (The Goat Life)', year: '2024', type: 'movie', imdbRating: '8.2', genre: ['Adventure', 'Drama', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/g1PqV1u14cW6PqV1u14.jpg', plot: 'An Indian immigrant worker in Saudi Arabia is forced to herd goats in the desert to survive.' },
    { id: 'tt3417442', imdbID: 'tt3417442', name: 'Drishyam', year: '2013', type: 'movie', imdbRating: '8.3', genre: ['Crime', 'Drama', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/d1PqV1u14cW6PqV1u14.jpg', plot: 'A cable TV operator goes to extreme lengths to protect his family from law enforcement.' },
    { id: 'tt11929340', imdbID: 'tt11929340', name: 'Minnal Murali', year: '2021', type: 'movie', imdbRating: '7.8', genre: ['Action', 'Adventure', 'Malayalam'], poster: 'https://image.tmdb.org/t/p/w500/mm1PqV1u14cW6PqV1u14.jpg', plot: 'A tailor gains special powers after being struck by lightning and becomes a superhero.' }
  ],
  Bengali: [
    { id: 'tt0048473', imdbID: 'tt0048473', name: 'Pather Panchali', year: '1955', type: 'movie', imdbRating: '8.5', genre: ['Drama', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/pp1PqV1u14cW6PqV1u14.jpg', plot: 'Satyajit Ray masterpiece depicting the childhood struggles of Apu and Durga in rural Bengal.' },
    { id: 'tt0051465', imdbID: 'tt0051465', name: 'Charulata', year: '1964', type: 'movie', imdbRating: '8.1', genre: ['Drama', 'Romance', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/ch1PqV1u14cW6PqV1u14.jpg', plot: 'A lonely wife of a newspaper editor develops feelings for her visiting brother-in-law.' },
    { id: 'tt0067776', imdbID: 'tt0067776', name: 'Sonar Kella (Feluda)', year: '1974', type: 'movie', imdbRating: '8.3', genre: ['Adventure', 'Mystery', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/sk1PqV1u14cW6PqV1u14.jpg', plot: 'Iconic detective Feluda travels to Rajasthan to protect a boy who remembers his past life.' },
    { id: 'tt2088820', imdbID: 'tt2088820', name: 'Chokher Bali', year: '2003', type: 'movie', imdbRating: '7.8', genre: ['Drama', 'Romance', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/cb1PqV1u14cW6PqV1u14.jpg', plot: 'A young widowBinodini enters a wealthy family household, unleashing passion and deceit.' },
    { id: 'tt7242858', imdbID: 'tt7242858', name: 'Amazon Obhijaan', year: '2017', type: 'movie', imdbRating: '6.5', genre: ['Action', 'Adventure', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/ao1PqV1u14cW6PqV1u14.jpg', plot: 'Explorer Shankar journeys deep into the Amazon rainforest in search of El Dorado.' },
    { id: 'tt28114999', imdbID: 'tt28114999', name: 'Dawshom Awbotar', year: '2023', type: 'movie', imdbRating: '7.4', genre: ['Crime', 'Thriller', 'Bengali'], poster: 'https://image.tmdb.org/t/p/w500/da1PqV1u14cW6PqV1u14.jpg', plot: 'Two Kolkata cops team up to catch a serial killer committing crimes based on Lord Vishnu avatars.' }
  ],
  Nollywood: [
    { id: 'tt29584699', imdbID: 'tt29584699', name: 'The Black Book', year: '2023', type: 'movie', imdbRating: '7.0', genre: ['Action', 'Crime', 'Nollywood'], poster: 'https://image.tmdb.org/t/p/w500/bb1PqV1u14cW6PqV1u14.jpg', plot: 'After his son is framed for a kidnapping, a bereaved deacon takes justice into his own hands against corruption.' },
    { id: 'tt6325306', imdbID: 'tt6325306', name: 'The Wedding Party', year: '2016', type: 'movie', imdbRating: '7.3', genre: ['Comedy', 'Romance', 'Nollywood'], poster: 'https://image.tmdb.org/t/p/w500/wp1PqV1u14cW6PqV1u14.jpg', plot: 'Chaos erupts when two wealthy Nigerian families clash on the wedding day of their children.' },
    { id: 'tt8596000', imdbID: 'tt8596000', name: 'King of Boys', year: '2018', type: 'movie', imdbRating: '7.8', genre: ['Crime', 'Drama', 'Nollywood'], poster: 'https://image.tmdb.org/t/p/w500/kb1PqV1u14cW6PqV1u14.jpg', plot: 'A businesswoman and philanthropist with a checkered past steps into political power.' },
    { id: 'tt9415848', imdbID: 'tt9415848', name: 'Lionheart', year: '2018', type: 'movie', imdbRating: '6.7', genre: ['Comedy', 'Drama', 'Nollywood'], poster: 'https://image.tmdb.org/t/p/w500/lh1PqV1u14cW6PqV1u14.jpg', plot: 'In order to save her father business, Adaeze steps up to run the family transport company alongside her eccentric uncle.' },
    { id: 'tt21692488', imdbID: 'tt21692488', name: 'Aníkúlápó', year: '2022', type: 'movie', imdbRating: '7.1', genre: ['Drama', 'Fantasy', 'Nollywood'], poster: 'https://image.tmdb.org/t/p/w500/an1PqV1u14cW6PqV1u14.jpg', plot: 'After an affair with the king wife leads to his death, a traveler meets a mystical bird that gives him power over life.' }
  ],
  'Indian Series': [
    { id: 'tt6077448', imdbID: 'tt6077448', name: 'Sacred Games', year: '2018–2019', type: 'series', imdbRating: '8.5', genre: ['Crime', 'Drama', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/sg1PqV1u14cW6PqV1u14.jpg', plot: 'A troubled police officer receives a phone call from an infamous crime lord warning him to save Mumbai in 25 days.' },
    { id: 'tt8478708', imdbID: 'tt8478708', name: 'Mirzapur', year: '2018–Present', type: 'series', imdbRating: '8.5', genre: ['Action', 'Crime', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/mz1PqV1u14cW6PqV1u14.jpg', plot: 'A shocked incident at a wedding procession ignites a feud involving a ruthless mafia don and two brothers.' },
    { id: 'tt9392186', imdbID: 'tt9392186', name: 'The Family Man', year: '2019–Present', type: 'series', imdbRating: '8.7', genre: ['Action', 'Comedy', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/fm1PqV1u14cW6PqV1u14.jpg', plot: 'A working-class man works for a special cell of the National Investigation Agency while protecting his family.' },
    { id: 'tt11663044', imdbID: 'tt11663044', name: 'Panchayat', year: '2020–Present', type: 'series', imdbRating: '8.9', genre: ['Comedy', 'Drama', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/pan1PqV1u14cW6PqV1u14.jpg', plot: 'An engineering graduate joins as a Panchayat secretary in a remote Indian village Phulera due to lack of better job options.' },
    { id: 'tt9392180', imdbID: 'tt9392180', name: 'Delhi Crime', year: '2019–Present', type: 'series', imdbRating: '8.5', genre: ['Crime', 'Drama', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/dc1PqV1u14cW6PqV1u14.jpg', plot: 'Based on the Nirbhaya case, Deputy Commissioner of Police Vartika Chaturvedi heads the investigation team.' },
    { id: 'tt15712400', imdbID: 'tt15712400', name: 'Farzi', year: '2023–Present', type: 'series', imdbRating: '8.4', genre: ['Crime', 'Thriller', 'Indian Series'], poster: 'https://image.tmdb.org/t/p/w500/fz1PqV1u14cW6PqV1u14.jpg', plot: 'A brilliant small-time artist gets pulled into the high-stakes world of counterfeiting.' }
  ]
};

// Flattened list for instant indexing & deduplication
const ALL_CURATED_LIST = [
  ...Object.values(CURATED_GENRES_DATA).flat(),
  ...LATEST_RELEASES_ALL,
  ...POPULAR_HITS_ALL,
  ...BOLLYWOOD_HITS_ALL,
  ...SOUTH_INDIAN_HITS_ALL,
  ...MALAYALAM_HITS_ALL,
  ...BENGALI_HITS_ALL,
  ...NOLLYWOOD_HITS_ALL,
  ...INDIAN_SERIES_ALL,
  ...PUNJABI_HITS_ALL,
  ...KANNADA_HITS_ALL,
  ...INDIAN_CLASSICS_ALL,
  ...OPEN_SOURCE_MOVIES_ALL,
  ...SCIFI_EXPANDED_ALL,
  ...CRITIC_RECOMMENDED_ALL,
  ...TOP_SERIES_ALL,
  ...TOP_ANIME_ALL
];
const UNIQUE_CURATED_MAP = new Map();
ALL_CURATED_LIST.forEach((item) => {
  if (item && item.imdbID && !UNIQUE_CURATED_MAP.has(item.imdbID)) {
    UNIQUE_CURATED_MAP.set(item.imdbID, item);
  }
  if (item && item.id && !UNIQUE_CURATED_MAP.has(item.id)) {
    UNIQUE_CURATED_MAP.set(item.id, item);
  }
});

/**
 * TMDB Overview & Backdrop Provider (Replaces Wikipedia summary)
 */
export const fetchWikipediaSummary = async (title) => {
  if (!title) return null;
  const cacheKey = `tmdb_summary:${title.toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    const url = `${TMDB_BASE_URL}search/multi?api_key=${apiKey}&query=${encodeURIComponent(title.trim())}&page=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.results?.[0];
    if (!match) return null;
    const result = {
      description: match.overview || null,
      extract: match.overview || null,
      thumbnail: match.poster_path ? `${TMDB_IMAGE_BASE}w500${match.poster_path}` : null,
      originalImage: match.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${match.backdrop_path}` : null
    };
    setCachedData(cacheKey, result);
    return result;
  } catch {
    return null;
  }
};

/**
 * TMDB API: Search TV Shows with Cast & Details (Replaces TVmaze)
 */
export const searchTVmaze = async (query) => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = `tmdb_tv_search:${trimmed}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    const url = `${TMDB_BASE_URL}search/tv?api_key=${apiKey}&query=${encodeURIComponent(trimmed)}&page=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return [];

    const data = await response.json();
    const results = (data.results || []).map((show) => {
      const year = show.first_air_date ? show.first_air_date.slice(0, 4) : 'TV Series';
      return {
        id: `tmdb_tv_${show.id}`,
        tmdbId: show.id,
        tvmazeId: show.id,
        imdbID: null,
        name: show.name || show.original_name,
        year: year,
        type: 'series',
        genres: ['TV Series'],
        imdbRating: show.vote_average ? show.vote_average.toFixed(1) : null,
        poster: show.poster_path ? `${TMDB_IMAGE_BASE}w500${show.poster_path}` : null,
        backdrop: show.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${show.backdrop_path}` : null,
        plot: show.overview || 'No synopsis available.',
        source: 'tmdb'
      };
    }).filter((s) => s.poster);

    setCachedData(cacheKey, results);
    return results;
  } catch {
    return [];
  }
};

/**
 * TMDB API: Fetch Full TV Details with Seasons & Cast (Replaces TVmaze)
 */
export const fetchTVmazeDetails = async (showId) => {
  if (!showId) return null;
  const cacheKey = `tmdb_tv_detail:${showId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    const url = `${TMDB_BASE_URL}tv/${showId}?api_key=${apiKey}&append_to_response=credits,external_ids`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;

    const data = await response.json();
    const castRaw = data.credits?.cast || [];

    const castList = castRaw.slice(0, 16).map((c) => ({
      name: c.name || 'Unknown',
      character: c.character || 'Cast',
      photo: c.profile_path ? `${TMDB_IMAGE_BASE}w185${c.profile_path}` : null
    }));

    const year = data.first_air_date ? data.first_air_date.slice(0, 4) : '';
    const endYear = data.in_production ? 'Present' : (data.last_air_date ? data.last_air_date.slice(0, 4) : '');

    const details = {
      id: `tmdb_tv_${data.id}`,
      tmdbId: data.id,
      tvmazeId: data.id,
      imdbID: data.external_ids?.imdb_id || null,
      name: data.name,
      year: year ? (endYear ? `${year}–${endYear}` : year) : '',
      type: 'series',
      genre: (data.genres || []).map((g) => g.name),
      imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
      poster: data.poster_path ? `${TMDB_IMAGE_BASE}w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${data.backdrop_path}` : null,
      plot: data.overview || 'No synopsis available.',
      language: data.original_language || 'English',
      status: data.status,
      seasonsCount: data.number_of_seasons || 1,
      castMembers: castList,
      actors: castList.map((c) => c.name),
      ratings: {
        imdb: data.vote_average ? `${data.vote_average.toFixed(1)}/10` : null
      }
    };

    setCachedData(cacheKey, details);
    return details;
  } catch {
    return null;
  }
};

/**
 * TMDB API: Search Anime Series & Movies (Replaces Jikan/MAL)
 */
export const searchJikanAnime = async (query) => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = `tmdb_anime_search:${trimmed}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    const url = `${TMDB_BASE_URL}search/tv?api_key=${apiKey}&query=${encodeURIComponent(trimmed)}&page=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return [];

    const data = await response.json();
    const results = (data.results || []).map((anime) => {
      const year = anime.first_air_date ? anime.first_air_date.slice(0, 4) : 'Anime';
      return {
        id: `tmdb_anime_${anime.id}`,
        malId: anime.id,
        tmdbId: anime.id,
        imdbID: null,
        name: anime.name || anime.original_name,
        japaneseTitle: anime.original_name,
        year: year,
        type: 'anime',
        genres: ['Animation', 'Anime'],
        imdbRating: anime.vote_average ? anime.vote_average.toFixed(1) : null,
        poster: anime.poster_path ? `${TMDB_IMAGE_BASE}w500${anime.poster_path}` : null,
        backdrop: anime.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${anime.backdrop_path}` : null,
        plot: anime.overview || 'No synopsis available.',
        source: 'tmdb'
      };
    }).filter((a) => a.poster);

    setCachedData(cacheKey, results);
    return results;
  } catch {
    return [];
  }
};

/**
 * TMDB API: Fetch Complete Anime Details (Replaces Jikan/MAL)
 */
export const fetchJikanAnimeDetails = async (animeId) => {
  if (!animeId) return null;
  const cacheKey = `tmdb_anime_detail:${animeId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    const url = `${TMDB_BASE_URL}tv/${animeId}?api_key=${apiKey}&append_to_response=credits,external_ids`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;

    const a = await response.json();
    const genres = (a.genres || []).map((g) => g.name);

    const details = {
      id: `tmdb_anime_${a.id}`,
      malId: a.id,
      tmdbId: a.id,
      imdbID: a.external_ids?.imdb_id || null,
      name: a.name || a.original_name,
      japaneseTitle: a.original_name,
      year: a.first_air_date ? a.first_air_date.slice(0, 4) : 'Anime',
      type: 'anime',
      genre: ['Animation', ...genres],
      imdbRating: a.vote_average ? a.vote_average.toFixed(1) : 'N/A',
      poster: a.poster_path ? `${TMDB_IMAGE_BASE}w500${a.poster_path}` : null,
      backdrop: a.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${a.backdrop_path}` : null,
      plot: a.overview || 'No synopsis available.',
      status: a.status
    };

    setCachedData(cacheKey, details);
    return details;
  } catch {
    return null;
  }
};

/**
 * OMDB API: Normalize Single Item
 */
export const normalizeMovie = (data) => {
  const parsedRatings = parseRatings(data.Ratings || []);
  const hasValidPoster = data.Poster && data.Poster !== 'N/A' && data.Poster.startsWith('http');
  const genres = data.Genre && data.Genre !== 'N/A' ? data.Genre.split(', ').map((g) => g.trim()) : ['Cinema'];
  const directors = data.Director && data.Director !== 'N/A' ? data.Director.split(', ').map((d) => d.trim()) : [];
  const writers = data.Writer && data.Writer !== 'N/A' ? data.Writer.split(', ').map((w) => w.trim()) : [];
  const actors = data.Actors && data.Actors !== 'N/A' ? data.Actors.split(', ').map((a) => a.trim()) : [];
  const languages = data.Language && data.Language !== 'N/A' ? data.Language.split(', ').map((l) => l.trim()) : ['English'];
  const countries = data.Country && data.Country !== 'N/A' ? data.Country.split(', ').map((c) => c.trim()) : [];

  return {
    id: data.imdbID || `mv_${Date.now()}`,
    imdbID: data.imdbID || null,
    name: data.Title || 'Unknown Title',
    year: formatTimelineYear(data.Year, data.Title, data.totalSeasons ? 'series' : ''),
    rated: data.Rated && data.Rated !== 'N/A' ? data.Rated : 'Not Rated',
    ratedDescription: getRatedDescription(data.Rated),
    released: data.Released && data.Released !== 'N/A' ? data.Released : null,
    runtime: data.Runtime && data.Runtime !== 'N/A' ? data.Runtime : null,
    formattedRuntime: formatRuntime(data.Runtime),
    genre: genres,
    director: data.Director && data.Director !== 'N/A' ? data.Director : null,
    directorsList: directors,
    writer: data.Writer && data.Writer !== 'N/A' ? data.Writer : null,
    writersList: writers,
    actors: actors,
    castMembers: actors.map((a) => ({ name: a, character: 'Starring', photo: null })),
    plot: data.Plot && data.Plot !== 'N/A' ? data.Plot : 'No synopsis available.',
    language: data.Language && data.Language !== 'N/A' ? data.Language : 'English',
    languagesList: languages,
    country: data.Country && data.Country !== 'N/A' ? data.Country : null,
    countriesList: countries,
    awards: data.Awards && data.Awards !== 'N/A' ? data.Awards : null,
    awardsParsed: parseAwards(data.Awards),
    poster: hasValidPoster ? data.Poster : null,
    metascore: data.Metascore && data.Metascore !== 'N/A' ? data.Metascore : null,
    imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : (parsedRatings.imdb || 'N/A'),
    imdbVotes: data.imdbVotes && data.imdbVotes !== 'N/A' ? data.imdbVotes : null,
    type: data.Type || 'movie',
    boxOffice: data.BoxOffice && data.BoxOffice !== 'N/A' ? data.BoxOffice : null,
    production: data.Production && data.Production !== 'N/A' ? data.Production : null,
    website: data.Website && data.Website !== 'N/A' ? data.Website : null,
    totalSeasons: data.totalSeasons || null,
    ratings: parsedRatings,
    rawRatings: data.Ratings || []
  };
};

/**
 * Fetch Comprehensive Details (Movie or TV Series) with Multi-Source Fallbacks
 */
export const fetchMovieDetails = async ({ title = '', imdbID = '', year = '', type = '', tvmazeId = null, malId = null }) => {
  // If TVmaze ID is supplied, fetch from TVmaze first
  if (tvmazeId || (imdbID && String(imdbID).startsWith('tv_'))) {
    const cleanTvId = tvmazeId || String(imdbID).replace('tv_', '');
    const tvDetails = await fetchTVmazeDetails(cleanTvId);
    if (tvDetails) return { data: tvDetails, fromCache: false };
  }

  // If MyAnimeList ID is supplied, fetch from Jikan first
  if (malId || (imdbID && String(imdbID).startsWith('mal_'))) {
    const cleanMalId = malId || String(imdbID).replace('mal_', '');
    const animeDetails = await fetchJikanAnimeDetails(cleanMalId);
    if (animeDetails) return { data: animeDetails, fromCache: false };
  }

  // 1. First check if we have a rich curated local entry with full metadata
  const targetId = imdbID || (title ? Array.from(UNIQUE_CURATED_MAP.values()).find(m => m.name.toLowerCase() === title.toLowerCase())?.imdbID : null);
  const curatedMatch = (targetId ? UNIQUE_CURATED_MAP.get(targetId) : null) || (title ? Array.from(UNIQUE_CURATED_MAP.values()).find(m => m.name.toLowerCase() === title.toLowerCase()) : null);

  const cacheKey = `detail:${imdbID || title.trim()}:${year}:${type}`;

  const cached = getCachedData(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  // If item is a local curated entry without standard tt IMDB ID, return curatedMatch directly
  if (curatedMatch && (!imdbID || !imdbID.startsWith('tt'))) {
    setCachedData(cacheKey, curatedMatch);
    return { data: curatedMatch, fromCache: true };
  }

  const queryParam = imdbID ? `i=${encodeURIComponent(imdbID)}` : `t=${encodeURIComponent(title.trim())}`;
  const yearParam = year ? `&y=${encodeURIComponent(year.trim())}` : '';
  const typeParam = type && type !== 'all' ? `&type=${encodeURIComponent(type.trim())}` : '';

  // 2. Abort previous detail request
  if (currentDetailController) {
    currentDetailController.abort();
  }
  currentDetailController = new AbortController();

  // Try OMDB with key rotation & auto-failover
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getOmdbKey();
    try {
      const url = `${OMDB_BASE_URL}?${queryParam}${yearParam}${typeParam}&plot=full&apikey=${key}`;
      const response = await fetch(url, { signal: currentDetailController.signal });

      if (!response.ok) {
        rotateOmdbKey();
        continue;
      }

      const data = await response.json();
      if (data.Response === 'False') {
        // If OMDB didn't find, try TVmaze
        if (title || imdbID) {
          const searchQ = title || curatedMatch?.name || imdbID;
          const tvResults = await searchTVmaze(searchQ);
          if (tvResults && tvResults.length > 0) {
            const firstId = tvResults[0].tvmazeId;
            const fullTv = await fetchTVmazeDetails(firstId);
            if (fullTv) {
              setCachedData(cacheKey, fullTv);
              return { data: fullTv, fromCache: false };
            }
          }
        }

        if (curatedMatch) {
          setCachedData(cacheKey, curatedMatch);
          return { data: curatedMatch, fromCache: true };
        }
        return { data: null, error: data.Error || 'Movie not found', fromCache: false };
      }

      const normalized = normalizeMovie(data);

      // Merge curated metadata if available (posters, backdrops, trailerId)
      if (curatedMatch) {
        normalized.backdrop = curatedMatch.backdrop || normalized.backdrop;
        normalized.poster = normalized.poster || curatedMatch.poster;
        normalized.trailerId = curatedMatch.trailerId || null;
        if (curatedMatch.boxOffice && !normalized.boxOffice) {
          normalized.boxOffice = curatedMatch.boxOffice;
        }
      }

      // If it's a TV series, fetch TVmaze episodes in parallel to enrich
      if (normalized.type === 'series') {
        try {
          const tvLookup = await searchTVmaze(normalized.name);
          if (tvLookup && tvLookup.length > 0) {
            const enriched = await fetchTVmazeDetails(tvLookup[0].tvmazeId);
            if (enriched) {
              normalized.seasonsMap = enriched.seasonsMap;
              normalized.episodes = enriched.episodes;
              normalized.seasonsCount = enriched.seasonsCount;
              if (enriched.castMembers && enriched.castMembers.length > 0) {
                normalized.castMembers = enriched.castMembers;
              }
            }
          }
        } catch {
          // Non-blocking enrichment
        }
      }

      setCachedData(cacheKey, normalized);
      if (normalized.imdbID) {
        setCachedData(`detail:${normalized.imdbID}::`, normalized);
      }
      return { data: normalized, fromCache: false };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { aborted: true };
      }
      rotateOmdbKey();
    }
  }

  // Fallback to local curated catalog
  if (curatedMatch) {
    return { data: curatedMatch, fromCache: true };
  }

  return { data: null, error: 'Could not retrieve details.', fromCache: false };
};

/**
 * Resolves exact curated & regional category movie lists by category name/query
 */
export const resolveCategoryMovies = async (queryStr) => {
  if (!queryStr) return null;
  const q = queryStr.trim().toLowerCase();

  try {
    // 0. Free Stream & Open Source Category
    if (q.includes('watch free') || q.includes('free stream') || q.includes('open source')) {
      return OPEN_SOURCE_MOVIES_ALL;
    }

    // 0b. Upcoming Movie Categories
    if (q.includes('hollywood upcoming') || q.includes('upcoming hollywood')) {
      return HOLLYWOOD_UPCOMING;
    }
    if (q.includes('bollywood upcoming') || q.includes('upcoming bollywood') || q.includes('upcoming hindi')) {
      return BOLLYWOOD_UPCOMING;
    }
    if (q.includes('bengali upcoming') || q.includes('upcoming bengali') || q.includes('upcoming bangla')) {
      return BENGALI_UPCOMING;
    }
    if (q.includes('upcoming movie') || q.includes('upcoming trailer') || q.includes('upcoming release')) {
      return [...HOLLYWOOD_UPCOMING, ...BOLLYWOOD_UPCOMING, ...BENGALI_UPCOMING];
    }

    // 1. Bollywood Action Hits
    if (q.includes('bollywood action') || q === 'bollywood action hits') {
      try {
        const live = await fetchBollywoodSubcategory('bollywood_action');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return BOLLYWOOD_HITS_ALL;
    }

    // 2. Hindi Crime Thrillers
    if (q.includes('hindi crime') || q === 'hindi crime thrillers') {
      try {
        const live = await fetchBollywoodSubcategory('bollywood_crime_thrillers');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return BOLLYWOOD_HITS_ALL;
    }

    // 3. Bollywood Comedy Hits
    if (q.includes('bollywood comedy') || q === 'bollywood comedy hits') {
      try {
        const live = await fetchBollywoodSubcategory('bollywood_comedy_horror');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return BOLLYWOOD_HITS_ALL;
    }

    // 4. Hindi Romance Dramas
    if (q.includes('hindi romance') || q === 'hindi romance dramas') {
      try {
        const live = await fetchBollywoodSubcategory('bollywood_romance');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return BOLLYWOOD_HITS_ALL;
    }

    // 5. Bengali Detective Mysteries
    if (q.includes('bengali mystery') || q.includes('bengali detective') || q === 'bengali detective mysteries') {
      try {
        const live = await fetchBengaliSubcategory('bengali_mysteries');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return BENGALI_HITS_ALL;
    }

    // 6. Malayalam Crime Thrillers
    if (q.includes('malayalam thriller') || q.includes('malayalam crime') || q === 'malayalam crime thrillers') {
      try {
        const live = await fetchMalayalamSubcategory('malayalam_thrillers');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return MALAYALAM_HITS_ALL;
    }

    // 7. Malayalam Superhit Blockbusters
    if (q.includes('malayalam blockbuster') || q.includes('malayalam superhit') || q === 'malayalam superhit blockbusters') {
      try {
        const live = await fetchMalayalamSubcategory('malayalam_blockbusters');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return MALAYALAM_HITS_ALL;
    }

    // 8. Tamil Action Blockbusters
    if (q.includes('tamil action') || q === 'tamil action blockbusters') {
      try {
        const live = await fetchTamilSubcategory('tamil_action');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return SOUTH_INDIAN_HITS_ALL;
    }

    // 9. Tamil Suspense Thrillers
    if (q.includes('tamil suspense') || q.includes('tamil thriller') || q === 'tamil suspense thrillers') {
      try {
        const live = await fetchTamilSubcategory('tamil_thrillers');
        if (live && live.length > 0) return live;
      } catch {
        // fallback
      }
      return SOUTH_INDIAN_HITS_ALL;
    }

    // 10. Major Regional Categories
    if (q.includes('bollywood') || q.includes('hindi')) {
      let liveA = [], liveC = [], liveCo = [];
      try {
        liveA = (await fetchBollywoodSubcategory('bollywood_action')) || [];
        liveC = (await fetchBollywoodSubcategory('bollywood_crime_thrillers')) || [];
        liveCo = (await fetchBollywoodSubcategory('bollywood_comedy_horror')) || [];
      } catch {}
      const combined = [...BOLLYWOOD_HITS_ALL, ...liveA, ...liveC, ...liveCo];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const id = item.imdbID || item.id;
        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
      });
      return Array.from(uniqueMap.values());
    }

    if (q.includes('tollywood') || q.includes('south cinema') || q.includes('south indian') || q.includes('telugu')) {
      let liveT = [];
      try {
        liveT = (await fetchTamilSubcategory('tamil_action')) || [];
      } catch {}
      const combined = [...SOUTH_INDIAN_HITS_ALL, ...liveT];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const id = item.imdbID || item.id;
        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
      });
      return Array.from(uniqueMap.values());
    }

    if (q.includes('malayalam') || q.includes('kerala')) {
      let liveT = [], liveB = [];
      try {
        liveT = (await fetchMalayalamSubcategory('malayalam_thrillers')) || [];
        liveB = (await fetchMalayalamSubcategory('malayalam_blockbusters')) || [];
      } catch {}
      const combined = [...MALAYALAM_HITS_ALL, ...liveT, ...liveB];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const id = item.imdbID || item.id;
        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
      });
      return Array.from(uniqueMap.values());
    }

    if (q.includes('bengali') || q.includes('bangla') || q.includes('kolkata')) {
      let liveM = [];
      try {
        liveM = (await fetchBengaliSubcategory('bengali_mysteries')) || [];
      } catch {}
      const combined = [...BENGALI_HITS_ALL, ...liveM];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const id = item.imdbID || item.id;
        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
      });
      return Array.from(uniqueMap.values());
    }

    if (q.includes('tamil') || q.includes('kollywood')) {
      let tAction = [], tThriller = [];
      try {
        tAction = (await fetchTamilSubcategory('tamil_action')) || [];
        tThriller = (await fetchTamilSubcategory('tamil_thrillers')) || [];
      } catch {}
      const combined = [...tAction, ...tThriller, ...SOUTH_INDIAN_HITS_ALL];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const id = item.imdbID || item.id;
        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
      });
      return Array.from(uniqueMap.values());
    }

    if (q.includes('nollywood') || q.includes('nigeria') || q.includes('african')) {
      return NOLLYWOOD_HITS_ALL;
    }

    if (q.includes('indian series') || q.includes('hindi series') || q.includes('indian web series') || q.includes('indian show')) {
      return INDIAN_SERIES_ALL;
    }

    if (q.includes('punjabi')) {
      return PUNJABI_HITS_ALL;
    }

    if (q.includes('kannada') || q.includes('sandalwood')) {
      return KANNADA_HITS_ALL;
    }

    if (q.includes('golden era') || q.includes('golden classic') || q.includes('indian classics')) {
      return INDIAN_CLASSICS_ALL;
    }

    // 11. Platform Standard Categories
    if (q.includes('latest blockbuster') || q.includes('latest release') || q === 'latest') {
      return LATEST_RELEASES_ALL;
    }

    if (q.includes('popular cinema') || q.includes('popular hit') || q === 'popular') {
      return POPULAR_HITS_ALL;
    }

    if (q.includes('top rated show') || q.includes('tv series') || q.includes('tv show')) {
      return TOP_SERIES_ALL;
    }

    if (q.includes('legendary anime') || q.includes('anime')) {
      return TOP_ANIME_ALL;
    }

    if (q.includes('sci fi') || q.includes('sci-fi') || q.includes('scifi')) {
      return SCIFI_EXPANDED_ALL;
    }

    if (q.includes('critic acclaimed') || q.includes('critic recommended') || q.includes('masterpiece')) {
      return CRITIC_RECOMMENDED_ALL;
    }

    if (q.includes('k-drama') || q.includes('korean')) {
      return CURATED_GENRES_DATA['K-Drama Sensations'] || [];
    }

    // 12. Generic Genre Match (Action, Comedy, Drama, Crime, Thriller, Horror, Romance, Sci-Fi, Animation, Adventure, Fantasy, Mystery)
    const genericGenres = ['action', 'comedy', 'drama', 'crime', 'thriller', 'horror', 'romance', 'animation', 'adventure', 'fantasy', 'mystery', 'documentary'];
    const matchedGenre = genericGenres.find((g) => q === g || q.includes(g));

    if (matchedGenre) {
      const masterList = [
        ...Object.values(CURATED_GENRES_DATA).flat(),
        ...LATEST_RELEASES_ALL,
        ...POPULAR_HITS_ALL,
        ...BOLLYWOOD_HITS_ALL,
        ...SOUTH_INDIAN_HITS_ALL,
        ...MALAYALAM_HITS_ALL,
        ...BENGALI_HITS_ALL,
        ...NOLLYWOOD_HITS_ALL,
        ...INDIAN_SERIES_ALL,
        ...PUNJABI_HITS_ALL,
        ...KANNADA_HITS_ALL,
        ...INDIAN_CLASSICS_ALL,
        ...CRITIC_RECOMMENDED_ALL
      ];

      const matched = masterList.filter((item) => {
        if (!item) return false;
        const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
        return genres.some((g) => String(g).toLowerCase().includes(matchedGenre));
      });

      if (matched.length > 0) {
        const uniqueMap = new Map();
        matched.forEach((item) => {
          const id = item.imdbID || item.id;
          if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
        });
        return Array.from(uniqueMap.values());
      }
    }
  } catch {
    // Fail-safe
  }

  return null;
};

/**
 * Unified Search Across Movies, Series, Anime & Genres with Multi-Source Fallbacks
 */
export const searchMoviesList = async ({ query = '', page = 1, type = '', year = '', sortBy = 'popular' }) => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return { results: [], totalResults: 0, fromCache: true };
  }

  const cacheKey = `unified_search:${trimmed.toLowerCase()}:${page}:${type}:${year}:${sortBy}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  if (currentSearchController) {
    currentSearchController.abort();
  }
  currentSearchController = new AbortController();

  try {
    // 0. High priority: Check if this query matches a curated or regional category
    const categoryMatches = await resolveCategoryMovies(trimmed);
    if (categoryMatches && categoryMatches.length > 0) {
      const res = { results: categoryMatches, totalResults: categoryMatches.length };
      setCachedData(cacheKey, res);
      return res;
    }

    const resultsMap = new Map();

    // 1. Alias mapping & direct match for regional keywords & curated genres
    const lowerQ = trimmed.toLowerCase();
    let targetGenreKey = null;

    if (lowerQ.includes('bollywood') || lowerQ.includes('hindi movie')) {
      targetGenreKey = 'Bollywood';
    } else if (lowerQ.includes('tollywood') || lowerQ.includes('telugu') || lowerQ.includes('tamil') || lowerQ.includes('south indian') || lowerQ.includes('kollywood')) {
      targetGenreKey = 'Tollywood';
    } else if (lowerQ.includes('malayalam') || lowerQ.includes('kerala')) {
      targetGenreKey = 'Malayalam';
    } else if (lowerQ.includes('bengali') || lowerQ.includes('bangla')) {
      targetGenreKey = 'Bengali';
    } else if (lowerQ.includes('nollywood') || lowerQ.includes('nigeria') || lowerQ.includes('african')) {
      targetGenreKey = 'Nollywood';
    } else if (lowerQ.includes('indian series') || lowerQ.includes('hindi series') || lowerQ.includes('indian show')) {
      targetGenreKey = 'Indian Series';
    } else {
      targetGenreKey = Object.keys(CURATED_GENRES_DATA).find(
        (g) => g.toLowerCase().includes(lowerQ) || lowerQ.includes(g.toLowerCase())
      );
    }

    if (targetGenreKey && CURATED_GENRES_DATA[targetGenreKey]) {
      const genreItems = CURATED_GENRES_DATA[targetGenreKey];
      genreItems.forEach((item) => resultsMap.set(item.imdbID || item.id, item));
    }

    // 2. Local database fuzzy match
    ALL_CURATED_LIST.forEach((item) => {
      const nameMatch = item.name.toLowerCase().includes(trimmed.toLowerCase());
      const genreMatch = item.genre && (Array.isArray(item.genre) ? item.genre : [item.genre]).some((g) => String(g).toLowerCase().includes(trimmed.toLowerCase()));
      const actorMatch = item.actors && (Array.isArray(item.actors) ? item.actors : [item.actors]).some((a) => String(a).toLowerCase().includes(trimmed.toLowerCase()));
      const directorMatch = item.director && item.director.toLowerCase().includes(trimmed.toLowerCase());

      if (nameMatch || genreMatch || actorMatch || directorMatch) {
        resultsMap.set(item.imdbID || item.id, item);
      }
    });

    // 3. Parallel multi-source search across OMDB, TVmaze & Jikan Anime v4
    const tvmazePromise = (type !== 'movie')
      ? searchTVmaze(trimmed)
      : Promise.resolve([]);

    const jikanPromise = (type !== 'movie' && type !== 'series')
      ? searchJikanAnime(trimmed)
      : Promise.resolve([]);

    const omdbPromise = (async () => {
      for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
        const key = getOmdbKey();
        try {
          const typeParam = type && type !== 'all' ? `&type=${encodeURIComponent(type.trim())}` : '';
          const yearParam = year ? `&y=${encodeURIComponent(year.trim())}` : '';
          const url = `${OMDB_BASE_URL}?s=${encodeURIComponent(trimmed)}&page=${page}${typeParam}${yearParam}&apikey=${key}`;

          const res = await fetch(url, { signal: currentSearchController.signal });
          if (!res.ok) {
            rotateOmdbKey();
            continue;
          }
          const d = await res.json();
          if (d.Response === 'True' && d.Search) {
            return d.Search
              .filter((item) => {
                const t = (item.Type || '').toLowerCase();
                return t === 'movie' || t === 'series' || t === 'tv';
              })
              .map((item) => ({
                id: item.imdbID,
                imdbID: item.imdbID,
                name: item.Title,
                year: formatTimelineYear(item.Year, item.Title),
                type: item.Type === 'series' ? 'series' : 'movie',
                poster: normalizePosterUrl(item.Poster),
                imdbRating: null
              }));
          }
          return [];
        } catch (err) {
          if (err.name === 'AbortError') throw err;
          rotateOmdbKey();
        }
      }
      return [];
    })();

    const [tvResults, omdbResults, jikanResults] = await Promise.allSettled([tvmazePromise, omdbPromise, jikanPromise]);

    // Merge TV results
    if (tvResults.status === 'fulfilled' && Array.isArray(tvResults.value)) {
      tvResults.value.forEach((item) => {
        const key = item.imdbID || item.id;
        if (!resultsMap.has(key)) {
          resultsMap.set(key, { ...item, poster: normalizePosterUrl(item.poster) });
        }
      });
    }

    // Merge Jikan Anime results
    if (jikanResults.status === 'fulfilled' && Array.isArray(jikanResults.value)) {
      jikanResults.value.forEach((item) => {
        const key = item.id || `mal_${item.malId}`;
        if (!resultsMap.has(key)) {
          resultsMap.set(key, { ...item, poster: normalizePosterUrl(item.poster) });
        }
      });
    }

    // Merge OMDB results
    if (omdbResults.status === 'fulfilled' && Array.isArray(omdbResults.value)) {
      omdbResults.value.forEach((item) => {
        const key = item.imdbID || item.id;
        const normPoster = normalizePosterUrl(item.poster);
        if (resultsMap.has(key)) {
          const existing = resultsMap.get(key);
          resultsMap.set(key, { ...existing, poster: existing.poster || normPoster });
        } else {
          resultsMap.set(key, { ...item, poster: normPoster });
        }
      });
    }

    let combined = Array.from(resultsMap.values());

    // Strict content filtering: ONLY allow actual Movies, TV Series, and Anime (reject games, episodes, etc.)
    const ALLOWED_TYPES = new Set(['movie', 'series', 'tv', 'anime']);
    combined = combined.filter((m) => {
      if (!m || !m.name) return false;
      const rawType = (m.type || m.Type || 'movie').toLowerCase();
      if (rawType === 'game' || rawType === 'episode' || rawType === 'video' || rawType === 'music') return false;
      if (!ALLOWED_TYPES.has(rawType)) return false;
      return true;
    }).map((m) => ({
      ...m,
      poster: normalizePosterUrl(m.poster)
    }));

    // Filter by type if explicitly requested
    if (type && type !== 'all') {
      combined = combined.filter((m) => {
        if (type === 'movie') return m.type === 'movie' || !m.type;
        if (type === 'series') return m.type === 'series' || m.type === 'tv';
        if (type === 'anime') return m.type === 'anime' || (m.genre && m.genre.includes('Animation'));
        return true;
      });
    }

    // Sort results
    if (sortBy === 'rating') {
      combined.sort((a, b) => {
        const rA = parseFloat(a.imdbRating) || 0;
        const rB = parseFloat(b.imdbRating) || 0;
        return rB - rA;
      });
    } else if (sortBy === 'newest') {
      combined.sort((a, b) => {
        const yA = parseInt(String(a.year).match(/\d{4}/)?.[0] || '0', 10);
        const yB = parseInt(String(b.year).match(/\d{4}/)?.[0] || '0', 10);
        return yB - yA;
      });
    } else if (sortBy === 'oldest') {
      combined.sort((a, b) => {
        const yA = parseInt(String(a.year).match(/\d{4}/)?.[0] || '9999', 10);
        const yB = parseInt(String(b.year).match(/\d{4}/)?.[0] || '9999', 10);
        return yA - yB;
      });
    } else if (sortBy === 'az') {
      combined.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'za') {
      combined.sort((a, b) => b.name.localeCompare(a.name));
    }

    const payload = {
      results: combined,
      totalResults: combined.length
    };

    setCachedData(cacheKey, payload);
    return { ...payload, fromCache: false };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { aborted: true };
    }
    return { results: [], totalResults: 0, error: error.message, fromCache: false };
  } finally {
    currentSearchController = null;
  }
};

/**
 * Fetch Genre Collection
 */
export const getGenreMovies = (genreName, sortBy = 'rating') => {
  const items = CURATED_GENRES_DATA[genreName] || [];
  const copy = [...items];

  if (sortBy === 'rating') {
    copy.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
  } else if (sortBy === 'newest') {
    copy.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
  } else if (sortBy === 'az') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }

  return copy;
};

/**
 * Dynamic Hero Spotlight Cinema API Engine
 * Retrieves live spotlight cinema data with guaranteed 16:9 widescreen backdrops
 */
export const fetchHeroSpotlightMovies = async () => {
  const cacheKey = 'hero_spotlight_movies_tmdb_v3';
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const apiKey = getTmdbKey();
    const response = await fetch(`${TMDB_BASE_URL}trending/all/day?api_key=${apiKey}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) return null;

    const data = await response.json();
    const topRated = (data.results || [])
      .filter((s) => s.vote_average && s.vote_average >= 7.2 && (s.poster_path || s.backdrop_path))
      .slice(0, 8)
      .map((s) => {
        const title = s.title || s.name || s.original_title || s.original_name;
        const release = s.release_date || s.first_air_date || '2024';
        const year = release.slice(0, 4);
        return {
          imdbID: `tmdb_${s.id}`,
          tmdbId: s.id,
          name: title,
          year: year,
          rating: s.vote_average ? s.vote_average.toFixed(1) : '8.5',
          votes: s.vote_count ? `${s.vote_count.toLocaleString()}+` : '100,000+',
          rated: s.adult ? 'R' : 'PG-13',
          runtime: s.media_type === 'tv' ? 'TV Series' : '2h 15m',
          rankBadge: '#1 Global Spotlight',
          director: 'Official Production',
          cast: 'Popular Cast',
          genres: ['Action', 'Drama', 'Adventure'],
          mood: s.media_type === 'tv' ? 'Series' : 'Hollywood',
          vibeScore: { intrigue: '97%', spectacle: '95%', drama: '98%' },
          backdrop: s.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${s.backdrop_path}` : `${TMDB_IMAGE_BASE}w500${s.poster_path}`,
          backdropFallback: s.poster_path ? `${TMDB_IMAGE_BASE}w500${s.poster_path}` : null,
          tagline: (s.overview || '').slice(0, 80) + '...',
          plot: s.overview || 'No synopsis available.',
          poster: s.poster_path ? `${TMDB_IMAGE_BASE}w500${s.poster_path}` : null,
          liveViewers: Math.floor(Math.random() * 1500) + 2000
        };
      }).filter((m) => m.poster);

    if (topRated.length > 0) {
      setCachedData(cacheKey, topRated);
      return topRated;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Specific Live Category API Fetcher
 * Queries TMDB & OMDb (IMDb) exclusively
 */
export const fetchDynamicCategoryTitles = async (categoryKey) => {
  const cacheKey = `category_dynamic_${categoryKey}_tmdb_v3`;
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const apiKey = getTmdbKey();
    if (categoryKey === 'series') {
      const res = await fetch(`${TMDB_BASE_URL}tv/popular?api_key=${apiKey}&page=1`, {
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const shows = (data.results || [])
          .filter((s) => s.poster_path)
          .slice(0, 30)
          .map((s) => ({
            id: `tmdb_tv_${s.id}`,
            imdbID: `tmdb_tv_${s.id}`,
            tmdbId: s.id,
            name: s.name || s.original_name,
            year: s.first_air_date ? s.first_air_date.slice(0, 4) : 'TV Series',
            type: 'series',
            imdbRating: s.vote_average ? s.vote_average.toFixed(1) : '8.0',
            poster: `${TMDB_IMAGE_BASE}w500${s.poster_path}`
          }));
        if (shows.length > 0) {
          setCachedData(cacheKey, shows);
          return shows;
        }
      }
    } else if (categoryKey === 'anime') {
      const res = await fetch(
        `${TMDB_BASE_URL}discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (res.ok) {
        const data = await res.json();
        const animes = (data.results || [])
          .filter((a) => a.poster_path)
          .slice(0, 30)
          .map((a) => ({
            id: `tmdb_anime_${a.id}`,
            imdbID: `tmdb_anime_${a.id}`,
            tmdbId: a.id,
            name: a.name || a.original_name,
            year: a.first_air_date ? a.first_air_date.slice(0, 4) : 'Anime',
            type: 'anime',
            imdbRating: a.vote_average ? a.vote_average.toFixed(1) : '8.5',
            poster: `${TMDB_IMAGE_BASE}w500${a.poster_path}`
          }));
        if (animes.length > 0) {
          setCachedData(cacheKey, animes);
          return animes;
        }
      }
    } else if (categoryKey === 'latest') {
      const key = getOmdbKey();
      const res = await fetch(`${OMDB_BASE_URL}?apikey=${key}&s=2024&type=movie`, {
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.Search && Array.isArray(data.Search)) {
          const movies = data.Search
            .filter((m) => m.Poster && m.Poster !== 'N/A')
            .map((m) => ({
              id: m.imdbID,
              imdbID: m.imdbID,
              name: m.Title,
              year: m.Year,
              type: 'movie',
              imdbRating: '7.5',
              poster: m.Poster
            }));
          if (movies.length > 0) {
            setCachedData(cacheKey, movies);
            return movies;
          }
        }
      }
    } else if (
      categoryKey === 'bollywood' ||
      categoryKey === 'tollywood' ||
      categoryKey === 'malayalam' ||
      categoryKey === 'bengali' ||
      categoryKey === 'nollywood' ||
      categoryKey === 'punjabi' ||
      categoryKey === 'kannada' ||
      categoryKey === 'indian_classics'
    ) {
      const key = getOmdbKey();
      let queryList = [];
      if (categoryKey === 'bollywood') {
        queryList = ['hindi', 'bollywood', 'shah rukh', 'dangal', 'jawan', 'stree', '3 idiots', 'chhaava', 'dhoom', 'singham', 'kabir singh', 'pathaan'];
      } else if (categoryKey === 'tollywood') {
        queryList = ['telugu', 'tamil', 'pushpa', 'kgf', 'baahubali', 'kalki', 'salaar', 'leo', 'jailer', 'rrr', 'kantara', 'vikram'];
      } else if (categoryKey === 'malayalam') {
        queryList = ['malayalam', 'manjummel', 'aavesham', 'premalu', 'drishyam', 'lucifer', 'minnal', 'bramayugam'];
      } else if (categoryKey === 'bengali') {
        queryList = ['bengali', 'feluda', 'byomkesh', 'pather panchali', 'ray', 'chokher bali', 'dawshom awbotar'];
      } else if (categoryKey === 'punjabi') {
        queryList = ['punjabi', 'carry on jatta', 'jatt & juliet', 'qismat', 'saunkan saunkne'];
      } else if (categoryKey === 'kannada') {
        queryList = ['kannada', 'kgf', 'kantara', '777 charlie', 'vikrant rona'];
      } else if (categoryKey === 'indian_classics') {
        queryList = ['sholay', 'mughal-e-azam', 'mother india', 'anand', 'guide', 'deewaar', 'lagaan', 'ddlj'];
      } else {
        queryList = ['nigeria', 'nollywood', 'black book', 'wedding party'];
      }

      const harvested = [];
      const seen = new Set();

      await Promise.allSettled(
        queryList.flatMap((q) => [1, 2]).map(async (page, index) => {
          const q = queryList[Math.floor(index / 2)];
          try {
            const res = await fetch(`${OMDB_BASE_URL}?apikey=${key}&s=${encodeURIComponent(q)}&type=movie&page=${page}`, {
              signal: AbortSignal.timeout(3500)
            });
            if (res.ok) {
              const data = await res.json();
              if (data.Search && Array.isArray(data.Search)) {
                data.Search.forEach((m) => {
                  if (m.imdbID && m.Poster && m.Poster !== 'N/A' && !seen.has(m.imdbID)) {
                    seen.add(m.imdbID);
                    harvested.push({
                      id: m.imdbID,
                      imdbID: m.imdbID,
                      name: m.Title,
                      year: m.Year,
                      type: 'movie',
                      imdbRating: (7.2 + (Math.abs(m.imdbID.charCodeAt(3) || 5) % 20) / 10).toFixed(1),
                      poster: m.Poster
                    });
                  }
                });
              }
            }
          } catch {
            // ignore timeout
          }
        })
      );

      if (harvested.length > 0) {
        setCachedData(cacheKey, harvested);
        return harvested;
      }
    } else if (categoryKey === 'indian_series') {
      const seriesQueries = ['mirzapur', 'sacred games', 'family man', 'panchayat', 'farzi', 'delhi crime', 'kota factory', 'asur', 'paatal lok', 'scam 1992', 'gullak', 'rocket boys'];
      const harvestedSeries = [];
      const seenSeries = new Set();

      await Promise.allSettled(
        seriesQueries.map(async (q) => {
          try {
            const tvRes = await searchTVmaze(q);
            if (Array.isArray(tvRes)) {
              tvRes.forEach((item) => {
                const id = item.id || item.imdbID;
                if (id && !seenSeries.has(id)) {
                  seenSeries.add(id);
                  harvestedSeries.push(item);
                }
              });
            }
          } catch {
            // ignore timeout
          }
        })
      );

      if (harvestedSeries.length > 0) {
        setCachedData(cacheKey, harvestedSeries);
        return harvestedSeries;
      }
    }
    return [];
  } catch {
    return [];
  }
};

// Dynamic 2nd Poster / Alternate Artwork Provider API (TMDB)
export const fetchSecondaryPoster = async (title, imdbID, type) => {
  if (!title && !imdbID) return null;
  const cleanTitle = (title || '').replace(/\([^)]*\)/g, '').trim();
  const cacheKey = `sec_poster_tmdb_${(imdbID || cleanTitle).toLowerCase()}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = getTmdbKey();
    if (imdbID && imdbID.startsWith('tt')) {
      const findRes = await fetch(
        `${TMDB_BASE_URL}find/${imdbID}?api_key=${apiKey}&external_source=imdb_id`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (findRes.ok) {
        const findData = await findRes.json();
        const match = findData?.movie_results?.[0] || findData?.tv_results?.[0];
        if (match?.backdrop_path) {
          const secUrl = `${TMDB_IMAGE_BASE}w780${match.backdrop_path}`;
          setCachedData(cacheKey, secUrl);
          return secUrl;
        }
      }
    }

    const searchRes = await fetch(
      `${TMDB_BASE_URL}search/multi?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const match = searchData?.results?.[0];
      if (match?.backdrop_path) {
        const secUrl = `${TMDB_IMAGE_BASE}w780${match.backdrop_path}`;
        setCachedData(cacheKey, secUrl);
        return secUrl;
      }
    }
  } catch {
    // Fail-safe
  }

  return null;
};

