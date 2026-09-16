import React, { useEffect, useState, useRef } from 'react';
import { searchYouTube, checkBackendHealth } from '../services/api';
import YouTubeSearch from '../components/YouTubeSearch';
import YouTubeResults from '../components/YouTubeResults';
import YouTubePlayer from '../components/YouTubePlayer';
import SplashScreen from '../components/SplashScreen';

const CATEGORIES = [
  { id: 'trending', label: '🔥 Trending', query: 'Trending Hindi Songs 2026' },
  { id: 'romantic', label: '💖 Romantic Melodies', query: 'Romantic Hindi Love Songs' },
  { id: 'party', label: '⚡ Bollywood Party', query: 'Bollywood Dance Party Club Hits' },
  { id: 'arijit', label: '🎧 Arijit Singh', query: 'Arijit Singh Best Songs' },
  { id: 'indie', label: '🎸 Hindi Indie', query: 'Hindi Indie Pop Acoustic Songs' },
  { id: 'lofi', label: '🌙 Midnight Lo-Fi', query: 'Bollywood Lofi Chill Beats' },
  { id: 'punjabi', label: '🥁 Punjabi Hits', query: 'Top Punjabi Viral Hits' },
  { id: 'sufi', label: '🕊️ Sufi & Classical', query: 'Best Sufi Hindi Songs' },
];

export default function Home() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Active Category & Search states
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('Trending Hindi Songs 2026');

  // Backend Health state
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Ref to smoothly scroll to player when a song is picked
  const playerSectionRef = useRef(null);

  // Initial load: check health and populate initial trending Hindi songs
  useEffect(() => {
    const initApp = async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
      handleSearch('Trending Hindi Songs 2026', false);
    };

    initApp();

    const healthInterval = setInterval(async () => {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);
    }, 15000);

    return () => clearInterval(healthInterval);
  }, []);

  // Search handler
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
        if (playerSectionRef.current) {
          playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.message || 'Unable to stream songs right now. Please check your connection.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Category Tab Click
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    handleSearch(cat.query, false);
  };

  // Play Top Hit from Spotlight
  const handlePlayTopHit = () => {
    if (searchResults && searchResults.length > 0) {
      setCurrentSong(searchResults[0]);
      setCurrentIndex(0);
      setIsPlaying(true);
      if (playerSectionRef.current) {
        playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Surprise Me / Shuffle from results
  const handleSurpriseMe = () => {
    if (searchResults && searchResults.length > 0) {
      const randIdx = Math.floor(Math.random() * searchResults.length);
      setCurrentSong(searchResults[randIdx]);
      setCurrentIndex(randIdx);
      setIsPlaying(true);
      if (playerSectionRef.current) {
        playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Song Selection: plays that particular song and scrolls up to player
  const handleSelectSong = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);

    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Next Track
  const handleNext = () => {
    if (!searchResults || searchResults.length === 0) return;
    const nextIdx = (currentIndex + 1) % searchResults.length;
    setCurrentIndex(nextIdx);
    setCurrentSong(searchResults[nextIdx]);
    setIsPlaying(true);
  };

  // Previous Track
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
    handleSearch('Trending Hindi Songs 2026', false);
  };

  return (
    <div className="musify-app-root">
      {/* Animated Splash Screen for Page Load & Refresh */}
      {showSplash && (
        <SplashScreen
          duration={1400}
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

          {/* Center Category Navigation Quick Tabs */}
          <nav className="header-nav-tabs" aria-label="Music Categories">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`nav-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.label}
              </button>
            ))}
          </nav>

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
            <div className="header-status" title={isBackendOnline ? 'API Connected & Healthy' : 'API Offline'}>
              <span className={`status-dot ${isBackendOnline ? '' : 'offline'}`} />
              <span className="status-label">{isBackendOnline ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Category Bar */}
        <div className="mobile-categories-strip">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`mobile-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.label}
            </button>
          ))}
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

        {/* HERO SPOTLIGHT BANNER (When player is closed or at top) */}
        {!currentSong && (
          <section className="musify-hero-spotlight" aria-label="Spotlight Section">
            <div className="spotlight-glass-card">
              <div className="spotlight-badge">
                <span className="sparkle-icon">✨</span>
                <span>DAILY MUSIC SPOTLIGHT</span>
              </div>
              <h1 className="spotlight-title">Experience Sound Without Limits</h1>
              <p className="spotlight-description">
                Stream non-stop Hindi chartbusters, romantic ballads, and viral tracks.
                Featuring uninterrupted background playback and phone lock-screen controls.
              </p>
              <div className="spotlight-actions-row">
                <button
                  type="button"
                  className="spotlight-btn primary"
                  onClick={handlePlayTopHit}
                  disabled={searchLoading || searchResults.length === 0}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  <span>Play Featured Hit</span>
                </button>

                <button
                  type="button"
                  className="spotlight-btn secondary"
                  onClick={handleSurpriseMe}
                  disabled={searchLoading || searchResults.length === 0}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  <span>Surprise Shuffle</span>
                </button>
              </div>

              {/* Feature Perks Ribbon */}
              <div className="spotlight-perks-ribbon">
                <div className="perk-item">
                  <span className="perk-check">✓</span>
                  <span>Background Playback Ready</span>
                </div>
                <div className="perk-item">
                  <span className="perk-check">✓</span>
                  <span>Lock Screen Controls</span>
                </div>
                <div className="perk-item">
                  <span className="perk-check">✓</span>
                  <span>Device Media Rocker Synced</span>
                </div>
                <div className="perk-item">
                  <span className="perk-check">✓</span>
                  <span>High Fidelity HD Audio</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEARCH BOX SECTION */}
        <section className="musify-search-section">
          <YouTubeSearch
            onSearch={(query) => handleSearch(query, true)}
            loading={searchLoading}
            activeQuery={searchQuery}
          />
        </section>

        {/* RESULTS & TRENDING HINDI SONGS SECTION */}
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

      {/* STICKY BOTTOM MINI DOCKED CONTROLLER (When song is active and user scrolls) */}
      {currentSong && (
        <aside className="musify-docked-player" aria-label="Docked Floating Player">
          <div className="docked-inner">
            <div className="docked-left">
              <img
                src={currentSong.thumbnail || '/logo.png'}
                alt={currentSong.title}
                className="docked-thumb"
              />
              <div className="docked-text">
                <span className="docked-title">{currentSong.title}</span>
                <span className="docked-artist">{currentSong.channel_title}</span>
              </div>
            </div>

            <div className="docked-center">
              <button
                type="button"
                className="docked-btn"
                onClick={handlePrev}
                title="Previous Track"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4" />
                  <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>

              <button
                type="button"
                className={`docked-btn master ${isPlaying ? 'playing' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <polygon points="6,4 20,12 6,20" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className="docked-btn"
                onClick={handleNext}
                title="Next Track"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>
            </div>

            <div className="docked-right">
              <span className="docked-bg-tag">
                📱 Lock Screen Active
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Modern Footer */}
      <footer className="musify-footer">
        <div className="footer-content">
          <div className="footer-brand-col">
            <span className="footer-brand">MUSIFY</span>
            <span className="footer-dot">•</span>
            <span>Developed by Pratik SP</span>
          </div>
          <div className="footer-badges">
            <span className="footer-pill">⚡ MediaSession 2.0</span>
            <span className="footer-pill">🔒 Background Audio Protected</span>
            <span className="footer-pill">🔊 Master Media Synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
