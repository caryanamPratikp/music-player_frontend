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

      // Construct new Player in the off-screen audio container
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '180',
          width: '240',
          videoId: currentSong.video_id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 0,
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
                onNext();
              }
            },
            onError: (event) => {
              console.error('Player error event:', event.data);
              let msg = 'Unable to stream this track.';
              if (event.data === 101 || event.data === 150) {
                msg = 'Playback restricted for this track.';
              } else if (event.data === 100) {
                msg = 'Track is unavailable.';
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
            // Player reloading
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
    return null;
  }

  const cleanTitle = decodeHtml(currentSong.title);
  const cleanChannel = decodeHtml(currentSong.channel_title);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="musify-audio-player-card" aria-label="Audio Music Player">
      {/* Hidden YouTube IFrame (Streams official audio silently off-screen) */}
      <div className="hidden-yt-audio-container" aria-hidden="true">
        <div ref={containerRef} id="player-embed-target" />
      </div>

      {/* Top Meta Bar: Track counter & close */}
      <div className="player-top-meta">
        <div className="player-status-badge">
          <span className={`status-dot ${isPlaying ? 'playing' : ''}`} />
          {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
        </div>

        {totalResults > 0 && (
          <span className="player-track-counter">
            Track {currentIndex + 1} of {totalResults}
          </span>
        )}

        {onClose && (
          <button
            type="button"
            className="player-close-btn"
            onClick={onClose}
            aria-label="Close player"
            title="Close player"
          >
            &times;
          </button>
        )}
      </div>

      {/* Error alert if any */}
      {playerError && (
        <div className="player-error-alert">
          <span>{playerError}</span>
          <button type="button" className="player-skip-btn" onClick={onNext}>
            Skip ▶
          </button>
        </div>
      )}

      {/* Main Music Player Content: Thumbnail + Info + Controls */}
      <div className="audio-player-body">
        {/* Left: Album Art / Thumbnail with Ambient Glow */}
        <div className="player-art-col">
          <div className={`player-thumb-frame ${isPlaying ? 'is-playing' : ''}`}>
            <img
              src={currentSong.thumbnail || 'https://via.placeholder.com/320x180?text=Musify'}
              alt={cleanTitle}
              className="player-thumb-image"
            />
            {isPlaying && (
              <div className="thumb-eq-overlay">
                <span className="mini-eq-bar b1" />
                <span className="mini-eq-bar b2" />
                <span className="mini-eq-bar b3" />
              </div>
            )}
          </div>
        </div>

        {/* Right / Center: Song Details, Scrub Timeline & Transport Controls */}
        <div className="player-interactive-col">
          <div className="player-song-headings">
            <h2 className="player-song-title" title={cleanTitle}>
              {cleanTitle}
            </h2>
            <p className="player-song-artist" title={cleanChannel}>
              {cleanChannel}
            </p>
          </div>

          {/* Scrub Timeline */}
          <div className="player-timeline-box">
            <div className="timeline-labels">
              <span className="time-cur">{formatTime(currentTime)}</span>
              <span className="time-dur">{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              onInput={handleSeek}
              className="range-slider timeline-slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
              }}
              aria-label="Seek track position"
            />
          </div>

          {/* Bottom Bar: Back, Play/Pause, Next & Sound Controller */}
          <div className="player-controls-cluster">
            {/* Transport Buttons: Back, Play/Pause, Next */}
            <div className="transport-buttons-group">
              {/* Back (Previous) Button */}
              <button
                type="button"
                className="transport-btn prev-btn"
                onClick={onPrev}
                aria-label="Previous track (Back)"
                title="Back (Previous Track)"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4" />
                  <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>

              {/* Central Play / Pause Button */}
              <button
                type="button"
                className={`transport-btn play-pause-master ${isPlaying ? 'playing' : ''}`}
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <polygon points="6,4 20,12 6,20" />
                  </svg>
                )}
              </button>

              {/* Next Button */}
              <button
                type="button"
                className="transport-btn next-btn"
                onClick={onNext}
                aria-label="Next track"
                title="Next Track"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>
            </div>

            {/* Sound Controller (Volume Slider) */}
            <div className="player-volume-cluster">
              <button
                type="button"
                className="volume-toggle-btn"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : volume < 50 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

              <div className="volume-slider-box">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onInput={handleVolumeChange}
                  className="range-slider volume-slider"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${isMuted ? 0 : volume}%, rgba(255,255,255,0.18) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.18) 100%)`,
                  }}
                  aria-label="Sound volume controller"
                />
              </div>

              <span className="volume-percent-tag">
                {isMuted ? 'Muted' : `${volume}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
