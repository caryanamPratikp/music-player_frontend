import React, { useEffect, useState } from 'react';
import { searchYouTube, checkBackendHealth } from '../services/api';
import YouTubeSearch from '../components/YouTubeSearch';
import YouTubeResults from '../components/YouTubeResults';
import YouTubePlayer from '../components/YouTubePlayer';

export default function Home() {
  // Search & Player states
  const [searchResults, setSearchResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Health state
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Initial load: check health and populate initial trending regional songs
  useEffect(() => {
    const initApp = async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
      handleSearch('Marathi songs');
    };

    initApp();

    const healthInterval = setInterval(async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
    }, 15000);

    return () => clearInterval(healthInterval);
  }, []);

  // Search handler (triggered ONLY on Enter or Search button click)
  const handleSearch = async (query) => {
    if (!query || !query.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchQuery(query);

    try {
      const data = await searchYouTube(query, 12);
      const items = data.items || [];
      setSearchResults(items);

      // If no song is currently playing, initialize first song
      if (items.length > 0 && !currentSong) {
        setCurrentSong(items[0]);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.message || 'Unable to search songs right now.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Song Selection from right-hand list
  const handleSelectSong = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  // Next Track (operates on current search result list)
  const handleNext = () => {
    if (!searchResults || searchResults.length === 0) return;
    const nextIdx = (currentIndex + 1) % searchResults.length;
    setCurrentIndex(nextIdx);
    setCurrentSong(searchResults[nextIdx]);
    setIsPlaying(true);
  };

  // Previous Track (operates on current search result list)
  const handlePrev = () => {
    if (!searchResults || searchResults.length === 0) return;
    const prevIdx = (currentIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentIndex(prevIdx);
    setCurrentSong(searchResults[prevIdx]);
    setIsPlaying(true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="brand-logo">
          <span className="brand-badge">AAWAZ</span>
          <span className="brand-title">Music</span>
          <span className="brand-subtitle">Indian Independent & Regional Music</span>
        </div>

        <div className="header-status" title={isBackendOnline ? 'API Connected' : 'API Offline'}>
          <span className={`status-dot ${isBackendOnline ? '' : 'offline'}`} />
          <span>{isBackendOnline ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      {/* Main Split Layout: Left (Player) | Right (Search Box + Song List) */}
      <main className="main-content">
        <div className="split-layout-wrapper">
          {/* Left Column: Music Player */}
          <section className="split-left-column">
            <YouTubePlayer
              currentSong={currentSong}
              currentIndex={currentIndex}
              totalResults={searchResults.length}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </section>

          {/* Right Column: Search Box on top + Song List below */}
          <section className="split-right-column">
            {/* Search Box on Top */}
            <div className="right-search-header">
              <h2 className="search-section-heading">Discover Music</h2>
              <YouTubeSearch
                onSearch={handleSearch}
                loading={searchLoading}
              />
            </div>

            {/* List of Songs Below Search */}
            <div className="right-songs-body">
              <YouTubeResults
                results={searchResults}
                loading={searchLoading}
                error={searchError}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onSelectSong={handleSelectSong}
                searchQuery={searchQuery}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
