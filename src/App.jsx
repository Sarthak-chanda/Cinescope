import React, { useState, useEffect, useCallback, useRef } from 'react';
import Nav from './components/Nav';
import Body from './components/Body';
import WatchlistModal from './components/WatchlistModal';
import TrailerModal from './components/TrailerModal';
import InitialCinemaLoader from './components/InitialCinemaLoader';
import { fetchMovieDetails, searchMoviesList } from './services/movieApi';
import './App.css';

const THEME_KEY = 'cinescope_theme_v4';
const WATCHLIST_KEY = 'cinescope_watchlist_v4';
const RECENT_KEY = 'cinescope_recent_searches_v4';
const NOTES_KEY = 'cinescope_user_notes_v4';
const RATINGS_KEY = 'cinescope_user_ratings_v4';

const App = () => {
  // Initial 2-second cinema startup and asset preloader
  const [initialLoading, setInitialLoading] = useState(true);
  const handleLoaderComplete = useCallback(() => setInitialLoading(false), []);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notfound, setNotfound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [activeGenre, setActiveGenre] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Trailer Modal State
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Sync theme with HTML document attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Fail-safe
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load watchlist from localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load recent searches
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load user notes
  const [userNotes, setUserNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load user ratings
  const [userRatings, setUserRatings] = useState(() => {
    try {
      const saved = localStorage.getItem(RATINGS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save watchlist
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {
      // Storage fail-safe
    }
  }, [watchlist]);

  // Save recent searches
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
    } catch {
      // Storage fail-safe
    }
  }, [recentSearches]);

  // Save user notes
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(userNotes));
    } catch {
      // Storage fail-safe
    }
  }, [userNotes]);

  // Save user ratings
  useEffect(() => {
    try {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(userRatings));
    } catch {
      // Storage fail-safe
    }
  }, [userRatings]);

  // Toast notification helper
  const showToast = (message, icon = '✨') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Add term to recent searches
  const saveRecentSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 8);
    });
  };

  // Dedicated in-app navigation history stack for 100% reliable "navigate -1"
  const navHistoryRef = useRef([]);

  /**
   * Main Search Function
   */
  const handleSearch = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Track history state
    if (selectedMovie) {
      navHistoryRef.current.push({ type: 'movie', movie: selectedMovie, searchResults, searchTerm, activeGenre, totalResults });
    }

    setLoading(true);
    setNotfound(false);
    setErrorMessage('');
    saveRecentSearch(trimmed);

    try {
      // 1. Search for matching list first
      const listRes = await searchMoviesList({ query: trimmed });

      if (listRes?.aborted) return;

      if (listRes?.results && listRes.results.length > 0) {
        setSelectedMovie(null);
        setSearchResults(listRes.results);
        setTotalResults(listRes.totalResults);
        window.location.hash = `search/${encodeURIComponent(trimmed)}`;
        return;
      }

      // 2. Fallback to exact title fetch
      const detailRes = await fetchMovieDetails({ title: trimmed });

      if (detailRes?.aborted) return;

      if (detailRes?.data) {
        setSelectedMovie(detailRes.data);
        setSearchResults([]);
        if (detailRes.data.imdbID) {
          window.location.hash = `movie/${detailRes.data.imdbID}`;
        }
      } else {
        setSelectedMovie(null);
        setSearchResults([]);
        setNotfound(true);
        setErrorMessage(listRes?.error || `No titles found matching "${trimmed}"`);
      }
    } catch (err) {
      setSelectedMovie(null);
      setSearchResults([]);
      setNotfound(true);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [selectedMovie, searchResults, searchTerm, activeGenre, totalResults]);

  // Load a movie or TV show directly by ID (for deep links / hash navigation)
  const loadMovieById = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setNotfound(false);
    try {
      const isTvId = id.startsWith('tv_');
      const tvIdNum = isTvId ? parseInt(id.replace('tv_', ''), 10) : null;

      const res = await fetchMovieDetails({
        imdbID: !isTvId ? id : '',
        tvmazeId: tvIdNum
      });

      if (res?.aborted) return;
      if (res?.data) {
        setSelectedMovie(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setNotfound(true);
        setErrorMessage(res?.error || 'Title not found');
      }
    } catch (err) {
      setNotfound(true);
      setErrorMessage(err.message || 'Error loading details');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a category / genre
   */
  const handleSelectGenre = useCallback(async (genreQuery) => {
    // Record current context in history stack before switching
    if (selectedMovie) {
      navHistoryRef.current.push({ type: 'movie', movie: selectedMovie, searchResults, searchTerm, activeGenre, totalResults });
    }

    setActiveGenre(genreQuery);
    setSearchTerm('');
    setLoading(true);
    setNotfound(false);
    setErrorMessage('');
    setSelectedMovie(null);
    window.location.hash = `category/${encodeURIComponent(genreQuery)}`;

    try {
      const listRes = await searchMoviesList({ query: genreQuery });

      if (listRes?.aborted) return;

      if (listRes?.results && listRes.results.length > 0) {
        setSearchResults(listRes.results);
        setTotalResults(listRes.totalResults);
        showToast(`Showing titles in "${genreQuery}"`, '🏷️');
      } else {
        setSearchResults([]);
        setNotfound(true);
        setErrorMessage(`No titles found for "${genreQuery}".`);
      }
    } catch (err) {
      setSearchResults([]);
      setNotfound(true);
      setErrorMessage(err.message || 'Error loading category titles.');
    } finally {
      setLoading(false);
    }
  }, [selectedMovie, searchResults, searchTerm, activeGenre, totalResults]);

  // Handle URL Hash Navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');

      if (!hash || hash === '') {
        setSelectedMovie(null);
        setSearchResults([]);
        setSearchTerm('');
        setActiveGenre(null);
        return;
      }

      if (hash.startsWith('movie/')) {
        const id = hash.replace('movie/', '');
        if (id && (!selectedMovie || (selectedMovie.imdbID !== id && selectedMovie.id !== id))) {
          loadMovieById(id);
        }
      } else if (hash.startsWith('category/')) {
        const cat = decodeURIComponent(hash.replace('category/', ''));
        if (cat && cat !== activeGenre) {
          handleSelectGenre(cat);
        }
      } else if (hash.startsWith('search/')) {
        const query = decodeURIComponent(hash.replace('search/', ''));
        if (query && query !== searchTerm) {
          setSearchTerm(query);
          handleSearch(query);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadMovieById, handleSearch, handleSelectGenre, selectedMovie, searchTerm, activeGenre]);

  // Select a specific movie from search grid or sections (instant when available)
  const handleSelectMovie = async (movieSummary) => {
    if (!movieSummary) return;

    // Push the EXACT previous context to the navigation stack
    if (selectedMovie) {
      navHistoryRef.current.push({
        type: 'movie',
        movie: selectedMovie,
        searchResults,
        searchTerm,
        activeGenre,
        totalResults
      });
    } else if (searchResults && searchResults.length > 0 && activeGenre) {
      navHistoryRef.current.push({
        type: 'category',
        activeGenre,
        searchResults,
        totalResults
      });
    } else if (searchResults && searchResults.length > 0 && searchTerm) {
      navHistoryRef.current.push({
        type: 'search',
        searchTerm,
        searchResults,
        totalResults
      });
    } else {
      navHistoryRef.current.push({
        type: 'home'
      });
    }

    if (movieSummary.plot && movieSummary.ratings && (movieSummary.castMembers || movieSummary.actors)) {
      setSelectedMovie(movieSummary);
      const navId = movieSummary.imdbID || movieSummary.id;
      if (navId) {
        window.location.hash = `movie/${navId}`;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setNotfound(false);

    try {
      const res = await fetchMovieDetails({
        imdbID: movieSummary.imdbID,
        title: movieSummary.name,
        tvmazeId: movieSummary.tvmazeId || (String(movieSummary.id).startsWith('tv_') ? parseInt(movieSummary.id.replace('tv_', ''), 10) : null)
      });

      if (res?.aborted) return;

      if (res?.data) {
        setSelectedMovie(res.data);
        const navId = res.data.imdbID || res.data.id;
        if (navId) {
          window.location.hash = `movie/${navId}`;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setNotfound(true);
        setErrorMessage(res?.error || 'Failed to load details.');
      }
    } catch (err) {
      setNotfound(true);
      setErrorMessage(err.message || 'Error loading details.');
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Navigate Back (-1) with 100% In-App Reliability
  const handleNavigateBack = () => {
    if (navHistoryRef.current.length > 0) {
      const prevState = navHistoryRef.current.pop();
      if (prevState) {
        if (prevState.type === 'movie' && prevState.movie) {
          setSelectedMovie(prevState.movie);
          setSearchResults(prevState.searchResults || []);
          setSearchTerm(prevState.searchTerm || '');
          setActiveGenre(prevState.activeGenre || null);
          const navId = prevState.movie.imdbID || prevState.movie.id;
          if (navId) {
            window.location.hash = `movie/${navId}`;
          }
        } else if (prevState.type === 'search') {
          setSelectedMovie(null);
          setSearchResults(prevState.searchResults || []);
          setSearchTerm(prevState.searchTerm || '');
          setTotalResults(prevState.totalResults || (prevState.searchResults || []).length);
          setActiveGenre(null);
          window.location.hash = `search/${encodeURIComponent(prevState.searchTerm || '')}`;
        } else if (prevState.type === 'category') {
          setSelectedMovie(null);
          setSearchResults(prevState.searchResults || []);
          setActiveGenre(prevState.activeGenre || null);
          setTotalResults(prevState.totalResults || (prevState.searchResults || []).length);
          setSearchTerm('');
          window.location.hash = `category/${encodeURIComponent(prevState.activeGenre || '')}`;
        } else {
          // Home
          setSelectedMovie(null);
          setSearchResults([]);
          setSearchTerm('');
          setActiveGenre(null);
          window.location.hash = '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Fallback if stack is empty
    if (selectedMovie) {
      setSelectedMovie(null);
      if (searchResults.length > 0 && activeGenre) {
        window.location.hash = `category/${encodeURIComponent(activeGenre)}`;
      } else if (searchResults.length > 0 && searchTerm) {
        window.location.hash = `search/${encodeURIComponent(searchTerm)}`;
      } else {
        setSearchResults([]);
        setSearchTerm('');
        setActiveGenre(null);
        window.location.hash = '';
      }
    } else {
      setSelectedMovie(null);
      setSearchResults([]);
      setSearchTerm('');
      setActiveGenre(null);
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle movie in watchlist
  const handleToggleWatchlist = (movie) => {
    if (!movie) return;
    const movieId = movie.id || movie.imdbID;
    const exists = watchlist.some((w) => (w.id || w.imdbID) === movieId);

    if (exists) {
      setWatchlist((prev) => prev.filter((w) => (w.id || w.imdbID) !== movieId));
      showToast(`Removed "${movie.name}" from Watchlist`, '🗑');
    } else {
      setWatchlist((prev) => [movie, ...prev]);
      showToast(`Added "${movie.name}" to your Watchlist!`, '★');
    }
  };

  // Remove specifically from watchlist drawer
  const handleRemoveFromWatchlist = (movie) => {
    const movieId = movie.id || movie.imdbID;
    setWatchlist((prev) => prev.filter((w) => (w.id || w.imdbID) !== movieId));
    showToast(`Removed "${movie.name}" from Watchlist`, '🗑');
  };

  // Save personal review note
  const handleSaveNote = (movieId, note) => {
    setUserNotes((prev) => ({
      ...prev,
      [movieId]: note
    }));
    showToast('Saved private note!', '💾');
  };

  // Save personal rating
  const handleSaveRating = (movieId, rating) => {
    setUserRatings((prev) => ({
      ...prev,
      [movieId]: rating
    }));
    showToast(`Rated ${rating}/10!`, '⭐');
  };

  // Open trailer modal
  const handleWatchTrailer = (movie) => {
    if (!movie) return;
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  // Share movie details via clipboard
  const handleShare = async (movie) => {
    if (!movie) return;
    const currentUrl = `${window.location.origin}${window.location.pathname}#movie/${movie.imdbID || movie.id}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        showToast('Direct link copied to clipboard!', '📋');
        return;
      } catch {
        // Fallback
      }
    }
    showToast(`Shared: "${movie.name}"`, '🔗');
  };

  // Quick search button clicked
  const handleQuickSearch = (title) => {
    setSearchTerm(title);
    handleSearch(title);
  };

  // Reset to home view
  const handleResetToHome = () => {
    navHistoryRef.current = [];
    setSearchTerm('');
    setSelectedMovie(null);
    setSearchResults([]);
    setNotfound(false);
    setErrorMessage('');
    setActiveGenre(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Nav
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        recentSearches={recentSearches}
        onQuickSearch={handleQuickSearch}
        onResetToHome={handleResetToHome}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Glass Left Back Navigation Button (navigate -1) */}
      {selectedMovie && (
        <button
          className="floating-glass-back-btn animate-fade-in"
          onClick={handleNavigateBack}
          title="Go back"
          type="button"
          aria-label="Back"
        >
          <span className="floating-btn-icon">←</span>
          <span className="floating-btn-label">Back</span>
        </button>
      )}

      {/* Main Content Area */}
      <Body
        loading={loading}
        notfound={notfound}
        errorMessage={errorMessage}
        selectedMovie={selectedMovie}
        searchResults={searchResults}
        totalResults={totalResults}
        searchTerm={searchTerm || activeGenre}
        onSelectMovie={handleSelectMovie}
        onBackToResults={handleNavigateBack}
        onQuickSearch={handleQuickSearch}
        onSelectGenre={handleSelectGenre}
        activeGenre={activeGenre}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onShare={handleShare}
        onActorClick={(actor) => handleQuickSearch(actor)}
        onGenreClick={(genre) => handleSelectGenre(genre)}
        onDirectorClick={(dir) => handleQuickSearch(dir)}
        userNotes={userNotes}
        onSaveNote={handleSaveNote}
        userRatings={userRatings}
        onSaveRating={handleSaveRating}
        onWatchTrailer={handleWatchTrailer}
      />

      {/* Watchlist Slide-Over Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectMovie={handleSelectMovie}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
      />

      {/* Trailer Streaming Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movie={trailerMovie}
      />

      {/* Toast Notifications */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* 2-Second Initial Cinema Asset Preloader on Hard Refresh */}
      {initialLoading && (
        <InitialCinemaLoader onComplete={handleLoaderComplete} />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          CineScope &copy; {new Date().getFullYear()} • Ultra-Fast Cinema & TV Explorer • Multi-Engine Powered
        </p>
      </footer>
    </div>
  );
};

export default App;