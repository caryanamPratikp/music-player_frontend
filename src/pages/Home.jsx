import React, { useEffect, useState, useRef } from 'react';
import { searchYouTube, checkBackendHealth } from '../services/api';
import YouTubeSearch from '../components/YouTubeSearch';
import YouTubeResults from '../components/YouTubeResults';
import YouTubePlayer from '../components/YouTubePlayer';
import SplashScreen from '../components/SplashScreen';

export default function Home() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Search & Player states
  const [searchResults, setSearchResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('Trending Hindi Songs');

  // Backend Health state
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Ref to smoothly scroll to player when a song is picked
  const playerSectionRef = useRef(null);

  // Initial load: check health and populate initial trending Hindi songs
  useEffect(() => {
    const initApp = async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
      handleSearch('Trending Hindi Songs', false); // false = do not auto-play on initial load
    };

    initApp();

    const healthInterval = setInterval(async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
    }, 15000);

    return () => clearInterval(healthInterval);
  }, []);

  // Search handler (triggered on Enter or suggestion click)
  const handleSearch = async (query, shouldAutoPlay = false) => {
    if (!query || !query.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchQuery(query.trim());

    try {
      const data = await searchYouTube(query.trim(), 12);
      const items = data.items || [];
      setSearchResults(items);

      if (shouldAutoPlay && items.length > 0) {
        setCurrentSong(items[0]);
        setCurrentIndex(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.message || 'Unable to search songs right now.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Song Selection: plays that particular song and scrolls up to player
  const handleSelectSong = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);

    // Smoothly scroll to player on mobile or desktop
    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  // Manual Reload / Refresh animation handler
  const handleReload = () => {
    setShowSplash(true);
    handleSearch('Trending Hindi Songs', false);
  };

  return (
    <div className="musify-app-root">
      {/* Animated Splash Screen for Page Load & Refresh */}
      {showSplash && (
        <SplashScreen
          duration={1500}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Top Header / Navigation Bar */}
      <header className="musify-header">
        <div className="header-inner">
          <div className="brand-logo" onClick={handleReload} role="button" tabIndex={0} title="Musify Home">
            <img src="/logo.png" alt="Musify Gramophone Logo" className="brand-logo-img" />
            <div className="brand-text-col">
              <span className="brand-title">Musify</span>
              <span className="brand-subtitle-by">by Pratik</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Reload / Refresh Button */}
            <button
              type="button"
              className="header-reload-btn"
              onClick={handleReload}
              title="Refresh & Reload Music"
              aria-label="Refresh and reload page"
            >
              <svg className="reload-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span className="reload-btn-text">Refresh</span>
            </button>

            {/* Live API Status */}
            <div className="header-status" title={isBackendOnline ? 'API Connected' : 'API Offline'}>
              <span className={`status-dot ${isBackendOnline ? '' : 'offline'}`} />
              <span className="status-label">{isBackendOnline ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="musify-main-container">
        {/* PLAYBACK SECTION: Shown when a song is selected / playing */}
        {currentSong && (
          <section ref={playerSectionRef} className="musify-player-section" aria-label="Now Playing Section">
            <YouTubePlayer
              currentSong={currentSong}
              currentIndex={currentIndex}
              totalResults={searchResults.length}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onNext={handleNext}
              onPrev={handlePrev}
              onClose={() => setCurrentSong(null)}
            />
          </section>
        )}

        {/* SEARCH BOX SECTION (Centered and prominent) */}
        <section className="musify-search-section">
          {!currentSong && (
            <div className="hero-search-intro">
              <h2 className="hero-search-heading">What do you want to play?</h2>
              <p className="hero-search-sub">Explore millions of Hindi songs, Bollywood hits, and regional tracks.</p>
            </div>
          )}

          <YouTubeSearch
            onSearch={(query) => handleSearch(query, true)}
            loading={searchLoading}
          />
        </section>

        {/* RESULTS & TRENDING HINDI SONGS SECTION (Below search box) */}
        <section className="musify-results-section">
          <YouTubeResults
            results={searchResults}
            loading={searchLoading}
            error={searchError}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSelectSong={handleSelectSong}
            searchQuery={searchQuery}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="musify-footer">
        <div className="footer-content">
          <span className="footer-brand">MUSIFY</span>
          <span className="footer-dot">•</span>
          <span>Powered by YouTube IFrame Player & FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
