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
     so they get their pop-in animation without needing data-reveal added
     by hand to each one in the HTML. */
  const revealEls = document.querySelectorAll('[data-reveal], .eyebrow');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('is-revealed'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
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
    const isDecimal = String(el.dataset.target || '').includes('.');
    const duration = reduceMotion ? 0 : 900;
    const start = performance.now();
    function step(now) {
      const progress = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();
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
})();
