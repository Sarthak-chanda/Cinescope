import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSearchSuggestions } from '../services/movieApi';

const HighlightedText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  const escaped = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="suggestion-query-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

const Nav = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  watchlistCount = 0,
  onOpenWatchlist,
  recentSearches = [],
  onClearRecentSearches,
  onRemoveRecentSearch,
  onSelectMovie,
  onQuickSearch,
  onResetToHome,
  theme = 'dark',
  onToggleTheme,
  selectedMovie,
  onBack,
  canGoBack,
  hasSearchResults
}) => {
  const quickDiscoveries = [
    { label: 'Kalki 2898 AD', query: 'Kalki 2898 AD' },
    { label: 'Stree 2', query: 'Stree 2' },
    { label: 'Jawan', query: 'Jawan' },
    { label: 'RRR', query: 'RRR' },
    { label: 'Panchayat', query: 'Panchayat' },
    { label: 'Sacred Games', query: 'Sacred Games' },
    { label: 'Kantara', query: 'Kantara' },
    { label: 'Mirzapur', query: 'Mirzapur' },
    { label: 'Manjummel Boys', query: 'Manjummel Boys' },
    { label: 'Dune', query: 'Dune' },
    { label: 'Interstellar', query: 'Interstellar' },
    { label: 'Stranger Things', query: 'Stranger Things' }
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Fetch suggestions with 180ms debounce and abort control
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = searchTerm ? searchTerm.trim() : '';

    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    const currentSignal = abortControllerRef.current.signal;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSearchSuggestions(trimmed, currentSignal);
        if (!currentSignal.aborted) {
          setSuggestions(results || []);
          setIsLoading(false);
          setActiveIndex(-1);
        }
      } catch (err) {
        if (!currentSignal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (item) => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchTerm(item.name);
    if (onSelectMovie) {
      onSelectMovie(item);
    } else {
      onSearch(item.name);
    }
  };

  const handleSelectRecent = (term) => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchTerm(term);
    onQuickSearch(term);
  };

  const handleSelectTrending = (query) => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchTerm(query);
    onQuickSearch(query);
  };

  // Keyboard navigation calculation
  const isQueryMode = Boolean(searchTerm && searchTerm.trim().length > 0);
  const totalNavigableItems = isQueryMode
    ? suggestions.length + (suggestions.length > 0 ? 1 : 0)
    : recentSearches.length + quickDiscoveries.length;

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalNavigableItems === 0) return;
      setActiveIndex((prev) => (prev + 1 >= totalNavigableItems ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalNavigableItems === 0) return;
      setActiveIndex((prev) => (prev - 1 < 0 ? totalNavigableItems - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        if (isQueryMode) {
          if (activeIndex < suggestions.length) {
            handleSelectSuggestion(suggestions[activeIndex]);
          } else {
            // Last item: "Search all for query"
            handleSubmit();
          }
        } else {
          if (activeIndex < recentSearches.length) {
            handleSelectRecent(recentSearches[activeIndex]);
          } else {
            const trendIdx = activeIndex - recentSearches.length;
            if (quickDiscoveries[trendIdx]) {
              handleSelectTrending(quickDiscoveries[trendIdx].query);
            }
          }
        }
      } else {
        handleSubmit(e);
      }
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        {/* Brand & Back Button */}
        <div className="navbar-brand-group">
          <div className="brand" onClick={onResetToHome} title="Go to CineScope Home">
            <div className="brand-icon">
              <span>🎬</span>
            </div>
            <div className="brand-info">
              <span className="brand-title">CineScope</span>
              <span className="brand-tagline">Cinema & TV Explorer</span>
            </div>
          </div>

          {canGoBack && onBack && (
            <button
              type="button"
              className="nav-header-back-btn animate-fade-in"
              onClick={onBack}
              title="Go back to previous screen"
            >
              <span className="back-arrow">←</span>
              <span className="back-text">{selectedMovie ? (hasSearchResults ? 'Results' : 'Home') : 'Home'}</span>
            </button>
          )}
        </div>

        {/* Search Bar with Live Suggestions Dropdown */}
        <div className="search-container" ref={searchContainerRef}>
          <form className="search-form" onSubmit={handleSubmit} role="search">
            <div className="search-icon-wrapper">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search movies, TV shows, anime..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              id="movie-search-input"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls="search-suggestions-menu"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClear}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}

            {/* Standard Search Button */}
            <button type="submit" className="search-submit-btn" id="search-submit-btn" aria-label="Submit search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-btn-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="search-btn-text">Search</span>
            </button>
          </form>

          {/* Dynamic Search Suggestions Dropdown */}
          {isOpen && (
            <div
              className="search-suggestions-dropdown animate-fade-in"
              id="search-suggestions-menu"
              role="listbox"
            >
              {isQueryMode ? (
                /* ==================== QUERY MODE SUGGESTIONS ==================== */
                <div className="suggestions-query-section">
                  {isLoading && suggestions.length === 0 ? (
                    <div className="suggestions-loading-state">
                      <div className="suggestion-skeleton-row">
                        <div className="skeleton-thumb" />
                        <div className="skeleton-info">
                          <div className="skeleton-line long" />
                          <div className="skeleton-line short" />
                        </div>
                      </div>
                      <div className="suggestion-skeleton-row">
                        <div className="skeleton-thumb" />
                        <div className="skeleton-info">
                          <div className="skeleton-line long" />
                          <div className="skeleton-line short" />
                        </div>
                      </div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <div className="suggestions-header">
                        <span className="suggestions-header-label">Top Matching Titles</span>
                        {isLoading && <span className="suggestions-micro-spinner" aria-label="Updating suggestions" />}
                      </div>

                      <div className="suggestions-list">
                        {suggestions.map((item, index) => {
                          const isActive = activeIndex === index;
                          return (
                            <div
                              key={item.id || item.imdbID || index}
                              className={`suggestion-item ${isActive ? 'is-active' : ''}`}
                              onClick={() => handleSelectSuggestion(item)}
                              onMouseEnter={() => setActiveIndex(index)}
                              role="option"
                              aria-selected={isActive}
                            >
                              <div className="suggestion-poster-wrap">
                                {item.poster && item.poster !== 'N/A' ? (
                                  <img
                                    src={item.poster}
                                    alt=""
                                    loading="lazy"
                                    className="suggestion-poster-img"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextElementSibling) {
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="suggestion-poster-fallback"
                                  style={{ display: item.poster && item.poster !== 'N/A' ? 'none' : 'flex' }}
                                >
                                  🎬
                                </div>
                              </div>

                              <div className="suggestion-details">
                                <div className="suggestion-title">
                                  <HighlightedText text={item.name} highlight={searchTerm} />
                                </div>
                                <div className="suggestion-meta">
                                  <span className="suggestion-badge-type">
                                    {item.type || 'Movie'}
                                  </span>
                                  {item.year && (
                                    <span className="suggestion-meta-item">{item.year}</span>
                                  )}
                                  {item.imdbRating && (
                                    <span className="suggestion-rating">
                                      ⭐ {item.imdbRating}
                                    </span>
                                  )}
                                  {item.genre && (
                                    <span className="suggestion-meta-genre">{item.genre}</span>
                                  )}
                                </div>
                              </div>

                              <div className="suggestion-arrow">→</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Quick Search CTA Row */}
                      <div
                        className={`suggestion-action-row ${activeIndex === suggestions.length ? 'is-active' : ''}`}
                        onClick={() => handleSubmit()}
                        onMouseEnter={() => setActiveIndex(suggestions.length)}
                      >
                        <div className="suggestion-action-left">
                          <span className="suggestion-action-icon">🔍</span>
                          <span>Search all results for "<strong>{searchTerm.trim()}</strong>"</span>
                        </div>
                        <kbd className="suggestion-kbd">↵ Enter</kbd>
                      </div>
                    </>
                  ) : (
                    <div className="suggestions-empty-state">
                      <p className="empty-text">No direct title matches found for "{searchTerm.trim()}"</p>
                      <button
                        type="button"
                        className="suggestion-empty-search-btn"
                        onClick={() => handleSubmit()}
                      >
                        Search all multi-engine catalogs ↵
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ==================== EMPTY / INITIAL MODE ==================== */
                <div className="suggestions-initial-section">
                  {recentSearches && recentSearches.length > 0 && (
                    <div className="suggestions-recent-group">
                      <div className="suggestions-header">
                        <div className="suggestions-header-left">
                          <span className="suggestions-header-icon">🕒</span>
                          <span className="suggestions-header-label">Recent Searches</span>
                        </div>
                        {onClearRecentSearches && (
                          <button
                            type="button"
                            className="suggestions-clear-recent-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearRecentSearches();
                            }}
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="recent-searches-list">
                        {recentSearches.map((term, idx) => {
                          const isActive = activeIndex === idx;
                          return (
                            <div
                              key={term}
                              className={`recent-search-row ${isActive ? 'is-active' : ''}`}
                              onClick={() => handleSelectRecent(term)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              role="option"
                              aria-selected={isActive}
                            >
                              <div className="recent-search-text">
                                <span className="recent-icon">↺</span>
                                <span>{term}</span>
                              </div>
                              {onRemoveRecentSearch && (
                                <button
                                  type="button"
                                  className="recent-remove-btn"
                                  title="Remove from recent searches"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveRecentSearch(term);
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trending Discoveries In Dropdown */}
                  <div className="suggestions-trending-group">
                    <div className="suggestions-header">
                      <div className="suggestions-header-left">
                        <span className="suggestions-header-icon">🔥</span>
                        <span className="suggestions-header-label">Trending Discoveries</span>
                      </div>
                    </div>
                    <div className="suggestions-chips-grid">
                      {quickDiscoveries.map((item, idx) => {
                        const globalIdx = (recentSearches?.length || 0) + idx;
                        const isActive = activeIndex === globalIdx;
                        return (
                          <button
                            key={item.query}
                            type="button"
                            className={`suggestion-chip ${isActive ? 'is-active' : ''}`}
                            onClick={() => handleSelectTrending(item.query)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions: Theme Toggle & Watchlist */}
        <div className="nav-actions">
          {/* Theme Toggler */}
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark and light theme"
          >
            <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* Watchlist Button */}
          <button
            className="watchlist-nav-btn"
            onClick={onOpenWatchlist}
            aria-label="View Watchlist"
          >
            <span>★</span>
            <span className="watchlist-btn-text">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="watchlist-badge-count">{watchlistCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Substrip for Popular Quick Searches */}
      <div className="nav-substrip">
        <div className="substrip-content">
          <div className="substrip-left">
            <span className="substrip-label">Trending Now:</span>
            <div className="chips-scroll-container">
              {quickDiscoveries.map((item) => (
                <button
                  key={item.query}
                  className="quick-chip"
                  onClick={() => onQuickSearch(item.query)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Nav;