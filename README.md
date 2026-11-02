# K-Drama Catalog

![tests](https://github.com/Kritimandal/movie-website-CSS-design/actions/workflows/tests.yml/badge.svg)

A small K-drama catalog web app built with plain HTML, CSS and JavaScript, with no framework and no build step. It started in 2022 as a single static fan page and was rebuilt as an interactive app.

**Live demo:** https://kritimandal.github.io/movie-website-CSS-design/

## Features

- **Live search** by title, genre, country or type. It ignores capital letters, punctuation and word order
- **Genre filter chips** and **sorting** (A–Z, newest, oldest)
- **Detail popup** for each title, built with the native `<dialog>` element
- **Watchlist** with a count badge and its own view
- **Personal 1–5 star rating** for each title
- Watchlist, ratings and theme are saved in the browser with `localStorage`
- **Shareable URLs**: search, genre, sort and view are kept in the address bar (for example `?q=comedy&genre=Historical`). Unknown values in the URL are ignored
- **Responsive** card grid for phones, tablets and desktops
- **Light and dark theme** that follows the system setting, with a toggle
- **Accessible**: keyboard friendly, skip link, labelled controls, a live result count for screen readers, and press `/` to jump to search

## How it is built

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `css/styles.css` | Layout with CSS Grid and Flexbox, theme colours as CSS variables |
| `js/data.js` | The catalog data |
| `js/logic.js` | Pure functions: search, filter, sort, URL state, ratings. Works in the browser and in Node |
| `js/app.js` | Renders the UI and handles events. It builds DOM nodes with `textContent`, never `innerHTML` |
| `tests/logic.test.js` | Unit tests with Node's built-in test runner |

Keeping the logic in pure functions separate from the DOM code makes it easy to test without a browser.

## Run locally

Open `index.html` in a browser. No server or install is needed.

## Tests

Requires Node.js 18 or newer:

```bash
npm test
```

11 tests cover search, filters, sorting, the watchlist, rating limits and URL handling. They run on every push with GitHub Actions.

## Note

This is a fan-made practice project. The descriptions are short summaries written for this demo. The project is not affiliated with any broadcaster, and the posters are generated colour gradients, not real artwork.
