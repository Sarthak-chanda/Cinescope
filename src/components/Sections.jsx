import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import HeroSection from './HeroSection';
import { playSound } from '../services/soundEffects';
import { fetchDynamicCategoryTitles } from '../services/movieApi';
import { fetchBollywoodSubcategory } from '../services/bollywoodApi';
import { fetchBengaliSubcategory } from '../services/bengaliApi';
import { fetchMalayalamSubcategory } from '../services/malayalamApi';
import { fetchTamilSubcategory } from '../services/tamilApi';
import {
  SPOTLIGHT_MOVIES,
  GENRE_LIST,
  LATEST_RELEASES_ALL,
  POPULAR_HITS_ALL,
  TOP_SERIES_ALL,
  TOP_ANIME_ALL,
  SCIFI_EXPANDED_ALL,
  CRITIC_RECOMMENDED_ALL,
  BOLLYWOOD_HITS_ALL,
  SOUTH_INDIAN_HITS_ALL,
  MALAYALAM_HITS_ALL,
  BENGALI_HITS_ALL,
  NOLLYWOOD_HITS_ALL,
  INDIAN_SERIES_ALL,
  PUNJABI_HITS_ALL,
  KANNADA_HITS_ALL,
  INDIAN_CLASSICS_ALL,
  OPEN_SOURCE_MOVIES_ALL
} from '../services/catalogData';

