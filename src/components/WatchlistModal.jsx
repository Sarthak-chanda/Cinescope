import React from 'react';

const WatchlistModal = ({
  isOpen,
  onClose,
  watchlist = [],
  onSelectMovie,
  onRemoveFromWatchlist
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">
            <span>★</span> My Watchlist ({watchlist.length})
          </h3>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close Watchlist"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {watchlist.length === 0 ? (
            <div className="empty-watchlist">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍿</div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your watchlist is empty</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Search for your favorite movies and click "Add to Watchlist" to save them here.
              </p>
            </div>
          ) : (
            watchlist.map((movie) => (
              <div
                key={movie.id || movie.imdbID}
                className="watchlist-item"
                onClick={() => {
                  onSelectMovie(movie);
                  onClose();
                }}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.name}
                    className="watchlist-item-poster"
                  />
                ) : (
                  <div
                    className="watchlist-item-poster"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}
                  >
                    🎬
                  </div>
                )}

                <div className="watchlist-item-details">
                  <h4 className="watchlist-item-title">{movie.name}</h4>
                  <div className="watchlist-item-meta">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>{movie.type || 'movie'}</span>
                    {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#f59e0b', fontWeight: '700' }}>
                          ★ {movie.imdbRating}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  className="watchlist-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWatchlist(movie);
                  }}
                  title="Remove from watchlist"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistModal;
