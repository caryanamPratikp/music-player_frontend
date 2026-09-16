import React, { useEffect, useRef, useState } from 'react';
import { getFullMediaUrl } from '../services/api';

export default function MusicPlayer({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
}) {
  const audioRef = useRef(null);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // Format seconds to mm:ss
  const formatTime = (timeInSec) => {
    if (!timeInSec || isNaN(timeInSec)) return '0:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Sync currentSong changes to audio source
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    setErrorNotice(null);
    const audioUrl = getFullMediaUrl(currentSong.audio_url);

    // If changing source
    if (audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(currentSong.duration || 0);

      // Auto-play selected track
      audioRef.current
        .play()
        .then(() => onPlay())
        .catch((err) => {
          console.warn('Auto-playback prevented by browser policy or error:', err);
          onPause();
        });
    }
  }, [currentSong]);

  // 2. Sync isPlaying prop with HTML5 audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Playback error:', err);
          setErrorNotice('Unable to play audio stream');
          onPause();
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // 3. Audio Event Listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleEnded = () => {
    onNext();
  };

  const handleError = (e) => {
    console.error('Audio element error:', e);
    setIsBuffering(false);
    setErrorNotice('Audio playback failed. Please check network/file.');
    onPause();
  };

  if (!currentSong) {
    return null;
  }

  const thumbUrl = currentSong.cover_image_url
    ? getFullMediaUrl(currentSong.cover_image_url)
    : null;

  const effectiveDuration = duration || currentSong.duration || 0;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <footer className="fixed-player-bar" aria-label="Audio Player">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setErrorNotice(null);
        }}
        onPause={() => setIsBuffering(false)}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {/* Left: Track Information */}
      <div className="player-track-info">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={currentSong.title}
            className="player-thumb"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="player-thumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#94a3b8',
              fontWeight: 700,
            }}
          >
            AAWAZ
          </div>
        )}
        <div className="player-meta">
          <div className="player-title" title={currentSong.title}>
            {currentSong.title}
          </div>
          <div className="player-artist" title={currentSong.artist_name}>
            {currentSong.artist_name}
          </div>
          {errorNotice && (
            <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
              {errorNotice}
            </span>
          )}
        </div>
      </div>

      {/* Center: Controls & Scrub Timeline */}
      <div className="player-center-controls">
        <div className="transport-buttons">
          {/* Previous Button */}
          <button
            className="control-btn"
            onClick={onPrev}
            aria-label="Previous track"
            title="Previous Track"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4" />
              <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            className="control-btn play-pause-btn"
            onClick={() => (isPlaying ? onPause() : onPlay())}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16" />
              </svg>
            ) : isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            className="control-btn"
            onClick={onNext}
            aria-label="Next track"
            title="Next Track"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {/* Timeline Range Slider */}
        <div className="timeline-wrapper">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={effectiveDuration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="range-slider"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
            }}
            aria-label="Seek track position"
          />
          <span className="time-display">{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* Right: Volume Controls */}
      <div className="player-right-options">
        <div className="volume-control-wrapper">
          <button
            className="volume-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : volume < 0.5 ? (
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
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="range-slider volume-slider"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) 100%)`,
            }}
            aria-label="Volume slider"
          />
        </div>
      </div>
    </footer>
  );
}
