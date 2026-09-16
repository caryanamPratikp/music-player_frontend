import React from 'react';

// Helper to decode HTML entities returned in song titles
function decodeHtml(html) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export default function YouTubeResults({
  results,
  loading,
  error,
  currentSong,
  isPlaying,
  onSelectSong,
  searchQuery,
}) {
  if (loading) {
    return (
      <div className="results-container">
        <h3 className="section-title">Searching songs...</h3>
        <div className="results-list">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-song-item">
              <div className="skeleton-song-thumb" />
              <div className="skeleton-song-info">
                <div className="skeleton-line title" />
                <div className="skeleton-line channel" />
              </div>
            </div>
          ))}
        </div>
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
        <h3 className="state-title">Search Failed</h3>
        <p className="state-description">{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    if (!searchQuery) {
      return null;
    }
    return (
      <div className="state-container">
        <div className="state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="state-title">No Songs Found</h3>
        <p className="state-description">
          We couldn't find any songs matching "{searchQuery}". Try searching for another artist or genre.
        </p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="section-header">
        <h3 className="section-title">
          {searchQuery === 'Trending Hindi Songs' || !searchQuery
            ? '🔥 Trending Hindi Songs'
            : `Songs for "${searchQuery}"`}
        </h3>
        <span className="song-count">{results.length} Tracks</span>
      </div>

      <div className="results-list">
        {results.map((song, index) => {
          const isSelected = currentSong && currentSong.video_id === song.video_id;
          const cleanTitle = decodeHtml(song.title);
          const cleanChannel = decodeHtml(song.channel_title);

          return (
            <div
              key={song.video_id || index}
              className={`song-list-item ${isSelected ? 'is-active' : ''}`}
              onClick={() => onSelectSong(song, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSong(song, index);
                }
              }}
            >
              {/* Item Index / Playing Indicator */}
              <div className="song-item-leading">
                {isSelected && isPlaying ? (
                  <div className="equalizer-indicator inline">
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                  </div>
                ) : (
                  <span className="song-item-number">{index + 1}</span>
                )}
              </div>

              {/* Thumbnail */}
              <div className="song-item-thumb-wrapper">
                <img
                  src={song.thumbnail || 'https://via.placeholder.com/120x90?text=Aawaz'}
                  alt={cleanTitle}
                  className="song-item-thumb"
                  loading="lazy"
                />
                <div className="song-item-hover-play">
                  {isSelected && isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6,4 20,12 6,20" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Title & Artist */}
              <div className="song-item-info">
                <h4 className="song-item-title" title={cleanTitle}>
                  {cleanTitle}
                </h4>
                <p className="song-item-artist" title={cleanChannel}>
                  {cleanChannel}
                </p>
              </div>

              {/* Action Button */}
              <div className="song-item-action">
                <button
                  type="button"
                  className={`song-play-btn ${isSelected ? 'active' : ''}`}
                  aria-label={isSelected && isPlaying ? 'Pause song' : 'Play song'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSong(song, index);
                  }}
                >
                  {isSelected && isPlaying ? (
                    <span className="play-badge playing">PLAYING</span>
                  ) : (
                    <span className="play-badge">PLAY</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
