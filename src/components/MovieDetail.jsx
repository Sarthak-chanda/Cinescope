import React from 'react';

const MovieDetail = ({
  movie,
  onBack,
  hasSearchResults,
  isWatchlisted,
  onToggleWatchlist,
  onShare
}) => {
  if (!movie) return null;

  const {
    name,
    year,
    rated,
    released,
    runtime,
    genre,
    director,
    writer,
    actors,
    plot,
    language,
    country,
    awards,
    poster,
    metascore,
    imdbRating,
    imdbVotes,
    imdbID,
    type,
    boxOffice,
    totalSeasons,
    ratings
  } = movie;

  return (
    <div className="movie-hero-wrapper animate-fade-in">
      {/* Dynamic Ambient Blur Backdrop */}
      {poster && (
        <div
          className="movie-hero-backdrop"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      <div className="movie-hero-content">
        {/* Left Column: Poster & Actions */}
        <div className="movie-poster-column">
          <div className="movie-poster-card">
            {poster ? (
              <img
                src={poster}
                alt={name}
                className="movie-poster-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="poster-fallback"
              style={{ display: poster ? 'none' : 'flex' }}
            >
              <span className="poster-fallback-icon">🎬</span>
              <span>No Poster Available</span>
            </div>

            <div className="poster-type-badge">
              {type || 'Movie'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="poster-actions">
            <button
              className="action-btn-primary"
              onClick={() => onToggleWatchlist(movie)}
            >
              <span>{isWatchlisted ? '★' : '☆'}</span>
              <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                className="action-btn-secondary"
                onClick={() => onShare(movie)}
                title="Copy movie info to clipboard"
              >
                <span>🔗</span>
                <span>Share</span>
              </button>

              {imdbID ? (
                <a
                  href={`https://www.imdb.com/title/${imdbID}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn-secondary"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  <span>↗</span>
                  <span>IMDb</span>
                </a>
              ) : null}
            </div>

            {hasSearchResults && (
              <button
                className="action-btn-secondary"
                onClick={onBack}
                style={{ marginTop: '0.25rem' }}
              >
                <span>←</span>
                <span>Back to Search Results</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Info & Metrics */}
        <div className="movie-details-column">
          {/* Header Top */}
          <div className="movie-header-top">
            <div>
              <h1 className="movie-title">{name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span className="source-badge">
                  <span>⚡</span> Ultra-Fast Cached
                </span>
                {totalSeasons && (
                  <span className="source-badge" style={{ borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}>
                    {totalSeasons} Seasons
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Pill Bar */}
          <div className="movie-metadata-bar">
            {rated && <span className="meta-pill rated">{rated}</span>}
            {year && <span className="meta-pill">📅 {year}</span>}
            {runtime && <span className="meta-pill">⏱ {runtime}</span>}
            {language && <span className="meta-pill">🌐 {language}</span>}
            {country && <span className="meta-pill">📍 {country}</span>}
            {released && <span className="meta-pill">🚀 {released}</span>}
          </div>

          {/* Genre Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {genre && genre.map((g, idx) => (
              <span key={idx} className="genre-tag">
                {g}
              </span>
            ))}
          </div>

          {/* Ratings Grid (IMDb, Rotten Tomatoes, Metacritic) */}
          <div className="ratings-grid">
            {/* IMDb */}
            <div className="rating-card">
              <div className="rating-icon-box rating-icon-imdb">IMDb</div>
              <div className="rating-info">
                <div className="rating-score">
                  {imdbRating !== 'N/A' ? `${imdbRating}/10` : 'N/A'}
                </div>
                <div className="rating-label">
                  {imdbVotes ? `${imdbVotes} votes` : 'IMDb Rating'}
                </div>
              </div>
            </div>

            {/* Rotten Tomatoes */}
            <div className="rating-card">
              <div className="rating-icon-box rating-icon-rt">🍅</div>
              <div className="rating-info">
                <div className="rating-score">
                  {ratings?.rottenTomatoes || 'N/A'}
                </div>
                <div className="rating-label">Rotten Tomatoes</div>
              </div>
            </div>

            {/* Metacritic */}
            <div className="rating-card">
              <div className="rating-icon-box rating-icon-meta">MC</div>
              <div className="rating-info">
                <div className="rating-score">
                  {metascore ? `${metascore}/100` : (ratings?.metacritic || 'N/A')}
                </div>
                <div className="rating-label">Metascore</div>
              </div>
            </div>
          </div>

          {/* Storyline / Full Plot */}
          <div className="synopsis-section">
            <div className="section-label">
              <span>📖</span> Storyline & Synopsis
            </div>
            <p className="synopsis-text">{plot}</p>
          </div>

          {/* Cast & Crew Grid */}
          <div className="info-fields-grid">
            {actors && actors.length > 0 && (
              <div className="info-field-card" style={{ gridColumn: '1 / -1' }}>
                <div className="info-field-title">Main Cast & Stars</div>
                <div className="actors-chips">
                  {actors.map((actor, i) => (
                    <span key={i} className="actor-pill">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {director && (
              <div className="info-field-card">
                <div className="info-field-title">Director</div>
                <div className="info-field-value">{director}</div>
              </div>
            )}

            {writer && (
              <div className="info-field-card">
                <div className="info-field-title">Writer</div>
                <div className="info-field-value">{writer}</div>
              </div>
            )}

            {boxOffice && (
              <div className="info-field-card">
                <div className="info-field-title">Box Office Earnings</div>
                <div className="info-field-value" style={{ color: '#10b981', fontWeight: '700' }}>
                  {boxOffice}
                </div>
              </div>
            )}
          </div>

          {/* Awards Banner */}
          {awards && awards !== 'N/A' && (
            <div className="awards-banner">
              <span className="awards-icon">🏆</span>
              <div>
                <strong>Honors & Awards: </strong>
                {awards}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
