import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../services/soundEffects';

export const SPOTLIGHT_MOVIES_DATA = [
  {
    imdbID: 'tt15239678',
    name: 'Dune: Part Two',
    year: '2024',
    rating: '8.5',
    votes: '620,000+',
    rated: 'PG-13',
    runtime: '2h 46m',
    rankBadge: '#1 Hollywood Sci-Fi',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    mood: 'Hollywood Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Long live the fighters of Arrakis.',
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    liveViewers: 3420
  },
  {
    imdbID: 'tt12735488',
    name: 'Kalki 2898 AD',
    year: '2024',
    rating: '7.6',
    votes: '95,000+',
    rated: 'PG-13',
    runtime: '3h 0m',
    rankBadge: '#1 Indian Sci-Fi Epic',
    director: 'Nag Ashwin',
    cast: 'Prabhas, Amitabh Bachchan, Deepika Padukone',
    genres: ['Sci-Fi', 'Action', 'Fantasy'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'When darkness engulfs humanity, a savior rises.',
    plot: 'In a dystopian future 2898 AD, a modern avatar of Vishnu descends to Earth to protect humanity from dark forces.',
    liveViewers: 4120
  },
  {
    imdbID: 'tt15398776',
    name: 'Oppenheimer',
    year: '2023',
    rating: '8.9',
    votes: '820,000+',
    rated: 'R',
    runtime: '3h 0m',
    rankBadge: '7 Academy Awards Winner',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.',
    genres: ['Biography', 'Drama', 'History'],
    mood: 'Hollywood Masterpiece',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'The story of the man who changed the world forever.',
    plot: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    liveViewers: 3890
  },
  {
    imdbID: 'tt28532454',
    name: 'Stree 2',
    year: '2024',
    rating: '7.7',
    votes: '45,000+',
    rated: 'PG-13',
    runtime: '2h 27m',
    rankBadge: '#1 Indian Horror Comedy Blockbuster',
    director: 'Amar Kaushik',
    cast: 'Shraddha Kapoor, Rajkummar Rao, Pankaj Tripathi',
    genres: ['Comedy', 'Horror', 'Mystery'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMTA1NmUxYzItZmVmNy00YmQxLTk4Y2UtZjVkMWUwMWQ5N2IxXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMTA1NmUxYzItZmVmNy00YmQxLTk4Y2UtZjVkMWUwMWQ5N2IxXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Chanderi faces a frightening new terror.',
    plot: 'The town of Chanderi is haunted by a headless entity known as Sarkata, requiring the gang to unite to save the town.',
    liveViewers: 4250
  },
  {
    imdbID: 'tt27911000',
    name: 'Maharaja',
    year: '2024',
    rating: '8.5',
    votes: '85,000+',
    rated: 'PG-13',
    runtime: '2h 20m',
    rankBadge: '2024 Top Rated Indian Thriller',
    director: 'Nithilan Swaminathan',
    cast: 'Vijay Sethupathi, Anurag Kashyap, Mamta Mohandas',
    genres: ['Action', 'Crime', 'Drama'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BOTFlMTIxOGItZTk0Zi00MTk2LWJiM2UtMzlhZWYzNjQ4N2Y3XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BOTFlMTIxOGItZTk0Zi00MTk2LWJiM2UtMzlhZWYzNjQ4N2Y3XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'An unforgiving quest for justice.',
    plot: 'A quiet barber seeks vengeance after home invaders assault his household and steal a cherished family item.',
    liveViewers: 3950
  },
  {
    imdbID: 'tt12610390',
    name: 'Gladiator II',
    year: '2024',
    rating: '8.2',
    votes: '140,000+',
    rated: 'R',
    runtime: '2h 28m',
    rankBadge: '2024 Hollywood Epic',
    director: 'Ridley Scott',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington',
    genres: ['Action', 'Adventure', 'Drama'],
    mood: 'Hollywood Cinema',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    secondaryPoster: 'https://image.tmdb.org/t/p/original/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg',
    tagline: 'What we do in life echoes in eternity.',
    plot: 'Years after witnessing the death of Maximus, Lucius enters the Colosseum to fight for the restoration of Rome\'s glory.',
    liveViewers: 3680
  },
  {
    imdbID: 'tt23849204',
    name: '12th Fail',
    year: '2023',
    rating: '8.9',
    votes: '120,000+',
    rated: 'PG-13',
    runtime: '2h 27m',
    rankBadge: 'IMDb Top Rated Indian Drama',
    director: 'Vidhu Vinod Chopra',
    cast: 'Vikrant Massey, Medha Shankr, Anant V Joshi',
    genres: ['Biography', 'Drama'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BNTE3OTIxZDYtNjA0NC00N2YxLTg1NGQtOTYxNmZkMDkwOWNjXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BNTE3OTIxZDYtNjA0NC00N2YxLTg1NGQtOTYxNmZkMDkwOWNjXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Restart. Defy the odds.',
    plot: 'Based on the true story of Manoj Kumar Sharma who overcomes extreme poverty to become an IPS officer.',
    liveViewers: 4100
  },
  {
    imdbID: 'tt6263850',
    name: 'Deadpool & Wolverine',
    year: '2024',
    rating: '7.8',
    votes: '590,000+',
    rated: 'R',
    runtime: '2h 8m',
    rankBadge: '2024 Marvel Blockbuster',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    mood: 'Hollywood Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Come together to save the multiverse.',
    plot: 'Wolverine is recovering from his injuries when he crosses paths with Deadpool to defeat a common enemy.',
    liveViewers: 3410
  },
  {
    imdbID: 'tt26458038',
    name: 'Manjummel Boys',
    year: '2024',
    rating: '8.2',
    votes: '35,000+',
    rated: 'PG-13',
    runtime: '2h 15m',
    rankBadge: '#1 Indian Survival Thriller',
    director: 'Chidambaram',
    cast: 'Soubin Shahir, Sreenath Bhasi, Balu Varghese',
    genres: ['Adventure', 'Drama', 'Thriller'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMDVkOGEzZDgtYWU4Yi00MDA3LWE4YmQtYjQxNDgwNDYxNGU4XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMDVkOGEzZDgtYWU4Yi00MDA3LWE4YmQtYjQxNDgwNDYxNGU4XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'True friendship defies the darkest depths.',
    plot: 'A group of friends embark on a trip where one of them gets trapped inside Guna Caves, sparking a perilous rescue mission.',
    liveViewers: 3210
  },
  {
    imdbID: 'tt9362722',
    name: 'Spider-Man: Across the Spider-Verse',
    year: '2023',
    rating: '8.6',
    votes: '360,000+',
    rated: 'PG',
    runtime: '2h 20m',
    rankBadge: 'Hollywood Animated Masterpiece',
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac',
    genres: ['Animation', 'Action', 'Adventure'],
    mood: 'Hollywood Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'With great power comes great responsibility.',
    plot: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
    liveViewers: 3150
  },
  {
    imdbID: 'tt23289160',
    name: 'Godzilla Minus One',
    year: '2023',
    rating: '7.9',
    votes: '160,000+',
    rated: 'PG-13',
    runtime: '2h 5m',
    rankBadge: 'Oscar Winner - Best Visual Effects',
    director: 'Takashi Yamazaki',
    cast: 'Ryunosuke Kamiki, Minami Hamabe, Yuki Yamada',
    genres: ['Action', 'Drama', 'Sci-Fi'],
    mood: 'Global Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMjc5MjllMGUtMDIwMS00ZDVkLWEzODQtM2NlMTMwMTZhNThmXkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMjc5MjllMGUtMDIwMS00ZDVkLWEzODQtM2NlMTMwMTZhNThmXkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Post-war Japan. Zero to minus one.',
    plot: 'Post-war Japan faces a horrific new crisis in the form of a giant atomic-powered monster.',
    liveViewers: 3050
  },
  {
    imdbID: 'tt15354916',
    name: 'Jawan',
    year: '2023',
    rating: '6.9',
    votes: '95,000+',
    rated: 'PG-13',
    runtime: '2h 49m',
    rankBadge: 'Global Indian Action Record',
    director: 'Atlee',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi',
    genres: ['Action', 'Thriller', 'Drama'],
    mood: 'Indian Cinema',
    poster: 'https://images.weserv.nl/?url=https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_SX300.jpg',
    secondaryPoster: 'https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_SX300.jpg',
    tagline: 'Ready or not, here he comes.',
    plot: 'A high-octane action thriller outlining a man set to rectify the wrongs in society.',
    liveViewers: 3380
  }
];

const ROTATION_INTERVAL = 6000;

const HeroSection = ({
  onSelectMovie,
  onToggleWatchlist,
  watchlist = [],
  onWatchTrailer
}) => {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [imageFallbacks, setImageFallbacks] = useState({});
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const isPointerDown = useRef(false);

  const totalSpotlights = SPOTLIGHT_MOVIES_DATA.length;
  const currentSpotlight = SPOTLIGHT_MOVIES_DATA[spotlightIndex % totalSpotlights];

  const getPosterUrl = (movie) => {
    if (!movie) return '';
    return imageFallbacks[movie.imdbID] || movie.poster;
  };

  const handleImageError = (id) => {
    if (!id) return;
    const movie = SPOTLIGHT_MOVIES_DATA.find((m) => m.imdbID === id);
    if (!movie) return;

    // Step 1: Try proxy url if poster isn't proxied yet
    if (!imageFallbacks[id] && movie.poster && !movie.poster.includes('images.weserv.nl')) {
      const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(movie.poster)}`;
      setImageFallbacks((prev) => ({
        ...prev,
        [id]: proxied
      }));
      return;
    }

    // Step 2: Try secondary poster URL if available & different
    if (!imageFallbacks[id] && movie.secondaryPoster && movie.secondaryPoster !== movie.poster) {
      const proxiedSec = movie.secondaryPoster.includes('images.weserv.nl')
        ? movie.secondaryPoster
        : `https://images.weserv.nl/?url=${encodeURIComponent(movie.secondaryPoster)}`;
      setImageFallbacks((prev) => ({
        ...prev,
        [id]: proxiedSec
      }));
      return;
    }

    // Step 3: Final fallback to styled dark SVG placeholder
    if (imageFallbacks[id] && imageFallbacks[id].startsWith('data:image/svg+xml')) return;

    const movieTitle = movie ? movie.name : 'Cinema';
    const svgFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="45%" fill="%23e2e8f0" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${encodeURIComponent(movieTitle)}</text><text x="50%" y="55%" fill="%23f59e0b" font-family="sans-serif" font-size="20" text-anchor="middle">★ Spotlight Cinema</text></svg>`;
    setImageFallbacks((prev) => ({
      ...prev,
      [id]: svgFallback
    }));
  };

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

    const threshold = 35;
    if (dragOffset < -threshold) {
      playSound('whoosh');
      setSpotlightIndex((prev) => (prev + 1) % totalSpotlights);
      setTimerKey((k) => k + 1);
    } else if (dragOffset > threshold) {
      playSound('whoosh');
      setSpotlightIndex((prev) => (prev - 1 + totalSpotlights) % totalSpotlights);
      setTimerKey((k) => k + 1);
    }
    setDragOffset(0);
  };

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
      {/* Multi-layer Backdrop Layer */}
      <div className="stage-backdrops-container" aria-hidden="true">
        {SPOTLIGHT_MOVIES_DATA.map((movie, idx) => {
          const isCurrent = idx === (spotlightIndex % totalSpotlights);
          return (
            <div
              key={`bg-${movie.imdbID}`}
              className={`stage-panoramic-backdrop-layer ${isCurrent ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${getPosterUrl(movie)})`
              }}
            />
          );
        })}
      </div>

      <div className="stage-ambient-glow-mesh" aria-hidden="true" />
      <div className="stage-scrim-radial" aria-hidden="true" />
      <div className="stage-scrim-left" aria-hidden="true" />
      <div className="stage-scrim-bottom" aria-hidden="true" />
      <div className="stage-scrim-top" aria-hidden="true" />

      {/* Main Inner Stage Wrapper */}
      <div className="stage-inner-wrapper">
        {/* ==========================================
            LEFT: CINEMA COCKPIT CONSOLE (Clean & Minimalist)
            ========================================== */}
        <div
          className="cinema-cockpit-console"
          key={`cockpit-${currentSpotlight.imdbID}`}
        >
          {/* Cinematic Title */}
          <div className="cockpit-title-block">
            <h2
              className="cockpit-title"
              onClick={handleOpenMovie}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenMovie();
              }}
              title={`Explore ${currentSpotlight.name}`}
            >
              {currentSpotlight.name}{' '}
              <span className="cockpit-year-tag">({currentSpotlight.year})</span>
            </h2>
          </div>

          {/* Tagline */}
          {currentSpotlight.tagline && (
            <p className="cockpit-tagline">"{currentSpotlight.tagline}"</p>
          )}

          {/* Netflix Signature Specs Row (Match %, IMDb, Rating, Quality) */}
          <div className="cockpit-spec-row">
            <span className="spec-badge-match">98% Match</span>
            <span className="spec-badge-gold">★ {currentSpotlight.rating} IMDb</span>
            {currentSpotlight.votes && (
              <span className="spec-votes-count">({currentSpotlight.votes})</span>
            )}
            <span className="spec-badge-neon">{currentSpotlight.runtime}</span>
            <span className="spec-badge-age">{currentSpotlight.rated}</span>
            <span className="spec-badge-tech">4K Ultra HD</span>
            <span className="spec-badge-tech">Dolby Atmos</span>
          </div>

          {/* Plot Overview */}
          {currentSpotlight.plot && (
            <p className="cockpit-plot-synopsis">{currentSpotlight.plot}</p>
          )}

          {/* Director & Cast Row */}
          {(currentSpotlight.director || currentSpotlight.cast) && (
            <div className="cockpit-credits-row">
              {currentSpotlight.director && (
                <span className="credits-director">
                  <strong>Director:</strong> {currentSpotlight.director}
                </span>
              )}
              {currentSpotlight.director && currentSpotlight.cast && (
                <span className="credits-divider">•</span>
              )}
              {currentSpotlight.cast && (
                <span className="credits-cast">
                  <strong>Starring:</strong> {currentSpotlight.cast}
                </span>
              )}
            </div>
          )}

          {/* Genre Pills */}
          {currentSpotlight.genres && currentSpotlight.genres.length > 0 && (
            <div className="cockpit-genre-chips">
              {currentSpotlight.genres.map((g) => (
                <span key={g} className="cockpit-genre-pill">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Primary Action Button Cluster (Netflix/Hotstar Inspired) */}
          <div className="cockpit-cta-group">
            <button
              type="button"
              className="cockpit-primary-explore-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMovie();
              }}
              title="Explore full movie details"
            >
              <span className="cta-play-icon">▶</span>
              <span>Explore Details</span>
              <span className="cta-arrow-glow">→</span>
            </button>

            {onWatchTrailer && (
              <button
                type="button"
                className="cockpit-watchlist-btn cta-trailer-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchTrailer(currentSpotlight);
                }}
                title="Watch official trailer"
              >
                <span>🎬 Watch Trailer</span>
              </button>
            )}

            <button
              type="button"
              className={`cockpit-watchlist-btn ${isWatchlisted(currentSpotlight) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                if (onToggleWatchlist) onToggleWatchlist(currentSpotlight);
              }}
              title={isWatchlisted(currentSpotlight) ? 'Remove from My List' : 'Add to My List'}
            >
              <span>{isWatchlisted(currentSpotlight) ? '✓ In My List' : '+ My List'}</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT: 3D DEPTH POSTER DECK, DRAGGABLE ORBIT & DOT NAVIGATION
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
            {SPOTLIGHT_MOVIES_DATA.map((movie, idx) => {
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
                      src={getPosterUrl(movie)}
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

          {/* Interactive Poster Gallery Menu (Seamless Draggable Strip) */}
          <div
            className={`hero-poster-gallery ${isDragging ? 'is-dragging' : ''}`}
            role="tablist"
            aria-label="Spotlight movie thumbnails"
            onMouseDown={(e) => handleStartDrag(e.clientX)}
            onMouseMove={(e) => handleMoveDrag(e.clientX)}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={(e) => handleStartDrag(e.touches[0].clientX)}
            onTouchMove={(e) => handleMoveDrag(e.touches[0].clientX)}
            onTouchEnd={handleEndDrag}
          >
            {SPOTLIGHT_MOVIES_DATA.map((movie, idx) => {
              const isActive = idx === (spotlightIndex % totalSpotlights);
              return (
                <button
                  type="button"
                  key={`gallery-item-${movie.imdbID}`}
                  className={`gallery-thumb-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (Math.abs(dragOffset) > 10) return;
                    handleDeckSelect(idx);
                  }}
                  title={`${movie.name} (${movie.year}) - Click to spotlight`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <img
                    src={getPosterUrl(movie)}
                    alt={movie.name}
                    className="gallery-thumb-img"
                    referrerPolicy="no-referrer"
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

          {/* Modern Dot Navigation System */}
          <div className="hero-dots-navigation" role="tablist" aria-label="Spotlight navigation dots">
            {SPOTLIGHT_MOVIES_DATA.map((movie, idx) => {
              const isActive = idx === (spotlightIndex % totalSpotlights);
              return (
                <button
                  type="button"
                  key={`dot-nav-${movie.imdbID}`}
                  className={`hero-nav-dot ${isActive ? 'active' : ''}`}
                  onClick={() => handleDeckSelect(idx)}
                  title={`Switch to ${movie.name}`}
                  role="tab"
                  aria-selected={isActive}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


