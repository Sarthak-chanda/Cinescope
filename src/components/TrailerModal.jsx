import React, { useState, useEffect, useRef } from 'react';

// Curated trailer video IDs for verified movie titles
const KNOWN_MOVIE_TRAILERS = {
  tt6263850: '73_1biulkYk',  // Deadpool & Wolverine
  tt15239678: 'Way9Dexny3w', // Dune: Part Two
  tt22022452: 'LEjhY15eCx0', // Inside Out 2
  tt9218128: '4rgYUipGJNo',  // Gladiator II
  tt18411490: 'x0XDEhP4MQs', // Alien: Romulus
  tt11358390: 'Kdr5oedn7q8', // Kingdom of the Planet of the Apes
  tt1375666: 'YoHD9XEInc0',  // Inception
  tt0468569: 'EXeTwQWrcwY',  // The Dark Knight
  tt0816692: 'zSWdZVtXT7E',  // Interstellar
  tt4154796: 'TcMBFSGVi1c',  // Avengers: Endgame
  tt15398776: 'uYPbbksJxIg', // Oppenheimer
  tt0110912: 'tDAT98e0wK4',  // Pulp Fiction
  tt0068646: 'sY1S34973zA',  // The Godfather
  tt6751668: '5xH0hhJ98Bx',  // Parasite
  tt9362722: 'cqGjhVJWtEg',  // Spider-Man: Across the Spider-Verse
  tt1877830: 'mqqft2x_Aa4',  // The Batman
  tt1745960: 'giXco2JaZ_4',  // Top Gun: Maverick
  tt1517268: 'pBk4NYhWNMM',  // Barbie
  tt0137523: 'O1nDozs-L7w',  // Fight Club
  tt0133093: 'vKQi3bBA1y8'   // The Matrix
};

