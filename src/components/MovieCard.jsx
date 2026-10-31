import React, { useState } from 'react';
import { formatTimelineYear } from '../services/movieApi';

const optimizePosterUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('image.tmdb.org/t/p/w500/')) {
    return url.replace('/t/p/w500/', '/t/p/w342/');
  }
  return url;
};

const MovieCard = ({
  movie,
  onSelect,
  onSelectMovie,
  isWatchlisted = false,
  onToggleWatchlist,
  onImageError
}) => {
  const [currentPoster, setCurrentPoster] = useState(() => optimizePosterUrl(movie?.poster));
  const [imageFailed, setImageFailed] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  React.useEffect(() => {
    if (movie?.poster) {
      setCurrentPoster(optimizePosterUrl(movie.poster));
      setImageFailed(false);
      setTriedFallback(false);
    }
  }, [movie?.poster]);

  if (!movie || !currentPoster || imageFailed) return null;

  const { id, imdbID, name, year, type, imdbRating, genres, genre, status } = movie;
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

  const handleImageError = async () => {
    if (!triedFallback) {
      setTriedFallback(true);
      // Try secondary poster if present and different
      if (movie.secondaryPoster && movie.secondaryPoster !== currentPoster) {
        setCurrentPoster(movie.secondaryPoster);
        return;
      }
      // If weserv proxy was used, try direct url without weserv
      if (currentPoster.includes('images.weserv.nl/?url=')) {
        const directUrl = decodeURIComponent(currentPoster.split('url=')[1] || '');
        if (directUrl && directUrl !== currentPoster) {
          setCurrentPoster(directUrl);
          return;
        }
      }
      // Try dynamic TMDb fetch for exact title match
      if (name) {
        try {
          const isTv = type === 'series' || type === 'tv' || type === 'anime';
          const ep = isTv ? 'search/tv' : 'search/movie';
          const res = await fetch(`https://api.tmdb.org/3/${ep}?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=${encodeURIComponent(name.replace(/\s*\([^\)]*\)/g, '').trim())}`);
          if (res.ok) {
            const data = await res.json();
            const hit = data.results?.[0];
            if (hit?.poster_path) {
              const tmdbPoster = `https://image.tmdb.org/t/p/w342${hit.poster_path}`;
              if (tmdbPoster !== currentPoster) {
                setCurrentPoster(tmdbPoster);
                return;
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }

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
          src={currentPoster}
          alt={name || 'Poster'}
          className="movie-card-poster"
          loading="lazy"
          decoding="async"
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

export default React.memo(MovieCard, (prev, next) => {
  return (
    prev.movie?.id === next.movie?.id &&
    prev.movie?.imdbID === next.movie?.imdbID &&
    prev.movie?.poster === next.movie?.poster &&
    prev.isWatchlisted === next.isWatchlisted
  );
});
