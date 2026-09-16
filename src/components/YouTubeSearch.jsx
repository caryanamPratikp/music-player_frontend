import React, { useState } from 'react';

const SUGGESTIONS = [
  { label: '🔥 Trending Hits', query: 'Trending Hindi Songs 2026' },
  { label: '💖 Romantic Melodies', query: 'Romantic Hindi Songs' },
  { label: '⚡ Bollywood Party', query: 'Bollywood Dance Party Songs' },
  { label: '🎧 Arijit Singh', query: 'Arijit Singh Best Songs' },
  { label: '🌟 Shreya Ghoshal', query: 'Shreya Ghoshal Hits' },
  { label: '🎸 Hindi Indie', query: 'Hindi Indie Pop Acoustic' },
  { label: '🌙 Midnight Lo-Fi', query: 'Bollywood Lofi Chill Mashup' },
  { label: '🥁 Punjabi Hits', query: 'Top Punjabi Songs' },
  { label: '✨ 90s Nostalgia', query: '90s Bollywood Golden Hits' },
];

export default function YouTubeSearch({ onSearch, loading, activeQuery }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (itemQuery) => {
    setQuery(itemQuery);
    onSearch(itemQuery);
  };

  return (
    <div className="modern-search-console">
      <form className="modern-search-bar" onSubmit={handleSubmit}>
        <div className="search-field-wrapper">
          <svg className="search-lens-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            className="search-text-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hindi songs, artists, playlists, or lyrics... (Press Enter)"
            disabled={loading}
          />

          {query && !loading && (
            <button
              type="button"
              className="search-reset-btn"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="search-action-btn"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <span className="search-spinner" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Explore</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Filter Chips */}
      <div className="search-filter-pills-row">
        <span className="filter-pills-label">Moods & Genres:</span>
        <div className="filter-pills-scroll">
          {SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`filter-pill-btn ${activeQuery === item.query ? 'active-pill' : ''}`}
              onClick={() => handleChipClick(item.query)}
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
