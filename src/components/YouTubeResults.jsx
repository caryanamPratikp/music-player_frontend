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
      <div className="modern-results-wrapper">
        <div className="results-header-bar">
          <div className="results-title-group">
            <h3 className="results-title-heading">Curating your music...</h3>
            <p className="results-subtitle">Loading high fidelity streams from the cloud</p>
          </div>
        </div>
        <div className="modern-music-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="skeleton-music-card">
              <div className="skeleton-card-thumb" />
              <div className="skeleton-card-lines">
                <div className="skeleton-card-line title" />
                <div className="skeleton-card-line artist" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-state-box">
        <div className="state-icon-circle error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="state-heading">Playback Connection Error</h3>
        <p className="state-text">{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    if (!searchQuery) return null;
    return (
      <div className="modern-state-box">
        <div className="state-icon-circle empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="state-heading">No Tracks Found</h3>
        <p className="state-text">
          No songs matched "{searchQuery}". Try searching for another artist or popular Bollywood song.
        </p>
      </div>
    );
  }

  const isTrending = searchQuery.toLowerCase().includes('trending') || !searchQuery;

  return (
    <div className="modern-results-wrapper">
      <div className="results-header-bar">
        <div className="results-title-group">
          <h3 className="results-title-heading">
            {isTrending ? '🔥 Hot Trending Chartbusters' : `Search Results for "${searchQuery}"`}
          </h3>
          <p className="results-subtitle">
            {isTrending
              ? 'Handpicked top Indian tracks, viral hits & trending releases'
              : `Found ${results.length} available tracks ready to stream`}
          </p>
        </div>
        <span className="results-count-pill">{results.length} Tracks Available</span>
      </div>

      <div className="modern-music-grid">
        {results.map((song, index) => {
          const isSelected = currentSong && currentSong.video_id === song.video_id;
          const cleanTitle = decodeHtml(song.title);
          const cleanChannel = decodeHtml(song.channel_title);

          return (
            <div
              key={song.video_id || index}
              className={`modern-music-card ${isSelected ? 'card-active' : ''}`}
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
              {/* Card Thumbnail Artwork */}
              <div className="card-thumb-container">
                <img
                  src={song.thumbnail || 'https://via.placeholder.com/320x180?text=Musify'}
                  alt={cleanTitle}
                  className="card-thumb-image"
                  loading="lazy"
                />

                {/* Quality badge */}
                <span className="card-quality-badge">HD AUDIO</span>

                {/* Hover / Active Play Button Overlay */}
                <div className="card-hover-overlay">
                  <div className="hover-play-circle">
                    {isSelected && isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1.5" />
                        <rect x="14" y="4" width="4" height="16" rx="1.5" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                        <polygon points="6,4 20,12 6,20" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Dynamic Soundwave for currently playing track */}
                {isSelected && isPlaying && (
                  <div className="card-eq-pill">
                    <span className="eq-bar-mini e1" />
                    <span className="eq-bar-mini e2" />
                    <span className="eq-bar-mini e3" />
                    <span className="eq-bar-mini e4" />
                  </div>
                )}
              </div>

              {/* Card Metadata */}
              <div className="card-details-box">
                <h4 className="card-song-title" title={cleanTitle}>
                  {cleanTitle}
                </h4>
                
                <div className="card-artist-row">
                  <svg className="artist-note-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span className="card-song-artist" title={cleanChannel}>
                    {cleanChannel}
                  </span>
                </div>

                <div className="card-footer-action">
                  <span className={`card-play-tag ${isSelected && isPlaying ? 'playing' : ''}`}>
                    {isSelected && isPlaying ? 'PLAYING NOW' : 'STREAM TRACK'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
