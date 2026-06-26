/* ============================================================================
   BALLPOINT WITH KUSHAL — animations.js
   Scroll-triggered reveal, animated stat counters, the ruled notebook-paper
   background, and the ballpoint-nib scroll-progress indicator.
   All of this respects prefers-reduced-motion.
   ============================================================================ */
window.BPK = window.BPK || {};

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------- scroll reveal for [data-reveal] ------------------
     Also automatically watches every .eyebrow tag (the small yellow pills)
     and .text-gradient (the animated highlighter marks) so they get their
     pop-in / sweep-in animation without needing data-reveal added by hand
     to each one in the HTML. */
  const revealEls = document.querySelectorAll('[data-reveal], .eyebrow, .text-gradient, .scribble-wrap');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('is-revealed'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.classList.contains('text-gradient')) {
              /* Let the parent's own fade/translate transition start first,
                 then sweep the highlight in shortly after — looks like the
                 highlighter is marking text that has already appeared,
                 rather than racing it. */
              setTimeout(() => el.classList.add('is-revealed'), 350);
            } else {
              el.classList.add('is-revealed');
            }
            io.unobserve(el);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------------------- animated stat counters ---------------------------
     Populated once data/testimonials.json has loaded and main.js has built
     the .stat elements with a data-target attribute. This just handles the
     count-up animation when a [data-stats] block scrolls into view. */
  function animateCount(el) {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(el.dataset.target || '').includes('.');
    const duration = reduceMotion ? 0 : 900;
    const start = performance.now();
    function step(now) {
      const progress = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      const display = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();
      el.textContent = progress >= 1 ? display + suffix : display;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  BPK.animateCount = animateCount;

  const statsBlock = document.querySelector('[data-stats]');
  if (statsBlock) {
    const statsIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat__num[data-target]').forEach(animateCount);
          statsIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsIO.observe(statsBlock);
  }

  /* ---------------------- ruled notebook-paper background -------------------
     Draws a full-viewport SVG of horizontal ruled lines plus a single
     vertical "margin" rule near the left, like a page from an exam
     notebook. Regenerated on resize. Skipped under reduced-motion is not
     necessary here since it's static (no animation), just lightweight. */
  const bgGrid = document.getElementById('bgGrid');
  function renderBgGrid() {
    if (!bgGrid) return;
    const w = window.innerWidth;
    const h = window.innerHeight * 2.2; // taller than viewport so it covers scroll without re-render
    const lineGap = 34;
    let lines = '';
    for (let y = lineGap; y < h; y += lineGap) {
      lines += `<line class="gline" x1="0" y1="${y}" x2="${w}" y2="${y}" />`;
    }
    const marginX = Math.min(72, w * 0.08);
    const margin = `<line class="gline--margin" x1="${marginX}" y1="0" x2="${marginX}" y2="${h}" />`;
    bgGrid.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${margin}${lines}</svg>`;
  }
  renderBgGrid();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderBgGrid, 200);
  });

  /* ---------------------- ballpoint-nib scroll indicator --------------------
     Replaces the old circular back-to-top button. The nib SVG travels down
     a fixed vertical rule on the right edge, tracking scroll progress
     through the page. Clicking it scrolls back to top with a small
     "landing" squash animation borrowed from the reference implementation. */
  const ball = document.getElementById('scrollBall');
  if (ball) {
    let ticking = false;
    let lastTop = -1;

    function updateBall() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      const rule = document.querySelector('.scroll-rule');
      const railTop = rule ? rule.getBoundingClientRect().top : 76;
      const railHeight = rule ? rule.getBoundingClientRect().height : window.innerHeight - 96;
      const nibHeight = 28;
      const top = railTop + progress * (railHeight - nibHeight);

      ball.style.top = `${top}px`;
      ball.classList.toggle('is-visible', scrollTop > 80);

      if (Math.abs(top - lastTop) > 40 && !reduceMotion) {
        ball.classList.remove('land');
        void ball.offsetWidth;
        ball.classList.add('land');
      }
      lastTop = top;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateBall); }
    }, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(updateBall));

    ball.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    updateBall();
  }

  /* --------------------------- custom ballpoint cursor ---------------------
     Only activates on devices with a real mouse (pointer: fine) — touch
     devices never run this, so the system cursor / native tap behaviour on
     phones and tablets is completely untouched. Respects reduced-motion by
     skipping the smoothing lag (snaps directly instead of easing). */
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (hasFinePointer) {
    const cursor = document.createElement('div');
    cursor.id = 'customCursor';
    cursor.innerHTML = `
      <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="2" width="10" height="18" rx="2" fill="#1E3FE0" stroke="#0E0E10" stroke-width="2"/>
        <polygon points="9,20 19,20 14,27" fill="#0E0E10"/>
      </svg>`;
    document.body.appendChild(cursor);
    document.documentElement.classList.add('has-custom-cursor');

    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let shown = false;

    function placeCursor(x, y) {
      cx = x; cy = y;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      if (!shown) { cursor.classList.add('is-active'); shown = true; }
    }

    window.addEventListener('mousemove', (e) => placeCursor(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    window.addEventListener('mouseenter', () => { if (shown) cursor.classList.add('is-active'); });

    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

    /* Bigger/rotated nib when hovering anything clickable, so it's obvious
       what counts as interactive without relying on the (now-hidden)
       system cursor's usual pointer-shape change. */
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, select, textarea, [role="button"]')) {
        cursor.classList.add('is-link');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, input, select, textarea, [role="button"]')) {
        cursor.classList.remove('is-link');
      }
    });

    /* Ink-drop ripple on click — a small ballpoint dot that blooms and
       fades, like pressing a pen tip onto paper. */
    document.addEventListener('click', (e) => {
      if (reduceMotion) return;
      const drop = document.createElement('div');
      drop.className = 'ink-drop';
      drop.style.left = e.clientX + 'px';
      drop.style.top = e.clientY + 'px';
      document.body.appendChild(drop);
      drop.addEventListener('animationend', () => drop.remove());
    });
  }
})();
