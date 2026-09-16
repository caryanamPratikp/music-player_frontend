import React from 'react';
import SongCard from './SongCard';

export default function SongList({
  songs,
  loading,
  error,
  currentSong,
  isPlaying,
  onSelectSong,
  onTogglePlay,
  onRetry,
}) {
  if (loading) {
    return (
      <div className="song-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-cover" />
            <div className="skeleton-text" />
            <div className="skeleton-text short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="state-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="state-title">Unable to Load Music</h3>
        <p className="state-description">
          {error}. Please verify that the backend API is running and accessible.
        </p>
        {onRetry && (
          <button className="action-btn" onClick={onRetry}>
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <h3 className="state-title">No Songs in Library</h3>
        <p className="state-description">
          The music catalog is currently empty. Run the backend seed script to populate demo tracks.
        </p>
        {onRetry && (
          <button className="action-btn" onClick={onRetry}>
            Refresh Library
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="song-grid">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          isCurrent={currentSong && currentSong.id === song.id}
          isPlaying={isPlaying}
          onSelect={onSelectSong}
          onTogglePlay={onTogglePlay}
        />
      ))}
    </div>
  );
}
