import React, { useState, useMemo } from 'react';
import Loading from './Loading';
import Notfound from './Notfound';
import MoviePage from './MoviePage';
import MovieCard from './MovieCard';
import Sections from './Sections';

const Body = ({
  loading,
  notfound,
  errorMessage,
  selectedMovie,
  searchResults = [],
  totalResults,
  searchTerm,
  onSelectMovie,
  onBackToResults,
  onQuickSearch,
  onSelectGenre,
  activeGenre,
  watchlist = [],
  onToggleWatchlist,
  onShare,
  onActorClick,
  onGenreClick,
  onDirectorClick,
  userNotes,
  onSaveNote,
  userRatings,
  onSaveRating,
  onWatchTrailer,
  onLoadMore,
  isLoadingMore,
  hasMore
}) => {
  // Sort state for search/genre results
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'newest', 'oldest', 'az'

  const isMovieWatchlisted = (movie) => {
    if (!movie) return false;
    const movieId = movie.id || movie.imdbID;
    return watchlist.some((w) => (w.id || w.imdbID) === movieId);
  };

  // Sorted search/category results
  const processedResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    let items = [...searchResults];

    // Sort items
    if (sortBy === 'rating') {
      items.sort((a, b) => {
        const rA = parseFloat(a.imdbRating) || 0;
        const rB = parseFloat(b.imdbRating) || 0;
        return rB - rA;
      });
    } else if (sortBy === 'newest') {
      items.sort((a, b) => {
        const yA = parseInt(String(a.year).match(/\d{4}/)?.[0] || '0', 10);
        const yB = parseInt(String(b.year).match(/\d{4}/)?.[0] || '0', 10);
        return yB - yA;
      });
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => {
        const yA = parseInt(String(a.year).match(/\d{4}/)?.[0] || '9999', 10);
        const yB = parseInt(String(b.year).match(/\d{4}/)?.[0] || '9999', 10);
        return yA - yB;
      });
    } else if (sortBy === 'az') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [searchResults, sortBy]);

  return (
    <main className="main-content">
      {/* 1. Loading State */}
      {loading && <Loading />}

      {/* 2. Error / Not Found State */}
      {!loading && notfound && (
        <Notfound
          searchTerm={searchTerm}
          errorMessage={errorMessage}
          onQuickSearch={onQuickSearch}
          onBackToHome={onBackToResults}
        />
      )}

      {/* 3. Dedicated Comprehensive Movie & Series Page View */}
      {!loading && !notfound && selectedMovie && (
        <MoviePage
          movie={selectedMovie}
          onBack={onBackToResults}
          hasSearchResults={searchResults && searchResults.length > 0}
          isWatchlisted={isMovieWatchlisted(selectedMovie)}
          onToggleWatchlist={onToggleWatchlist}
          onShare={onShare}
          onActorClick={onActorClick}
          onGenreClick={onGenreClick}
          onDirectorClick={onDirectorClick}
          userNotes={userNotes}
          onSaveNote={onSaveNote}
          userRatings={userRatings}
          onSaveRating={onSaveRating}
          onWatchTrailer={onWatchTrailer}
        />
      )}

      {/* 4. Multiple Search / Category Results Grid with Sorting & Type Filtering */}
      {!loading && !notfound && !selectedMovie && searchResults && searchResults.length > 0 && (
        <div className="animate-fade-in">
          {/* Top Standardized Subpage Navigation Bar */}
          <div className="subpage-top-nav-bar search-results-nav-bar">
            <div className="subpage-nav-container">
              <button
                type="button"
                className="subpage-back-btn"
                onClick={onBackToResults}
                title="Go back to Home"
                aria-label="Go back to Home"
              >
                <span className="back-arrow">←</span>
                <span>Back to Home</span>
              </button>

              <div className="subpage-breadcrumbs">
                <span className="crumb-link" onClick={onBackToResults} title="Go back to Home">Home</span>
                <span className="crumb-sep">›</span>
                <span className="crumb-current">{activeGenre ? `Category: ${activeGenre}` : `Search: "${searchTerm}"`}</span>
              </div>
            </div>

            <span className="results-count-badge">
              {processedResults.length} {processedResults.length === 1 ? 'Title' : 'Titles'}
            </span>
          </div>

          <div className="section-title-wrap">
            <h2 className="section-title">
              <span>Results for</span>
              <span className="query-highlight">"{searchTerm || activeGenre}"</span>
            </h2>
          </div>

          {/* Sorting Controls Bar */}
          <div className="filter-sort-bar">
            {/* Results Title Count */}
            <div className="filter-summary-info">
              <span className="filter-summary-text">Displaying authentic curated titles in this category</span>
            </div>

            {/* Sort Dropdown */}
            <div className="sort-group">
              <label htmlFor="results-sort-select" className="sort-label">Sort by:</label>
              <select
                id="results-sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Relevant</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Year</option>
                <option value="oldest">Oldest Year</option>
                <option value="az">Title (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Movies & Shows Grid */}
          {processedResults.length > 0 ? (
            <>
              <div className="movies-grid">
                {processedResults.map((item) => (
                  <MovieCard
                    key={item.id || item.imdbID}
                    movie={item}
                    onSelect={onSelectMovie}
                    isWatchlisted={isMovieWatchlisted(item)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>

              {hasMore && onLoadMore && (
                <div className="load-more-container">
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    aria-label="Load more titles"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="load-more-spinner"></span>
                        <span>Loading More Titles...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Content</span>
                        <span className="load-more-arrow">↓</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-filter-state">
              <p>No titles found in this category.</p>
              <button className="reset-filter-btn" onClick={onBackToResults}>
                Back to Home
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Rich Discovery & Content Sections (Home View) */}
      {!loading && !notfound && !selectedMovie && (!searchResults || searchResults.length === 0) && (
        <Sections
          onSelectMovie={onSelectMovie}
          onSelectGenre={onSelectGenre}
          activeGenre={activeGenre}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          onWatchTrailer={onWatchTrailer}
        />
      )}
    </main>
  );
};

export default Body;