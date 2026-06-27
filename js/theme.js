/* ============================================================================
   BALLPOINT WITH KUSHAL — theme.js
   Wires up the dark-mode toggle button(s). The actual theme is already set
   before first paint by the inline script in <head> (avoids a flash of
   the wrong theme) — this file just handles the click-to-toggle behaviour
   and keeps the desktop + mobile toggle buttons in sync with each other.
   ============================================================================ */
(function () {
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('bwk-theme', theme); } catch (e) { /* ignore */ }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function toggle() {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')]
    .filter(Boolean);
  toggles.forEach(btn => btn.addEventListener('click', toggle));
})();
