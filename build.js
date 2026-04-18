#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PROMPTS_DIR = path.join(ROOT, 'prompts');
const OUT_DIR = path.join(ROOT, 'dist');
const CASES_DIR = path.join(OUT_DIR, 'cases');

const CATEGORY_NAMES = {
  '01-cinematic-vfx': 'Cinematic & VFX',
  '02-commercial-product': 'Commercial & Product',
  '03-ugc-social': 'UGC & Social',
  '04-action-fight': 'Action & Fight',
  '05-anime-manga': 'Anime & Manga',
  '06-drama-romance': 'Drama & Romance',
  '07-fantasy': 'Fantasy',
  '08-horror': 'Horror',
  '09-sci-fi-cyberpunk': 'Sci-Fi & Cyberpunk',
  '10-nature-documentary': 'Nature & Documentary',
  '11-epic-spectacle': 'Epic Spectacle',
  '12-superhero-powers': 'Superhero Powers',
  '13-comedy-meme': 'Comedy & Meme',
};

const CATEGORY_EMOJIS = {
  '01-cinematic-vfx': '🎬',
  '02-commercial-product': '📦',
  '03-ugc-social': '📱',
  '04-action-fight': '⚔️',
  '05-anime-manga': '✨',
  '06-drama-romance': '💖',
  '07-fantasy': '🧙',
  '08-horror': '👻',
  '09-sci-fi-cyberpunk': '🤖',
  '10-nature-documentary': '🌿',
  '11-epic-spectacle': '🔥',
  '12-superhero-powers': '🦸',
  '13-comedy-meme': '😂',
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseSourceMd(src) {
  return src
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

function slugify(filename) {
  return path.basename(filename, '.md');
}

function parseMarkdown(content) {
  const lines = content.split('\n');
  let title = '';
  let tagline = '';
  let videoUrl = '';
  let sourceRaw = '';
  let promptLines = [];
  let inPromptBlock = false;

  for (const line of lines) {
    if (!title && line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }
    const taglineMatch = !tagline && line.match(/^\*([^*]+)\*$/);
    if (taglineMatch) {
      tagline = taglineMatch[1].trim();
      continue;
    }
    if (!videoUrl && line.trim().startsWith('https://github.com/user-attachments/assets/')) {
      videoUrl = line.trim();
      continue;
    }
    if (line.startsWith('**Source:**')) {
      sourceRaw = line.slice('**Source:**'.length).trim();
      continue;
    }
    if (line.trim() === '```text') {
      inPromptBlock = true;
      continue;
    }
    if (inPromptBlock && line.trim() === '```') {
      inPromptBlock = false;
      continue;
    }
    if (inPromptBlock) {
      promptLines.push(line);
    }
  }

  return {
    title,
    tagline,
    videoUrl,
    sourceRaw,
    sourceHtml: parseSourceMd(sourceRaw),
    prompt: promptLines.join('\n').trimEnd(),
  };
}

const CSS = `
:root {
  --bg: #0a0a0f;
  --surface: #13131a;
  --surface2: #1c1c26;
  --border: #2a2a3a;
  --gold: #e8c84a;
  --gold-dim: #a8913a;
  --text: #e8e8f0;
  --text-muted: #888899;
  --accent: #6c8aff;
  --radius: 10px;
  --font: 'Inter', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.6;
  min-height: 100vh;
}
a { color: var(--gold); text-decoration: none; }
a:hover { text-decoration: underline; color: #f5db6a; }

/* NAV */
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,15,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
  display: flex; align-items: center; gap: 1rem;
  height: 56px;
}
.nav-brand {
  font-weight: 700; font-size: 1.05rem;
  color: var(--gold); letter-spacing: -0.01em;
  white-space: nowrap;
}
.nav-sep { color: var(--border); }
.nav-crumb { color: var(--text-muted); font-size: 0.9rem; }
.nav-crumb.active { color: var(--text); }
.nav-spacer { flex: 1; }
.nav-badge {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 0.2rem 0.75rem;
  font-size: 0.8rem; color: var(--text-muted);
}

/* HERO */
.hero {
  text-align: center;
  padding: 5rem 2rem 3rem;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,138,255,0.08) 0%, transparent 70%);
}
.hero-tag {
  display: inline-block;
  background: rgba(232,200,74,0.12);
  border: 1px solid rgba(232,200,74,0.3);
  border-radius: 99px;
  padding: 0.3rem 1rem;
  font-size: 0.8rem;
  color: var(--gold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}
.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 1rem;
}
.hero h1 span { color: var(--gold); }
.hero-sub {
  max-width: 560px; margin: 0 auto 2rem;
  color: var(--text-muted); font-size: 1.05rem;
}
.hero-stats {
  display: flex; justify-content: center; gap: 2.5rem;
  flex-wrap: wrap;
}
.stat { text-align: center; }
.stat-num { font-size: 1.8rem; font-weight: 700; color: var(--gold); }
.stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

/* SECTIONS */
.section { padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; }
.section-title {
  font-size: 1.1rem; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 1.5rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.section-title::after {
  content: ''; flex: 1;
  height: 1px; background: var(--border); margin-left: 0.5rem;
}

/* CATEGORY GRID */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.cat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s, transform 0.15s;
  cursor: pointer;
}
.cat-card:hover { border-color: var(--gold-dim); transform: translateY(-2px); }
.cat-card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
.cat-emoji { font-size: 1.4rem; }
.cat-name { font-weight: 600; font-size: 0.95rem; }
.cat-count {
  margin-left: auto;
  background: var(--surface2);
  border-radius: 99px;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem; color: var(--text-muted);
}
.cat-prompts { display: flex; flex-direction: column; gap: 0.3rem; }
.cat-prompt-link {
  font-size: 0.85rem; color: var(--text-muted);
  padding: 0.25rem 0;
  border-bottom: 1px solid transparent;
  transition: color 0.15s;
  display: block;
}
.cat-prompt-link:hover { color: var(--text); text-decoration: none; }

/* CASE CARD GRID */
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.case-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.2s, transform 0.15s;
}
.case-card:hover { border-color: var(--gold-dim); transform: translateY(-2px); }
.case-card-body { padding: 1.25rem; }
.case-card-cat {
  font-size: 0.72rem; color: var(--gold-dim);
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 0.4rem; font-weight: 600;
}
.case-card-title {
  font-size: 0.95rem; font-weight: 600;
  margin-bottom: 0.4rem; line-height: 1.4;
}
.case-card-tag { font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; }

/* CASE PAGE */
.case-layout {
  max-width: 860px; margin: 0 auto; padding: 2.5rem 2rem 4rem;
}
.case-category-badge {
  display: inline-block;
  background: rgba(232,200,74,0.1);
  border: 1px solid rgba(232,200,74,0.25);
  border-radius: 99px; padding: 0.25rem 0.9rem;
  font-size: 0.78rem; color: var(--gold);
  letter-spacing: 0.04em; margin-bottom: 1.2rem;
}
.case-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
.case-tagline { font-size: 1.05rem; color: var(--text-muted); margin-bottom: 1.8rem; }

/* VIDEO */
.video-wrap {
  position: relative; width: 100%;
  background: #000; border-radius: var(--radius);
  overflow: hidden; margin-bottom: 2rem;
  border: 1px solid var(--border);
}
.video-wrap video {
  width: 100%; max-height: 60vh;
  display: block; background: #000;
}
.video-fallback {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px; color: var(--text-muted); font-size: 0.9rem;
  flex-direction: column; gap: 0.75rem;
}
.video-fallback a { color: var(--gold); }

/* SOURCE */
.source-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  font-size: 0.9rem; color: var(--text-muted);
  display: flex; align-items: center; gap: 0.5rem;
}
.source-box svg { flex-shrink: 0; opacity: 0.5; }

/* PROMPT */
.prompt-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem;
}
.prompt-label { font-weight: 600; font-size: 0.95rem; }
.copy-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.9rem;
  color: var(--text-muted);
  font-size: 0.8rem; cursor: pointer;
  transition: all 0.15s; font-family: inherit;
}
.copy-btn:hover { border-color: var(--gold-dim); color: var(--gold); }
.copy-btn.copied { border-color: #4ade80; color: #4ade80; }
.prompt-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  font-family: var(--mono);
  font-size: 0.85rem; line-height: 1.7;
  white-space: pre-wrap; word-break: break-word;
  color: #c8d8e8;
  max-height: 60vh; overflow-y: auto;
  tab-size: 2;
}

/* FOOTER */
footer {
  border-top: 1px solid var(--border);
  text-align: center; padding: 2rem;
  color: var(--text-muted); font-size: 0.85rem;
}
footer a { color: var(--text-muted); }
footer a:hover { color: var(--gold); }

/* RESPONSIVE */
@media (max-width: 640px) {
  .nav { padding: 0 1rem; }
  .hero { padding: 3rem 1rem 2rem; }
  .section { padding: 2rem 1rem; }
  .hero-stats { gap: 1.5rem; }
}
`;

const COPY_SCRIPT = `
function copyPrompt(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}
`;

function htmlHead(title, description, depth = 0) {
  const base = depth === 0 ? '' : '../'.repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#e8c84a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>`;
}

function navBar(crumbs) {
  const parts = crumbs.map((c, i) => {
    if (i === crumbs.length - 1) return `<span class="nav-crumb active">${escapeHtml(c.label)}</span>`;
    return `<a class="nav-crumb" href="${c.href}">${escapeHtml(c.label)}</a>`;
  });
  return `
<nav class="nav">
  <a class="nav-brand" href="/">Seedance Prompts</a>
  <span class="nav-sep">›</span>
  ${parts.join('<span class="nav-sep">›</span>')}
  <span class="nav-spacer"></span>
  <a class="nav-badge" href="https://github.com/gai1680857-prog/awesome-seedance-prompts" target="_blank" rel="noopener">GitHub</a>
</nav>`;
}

function footer() {
  return `
<footer>
  <p>Collected from the community · <a href="https://github.com/gai1680857-prog/awesome-seedance-prompts" target="_blank" rel="noopener">GitHub</a> · MIT License</p>
</footer>`;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function buildCasePage(caseData, allCases) {
  const { slug, catDir, catName, catEmoji, title, tagline, videoUrl, sourceHtml, prompt } = caseData;

  const catCases = allCases.filter(c => c.catDir === catDir);
  const idx = catCases.findIndex(c => c.slug === slug);
  const prev = catCases[idx - 1] || null;
  const next = catCases[idx + 1] || null;

  const videoSection = videoUrl
    ? `<div class="video-wrap">
  <video controls autoplay muted loop playsinline preload="metadata">
    <source src="${videoUrl}">
    <div class="video-fallback">
      <p>Video preview not available in your browser.</p>
      <a href="${videoUrl}" target="_blank" rel="noopener">Open video directly →</a>
    </div>
  </video>
</div>`
    : '';

  const navLinks = [prev, next].filter(Boolean).length > 0
    ? `<div style="display:flex;gap:1rem;margin-top:2.5rem;flex-wrap:wrap;">
${prev ? `<a href="/cases/${prev.slug}" style="flex:1;min-width:200px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1rem;font-size:0.85rem;color:var(--text-muted);display:block;">← ${escapeHtml(prev.title)}</a>` : ''}
${next ? `<a href="/cases/${next.slug}" style="flex:1;min-width:200px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1rem;font-size:0.85rem;color:var(--text-muted);display:block;text-align:right;">${escapeHtml(next.title)} →</a>` : ''}
</div>`
    : '';

  return `${htmlHead(`${title} — Seedance Prompts`, tagline || title, 1)}
${navBar([{ label: 'All Cases', href: '/' }, { label: catEmoji + ' ' + catName, href: `/?cat=${catDir}` }, { label: title }])}
<main class="case-layout">
  <span class="case-category-badge">${escapeHtml(catEmoji + ' ' + catName)}</span>
  <h1 class="case-title">${escapeHtml(title)}</h1>
  ${tagline ? `<p class="case-tagline">${escapeHtml(tagline)}</p>` : ''}
  ${videoSection}
  ${sourceHtml ? `<div class="source-box">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span>${sourceHtml}</span>
  </div>` : ''}
  <div class="prompt-header">
    <span class="prompt-label">Prompt</span>
    <button class="copy-btn" onclick="copyPrompt('prompt-text')">Copy</button>
  </div>
  <pre id="prompt-text" class="prompt-box">${escapeHtml(prompt)}</pre>
  ${navLinks}
</main>
${footer()}
<script>${COPY_SCRIPT}</script>
</body>
</html>`;
}

function buildIndex(allCases) {
  const cats = Object.keys(CATEGORY_NAMES);
  const totalCases = allCases.length;

  const catGrid = cats.map(catDir => {
    const catCases = allCases.filter(c => c.catDir === catDir);
    if (!catCases.length) return '';
    const emoji = CATEGORY_EMOJIS[catDir] || '';
    const name = CATEGORY_NAMES[catDir] || catDir;
    const links = catCases.map(c =>
      `<a class="cat-prompt-link" href="/cases/${c.slug}">${escapeHtml(c.title)}</a>`
    ).join('\n');
    return `<div class="cat-card">
  <div class="cat-card-header">
    <span class="cat-emoji">${emoji}</span>
    <span class="cat-name">${escapeHtml(name)}</span>
    <span class="cat-count">${catCases.length}</span>
  </div>
  <div class="cat-prompts">${links}</div>
</div>`;
  }).filter(Boolean).join('\n');

  const allCaseCards = allCases.map(c => `<a class="case-card" href="/cases/${c.slug}" style="display:block;text-decoration:none;color:inherit;">
  <div class="case-card-body">
    <div class="case-card-cat">${escapeHtml(c.catEmoji + ' ' + c.catName)}</div>
    <div class="case-card-title">${escapeHtml(c.title)}</div>
    ${c.tagline ? `<div class="case-card-tag">${escapeHtml(c.tagline)}</div>` : ''}
  </div>
</a>`).join('\n');

  return `${htmlHead('Awesome Seedance 2.0 Prompts — Case Library', `${totalCases} production-ready Seedance 2.0 video prompts, organized by category.`, 0)}
${navBar([{ label: 'All Cases' }])}
<div class="hero">
  <div class="hero-tag">Seedance 2.0 · Prompt Library</div>
  <h1>Community <span>Case</span> Library</h1>
  <p class="hero-sub">Production-ready prompts with proof clips, clear sourcing, and reusable templates for Seedance 2.0 video generation.</p>
  <div class="hero-stats">
    <div class="stat"><div class="stat-num">${totalCases}</div><div class="stat-label">Prompts</div></div>
    <div class="stat"><div class="stat-num">${cats.filter(c => allCases.some(a => a.catDir === c)).length}</div><div class="stat-label">Categories</div></div>
    <div class="stat"><div class="stat-num">Free</div><div class="stat-label">Open Source</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Browse by Category</div>
  <div class="cat-grid">${catGrid}</div>
</div>
<div class="section">
  <div class="section-title">All Cases</div>
  <div class="case-grid">${allCaseCards}</div>
</div>
${footer()}
</body>
</html>`;
}

function main() {
  ensureDir(OUT_DIR);
  ensureDir(CASES_DIR);

  const allCases = [];

  const catDirs = fs.readdirSync(PROMPTS_DIR)
    .filter(d => fs.statSync(path.join(PROMPTS_DIR, d)).isDirectory())
    .sort();

  for (const catDir of catDirs) {
    const catPath = path.join(PROMPTS_DIR, catDir);
    const catName = CATEGORY_NAMES[catDir] || catDir;
    const catEmoji = CATEGORY_EMOJIS[catDir] || '';

    const files = fs.readdirSync(catPath)
      .filter(f => f.endsWith('.md') && f !== 'README.md')
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(catPath, file), 'utf8');
      const parsed = parseMarkdown(content);
      if (!parsed.title) continue;

      const slug = slugify(file);
      allCases.push({ slug, catDir, catName, catEmoji, ...parsed });
    }
  }

  for (const caseData of allCases) {
    const html = buildCasePage(caseData, allCases);
    fs.writeFileSync(path.join(CASES_DIR, `${caseData.slug}.html`), html, 'utf8');
    console.log(`  ✓ cases/${caseData.slug}.html`);
  }

  const indexHtml = buildIndex(allCases);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`  ✓ index.html`);

  // _redirects for Cloudflare Pages clean URLs
  const redirects = allCases.map(c => `/cases/${c.slug}  /cases/${c.slug}.html  200`).join('\n');
  fs.writeFileSync(path.join(OUT_DIR, '_redirects'), redirects + '\n', 'utf8');
  console.log(`  ✓ _redirects`);

  console.log(`\nBuilt ${allCases.length} case pages → dist/`);
}

main();
