#!/usr/bin/env node
/**
 * Re-capture the screens that show the AI "Picked for you" badges from the LIVE demo site, for when the
 * local stack cannot run the AI service (e.g. Windows blocks numpy). Uses the "View as Student" button,
 * waits for the demo API to wake (up to ~2 minutes) and for the AI badge, then overwrites
 *   docs/screenshots/02-student/01-dashboard.webp   (1440x900 @2x)
 *   docs/screenshots/05-mobile/02-student-dashboard.webp   (390x844 @2x, scrolled to "Picked for you")
 * and adds docs/screenshots/02-student/17-picked-for-you.webp (1440x900 @2x, scrolled to "Picked for you":
 * AI badges and "Because you read..." reasons) to manifest.json.
 * and their PNG frames in docs/.screenshots-png/. Demo data only; it stops with an error rather than
 * save a screenshot without the AI badge.
 *
 *   node scripts/screenshots/live.mjs [https://libverse-demo.vercel.app]
 * Then: node scripts/screenshots/run.mjs --showcase-only   (re-renders the showcase and docs)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, sleep } from './browser.mjs';
import { ROOT } from './stack.mjs';

const SITE = (process.argv[2] || 'https://libverse-demo.vercel.app').replace(/\/+$/, '');
const sharp = createRequire(path.join(ROOT, 'backend', 'package.json'))('sharp');
const SHOTS = path.join(ROOT, 'docs', 'screenshots');
const PNGS = path.join(ROOT, 'docs', '.screenshots-png');

const waitFor = async (browser, expr, ms) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try { if (await browser.evaluate(expr)) return true; } catch { /* navigating */ }
    await sleep(500);
  }
  return false;
};

// The "✦ AI" badges on the Picked for you covers (BookCard: aiPick)
const AI_BADGES = "document.querySelectorAll('.glass-pill--ai').length";

// AI badges whose box is inside the current viewport (so they are in the screenshot)
const visibleBadges = () => browser.evaluate("[...document.querySelectorAll('.glass-pill--ai')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }).length");

const SCROLL_TO_DISCOVER = "(() => { const h = [...document.querySelectorAll('h2, h3')].find((e) => e.textContent.trim() === 'Discover'); const m = document.querySelector('main'); window.scrollTo(0, 0); if (h && m) m.scrollTop += h.getBoundingClientRect().top - m.getBoundingClientRect().top - 8; return !!h; })()";

const addToManifest = (entry) => {
  const file = path.join(SHOTS, 'manifest.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  manifest.screens = manifest.screens.filter((x) => x.file !== entry.file).concat(entry).sort((a, b) => a.file.localeCompare(b.file));
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}
`);
};

const save = async (browser, group, file) => {
  const png = path.join(PNGS, group, `${file}.png`);
  const webp = path.join(SHOTS, group, `${file}.webp`);
  mkdirSync(path.dirname(png), { recursive: true });
  mkdirSync(path.dirname(webp), { recursive: true });
  await browser.shot(png);
  await sharp(png).webp({ quality: 88 }).toFile(webp);
  console.log(`  saved ${group}/${file}`);
};

const browser = await launch({ port: 9353 });
try {
  await browser.viewport(1440, 900, { scale: 2, mobile: false });
  await browser.goto(`${SITE}/login`);
  await browser.evaluate("sessionStorage.setItem('libverse:splash-shown', '1'); localStorage.clear(); true");
  await browser.goto(`${SITE}/login`);
  console.log('Waiting for the demo site and its API to be ready ...');
  if (!await waitFor(browser, "!![...document.querySelectorAll('button')].find((b) => b.innerText.includes('View as Student'))", 150000)) {
    throw new Error('The role picker did not appear (is the demo API awake?)');
  }
  await browser.evaluate("[...document.querySelectorAll('button')].find((b) => b.innerText.includes('View as Student')).click()");
  if (!await waitFor(browser, "location.pathname === '/student/dashboard'", 60000)) throw new Error('Did not reach the student dashboard');

  // Picked for you needs the AI service on the demo API (it may be waking too)
  let badges = 0;
  for (let attempt = 0; attempt < 6 && badges === 0; attempt++) {
    if (attempt) { await browser.goto(`${SITE}/student/dashboard`); }
    await waitFor(browser, `${AI_BADGES} > 0`, 45000);
    badges = await browser.evaluate(AI_BADGES);
  }
  if (badges === 0) throw new Error('No AI badge on the live demo dashboard: not saving a screenshot without it');
  await browser.imagesSettled(15000);
  await sleep(2500);
  if (await visibleBadges() === 0) throw new Error('The AI badges are below the fold in the desktop screenshot: not saving');
  const visible = await browser.evaluate("document.body.innerText");
  const emails = (visible.match(/[\\w.+-]+@[\\w.-]+\\.\\w+/g) || []).filter((e) => !/@example\\.com$/i.test(e));
  if (emails.length) throw new Error(`Non-example email addresses visible (${emails.length}): not saving`);
  console.log(`AI badges visible: ${badges}`);
  await save(browser, '02-student', '01-dashboard');

  // The same page scrolled to the AI picks (only the main panel scrolls)
  await browser.evaluate(SCROLL_TO_DISCOVER);
  await sleep(1500);
  await browser.imagesSettled(15000);
  if (await visibleBadges() < 3) throw new Error('Fewer than 3 AI badges visible in the AI picks screenshot: not saving');
  await save(browser, '02-student', '17-picked-for-you');
  addToManifest({
    file: '02-student/17-picked-for-you.webp', role: 'student', page: 'AI picks (Picked for you)', viewport: '1440x900@2x',
    caption: 'Picked for you: books chosen by the recommendation service, marked AI, with the reason ("Because you read ...").',
  });

  await browser.viewport(390, 844, { scale: 2, mobile: true });
  await browser.goto(`${SITE}/student/dashboard`);
  await waitFor(browser, `${AI_BADGES} > 0`, 45000);
  await browser.imagesSettled(15000);
  await sleep(1500);
  // On a phone "Picked for you" is below the fold: scroll the Discover section to the top of the page
  // (the demo banner and header stay), so the AI badges are in the picture
  // (only the main panel scrolls; the page itself stays at the top)
  await browser.evaluate(SCROLL_TO_DISCOVER);
  await sleep(1500);
  if (await visibleBadges() === 0) throw new Error('No AI badge visible in the phone screenshot: not saving');
  await save(browser, '05-mobile', '02-student-dashboard');
} finally {
  await browser.close();
}
