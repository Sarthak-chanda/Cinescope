import React from 'react';

const Nav = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  watchlistCount = 0,
  onOpenWatchlist,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
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

        {/* Clean, Standard Search Bar */}
        <div className="search-container">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-icon-wrapper">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="movie-search-input"
              autoComplete="off"
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