import React, { useState, useEffect } from 'react';

const Loading = ({ message = 'Discovering cinema & streaming data...' }) => {
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState(message);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Smooth progress curve: fast to 80%, then gently approaches 98% until task completes
      let pct;
      if (elapsed < 2000) {
        pct = Math.min(85, Math.floor(15 + (elapsed / 2000) * 70));
      } else {
        const extra = Math.min(13, Math.floor(((elapsed - 2000) / 8000) * 13));
        pct = Math.min(98, 85 + extra);
      }
      setProgress(pct);

      if (pct < 45) {
        setStatusMessage(message);
      } else if (pct < 85) {
        setStatusMessage('Preloading high-definition posters & backdrops...');
      } else {
        setStatusMessage('Finalizing cinema showcase...');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="cinema-page-loader-container animate-fade-in" aria-live="polite" aria-busy="true">
      {/* 1. Ambient Cinematic Pulse Core */}
      <div className="page-loader-core">
        <div className="loader-core-spinner">
          <div className="loader-spin-ring ring-outer" />
          <div className="loader-spin-ring ring-inner" />
          <span className="loader-core-icon">🎬</span>
        </div>
        <div className="loader-core-info">
          <div className="loader-core-header-row">
            <h3 className="loader-core-title">
              <span>CINE</span><span className="loader-core-accent">SCOPE</span>
            </h3>
            <span className="loader-core-badge">{progress}%</span>
          </div>
          <p className="loader-core-subtitle">{statusMessage}</p>

          {/* Dynamic Progress Track */}
          <div className="loader-core-progress-track">
            <div
              className="loader-core-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Theme-Adaptive Skeleton Blueprint */}
      <div className="cinema-skeleton-stage">
        {/* Panoramic Banner Skeleton */}
        <div className="skeleton-hero-banner">
          <div className="skeleton-element skeleton-hero-poster" />
          <div className="skeleton-hero-details">
            <div className="skeleton-element skeleton-title-bar" />
            <div className="skeleton-element skeleton-tagline-bar" />
            <div className="skeleton-pills-row">
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
            </div>
            <div className="skeleton-element skeleton-plot-block" />
            <div className="skeleton-actions-row">
              <div className="skeleton-element skeleton-btn-lg" />
              <div className="skeleton-element skeleton-btn-md" />
            </div>
          </div>
        </div>

        {/* Cards Row Skeleton */}
        <div className="skeleton-cards-section">
          <div className="skeleton-element skeleton-section-heading" />
          <div className="skeleton-cards-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="skeleton-card-item">
                <div className="skeleton-element skeleton-card-poster" />
                <div className="skeleton-element skeleton-card-title" />
                <div className="skeleton-element skeleton-card-meta" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
