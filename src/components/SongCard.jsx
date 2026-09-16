import React, { useState } from 'react';
import { getFullMediaUrl } from '../services/api';

export default function SongCard({ song, isCurrent, isPlaying, onSelect, onTogglePlay }) {
  const [imgError, setImgError] = useState(false);

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCardClick = () => {
    if (isCurrent) {
      onTogglePlay();
    } else {
      onSelect(song);
    }
  };

  const coverSrc = (!imgError && song.cover_image_url)
    ? getFullMediaUrl(song.cover_image_url)
    : null;

  return (
    <div
      className={`song-card ${isCurrent ? 'is-active' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Cover Artwork Container */}
      <div className="card-cover-wrapper">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`${song.title} Cover`}
            className="card-cover-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            AAWAZ
          </div>
        )}

        {/* Hover / Active Play Button Overlay */}
        <div className="card-play-overlay">
          <button
            className="card-play-btn"
            aria-label={isCurrent && isPlaying ? 'Pause song' : 'Play song'}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            {isCurrent && isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>
        </div>

        {/* Dynamic Equalizer Wave if this card is playing */}
        {isCurrent && isPlaying && (
          <div className="equalizer-indicator">
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        )}
      </div>

      {/* Song Metadata */}
      <div className="card-details">
        <h3 className="card-title" title={song.title}>{song.title}</h3>
        <p className="card-artist" title={song.artist_name}>{song.artist_name}</p>

        <div className="card-meta-row">
          <div className="badge-group">
            {song.language && (
              <span className="badge language">{song.language}</span>
            )}
            {song.genre && (
              <span className="badge">{song.genre}</span>
            )}
          </div>
          {song.duration > 0 && (
            <span className="track-duration">{formatDuration(song.duration)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
