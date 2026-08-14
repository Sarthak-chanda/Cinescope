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
  onWatchTrailer
}) => {
  // Sort and Filter states for search/genre results
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'movie', 'series', 'anime'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'newest', 'oldest', 'az'

  const isMovieWatchlisted = (movie) => {
    if (!movie) return false;
    const movieId = movie.id || movie.imdbID;
    return watchlist.some((w) => (w.id || w.imdbID) === movieId);
  };

  // Filtered & Sorted search results
  const processedResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    let items = [...searchResults];

    // Filter by type
    if (selectedType !== 'all') {
      items = items.filter((item) => {
        if (selectedType === 'movie') return item.type === 'movie' || !item.type;
        if (selectedType === 'series') return item.type === 'series' || item.type === 'tv';
        if (selectedType === 'anime') {
          return item.type === 'anime' || (item.genres && item.genres.includes('Animation')) || (item.genre && item.genre.includes('Animation'));
        }
        return true;
      });
    }

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
  }, [searchResults, selectedType, sortBy]);

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
        />
      )}

      {/* 3. Dedicated Comprehensive Movie & Series Page View */}
      {!loading && !notfound && selectedMovie && (
        <MoviePage
          movie={selectedMovie}
          onBack={onBackToResults}
          hasSearchResults={searchResults && searchResults.length > 1}
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
          {/* Header Bar */}
          <div className="section-header-bar">
            <h2 className="section-title">
              <span>Results for</span>
              <span className="query-highlight">"{searchTerm}"</span>
            </h2>
            <span className="results-count-badge">
              {processedResults.length} {processedResults.length === 1 ? 'Title' : 'Titles'} Shown
            </span>
          </div>

          {/* Filtering & Sorting Controls Bar */}
          <div className="filter-sort-bar">
            {/* Type Filter Pills */}
            <div className="type-filter-group">
              <span className="filter-label">Filter:</span>
              <button
                className={`type-pill ${selectedType === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedType('all')}
              >
                All Content ({searchResults.length})
              </button>
              <button
                className={`type-pill ${selectedType === 'movie' ? 'active' : ''}`}
                onClick={() => setSelectedType('movie')}
              >
                Movies
              </button>
              <button
                className={`type-pill ${selectedType === 'series' ? 'active' : ''}`}
                onClick={() => setSelectedType('series')}
              >
                TV Shows
              </button>
              <button
                className={`type-pill ${selectedType === 'anime' ? 'active' : ''}`}
                onClick={() => setSelectedType('anime')}
              >
                Anime
              </button>
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
          ) : (
            <div className="empty-filter-state">
              <p>No results match the selected filter "<strong>{selectedType}</strong>".</p>
              <button className="reset-filter-btn" onClick={() => setSelectedType('all')}>
                Show All Content
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