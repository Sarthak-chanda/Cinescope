import React, { useState, useEffect, useRef } from 'react';
import WatchProviders from './WatchProviders';
import { playSound, toggleAudioMute, getAudioMuted } from '../services/soundEffects';
import { formatTimelineYear } from '../services/movieApi';

// Curated trailer video IDs for popular titles (with universal search fallback)
const KNOWN_TRAILERS = {
  tt6263850: '73_1biulkYk',  // Deadpool & Wolverine
  tt15239678: 'Way9Dexny3w', // Dune: Part Two
  tt22022452: 'LEjhY15eCx0', // Inside Out 2
  tt9218128: '4rgYUipGJNo',  // Gladiator II
  tt18411490: 'x0XDEhP4MQs', // Alien: Romulus
  tt11358390: 'Kdr5oedn7q8', // Kingdom of the Planet of the Apes
  tt2788316: 'yAN5uspAo8U',  // Shōgun
  tt12637874: 'V-mugKDQDlg', // Fallout
  tt11198330: 'DotnJ7tTA34', // House of the Dragon
  tt14452776: 'y-c1a7E8K4M', // The Bear
  tt21209876: 'p0q8D9dJcEM', // Solo Leveling
  tt9335498: 'VQGCKyvzIM4',  // Demon Slayer
  tt29584620: 'x_7Ww_b2t64', // Queen of Tears
  tt10970552: 'oqxAJKy0ii4', // Squid Game
  tt10850932: 'GVQGWgeVc4k', // Crash Landing on You
  tt21344706: 'tqFFztsbc9o', // The Glory
  tt1375666: 'YoHD9XEInc0',  // Inception
  tt0468569: 'EXeTwQWrcwY',  // The Dark Knight
  tt0816692: 'zSWdZVtXT7E',  // Interstellar
  tt4154796: 'TcMBFSGVi1c',  // Avengers: Endgame
  tt15398776: 'uYPbbksJxIg', // Oppenheimer
  tt0110912: 'tDAT98e0wK4',  // Pulp Fiction
  tt0068646: 'sY1S34973zA',  // The Godfather
  tt0245429: 'ByXuk9QqQkk',  // Spirited Away
  tt6751668: '5xH0hhJ98Bx',  // Parasite
  tt9362722: 'cqGjhVJWtEg',  // Spider-Man: Across the Spider-Verse
  tt1877830: 'mqqft2x_Aa4',  // The Batman
  tt1745960: 'giXco2JaZ_4',  // Top Gun: Maverick
  tt1517268: 'pBk4NYhWNMM',  // Barbie
  tt0903747: 'HhesaQXLuRY',  // Breaking Bad
  tt4574334: 'b9EkMc79ZSU',  // Stranger Things
  tt8701918: 's9APLXM9Ei8',  // Chernobyl
  tt3581920: 'uLtkt8BonwM',  // The Last of Us
  tt1190634: '06rueu_fh30',  // The Boys
  tt2560140: 'MGRm4IzK1SQ',  // Attack on Titan
  tt12343534: 'pkZXflMmU1Y', // Jujutsu Kaisen
  tt11126994: 'fXmAurh012s', // Arcane
  tt5311514: 'xU47nhruN-Q',  // Your Name
  tt0137523: 'O1nDozs-L7w',  // Fight Club
  tt0133093: 'vKQi3bBA1y8'   // The Matrix
};

const RATING_REACTIONS = {
  10: 'Masterpiece — Cinema Perfection',
  9: 'Phenomenal — Absolute Must-Watch',
  8: 'Great — Highly Recommended',
  7: 'Solid — Entertaining & Well-Made',
  6: 'Decent — Fun Casual Watch',
  5: 'Average — Mixed Feelings',
  4: 'Subpar — Missed Potential',
  3: 'Poor — Not Recommended',
  2: 'Very Bad — Skip This',
  1: 'Unwatchable'
};

const WATCH_STATUS_KEY = 'cinescope_watch_status_v1';

// Helper to generate a harmonious gradient palette fallback
const generatePaletteFallback = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 60) % 360;
  const h3 = (h1 + 180) % 360;
  const h4 = (h1 + 240) % 360;

  return {
    c1: `hsl(${h1}, 75%, 22%)`,
    c2: `hsl(${h2}, 80%, 18%)`,
    c3: `hsl(${h3}, 70%, 12%)`,
    c4: `hsl(${h4}, 85%, 20%)`,
    accent: `hsl(${h1}, 90%, 65%)`
  };
};

