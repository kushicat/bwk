/* ============================================================================
   BALLPOINT WITH KUSHAL — library.js
   Powers the Resource Library page: fetches data/resources.json, renders
   cards, and builds category filter pills dynamically from whatever "cats"
   values exist in the data — there is no fixed category list. Add a new
   category to any entry's cats array and a matching pill appears with zero
   code changes here.
   ============================================================================ */
(function () {
  let RESOURCES = [];
  let activeCat = 'All';
  let query = '';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const cardsEl = document.getElementById('cards');
  const emptyEl = document.getElementById('empty');
  const filtersEl = document.getElementById('filters');
  const searchEl = document.getElementById('search');

  function matches(r) {
    const inCat = activeCat === 'All' || (r.cats || []).includes(activeCat);
    const q = query.trim().toLowerCase();
    const inQ = !q || (r.title + ' ' + r.desc + ' ' + (r.cats || []).join(' ')).toLowerCase().includes(q);
    return inCat && inQ;
  }

  function cardHTML(r) {
    const inner =
      '<span class="tag">' + esc(r.tag) + '</span>' +
      '<h3>' + esc(r.title) + '</h3>' +
      '<p>' + esc(r.desc) + '</p>' +
      (r.meta ? '<div class="meta">' + esc(r.meta) + '</div>' : '') +
      '<span class="open">' + (r.soon ? 'Coming soon' : 'Open resource') + (r.soon ? '' : ' <span class="ar">&rarr;</span>') + '</span>';
    return (r.soon || !r.file)
      ? '<div class="card soon">' + inner + '</div>'
      : '<a class="card" href="' + esc(r.file) + '" target="_blank" rel="noopener">' + inner + '</a>';
  }

  function renderCards() {
    if (!cardsEl) return;
    const list = RESOURCES.filter(matches);
    cardsEl.innerHTML = list.map(cardHTML).join('');
    if (emptyEl) emptyEl.style.display = list.length ? 'none' : 'block';
  }

  function renderFilters() {
    if (!filtersEl) return;
    const catSet = new Set();
    RESOURCES.forEach(r => (r.cats || []).forEach(c => catSet.add(c)));
    const FILTERS = ['All', ...Array.from(catSet).sort((a, b) => a.localeCompare(b))];

    filtersEl.innerHTML = FILTERS.map(f => {
      const count = f === 'All' ? RESOURCES.length : RESOURCES.filter(r => (r.cats || []).includes(f)).length;
      return '<button class="chip' + (f === activeCat ? ' on' : '') + '" data-cat="' + esc(f) + '">' + esc(f) +
        '<span class="ct">' + count + '</span></button>';
    }).join('');

    filtersEl.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        activeCat = c.dataset.cat;
        filtersEl.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
        renderCards();
      });
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', e => {
      query = e.target.value;
      renderCards();
    });
  }

  async function loadResources() {
    try {
      const res = await fetch('data/resources.json');
      RESOURCES = await res.json();
    } catch (err) {
      console.error('Could not load data/resources.json', err);
      RESOURCES = [];
    }
    renderFilters();
    renderCards();
  }

  loadResources();

  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