// Custom hook for natural, responsive, 1:1 physical drag scrolling
const useNaturalDragScroll = () => {
  const rowRef = React.useRef(null);
  const isDown = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftPos = React.useRef(0);
  const dragDistance = React.useRef(0);

  const onMouseDown = (e) => {
    if (e.button !== 0 || !rowRef.current) return;
    isDown.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftPos.current = rowRef.current.scrollLeft;

    rowRef.current.style.cursor = 'grabbing';
    rowRef.current.style.scrollBehavior = 'auto';
  };

  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDown.current || !rowRef.current) return;
      const x = e.pageX - rowRef.current.offsetLeft;
      const walk = x - startX.current;
      dragDistance.current = Math.abs(walk);

      if (dragDistance.current > 3) {
        e.preventDefault();
      }

      rowRef.current.scrollLeft = scrollLeftPos.current - walk;
    };

    const handleGlobalMouseUp = () => {
      if (!isDown.current) return;
      isDown.current = false;
      if (rowRef.current) {
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.scrollBehavior = 'smooth';
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return { rowRef, onMouseDown, dragDistance };
};

// Reusable Horizontal Draggable Movie Carousel Component
const DraggableMovieRow = ({
  title,
  subtitle,
  movies,
  onSeeMore,
  seeMoreLabel,
  onSelectMovie,
  watchlist,
  onToggleWatchlist,
  handleImageError
}) => {
  // STRICT RULE: If any category has fewer than 10 items, remove/hide it completely
  if (!movies || !Array.isArray(movies) || movies.length < 10) {
    return null;
  }

  const { rowRef, onMouseDown, dragDistance } = useNaturalDragScroll();
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const isWatchlisted = (movie) => {
    const movieId = movie.id || movie.imdbID;
    return watchlist && watchlist.some((w) => (w.id || w.imdbID) === movieId);
  };

  useEffect(() => {
    const container = rowRef.current;
    if (!container) return;

    const checkScrollEnd = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 40;
      setIsScrolledToEnd(atEnd);
    };

    checkScrollEnd();
    container.addEventListener('scroll', checkScrollEnd, { passive: true });
    window.addEventListener('resize', checkScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', checkScrollEnd);
      window.removeEventListener('resize', checkScrollEnd);
    };
  }, [movies]);

  return (
    <section className="home-section">
      <div className="section-title-row">
        <div>
          <h3 className="home-section-title">{title}</h3>
          {subtitle && (
            <span className="section-subtitle-tag" style={{ marginTop: '4px', display: 'inline-block' }}>
              {subtitle}
            </span>
          )}
        </div>

        {onSeeMore && (
          <button
            className={`top-see-more-btn ${isScrolledToEnd ? 'visible' : ''}`}
            onClick={() => {
              playSound('click');
              onSeeMore();
            }}
            type="button"
            title="See More"
          >
            <span>See More</span>
            <span className="see-more-arrow">→</span>
          </button>
        )}
      </div>

      <div
        ref={rowRef}
        className="movie-cards-drag-row"
        onMouseDown={onMouseDown}
      >
        {movies.map((m) => (
          <div key={m.id || m.imdbID} className="carousel-movie-item">
            <MovieCard
              movie={m}
              onSelect={(selected) => {
                if (dragDistance.current < 6) {
                  onSelectMovie(selected);
                }
              }}
              onSelectMovie={(selected) => {
                if (dragDistance.current < 6) {
                  onSelectMovie(selected);
                }
              }}
              isWatchlisted={isWatchlisted(m)}
              onToggleWatchlist={onToggleWatchlist}
              onImageError={handleImageError}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

const UNIFORM_ROW_COUNT = 15;

const Sections = ({
  onSelectMovie,
  onSelectGenre,
  activeGenre,
  watchlist = [],
  onToggleWatchlist,
  onWatchTrailer
}) => {
  const [failedImages, setFailedImages] = useState(new Set());
  const { rowRef: genreRowRef, onMouseDown: onGenreMouseDown, dragDistance: genreDragDist } = useNaturalDragScroll();

  const [latestMovies, setLatestMovies] = useState(LATEST_RELEASES_ALL);
  const [popularMovies, setPopularMovies] = useState(POPULAR_HITS_ALL);
  const [tvSeries, setTvSeries] = useState(TOP_SERIES_ALL);
  const [animeList, setAnimeList] = useState(TOP_ANIME_ALL);
  const [scifiMovies, setScifiMovies] = useState(SCIFI_EXPANDED_ALL);
  const [criticMovies, setCriticMovies] = useState(CRITIC_RECOMMENDED_ALL);
  const [bollywoodMovies, setBollywoodMovies] = useState(BOLLYWOOD_HITS_ALL);
  const [southMovies, setSouthMovies] = useState(SOUTH_INDIAN_HITS_ALL);
  const [malayalamMovies, setMalayalamMovies] = useState(MALAYALAM_HITS_ALL);
  const [bengaliMovies, setBengaliMovies] = useState(BENGALI_HITS_ALL);
  const [nollywoodMovies, setNollywoodMovies] = useState(NOLLYWOOD_HITS_ALL);
  const [indianSeriesList, setIndianSeriesList] = useState(INDIAN_SERIES_ALL);
  const [punjabiMovies, setPunjabiMovies] = useState(PUNJABI_HITS_ALL);
  const [openSourceMovies, setOpenSourceMovies] = useState(OPEN_SOURCE_MOVIES_ALL);
  const [kannadaMovies, setKannadaMovies] = useState(KANNADA_HITS_ALL);
  const [classicsMovies, setClassicsMovies] = useState(INDIAN_CLASSICS_ALL);
  const [bollyAction, setBollyAction] = useState([]);
  const [bollyCrime, setBollyCrime] = useState([]);
  const [bollyComedy, setBollyComedy] = useState([]);
  const [bollyRomance, setBollyRomance] = useState([]);
  const [bengaliMysteries, setBengaliMysteries] = useState([]);
  const [malayalamThrillers, setMalayalamThrillers] = useState([]);
  const [malayalamBlockbusters, setMalayalamBlockbusters] = useState([]);
  const [tamilAction, setTamilAction] = useState([]);
  const [tamilThrillers, setTamilThrillers] = useState([]);

  // Live Background Category Enrichment from Specific APIs (AniList, TVmaze, OMDb, Regional APIs)
  useEffect(() => {
    let isMounted = true;

    const enrichCategories = async () => {
      try {
        const [
          liveSeries,
          liveAnime,
          liveLatest,
          liveBolly,
          liveTolly,
          liveMalayalam,
          liveBengali,
          liveNollywood,
          liveIndSeries,
          livePunjabi,
          liveKannada,
          liveClassics,
          bAction,
          bCrime,
          bComedy,
          bRomance,
          bMysteries,
          mThrillers,
          mBlockbusters,
          tAction,
          tThrillers
        ] = await Promise.allSettled([
          fetchDynamicCategoryTitles('series'),
          fetchDynamicCategoryTitles('anime'),
          fetchDynamicCategoryTitles('latest'),
          fetchDynamicCategoryTitles('bollywood'),
          fetchDynamicCategoryTitles('tollywood'),
          fetchDynamicCategoryTitles('malayalam'),
          fetchDynamicCategoryTitles('bengali'),
          fetchDynamicCategoryTitles('nollywood'),
          fetchDynamicCategoryTitles('indian_series'),
          fetchDynamicCategoryTitles('punjabi'),
          fetchDynamicCategoryTitles('kannada'),
          fetchDynamicCategoryTitles('indian_classics'),
          fetchBollywoodSubcategory('bollywood_action'),
          fetchBollywoodSubcategory('bollywood_crime_thrillers'),
          fetchBollywoodSubcategory('bollywood_comedy_horror'),
          fetchBollywoodSubcategory('bollywood_romance'),
          fetchBengaliSubcategory('bengali_mysteries'),
          fetchMalayalamSubcategory('malayalam_thrillers'),
          fetchMalayalamSubcategory('malayalam_blockbusters'),
          fetchTamilSubcategory('tamil_action'),
          fetchTamilSubcategory('tamil_thrillers')
        ]);

        if (!isMounted) return;

        if (liveAnime && liveAnime.status === 'fulfilled' && Array.isArray(liveAnime.value) && liveAnime.value.length > 0) {
          setAnimeList(liveAnime.value);
        }
        if (liveSeries.status === 'fulfilled' && Array.isArray(liveSeries.value) && liveSeries.value.length > 0) {
          setTvSeries((prev) => [...prev, ...liveSeries.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveLatest.status === 'fulfilled' && Array.isArray(liveLatest.value) && liveLatest.value.length > 0) {
          setLatestMovies((prev) => [...prev, ...liveLatest.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveBolly.status === 'fulfilled' && Array.isArray(liveBolly.value) && liveBolly.value.length > 0) {
          setBollywoodMovies((prev) => [...prev, ...liveBolly.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveTolly.status === 'fulfilled' && Array.isArray(liveTolly.value) && liveTolly.value.length > 0) {
          setSouthMovies((prev) => [...prev, ...liveTolly.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveMalayalam.status === 'fulfilled' && Array.isArray(liveMalayalam.value) && liveMalayalam.value.length > 0) {
          setMalayalamMovies((prev) => [...prev, ...liveMalayalam.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveBengali.status === 'fulfilled' && Array.isArray(liveBengali.value) && liveBengali.value.length > 0) {
          setBengaliMovies((prev) => [...prev, ...liveBengali.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveNollywood.status === 'fulfilled' && Array.isArray(liveNollywood.value) && liveNollywood.value.length > 0) {
          setNollywoodMovies((prev) => [...prev, ...liveNollywood.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveIndSeries.status === 'fulfilled' && Array.isArray(liveIndSeries.value) && liveIndSeries.value.length > 0) {
          setIndianSeriesList((prev) => [...prev, ...liveIndSeries.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (livePunjabi.status === 'fulfilled' && Array.isArray(livePunjabi.value) && livePunjabi.value.length > 0) {
          setPunjabiMovies((prev) => [...prev, ...livePunjabi.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveKannada.status === 'fulfilled' && Array.isArray(liveKannada.value) && liveKannada.value.length > 0) {
          setKannadaMovies((prev) => [...prev, ...liveKannada.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (liveClassics.status === 'fulfilled' && Array.isArray(liveClassics.value) && liveClassics.value.length > 0) {
          setClassicsMovies((prev) => [...prev, ...liveClassics.value.filter((m) => !prev.some((p) => (p.id || p.imdbID) === (m.id || m.imdbID)))]);
        }
        if (bAction.status === 'fulfilled' && Array.isArray(bAction.value)) setBollyAction(bAction.value);
        if (bCrime.status === 'fulfilled' && Array.isArray(bCrime.value)) setBollyCrime(bCrime.value);
        if (bComedy.status === 'fulfilled' && Array.isArray(bComedy.value)) setBollyComedy(bComedy.value);
        if (bRomance.status === 'fulfilled' && Array.isArray(bRomance.value)) setBollyRomance(bRomance.value);
        if (bMysteries.status === 'fulfilled' && Array.isArray(bMysteries.value)) setBengaliMysteries(bMysteries.value);
        if (mThrillers.status === 'fulfilled' && Array.isArray(mThrillers.value)) setMalayalamThrillers(mThrillers.value);
        if (mBlockbusters.status === 'fulfilled' && Array.isArray(mBlockbusters.value)) setMalayalamBlockbusters(mBlockbusters.value);
        if (tAction.status === 'fulfilled' && Array.isArray(tAction.value)) setTamilAction(tAction.value);
        if (tThrillers.status === 'fulfilled' && Array.isArray(tThrillers.value)) setTamilThrillers(tThrillers.value);
      } catch {
        // Fallback safely
      }
    };

    enrichCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle image loading failures across categories
  const handleImageError = (id) => {
    if (!id) return;
    setFailedImages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Helper to filter out any movie whose poster failed and slice to uniform exact count
  const getUniformRowMovies = (movieList) => {
    return (movieList || [])
      .filter((m) => m && m.poster && !failedImages.has(m.id || m.imdbID))
      .slice(0, UNIFORM_ROW_COUNT);
  };

  return (
    <div className="home-sections-container animate-fade-in">
      {/* =========================================================================
          MODULAR HERO SECTION: PANORAMIC THEATER & 3D POSTER DECK
          ========================================================================= */}
      <HeroSection
        onSelectMovie={onSelectMovie}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        onWatchTrailer={onWatchTrailer}
      />

      {/* =========================================================================
          1. CATEGORY & GENRE EXPLORER (Natural Draggable Single Line)
          ========================================================================= */}
      <section className="home-section">
        <div className="section-title-row">
          <div>
            <h3 className="home-section-title">
              Explore Genres & Collections
            </h3>
            <span className="section-subtitle-tag" style={{ marginTop: '4px', display: 'inline-block' }}>
              Drag horizontally to explore all cinema categories and curated collections
            </span>
          </div>
        </div>

        {/* Unified Natural Single Draggable Row */}
        <div
          ref={genreRowRef}
          className="genre-cards-drag-row"
          onMouseDown={onGenreMouseDown}
        >
          {GENRE_LIST.map((g) => {
            const isSelected = activeGenre === g.name;
            return (
              <div
                key={g.name}
                className={`genre-explore-card ${isSelected ? 'active' : ''}`}
                style={{ '--card-bg': `url(${g.bg})` }}
                onClick={() => {
                  if (genreDragDist.current < 6) {
                    playSound('click');
                    onSelectGenre(g.name);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectGenre(g.name);
                  }
                }}
              >
                <div className="genre-card-bg" />
                <div className="genre-card-overlay" />
                <div className="genre-card-content">
                  <span className="genre-card-name">{g.name}</span>
                  <span className="genre-card-arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* =========================================================================
          2. LATEST BLOCKBUSTER HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Latest Blockbuster Hits"
        subtitle="Fresh theatrical releases, blockbuster sequels, and box office hits"
        movies={getUniformRowMovies(latestMovies)}
        onSeeMore={() => onSelectGenre('Latest Blockbuster Hits')}
        seeMoreLabel="See More Latest Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          3. BOLLYWOOD HINDI BLOCKBUSTERS
          ========================================================================= */}
      <DraggableMovieRow
        title="Bollywood Hindi Blockbusters"
        subtitle="Massive theatrical hits, romantic sagas, and Hindi cinematic masterpieces"
        movies={getUniformRowMovies(bollywoodMovies)}
        onSeeMore={() => onSelectGenre('Bollywood Hindi Blockbusters')}
        seeMoreLabel="See More Bollywood Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          4. SOUTH CINEMA LEGENDS
          ========================================================================= */}
      <DraggableMovieRow
        title="South Cinema Legends"
        subtitle="High-octane Telugu, Tamil & South Indian action epics and box office records"
        movies={getUniformRowMovies(southMovies)}
        onSeeMore={() => onSelectGenre('South Cinema Legends')}
        seeMoreLabel="See More South Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          5. POPULAR ALL-TIME HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Popular Cinema Hits"
        subtitle="Audience favorites and legendary box office milestones"
        movies={getUniformRowMovies(popularMovies)}
        onSeeMore={() => onSelectGenre('Popular Cinema Hits')}
        seeMoreLabel="See More Popular Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          6. TOP RATED SHOWS
          ========================================================================= */}
      <DraggableMovieRow
        title="Top Rated Shows"
        subtitle="Multi-season shows powered by live metadata & episode guides"
        movies={getUniformRowMovies(tvSeries)}
        onSeeMore={() => onSelectGenre('Top Rated Shows')}
        seeMoreLabel="See More TV Shows →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          7. LEGENDARY ANIME SHOWS
          ========================================================================= */}
      <DraggableMovieRow
        title="Legendary Anime Shows"
        subtitle="Live AniList HD catalog & Studio Ghibli masterpieces"
        movies={getUniformRowMovies(animeList)}
        onSeeMore={() => onSelectGenre('Legendary Anime Shows')}
        seeMoreLabel="See More Anime →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          7. OPEN SOURCE & FREE LICENSE-FREE CINEMA
          ========================================================================= */}
      <DraggableMovieRow
        title="Open Source & Free License-Free Cinema"
        subtitle="100% free open-source Blender Foundation movies, Creative Commons classics, and public domain films"
        movies={getUniformRowMovies(openSourceMovies)}
        onSeeMore={() => onSelectGenre('Open Source & Free Cinema')}
        seeMoreLabel="See More Open Source Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          8. SCI-FI ODYSSEYS
          ========================================================================= */}
      <DraggableMovieRow
        title="Sci Fi Odysseys"
        subtitle="Mind-bending cinematic journeys across galaxies and AI futures"
        movies={getUniformRowMovies(scifiMovies)}
        onSeeMore={() => onSelectGenre('Sci Fi Odysseys')}
        seeMoreLabel="See More Sci-Fi →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          8A. BOLLYWOOD ACTION HITS
          ========================================================================= */}
      {bollyAction && bollyAction.length > 0 && (
        <DraggableMovieRow
          title="Bollywood Action Hits"
          subtitle="Spy universe thrillers, revenge sagas, and explosive Hindi action cinema"
          movies={getUniformRowMovies(bollyAction)}
          onSeeMore={() => onSelectGenre('Bollywood Action Hits')}
          seeMoreLabel="See More Action Hits →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          8B. HINDI CRIME THRILLERS
          ========================================================================= */}
      {bollyCrime && bollyCrime.length > 0 && (
        <DraggableMovieRow
          title="Hindi Crime Thrillers"
          subtitle="Edge-of-the-seat Hindi murder mysteries, suspense sagas, and psychological thrillers"
          movies={getUniformRowMovies(bollyCrime)}
          onSeeMore={() => onSelectGenre('Hindi Crime Thrillers')}
          seeMoreLabel="See More Crime Thrillers →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          7C. BOLLYWOOD COMEDY HITS
          ========================================================================= */}
      {bollyComedy && bollyComedy.length > 0 && (
        <DraggableMovieRow
          title="Bollywood Comedy Hits"
          subtitle="Hilarious Hindi blockbusters, cult comedies, and supernatural horror-comedy sagas"
          movies={getUniformRowMovies(bollyComedy)}
          onSeeMore={() => onSelectGenre('Bollywood Comedy Hits')}
          seeMoreLabel="See More Comedies →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          7D. HINDI ROMANCE DRAMAS
          ========================================================================= */}
      {bollyRomance && bollyRomance.length > 0 && (
        <DraggableMovieRow
          title="Hindi Romance Dramas"
          subtitle="Heartwarming Bollywood love stories, coming-of-age journeys, and evergreen sagas"
          movies={getUniformRowMovies(bollyRomance)}
          onSeeMore={() => onSelectGenre('Hindi Romance Dramas')}
          seeMoreLabel="See More Romance Hits →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          8. SOUTH CINEMA LEGENDS
          ========================================================================= */}
      <DraggableMovieRow
        title="South Cinema Legends"
        subtitle="High-octane Telugu, Tamil & South Indian action epics and box office records"
        movies={getUniformRowMovies(southMovies)}
        onSeeMore={() => onSelectGenre('South Cinema Legends')}
        seeMoreLabel="See More South Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          8A. TAMIL ACTION BLOCKBUSTERS
          ========================================================================= */}
      {tamilAction && tamilAction.length > 0 && (
        <DraggableMovieRow
          title="Tamil Action Blockbusters"
          subtitle="Massive Kollywood theatrical action epics, LCU universe hits, and superstar sagas"
          movies={getUniformRowMovies(tamilAction)}
          onSeeMore={() => onSelectGenre('Tamil Action Blockbusters')}
          seeMoreLabel="See More Tamil Action →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          8B. TAMIL SUSPENSE THRILLERS
          ========================================================================= */}
      {tamilThrillers && tamilThrillers.length > 0 && (
        <DraggableMovieRow
          title="Tamil Suspense Thrillers"
          subtitle="Edge-of-the-seat Tamil psycho-thrillers, crime investigation hits, and mind-benders"
          movies={getUniformRowMovies(tamilThrillers)}
          onSeeMore={() => onSelectGenre('Tamil Suspense Thrillers')}
          seeMoreLabel="See More Tamil Thrillers →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          9. MALAYALAM CINEMA HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Malayalam Cinema Hits"
        subtitle="Acclaimed storytelling, realistic thrillers, and award-winning Kerala cinema"
        movies={getUniformRowMovies(malayalamMovies)}
        onSeeMore={() => onSelectGenre('Malayalam Cinema Hits')}
        seeMoreLabel="See More Malayalam Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          9A. MALAYALAM CRIME THRILLERS
          ========================================================================= */}
      {malayalamThrillers && malayalamThrillers.length > 0 && (
        <DraggableMovieRow
          title="Malayalam Crime Thrillers"
          subtitle="Realistic Kerala police procedurals, investigation sagas, and suspense thrillers"
          movies={getUniformRowMovies(malayalamThrillers)}
          onSeeMore={() => onSelectGenre('Malayalam Crime Thrillers')}
          seeMoreLabel="See More Malayalam Thrillers →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          9B. MALAYALAM SUPERHIT BLOCKBUSTERS
          ========================================================================= */}
      {malayalamBlockbusters && malayalamBlockbusters.length > 0 && (
        <DraggableMovieRow
          title="Malayalam Superhit Blockbusters"
          subtitle="Record-breaking Mollywood box office hits, survival sagas, and action entertainers"
          movies={getUniformRowMovies(malayalamBlockbusters)}
          onSeeMore={() => onSelectGenre('Malayalam Superhit Blockbusters')}
          seeMoreLabel="See More Malayalam Blockbusters →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}



      {/* =========================================================================
          10A. BENGALI CINEMA HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Bengali Cinema Hits"
        subtitle="Satyajit Ray classics, Feluda mysteries, and modern Kolkata masterpieces"
        movies={getUniformRowMovies(bengaliMovies)}
        onSeeMore={() => onSelectGenre('Bengali Cinema Hits')}
        seeMoreLabel="See More Bengali Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          10A. BENGALI DETECTIVE MYSTERIES
          ========================================================================= */}
      {bengaliMysteries && bengaliMysteries.length > 0 && (
        <DraggableMovieRow
          title="Bengali Detective Mysteries"
          subtitle="Feluda, Byomkesh Bakshi, and thrilling Kolkata suspense sagas"
          movies={getUniformRowMovies(bengaliMysteries)}
          onSeeMore={() => onSelectGenre('Bengali Detective Mysteries')}
          seeMoreLabel="See More Bengali Mysteries →"
          onSelectMovie={onSelectMovie}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          handleImageError={handleImageError}
        />
      )}

      {/* =========================================================================
          11. NOLLYWOOD CINEMA HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Nollywood Cinema Hits"
        subtitle="Vibrant Nigerian films, blockbusters, and groundbreaking African storytelling"
        movies={getUniformRowMovies(nollywoodMovies)}
        onSeeMore={() => onSelectGenre('Nollywood Cinema Hits')}
        seeMoreLabel="See More Nollywood Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          12. INDIAN WEB SERIES
          ========================================================================= */}
      <DraggableMovieRow
        title="Indian Web Series"
        subtitle="Top-rated crime thrillers, comedies, and drama series across Hindi & regional languages"
        movies={getUniformRowMovies(indianSeriesList)}
        onSeeMore={() => onSelectGenre('Indian Web Series')}
        seeMoreLabel="See More Indian Series →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          13. PUNJABI CINEMA HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Punjabi Cinema Hits"
        subtitle="Blockbuster Punjabi comedies, blockbusters, and romantic dramas"
        movies={getUniformRowMovies(punjabiMovies)}
        onSeeMore={() => onSelectGenre('Punjabi Cinema Hits')}
        seeMoreLabel="See More Punjabi Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          14. KANNADA SANDALWOOD HITS
          ========================================================================= */}
      <DraggableMovieRow
        title="Kannada Sandalwood Hits"
        subtitle="High-octane blockbusters, mythological fantasies, and epic dramas from Sandalwood"
        movies={getUniformRowMovies(kannadaMovies)}
        onSeeMore={() => onSelectGenre('Kannada Sandalwood Hits')}
        seeMoreLabel="See More Sandalwood Cinema →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          15. INDIAN GOLDEN CLASSICS
          ========================================================================= */}
      <DraggableMovieRow
        title="Indian Golden Classics"
        subtitle="Timeless Bollywood masterpieces, evergreen musical sagas, and vintage gems"
        movies={getUniformRowMovies(classicsMovies)}
        onSeeMore={() => onSelectGenre('Indian Golden Classics')}
        seeMoreLabel="See More Indian Classics →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          16. CRITIC ACCLAIMED MASTERPIECES
          ========================================================================= */}
      <DraggableMovieRow
        title="Critic Acclaimed Masterpieces"
        subtitle="Oscar winners, Golden Globe honorees, and Rotten Tomatoes certified fresh"
        movies={getUniformRowMovies(criticMovies)}
        onSeeMore={() => onSelectGenre('Critic Acclaimed Masterpieces')}
        seeMoreLabel="See More Masterpieces →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />
    </div>
  );
};

export default Sections;
