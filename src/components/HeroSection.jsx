import React, { useState, useEffect, useRef, useMemo } from 'react';
import { playSound } from '../services/soundEffects';

export const SPOTLIGHT_MOVIES_DATA = [
  {
    imdbID: 'tt15239678',
    name: 'Dune: Part Two',
    year: '2024',
    rating: '8.5',
    votes: '610,000+',
    rated: 'PG-13',
    runtime: '2h 46m',
    rankBadge: '#1 Global Sci-Fi Epic',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    mood: 'Hollywood',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/6wLztf23Z9kHqjN2eN9Lh3WlXN5.jpg',
    tagline: 'Long live the fighters of Arrakis.',
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, fulfilling his destiny across the stars.',
    liveViewers: 3420
  },
  {
    imdbID: 'tt12735488',
    name: 'Kalki 2898 AD',
    year: '2024',
    rating: '7.6',
    votes: '85,000+',
    rated: 'PG-13',
    runtime: '3h 0m',
    rankBadge: '#1 Indian Sci-Fi Blockbuster',
    director: 'Nag Ashwin',
    cast: 'Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone',
    genres: ['Sci-Fi', 'Action', 'Fantasy'],
    mood: 'Indian Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'When darkness engulfs humanity, a savior rises.',
    plot: 'In a dystopian future 2898 AD, a modern avatar of Vishnu descends to Earth to protect the unborn child of Sumati from evil supreme commander Yaskin.',
    liveViewers: 4120
  },
  {
    imdbID: 'tt15398776',
    name: 'Oppenheimer',
    year: '2023',
    rating: '8.8',
    votes: '780,000+',
    rated: 'R',
    runtime: '3h 0m',
    rankBadge: '7 Academy Awards Winner',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.',
    genres: ['Biography', 'Drama', 'History'],
    mood: 'Masterpiece',
    poster: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
    tagline: 'The story of the man who changed the world forever.',
    plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    liveViewers: 3100
  },
  {
    imdbID: 'tt23289160',
    name: 'Godzilla Minus One',
    year: '2023',
    rating: '7.8',
    votes: '145,000+',
    rated: 'PG-13',
    runtime: '2h 5m',
    rankBadge: 'Oscar Winner - Best Visual Effects',
    director: 'Takashi Yamazaki',
    cast: 'Ryunosuke Kamiki, Minami Hamabe, Yuki Yamada',
    genres: ['Action', 'Drama', 'Sci-Fi'],
    mood: 'Japanese Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjc5MjllMGUtMDIwMS00ZDVkLWEzODQtM2NlMTMwMTZhNThmXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMjc5MjllMGUtMDIwMS00ZDVkLWEzODQtM2NlMTMwMTZhNThmXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Post-war Japan. Zero to minus one.',
    plot: 'Post-war Japan is at its lowest point when a new crisis arises in the form of a giant monster, baptized in the horrific power of the atomic bomb.',
    liveViewers: 2980
  },
  {
    imdbID: 'tt8178634',
    name: 'RRR',
    year: '2022',
    rating: '7.8',
    votes: '180,000+',
    rated: 'PG-13',
    runtime: '3h 7m',
    rankBadge: 'Academy Award Winner & Global Sensation',
    director: 'S.S. Rajamouli',
    cast: 'N.T. Rama Rao Jr., Ram Charan, Alia Bhatt, Ajay Devgn',
    genres: ['Action', 'Drama', 'History'],
    mood: 'Indian Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BNWMwODYyMjQtMTczMi00NTQ1LWFkYjItMGJhMWRkY2E3NDAyXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BNWMwODYyMjQtMTczMi00NTQ1LWFkYjItMGJhMWRkY2E3NDAyXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Rise, Roar, Revolt.',
    plot: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving the British force in 1920s pre-independent India.',
    liveViewers: 3650
  },
  {
    imdbID: 'tt6751668',
    name: 'Parasite',
    year: '2019',
    rating: '8.5',
    votes: '950,000+',
    rated: 'R',
    runtime: '2h 12m',
    rankBadge: '4 Academy Awards & Palme d\'Or Winner',
    director: 'Bong Joon Ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
    genres: ['Drama', 'Thriller', 'Comedy'],
    mood: 'Korean Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Act like you own the place.',
    plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    liveViewers: 2890
  },
  {
    imdbID: 'tt6263850',
    name: 'Deadpool & Wolverine',
    year: '2024',
    rating: '7.6',
    votes: '565,000+',
    rated: 'R',
    runtime: '2h 8m',
    rankBadge: '#1 in Global Action Comedy',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    mood: 'Action',
    poster: 'https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/w780/5jHqH1h7pB2Y9LgJ1fWjF2qH2qX.jpg',
    tagline: 'Come together to save the Marvel multiverse.',
    plot: 'Deadpool is offered a place in the Marvel Cinematic Universe by the TVA, but instead recruits an all-new variant of Wolverine to save his dying timeline.',
    liveViewers: 2840
  },
  {
    imdbID: 'tt26458038',
    name: 'Manjummel Boys',
    year: '2024',
    rating: '8.2',
    votes: '35,000+',
    rated: 'PG-13',
    runtime: '2h 15m',
    rankBadge: '#1 All-Time Malayalam Blockbuster',
    director: 'Chidambaram',
    cast: 'Soubin Shahir, Sreenath Bhasi, Balu Varghese',
    genres: ['Adventure', 'Drama', 'Thriller'],
    mood: 'Malayalam Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BMDVkOGEzZDgtYWU4Yi00MDA3LWE4YmQtYjQxNDgwNDYxNGU4XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMDVkOGEzZDgtYWU4Yi00MDA3LWE4YmQtYjQxNDgwNDYxNGU4XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'True friendship defies the darkest depths.',
    plot: 'A group of friends from Cochin embark on a trip to Kodaikanal, where one of them gets trapped inside the notorious Guna Caves.',
    liveViewers: 3210
  },
  {
    imdbID: 'tt16428256',
    name: 'Suzume',
    year: '2023',
    rating: '7.6',
    votes: '65,000+',
    rated: 'PG',
    runtime: '2h 2m',
    rankBadge: 'Global Anime Sensation',
    director: 'Makoto Shinkai',
    cast: 'Nanoka Hara, Hokuto Matsumura, Eri Fukatsu',
    genres: ['Animation', 'Adventure', 'Fantasy'],
    mood: 'Anime',
    poster: 'https://m.media-amazon.com/images/M/MV5BODhkNDhmNzktODFmMC00NDZiLWEzN2UtY2YwYzgzYTVlMWZmXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BODhkNDhmNzktODFmMC00NDZiLWEzN2UtY2YwYzgzYTVlMWZmXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'On the other side of the door was time in its entirety.',
    plot: 'A modern action-adventure story where a 17-year-old girl named Suzume helps a mysterious young man close doors from the outer side that are releasing disasters all over Japan.',
    liveViewers: 2740
  },
  {
    imdbID: 'tt15354916',
    name: 'Jawan',
    year: '2023',
    rating: '6.9',
    votes: '95,000+',
    rated: 'PG-13',
    runtime: '2h 49m',
    rankBadge: 'Global Bollywood Box-Office Record',
    director: 'Atlee',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi',
    genres: ['Action', 'Thriller', 'Drama'],
    mood: 'Bollywood',
    poster: 'https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Ready or not, here he comes.',
    plot: 'A high-octane action thriller that outlines the emotional journey of a man who is set to rectify the wrongs in society.',
    liveViewers: 3380
  },
  {
    imdbID: 'tt17009710',
    name: 'Anatomy of a Fall',
    year: '2023',
    rating: '7.6',
    votes: '150,000+',
    rated: 'R',
    runtime: '2h 31m',
    rankBadge: 'Palme d\'Or & Oscar Winner',
    director: 'Justine Triet',
    cast: 'Sandra Hüller, Swann Arlaud, Milo Machado-Graner',
    genres: ['Crime', 'Drama', 'Mystery'],
    mood: 'European Cinema',
    poster: 'https://m.media-amazon.com/images/M/MV5BYTk3MjFkZmQtMThiYi00N2JhLTk2YzItZTE5ZGUxZTIyZDVkXkEyXkFqcGc@._V1_QL75_UY562_CR2,0,380,562_.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BYTk3MjFkZmQtMThiYi00N2JhLTk2YzItZTE5ZGUxZTIyZDVkXkEyXkFqcGc@._V1_QL75_UY562_CR2,0,380,562_.jpg',
    tagline: 'Did he fall or was he pushed?',
    plot: 'A woman is suspected of her husband\'s murder, and their blind son faces a moral dilemma as the sole witness in this gripping French courtroom drama.',
    liveViewers: 2120
  },
  {
    imdbID: 'tt2788316',
    name: 'Shōgun',
    year: '2024',
    rating: '8.6',
    votes: '190,000+',
    rated: 'TV-MA',
    runtime: '10 Episodes',
    rankBadge: '18 Emmy Record Winner',
    director: 'Rachel Kondo & Justin Marks',
    cast: 'Hiroyuki Sanada, Cosmo Jarvis, Anna Sawai',
    genres: ['Adventure', 'Drama', 'History'],
    mood: 'Series',
    poster: 'https://m.media-amazon.com/images/M/MV5BZmJkMDRjYzEtMWI3Ny00OWE3LWJlNTItMGQ1MTQzMzc3NDY5XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BZmJkMDRjYzEtMWI3Ny00OWE3LWJlNTItMGQ1MTQzMzc3NDY5XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'The battle for the Shogunate begins.',
    plot: 'When a mysterious European ship is found marooned in feudal Japan, Lord Yoshii Toranaga discovers secrets that tip the scales of power.',
    liveViewers: 2850
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
  }, [totalSpotlights]);

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
        <div
          className="cinema-cockpit-console"
          key={`cockpit-${currentSpotlight.imdbID}`}
          onClick={handleOpenMovie}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenMovie();
          }}
          title={`Explore ${currentSpotlight.name}`}
        >
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
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMovie();
              }}
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
