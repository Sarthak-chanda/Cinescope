import React from 'react';

const Notfound = ({ searchTerm, errorMessage, onQuickSearch, onBackToHome }) => {
  const suggestions = [
    'Inception',
    'Interstellar',
    'The Dark Knight',
    'Oppenheimer',
    'Stranger Things'
  ];

  return (
    <div className="notfound-card animate-fade-in">
      <div className="notfound-icon">
        🔍
      </div>
      
      <h2 className="notfound-title">
        {errorMessage ? 'Search Notice' : 'No Results Found'}
      </h2>

      <p className="notfound-desc">
        {errorMessage || (
          <>
            We couldn't find any movies or TV series matching <strong>"{searchTerm}"</strong>. 
            Please check for typos or try searching with different keywords.
          </>
        )}
      </p>

      {onBackToHome && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="page-back-action-btn notfound-home-btn"
            onClick={onBackToHome}
          >
            <span className="btn-arrow">←</span>
            <span>Return to Home Page</span>
          </button>
        </div>
      )}

      <div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
          Try searching one of these popular titles:
        </div>
        <div className="notfound-suggestions">
          {suggestions.map((title) => (
            <button
              key={title}
              className="quick-chip"
              onClick={() => onQuickSearch(title)}
            >
              🎬 {title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notfound;