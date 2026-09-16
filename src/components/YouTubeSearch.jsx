import React, { useState } from 'react';

const SUGGESTIONS = [
  '🔥 Trending Hindi Songs',
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
    const cleanQuery = suggestion.replace(/^🔥\s*/, '');
    setQuery(cleanQuery);
    onSearch(cleanQuery);
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
            placeholder="Search Hindi songs, artists, albums, or lyrics... (Press Enter)"
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
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Filter Chips */}
      <div className="search-filter-pills-row">
        <span className="filter-pills-label">Trending:</span>
        <div className="filter-pills-scroll">
          {SUGGESTIONS.map((sugg) => (
            <button
              key={sugg}
              type="button"
              className="filter-pill-btn"
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
