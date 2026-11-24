// Release data, the single source of every version and date on the site. Reads the latest published GitHub release
// of each project in src/content/releases.json (anonymous public API) and writes src/content/releases.gen.json
// (not committed). Runs before `npm run dev` and `npm run build`. Offline or rate-limited: no release data (src/content/
// releases.snapshot.json stays empty, so no stale version is ever shown) and the build still passes. In the browser the pages refresh the same data again (src/lib/releases.ts).
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const DIR = new URL('../src/content/', import.meta.url).pathname;
const config = JSON.parse(readFileSync(`${DIR}releases.json`, 'utf8'));
const headers = { accept: 'application/vnd.github+json', 'user-agent': 'etesian-website-build' };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const out = {};
for (const [key, { repo }] of Object.entries(config)) {
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const x = await r.json();
    out[key] = { tag: x.tag_name, date: x.published_at.slice(0, 10), url: x.html_url,
      assets: x.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })) };
    console.log(`releases: ${key} ${x.tag_name}`);
  } catch (e) {
    console.warn(`releases: ${key} (${repo}): ${e.message}; no release data for it`);
  }
}
if (Object.keys(out).length) writeFileSync(`${DIR}releases.gen.json`, `${JSON.stringify(out, null, 1)}\n`);
else rmSync(`${DIR}releases.gen.json`, { force: true });
