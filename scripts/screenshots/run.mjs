#!/usr/bin/env node
/**
 * One command for every image in docs/:
 *   node scripts/screenshots/run.mjs
 *
 * 1. seeds the demo database libverse_demo (backend/scripts/seedDemo.js; never libraryDB)
 * 2. builds the frontend and starts the API (+ AI service if ai-service/venv exists) on spare ports
 * 3. captures every screen per role into docs/screenshots/ (PNG + WebP) and manifest.json
 * 4. renders the showcase images in docs/showcase/ from HTML layouts
 * 5. writes docs/gallery.html and docs/SCREENSHOTS.md from the manifest
 * 6. stops everything and drops libverse_demo
 *
 * Options: --showcase-only (steps 4-5 from the existing screenshots), --keep-demo (do not drop the demo DB)
 * The student dashboard shots (with the AI "Picked for you" badges) can instead be re-captured from the live demo
 * with `node scripts/screenshots/live.mjs` (when the AI service cannot run locally), then `run.mjs --showcase-only`.
 * Needs: MongoDB on 127.0.0.1:27017 (or DEMO_MONGODB_URI), Node 22+, Edge or Chrome (EDGE_PATH to override),
 * npm install done in backend/ and frontend/.
 */
import { launch } from './browser.mjs';
import { startStack, stopStack } from './stack.mjs';
import { capture } from './capture.mjs';
import { renderShowcase } from './showcase.mjs';
import { writeDocs } from './docs.mjs';

const args = new Set(process.argv.slice(2));
const log = (m) => console.log(m);

const main = async () => {
  const started = Date.now();
  let problems = [];
  if (!args.has('--showcase-only')) {
    let browser;
    try {
      const { demo, ai } = await startStack({ log });
      log(`Demo data: ${demo.books} books, ${demo.members} members, ${demo.loans.issued} on loan; AI service: ${ai ? 'on' : 'off'}`);
      browser = await launch();
      log('Capturing screens ...');
      ({ problems } = await capture(browser, { demo, log }));
    } finally {
      await browser?.close();
      await stopStack({ dropDemo: !args.has('--keep-demo') });
    }
  }
  const browser = await launch({ port: 9352 });
  try {
    log('Rendering showcase images ...');
    problems.push(...await renderShowcase(browser, { log }));
  } finally {
    await browser.close();
  }
  writeDocs({ log });
  log(`Done in ${Math.round((Date.now() - started) / 1000)} s.`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
