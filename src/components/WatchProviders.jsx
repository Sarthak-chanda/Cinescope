import React, { useState, useEffect, useMemo } from 'react';
import { fetchWatchProviders } from '../services/movieApi';

// Top streaming regions with flags and labels
const POPULAR_COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' }
];

const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

const getCountryFlag = (code) => {
  if (!code || code.length !== 2) return '🌐';
  try {
    const offset = 127397;
    return String.fromCodePoint(...code.toUpperCase().split('').map((c) => c.charCodeAt(0) + offset));
  } catch {
    return '🌐';
  }
};

const getCountryName = (code) => {
  try {
    return regionNames?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};

// Curated brand aesthetics and fallback styling
const BRAND_THEMES = {
  netflix: { color: '#E50914', icon: '🔴', quality: '4K Ultra HD • Dolby Atmos', plan: 'Subscription required' },
  'prime video': { color: '#00A8E1', icon: '📦', quality: '4K UHD • HDR10+', plan: 'Included with Prime' },
  'amazon video': { color: '#00A8E1', icon: '📦', quality: '4K UHD • HDR10+', plan: 'Rent or Buy' },
  'amazon prime video': { color: '#00A8E1', icon: '📦', quality: '4K UHD • HDR10+', plan: 'Included with Prime' },
  'apple tv': { color: '#A2AAAD', icon: '🍎', quality: '4K Dolby Vision • Atmos', plan: 'Rent or Buy' },
  'apple tv plus': { color: '#A2AAAD', icon: '🍎', quality: '4K Dolby Vision • Atmos', plan: 'Apple TV+ Subscription' },
  'apple tv store': { color: '#A2AAAD', icon: '🍎', quality: '4K Dolby Vision • Atmos', plan: 'Rent or Buy' },
  'disney plus': { color: '#113CCF', icon: '✨', quality: 'IMAX Enhanced • 4K', plan: 'Included with Disney+' },
  disney: { color: '#113CCF', icon: '✨', quality: 'IMAX Enhanced • 4K', plan: 'Included with Disney+' },
  hotstar: { color: '#0C2044', icon: '⭐', quality: '4K UHD • Dolby 5.1', plan: 'JioHotstar / Hotstar' },
  max: { color: '#5822B4', icon: '🟣', quality: '4K Ultra HD • Dolby Atmos', plan: 'Included with Max' },
  'hbo max': { color: '#5822B4', icon: '🟣', quality: '4K Ultra HD • Dolby Atmos', plan: 'Included with Max' },
  jiocinema: { color: '#E5007D', icon: '🎬', quality: 'Full HD • 4K', plan: 'JioCinema Premium' },
  zee5: { color: '#8230C6', icon: '📺', quality: '1080p Full HD', plan: 'ZEE5 Premium' },
  sonyliv: { color: '#1D252C', icon: '🍿', quality: '1080p Full HD • 5.1', plan: 'SonyLIV Premium' },
  hulu: { color: '#1CE783', icon: '🟢', quality: '4K UHD • 5.1 Surround', plan: 'Stream with Hulu' },
  peacock: { color: '#000000', icon: '🦚', quality: '4K HDR • Dolby 5.1', plan: 'Peacock Premium' },
  'paramount plus': { color: '#0064FF', icon: '⛰️', quality: '4K UHD • Dolby Vision', plan: 'Paramount+ Subscription' },
  youtube: { color: '#FF0000', icon: '▶️', quality: 'HD • 4K Digital', plan: 'Rent or Buy on YouTube' },
  'youtube tv': { color: '#FF0000', icon: '▶️', quality: 'Live HD Broadcast', plan: 'YouTube TV Subscription' },
  'google play': { color: '#01875F', icon: '▶️', quality: 'HD • 4K Digital', plan: 'Rent or Buy on Google Play' },
  crunchyroll: { color: '#F47521', icon: '🍥', quality: '1080p HD • Simulcast', plan: 'Crunchyroll Premium' },
  tubi: { color: '#FA3241', icon: '🆓', quality: 'HD 1080p', plan: '100% Free with Ads' },
  'pluto tv': { color: '#FFE600', icon: '🆓', quality: 'Live HD Channels', plan: '100% Free Live TV' }
};

const getBrandMeta = (name) => {
  const clean = (name || '').toLowerCase().trim();
  for (const [key, meta] of Object.entries(BRAND_THEMES)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return meta;
    }
  }
  return {
    color: '#6366f1',
    icon: '🎬',
    quality: 'HD • 4K Streaming',
    plan: 'Available on platform'
  };
};

