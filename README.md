# bwk
# Ballpoint with Kushal — Content Guide

This is the only file you need to add new content to the site. Every section below follows the same pattern: **edit a data file, don't touch the page HTML.** The one exception is YouTube videos, which is flagged clearly in its own section.

Quick index:
- [Add an Ebook (Google Drive link)](#1-add-an-ebook-google-drive-link)
- [Add a Free Resource (HTML tool)](#2-add-a-free-resource-html-tool)
- [Add or Replace a YouTube Video](#3-add-or-replace-a-youtube-video)
- [Add a Blog Post](#4-add-a-blog-post)
- [Blog Post Template](#5-blog-post-template-copy-this)

---

## 1. Add an Ebook (Google Drive link)

**File to edit:** `data/ebooks.json`
**Where it shows up:** homepage, "Ebook Library" section

### Steps

1. Upload your PDF to Google Drive.
2. Right-click the file → **Share** → set it to "Anyone with the link."
3. Copy the share link. It looks like:
   ```
   https://drive.google.com/file/d/FILE_ID_GOES_HERE/view?usp=sharing
   ```
4. Take just the `FILE_ID_GOES_HERE` part and build a **preview link** instead (this opens a clean inline viewer instead of Drive's full UI):
   ```
   https://drive.google.com/file/d/FILE_ID_GOES_HERE/preview
   ```
5. Open `data/ebooks.json` and add one object to the array.

### Template — copy this into the array

```json
{
  "title": "Your Ebook Title",
  "meta": "Short tag, e.g. '50 pages' or 'Story-based vocabulary'",
  "description": "One or two sentences describing what it is and why someone should read it.",
  "link": "https://drive.google.com/file/d/FILE_ID_GOES_HERE/preview",
  "cta": "Read the Ebook",
  "cover": "assets/images/your-cover.jpg"
}
```

**Notes:**
- `cover` is **optional**. Leave it out entirely and the card shows a plain colour block with the title instead — that's a real, finished design, not a placeholder. Only add `cover` if you actually have cover art (upload the image file to `assets/images/` first, then point to it here).
- Don't change `link` back to the `/view` format — `/preview` is what makes it open as a clean embedded viewer in a new tab instead of the full Google Drive page.
- No HTML editing, no code changes. Save the JSON file and you're done.

---

## 2. Add a Free Resource (HTML tool)

**Files to edit:** the tool's `.html` file (upload it) + `data/resources.json` (add an entry)
**Where it shows up:** `resources.html` (full searchable library) and the homepage "Free Resources" preview (only real, finished tools show there — see note below)

This is for your interactive single-file HTML tools — vocabulary drills, MCQ engines, spelling tests, etc. — not PDFs (those are Ebooks, section 1 above).

### Steps

1. Finish building your tool as a single, self-contained `.html` file.
2. Upload that file to the **repo root** — the same folder as `index.html`. Not in a subfolder.
3. Open `data/resources.json` and add one object to the array, using the **exact filename** you uploaded.

### Template — copy this into the array

```json
{
  "tag": "Short label shown on the card, e.g. '1300 Words'",
  "cats": ["Vocabulary", "Bank Job"],
  "title": "Full title of the resource",
  "desc": "One or two sentence description of what it does.",
  "meta": "e.g. '287 questions · 16 chapters'",
  "file": "exact-filename-as-uploaded.html"
}
```

**Notes:**
- `cats` is a list of category tags — you can use **any words you want**, not a fixed list. The filter buttons on `resources.html` build themselves automatically from whatever category names appear across all your resources. Add a new category like `"Mathematics"` or `"Bangla"` to any entry and a matching filter button just appears — no code change needed.
- A resource only shows up in the **homepage preview** (the "Free Resources" teaser section) if it has a real `file` and is finished. If you want to list something you're still building, use the placeholder pattern instead:
  ```json
  {
    "tag": "Mathematics",
    "cats": ["Mathematics"],
    "title": "Math Shortcuts Pack",
    "desc": "Fast methods for the recurring question types.",
    "meta": "In progress",
    "soon": true
  }
  ```
  Notice there's no `file` field, and `"soon": true` instead — this shows as a placeholder card on the full library page but is automatically skipped on the homepage preview.
- Optional: add `"feature": "Most Popular"` (or any short phrase) to make a resource eligible for featured placement.

---

## 3. Add or Replace a YouTube Video

**File to edit:** `index.html` directly (this is the one part of the site that is NOT JSON-driven — see note below)
**Where it shows up:** homepage, "From the YouTube Channel" section

### Why this one is different

Unlike Ebooks/Resources/Blog, the YouTube section is three hand-written HTML blocks, not a data file. This was a deliberate choice early on since there are only 3 video slots — but it does mean you're editing HTML directly here, not just a JSON file. Find the section by searching `index.html` for:

```html
SECTION 7 — YOUTUBE
```

### To replace a placeholder video card

Find a card that looks like this (the play-button icon means it's still a placeholder, not a real video):

```html
<article class="card video-card" data-reveal>
  <div class="video-card__embed">
    <div class="video-card__placeholder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
  </div>
  <div class="video-card__body"><h4>Latest video title</h4><p class="text-muted" style="font-size:var(--fs-small)">Short description of the video.</p></div>
</article>
```

Replace the **entire block** with this template:

```html
<article class="card video-card" data-reveal>
  <div class="video-card__embed">
    <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" title="Your Video Title" loading="lazy" allowfullscreen></iframe>
  </div>
  <div class="video-card__body"><h4>Your Video Title</h4><p class="text-muted" style="font-size:var(--fs-small)">One or two sentence description.</p></div>
</article>
```

### How to get `YOUR_VIDEO_ID`

From a YouTube URL like:
```
https://youtu.be/jUjMprQMqVg?si=voahpdFfzJXc-z9V
```
The video ID is the part right after `youtu.be/` and before the `?` — in this example: `jUjMprQMqVg`. Drop that into the `embed/` URL as shown in the template above.

### To replace an already-real video

Same idea — find the `<article class="card video-card">` block containing the video you want to swap out (it'll have a real `<iframe>` already, not a placeholder), and update three things inside it: the `src="...embed/VIDEO_ID"`, the `title="..."` attribute, and the `<h4>`/`<p>` text.

---

## 4. Add a Blog Post

**Files to edit:** a new `.md` file in `/blog` + one entry in `data/blog.json`
**Where it shows up:** `blog.html` (listing page) and `post.html` (the post itself, via `post.html?slug=your-slug`)

### Steps

1. Write your post as plain text in a `.md` (Markdown) file. Use `## Heading` for section breaks if you want them — see the [template](#5-blog-post-template-copy-this) below.
2. Save it inside the `/blog` folder, e.g. `blog/my-new-post.md`.
3. Open `data/blog.json` and add one object to the array.

### Template — copy this into the array

```json
{
  "slug": "my-new-post",
  "title": "Your Post Title (can be in Bangla or English)",
  "excerpt": "One or two sentences shown on the blog listing card.",
  "date": "2026-07-01",
  "lang": "bn",
  "tags": ["Tag One", "Tag Two"],
  "file": "blog/my-new-post.md"
}
```

**Notes:**
- `slug` must be unique and **must match what you'll use in the URL** — keep it lowercase, words separated by hyphens, no spaces or special characters.
- `lang` must be exactly `"bn"` (Bangla) or `"en"` (English) — this controls which font renders the post (Bangla posts automatically use a proper Bengali font) and which language filter button it shows under on the blog listing page.
- `date` format must be `YYYY-MM-DD`. Posts are sorted newest-first automatically based on this.
- `file` must point to the exact `.md` file you created, including the `blog/` folder prefix.
- That's it — no HTML editing. `blog.html` and `post.html` both read this file automatically.

---

## 5. Blog Post Template (copy this)

Save this as a new file in `/blog`, e.g. `blog/my-new-post.md`, then fill it in:

```markdown
Opening paragraph — set the scene. What is this post about, and why should
someone keep reading? Write it like you're talking to one specific student,
not a general audience.

A second paragraph can continue the same thought, or start the actual story.
Markdown treats a blank line as a new paragraph — that's the only formatting
you need for plain text.

## A Section Heading

Use `##` (two hash symbols) followed by a space to start a new named
section — this is what creates the underlined section headers you see in
the published post, like "বুক লিস্টঃ" or "VIVA" in the example post already
on the site.

Regular paragraphs go under each heading exactly like above.

## Another Section

- Use a hyphen and a space for bullet points
- Like this
- As many as you need

You can also just write **bold text** by wrapping it in double-asterisks,
if you want to emphasize something inline without making it a heading.

— Your name
```

**What NOT to worry about:**
- No need to add any title, date, or metadata inside the `.md` file itself — all of that lives in the `blog.json` entry (section 4 above), not in the post text.
- No need to write any HTML — plain text and the few Markdown symbols above (`##`, `-`, `**`) are all that's needed. The site converts it to the styled page automatically.
- Bangla text works exactly the same way — see `blog/iba-mba-experience-bn.md` in the repo for a real, complete example post if you want to see the pattern in practice.

---

## Quick Reference Table

| Content type | Edit this data file | Plus this | HTML editing required? |
|---|---|---|---|
| Ebook | `data/ebooks.json` | nothing else | No |
| Free Resource | `data/resources.json` | upload the `.html` tool to repo root | No |
| YouTube video | — | edit `index.html` directly | **Yes** |
| Blog post | `data/blog.json` | write a `.md` file in `/blog` | No |
