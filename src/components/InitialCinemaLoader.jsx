import React, { useState, useEffect, useRef } from 'react';
import { SPOTLIGHT_MOVIES } from './Sections';

const MIN_LOAD_TIME_MS = 2000; // Minimum 2s on hard page refresh
const MAX_LOAD_TIME_MS = 8000; // Maximum 8s timeout

const InitialCinemaLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(10);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    // 1. Gather critical hero backdrops, posters, and assets to preload
    const urlsToPreload = [
      ...SPOTLIGHT_MOVIES.map((m) => m.backdrop),
      ...SPOTLIGHT_MOVIES.map((m) => m.poster),
      'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
      'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
      'https://image.tmdb.org/t/p/w500/AnsZuLpE8Jj571wQpLz267rW1bN.jpg'
    ].filter(Boolean);

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
      if (elapsed < MIN_LOAD_TIME_MS) {
        currentPct = Math.min(90, Math.floor(15 + (elapsed / MIN_LOAD_TIME_MS) * 55 + assetRatio * 20));
      } else {
        const timeFactor = Math.min(1, (elapsed - MIN_LOAD_TIME_MS) / (MAX_LOAD_TIME_MS - MIN_LOAD_TIME_MS));
        currentPct = Math.min(100, Math.floor(90 + Math.max(assetRatio * 10, timeFactor * 10)));
      }

      setProgress(currentPct);
    }, 40);

    // Finish loader when assets are ready (guaranteed >= 2s and <= 8s)
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, MAX_LOAD_TIME_MS));
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, MIN_LOAD_TIME_MS));

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
        }, 350);
      }, 150);
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
          <span className="loader-meta-badge">IMAX 4K UHD</span>
          <span className="loader-pct-badge">{progress}%</span>
          <span className="loader-meta-badge">LIVE CDN</span>
        </div>
      </div>
    </div>
  );
};

export default InitialCinemaLoader;
