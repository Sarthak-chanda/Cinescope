import React, { useState, useEffect, useRef, useMemo } from 'react';
import { playSound } from '../services/soundEffects';

export const SPOTLIGHT_MOVIES_DATA = [
  {
    imdbID: 'tt15398776',
    name: 'Oppenheimer',
    year: '2023',
    rating: '8.9',
    votes: '780,000+',
    rated: 'R',
    runtime: '3h 0m',
    rankBadge: '7 Academy Awards',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.',
    genres: ['Biography', 'Drama', 'History'],
    mood: 'Masterpiece',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
    tagline: 'The story of the man who changed the world forever.',
    plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    liveViewers: 3100
  },
  {
    imdbID: 'tt15239678',
    name: 'Dune: Part Two',
    year: '2024',
    rating: '8.6',
    votes: '610,000+',
    rated: 'PG-13',
    runtime: '2h 46m',
    rankBadge: '#1 Sci-Fi Masterpiece',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    mood: 'Sci-Fi',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/6wLztf23Z9kHqjN2eN9Lh3WlXN5.jpg',
    tagline: 'Long live the fighters of Arrakis.',
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, fulfilling his destiny across the stars.',
    liveViewers: 3420
  },
  {
    imdbID: 'tt6263850',
    name: 'Deadpool & Wolverine',
    year: '2024',
    rating: '7.8',
    votes: '565,000+',
    rated: 'R',
    runtime: '2h 8m',
    rankBadge: '#1 in Global Cinema',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    mood: 'Action',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/5jHqH1h7pB2Y9LgJ1fWjF2qH2qX.jpg',
    tagline: 'Come together to save the Marvel multiverse.',
    plot: 'Deadpool is offered a place in the Marvel Cinematic Universe by the TVA, but instead recruits an all-new variant of Wolverine to save his dying timeline.',
    liveViewers: 2840
  },
  {
    imdbID: 'tt22022452',
    name: 'Inside Out 2',
    year: '2024',
    rating: '7.6',
    votes: '240,000+',
    rated: 'PG',
    runtime: '1h 36m',
    rankBadge: 'Highest Grossing 2024',
    director: 'Kelsey Mann',
    cast: 'Amy Poehler, Maya Hawke, Kensington Tallman',
    genres: ['Animation', 'Adventure', 'Comedy'],
    mood: 'Anime',
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    tagline: 'Make room for all new emotions.',
    plot: 'Joy, Sadness, Anger, Fear and Disgust face Anxiety, Envy, Ennui and Embarrassment as Riley enters her teenage years.',
    liveViewers: 2480
  },
  {
    imdbID: 'tt0816692',
    name: 'Interstellar',
    year: '2014',
    rating: '8.7',
    votes: '2,100,000+',
    rated: 'PG-13',
    runtime: '2h 49m',
    rankBadge: 'Sci-Fi Masterpiece',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    mood: 'Sci-Fi',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/nBNZadXqJSdt05SHLqgT0AcAcTe.jpg',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    liveViewers: 2950
  },
  {
    imdbID: 'tt12637874',
    name: 'Fallout',
    year: '2024',
    rating: '8.4',
    votes: '280,000+',
    rated: 'TV-MA',
    runtime: '8 Episodes',
    rankBadge: 'Top Global Stream',
    director: 'Jonathan Nolan',
    cast: 'Ella Purnell, Aaron Moten, Walton Goggins',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    mood: 'Series',
    poster: 'https://image.tmdb.org/t/p/w500/AnsZuLpE8Jj571wQpLz267rW1bN.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/8t0jC4T9GqL2qG8wK5Ww4fD3g.jpg',
    tagline: 'The world after the bombs fell.',
    plot: 'Citizens live in underground vaults to protect themselves from radiation, mutants and bandits in post-apocalyptic Los Angeles.',
    liveViewers: 1980
  },
  {
    imdbID: 'tt2788316',
    name: 'Shōgun',
    year: '2024',
    rating: '8.7',
    votes: '190,000+',
    rated: 'TV-MA',
    runtime: '10 Episodes',
    rankBadge: 'Emmy Record Winner',
    director: 'Rachel Kondo & Justin Marks',
    cast: 'Hiroyuki Sanada, Cosmo Jarvis, Anna Sawai',
    genres: ['Adventure', 'Drama', 'History'],
    mood: 'Series',
    poster: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/n918q2o3aI7Lsm3eD2G5U22PZlW.jpg',
    tagline: 'The battle for the Shogunate begins.',
    plot: 'When a mysterious European ship is found marooned in feudal Japan, Lord Yoshii Toranaga discovers secrets that tip the scales of power.',
    liveViewers: 2150
  }
];

const ROTATION_INTERVAL = 6000; // 6 seconds per live spotlight slide

