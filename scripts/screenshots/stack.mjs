// Runs LibVerse on the demo database for screenshots: seed libverse_demo, build the frontend for
// these ports, start the AI service (when ai-service/venv exists), the API and a static preview.
// Ports are chosen away from the usual dev ports (3000 / 5001 / 5000) so a running dev setup is untouched.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { sleep } from './browser.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(path.join(ROOT, 'backend', 'package.json'));
const PORTS = { api: 5091, app: 4191, ai: 5092 };
export const APP = `http://localhost:${PORTS.app}`;
export const API = `http://localhost:${PORTS.api}/api`;
const DEMO_URI = process.env.DEMO_MONGODB_URI || 'mongodb://127.0.0.1:27017/libverse_demo';

const procs = [];
const logs = {};
const start = (name, cmd, args, opts) => {
  const p = spawn(cmd, args, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] });
  logs[name] = '';
  p.stdout.on('data', (d) => { logs[name] += d; });
  p.stderr.on('data', (d) => { logs[name] += d; });
  procs.push(p);
  return p;
};
const waitUp = async (url, name) => {
  for (let i = 0; i < 160; i++) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* not yet */ }
    await sleep(250);
  }
  throw new Error(`${name} did not start (${url}):\n${(logs[name] || '').slice(-1500)}`);
};
const portBusy = async (port) => {
  try { await fetch(`http://127.0.0.1:${port}/`); return true; } catch { return false; }
};

export async function startStack({ log = console.log } = {}) {
  for (const [name, port] of Object.entries(PORTS)) {
    if (await portBusy(port)) throw new Error(`Port ${port} (${name}) is already in use. Stop that process and try again.`);
  }
  const { seedDemo } = require(path.join(ROOT, 'backend', 'scripts', 'seedDemo.js'));
  log('Seeding libverse_demo ...');
  const demo = await seedDemo(DEMO_URI);

  const dist = path.join(os.tmpdir(), 'libverse-shots-dist');
  log('Building the frontend for the demo API ...');
  const vite = path.join(ROOT, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js');
  const build = spawnSync(process.execPath, [vite, 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], {
    cwd: path.join(ROOT, 'frontend'), env: { ...process.env, VITE_API_BASE_URL: API }, encoding: 'utf8',
  });
  if (build.status !== 0) throw new Error(`Frontend build failed:\n${build.stdout}\n${build.stderr}`);

  // A throwaway signing secret and service token for this run only
  const token = crypto.randomBytes(24).toString('hex');
  const python = [path.join(ROOT, 'ai-service', 'venv', 'Scripts', 'python.exe'), path.join(ROOT, 'ai-service', 'venv', 'bin', 'python')].find(existsSync);
  let ai = false;
  if (python) {
    start('ai', python, ['app.py'], { cwd: path.join(ROOT, 'ai-service'), env: { ...process.env, PORT: String(PORTS.ai), HOST: '127.0.0.1', AI_SERVICE_TOKEN: token, DEBUG: 'False' } });
    try { await waitUp(`http://127.0.0.1:${PORTS.ai}/health`, 'ai'); ai = true; } catch (e) { log(`AI service not available, using the fallback suggestions (${e.message.split('\n')[0]})`); }
  } else log('ai-service/venv not found: "Picked for you" uses the fallback suggestions');

  start('api', process.execPath, ['server.js'], {
    cwd: path.join(ROOT, 'backend'),
    env: {
      ...process.env, NODE_ENV: 'development', PORT: String(PORTS.api), MONGODB_URI: DEMO_URI, MONGO_URI: DEMO_URI,
      JWT_SECRET: crypto.randomBytes(32).toString('hex'), JWT_EXPIRE: '2h', CORS_ORIGINS: APP, REMINDERS_ENABLED: 'false',
      AI_SERVICE_URL: ai ? `http://127.0.0.1:${PORTS.ai}` : '', AI_SERVICE_TOKEN: ai ? token : '',
      SMTP_HOST: '', SMTP_PORT: '', SMTP_USER: '', SMTP_PASS: '', MAIL_FROM: '', CSP_API_ORIGINS: `http://localhost:${PORTS.api}`,
    },
  });
  start('app', process.execPath, [vite, 'preview', '--outDir', dist, '--port', String(PORTS.app), '--strictPort', '--host', 'localhost'], { cwd: path.join(ROOT, 'frontend') });
  await waitUp(`${API}/health`, 'api');
  await waitUp(APP, 'app');
  if (ai) {
    // Training happens in the background on API start: wait for it
    for (let i = 0; i < 60; i++) {
      const h = await (await fetch(`http://127.0.0.1:${PORTS.ai}/health`)).json();
      if (h.trainedBooks > 0) break;
      await sleep(500);
    }
  }
  return { demo, ai };
}

/** Sign in through the API: { token, user } for the browser's localStorage */
export async function session(email, password) {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const body = await r.json();
  if (!body.token) throw new Error(`Demo sign-in failed (${r.status}): is this the demo API?`);
  return { token: body.token, user: body.user };
}

export async function stopStack({ dropDemo = true } = {}) {
  procs.forEach((p) => p.kill());
  await sleep(1500);
  if (dropDemo) {
    const { dropDemo: drop } = require(path.join(ROOT, 'backend', 'scripts', 'seedDemo.js'));
    await drop(DEMO_URI);
  }
}
