(function (root) {
  const SORTS = ['title', 'newest', 'oldest'];

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function matchesQuery(drama, query) {
    const words = normalize(query).split(' ').filter(Boolean);
    if (!words.length) {
      return true;
    }
    const haystack = normalize([drama.title, drama.country, drama.type, drama.genres.join(' ')].join(' '));
    return words.every((word) => haystack.includes(word));
  }

  function filterDramas(dramas, { query = '', genre = '', watchlistOnly = false, watchlist = [] } = {}) {
    const saved = new Set(watchlist);
    return dramas.filter(
      (drama) =>
        matchesQuery(drama, query) &&
        (!genre || drama.genres.includes(genre)) &&
        (!watchlistOnly || saved.has(drama.id)),
    );
  }

  function sortDramas(dramas, sort = 'title') {
    const copy = [...dramas];
    const byTitle = (a, b) => a.title.localeCompare(b.title);
    if (sort === 'newest') {
      return copy.sort((a, b) => b.year - a.year || byTitle(a, b));
    }
    if (sort === 'oldest') {
      return copy.sort((a, b) => a.year - b.year || byTitle(a, b));
    }
    return copy.sort(byTitle);
  }

  function allGenres(dramas) {
    return [...new Set(dramas.flatMap((drama) => drama.genres))].sort();
  }

  function toggleId(ids, id) {
    return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
  }

  function clampRating(value) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) {
      return 0;
    }
    return Math.min(5, Math.max(0, number));
  }

  function parseState(search, genres = []) {
    const params = new URLSearchParams(search);
    const genre = params.get('genre') || '';
    const sort = params.get('sort') || 'title';
    return {
      query: (params.get('q') || '').slice(0, 100),
      genre: genres.includes(genre) ? genre : '',
      sort: SORTS.includes(sort) ? sort : 'title',
      view: params.get('view') === 'watchlist' ? 'watchlist' : 'all',
    };
  }

  function buildSearch({ query, genre, sort, view }) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (genre) params.set('genre', genre);
    if (sort && sort !== 'title') params.set('sort', sort);
    if (view === 'watchlist') params.set('view', view);
    const text = params.toString();
    return text ? `?${text}` : '';
  }

  function initials(title) {
    return title
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .split(' ')
      .filter((word) => word && !['the', 'of', 'in'].includes(word.toLowerCase()))
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  function hue(text) {
    let hash = 0;
    for (const char of text) {
      hash = (hash * 31 + char.charCodeAt(0)) % 360;
    }
    return hash;
  }

  const api = { normalize, filterDramas, sortDramas, allGenres, toggleId, clampRating, parseState, buildSearch, initials, hue, SORTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DramaLogic = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
