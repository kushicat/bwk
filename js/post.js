/* ============================================================================
   BALLPOINT WITH KUSHAL — post.js
   Powers post.html: reads the ?slug= query param, looks up the matching
   entry in data/blog.json, fetches that entry's markdown file, and renders
   it client-side via marked.js (loaded in post.html's <head>).
   ============================================================================ */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LANG_LABEL = { bn: 'বাংলা পোস্ট', en: 'English Post' };

  function fmtDate(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return iso; }
  }

  function showError() {
    document.getElementById('postLoading').hidden = true;
    document.getElementById('postError').hidden = false;
  }

  async function load() {
    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) return showError();

    let posts;
    try {
      const res = await fetch('data/blog.json');
      posts = await res.json();
    } catch (err) {
      console.error('Could not load data/blog.json', err);
      return showError();
    }

    const post = posts.find(p => p.slug === slug);
    if (!post) return showError();

    let mdText;
    try {
      const mdRes = await fetch(post.file);
      if (!mdRes.ok) throw new Error('Markdown file not found: ' + post.file);
      mdText = await mdRes.text();
    } catch (err) {
      console.error('Could not load post markdown', err);
      return showError();
    }

    // Render the markdown. marked.js loads with `defer` in <head>, before
    // this script (also deferred, lower in the document) ever runs, so it
    // should always be defined by this point — but check anyway rather
    // than assume, in case the CDN is ever slow/unreachable.
    let html;
    if (window.marked && typeof window.marked.parse === 'function') {
      html = window.marked.parse(mdText);
    } else {
      console.warn('marked.js did not load — showing plain text instead of rendered markdown');
      html = '<pre class="post__plain">' + esc(mdText) + '</pre>';
    }

    document.getElementById('postTitleTag').textContent = post.title + ' — Ballpoint with Kushal';
    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postEyebrow').textContent = LANG_LABEL[post.lang] || 'Blog';
    document.getElementById('postDate').textContent = fmtDate(post.date);
    document.getElementById('postTags').textContent = (post.tags || []).join(' · ');
    document.getElementById('postBody').innerHTML = html;

    // Bangla posts need the Bengali font and should not be forced into
    // uppercase by the site's default heading style — set lang on the
    // whole article body so css/styles.css's [lang="bn"] rule applies to
    // every heading marked.js generates from the markdown, not just the
    // page title.
    if (post.lang === 'bn') {
      document.getElementById('postContent').setAttribute('lang', 'bn');
    }

    document.getElementById('postLoading').hidden = true;
    document.getElementById('postContent').hidden = false;
    window.BPK && window.BPK.observeReveals && window.BPK.observeReveals(document.getElementById('postContent'));
  }

  load();

  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