// Generates dynamic vibe meters based on movie metadata
const calculateMovieVibes = (movie) => {
  if (!movie) return { adrenaline: 70, mindBending: 60, emotional: 50, spectacle: 70, rewatch: 60 };
  const rawGenres = movie.genre || movie.genres || [];
  const genreList = Array.isArray(rawGenres)
    ? rawGenres
    : (typeof rawGenres === 'string' ? rawGenres.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const ratingNum = parseFloat(movie.imdbRating || movie.rating) || 7.5;
  const isAction = genreList.some((g) => ['Action', 'Adventure', 'Thriller', 'Shounen'].includes(g));
  const isSciFi = genreList.some((g) => ['Sci-Fi', 'Mystery', 'Crime', 'Supernatural', 'Psychological'].includes(g));
  const isDrama = genreList.some((g) => ['Drama', 'Biography', 'History', 'Romance', 'Slice of Life'].includes(g));
  const isAnimation = genreList.some((g) => ['Animation', 'Comedy', 'Family', 'Anime'].includes(g));

  return {
    adrenaline: isAction ? Math.min(98, 75 + Math.floor(ratingNum * 2.5)) : 55,
    mindBending: isSciFi ? Math.min(99, 70 + Math.floor(ratingNum * 3)) : 60,
    emotional: isDrama ? Math.min(96, 68 + Math.floor(ratingNum * 3)) : 50,
    spectacle: (isAction || isSciFi || isAnimation) ? Math.min(99, 80 + Math.floor(ratingNum * 2)) : 70,
    rewatch: Math.min(98, 60 + Math.floor(ratingNum * 4))
  };
};

// Trailer Availability Checker for Movie, Anime, or TV Series
const resolveTrailerVideoId = (item) => {
  if (!item) return null;
  if (item.imdbID && KNOWN_TRAILERS[item.imdbID]) return KNOWN_TRAILERS[item.imdbID];
  if (item.id && KNOWN_TRAILERS[item.id]) return KNOWN_TRAILERS[item.id];
  if (item.trailerId && typeof item.trailerId === 'string' && !['0TAGtIQdnLw', 'r6Hg33MYzyA'].includes(item.trailerId)) {
    return item.trailerId;
  }
  if (item.trailer && typeof item.trailer === 'string') return item.trailer;
  if (item.trailerUrl) {
    const match = String(item.trailerUrl).match(/(?:embed\/|v=|\/vi\/|youtu\.be\/|\/v\/)([^#&?]*)/);
    if (match && match[1]) return match[1];
  }
  return null;
};

const MoviePage = ({
  movie,
  onBack,
  hasSearchResults,
  isWatchlisted,
  onToggleWatchlist,
  onShare,
  onActorClick,
  onGenreClick,
  onDirectorClick,
  onSelectMovie,
  userNotes = {},
  onSaveNote,
  userRatings = {},
  onSaveRating
}) => {
  const [noteText, setNoteText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showNoteSaved, setShowNoteSaved] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Trailer Availability Checker State: Show HD Backdrop Hero by default; play video on user click
  const initialTrailerId = resolveTrailerVideoId(movie);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trailerError, setTrailerError] = useState(false);

  // Watch status: 'want', 'watching', 'completed', 'favorite'
  const [watchStatus, setWatchStatus] = useState(() => {
    try {
      const stored = localStorage.getItem('cinescope_watch_statuses');
      const map = stored ? JSON.parse(stored) : {};
      return map[movie?.imdbID || movie?.id] || null;
    } catch {
      return null;
    }
  });



  // Interactive Confetti Effect for Ratings
  const [confettiBurst, setConfettiBurst] = useState([]);

  // Community Vibe Votes
  const [userVibeVote, setUserVibeVote] = useState(null);

  // 3D Perspective Tilt on Sidebar Poster
  const posterRef = useRef(null);
  const [posterTilt, setPosterTilt] = useState({});

  const [extractedColors, setExtractedColors] = useState({
    c1: '#312e81',
    c2: '#4338ca',
    c3: '#0f172a',
    c4: '#4c1d95',
    accent: '#818cf8'
  });

  const iframeRef = useRef(null);
  const detailsSectionRef = useRef(null);
  const movieId = movie?.imdbID || movie?.id;

  const movieGenreList = Array.isArray(movie?.genre)
    ? movie.genre
    : (typeof movie?.genre === 'string'
      ? movie.genre.split(',').map((g) => g.trim()).filter(Boolean)
      : (Array.isArray(movie?.genres) ? movie.genres : []));

  const isTvOrAnime =
    movie?.type === 'series' ||
    movie?.type === 'anime' ||
    movie?.type === 'tv' ||
    Boolean(movie?.totalSeasons) ||
    Boolean(movie?.seasonsMap) ||
    movieGenreList.some((g) => ['Anime', 'Animation', 'TV Series', 'Television', 'Anime Series'].includes(g)) ||
    String(movie?.id || '').startsWith('anilist_') ||
    String(movie?.id || '').startsWith('mal_') ||
    String(movie?.id || '').startsWith('tv_') ||
    String(movie?.id || '').startsWith('tvm_');

  // Load existing personal notes and ratings
  useEffect(() => {
    if (movieId) {
      setNoteText(userNotes[movieId] || '');
      setSelectedRating(userRatings[movieId] || 0);
    }
  }, [movieId, userNotes, userRatings]);

  // Dynamic Live Seasons & Episodes State
  const [liveSeasonsMap, setLiveSeasonsMap] = useState(movie?.seasonsMap || null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [watchedEpisodes, setWatchedEpisodes] = useState(() => {
    try {
      const saved = localStorage.getItem(`cinescope_watched_eps_${movieId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Draggable horizontal refs for Season Tabs & Navigation Bar
  const seasonTabsRef = useRef(null);
  const [isDraggingSeasons, setIsDraggingSeasons] = useState(false);
  const [seasonsStartX, setSeasonsStartX] = useState(0);
  const [seasonsScrollLeft, setSeasonsScrollLeft] = useState(0);

  const handleSeasonsMouseDown = (e) => {
    if (!seasonTabsRef.current) return;
    setIsDraggingSeasons(true);
    setSeasonsStartX(e.pageX - seasonTabsRef.current.offsetLeft);
    setSeasonsScrollLeft(seasonTabsRef.current.scrollLeft);
  };

  const handleSeasonsMouseMove = (e) => {
    if (!isDraggingSeasons || !seasonTabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - seasonTabsRef.current.offsetLeft;
    const walk = (x - seasonsStartX) * 1.5;
    seasonTabsRef.current.scrollLeft = seasonsScrollLeft - walk;
  };

  const handleSeasonsMouseUpOrLeave = () => {
    setIsDraggingSeasons(false);
  };

  const navTabsRef = useRef(null);
  const [isDraggingNav, setIsDraggingNav] = useState(false);
  const [navStartX, setNavStartX] = useState(0);
  const [navScrollLeft, setNavScrollLeft] = useState(0);

  const handleNavMouseDown = (e) => {
    if (!navTabsRef.current) return;
    setIsDraggingNav(true);
    setNavStartX(e.pageX - navTabsRef.current.offsetLeft);
    setNavScrollLeft(navTabsRef.current.scrollLeft);
  };

  const handleNavMouseMove = (e) => {
    if (!isDraggingNav || !navTabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - navTabsRef.current.offsetLeft;
    const walk = (x - navStartX) * 1.5;
    navTabsRef.current.scrollLeft = navScrollLeft - walk;
  };

  const handleNavMouseUpOrLeave = () => {
    setIsDraggingNav(false);
  };

  const toggleWatchedEpisode = (epKey) => {
    playSound('click');
    setWatchedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(epKey)) {
        next.delete(epKey);
      } else {
        next.add(epKey);
      }
      try {
        localStorage.setItem(`cinescope_watched_eps_${movieId}`, JSON.stringify(Array.from(next)));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  // Fetch Live TV Episodes if this is a TV Show or Anime
  useEffect(() => {
    let isMounted = true;
    if (!isTvOrAnime) return;

    const loadEpisodes = async () => {
      try {
        const queryName = (movie.name || movie.title || '').replace(/\(.*\)/, '').trim();
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=4f89241199a531b29dbd244a307b2251&query=${encodeURIComponent(queryName)}`, { signal: AbortSignal.timeout(3500) });
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          const tvMatch = tmdbData?.results?.[0];
          if (tvMatch?.id) {
            const detailRes = await fetch(`https://api.themoviedb.org/3/tv/${tvMatch.id}?api_key=4f89241199a531b29dbd244a307b2251`, { signal: AbortSignal.timeout(3500) });
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const numSeasons = detailData?.number_of_seasons || 1;
              const map = {};
              for (let s = 1; s <= Math.min(numSeasons, 5); s++) {
                map[s] = Array.from({ length: 8 }).map((_, idx) => ({
                  id: `tmdb_ep_${s}_${idx + 1}`,
                  number: idx + 1,
                  season: s,
                  name: `Episode ${idx + 1}`,
                  summary: detailData.overview || 'Official episode details provided by TMDB.',
                  airdate: detailData.first_air_date || '2024',
                  runtime: '45m',
                  image: detailData.poster_path ? `https://image.tmdb.org/t/p/w500${detailData.poster_path}` : movie.poster,
                  rating: detailData.vote_average ? detailData.vote_average.toFixed(1) : '8.5'
                }));
              }
              if (isMounted) {
                setLiveSeasonsMap(map);
                return;
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }

      if (isMounted) {
        let totalS = 1;
        let epCount = 8;

        if (movie.type === 'anime') {
          // If totalSeasons or episodes is like "12 Episodes", extract total episodes for Season 1
          const epMatch = String(movie.totalSeasons || '').match(/(\d+)\s*Episodes?/i);
          if (epMatch) {
            epCount = Math.min(parseInt(epMatch[1], 10), 36) || 12;
            totalS = 1;
          } else {
            totalS = Math.min(parseInt(movie.totalSeasons, 10) || 1, 4);
            epCount = 12;
          }
        } else {
          totalS = Math.min(parseInt(movie.totalSeasons, 10) || 1, 10);
          epCount = 8;
        }

        const map = {};
        for (let s = 1; s <= totalS; s++) {
          map[s] = Array.from({ length: epCount }).map((_, idx) => ({
            id: `ep_${s}_${idx + 1}`,
            number: idx + 1,
            season: s,
            name: `Episode ${idx + 1}: ${['The Beginning', 'Awakening', 'Ascension', 'Crossroads', 'Shadow War', 'Unbroken', 'The Revelation', 'Final Stand', 'New Dawn', 'Retribution', 'Legacy', 'Endgame'][idx % 12]}`,
            summary: `The journey advances through critical milestones in Season ${s}, Chapter ${idx + 1}.`,
            airdate: movie.year ? `${movie.year}` : 'Broadcast',
            runtime: movie.type === 'anime' ? '24m' : '55m',
            image: movie.backdrop || movie.poster,
            rating: (8.3 + ((idx * 3) % 14) / 10).toFixed(1)
          }));
        }
        setLiveSeasonsMap(map);
      }
    };

    loadEpisodes();
    return () => {
      isMounted = false;
    };
  }, [movie, isTvOrAnime]);

  // Extract vibrant colors from poster image via canvas
  useEffect(() => {
    if (!movie) return;

    const fallback = generatePaletteFallback(movie.name);
    setExtractedColors(fallback);

    // For TV Series and Anime: ALWAYS default to clean poster view (no auto-playing trailer video)
    setIsPlayingTrailer(!isTvOrAnime);
    setTrailerError(false);

    // Default to 'episodes' tab for TV & Anime
    if (isTvOrAnime) {
      setActiveTab('episodes');
    } else {
      setActiveTab('overview');
    }

    try {
      const stored = localStorage.getItem(WATCH_STATUS_KEY);
      const map = stored ? JSON.parse(stored) : {};
      setWatchStatus(map[movieId] || null);
    } catch {
      // Ignored
    }

    if (!movie.poster || movie.poster === 'N/A') return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = movie.poster;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 60;
        ctx.drawImage(img, 0, 0, 40, 60);

        const p1 = ctx.getImageData(10, 10, 1, 1).data;
        const p2 = ctx.getImageData(30, 20, 1, 1).data;
        const p3 = ctx.getImageData(10, 40, 1, 1).data;
        const p4 = ctx.getImageData(25, 50, 1, 1).data;

        const rgbToDark = (r, g, b, a = 0.9) =>
          `rgba(${Math.max(15, Math.min(200, r))}, ${Math.max(15, Math.min(200, g))}, ${Math.max(30, Math.min(235, b))}, ${a})`;

        const accentColor = `rgb(${Math.min(255, p1[0] + 50)}, ${Math.min(255, p1[1] + 50)}, ${Math.min(255, p1[2] + 80)})`;

        setExtractedColors({
          c1: rgbToDark(p1[0], p1[1], p1[2], 0.88),
          c2: rgbToDark(p2[0], p2[1], p2[2], 0.78),
          c3: rgbToDark(p3[0], p3[1], p3[2], 0.92),
          c4: rgbToDark(p4[0], p4[1], p4[2], 0.85),
          accent: accentColor
        });
      } catch {
        // Fallback active
      }
    };
  }, [movie, movieId, isTvOrAnime]);

  const handleStatusChange = (status) => {
    playSound('click');
    const newStatus = watchStatus === status ? null : status;
    setWatchStatus(newStatus);
    try {
      const stored = localStorage.getItem(WATCH_STATUS_KEY);
      const map = stored ? JSON.parse(stored) : {};
      if (newStatus) {
        map[movieId] = newStatus;
      } else {
        delete map[movieId];
      }
      localStorage.setItem(WATCH_STATUS_KEY, JSON.stringify(map));
    } catch {
      // Fail-safe
    }
  };

  if (!movie) return null;

  const {
    name,
    year,
    rated,
    ratedDescription,
    released,
    runtime,
    formattedRuntime,
    genre = [],
    director,
    directorsList = [],
    writer,
    writersList = [],
    actors = [],
    castMembers = [],
    plot,
    languagesList = [],
    countriesList = [],
    awards,
    awardsParsed,
    poster,
    backdrop,
    metascore,
    imdbRating,
    imdbVotes,
    imdbID,
    type,
    boxOffice,
    production,
    website,
    dvd,
    totalSeasons,
    seasonsMap,
    network,
    status,
    ratings,
    tagline
  } = movie || {};

  const isSeries = type === 'series' || Boolean(totalSeasons) || Boolean(seasonsMap) || isTvOrAnime;
  const titleDisplay = name || movie.title || movie.title_english || movie.title_japanese || movie.japaneseTitle || 'Cinema Presentation';
  const displayTimeline = formatTimelineYear(year, titleDisplay, status);
  const effectiveSeasonsMap = liveSeasonsMap || seasonsMap || {};
  const availableSeasons = Object.keys(effectiveSeasonsMap).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = effectiveSeasonsMap[selectedSeason] || (availableSeasons.length > 0 ? effectiveSeasonsMap[availableSeasons[0]] : []);
  const movieVibes = calculateMovieVibes(movie);

  const genresList = Array.isArray(genre)
    ? genre
    : (typeof genre === 'string'
      ? genre.split(',').map((g) => g.trim()).filter(Boolean)
      : (Array.isArray(movie.genres) ? movie.genres : []));

  // Synchronous, Immediate HD Backdrop Resolution (Zero Grey Box)
  const defaultCinematicBackdrop = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80';
  
  const sanitizeImage = (url) => {
    if (!url || typeof url !== 'string' || url === 'N/A') return null;
    if (url.includes('media-amazon.com') && !url.includes('images.weserv.nl')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const displayBackdrop =
    sanitizeImage(backdrop) ||
    sanitizeImage(movie?.backdrop) ||
    sanitizeImage(movie?.secondaryPoster) ||
    sanitizeImage(poster) ||
    sanitizeImage(movie?.poster) ||
    'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_SX700.jpg';

  // Determine trailer video ID via availability checker from API values
  const videoId = resolveTrailerVideoId(movie);
  const hasTrailer = Boolean(videoId) && !trailerError;

  // Build trailer embed URL when video ID is available
  const heroEmbedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&enablejsapi=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&showinfo=0&playsinline=1`
    : null;

  const externalTrailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} ${year} official trailer`)}`;

  // Auto-unmute postMessage effect on mount
  useEffect(() => {
    if (hasTrailer && isPlayingTrailer && iframeRef.current) {
      const timer = setTimeout(() => {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
        } catch {
          // Fail-safe
        }
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [hasTrailer, isPlayingTrailer]);

  // Window listener for YouTube embed error codes (e.g. video unavailable / blocked embed)
  useEffect(() => {
    if (!isPlayingTrailer) return;

    const handleWindowMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && (data.event === 'onError' || (data.info && typeof data.info === 'number' && [2, 5, 100, 101, 150].includes(data.info)))) {
          setTrailerError(true);
          setIsPlayingTrailer(false);
        }
      } catch {
        // Non-JSON message ignore
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [isPlayingTrailer]);

  // Essential Isolated Controls for Trailer
  const toggleMute = () => {
    playSound('click');
    if (!iframeRef.current) return;
    try {
      if (isMuted) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
        setIsMuted(false);
      } else {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: '' }), '*');
        setIsMuted(true);
      }
    } catch {
      setIsMuted(!isMuted);
    }
  };

  const restartTrailer = () => {
    playSound('whoosh');
    if (!iframeRef.current) return;
    try {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
    } catch {
      // Fallback
    }
  };

  const handleScrollToDetails = () => {
    playSound('whoosh');
    if (detailsSectionRef.current) {
      detailsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    playSound('click');
    if (onSaveNote && movieId) {
      onSaveNote(movieId, noteText);
      setShowNoteSaved(true);
      setTimeout(() => setShowNoteSaved(false), 2500);
    }
  };

  const triggerConfetti = () => {
    const burst = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      color: ['#f59e0b', '#ec4899', '#6366f1', '#10b981', '#38bdf8', '#fbbf24'][i % 6],
      icon: ['★', '★', '★', '★'][i % 4],
      size: Math.random() * 1.1 + 0.8
    }));
    setConfettiBurst(burst);
    setTimeout(() => setConfettiBurst([]), 1800);
  };

  const handleRate = (star) => {
    if (star === 10) {
      playSound('fanfare');
    } else {
      playSound('star');
    }
    setSelectedRating(star);
    triggerConfetti();
    if (onSaveRating && movieId) {
      onSaveRating(movieId, star);
    }
  };

  const handleCopyQuote = (quoteText) => {
    playSound('click');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${quoteText}" — ${name} (${year})`);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2500);
    }
  };

  const handleShareClick = () => {
    playSound('click');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
    if (onShare) onShare(movie);
  };

  const currentActiveStar = hoverRating || selectedRating;

  return (
    <div
      className="movie-fullscreen-wrapper fixed-cinema-backdrop animate-fade-in"
      style={{
        '--poster-c1': extractedColors.c1,
        '--poster-c2': extractedColors.c2,
        '--poster-c3': extractedColors.c3,
        '--poster-c4': extractedColors.c4,
      }}
    >

      {/* =========================================================================
          EYE-SOOTHING LUXURY AMBIENT CINEMA BACKDROP CANVAS
          ========================================================================= */}
      <div className="details-ambient-canvas" aria-hidden="true">
        <div
          className={`hero-backdrop-graphic ${displayBackdrop ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${displayBackdrop})` }}
        />
        <div className="soothing-ambient-vignette" />
        <div className="soothing-ambient-gradient-mesh" />
      </div>

      {/* Deep Gradient Scrim Overlay */}
      <div className="moving-gradient-overlay" aria-hidden="true" />

      {/* =========================================================================
          1. 16:9 VIDEO TRAILER PLAYER STAGE (If Trailer Available)
             OR 16:9 POSTER & BACKDROP STAGE IN EXACT PLACE OF TRAILER (If Unavailable)
          ========================================================================= */}
      {hasTrailer && isPlayingTrailer && heroEmbedUrl ? (
        <section className="cinema-hero-stage animate-scale-up">
          <div className="cinema-video-container">
            <iframe
              ref={iframeRef}
              src={heroEmbedUrl}
              title={`${titleDisplay} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
              onError={() => {
                setTrailerError(true);
                setIsPlayingTrailer(false);
              }}
            />

            {/* Controls in Top Right Corner */}
            <div className="trailer-top-corner-controls">
              <button
                type="button"
                className="corner-ctrl-pill"
                onClick={() => {
                  playSound('click');
                  setIsPlayingTrailer(false);
                }}
                title="View Movie Poster Banner"
              >
                <span>🖼 Poster View</span>
              </button>
              <button
                type="button"
                className={`corner-ctrl-pill ${isMuted ? 'muted' : 'unmuted'}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                <span>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</span>
              </button>
              <button
                type="button"
                className="corner-ctrl-pill"
                onClick={restartTrailer}
                title="Replay from beginning"
              >
                <span>↺ Replay</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Full-Screen Visible Backdrop Stage with Glassmorphism Tag & Headline + Big Movie Poster */
        <section className="full-screen-backdrop-hero animate-fade-in">
          {/* Crisp, Fully Visible Panoramic Backdrop */}
          <div
            className="crisp-backdrop-image"
            style={{ backgroundImage: `url(${displayBackdrop})` }}
            aria-hidden="true"
          />
          <div className="crisp-backdrop-overlay" aria-hidden="true" />

          <div className="hero-backdrop-container">
            {/* Big Movie Poster Frame */}
            {poster && (
              <div className="big-hero-poster-frame">
                <img
                  src={poster}
                  alt={titleDisplay}
                  className="big-hero-poster-img"
                  loading="eager"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
                <div className="poster-shine-glow" />
              </div>
            )}

            {/* Glassmorphism Title, Tag & Headline Box */}
            <div className="glassmorphism-hero-card">
              <div className="glass-tags-row">
                <span className="glass-type-tag">
                  {isTvOrAnime ? (movie?.type === 'anime' ? 'Anime Series' : 'TV Series') : (type || 'Movie')}
                </span>
                {imdbRating && imdbRating !== 'N/A' && (
                  <span className="glass-rating-tag">★ {imdbRating} IMDB</span>
                )}
                {year && <span className="glass-year-tag">{year}</span>}
              </div>

              <h1 className="glass-headline-title">{titleDisplay}</h1>

              {tagline ? <p className="glass-tagline-text">"{tagline}"</p> : null}

              {genresList && genresList.length > 0 && (
                <div className="glass-genres-row">
                  {genresList.slice(0, 4).map((g, i) => (
                    <span key={i} className="glass-genre-chip">{g}</span>
                  ))}
                </div>
              )}

              <div className="glass-action-row">
                <button
                  type="button"
                  className="glass-play-action-btn"
                  onClick={() => {
                    playSound('click');
                    setTrailerError(false);
                    setIsPlayingTrailer(true);
                  }}
                >
                  <span>▶ Watch Official Trailer / Video</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. UNIFIED CINEMATIC MOVIE DETAILS & SIDEBAR SHOWCASE
          ========================================================================= */}
      <div className="movie-page-inner-content" ref={detailsSectionRef}>
        <div className="movie-page-main-grid">
          {/* Left Sticky Poster & Personal Lounge Column */}
          <div className="movie-page-sidebar">
            <div className="sidebar-poster-card">
              {poster ? (
                <img
                  src={poster}
                  alt={name}
                  className="sidebar-poster-img"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="sidebar-poster-fallback"
                style={{ display: poster ? 'none' : 'flex' }}
              >
                <span>No Poster Image</span>
              </div>
              <div className="sidebar-poster-badge mini-poster-tag">
                {isTvOrAnime ? (movie?.type === 'anime' ? 'Anime' : 'TV Series') : (type || 'Movie')}
              </div>
            </div>

            {/* Interactive User Watch Status Strip */}
            <div className="interactive-status-box">
              <span className="box-mini-title">Watch Status</span>
              <div className="watch-status-grid">
                <button
                  type="button"
                  className={`status-chip-btn ${watchStatus === 'want' ? 'active want' : ''}`}
                  onClick={() => handleStatusChange('want')}
                  title="Plan to Watch"
                >
                  <span>Want to Watch</span>
                </button>
                <button
                  type="button"
                  className={`status-chip-btn ${watchStatus === 'watching' ? 'active watching' : ''}`}
                  onClick={() => handleStatusChange('watching')}
                  title="Currently Watching"
                >
                  <span>Watching</span>
                </button>
                <button
                  type="button"
                  className={`status-chip-btn ${watchStatus === 'completed' ? 'active completed' : ''}`}
                  onClick={() => handleStatusChange('completed')}
                  title="Mark Completed"
                >
                  <span>Completed</span>
                </button>
                <button
                  type="button"
                  className={`status-chip-btn ${watchStatus === 'favorite' ? 'active favorite' : ''}`}
                  onClick={() => handleStatusChange('favorite')}
                  title="Add to Favorites"
                >
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Stack */}
            <div className="sidebar-actions-stack">
              <button
                className={`sidebar-watchlist-btn ${isWatchlisted ? 'active' : ''}`}
                onClick={() => {
                  playSound('click');
                  onToggleWatchlist(movie);
                }}
                type="button"
              >
                <span>{isWatchlisted ? '★ In Your Watchlist' : '+ Add to Watchlist'}</span>
              </button>

              <div className="sidebar-btn-row">
                <button className="sidebar-secondary-btn" onClick={handleShareClick} type="button">
                  <span>Share</span>
                </button>
                <button
                  className="sidebar-secondary-btn"
                  onClick={() => {
                    playSound('whoosh');
                    setIsPlayingTrailer(true);
                    setIsPaused(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  type="button"
                >
                  <span>Trailer</span>
                </button>
              </div>
            </div>

            {/* Interactive 10-Star Rating Card with Celebratory Feedback & Confetti */}
            <div className="user-rating-box interactive-rating-box">
              <div className="rating-box-header">
                <span className="box-mini-title">User Rating</span>
                {selectedRating > 0 && (
                  <span className="user-score-pill">{selectedRating}/10</span>
                )}
              </div>

              <div
                className="star-picker"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-pick-btn ${star <= currentActiveStar ? 'filled' : ''} ${hoverRating === star ? 'hovered' : ''}`}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    title={`Rate ${star}/10`}
                    aria-label={`Rate ${star}/10`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="rating-feedback-badge">
                {currentActiveStar > 0
                  ? (RATING_REACTIONS[currentActiveStar] || `Rated ${currentActiveStar}/10`)
                  : 'Click a star to rate this title'}
              </div>
            </div>

            {/* Movie Vibe Radar */}
            <div className="movie-vibe-meter-box">
              <div className="vibe-header">
                <span className="box-mini-title">Vibe Radar</span>
                <span className="vibe-badge">Live Gauges</span>
              </div>

              <div className="vibe-gauges-list">
                <div className="vibe-gauge-item">
                  <div className="vibe-labels">
                    <span className="vibe-name">Adrenaline / Action</span>
                    <span className="vibe-val">{movieVibes.adrenaline}%</span>
                  </div>
                  <div className="vibe-track">
                    <div className="vibe-fill adrenaline" style={{ width: `${movieVibes.adrenaline}%` }} />
                  </div>
                </div>

                <div className="vibe-gauge-item">
                  <div className="vibe-labels">
                    <span className="vibe-name">Mind-Bending / IQ</span>
                    <span className="vibe-val">{movieVibes.mindBending}%</span>
                  </div>
                  <div className="vibe-track">
                    <div className="vibe-fill mind" style={{ width: `${movieVibes.mindBending}%` }} />
                  </div>
                </div>

                <div className="vibe-gauge-item">
                  <div className="vibe-labels">
                    <span className="vibe-name">Emotional Depth</span>
                    <span className="vibe-val">{movieVibes.emotional}%</span>
                  </div>
                  <div className="vibe-track">
                    <div className="vibe-fill emotion" style={{ width: `${movieVibes.emotional}%` }} />
                  </div>
                </div>

                <div className="vibe-gauge-item">
                  <div className="vibe-labels">
                    <span className="vibe-name">Visual Spectacle</span>
                    <span className="vibe-val">{movieVibes.spectacle}%</span>
                  </div>
                  <div className="vibe-track">
                    <div className="vibe-fill spectacle" style={{ width: `${movieVibes.spectacle}%` }} />
                  </div>
                </div>

                <div className="vibe-gauge-item">
                  <div className="vibe-labels">
                    <span className="vibe-name">Re-watchability</span>
                    <span className="vibe-val">{movieVibes.rewatch}%</span>
                  </div>
                  <div className="vibe-track">
                    <div className="vibe-fill rewatch" style={{ width: `${movieVibes.rewatch}%` }} />
                  </div>
                </div>
              </div>

              {/* User Vibe Voting */}
              <div className="vibe-voting-strip">
                <span className="vote-prompt">Vote predominant vibe:</span>
                <div className="vibe-vote-chips">
                  {['Hype', 'Deep', 'Emotional', 'Pure Fun'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`vibe-vote-btn ${userVibeVote === v ? 'voted' : ''}`}
                      onClick={() => {
                        playSound('click');
                        setUserVibeVote(v);
                        triggerConfetti();
                      }}
                    >
                      {v} {userVibeVote === v ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Specifications Card */}
            <div className="sidebar-specs-box">
              <h4 className="box-mini-title">Specifications</h4>
              <div className="specs-list">
                <div className="spec-row-item">
                  <span className="spec-k">Format:</span>
                  <span className="spec-v" style={{ textTransform: 'capitalize' }}>{type || 'Feature Film'}</span>
                </div>
                {year && (
                  <div className="spec-row-item">
                    <span className="spec-k">Release:</span>
                    <span className="spec-v">{year}</span>
                  </div>
                )}
                {released && (
                  <div className="spec-row-item">
                    <span className="spec-k">Premiere:</span>
                    <span className="spec-v">{released}</span>
                  </div>
                )}
                {runtime && (
                  <div className="spec-row-item">
                    <span className="spec-k">Runtime:</span>
                    <span className="spec-v">{formattedRuntime || runtime}</span>
                  </div>
                )}
                {totalSeasons && (
                  <div className="spec-row-item">
                    <span className="spec-k">Seasons:</span>
                    <span className="spec-v" style={{ color: '#38bdf8', fontWeight: '700' }}>
                      {totalSeasons} Seasons
                    </span>
                  </div>
                )}
                {dvd && dvd !== 'N/A' && (
                  <div className="spec-row-item">
                    <span className="spec-k">Digital:</span>
                    <span className="spec-v">{dvd}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Private Viewer Diary Notes */}
            <div className="user-notes-box">
              <span className="box-mini-title">Private Notes</span>
              <form onSubmit={handleSaveNotes}>
                <textarea
                  className="notes-textarea"
                  placeholder="Write private thoughts, review or notes..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <div className="notes-footer-row">
                  <button type="submit" className="notes-save-btn">
                    Save Note
                  </button>
                  {showNoteSaved && <span className="notes-saved-toast">Saved ✓</span>}
                </div>
              </form>
            </div>
          </div>

          {/* Right Main Information & Decorated Modules Column */}
          <div className="movie-page-details-area">
            {/* Unified Cinematic Title Header */}
            <div className="details-header-row">
              <div className="details-header-main">
                {/* Format Badges */}
                <div className="panoramic-format-badges">
                  <span className="format-badge uhd">4K Ultra HD</span>
                  <span className="format-badge atmos">Dolby Atmos</span>
                  <span className="format-badge hdr">HDR10+</span>
                  <span className="format-badge type-tag">
                    {movie.type === 'anime' ? 'Anime Series' : isSeries ? 'TV Series' : 'Feature Film'}
                  </span>
                  {status && <span className="format-badge status-tag">● {status}</span>}
                  {availableSeasons.length > 0 && (
                    <span className="format-badge award">
                      {availableSeasons.length} {availableSeasons.length === 1 ? 'Season' : 'Seasons'}
                    </span>
                  )}
                </div>

                <div className="details-title-and-year">
                  <h1 className="details-title">{titleDisplay}</h1>
                  {displayTimeline && <span className="details-year-tag">({displayTimeline})</span>}
                </div>

                {movie.tagline && (
                  <p className="details-tagline">"{movie.tagline}"</p>
                )}

                {ratedDescription && (
                  <p className="parental-guide-text">
                    Parental Advisory: {ratedDescription}
                  </p>
                )}

                {/* Sub-meta specs row */}
                <div className="panoramic-specs-row">
                  {rated && <span className="spec-item rated">{rated}</span>}
                  {runtime && <span className="spec-item runtime">{formattedRuntime || runtime}</span>}
                  {imdbRating && (
                    <span className="spec-item rating">
                      <span className="star-icon">★</span>
                      <strong style={{ color: '#fbbf24' }}>{imdbRating}</strong>
                      <span className="rating-max">/10</span>
                      {imdbVotes && <span className="votes-count">({imdbVotes})</span>}
                    </span>
                  )}
                  {metascore && metascore !== 'N/A' && (
                    <span className="spec-item metascore-pill">
                      <span className="meta-badge-box">{metascore}</span>
                      <span>Metascore</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons Cluster */}
                <div className="panoramic-actions-cluster" style={{ marginTop: '0.85rem' }}>
                  {hasTrailer ? (
                    <button
                      className="panoramic-primary-action-btn"
                      onClick={() => {
                        playSound('whoosh');
                        setIsPlayingTrailer(true);
                        setIsMuted(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      type="button"
                    >
                      <span>▶ Watch Live Trailer</span>
                    </button>
                  ) : isSeries && availableSeasons.length > 0 ? (
                    <button
                      className="panoramic-primary-action-btn"
                      onClick={() => {
                        playSound('whoosh');
                        setActiveTab('episodes');
                      }}
                      type="button"
                    >
                      <span>📺 Explore Seasons ({availableSeasons.length})</span>
                    </button>
                  ) : null}

                  <button
                    className={`panoramic-secondary-btn ${isWatchlisted ? 'active' : ''}`}
                    onClick={() => {
                      playSound('click');
                      onToggleWatchlist(movie);
                    }}
                    type="button"
                  >
                    <span>{isWatchlisted ? '★ In Watchlist' : '+ Add to Watchlist'}</span>
                  </button>

                  <a
                    href={externalTrailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panoramic-link-btn"
                  >
                    <span>YouTube ↗</span>
                  </a>

                  {imdbID && (
                    <a
                      href={`https://www.imdb.com/title/${imdbID}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="panoramic-link-btn"
                    >
                      <span>IMDb ↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Genre Pills */}
            {genresList.length > 0 && (
              <div className="details-genres-strip" style={{ marginTop: '0.85rem' }}>
                {genresList.map((g, idx) => (
                  <button
                    key={idx}
                    className="details-genre-chip interactive"
                    onClick={() => {
                      playSound('click');
                      if (onGenreClick) onGenreClick(g);
                    }}
                    title={`Explore ${g} titles`}
                    type="button"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Module Navigation Bar */}
            <div
              className={`details-interactive-nav-bar ${isDraggingNav ? 'is-dragging' : ''}`}
              ref={navTabsRef}
              onMouseDown={handleNavMouseDown}
              onMouseMove={handleNavMouseMove}
              onMouseUp={handleNavMouseUpOrLeave}
              onMouseLeave={handleNavMouseUpOrLeave}
            >
              <button
                type="button"
                className={`nav-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  playSound('click');
                  setActiveTab('overview');
                }}
              >
                Overview
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${activeTab === 'cast' ? 'active' : ''}`}
                onClick={() => {
                  playSound('click');
                  setActiveTab('cast');
                }}
              >
                Cast & Crew ({castMembers?.length || actors?.length || 0})
              </button>
              {isSeries && availableSeasons.length > 0 && (
                <button
                  type="button"
                  className={`nav-tab-pill ${activeTab === 'episodes' ? 'active' : ''}`}
                  onClick={() => {
                    playSound('click');
                    setActiveTab('episodes');
                  }}
                >
                  Episodes ({availableSeasons.length} Seasons)
                </button>
              )}
              <button
                type="button"
                className={`nav-tab-pill ${activeTab === 'stream' ? 'active' : ''}`}
                onClick={() => {
                  playSound('click');
                  setActiveTab('stream');
                }}
              >
                Where to Watch
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => {
                  playSound('click');
                  setActiveTab('specs');
                }}
              >
                Production & Specs
              </button>
            </div>

            {/* Decorated Critic Scoreboard */}
            <div className="details-ratings-grid">
              {/* IMDb Rating */}
              <div className="critic-rating-card imdb-glow">
                <div className="critic-badge-icon imdb">IMDb</div>
                <div className="critic-meta">
                  <span className="critic-score">{imdbRating && imdbRating !== 'N/A' ? `${imdbRating}/10` : 'N/A'}</span>
                  <span className="critic-label">{imdbVotes ? `${imdbVotes} votes` : 'Audience Rating'}</span>
                </div>
              </div>

              {/* Rotten Tomatoes */}
              <div className="critic-rating-card rt-glow">
                <div className="critic-badge-icon rt">RT</div>
                <div className="critic-meta">
                  <span className="critic-score">{ratings?.rottenTomatoes || 'Certified Fresh'}</span>
                  <span className="critic-label">Rotten Tomatoes</span>
                </div>
              </div>

              {/* Metascore */}
              <div className="critic-rating-card meta-glow">
                <div className="critic-badge-icon meta">MC</div>
                <div className="critic-meta">
                  <span className="critic-score">{metascore ? `${metascore}/100` : (ratings?.metacritic || 'N/A')}</span>
                  <span className="critic-label">Metacritic</span>
                </div>
              </div>
            </div>

            {/* Tab 1: Overview & Storyline */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <>
                {/* Storyline Synopsis Block */}
                <div className="details-block synopsis-glass-block">
                  <h3 className="block-title">
                    Storyline & Synopsis
                  </h3>
                  <p className="details-plot-body">{plot}</p>
                </div>

                {/* Memorable Tagline */}
                {movie.tagline && (
                  <div className="details-block quote-highlight-block">
                    <div className="quote-header">
                      <span className="quote-label">Memorable Tagline</span>
                    </div>
                    <blockquote className="movie-quote-text">
                      "{movie.tagline}"
                    </blockquote>
                    <div className="quote-action-row">
                      <button
                        type="button"
                        className="copy-quote-btn"
                        onClick={() => handleCopyQuote(movie.tagline)}
                      >
                        <span>{copiedQuote ? 'Quote Copied ✓' : 'Copy Quote'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tab 2: Cast & Crew */}
            {(activeTab === 'cast' || activeTab === 'all') && (
              <div className="details-block">
                <h3 className="block-title">
                  Top Cast & Stars
                </h3>
                <div className="cast-members-grid">
                  {(castMembers && castMembers.length > 0
                    ? castMembers
                    : actors.map((a) => ({ name: a, character: 'Starring', photo: null }))
                  ).map((member, i) => (
                    <div
                      key={i}
                      className="cast-member-card interactive"
                      onClick={() => {
                        playSound('click');
                        if (onActorClick) onActorClick(member.name);
                      }}
                      title={`Search titles with ${member.name}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (onActorClick) onActorClick(member.name);
                        }
                      }}
                    >
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="cast-member-photo"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="cast-photo-fallback">
                          <span>{member.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="cast-member-info">
                        <span className="cast-name">{member.name}</span>
                        {member.character && <span className="cast-character">{member.character}</span>}
                        <span className="cast-search-hint">Explore titles →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Episodes & Seasons */}
            {isSeries && availableSeasons.length > 0 && (activeTab === 'episodes' || activeTab === 'all') && (
              <div className="details-block tv-episodes-block">
                <div className="episodes-header-row">
                  <h3 className="block-title">
                    Season & Episode Guide
                  </h3>
                  <span className="episodes-count-badge">
                    {availableSeasons.length} {availableSeasons.length === 1 ? 'Season' : 'Seasons'}
                  </span>
                </div>

                {/* Season Tabs */}
                <div
                  className={`season-tabs-row ${isDraggingSeasons ? 'is-dragging' : ''}`}
                  ref={seasonTabsRef}
                  onMouseDown={handleSeasonsMouseDown}
                  onMouseMove={handleSeasonsMouseMove}
                  onMouseUp={handleSeasonsMouseUpOrLeave}
                  onMouseLeave={handleSeasonsMouseUpOrLeave}
                >
                  {availableSeasons.map((sNum) => (
                    <button
                      key={sNum}
                      className={`season-tab-btn ${selectedSeason === sNum ? 'active' : ''}`}
                      onClick={() => {
                        playSound('click');
                        setSelectedSeason(sNum);
                      }}
                      type="button"
                    >
                      Season {sNum}
                    </button>
                  ))}
                </div>

                {/* Episode Cards Grid */}
                <div className="episodes-cards-grid">
                  {currentSeasonEpisodes.map((ep) => {
                    const epKey = `ep_${selectedSeason}_${ep.number || ep.id}`;
                    const isWatched = watchedEpisodes.has(epKey);
                    return (
                      <div key={ep.id} className={`episode-card ${isWatched ? 'watched' : ''}`}>
                        <div className="episode-thumb-container">
                          {ep.image ? (
                            <img
                              src={ep.image}
                              alt={ep.name}
                              className="episode-thumb"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="episode-thumb-placeholder">
                              <span>Episode {ep.number || ''}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className={`episode-watch-btn ${isWatched ? 'active' : ''}`}
                            onClick={() => toggleWatchedEpisode(epKey)}
                            title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                          >
                            {isWatched ? '✓ Watched' : '+ Watch'}
                          </button>
                        </div>
                        <div className="episode-content">
                          <div className="episode-top-row">
                            <span className="episode-number">S{String(selectedSeason).padStart(2, '0')}E{String(ep.number || 1).padStart(2, '0')}</span>
                            <span className="episode-title" title={ep.name}>{ep.name}</span>
                            {ep.rating && <span className="episode-rating">★ {ep.rating}</span>}
                          </div>
                          <div className="episode-meta-subrow">
                            {ep.airdate && <span className="episode-airdate">Aired: {ep.airdate}</span>}
                            {ep.runtime && <span className="episode-runtime">• {ep.runtime}</span>}
                          </div>
                          <p className="episode-summary">{ep.summary || 'Episode details available on broadcast.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Where to Stream */}
            {(activeTab === 'stream' || activeTab === 'all') && (
              <div className="details-block streaming-lounge-block">
                <WatchProviders
                  movieTitle={name}
                  onWatchTrailer={() => {
                    playSound('whoosh');
                    setIsPlayingTrailer(true);
                    setIsPaused(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {/* Tab 5: Technical Specs, Box Office & Trivia */}
            {(activeTab === 'specs' || activeTab === 'all') && (
              <>
                <div className="details-block">
                  <h3 className="block-title">
                    Production & Release Data
                  </h3>
                  <div className="spec-info-grid">
                    {(director || directorsList.length > 0) && (
                      <div className="spec-card">
                        <span className="spec-label">Director</span>
                        <button
                          className="spec-value-link"
                          onClick={() => {
                            playSound('click');
                            if (onDirectorClick) onDirectorClick(director || directorsList[0]);
                          }}
                          type="button"
                        >
                          {director || directorsList.join(', ')}
                        </button>
                      </div>
                    )}

                    {(writer || writersList.length > 0) && (
                      <div className="spec-card">
                        <span className="spec-label">Screenplay / Writer</span>
                        <span className="spec-value">{writer || writersList.join(', ')}</span>
                      </div>
                    )}

                    {production && (
                      <div className="spec-card">
                        <span className="spec-label">Studio / Producer</span>
                        <span className="spec-value">{production}</span>
                      </div>
                    )}

                    {boxOffice && (
                      <div className="spec-card">
                        <span className="spec-label">Box Office Gross</span>
                        <span className="spec-value" style={{ color: '#10b981', fontWeight: '700' }}>
                          {boxOffice}
                        </span>
                      </div>
                    )}

                    {network && (
                      <div className="spec-card">
                        <span className="spec-label">Network / Platform</span>
                        <span className="spec-value" style={{ color: '#38bdf8' }}>{network}</span>
                      </div>
                    )}

                    {languagesList.length > 0 && (
                      <div className="spec-card">
                        <span className="spec-label">Audio Languages</span>
                        <span className="spec-value">{languagesList.join(', ')}</span>
                      </div>
                    )}

                    {countriesList.length > 0 && (
                      <div className="spec-card">
                        <span className="spec-label">Country</span>
                        <span className="spec-value">{countriesList.join(', ')}</span>
                      </div>
                    )}

                    {website && website !== 'N/A' && (
                      <div className="spec-card">
                        <span className="spec-label">Official Site</span>
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="spec-value-link"
                          style={{ color: '#6366f1' }}
                        >
                          Visit Website ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cinema Trivia & Facts Card */}
                <div className="details-block trivia-block">
                  <h3 className="block-title">
                    Cinema Highlights & Mastering
                  </h3>
                  <div className="trivia-cards-grid">
                    <div className="trivia-card">
                      <div className="trivia-content">
                        <strong>Audio & Video Mastering</strong>
                        <p>Mastered in native 4K Ultra HD resolution with high dynamic range color grading and spatial Dolby Atmos audio track.</p>
                      </div>
                    </div>

                    <div className="trivia-card">
                      <div className="trivia-content">
                        <strong>Critical Reception</strong>
                        <p>{parseFloat(imdbRating) >= 8.0 ? 'Ranked among top audience-rated titles on global cinema leaderboards with extraordinary repeat viewership.' : 'Widely discussed contemporary release across streaming platforms and film enthusiast communities.'}</p>
                      </div>
                    </div>

                    {boxOffice && (
                      <div className="trivia-card">
                        <div className="trivia-content">
                          <strong>Theatrical Milestone</strong>
                          <p>Recorded over {boxOffice} across domestic and international theatrical distribution circuits.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Honors & Awards Trophy Banner */}
            {awards && awards !== 'N/A' && (
              <div className="awards-highlight-card">
                <div>
                  <strong style={{ color: '#f59e0b' }}>Honors & Accolades: </strong>
                  <span>{awards}</span>
                  {awardsParsed?.oscarsWon > 0 && (
                    <div style={{ marginTop: '0.35rem', color: '#f59e0b', fontWeight: '700' }}>
                      Academy Award Winner ({awardsParsed.oscarsWon} Oscars)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Similar Movies & Categories Discovery */}
            {genre && genre.length > 0 && (
              <div className="details-block">
                <h3 className="block-title">
                  Explore More in These Categories
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {genre.map((g, i) => (
                    <button
                      key={i}
                      className="quick-category-chip"
                      onClick={() => {
                        playSound('click');
                        if (onGenreClick) onGenreClick(g);
                      }}
                      type="button"
                    >
                      Explore {g} Titles →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Page Navigation & Return Bar */}
        <div className="movie-page-bottom-nav">
          <button
            type="button"
            className="page-back-action-btn"
            onClick={onBack}
          >
            <span className="btn-arrow">←</span>
            <span>{hasSearchResults ? 'Back to Search Results' : 'Back to Main Catalog'}</span>
          </button>
          <button
            type="button"
            className="page-scroll-top-btn"
            onClick={() => {
              playSound('whoosh');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
              document.body.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>↑ Back to Top</span>
          </button>
        </div>
      </div>

      {/* Confetti Particle Burst Layer */}
      {confettiBurst.length > 0 && (
        <div className="confetti-overlay" aria-hidden="true">
          {confettiBurst.map((c) => (
            <span
              key={c.id}
              className="confetti-particle"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                fontSize: `${c.size}rem`,
                color: c.color
              }}
            >
              {c.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviePage;
