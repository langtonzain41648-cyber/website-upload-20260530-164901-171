import { MOVIES } from './movies-data.js';

const root = document.body.dataset.root || './';
const form = document.querySelector('[data-search-form]');
const input = form ? form.querySelector('input[name="q"]') : null;
const yearSelect = document.querySelector('[data-search-year]');
const typeSelect = document.querySelector('[data-search-type]');
const sortSelect = document.querySelector('[data-search-sort]');
const results = document.querySelector('[data-search-results]');
const summary = document.querySelector('[data-search-summary]');

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function posterPath(movie) {
  return `${root}${movie.coverIndex}.jpg`;
}

function detailPath(movie) {
  return `${root}detail/${movie.id}.html`;
}

function cardHtml(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  const oneLine = movie.oneLine.length > 64 ? `${movie.oneLine.slice(0, 64)}…` : movie.oneLine;

  return `
          <article class="movie-card" data-title="${escapeHtml(movie.title)}">
            <a class="movie-card-link" href="${detailPath(movie)}" title="${escapeHtml(movie.title)} 在线观看">
              <div class="poster-shell">
                <img src="${posterPath(movie)}" alt="${escapeHtml(movie.title)} 海报" loading="lazy" data-fallback="${escapeHtml(movie.title)}">
                <div class="poster-fallback" aria-hidden="true">
                  <span>${escapeHtml(movie.title)}</span>
                </div>
                <span class="poster-play">播放</span>
              </div>
              <div class="movie-card-body">
                <div class="movie-meta-row">
                  <span>${escapeHtml(movie.year)}</span>
                  <span>${escapeHtml(movie.type)}</span>
                </div>
                <h2>${escapeHtml(movie.title)}</h2>
                <p>${escapeHtml(oneLine)}</p>
                <div class="tag-row">${tags}</div>
              </div>
            </a>
          </article>`;
}

function fillOptions() {
  const years = Array.from(new Set(MOVIES.map((movie) => movie.year).filter(Boolean))).sort().reverse();
  const types = Array.from(new Set(MOVIES.map((movie) => movie.type).filter(Boolean))).sort();

  if (yearSelect) {
    yearSelect.insertAdjacentHTML('beforeend', years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join(''));
  }

  if (typeSelect) {
    typeSelect.insertAdjacentHTML('beforeend', types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join(''));
  }
}

function getInitialQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

function applySearch() {
  const keyword = normalize(input ? input.value : '');
  const year = normalize(yearSelect ? yearSelect.value : '');
  const type = normalize(typeSelect ? typeSelect.value : '');
  const sort = sortSelect ? sortSelect.value : 'heat';

  let filtered = MOVIES.filter((movie) => {
    const haystack = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genreRaw,
      movie.tags.join(' '),
      movie.oneLine,
      movie.summary
    ].join(' '));
    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesYear = !year || normalize(movie.year) === year;
    const matchesType = !type || normalize(movie.type) === type;

    return matchesKeyword && matchesYear && matchesType;
  });

  filtered = filtered.sort((left, right) => {
    if (sort === 'year') {
      return Number(right.year || 0) - Number(left.year || 0);
    }
    if (sort === 'title') {
      return left.title.localeCompare(right.title, 'zh-Hans-CN');
    }
    return Number(right.heat || 0) - Number(left.heat || 0);
  });

  if (summary) {
    const label = keyword ? `“${keyword}”` : '全部影片';
    summary.textContent = `共找到 ${filtered.length} 条与 ${label} 相关的结果。`;
  }

  if (results) {
    results.innerHTML = filtered.map(cardHtml).join('');
  }
}

fillOptions();

if (input) {
  input.value = getInitialQuery();
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applySearch();
  });
}

[yearSelect, typeSelect, sortSelect, input].forEach((element) => {
  if (element) {
    element.addEventListener('input', applySearch);
    element.addEventListener('change', applySearch);
  }
});

applySearch();
