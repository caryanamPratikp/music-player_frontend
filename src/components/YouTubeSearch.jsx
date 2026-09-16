import React, { useState } from 'react';

const SUGGESTIONS = [
  'Trending Hindi Songs',
  'Arijit Singh',
  'Bollywood Top Hits',
  'Shreya Ghoshal',
  'Romantic Hindi',
  'Ajay Atul',
  'Hindi Indie',
  'Party Mix',
];

export default function YouTubeSearch({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hindi songs, artists, albums, or lyrics... (Press Enter)"
            disabled={loading}
          />

          {query && !loading && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="search-submit-btn"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <span className="search-spinner" />
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Suggested Quick Search Chips */}
      <div className="search-chips-wrapper">
        <span className="search-chips-label">Popular:</span>
        <div className="search-chips-list">
          {SUGGESTIONS.map((sugg) => (
            <button
              key={sugg}
              type="button"
              className="search-chip-btn"
              onClick={() => handleChipClick(sugg)}
              disabled={loading}
            >
              {sugg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
