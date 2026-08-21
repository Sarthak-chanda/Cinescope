/**
 * Multi-Source Live Video Stream Resolver Service
 * Resolves active video stream sources for movies and TV shows via:
 * 1. Internet Archive API (Direct .mp4 video streams for public domain & classic cinema)
 * 2. YouTube Video API Embed Resolver (Official video streams, full films, & HD trailers)
 * 3. TMDB Watch Providers API (Legal free & subscription platform watch links)
 */

const TMDB_API_KEY = '4f89241199a531b29dbd244a307b2251';

export const resolveMovieStreamSources = async (movie) => {
  if (!movie) return { sources: [], defaultSource: null };

  const movieTitle = movie.name || movie.title || '';
  const cleanTitle = movieTitle.split(':')[0].split('(')[0].trim();
  const sources = [];

  // 1. Internet Archive Stream Lookup (Direct .mp4 video stream)
  try {
    const archiveQuery = encodeURIComponent(`title:("${cleanTitle}") AND mediatype:(movies)`);
    const archiveRes = await fetch(
      `https://archive.org/advancedsearch.php?q=${archiveQuery}&fl[]=identifier,title,downloads&sort[]=downloads+desc&rows=3&page=1&output=json`,
      { signal: AbortSignal.timeout(2800) }
    );
    if (archiveRes.ok) {
      const archiveData = await archiveRes.json();
      const docs = archiveData?.response?.docs;
      if (Array.isArray(docs) && docs.length > 0) {
        const item = docs[0];
        if (item?.identifier) {
          const filesRes = await fetch(`https://archive.org/metadata/${item.identifier}/files`, {
            signal: AbortSignal.timeout(2000)
          });
          if (filesRes.ok) {
            const filesData = await filesRes.json();
            const mp4File = filesData?.result?.find(
              (f) => f.name && (f.name.endsWith('.mp4') || f.name.endsWith('.ogv')) && f.size > 10000000
            );
            if (mp4File?.name) {
              const directStreamUrl = `https://archive.org/download/${item.identifier}/${mp4File.name}`;
              sources.push({
                id: 'archive_direct',
                name: 'Direct Cinema Stream (Full Film)',
                type: 'mp4',
                url: directStreamUrl,
                quality: '1080p HD',
                badge: 'FREE STREAM',
                isDirect: true
              });
            }
          }
        }
      }
    }
  } catch {
    // Pass to YouTube fallback
  }

  // 2. YouTube Embed Video Stream Resolver (Trailer / Promo / Full Film)
  const ytVideoId = movie.trailerId || movie.ytId;
  if (ytVideoId) {
    sources.push({
      id: 'youtube_stream',
      name: `${movieTitle} - Official Video Stream`,
      type: 'youtube',
      url: `https://www.youtube.com/embed/${ytVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
      quality: '1080p 60fps',
      badge: 'HD VIDEO',
      isEmbed: true
    });
  } else {
    sources.push({
      id: 'youtube_search_embed',
      name: `${movieTitle} - Live Trailer & Cinema Stream`,
      type: 'youtube',
      url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cleanTitle + ' full movie trailer official')}&autoplay=1`,
      quality: '1080p HD',
      badge: 'HD VIDEO',
      isEmbed: true
    });
  }

  // 3. TMDB Legal Watch Providers (Tubi, Pluto TV, YouTube Free, Netflix, Prime Video)
  if (movie.imdbID || movie.tmdbId) {
    try {
      const tmdbId = movie.tmdbId || (movie.imdbID ? await findTmdbIdByImdb(movie.imdbID) : null);
      if (tmdbId) {
        const provRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`,
          { signal: AbortSignal.timeout(2500) }
        );
        if (provRes.ok) {
          const provData = await provRes.json();
          const usProviders = provData?.results?.US || provData?.results?.IN;
          if (usProviders) {
            const freePlats = usProviders.free || usProviders.ads || [];
            const streamPlats = usProviders.flatrate || [];

            freePlats.forEach((p) => {
              sources.push({
                id: `platform_free_${p.provider_id}`,
                name: `Stream Free on ${p.provider_name}`,
                type: 'external',
                url: usProviders.link || 'https://www.justwatch.com',
                quality: 'HD Stream',
                badge: 'LEGAL FREE',
                logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
              });
            });

            streamPlats.slice(0, 3).forEach((p) => {
              sources.push({
                id: `platform_sub_${p.provider_id}`,
                name: `Stream on ${p.provider_name}`,
                type: 'external',
                url: usProviders.link || 'https://www.justwatch.com',
                quality: '4K Ultra HD',
                badge: 'SUBSCRIPTION',
                logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
              });
            });
          }
        }
      }
    } catch {
      // Ignore provider errors
    }
  }

  return {
    sources,
    defaultSource: sources[0] || null
  };
};

const findTmdbIdByImdb = async (imdbID) => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/find/${imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (res.ok) {
      const data = await res.json();
      return data?.movie_results?.[0]?.id || data?.tv_results?.[0]?.id || null;
    }
  } catch {
    return null;
  }
  return null;
};
