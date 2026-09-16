import React, { useEffect, useRef, useState } from 'react';

// Decode HTML entities from titles/artists
function decodeHtml(html) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export default function YouTubePlayer({
  currentSong,
  currentIndex,
  totalResults,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onClose,
}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  // Format seconds to mm:ss
  const formatTime = (timeInSec) => {
    if (!timeInSec || isNaN(timeInSec)) return '0:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Load IFrame API script dynamically once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }, []);

  // 2. Initialize or Update Player when currentSong changes
  useEffect(() => {
    if (!currentSong || !currentSong.video_id) {
      return;
    }

    setPlayerError(null);

    const initPlayer = () => {
      // If player already exists, load the new video
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(currentSong.video_id);
          playerRef.current.playVideo();
          return;
        } catch (err) {
          console.warn('Error loading video by ID into existing player:', err);
        }
      }

      // If container element exists, construct new Player
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: currentSong.video_id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              setPlayerReady(true);
              event.target.setVolume(volume);
              event.target.playVideo();
              onPlay();
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                onPlay();
                setPlayerError(null);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                onPause();
              } else if (event.data === window.YT.PlayerState.ENDED) {
                // Video finished: Automatically play the next search result if one exists
                onNext();
              }
            },
            onError: (event) => {
              console.error('Player error event:', event.data);
              let msg = 'Unable to play this video.';
              if (event.data === 101 || event.data === 150) {
                msg = 'Playback is restricted for this track.';
              } else if (event.data === 100) {
                msg = 'This track is private or unavailable.';
              } else if (event.data === 2) {
                msg = 'Invalid track parameter.';
              }
              setPlayerError(msg);
              onPause();
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSong?.video_id]);

  // 3. Track playback time while playing
  useEffect(() => {
    if (isPlaying && playerReady) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            setDuration(dur);
          } catch (e) {
            // Player may be reloading
          }
        }
      }, 500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playerReady]);

  // Player control handlers
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        onPause();
      } else {
        playerRef.current.playVideo();
        onPlay();
      }
    } catch (e) {
      console.warn('Playback toggle error:', e);
    }
  };

  const handleStop = () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.stopVideo();
      setCurrentTime(0);
      onPause();
    } catch (e) {
      console.warn('Stop error:', e);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  if (!currentSong) {
    return (
      <div className="player-panel empty">
        <div className="player-empty-box">
          <div className="player-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h4>No Song Playing</h4>
          <p>Pick any song from the list on the right to start streaming.</p>
        </div>
      </div>
    );
  }

  const cleanTitle = decodeHtml(currentSong.title);
  const cleanChannel = decodeHtml(currentSong.channel_title);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside className="player-panel" aria-label="Music Player">
      {/* Player Header */}
      <div className="player-panel-header">
        <div className="player-header-left">
          <div className="player-status-badge">
            <span className="status-dot" />
            NOW PLAYING
          </div>
          {totalResults > 0 && (
            <span className="player-track-counter">
              {currentIndex + 1} of {totalResults}
            </span>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            className="player-close-btn"
            onClick={onClose}
            aria-label="Close Player"
            title="Minimize / Close Player"
          >
            &times;
          </button>
        )}
      </div>

      {/* Video Screen Container */}
      <div className="player-screen-container">
        <div ref={containerRef} id="player-embed-target" />
      </div>

      {/* Error alert banner */}
      {playerError && (
        <div className="player-error-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="player-error-text">
            <span>{playerError}</span>
          </div>
          <button type="button" className="player-skip-btn" onClick={onNext}>
            Skip ▶
          </button>
        </div>
      )}

      {/* Song Metadata */}
      <div className="player-song-details">
        <h2 className="player-song-title" title={cleanTitle}>{cleanTitle}</h2>
        <p className="player-song-artist" title={cleanChannel}>{cleanChannel}</p>
      </div>

      {/* Scrub Timeline */}
      <div className="player-timeline-box">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.5"
          value={currentTime}
          onChange={handleSeek}
          className="range-slider"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
          }}
          aria-label="Seek position"
        />
        <div className="player-time-labels">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Buttons & Volume */}
      <div className="player-controls-row">
        <div className="player-transport-buttons">
          {/* Previous */}
          <button
            type="button"
            className="control-btn"
            onClick={onPrev}
            aria-label="Previous Track"
            title="Previous Track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4" />
              <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            className="control-btn play-pause-btn"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          {/* Stop */}
          <button
            type="button"
            className="control-btn"
            onClick={handleStop}
            aria-label="Stop"
            title="Stop Playback"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>

          {/* Next */}
          <button
            type="button"
            className="control-btn"
            onClick={onNext}
            aria-label="Next Track"
            title="Next Track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {/* Smooth Volume Slider */}
        <div className="player-volume-group">
          <button
            type="button"
            className="volume-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : volume < 50 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
          
          <div className="volume-slider-track-wrap">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onInput={handleVolumeChange}
              className="range-slider volume-slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${isMuted ? 0 : volume}%, rgba(255,255,255,0.15) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.15) 100%)`,
              }}
              aria-label="Volume slider"
            />
          </div>

          <span className="volume-percent">{isMuted ? 'Muted' : `${volume}%`}</span>
        </div>
      </div>
    </aside>
  );
}