// Generates direct deep links to search/watch the movie on that specific service
const getProviderDeepLink = (providerName, movieTitle) => {
  const clean = (providerName || '').toLowerCase().trim();
  const q = encodeURIComponent(movieTitle || '');

  if (clean.includes('netflix')) return `https://www.netflix.com/search?q=${q}`;
  if (clean.includes('prime') || clean.includes('amazon')) return `https://www.amazon.com/s?k=${q}&i=instant-video`;
  if (clean.includes('apple')) return `https://tv.apple.com/search?term=${q}`;
  if (clean.includes('disney')) return `https://www.disneyplus.com/search?q=${q}`;
  if (clean.includes('hotstar')) return `https://www.hotstar.com/in/explore?search_query=${q}`;
  if (clean.includes('max') || clean.includes('hbo')) return `https://www.max.com/search?q=${q}`;
  if (clean.includes('jio')) return `https://www.jiocinema.com/search/${q}`;
  if (clean.includes('zee5')) return `https://www.zee5.com/search?q=${q}`;
  if (clean.includes('sonyliv')) return `https://www.sonyliv.com/search/${q}`;
  if (clean.includes('hulu')) return `https://www.hulu.com/search?q=${q}`;
  if (clean.includes('peacock')) return `https://www.peacocktv.com/search?q=${q}`;
  if (clean.includes('paramount')) return `https://www.paramountplus.com/search/?q=${q}`;
  if (clean.includes('youtube')) return `https://www.youtube.com/results?search_query=${q}+movie+rent`;
  if (clean.includes('google')) return `https://play.google.com/store/search?q=${q}&c=movies`;
  if (clean.includes('tubi')) return `https://tubitv.com/search/${q}`;
  if (clean.includes('crunchyroll')) return `https://www.crunchyroll.com/search?q=${q}`;

  return `https://www.google.com/search?q=${encodeURIComponent(`watch ${movieTitle} on ${providerName}`)}`;
};

// Automatically detects user's country from browser timezone
const detectDefaultCountry = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Kolkata|Calcutta|India|Asia\/Kolkata/i.test(tz)) return 'IN';
    if (/London|Europe\/London/i.test(tz)) return 'GB';
    if (/Toronto|Vancouver|Canada/i.test(tz)) return 'CA';
    if (/Sydney|Melbourne|Australia/i.test(tz)) return 'AU';
    if (/America|New_York|Los_Angeles|Chicago|US/i.test(tz)) return 'US';
  } catch {
    // fallback
  }
  return 'IN';
};

