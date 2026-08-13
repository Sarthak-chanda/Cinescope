import React, { useState } from 'react';
import { formatTimelineYear } from '../services/movieApi';

const MovieCard = ({
  movie,
  onSelect,
  onSelectMovie,
  isWatchlisted = false,
  onToggleWatchlist,
  onImageError
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!movie || !movie.poster || imageFailed) return null;

  const { id, imdbID, name, year, type, poster, imdbRating, genres, genre, status } = movie;
  const displayYear = formatTimelineYear(year, name, status);
  const genreDisplay = Array.isArray(genre) && genre.length > 0
    ? genre[0]
    : (Array.isArray(genres) && genres.length > 0 ? genres[0] : null);

  const displayType = type === 'series' || type === 'tv'
    ? 'TV Series'
    : (type === 'anime' ? 'Anime' : 'Movie');

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(movie);
    } else if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (onToggleWatchlist) {
      onToggleWatchlist(movie);
    }
  };

  const handleImageError = () => {
    setImageFailed(true);
    if (onImageError) {
      onImageError(id || imdbID);
    }
  };

  return (
    <div
      className="movie-card animate-fade-in"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      <div className="movie-card-poster-wrapper">
        <img
          src={poster}
          alt={name || 'Poster'}
          className="movie-card-poster"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />

        {/* Type Badge */}
        <span className={`movie-card-badge ${type === 'series' || type === 'tv' ? 'series-badge' : (type === 'anime' ? 'anime-badge' : '')}`}>
          {displayType}
        </span>

        {/* Watchlist Quick Toggle Button */}
        {onToggleWatchlist && (
          <button
            className={`movie-card-watchlist-btn ${isWatchlisted ? 'active' : ''}`}
            onClick={handleWatchlistClick}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            type="button"
          >
            {isWatchlisted ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="movie-card-content">
        <h4 className="movie-card-title" title={name}>
          {name}
        </h4>
        <div className="movie-card-meta">
          <span className="movie-card-year">{displayYear || year || 'Cinema'}</span>
          {genreDisplay && (
            <span className="movie-card-genre-pill">{genreDisplay}</span>
          )}
          {imdbRating && imdbRating !== 'N/A' && (
            <span className="movie-card-rating-pill">
              ★ {imdbRating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
