import React, { useState } from 'react';

const PROVIDER_DATA = [
  {
    name: 'Netflix',
    icon: '🔴',
    color: '#E50914',
    type: 'Subscription',
    quality: '4K Ultra HD • Dolby Atmos',
    plan: 'Included with plan',
    url: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
  },
  {
    name: 'Prime Video',
    icon: '📦',
    color: '#00A8E1',
    type: 'Subscription / Rent',
    quality: '4K UHD • HDR10+',
    plan: 'Stream from $3.99 or Prime',
    url: (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`
  },
  {
    name: 'Apple TV+',
    icon: '🍎',
    color: '#A2AAAD',
    type: 'Buy / Rent',
    quality: '4K Dolby Vision • Atmos',
    plan: 'Rent $3.99 • Buy $14.99',
    url: (title) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`
  },
  {
    name: 'Disney+',
    icon: '✨',
    color: '#113CCF',
    type: 'Subscription',
    quality: 'IMAX Enhanced • 4K',
    plan: 'Included with Disney+ Bundle',
    url: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`
  },
  {
    name: 'Max (HBO)',
    icon: '🟣',
    color: '#5822B4',
    type: 'Subscription',
    quality: '4K Ultra HD • 5.1',
    plan: 'Included with Max',
    url: (title) => `https://www.max.com/search?q=${encodeURIComponent(title)}`
  },
  {
    name: 'YouTube Movies',
    icon: '▶️',
    color: '#FF0000',
    type: 'Buy / Rent',
    quality: 'HD • 4K',
    plan: 'Rent from $2.99',
    url: (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' movie buy rent')}`
  }
];

const WatchProviders = ({ movieTitle, onWatchTrailer }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'subscription', 'rent'

  const filteredProviders = PROVIDER_DATA.filter((p) => {
    if (activeTab === 'subscription') return p.type.includes('Subscription');
    if (activeTab === 'rent') return p.type.includes('Rent') || p.type.includes('Buy');
    return true;
  });

  return (
    <div className="watch-providers-card animate-fade-in">
      <div className="providers-header">
        <div className="providers-title-group">
          <span className="providers-icon">🍿</span>
          <div>
            <h4 className="providers-title">Where to Stream & Watch</h4>
            <span className="providers-subtitle">Available on streaming services in your region</span>
          </div>
        </div>

        {onWatchTrailer && (
          <button className="play-trailer-pill-btn" onClick={onWatchTrailer}>
            <span>▶ Watch Trailer</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="providers-tabs">
        <button
          className={`provider-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Providers ({PROVIDER_DATA.length})
        </button>
        <button
          className={`provider-tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Stream / Subscription
        </button>
        <button
          className={`provider-tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
          onClick={() => setActiveTab('rent')}
        >
          Rent or Buy
        </button>
      </div>

      {/* Providers Grid */}
      <div className="providers-grid">
        {filteredProviders.map((provider) => (
          <a
            key={provider.name}
            href={provider.url(movieTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="provider-item"
            style={{ '--provider-color': provider.color }}
          >
            <div className="provider-logo-box">
              <span className="provider-emoji">{provider.icon}</span>
            </div>

            <div className="provider-info">
              <div className="provider-name-row">
                <span className="provider-name">{provider.name}</span>
                <span className="provider-type-tag">{provider.type}</span>
              </div>
              <span className="provider-plan">{provider.plan}</span>
              <span className="provider-quality">{provider.quality}</span>
            </div>

            <div className="provider-arrow">
              <span>Watch ↗</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WatchProviders;
