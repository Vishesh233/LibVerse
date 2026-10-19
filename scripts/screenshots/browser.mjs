// Minimal headless Edge/Chrome driver over the DevTools protocol (Node 22+ global WebSocket; no dependencies)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CANDIDATES = [
  process.env.EDGE_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export const findBrowser = () => {
  const found = CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('No Edge or Chrome found. Set EDGE_PATH to the browser executable.');
  return found;
};

/** Start a headless browser; returns page helpers */
export async function launch({ port = 9351 } = {}) {
  const profile = mkdtempSync(path.join(os.tmpdir(), 'libverse-shots-profile-'));
  const proc = spawn(findBrowser(), [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb',
    '--allow-file-access-from-files', 'about:blank',
  ], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
    } catch { /* starting */ }
    if (!target) await sleep(250);
  }
  if (!target) throw new Error('The browser did not start');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method) listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  const errors = [];
  listeners.add((m) => {
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  });

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const viewport = (width, height, { scale = 1, mobile = false } = {}) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
  const goto = async (url) => {
    const loaded = new Promise((resolve) => {
      const l = (m) => { if (m.method === 'Page.loadEventFired') { listeners.delete(l); resolve(); } };
      listeners.add(l);
    });
    await send('Page.navigate', { url });
    await Promise.race([loaded, sleep(20000)]);
  };
  /** Start loading a page without waiting for it (for timed shots such as the splash) */
  const navigate = (url) => send('Page.navigate', { url });
  /** Wait until every image on the page has finished (or ms passes) */
  const imagesSettled = async (ms = 10000) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (await evaluate("[...document.images].every((i) => i.complete)")) return true;
      await sleep(200);
    }
    return false;
  };
  const shot = async (file, format = 'png') => {
    mkdirSync(path.dirname(file), { recursive: true });
    const r = await send('Page.captureScreenshot', format === 'webp' ? { format: 'webp', quality: 88 } : { format: 'png' });
    writeFileSync(file, Buffer.from(r.data, 'base64'));
  };
  const pdf = async (file, { widthPx, heightPx }) => {
    const r = await send('Page.printToPDF', {
      printBackground: true, preferCSSPageSize: true, paperWidth: widthPx / 96, paperHeight: heightPx / 96,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    });
    writeFileSync(file, Buffer.from(r.data, 'base64'));
  };
  const close = async () => {
    try { await send('Browser.close'); } catch { /* already closed */ }
    ws.close();
    proc.kill();
    await sleep(500);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* still locked: the OS cleans temp */ }
  };
  return { send, evaluate, viewport, goto, navigate, imagesSettled, shot, pdf, close, errors };
}
