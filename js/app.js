(function () {
  const L = window.DramaLogic;
  const dramas = window.DRAMAS;
  const genres = L.allGenres(dramas);
  const STORAGE_KEY = 'kdrama-catalog';

  const els = {
    search: document.getElementById('search'),
    sort: document.getElementById('sort'),
    chips: document.getElementById('genre-chips'),
    grid: document.getElementById('grid'),
    count: document.getElementById('result-count'),
    empty: document.getElementById('empty'),
    clear: document.getElementById('clear-filters'),
    tabs: document.querySelectorAll('[data-view]'),
    watchCount: document.getElementById('watch-count'),
    dialog: document.getElementById('detail'),
    dialogBody: document.getElementById('detail-body'),
    theme: document.getElementById('theme-toggle'),
  };

  let state = L.parseState(location.search, genres);
  let saved = loadSaved();

  function loadSaved() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
        ratings: data.ratings && typeof data.ratings === 'object' ? data.ratings : {},
      };
    } catch {
      return { watchlist: [], ratings: {} };
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      return;
    }
  }

  function setState(changes) {
    state = { ...state, ...changes };
    history.replaceState(null, '', `${location.pathname}${L.buildSearch(state)}`);
    render();
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') node.textContent = value;
      else if (key === 'style') node.style.cssText = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) {
      if (child) node.append(child);
    }
    return node;
  }

  function poster(drama, size) {
    const h = L.hue(drama.title);
    return el('div', {
      class: `poster ${size}`,
      style: `--h1:${h};--h2:${(h + 50) % 360}`,
      'aria-hidden': 'true',
    }, el('span', { text: L.initials(drama.title) }));
  }

  function stars(drama) {
    const current = saved.ratings[drama.id] || 0;
    const group = el('div', { class: 'stars', role: 'radiogroup', 'aria-label': 'Your rating' });
    for (let value = 1; value <= 5; value++) {
      group.append(el('button', {
        type: 'button',
        class: value <= current ? 'star on' : 'star',
        role: 'radio',
        'aria-checked': String(value === current),
        'aria-label': `${value} star${value > 1 ? 's' : ''}`,
        text: '★',
        onclick: () => {
          const next = L.clampRating(value === current ? 0 : value);
          if (next) saved.ratings[drama.id] = next;
          else delete saved.ratings[drama.id];
          persist();
          openDetail(drama, false);
          render();
        },
      }));
    }
    return group;
  }

  function watchButton(drama, onChange) {
    const inList = saved.watchlist.includes(drama.id);
    return el('button', {
      type: 'button',
      class: inList ? 'button saved' : 'button',
      'aria-pressed': String(inList),
      text: inList ? '✓ In watchlist' : '+ Watchlist',
      onclick: (event) => {
        event.stopPropagation();
        saved.watchlist = L.toggleId(saved.watchlist, drama.id);
        persist();
        onChange();
      },
    });
  }

  function card(drama) {
    const rating = saved.ratings[drama.id];
    return el('li', { class: 'card' }, [
      el('button', {
        type: 'button',
        class: 'card-open',
        'aria-label': `${drama.title}, ${drama.year}. Show details`,
        onclick: () => openDetail(drama, true),
      }, [
        poster(drama, 'small'),
        el('div', { class: 'card-text' }, [
          el('h3', { text: drama.title }),
          el('p', { class: 'meta', text: `${drama.year} · ${drama.country} · ${drama.type}` }),
          el('p', { class: 'tags', text: drama.genres.join(' · ') }),
          rating ? el('p', { class: 'my-rating', text: `Your rating: ${'★'.repeat(rating)}` }) : null,
        ]),
      ]),
      watchButton(drama, render),
    ]);
  }

  function openDetail(drama, focus) {
    els.dialogBody.replaceChildren(
      poster(drama, 'large'),
      el('div', { class: 'detail-text' }, [
        el('h2', { id: 'detail-title', text: drama.title }),
        el('p', { class: 'meta', text: `${drama.year} · ${drama.country} · ${drama.type}` }),
        el('ul', { class: 'chip-list' }, drama.genres.map((genre) => el('li', { class: 'chip static', text: genre }))),
        el('p', { text: drama.description }),
        el('div', { class: 'detail-actions' }, [
          watchButton(drama, () => {
            openDetail(drama, false);
            render();
          }),
          stars(drama),
        ]),
      ]),
    );
    if (!els.dialog.open) {
      els.dialog.showModal();
    }
    if (focus) {
      els.dialog.querySelector('.close').focus();
    }
  }

  function renderChips() {
    const chip = (label, value) =>
      el('button', {
        type: 'button',
        class: 'chip',
        'aria-pressed': String(state.genre === value),
        text: label,
        onclick: () => setState({ genre: state.genre === value ? '' : value }),
      });
    els.chips.replaceChildren(chip('All genres', ''), ...genres.map((genre) => chip(genre, genre)));
  }

  function render() {
    const visible = L.sortDramas(
      L.filterDramas(dramas, {
        query: state.query,
        genre: state.genre,
        watchlistOnly: state.view === 'watchlist',
        watchlist: saved.watchlist,
      }),
      state.sort,
    );

    els.grid.replaceChildren(...visible.map(card));
    els.count.textContent = `${visible.length} ${visible.length === 1 ? 'title' : 'titles'}`;
    els.empty.hidden = visible.length > 0;
    els.watchCount.textContent = String(saved.watchlist.length);
    els.tabs.forEach((tab) => tab.setAttribute('aria-current', String(tab.dataset.view === state.view)));
    if (els.search.value !== state.query) els.search.value = state.query;
    els.sort.value = state.sort;
    renderChips();
  }

  let timer;
  els.search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => setState({ query: els.search.value.trim() }), 150);
  });
  els.sort.addEventListener('change', () => setState({ sort: els.sort.value }));
  els.clear.addEventListener('click', () => setState({ query: '', genre: '', view: 'all' }));
  els.tabs.forEach((tab) => tab.addEventListener('click', () => setState({ view: tab.dataset.view })));
  els.dialog.addEventListener('click', (event) => {
    if (event.target === els.dialog) els.dialog.close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== els.search && !els.dialog.open) {
      event.preventDefault();
      els.search.focus();
    }
  });

  els.theme.addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try {
      localStorage.setItem(`${STORAGE_KEY}-theme`, root.dataset.theme);
    } catch {
      return;
    }
  });

  render();
})();