const TrailerModal = ({ isOpen, onClose, movie }) => {
  const [trailerError, setTrailerError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTrailerError(false);
      setIsMuted(false);
    }
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const movieId = movie.imdbID || movie.id;
  const movieTitle = movie.name || movie.title || 'Cinema Title';
  const movieYear = movie.year || '';
  const moviePoster = movie.poster || null;
  const movieBackdrop = movie.backdrop || movie.secondaryPoster || movie.poster || null;
  const moviePlot = movie.plot || movie.overview || movie.tagline || '';
  const movieRating = movie.rating || movie.imdbRating || '';
  const movieRuntime = movie.runtime || '';
  const movieRated = movie.rated || '';

  // Detect whether title is a TV series or Anime
  const isSeries =
    movie.type === 'series' ||
    movie.type === 'tv' ||
    movie.mood === 'Series' ||
    movie.isSeries ||
    Boolean(movie.totalSeasons);

  const isAnime =
    movie.type === 'anime' ||
    movie.mood === 'Anime' ||
    movie.isAnime ||
    (Array.isArray(movie.genres) && (movie.genres.includes('Anime') || (movie.genres.includes('Animation') && movie.mood === 'Anime'))) ||
    (typeof movie.genre === 'string' && (movie.genre.includes('Anime') || (movie.genre.includes('Animation') && movie.country?.includes('Japan'))));

  // Trailer Availability Checker for Movie, Anime, or TV Series
  const resolveModalTrailerId = (item) => {
    if (!item) return null;
    if (item.trailerId) return item.trailerId;
    if (item.trailer && typeof item.trailer === 'string') return item.trailer;
    if (item.imdbID && KNOWN_MOVIE_TRAILERS[item.imdbID]) return KNOWN_MOVIE_TRAILERS[item.imdbID];
    if (item.id && KNOWN_MOVIE_TRAILERS[item.id]) return KNOWN_MOVIE_TRAILERS[item.id];
    if (item.trailerUrl) {
      const match = String(item.trailerUrl).match(/(?:embed\/|v=|\/vi\/|youtu\.be\/|\/v\/)([^#&?]*)/);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const knownVideoId = resolveModalTrailerId(movie);
  const hasTrailer = !trailerError;

  const embedUrl = knownVideoId
    ? `https://www.youtube-nocookie.com/embed/${knownVideoId}?autoplay=1&mute=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(`${movieTitle} ${movieYear} official trailer`)}&autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`;

  // Auto-unmute postMessage effect
  useEffect(() => {
    if (hasTrailer && iframeRef.current) {
      const timer = setTimeout(() => {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
        } catch {
          // Fail-safe
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [hasTrailer, isOpen]);

  const handleVideoError = () => {
    setTrailerError(true);
  };

  const toggleMute = () => {
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
    if (!iframeRef.current) return;
    try {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
    } catch {
      // Fallback
    }
  };

  // Badge label
  let badgeLabel = '🖼 OFFICIAL BACKDROP VIEW';
  if (hasTrailer) {
    badgeLabel = isAnime ? '▶ OFFICIAL ANIME TRAILER' : isSeries ? '▶ OFFICIAL SERIES TRAILER' : '▶ OFFICIAL MOVIE TRAILER';
  } else if (isAnime) {
    badgeLabel = '🌸 OFFICIAL ANIME BACKDROP';
  } else if (isSeries) {
    badgeLabel = '📺 OFFICIAL SERIES BACKDROP';
  }

  return (
    <div className="trailer-modal-backdrop" onClick={onClose}>
      <div className="trailer-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="trailer-modal-header">
          <div className="trailer-header-info">
            <span className={`trailer-badge ${!hasTrailer ? 'poster-mode-badge' : ''}`}>
              {badgeLabel}
            </span>

            <h3 className="trailer-title">
              {movieTitle} {movieYear ? `(${movieYear})` : ''}
            </h3>
          </div>

          <div className="trailer-header-actions">
            <button className="trailer-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content: Clean Trailer Video (controls=0) OR Cinematic Backdrop View */}
        {hasTrailer && embedUrl ? (
          <div className="trailer-video-wrapper">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={`${movieTitle} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="trailer-iframe"
              onError={handleVideoError}
            />

            {/* Essential Controls in Top Right Corner */}
            <div className="trailer-top-corner-controls">
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
        ) : (
          <div className="trailer-backdrop-stage">
            {/* Ambient Panoramic Backdrop */}
            {movieBackdrop && (
              <div
                className="trailer-backdrop-ambient-img"
                style={{ backgroundImage: `url(${movieBackdrop})` }}
                aria-hidden="true"
              />
            )}
            <div className="trailer-backdrop-scrim" aria-hidden="true" />

            {/* Foreground Backdrop Card */}
            <div className="trailer-backdrop-content">
              {moviePoster && (
                <img
                  src={moviePoster}
                  alt={movieTitle}
                  className="trailer-backdrop-poster-thumb"
                  loading="lazy"
                />
              )}

              <div className="trailer-backdrop-details">
                <span className="trailer-backdrop-pill">
                  {isAnime ? 'Anime Showcase' : isSeries ? 'Series Spotlight' : 'Cinematic Backdrop'}
                </span>

                <h4 className="trailer-backdrop-title">{movieTitle}</h4>

                <div className="trailer-backdrop-meta">
                  {movieRating && <span className="trailer-meta-spec">★ {movieRating}</span>}
                  {movieYear && <span className="trailer-meta-spec">{movieYear}</span>}
                  {movieRuntime && <span className="trailer-meta-spec">{movieRuntime}</span>}
                  {movieRated && <span className="trailer-meta-spec">{movieRated}</span>}
                </div>

                {moviePlot && <p className="trailer-backdrop-desc">{moviePlot}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="trailer-modal-footer">
          <div className="trailer-specs">
            <span className="trailer-spec-tag">Dolby Vision</span>
            <span className="trailer-spec-tag">Ultra HD Media</span>
            <span className="trailer-spec-tag">Official Studio Release</span>
          </div>
          <button className="trailer-done-btn" onClick={onClose}>
            Back to CineScope
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
