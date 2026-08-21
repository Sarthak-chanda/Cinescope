import React, { useState, useEffect, useRef, useTransition } from 'react';
import { playSound } from '../services/soundEffects';
import { resolveMovieStreamSources } from '../services/streamResolver';

export const CinemaStreamModal = ({ isOpen, onClose, movie }) => {
  const [streamData, setStreamData] = useState({ sources: [], defaultSource: null });
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPending, startTransition] = useTransition();

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !movie) return;

    let isMounted = true;
    setLoading(true);
    setStreamData({ sources: [], defaultSource: null });
    setActiveSourceIndex(0);

    resolveMovieStreamSources(movie).then((res) => {
      if (isMounted) {
        setStreamData(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, movie]);

  const activeSource = streamData.sources[activeSourceIndex] || streamData.defaultSource;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !videoRef.current?.paused) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyF' || e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM' || e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isMuted, isFullscreen]);

  if (!isOpen || !movie) return null;

  const togglePlayPause = () => {
    playSound('click');
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const toggleMute = () => {
    playSound('click');
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const seekRelative = (seconds) => {
    playSound('whoosh');
    if (videoRef.current) {
      const targetTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSpeedChange = (speed) => {
    playSound('click');
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    playSound('click');
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec < 0) return '00:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`cinema-stream-modal-backdrop ${isTheaterMode ? 'theater-mode' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Streaming Theater - ${movie.name || movie.title}`}
    >
      <div
        ref={playerContainerRef}
        className={`cinema-stream-modal-console ${isFullscreen ? 'is-fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Header Bar */}
        <div className={`stream-modal-header ${showControls ? 'visible' : 'hidden'}`}>
          <div className="stream-movie-title-info">
            <span className="live-stream-glowing-pill">LIVE CINEMA STREAM</span>
            <h3 className="stream-movie-name">{movie.name || movie.title}</h3>
            <span className="stream-quality-tag">{activeSource?.quality || '1080p HD'}</span>
          </div>

          <div className="stream-header-actions">
            <button
              type="button"
              className={`stream-header-btn ${isTheaterMode ? 'active' : ''}`}
              onClick={() => {
                playSound('click');
                setIsTheaterMode(!isTheaterMode);
              }}
              title="Toggle Theater Mode"
            >
              🎭 Theater Mode
            </button>

            <button
              type="button"
              className="stream-close-modal-btn"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              title="Close Player (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Video Stage */}
        <div className="stream-player-stage">
          {loading ? (
            <div className="stream-player-loader">
              <div className="loader-cinema-spinner" />
              <p>Resolving High-Definition Cinema Stream...</p>
            </div>
          ) : activeSource ? (
            activeSource.isDirect ? (
              <div className="html5-video-wrapper">
                <video
                  ref={videoRef}
                  src={activeSource.url}
                  className="custom-html5-video-element"
                  autoPlay
                  onClick={togglePlayPause}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div className="video-paused-center-overlay" onClick={togglePlayPause}>
                    <div className="paused-play-icon">▶</div>
                  </div>
                )}
              </div>
            ) : activeSource.isEmbed ? (
              <div className="iframe-video-wrapper">
                <iframe
                  src={activeSource.url}
                  title={activeSource.name}
                  className="custom-iframe-video-element"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="external-platform-stream-card">
                <img src={activeSource.logo} alt={activeSource.name} className="platform-logo-img" />
                <h3>{activeSource.name}</h3>
                <p>Click below to stream directly on official platform with full HD support.</p>
                <a
                  href={activeSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-stream-launch-btn"
                  onClick={() => playSound('click')}
                >
                  ▶ Open External Cinema Stream
                </a>
              </div>
            )
          ) : (
            <div className="modal-stream-banner-stage" style={{ backgroundImage: `url(${movie?.backdrop || movie?.secondaryPoster || movie?.poster})` }}>
              <div className="modal-stream-banner-overlay" />
              <div className="modal-stream-banner-content">
                {movie?.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.name || 'Poster'}
                    className="modal-banner-poster-thumb"
                  />
                )}
                <h3 className="modal-banner-title">{movie?.name || 'Cinema Title'}</h3>
                <p className="modal-banner-sub">Watch trailers, clips, and free streams for this title</p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie?.name || ''} full movie trailer`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-stream-launch-btn"
                  onClick={() => playSound('click')}
                >
                  ▶ Launch Cinema Stream Search
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Custom Controls */}
        {activeSource?.isDirect && (
          <div className={`custom-youtube-controls-bar ${showControls ? 'visible' : 'hidden'}`}>
            <div className="stream-seekbar-track-container">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="stream-seekbar-input"
              />
              <div
                className="stream-seekbar-progress-fill"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>

            <div className="stream-controls-row">
              <div className="controls-left-group">
                <button
                  type="button"
                  className="yt-control-btn play-btn"
                  onClick={togglePlayPause}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>

                <button
                  type="button"
                  className="yt-control-btn volume-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="stream-volume-slider"
                  title="Volume"
                />

                <span className="stream-time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right-group">
                <div className="yt-speed-selector">
                  <span className="speed-label">Speed:</span>
                  {[0.5, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      className={`speed-option-btn ${playbackSpeed === spd ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(spd)}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="yt-control-btn fullscreen-btn"
                  onClick={toggleFullscreen}
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? '⤓' : '⤢'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Source Switcher */}
        {streamData.sources.length > 1 && (
          <div className="stream-sources-footer">
            <span className="sources-footer-label">Switch Stream Source:</span>
            <div className="sources-pills-row">
              {streamData.sources.map((src, idx) => (
                <button
                  key={src.id}
                  type="button"
                  className={`source-pill-btn ${idx === activeSourceIndex ? 'active' : ''}`}
                  onClick={() => {
                    playSound('click');
                    startTransition(() => {
                      setActiveSourceIndex(idx);
                      setIsPlaying(true);
                    });
                  }}
                >
                  {src.name} <span className="source-badge">{src.badge}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaStreamModal;
