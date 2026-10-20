// Showcase images in docs/showcase/, rendered from HTML layouts with headless Edge (no dependencies):
// readme-hero.png 1600x900, linkedin-post-1200x627.png, linkedin-carousel/slide-NN.png 1080x1080 + carousel.pdf,
// linkedin-banner-1584x396.png, resume-thumbnail.png 800x500. Every text element is checked for >= 4.5:1 contrast.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sleep } from './browser.mjs';
import { ROOT } from './stack.mjs';

const OUT = path.join(ROOT, 'docs', 'showcase');
// The source frames are the full-size PNGs from the capture step (docs/.screenshots-png/, not committed)
const SHOT = (file) => pathToFileURL(path.join(ROOT, 'docs', '.screenshots-png', file)).href;

const BOOK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4.5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>';
const logo = (size) => `<div class="logo" style="--s:${size}px"><div class="tile">${BOOK_ICON}</div><span class="word">Lib<b>Verse</b></span></div>`;

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap">';
const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--w);height:var(--h);overflow:hidden;background:#050816}
body{font-family:Inter,'Segoe UI',system-ui,sans-serif;color:#F8FAFC;position:relative;
 background:radial-gradient(circle at 12% 18%,rgba(99,102,241,.32),transparent 42%),radial-gradient(circle at 88% 85%,rgba(124,58,237,.28),transparent 45%),
 radial-gradient(circle at 70% 10%,rgba(34,211,238,.10),transparent 35%),linear-gradient(180deg,#050816,#0B1120)}
body::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(circle at 50% 40%,#000,transparent 75%)}
.logo{display:flex;align-items:center;gap:calc(var(--s)*.32)}
.tile{width:var(--s);height:var(--s);border-radius:calc(var(--s)*.3);display:grid;place-items:center;background:linear-gradient(160deg,#262a38,#12141e);border:1px solid rgba(255,255,255,.14);box-shadow:0 0 calc(var(--s)*.5) rgba(34,211,238,.25)}
.tile svg{width:55%;height:55%;filter:drop-shadow(0 0 6px rgba(34,211,238,.5))}
.word{font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:calc(var(--s)*.78);letter-spacing:-.02em;color:#F8FAFC}
.word b{color:#67E8F9;font-weight:700}
h1,h2,h3{font-family:'Space Grotesk',Inter,sans-serif;letter-spacing:-.02em;line-height:1.08}
.muted{color:#CBD5E1}
.accent{color:#67E8F9}
.chip{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:#151a33;border:1px solid rgba(165,180,252,.35);color:#E0E7FF;font-weight:600}
.shot{position:absolute;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.4);background:#0B1120}
.shot img{display:block;width:100%;height:100%;object-fit:cover;object-position:top left}
.phone{border-radius:28px;border:6px solid #1c2236}
.dot{width:8px;height:8px;border-radius:50%;background:#22D3EE;display:inline-block}
`;

const page = (w, h, body, css = '') => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>:root{--w:${w}px;--h:${h}px}${BASE_CSS}${css}</style></head><body>${body}</body></html>`;
const shot = (file, style, cls = '') => `<div class="shot ${cls}" style="${style}"><img src="${SHOT(file)}"></div>`;

// ---- Layouts
const hero = () => page(1600, 900, `
  <div style="position:absolute;left:96px;top:120px;width:560px">
    ${logo(64)}
    <h1 style="font-size:54px;margin-top:44px">Smart Library<br>Management System</h1>
    <p class="muted" style="font-size:22px;line-height:1.5;margin-top:22px">Borrowing, returns, fines, reservations, QR library cards and AI picks for students, librarians and admins.</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:34px;font-size:17px">
      <span class="chip"><span class="dot"></span>React + Vite</span><span class="chip"><span class="dot"></span>Node + MongoDB</span><span class="chip"><span class="dot"></span>Python TF-IDF</span>
    </div>
  </div>
  <div style="position:absolute;left:640px;top:-40px;width:1100px;height:1000px;transform:perspective(2200px) rotateY(-16deg) rotateX(8deg) rotateZ(-4deg);transform-origin:left center">
    ${shot('03-librarian/01-dashboard.png', 'left:260px;top:40px;width:720px;height:450px')}
    ${shot('04-admin/02-analytics.png', 'left:420px;top:520px;width:640px;height:400px')}
    ${shot('02-student/01-dashboard.png', 'left:40px;top:300px;width:700px;height:437px')}
    ${shot('02-student/03-book-details.png', 'left:-40px;top:640px;width:520px;height:325px')}
    ${shot('05-mobile/02-student-dashboard.png', 'left:840px;top:180px;width:190px;height:411px', 'phone')}
  </div>`);

const post = () => page(1200, 627, `
  <div style="position:absolute;left:64px;top:64px;width:500px">
    ${logo(48)}
    <h1 style="font-size:44px;margin-top:34px">LibVerse — Smart Library Management System</h1>
    <ul style="list-style:none;margin-top:28px;display:grid;gap:12px;font-size:19px;font-weight:600">
      ${['Student, librarian and admin portals', 'QR library cards and a scan desk', 'Fines with UPI receipts and waivers', 'AI recommendations with reasons'].map((t) => `<li style="display:flex;align-items:center;gap:12px"><span class="dot"></span><span>${t}</span></li>`).join('')}
    </ul>
  </div>
  <div style="position:absolute;left:560px;top:-30px;width:720px;height:700px;transform:perspective(1800px) rotateY(-18deg) rotateX(6deg) rotateZ(-3deg);transform-origin:left center">
    ${shot('03-librarian/01-dashboard.png', 'left:120px;top:60px;width:560px;height:350px')}
    ${shot('02-student/01-dashboard.png', 'left:20px;top:300px;width:540px;height:337px')}
    ${shot('05-mobile/05-library-card.png', 'left:520px;top:330px;width:150px;height:325px', 'phone')}
  </div>`);

const banner = () => page(1584, 396, `
  <div style="position:absolute;left:72px;top:96px;width:560px">
    ${logo(56)}
    <p style="font-size:26px;font-weight:600;margin-top:26px">Smart Library Management System</p>
    <p class="muted" style="font-size:19px;margin-top:10px">React · Node.js · MongoDB · Python</p>
  </div>
  <div style="position:absolute;left:660px;top:-60px;width:1000px;height:540px;transform:perspective(1800px) rotateY(-14deg) rotateZ(-5deg);transform-origin:left center">
    ${shot('02-student/01-dashboard.png', 'left:0;top:110px;width:420px;height:262px')}
    ${shot('03-librarian/01-dashboard.png', 'left:300px;top:40px;width:440px;height:275px')}
    ${shot('04-admin/02-analytics.png', 'left:560px;top:200px;width:420px;height:262px')}
  </div>`);

const thumb = () => page(800, 500, `
  <div style="position:absolute;left:44px;top:48px">${logo(40)}</div>
  <p style="position:absolute;left:44px;top:110px;font-size:20px;font-weight:600">Smart Library Management System</p>
  <div style="position:absolute;left:150px;top:150px;width:700px;height:420px;transform:perspective(1600px) rotateY(-14deg) rotateX(8deg) rotateZ(-3deg);transform-origin:left center">
    ${shot('03-librarian/01-dashboard.png', 'left:60px;top:20px;width:560px;height:350px')}
    ${shot('02-student/01-dashboard.png', 'left:-90px;top:150px;width:420px;height:262px')}
  </div>`);

const SLIDES = [
  { kind: 'cover' },
  { title: 'Students find, borrow and track books', shot: '02-student/01-dashboard.png', bullets: ['Dashboard with due dates, fines and what is ready to collect', '500+ books with search and filters', 'Request, renew and return in a tap'] },
  { title: 'AI picks that explain themselves', shot: '02-student/03-book-details.png', bullets: ['TF-IDF over titles, authors, genres and descriptions', '"Because you read…" reasons on every pick', 'Falls back to genre picks if the AI service is down'] },
  { title: 'Fines without the paperwork', shot: '02-student/10-pay-fine.png', bullets: ['₹5 a day, worked out automatically', 'Pay by UPI QR and upload the receipt', 'Librarians verify or waive with a reason'] },
  { title: 'A control room for librarians', shot: '03-librarian/01-dashboard.png', bullets: ['Requests, overdue and due-today at a glance', 'Approve issues and returns in one place', '14-day activity trend'] },
  { title: 'QR library cards and a scan desk', shot: '02-student/15-library-card-front.png', bullets: ['Signed QR card per member, reissuable', 'Scan card + book to issue or return', 'Printable QR shelf labels'] },
  { title: 'Catalogue tools that scale', shot: '03-librarian/09-manage-books.png', bullets: ['Sortable table with stock at a glance', 'Low-stock filter and bulk actions', 'CSV import with a row-by-row preview'] },
  { title: 'Reports, analytics and an audit log', shot: '04-admin/03-reports-loans.png', bullets: ['Loans, fines, overdue and top books', 'Staff activity from the audit log', 'CSV export and print'] },
  { title: 'Sign in your way', shot: '01-public/05-login-email-code.png', bullets: ['Email and password, or one click with Google', 'Passwordless: a 6-digit code by email', 'Sign-up confirms your email with a code'] },
  { kind: 'stack' },
  { kind: 'close' },
];

const slide = (s, i) => {
  const n = `<p style="position:absolute;right:56px;bottom:44px;font-size:20px;font-weight:600" class="muted">${i + 1} / ${SLIDES.length}</p>`;
  if (s.kind === 'cover') {
    return page(1080, 1080, `
      <div style="position:absolute;left:80px;top:96px;width:920px">
        ${logo(72)}
        <h1 style="font-size:76px;margin-top:56px">Smart Library<br>Management System</h1>
        <p class="muted" style="font-size:28px;line-height:1.45;margin-top:26px">One app for students, librarians and admins: borrowing, fines, reservations, QR cards and AI picks.</p>
      </div>
      <div style="position:absolute;left:140px;top:610px;width:1000px;height:520px;transform:perspective(1800px) rotateY(-14deg) rotateX(10deg) rotateZ(-4deg);transform-origin:left center">
        ${shot('03-librarian/01-dashboard.png', 'left:160px;top:0;width:700px;height:437px')}
        ${shot('02-student/01-dashboard.png', 'left:0;top:170px;width:620px;height:387px')}
      </div>
      <p style="position:absolute;right:56px;bottom:44px;font-size:22px;font-weight:600;color:#E0E7FF">Swipe →</p>`);
  }
  if (s.kind === 'stack') {
    const groups = [
      ['Frontend', 'React 18, Vite, Tailwind CSS, ECharts, code-split routes'],
      ['Backend', 'Node.js, Express, MongoDB with Mongoose, GridFS uploads'],
      ['AI service', 'Python, Flask, scikit-learn TF-IDF with explanations'],
      ['Security', 'helmet CSP, rate limits, JWT sessions ended on password change'],
      ['Quality', 'Jest + Supertest, pytest, GitHub Actions CI'],
      ['Deploy', 'Vercel, Render, MongoDB Atlas, Brevo email, GitHub Actions'],
    ];
    return page(1080, 1080, `
      <div style="position:absolute;left:80px;top:90px;width:920px">
        ${logo(48)}
        <h2 style="font-size:60px;margin-top:44px">Tech stack</h2>
        <div style="display:grid;gap:18px;margin-top:40px">
          ${groups.map(([k, v]) => `<div style="padding:22px 26px;border-radius:20px;background:#10152b;border:1px solid rgba(165,180,252,.25)"><p class="accent" style="font-size:21px;font-weight:700">${k}</p><p style="font-size:24px;margin-top:6px;color:#E2E8F0">${v}</p></div>`).join('')}
        </div>
      </div>${n}`);
  }
  if (s.kind === 'close') {
    return page(1080, 1080, `
      <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">
        <div style="width:860px;display:grid;justify-items:center">
          ${logo(80)}
          <h2 style="font-size:64px;margin-top:56px">Thanks for reading</h2>
          <p class="muted" style="font-size:28px;line-height:1.5;margin-top:24px">LibVerse is open source. The code, tests, screenshots and a step-by-step deployment guide are on GitHub (link in the post).</p>
          <p style="font-size:26px;font-weight:600;margin-top:30px;color:#E0E7FF">Live demo, no sign-up: lib-verse.vercel.app/demo</p>
          <div style="display:flex;gap:14px;margin-top:44px;font-size:21px"><span class="chip">React</span><span class="chip">Node.js</span><span class="chip">MongoDB</span><span class="chip">Python</span></div>
        </div>
      </div>${n}`);
  }
  return page(1080, 1080, `
    <div style="position:absolute;left:80px;top:80px;width:920px">
      ${logo(40)}
      <h2 style="font-size:58px;margin-top:40px">${s.title}</h2>
      <ul style="list-style:none;margin-top:30px;display:grid;gap:14px;font-size:26px">
        ${s.bullets.map((b) => `<li style="display:flex;gap:16px;align-items:baseline"><span class="dot" style="flex:none;transform:translateY(-4px)"></span><span style="color:#E2E8F0">${b}</span></li>`).join('')}
      </ul>
    </div>
    ${shot(s.shot, 'left:80px;top:560px;width:920px;height:575px;transform:perspective(1600px) rotateX(10deg);transform-origin:top center')}
    ${n.replace('bottom:44px', 'top:84px')}`);
};

// ---- Contrast: every element with its own text, against the composed background behind it
const CONTRAST_CHECK = `(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  // The lightest the page background gets (its strongest glow on the base colour)
  const page = over({ r: 99, g: 102, b: 241, a: 0.32 }, { r: 11, g: 17, b: 32, a: 1 });
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('.shot')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const chain = []; for (let p = el; p && p !== document.documentElement; p = p.parentElement) chain.push(p);
    let bg = page;
    for (const p of chain.reverse()) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c.a > 0) bg = over(c, bg); }
    const fg = parse(getComputedStyle(el).color);
    const r = ratio(fg, bg);
    if (r < 4.5) out.push(el.textContent.trim().slice(0, 40) + ' (' + r.toFixed(2) + ':1)');
  }
  return out;
})()`;

export async function renderShowcase(browser, { log = console.log } = {}) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(path.join(OUT, 'linkedin-carousel'), { recursive: true });
  const tmp = path.join(os.tmpdir(), 'libverse-showcase');
  mkdirSync(tmp, { recursive: true });
  const problems = [];

  const render = async (name, html, w, h, outFile) => {
    const file = path.join(tmp, `${name}.html`);
    writeFileSync(file, html);
    await browser.viewport(w, h, { scale: 1 });
    await browser.goto(pathToFileURL(file).href);
    await browser.evaluate('document.fonts.ready.then(() => true)');
    await browser.imagesSettled(15000);
    await sleep(300);
    const low = await browser.evaluate(CONTRAST_CHECK);
    low.forEach((t) => problems.push(`${name}: low contrast "${t}"`));
    const broken = await browser.evaluate('[...document.images].filter((i) => !i.naturalWidth).map((i) => i.src.split("/").slice(-2).join("/"))');
    broken.forEach((src) => problems.push(`${name}: missing image ${src}`));
    await browser.shot(outFile);
    log(`  ${path.relative(ROOT, outFile)}`);
  };

  await render('readme-hero', hero(), 1600, 900, path.join(OUT, 'readme-hero.png'));
  await render('linkedin-post', post(), 1200, 627, path.join(OUT, 'linkedin-post-1200x627.png'));
  await render('linkedin-banner', banner(), 1584, 396, path.join(OUT, 'linkedin-banner-1584x396.png'));
  await render('resume-thumbnail', thumb(), 800, 500, path.join(OUT, 'resume-thumbnail.png'));
  const slideFiles = [];
  for (const [i, s] of SLIDES.entries()) {
    const out = path.join(OUT, 'linkedin-carousel', `slide-${String(i + 1).padStart(2, '0')}.png`);
    await render(`slide-${i + 1}`, slide(s, i), 1080, 1080, out);
    slideFiles.push(out);
  }

  // carousel.pdf: one 1080x1080 page per slide, in order
  const pdfHtml = path.join(tmp, 'carousel.html');
  writeFileSync(pdfHtml, `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:1080px 1080px;margin:0}*{margin:0;padding:0}html,body{background:#050816}
    img{display:block;width:1080px;height:1080px;page-break-after:always;break-after:page}img:last-child{page-break-after:auto;break-after:auto}</style></head>
    <body>${slideFiles.map((f) => `<img src="${pathToFileURL(f).href}">`).join('')}</body></html>`);
  await browser.viewport(1080, 1080, { scale: 1 });
  await browser.goto(pathToFileURL(pdfHtml).href);
  await browser.imagesSettled(15000);
  await browser.pdf(path.join(OUT, 'linkedin-carousel', 'carousel.pdf'), { widthPx: 1080, heightPx: 1080 });
  log(`  ${path.relative(ROOT, path.join(OUT, 'linkedin-carousel', 'carousel.pdf'))}`);
  rmSync(tmp, { recursive: true, force: true });
  return problems;
}
