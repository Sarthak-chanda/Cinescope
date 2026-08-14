import React, { useState, useEffect, useRef } from 'react';
import {
  SPOTLIGHT_MOVIES,
  LATEST_RELEASES_ALL,
  POPULAR_HITS_ALL,
  TOP_SERIES_ALL,
  TOP_ANIME_ALL,
  SCIFI_EXPANDED_ALL,
  CRITIC_RECOMMENDED_ALL,
  GENRE_LIST
} from '../services/catalogData';

// Detect mobile viewport / touch or cached session for ultra-fast startup
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
};

const InitialCinemaLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(25);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 200);
  };

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();
    const isMobile = isMobileDevice();
    const isReturning = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cinescope_session_initialized') === 'true';
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('cinescope_session_initialized', 'true');
    }

    // Set responsive timing thresholds (mobile / returning visits load fast)
    const minLoadTimeMs = isMobile || isReturning ? 250 : 600;
    const maxLoadTimeMs = isMobile ? 2500 : 5000;

    // 1. Select lightweight set of URLs to preload (Top Hero Spotlights only on Mobile)
    const heroSpotlights = (SPOTLIGHT_MOVIES || []).slice(0, isMobile ? 2 : 4);
    const urlsToPreload = Array.from(
      new Set([
        ...heroSpotlights.map((m) => m.secondaryPoster || m.poster),
        ...heroSpotlights.map((m) => m.poster),
        ...(isMobile
          ? []
          : [
              ...(LATEST_RELEASES_ALL || []).slice(0, 4).map((m) => m.poster),
              ...(POPULAR_HITS_ALL || []).slice(0, 4).map((m) => m.poster),
              ...(TOP_SERIES_ALL || []).slice(0, 4).map((m) => m.poster),
              ...(TOP_ANIME_ALL || []).slice(0, 4).map((m) => m.poster)
            ])
      ])
    ).filter(Boolean);

    let loadedCount = 0;
    const totalAssets = urlsToPreload.length || 1;

    // Preload & decode into memory
    const imagePromises = urlsToPreload.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        const markLoaded = () => {
          loadedCount++;
          resolve();
        };
        if (img.complete) {
          markLoaded();
        } else {
          img.onload = markLoaded;
          img.onerror = markLoaded;
        }
      });
    });

    const allImagesPromise = Promise.all(imagePromises);

    // Dynamic progress ticker based on real asset decode + time
    const interval = setInterval(() => {
      if (!isMounted) return;
      const elapsed = Date.now() - startTime;
      const assetRatio = Math.min(1, loadedCount / totalAssets);

      let currentPct;
      if (elapsed < minLoadTimeMs) {
        currentPct = Math.min(90, Math.floor(30 + (elapsed / minLoadTimeMs) * 50 + assetRatio * 15));
      } else {
        const timeFactor = Math.min(1, (elapsed - minLoadTimeMs) / Math.max(1, maxLoadTimeMs - minLoadTimeMs));
        currentPct = Math.min(100, Math.floor(90 + Math.max(assetRatio * 10, timeFactor * 10)));
      }

      setProgress(currentPct);
    }, 30);

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, maxLoadTimeMs));
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, minLoadTimeMs));

    Promise.all([
      minDelayPromise,
      Promise.race([allImagesPromise, timeoutPromise])
    ]).then(() => {
      if (!isMounted) return;
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        if (!isMounted) return;
        setIsFadingOut(true);
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 250);
      }, 100);
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Run ONCE on mount!

  return (
    <div className={`initial-cinema-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="loader-ambient-glow" />

      <div className="loader-content-card">
        {/* Animated Cinema Film Reel Ring */}
        <div className="loader-reel-wrapper">
          <div className="loader-spinner-ring" />
          <div className="loader-film-icon">🎬</div>
        </div>

        <div className="loader-brand-title">
          <span>CINE</span><span className="brand-highlight">SCOPE</span>
        </div>
        <p className="loader-status-text">
          {progress < 40
            ? 'Initializing Cinema Engine...'
            : progress < 85
            ? 'Preloading 4K Posters & Backdrops...'
            : 'Ready for Showtime!'}
        </p>

        {/* High-Tech Progress Track */}
        <div className="loader-progress-track">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-meta-row">
          <span className="loader-meta-badge">FAST LOCAL MEMORY</span>
          <span className="loader-pct-badge">{progress}%</span>
          <button
            type="button"
            className="loader-skip-btn"
            onClick={handleSkip}
            title="Skip directly to app"
          >
            Skip ⚡
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialCinemaLoader;
