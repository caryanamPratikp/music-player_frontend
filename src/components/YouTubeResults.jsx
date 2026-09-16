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
          <h3 className="results-title-heading">Fetching music...</h3>
        </div>
        <div className="modern-music-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        <h3 className="state-heading">Search Error</h3>
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
          No songs matched "{searchQuery}". Try searching for another artist or hit song.
        </p>
      </div>
    );
  }

  const isTrending = searchQuery === 'Trending Hindi Songs' || !searchQuery;

  return (
    <div className="modern-results-wrapper">
      <div className="results-header-bar">
        <div className="results-title-group">
          <h3 className="results-title-heading">
            {isTrending ? '🔥 Trending Hindi Songs' : `Results for "${searchQuery}"`}
          </h3>
          <p className="results-subtitle">
            {isTrending ? 'Top popular Indian tracks & chartbusters' : `${results.length} songs available to stream`}
          </p>
        </div>
        <span className="results-count-pill">{results.length} Tracks</span>
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

                {/* Hover / Active Play Button Overlay */}
                <div className="card-hover-overlay">
                  <div className="hover-play-circle">
                    {isSelected && isPlaying ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
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
                  </div>
                )}
              </div>

              {/* Card Metadata */}
              <div className="card-details-box">
                <h4 className="card-song-title" title={cleanTitle}>
                  {cleanTitle}
                </h4>
                <p className="card-song-artist" title={cleanChannel}>
                  {cleanChannel}
                </p>

                <div className="card-footer-action">
                  <span className={`card-play-tag ${isSelected && isPlaying ? 'playing' : ''}`}>
                    {isSelected && isPlaying ? 'PLAYING' : 'PLAY'}
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
