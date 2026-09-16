import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete, duration = 1600 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit fade animation slightly before duration ends
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(500, duration - 350));

    // Complete callback
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`musify-splash-overlay ${isExiting ? 'splash-exit' : ''}`} aria-hidden="true">
      {/* Background ambient glowing orbs */}
      <div className="splash-ambient-glow" />
      <div className="splash-ambient-glow-secondary" />

      <div className="splash-content">
        {/* Pulsing Concentric Audio Rings */}
        <div className="splash-rings-container">
          <div className="splash-ring ring-1" />
          <div className="splash-ring ring-2" />
          <div className="splash-ring ring-3" />

          {/* Central Logo Emblem */}
          <div className="splash-emblem">
            <div className="splash-equalizer-bars">
              <span className="splash-bar bar-1" />
              <span className="splash-bar bar-2" />
              <span className="splash-bar bar-3" />
              <span className="splash-bar bar-4" />
              <span className="splash-bar bar-5" />
            </div>
          </div>
        </div>

        {/* Animated Brand Typography */}
        <div className="splash-brand-group">
          <h1 className="splash-brand-title">
            <span className="splash-letter">M</span>
            <span className="splash-letter">U</span>
            <span className="splash-letter">S</span>
            <span className="splash-letter">I</span>
            <span className="splash-letter">F</span>
            <span className="splash-letter">Y</span>
          </h1>
          <p className="splash-tagline">Feel the Beat • Discover Hindi & Regional Hits</p>
        </div>

        {/* Loading Progress Bar */}
        <div className="splash-progress-track">
          <div className="splash-progress-fill" style={{ animationDuration: `${duration}ms` }} />
        </div>

        <span className="splash-loading-text">Tuning your music universe...</span>
      </div>
    </div>
  );
}
