const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

const dramas = [
  { id: 'a', title: 'Mr. Queen', year: 2020, country: 'South Korea', type: 'Drama', genres: ['Historical', 'Comedy'] },
  { id: 'b', title: 'Running Man', year: 2010, country: 'South Korea', type: 'Variety show', genres: ['Comedy', 'Variety'] },
  { id: 'c', title: 'Legend of Fei', year: 2020, country: 'China', type: 'Drama', genres: ['Martial Arts'] },
];

test('search ignores case, punctuation and word order', () => {
  assert.deepEqual(L.filterDramas(dramas, { query: 'queen MR' }).map((d) => d.id), ['a']);
  assert.deepEqual(L.filterDramas(dramas, { query: 'mr.queen' }).map((d) => d.id), ['a']);
  assert.deepEqual(L.filterDramas(dramas, { query: 'MR. QUEEN' }).map((d) => d.id), ['a']);
});

test('search also matches genre, country and type', () => {
  assert.deepEqual(L.filterDramas(dramas, { query: 'china' }).map((d) => d.id), ['c']);
  assert.deepEqual(L.filterDramas(dramas, { query: 'variety' }).map((d) => d.id), ['b']);
  assert.deepEqual(L.filterDramas(dramas, { query: 'comedy' }).map((d) => d.id), ['a', 'b']);
});

test('genre filter and watchlist filter combine', () => {
  assert.deepEqual(L.filterDramas(dramas, { genre: 'Comedy' }).map((d) => d.id), ['a', 'b']);
  assert.deepEqual(
    L.filterDramas(dramas, { genre: 'Comedy', watchlistOnly: true, watchlist: ['b', 'c'] }).map((d) => d.id),
    ['b'],
  );
});

test('empty query returns everything', () => {
  assert.equal(L.filterDramas(dramas, { query: '   ' }).length, 3);
});

test('sorting by title, newest and oldest', () => {
  assert.deepEqual(L.sortDramas(dramas, 'title').map((d) => d.id), ['c', 'a', 'b']);
  assert.deepEqual(L.sortDramas(dramas, 'newest').map((d) => d.id), ['c', 'a', 'b']);
  assert.deepEqual(L.sortDramas(dramas, 'oldest').map((d) => d.id), ['b', 'c', 'a']);
});

test('sorting does not change the original list', () => {
  const before = dramas.map((d) => d.id);
  L.sortDramas(dramas, 'oldest');
  assert.deepEqual(dramas.map((d) => d.id), before);
});

test('allGenres lists each genre once, sorted', () => {
  assert.deepEqual(L.allGenres(dramas), ['Comedy', 'Historical', 'Martial Arts', 'Variety']);
});

test('toggleId adds and removes', () => {
  assert.deepEqual(L.toggleId(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(L.toggleId(['a', 'b'], 'a'), ['b']);
});

test('clampRating keeps ratings between 0 and 5', () => {
  assert.equal(L.clampRating(3.6), 4);
  assert.equal(L.clampRating(9), 5);
  assert.equal(L.clampRating(-2), 0);
  assert.equal(L.clampRating('abc'), 0);
});

test('URL state round-trips and rejects unknown values', () => {
  const state = { query: 'queen', genre: 'Comedy', sort: 'newest', view: 'watchlist' };
  const search = L.buildSearch(state);
  assert.equal(search, '?q=queen&genre=Comedy&sort=newest&view=watchlist');
  assert.deepEqual(L.parseState(search, ['Comedy']), state);
  assert.deepEqual(L.parseState('?genre=<script>&sort=evil&view=admin', ['Comedy']), {
    query: '', genre: '', sort: 'title', view: 'all',
  });
  assert.equal(L.buildSearch({ query: '', genre: '', sort: 'title', view: 'all' }), '');
});

test('initials skip small words', () => {
  assert.equal(L.initials('Legend of Fei'), 'LF');
  assert.equal(L.initials('The Penthouse: War in Life'), 'PW');
  assert.equal(L.initials('Mr. Queen'), 'MQ');
});