const WatchProviders = ({ movieTitle, movie, onWatchTrailer }) => {
  const [loading, setLoading] = useState(true);
  const [providersData, setProvidersData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(detectDefaultCountry);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'subscription', 'free', 'rent'

  const displayTitle = movieTitle || movie?.Title || movie?.name || movie?.title || 'this title';

  // Fetch live watch provider data via TMDB JustWatch integration
  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    setLoading(true);
    fetchWatchProviders({
      imdbID: movie?.imdbID || movie?.id,
      title: displayTitle,
      type: movie?.type || 'movie',
      signal: controller.signal
    })
      .then((results) => {
        if (!isSubscribed) return;
        setProvidersData(results || {});
        // If selected country has no data but other countries do, pick the first available or default to IN/US
        if (results && Object.keys(results).length > 0 && !results[selectedCountry]) {
          const userPref = detectDefaultCountry();
          if (results[userPref]) {
            setSelectedCountry(userPref);
          } else if (results.US) {
            setSelectedCountry('US');
          } else if (results.IN) {
            setSelectedCountry('IN');
          } else {
            setSelectedCountry(Object.keys(results)[0]);
          }
        }
      })
      .catch(() => {
        if (!isSubscribed) return;
        setProvidersData({});
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [movie?.imdbID, movie?.id, displayTitle]);

  // Available countries with active streaming data + standard popular countries
  const availableCountryList = useMemo(() => {
    const popularCodes = new Set(POPULAR_COUNTRIES.map((c) => c.code));
    const list = [...POPULAR_COUNTRIES];

    if (providersData) {
      Object.entries(providersData).forEach(([code, data]) => {
        if (!popularCodes.has(code)) {
          const hasAny = Boolean(
            data?.flatrate?.length || data?.free?.length || data?.ads?.length || data?.rent?.length || data?.buy?.length
          );
          if (hasAny) {
            list.push({
              code,
              name: getCountryName(code),
              flag: getCountryFlag(code)
            });
          }
        }
      });
    }
    return list;
  }, [providersData]);

  // Country-specific watch provider lists
  const currentCountryData = providersData?.[selectedCountry] || null;

  // Process and categorize items for the current country
  const categorizedProviders = useMemo(() => {
    if (!currentCountryData) return { all: [], subscription: [], free: [], rent: [] };

    const flatrate = (currentCountryData.flatrate || []).map((p) => ({
      ...p,
      category: 'subscription',
      typeBadge: 'Subscription',
      badgeClass: 'badge-subscription'
    }));

    const freeItems = [
      ...(currentCountryData.free || []).map((p) => ({
        ...p,
        category: 'free',
        typeBadge: 'Free Stream',
        badgeClass: 'badge-free'
      })),
      ...(currentCountryData.ads || []).map((p) => ({
        ...p,
        category: 'free',
        typeBadge: 'Free with Ads',
        badgeClass: 'badge-free'
      }))
    ];

    const rentMap = new Map();
    (currentCountryData.rent || []).forEach((p) => {
      rentMap.set(p.provider_id, {
        ...p,
        category: 'rent',
        typeBadge: 'Rent',
        badgeClass: 'badge-rent'
      });
    });

    (currentCountryData.buy || []).forEach((p) => {
      if (rentMap.has(p.provider_id)) {
        const existing = rentMap.get(p.provider_id);
        rentMap.set(p.provider_id, {
          ...existing,
          typeBadge: 'Rent / Buy',
          badgeClass: 'badge-rent-buy'
        });
      } else {
        rentMap.set(p.provider_id, {
          ...p,
          category: 'rent',
          typeBadge: 'Buy',
          badgeClass: 'badge-buy'
        });
      }
    });

    const rentItems = Array.from(rentMap.values());

    // Deduplicate for "All" view (prefer subscription > free > rent)
    const allMap = new Map();
    [...flatrate, ...freeItems, ...rentItems].forEach((item) => {
      if (!allMap.has(item.provider_id)) {
        allMap.set(item.provider_id, item);
      }
    });

    return {
      all: Array.from(allMap.values()),
      subscription: flatrate,
      free: freeItems,
      rent: rentItems
    };
  }, [currentCountryData]);

  const activeProviders = categorizedProviders[activeTab] || categorizedProviders.all;
  const currentCountryMeta = availableCountryList.find((c) => c.code === selectedCountry) || {
    name: selectedCountry,
    flag: '🌐'
  };

  return (
    <div className="watch-providers-card animate-fade-in" id="streaming-options">
      {/* Header */}
      <div className="providers-header">
        <div className="providers-title-group">
          <span className="providers-icon" aria-hidden="true">🎬</span>
          <div>
            <div className="providers-title-row">
              <h4 className="providers-title">Watch Now</h4>
            </div>
            <span className="providers-subtitle">
              Streaming, rental & purchase platforms in {currentCountryMeta.flag} {currentCountryMeta.name}
            </span>
          </div>
        </div>

        <div className="providers-header-actions">
          {onWatchTrailer && (
            <button
              className="play-trailer-pill-btn"
              onClick={onWatchTrailer}
              aria-label={`Watch trailer for ${displayTitle}`}
            >
              <span>▶ Watch Trailer</span>
            </button>
          )}
        </div>
      </div>

      {/* Region Selector Pills */}
      <div className="providers-country-bar" role="region" aria-label="Streaming Country Selector">
        <span className="country-bar-label">Region:</span>
        <div className="country-pills-scroll">
          {availableCountryList.map((country) => {
            const hasDataForCountry = Boolean(providersData?.[country.code]);
            const isSelected = selectedCountry === country.code;
            return (
              <button
                key={country.code}
                className={`country-pill-btn ${isSelected ? 'active' : ''} ${hasDataForCountry ? 'has-data' : ''}`}
                onClick={() => setSelectedCountry(country.code)}
                aria-pressed={isSelected}
              >
                <span className="country-flag">{country.flag}</span>
                <span className="country-name">{country.name}</span>
                {hasDataForCountry && <span className="country-data-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="providers-tabs" role="tablist" aria-label="Streaming categories">
        <button
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`provider-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Options ({categorizedProviders.all.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'subscription'}
          className={`provider-tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription ({categorizedProviders.subscription.length})
        </button>
        {categorizedProviders.free.length > 0 && (
          <button
            role="tab"
            aria-selected={activeTab === 'free'}
            className={`provider-tab-btn ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            Free to Watch ({categorizedProviders.free.length})
          </button>
        )}
        <button
          role="tab"
          aria-selected={activeTab === 'rent'}
          className={`provider-tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
          onClick={() => setActiveTab('rent')}
        >
          Rent or Buy ({categorizedProviders.rent.length})
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="providers-grid-skeleton" aria-label="Loading streaming sources">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="provider-skeleton-card" />
          ))}
        </div>
      ) : activeProviders.length > 0 ? (
        <div className="providers-grid">
          {activeProviders.map((provider) => {
            const meta = getBrandMeta(provider.provider_name);
            const watchUrl = getProviderDeepLink(provider.provider_name, displayTitle);
            const logoUrl = provider.logo_path
              ? `https://image.tmdb.org/t/p/w185${provider.logo_path}`
              : null;

            return (
              <a
                key={`${provider.provider_id}-${provider.category}`}
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="provider-item"
                style={{ '--provider-color': meta.color }}
                aria-label={`Watch ${displayTitle} on ${provider.provider_name}`}
              >
                <div className="provider-logo-box" style={{ borderColor: `${meta.color}40` }}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={provider.provider_name}
                      className="provider-logo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.provider-emoji-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="provider-emoji-fallback"
                    style={{ display: logoUrl ? 'none' : 'flex' }}
                  >
                    {meta.icon}
                  </span>
                </div>

                <div className="provider-info">
                  <div className="provider-name-row">
                    <span className="provider-name">{provider.provider_name}</span>
                    <span className={`provider-type-tag ${provider.badgeClass || ''}`}>
                      {provider.typeBadge}
                    </span>
                  </div>
                  <span className="provider-plan">{meta.plan}</span>
                  <span className="provider-quality">{meta.quality}</span>
                </div>

                <div className="provider-arrow">
                  <span>Watch ↗</span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="providers-empty-state">
          <div className="empty-state-icon">📡</div>
          <h5 className="empty-state-title">
            No active streaming sources listed in {currentCountryMeta.name}
          </h5>
          <p className="empty-state-desc">
            Streaming rights for <strong>{displayTitle}</strong> may not be licensed in this region right now,
            or are available exclusively via cinema release or digital storefronts.
          </p>
          <div className="empty-state-actions">
            {selectedCountry !== 'US' && providersData?.US && (
              <button
                className="empty-action-btn primary"
                onClick={() => setSelectedCountry('US')}
              >
                🇺🇸 Check United States Availability
              </button>
            )}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`where to watch ${displayTitle}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="empty-action-btn secondary"
            >
              Search Web for Streaming ↗
            </a>
          </div>
        </div>
      )}

      {/* Attribution footer */}
      <div className="providers-footer">
        <span className="providers-attribution">
          Streaming data provided by <strong>JustWatch</strong> via TMDB. Regional availability is subject to change.
        </span>
      </div>
    </div>
  );
};

export default WatchProviders;
