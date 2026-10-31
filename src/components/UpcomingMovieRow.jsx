import React, { useState } from 'react';
import { playSound } from '../services/soundEffects';

const optimizePosterUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('image.tmdb.org/t/p/w500/')) {
    return url.replace('/t/p/w500/', '/t/p/w342/');
  }
  return url;
};

// Natural 1:1 drag scroll hook (on-demand listeners for 60fps)
const useUpcomingDragScroll = () => {
  const rowRef = React.useRef(null);
  const isDown = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftPos = React.useRef(0);
  const dragDistance = React.useRef(0);
  const cleanupListeners = React.useRef(null);

  const onMouseDown = (e) => {
    if (e.button !== 0 || !rowRef.current) return;
    isDown.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftPos.current = rowRef.current.scrollLeft;

    rowRef.current.style.cursor = 'grabbing';
    rowRef.current.style.scrollBehavior = 'auto';

    const handleGlobalMouseMove = (moveEvt) => {
      if (!isDown.current || !rowRef.current) return;
      const x = moveEvt.pageX - rowRef.current.offsetLeft;
      const walk = x - startX.current;
      dragDistance.current = Math.abs(walk);

      if (dragDistance.current > 3 && moveEvt.cancelable) {
        moveEvt.preventDefault();
      }

      rowRef.current.scrollLeft = scrollLeftPos.current - walk;
    };

    const handleGlobalMouseUp = () => {
      isDown.current = false;
      if (rowRef.current) {
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.scrollBehavior = 'smooth';
      }
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      cleanupListeners.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);
    cleanupListeners.current = () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  };

  React.useEffect(() => {
    return () => {
      if (cleanupListeners.current) {
        cleanupListeners.current();
      }
    };
  }, []);

  return { rowRef, onMouseDown, dragDistance };
};

export const UpcomingMovieRow = ({
  title,
  subtitle,
  movies = [],
  onSelectMovie,
  onWatchTrailer,
  watchlist = [],
  onToggleWatchlist
}) => {
  if (!movies || !Array.isArray(movies) || movies.length < 5) return null;

  const { rowRef, onMouseDown, dragDistance } = useUpcomingDragScroll();
  const [imgErrors, setImgErrors] = useState({});

  return (
    <section className="home-section upcoming-section-highlight">
      <div className="section-title-row">
        <div>
          <div className="upcoming-section-header">
            <span className="upcoming-glowing-pill">UPCOMING 2026–2028</span>
            <h3 className="home-section-title upcoming-row-title">{title}</h3>
          </div>
          {subtitle && (
            <span className="section-subtitle-tag" style={{ marginTop: '6px', display: 'inline-block' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div
        ref={rowRef}
        className="movie-cards-drag-row upcoming-cards-drag-row"
        onMouseDown={onMouseDown}
      >
        {movies.map((m) => {
          const movieId = m.id || m.imdbID || m.name;
          const hasErr = imgErrors[movieId];

          return (
            <div key={movieId} className="upcoming-movie-card-container">
              <div
                className="upcoming-movie-card"
                onClick={() => {
                  if (dragDistance.current < 6) {
                    playSound('click');
                    onSelectMovie(m);
                  }
                }}
              >
                {/* Poster Stage */}
                <div className="upcoming-poster-stage">
                  {!hasErr ? (
                    <img
                      src={optimizePosterUrl(m.poster)}
                      alt={m.name}
                      className="upcoming-poster-img"
                      loading="lazy"
                      decoding="async"
                      onError={() => {
                        setImgErrors((prev) => ({ ...prev, [movieId]: true }));
                      }}
                    />
                  ) : (
                    <div className="upcoming-poster-fallback">
                      <div className="fallback-cinema-icon">🎬</div>
                      <div className="fallback-movie-name">{m.name}</div>
                    </div>
                  )}
                  <div className="upcoming-poster-overlay">
                    <span className="upcoming-status-badge">{m.status || 'UPCOMING'}</span>
                    
                    {onWatchTrailer && (
                      <button
                        className="upcoming-play-trailer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('click');
                          onWatchTrailer(m);
                        }}
                        title="Watch Official Trailer"
                      >
                        <span className="play-icon-svg">▶</span> Watch Trailer
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="upcoming-card-info">
                  <div className="upcoming-release-date-tag">
                    🗓️ {m.releaseDate || m.year}
                  </div>
                  <h4 className="upcoming-card-title">{m.name}</h4>
                  <p className="upcoming-card-genre">
                    {Array.isArray(m.genre) ? m.genre.join(' • ') : m.genre}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
