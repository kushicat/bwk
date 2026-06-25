/* ============================================================================
   BALLPOINT WITH KUSHAL — navigation.js
   Sticky navbar shadow-on-scroll, mobile hamburger drawer, and closing the
   drawer when a link is clicked or Escape is pressed.
   ============================================================================ */
window.BPK = window.BPK || {};

(function () {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.getElementById('mobileDrawer');

  /* Add a border/shadow once the page has scrolled a little, so the navbar
     doesn't look like it's floating over content at the very top. */
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger <-> drawer toggle */
  function setDrawer(open) {
    if (!hamburger || !drawer) return;
    hamburger.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      setDrawer(!isOpen);
    });

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setDrawer(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setDrawer(false);
    });
  }
})();
