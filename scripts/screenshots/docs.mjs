// docs/gallery.html (self-contained, works offline from a checkout) and docs/SCREENSHOTS.md, both
// grouped by role with captions from docs/screenshots/manifest.json
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './stack.mjs';

const GROUPS = [
  ['01-public', 'Public pages'],
  ['02-student', 'Student'],
  ['03-librarian', 'Librarian'],
  ['04-admin', 'Admin'],
  ['05-mobile', 'On a phone'],
];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function writeDocs({ log = console.log } = {}) {
  const { screens, generatedAt } = JSON.parse(readFileSync(path.join(ROOT, 'docs', 'screenshots', 'manifest.json'), 'utf8'));
  const grouped = GROUPS.map(([key, title]) => [key, title, screens.filter((s) => s.file.startsWith(`${key}/`))]).filter(([, , list]) => list.length);

  // ---- Markdown (GitHub)
  const md = [
    '# LibVerse screenshots',
    '',
    `All screens with demo data (fictional members, \`@example.com\` addresses). Generated ${generatedAt} by \`node scripts/screenshots/run.mjs\` (WebP; the full-size PNGs are not committed).`,
    'Desktop shots are 1440×900 at 2×, phone shots 390×844 at 2×. For a browsable version with a lightbox, open [`docs/gallery.html`](gallery.html) locally.',
    '',
    ...grouped.map(([key, title]) => `- [${title}](#${title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '-')})`),
    '',
  ];
  for (const [, title, list] of grouped) {
    md.push(`## ${title}`, '');
    if (title === 'On a phone') {
      md.push('<p>', ...list.map((s) => `  <img src="screenshots/${s.file}" alt="${esc(s.page)}: ${esc(s.caption)}" width="240">`), '</p>', '');
      list.forEach((s) => md.push(`- **${s.page}**: ${s.caption}`));
      md.push('');
    } else {
      list.forEach((s) => md.push(`### ${s.page}`, '', s.caption, '', `![${s.page}](screenshots/${s.file})`, ''));
    }
  }
  writeFileSync(path.join(ROOT, 'docs', 'SCREENSHOTS.md'), `${md.join('\n')}\n`);

  // ---- Gallery (one file, no network; images are the files next to it)
  const sections = grouped.map(([key, title, list]) => `
    <section aria-labelledby="g-${key}">
      <h2 id="g-${key}">${esc(title)} <span>${list.length}</span></h2>
      <ul class="grid${key === '05-mobile' ? ' phones' : ''}">
        ${list.map((s) => `<li><button type="button" data-full="screenshots/${esc(s.file)}" data-caption="${esc(s.page)}: ${esc(s.caption)}">
          <img loading="lazy" src="screenshots/${esc(s.file)}" alt="${esc(s.page)}"><span class="cap"><b>${esc(s.page)}</b>${esc(s.caption)}</span></button></li>`).join('')}
      </ul>
    </section>`).join('');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>LibVerse gallery</title>
<style>
:root{--bg:#050816;--panel:#111827;--line:rgba(255,255,255,.1);--text:#F8FAFC;--muted:#CBD5E1;--accent:#67E8F9;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#050816,#0B1120) fixed;color:var(--text);font:16px/1.5 Inter,'Segoe UI',system-ui,sans-serif}
header{padding:40px 16px 8px;max-width:1280px;margin:auto}h1{margin:0;font-size:32px;letter-spacing:-.02em}h1 b{color:var(--accent)}
header p{color:var(--muted);margin:6px 0 0}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
nav a{color:var(--text);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 14px;background:#0f1530}nav a:hover,nav a:focus-visible{border-color:var(--accent)}
main{max-width:1280px;margin:auto;padding:8px 16px 64px}h2{font-size:22px;margin:36px 0 14px}h2 span{color:var(--muted);font-weight:500;font-size:15px}
.grid{list-style:none;margin:0;padding:0;display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))}
.grid.phones{grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr))}
.grid button{all:unset;cursor:zoom-in;display:block;width:100%;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--panel);transition:border-color .15s,transform .15s}
.grid button:hover,.grid button:focus-visible{border-color:var(--accent);transform:translateY(-2px)}
.grid img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;object-position:top left;background:#0B1120}.phones img{aspect-ratio:390/844}
.cap{display:block;padding:10px 14px 14px;color:var(--muted);font-size:14px}.cap b{display:block;color:var(--text);font-size:15px;margin-bottom:2px}
dialog{border:0;padding:0;background:transparent;max-width:min(96vw,1600px);max-height:96vh;color:var(--text)}dialog::backdrop{background:rgba(2,4,12,.88)}
dialog img{display:block;max-width:100%;max-height:84vh;margin:auto;border-radius:10px;border:1px solid var(--line)}
dialog p{margin:10px 0 0;text-align:center;color:var(--muted)}dialog .bar{display:flex;justify-content:center;gap:10px;margin-top:10px}
dialog button{background:#151a33;color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font:inherit;cursor:pointer}dialog button:focus-visible{outline:2px solid var(--accent)}
</style></head>
<body>
<header><h1>Lib<b>Verse</b> gallery</h1><p>Every screen with demo data (fictional members). Generated ${esc(generatedAt)}. Click a screen to enlarge; arrow keys move, Esc closes.</p>
<nav aria-label="Sections">${grouped.map(([key, title]) => `<a href="#g-${key}">${esc(title)}</a>`).join('')}</nav></header>
<main>${sections}</main>
<dialog id="lb" aria-label="Screenshot"><img alt=""><p></p><div class="bar"><button type="button" data-step="-1">← Previous</button><button type="button" data-close>Close</button><button type="button" data-step="1">Next →</button></div></dialog>
<script>
const items=[...document.querySelectorAll('.grid button')];const lb=document.getElementById('lb');const img=lb.querySelector('img');const cap=lb.querySelector('p');let at=0;
const show=(i)=>{at=(i+items.length)%items.length;const b=items[at];img.src=b.dataset.full;img.alt=b.dataset.caption;cap.textContent=b.dataset.caption;if(!lb.open)lb.showModal();};
items.forEach((b,i)=>b.addEventListener('click',()=>show(i)));
lb.addEventListener('click',(e)=>{if(e.target===lb||e.target.hasAttribute('data-close'))lb.close();const s=e.target.dataset.step;if(s)show(at+Number(s));});
lb.addEventListener('keydown',(e)=>{if(e.key==='ArrowRight')show(at+1);if(e.key==='ArrowLeft')show(at-1);});
lb.addEventListener('close',()=>items[at].focus());
</script>
</body></html>
`;
  writeFileSync(path.join(ROOT, 'docs', 'gallery.html'), html);
  log(`Wrote docs/gallery.html and docs/SCREENSHOTS.md (${screens.length} screens)`);
}
