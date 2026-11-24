/**
 * Release data: the only source of version numbers and dates on the site.
 * - src/content/releases.json: what can't be fetched: each project's repo, label and asset name patterns.
 * - releases.gen.json (written at build time by scripts/releases.mjs from the GitHub API), else
 *   releases.snapshot.json (the committed fallback snapshot): the first render.
 * - In the browser, refreshReleases() reads each project's latest release from the anonymous GitHub API once per
 *   hour per tab (cached in sessionStorage, as the anonymous limit is 60 requests an hour) and updates the store;
 *   anything that fails keeps the data it had.
 *
 * Content text uses tokens, resolved by resolveTokens():
 *   {{rom.version}} the version without "v"   {{rom.tag}} the tag   {{rom.date}} the publish date, written out   {{rom.url}} the release page
 * Pages never write a version, a device list or what is in which release: the release cards read those from GitHub.
 */
import { reactive } from 'vue';
import config from '@/content/releases.json';

export interface Asset { name: string; size: number; url: string }
export interface Release { tag: string; date: string; url: string; assets: Asset[] }
export interface Project { repo: string; label: string; assets: string[] }
export type ProjectKey = keyof typeof config;
export const PROJECTS = config as Record<string, Project>;

const files = import.meta.glob<Record<string, Release>>('../content/releases.*.json', { eager: true, import: 'default' });
const initial: Record<string, Release> = { ...files['../content/releases.snapshot.json'], ...files['../content/releases.gen.json'] };
export const releases = reactive<Record<string, Release | undefined>>({ ...initial });

/** the assets of a release that match the project's patterns, in pattern order */
export function assetsOf(key: string): Asset[] {
  const r = releases[key], p = PROJECTS[key];
  if (!r || !p) return [];
  return p.assets.flatMap((pat) => r.assets.filter((a) => new RegExp(pat).test(a.name)));
}

const version = (tag: string) => tag.replace(/^v/, '');
export const formatDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** replaces {{key.field}} tokens in a text with the current release data */
export function resolveTokens(s: string): string {
  if (!s.includes('{{')) return s;
  return s.replace(/\{\{\s*(\w+)\.(\w+)\s*\}\}/g, (all, key: string, field: string) => {
    const r = releases[key];
    if (!r) return '';
    switch (field) {
      case 'version': return version(r.tag);
      case 'tag': return r.tag;
      case 'date': return formatDate(r.date);
      case 'url': return r.url;
      default: return all;
    }
  }).replace(/ +([).,;:])/g, '$1').replace(/\(\s*\)/g, '').replace(/ {2,}/g, ' ').trim();
}
/** the same, through every string of a content object (a block) */
export function resolveDeep<T>(v: T): T {
  if (typeof v === 'string') return resolveTokens(v) as T;
  if (Array.isArray(v)) return v.map(resolveDeep) as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveDeep(x)])) as T;
  return v;
}

const CACHE = 'etesian-releases';
const MAX_AGE = 60 * 60 * 1000;
let started = false;
/** reads the latest releases in the browser; build-time data stays when the API fails or is rate-limited */
export async function refreshReleases() {
  if (started || typeof window === 'undefined') return;
  started = true;
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE) ?? 'null') as { at: number; data: Record<string, Release> } | null;
    if (c && Date.now() - c.at < MAX_AGE) { apply(c.data); return; }
  } catch { /* no storage */ }
  const got: Record<string, Release> = {};
  await Promise.all(Object.entries(PROJECTS).map(async ([key, p]) => {
    try {
      const r = await fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { headers: { accept: 'application/vnd.github+json' } });
      if (!r.ok) return;
      const x = await r.json() as { tag_name: string; published_at: string; html_url: string; assets: { name: string; size: number; browser_download_url: string }[] };
      got[key] = { tag: x.tag_name, date: x.published_at.slice(0, 10), url: x.html_url, assets: x.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })) };
    } catch { /* offline: keep what we have */ }
  }));
  apply(got);
  try { if (Object.keys(got).length) sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data: got })); } catch { /* no storage */ }
}
/** only newer data replaces what the page has */
function apply(data: Record<string, Release>) {
  for (const [k, r] of Object.entries(data)) { const cur = releases[k]; if (!cur || r.date >= cur.date) releases[k] = r; }
}