const HeroSection = ({
  onSelectMovie,
  onToggleWatchlist,
  watchlist = [],
  onWatchTrailer
}) => {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [failedImages, setFailedImages] = useState(new Set());
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const isPointerDown = useRef(false);

  const handleImageError = (id) => {
    if (!id) return;
    setFailedImages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Only show spotlight movies with verified working posters
  const validSpotlights = useMemo(() => {
    return SPOTLIGHT_MOVIES_DATA.filter(
      (m) => m.poster && !failedImages.has(m.imdbID)
    );
  }, [failedImages]);

  const totalSpotlights = validSpotlights.length || 1;
  const currentSpotlight = validSpotlights[spotlightIndex % totalSpotlights] || validSpotlights[0] || SPOTLIGHT_MOVIES_DATA[0];

  // Tri-Deck Flanking Indexes for 3D Orbit
  const prevSpotlightIndex = (spotlightIndex - 1 + totalSpotlights) % totalSpotlights;
  const nextSpotlightIndex = (spotlightIndex + 1) % totalSpotlights;
  const prevSpotlight = validSpotlights[prevSpotlightIndex];
  const nextSpotlight = validSpotlights[nextSpotlightIndex];

  // Drag Handlers
  const handleStartDrag = (clientX) => {
    isPointerDown.current = true;
    dragStartX.current = clientX;
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleMoveDrag = (clientX) => {
    if (!isPointerDown.current) return;
    const diff = clientX - dragStartX.current;
    setDragOffset(diff);
  };

  const handleEndDrag = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    setIsDragging(false);

    const threshold = 40;
    if (dragOffset < -threshold) {
      // Swiped Left -> Next
      playSound('whoosh');
      setSpotlightIndex((prev) => (prev + 1) % totalSpotlights);
      setTimerKey((k) => k + 1);
    } else if (dragOffset > threshold) {
      // Swiped Right -> Previous
      playSound('whoosh');
      setSpotlightIndex((prev) => (prev - 1 + totalSpotlights) % totalSpotlights);
      setTimerKey((k) => k + 1);
    }
    setDragOffset(0);
  };

  // 6-Second Live Auto-Rotation Timer
  useEffect(() => {
    const rotationTimer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % totalSpotlights);
      setTimerKey((k) => k + 1);
    }, ROTATION_INTERVAL);

    return () => clearInterval(rotationTimer);
  }, [totalSpotlights, timerKey]);

  const isWatchlisted = (movie) => {
    const movieId = movie.id || movie.imdbID;
    return watchlist.some((w) => (w.id || w.imdbID) === movieId);
  };

  const handleOpenMovie = () => {
    playSound('whoosh');
    if (onSelectMovie) {
      onSelectMovie({ imdbID: currentSpotlight.imdbID, name: currentSpotlight.name });
    }
  };

  const handleDeckSelect = (targetIdx) => {
    playSound('click');
    setSpotlightIndex(targetIdx);
    setTimerKey((k) => k + 1);
  };

  return (
    <section className="flagship-cinema-stage">
      {/* Multi-layer Persistent Poster Hero Background */}
      <div className="stage-backdrops-container" aria-hidden="true">
        {validSpotlights.map((movie, idx) => {
          const isCurrent = idx === (spotlightIndex % totalSpotlights);
          return (
            <div
              key={`bg-${movie.imdbID}`}
              className={`stage-panoramic-backdrop-layer ${isCurrent ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${movie.poster})`
              }}
            />
          );
        })}
      </div>

      <div className="stage-ambient-glow-mesh" aria-hidden="true" />
      <div className="stage-scrim-radial" aria-hidden="true" />
      <div className="stage-scrim-left" aria-hidden="true" />
      <div className="stage-scrim-bottom" aria-hidden="true" />

      {/* Main Inner Stage Wrapper */}
      <div className="stage-inner-wrapper">
        {/* ==========================================
            LEFT: CINEMA COCKPIT CONSOLE (Clean, Minimalist)
            ========================================== */}
        <div className="cinema-cockpit-console" key={`cockpit-${currentSpotlight.imdbID}`}>
          {/* Cinematic Title */}
          <h2 className="cockpit-title">
            {currentSpotlight.name}{' '}
            <span className="cockpit-year-tag">({currentSpotlight.year})</span>
          </h2>

          {/* Tagline */}
          <p className="cockpit-tagline">"{currentSpotlight.tagline}"</p>

          {/* Technical Specs Badges */}
          <div className="cockpit-spec-row">
            <span className="spec-badge-gold">★ {currentSpotlight.rating} IMDb</span>
            <span className="spec-votes-count">({currentSpotlight.votes})</span>
            <span className="spec-badge-neon">{currentSpotlight.runtime}</span>
            <span className="spec-badge-age">{currentSpotlight.rated}</span>
            <span className="spec-badge-neon">DOLBY VISION</span>
          </div>

          {/* Director & Leading Cast */}
          <div className="cockpit-credits-row">
            <span className="credits-director">
              Directed by <strong>{currentSpotlight.director}</strong>
            </span>
            <span className="credits-cast">
              Starring <strong>{currentSpotlight.cast}</strong>
            </span>
          </div>

          {/* Genre Capsule Pills */}
          <div className="cockpit-genre-chips">
            {currentSpotlight.genres.map((g) => (
              <span key={g} className="cockpit-genre-pill">
                {g}
              </span>
            ))}
          </div>

          {/* Primary Action Button Cluster */}
          <div className="cockpit-cta-group">
            <button
              type="button"
              className="cockpit-primary-explore-btn"
              onClick={handleOpenMovie}
              title="Explore full movie details, cast & reviews"
            >
              <span>Explore Cinema Details</span>
              <span className="cta-arrow-glow">→</span>
            </button>

            {onWatchTrailer && (
              <button
                type="button"
                className="cockpit-watchlist-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchTrailer(currentSpotlight);
                }}
                title={
                  currentSpotlight.mood === 'Series' || currentSpotlight.mood === 'Anime'
                    ? 'View official backdrop & media'
                    : 'Watch official HD trailer'
                }
              >
                <span>
                  {currentSpotlight.mood === 'Series' || currentSpotlight.mood === 'Anime'
                    ? '🖼 View Backdrop'
                    : '▶ Watch Trailer'}
                </span>
              </button>
            )}

            <button
              type="button"
              className={`cockpit-watchlist-btn ${isWatchlisted(currentSpotlight) ? 'active' : ''}`}
              onClick={() => {
                playSound('click');
                if (onToggleWatchlist) onToggleWatchlist(currentSpotlight);
              }}
              title={isWatchlisted(currentSpotlight) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <span>{isWatchlisted(currentSpotlight) ? '★ In Watchlist' : '+ Add to Watchlist'}</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT: 3D DEPTH POSTER DECK & INTERACTIVE ORBIT (With Drag / Swipe)
            ========================================== */}
        <div className="cinema-3d-deck-stage">
          <div
            className={`trio-poster-deck-container ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={(e) => handleStartDrag(e.clientX)}
            onMouseMove={(e) => handleMoveDrag(e.clientX)}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={(e) => handleStartDrag(e.touches[0].clientX)}
            onTouchMove={(e) => handleMoveDrag(e.touches[0].clientX)}
            onTouchEnd={handleEndDrag}
            style={
              isDragging
                ? {
                    transform: `translateX(${dragOffset * 0.75}px) rotateY(${dragOffset * 0.08}deg)`
                  }
                : undefined
            }
          >
            {validSpotlights.map((movie, idx) => {
              const activeIdx = spotlightIndex % totalSpotlights;
              let diff = idx - activeIdx;
              if (diff > totalSpotlights / 2) diff -= totalSpotlights;
              if (diff < -totalSpotlights / 2) diff += totalSpotlights;

              let slotClass = 'slot-hidden';
              if (diff === 0) slotClass = 'slot-center';
              else if (diff === -1) slotClass = 'slot-left';
              else if (diff === 1) slotClass = 'slot-right';
              else if (diff < -1) slotClass = 'slot-far-left';
              else if (diff > 1) slotClass = 'slot-far-right';

              const isCenter = diff === 0;

              return (
                <div
                  key={`deck-card-${movie.imdbID}`}
                  className={`deck-poster-card ${slotClass}`}
                  onClick={() => {
                    if (Math.abs(dragOffset) > 10) return;
                    if (isCenter) {
                      handleOpenMovie();
                    } else {
                      handleDeckSelect(idx);
                    }
                  }}
                  title={isCenter ? `Click to explore ${movie.name}` : `Switch to ${movie.name}`}
                  role="button"
                  tabIndex={isCenter || diff === -1 || diff === 1 ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (isCenter) handleOpenMovie();
                      else handleDeckSelect(idx);
                    }
                  }}
                >
                  <div className={`center-poster-frame ${isCenter ? 'is-active-frame' : ''}`}>
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      className="deck-poster-img center-img"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onError={() => handleImageError(movie.imdbID)}
                    />

                    {isCenter ? (
                      <div className="deck-hologram-sheen" aria-hidden="true" />
                    ) : (
                      <div className="deck-card-overlay" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Poster Gallery with Integrated Timer Progress Line */}
          <div className="hero-poster-gallery" role="tablist" aria-label="Spotlight movie thumbnails">
            {validSpotlights.map((movie, idx) => {
              const isActive = idx === (spotlightIndex % totalSpotlights);
              return (
                <button
                  type="button"
                  key={`gallery-item-${movie.imdbID}`}
                  className={`gallery-thumb-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleDeckSelect(idx)}
                  title={`${movie.name} (${movie.year}) - Click to spotlight`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <img
                    src={movie.poster}
                    alt={movie.name}
                    className="gallery-thumb-img"
                    loading="lazy"
                    draggable={false}
                    onError={() => handleImageError(movie.imdbID)}
                  />
                  {isActive && (
                    <div className="gallery-card-timer-track" title="Auto-swap countdown">
                      <div
                        key={`gallery-timer-${spotlightIndex}-${timerKey}`}
                        className="gallery-card-timer-fill"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
