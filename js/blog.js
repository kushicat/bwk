/* ============================================================================
   BALLPOINT WITH KUSHAL — blog.js
   Powers blog.html: fetches data/blog.json, renders post cards (newest
   first), and builds a language filter (All / Bangla / English) from
   whatever "lang" values actually exist in the data.
   ============================================================================ */
(function () {
  let POSTS = [];
  let activeLang = 'All';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LANG_LABEL = { bn: 'Bangla', en: 'English' };

  const gridEl = document.getElementById('blogGrid');
  const emptyEl = document.getElementById('blogEmpty');
  const filtersEl = document.getElementById('langFilters');

  function fmtDate(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso; }
  }

  function cardHTML(p) {
    const langAttr = p.lang === 'bn' ? ' lang="bn"' : '';
    return `
      <a class="card blog-card" href="post.html?slug=${esc(p.slug)}">
        <span class="blog-card__lang">${esc(LANG_LABEL[p.lang] || p.lang || '')}</span>
        <h3${langAttr}>${esc(p.title)}</h3>
        <p${langAttr}>${esc(p.excerpt || '')}</p>
        <div class="blog-card__meta">
          <span class="mono">${esc(fmtDate(p.date))}</span>
        </div>
      </a>`;
  }

  function render() {
    const list = activeLang === 'All' ? POSTS : POSTS.filter(p => p.lang === activeLang);
    gridEl.innerHTML = list.map(cardHTML).join('');
    emptyEl.style.display = list.length ? 'none' : 'block';
    window.BPK && window.BPK.observeReveals && window.BPK.observeReveals(gridEl);
  }

  function renderFilters() {
    const langs = Array.from(new Set(POSTS.map(p => p.lang).filter(Boolean)));
    const options = ['All', ...langs];
    filtersEl.innerHTML = options.map(l => {
      const label = l === 'All' ? 'All' : (LANG_LABEL[l] || l);
      const count = l === 'All' ? POSTS.length : POSTS.filter(p => p.lang === l).length;
      return `<button class="chip${l === activeLang ? ' on' : ''}" data-lang="${esc(l)}">${esc(label)}<span class="ct">${count}</span></button>`;
    }).join('');
    filtersEl.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLang = btn.dataset.lang;
        filtersEl.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b === btn));
        render();
      });
    });
  }

  async function load() {
    try {
      const res = await fetch('data/blog.json');
      POSTS = await res.json();
      POSTS.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } catch (err) {
      console.error('Could not load data/blog.json', err);
      POSTS = [];
    }
    renderFilters();
    render();
  }

  load();

  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
