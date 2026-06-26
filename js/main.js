/* ============================================================================
   BALLPOINT WITH KUSHAL — main.js
   Entry point. Loads JSON data from /data and renders the dynamic sections:
   Courses, Ebooks, and Testimonials + Stats. Edit the JSON files to change
   content — this file should rarely need touching.
   ============================================================================ */
window.BPK = window.BPK || {};

(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Shared "coming soon" empty-state card used by both Courses and Ebooks
     when their JSON file is an empty array. Styled to match the rest of
     the site rather than a plain muted sentence, and spans the full grid
     width so it doesn't look like a half-broken layout. */
  function comingSoonCard(title, body) {
    return `
      <div class="coming-soon-card" data-reveal>
        <span class="coming-soon-card__tag">Coming Soon</span>
        <h3>${esc(title)}</h3>
        <p>${esc(body)}</p>
        <a class="btn btn--secondary btn--sm" href="#waitlist">Join Waitlist</a>
      </div>`;
  }

  /* ------------------------------- courses --------------------------------- */
  async function renderCourses() {
    const wrap = document.querySelector('[data-courses]');
    if (!wrap) return;
    try {
      const res = await fetch('data/courses.json');
      const courses = await res.json();
      if (!courses.length) {
        wrap.innerHTML = comingSoonCard('Courses are cooking', 'New structured programs are in the works — join the waitlist and you\'ll be first to know the moment they\'re ready.');
        return;
      }
      wrap.innerHTML = courses.map(c => `
        <article class="card course-card" data-reveal>
          <div class="course-card__top">
            <h3>${esc(c.title)}</h3>
            <span class="status-pill status-${esc(c.status || 'coming-soon')}">${esc((c.status || 'coming soon').replace('-', ' '))}</span>
          </div>
          <p>${esc(c.description || '')}</p>
          <ul class="course-card__features">
            ${(c.features || []).map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>${esc(f)}</li>`).join('')}
          </ul>
          <a class="btn btn--primary" href="${esc(c.link || '#waitlist')}">${esc(c.cta || 'Join Waitlist')}</a>
        </article>
      `).join('');
    } catch (err) {
      console.error('Could not load data/courses.json', err);
      wrap.innerHTML = '<p class="text-muted text-center">Couldn\'t load courses right now.</p>';
    }
  }

  /* -------------------------------- ebooks ---------------------------------- */
  async function renderEbooks() {
    const wrap = document.querySelector('[data-ebooks]');
    if (!wrap) return;
    try {
      const res = await fetch('data/ebooks.json');
      const ebooks = await res.json();
      if (!ebooks.length) {
        wrap.innerHTML = comingSoonCard('Ebooks are cooking', 'The first titles are being written. Join the waitlist to get them the moment they\'re published.');
        return;
      }
      wrap.innerHTML = ebooks.map(b => `
        <article class="card ebook-card" data-reveal>
          <div class="ebook-card__cover">${esc(b.title)}<span>${esc(b.meta || '')}</span></div>
          <h3>${esc(b.title)}</h3>
          <p class="text-muted" style="font-size:var(--fs-small)">${esc(b.description || '')}</p>
          <a class="btn btn--secondary btn--sm" href="${esc(b.link || '#')}">${esc(b.cta || 'View')}</a>
        </article>
      `).join('');
    } catch (err) {
      console.error('Could not load data/ebooks.json', err);
      wrap.innerHTML = '<p class="text-muted text-center">Couldn\'t load ebooks right now.</p>';
    }
  }

  /* ----------------------------- testimonials -------------------------------
     NOTE: testimonials.json is documented as containing PLACEHOLDERS. This
     renders whatever is in the file as-is — it is on you to replace it with
     real, permissioned testimonials and real numbers before launch. */
  async function renderTestimonials() {
    const statsWrap = document.querySelector('[data-stats]');
    const trackWrap = document.querySelector('[data-testimonials]');
    if (!statsWrap && !trackWrap) return;
    try {
      const res = await fetch('data/testimonials.json');
      const data = await res.json();

      if (statsWrap && data.stats) {
        statsWrap.innerHTML = data.stats.map(s => `
          <div class="stat">
            <div class="stat__num" data-target="${esc(s.value)}" data-suffix="${esc(s.suffix || '')}">0</div>
            <div class="stat__label">${esc(s.label)}</div>
          </div>
        `).join('');
      }

      if (trackWrap && data.testimonials) {
        trackWrap.innerHTML = data.testimonials.map(t => `
          <div class="carousel__slide">
            <div class="testimonial">
              <p class="testimonial__quote">"${esc(t.quote)}"</p>
              <div class="testimonial__author">
                <div class="testimonial__avatar">${esc((t.name || '?').charAt(0))}</div>
                <div>
                  <div class="testimonial__name">${esc(t.name)}</div>
                  <div class="testimonial__role">${esc(t.role || '')}</div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
        BPK.initCarousel && BPK.initCarousel();
      }
    } catch (err) {
      console.error('Could not load data/testimonials.json', err);
    }
  }

  /* ------------------------------- misc UI ----------------------------------- */
  function wireYear() {
    const yr = document.querySelector('[data-year]');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  renderCourses();
  renderEbooks();
  renderTestimonials();
  wireYear();
})();
