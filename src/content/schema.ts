/**
 * Content schema: TypeScript types for site.json and pages/*.json, plus a runtime check that reports the exact file,
 * block and field that is wrong. Block types are documented in CONTENT.md.
 */

/** Where a link or button goes: a page id, "try-phone" (the interactive phone), or a URL ("https://…", or a site route such as "/try"). */
export type Target = string;
export interface Action { label: string; target: Target; primary?: boolean; icon?: string }
export interface Item { title: string; text: string; icon: string; color?: string }

export type Block =
  | { type: 'hero'; eyebrow?: string; title: string; lead?: string; actions?: Action[]; more?: { label: string; href: string }; button?: string; intro?: string; steps?: string[] }
  | { type: 'text'; heading?: string; paragraphs: string[]; note?: boolean }
  | { type: 'features'; anchor?: string; heading?: string; intro?: string; color?: string; style?: 'list' | 'apps'; items: Item[] }
  | { type: 'status'; heading?: string; items: { part: string; state: string; detail?: string; tone: 'done' | 'progress' | 'planned' }[] }
  | { type: 'demo'; heading?: string; device: 'phone' | 'lock' | 'widgets' | 'desktop' | 'settings'; text?: string; caption?: string; items?: string[] }
  | { type: 'image'; heading?: string; intro?: string; style?: 'phone'; images: { src: string; alt: string; caption?: string }[] }
  | { type: 'planned'; title: string; text: string; icon?: string; tag?: string; href?: string }
  | { type: 'site'; title: string; text: string; icon?: string }
  | { type: 'links'; heading?: string; items: { label: string; target: Target; text?: string; icon?: string; color?: string }[] }
  /** a project's latest published release (src/lib/releases.ts): version, date and the files matching its patterns.
   *  Download links: use it on the Download page only. */
  | { type: 'release'; key: string; title: string; text: string; icon?: string; color?: string; note?: string; button?: string; intro?: string; steps?: string[] }
  /** numbered steps; text in `backticks` is shown as code */
  /** working demos of the design library: see BlockLive.vue for the names */
  | { type: 'live'; heading?: string; intro?: string; wide?: boolean; items: { demo: string; title: string; caption: string }[] }
  | { type: 'steps'; heading?: string; intro?: string; items: string[]; collapsed?: boolean; button?: string };
export type BlockType = Block['type'];

export interface PageEntry {
  id: string; title: string; label: string; icon: string; color: string; summary: string;
  /** the page's address on the website, e.g. "/phone/apps" */
  path: string;
  /** the id of the page this one sits under (its sub-pages are listed on it) */
  parent?: string;
  /** where the page is listed; omitted = false */
  show?: { desktop?: boolean; phone?: boolean; classic?: boolean; menu?: boolean };
}
export interface EventItem { page: string; title: string; text: string; icon: string; color: string }
/** a calendar entry for today: shown in Events under Calendar (and under today in the month), sample data */
export interface CalendarItem { time: string; title: string; text: string }
export interface SiteIndex { pages: PageEntry[]; events: { notifications: EventItem[]; calendar?: CalendarItem[]; feeds: EventItem[] } }
/** home: the page's section on the home page (omitted = its blocks), for pages listed there (show.classic) */
export interface PageFile { blocks: Block[]; home?: Block[] }
export interface Page extends PageEntry { blocks: Block[]; home?: Block[] }

/* ---------------- runtime check ---------------- */
type Spec = Record<string, 'string' | 'string?' | 'boolean?' | 'array' | 'array?' | `enum:${string}` | `enum?:${string}`>;
const ITEM: Spec = { title: 'string', text: 'string', icon: 'string', color: 'string?' };
const ACTION: Spec = { label: 'string', target: 'string', primary: 'boolean?', icon: 'string?' };
export const BLOCKS: Record<BlockType, { spec: Spec; items?: { key: string; spec: Spec } }> = {
  hero: { spec: { eyebrow: 'string?', title: 'string', lead: 'string?', actions: 'array?', button: 'string?', intro: 'string?', steps: 'array?' }, items: { key: 'actions', spec: ACTION } },
  text: { spec: { heading: 'string?', paragraphs: 'array', note: 'boolean?' } },
  features: { spec: { anchor: 'string?', heading: 'string?', intro: 'string?', color: 'string?', style: 'enum?:list|apps', items: 'array' }, items: { key: 'items', spec: ITEM } },
  status: { spec: { heading: 'string?', items: 'array' }, items: { key: 'items', spec: { part: 'string', state: 'string', detail: 'string?', tone: 'enum:done|progress|planned' } } },
  demo: { spec: { heading: 'string?', device: 'enum:phone|lock|widgets|desktop|settings', text: 'string?', caption: 'string?', items: 'array?' } },
  image: { spec: { heading: 'string?', intro: 'string?', style: 'enum?:phone', images: 'array' }, items: { key: 'images', spec: { src: 'string', alt: 'string', caption: 'string?' } } },
  planned: { spec: { title: 'string', text: 'string', icon: 'string?', tag: 'string?', href: 'string?' } },
  site: { spec: { title: 'string', text: 'string', icon: 'string?' } },
  links: { spec: { heading: 'string?', items: 'array' }, items: { key: 'items', spec: { label: 'string', target: 'string', text: 'string?', icon: 'string?', color: 'string?' } } },
  release: { spec: { key: 'string', title: 'string', text: 'string', icon: 'string?', color: 'string?', note: 'string?', button: 'string?', intro: 'string?', steps: 'array?' } },
  live: { spec: { heading: 'string?', intro: 'string?', wide: 'boolean?', items: 'array' } },
  steps: { spec: { heading: 'string?', intro: 'string?', items: 'array', collapsed: 'boolean?', button: 'string?' } },
};

function checkObj(o: unknown, spec: Spec, where: string, errs: string[], strict = true) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) { errs.push(`${where}: expected an object`); return; }
  const r = o as Record<string, unknown>;
  for (const [k, t] of Object.entries(spec)) {
    const v = r[k], opt = t.includes('?');
    if (v === undefined) { if (!opt) errs.push(`${where}: missing "${k}"`); continue; }
    if (t.startsWith('string') && typeof v !== 'string') errs.push(`${where}.${k}: expected a string`);
    if (t.startsWith('boolean') && typeof v !== 'boolean') errs.push(`${where}.${k}: expected true or false`);
    if (t.startsWith('array') && !Array.isArray(v)) errs.push(`${where}.${k}: expected a list`);
    if (t.startsWith('enum')) { const ok = t.split(':')[1]!.split('|'); if (!ok.includes(v as string)) errs.push(`${where}.${k}: "${String(v)}" is not one of ${ok.join(', ')}`); }
  }
  if (strict) for (const k of Object.keys(r)) if (k !== 'type' && !(k in spec)) errs.push(`${where}: unknown field "${k}"`);
}

export function validatePage(file: string, data: unknown): string[] {
  const pf = data as PageFile | undefined;
  if (!Array.isArray(pf?.blocks)) return [`${file}: expected { "blocks": [ … ] }`];
  if (pf.home !== undefined && !Array.isArray(pf.home)) return [`${file}: "home" must be a list of blocks`];
  return [...checkBlocks(file, pf.blocks), ...(pf.home ? checkBlocks(`${file} home`, pf.home) : [])];
}
function checkBlocks(file: string, blocks: unknown[]): string[] {
  const errs: string[] = [];
  blocks.forEach((b, i) => {
    const where = `${file} blocks[${i}]`;
    const type = (b as { type?: string })?.type;
    const def = type ? BLOCKS[type as BlockType] : undefined;
    if (!def) { errs.push(`${where}: unknown block type "${String(type)}" (allowed: ${Object.keys(BLOCKS).join(', ')})`); return; }
    checkObj(b, def.spec, `${where} (${type})`, errs);
    const list = def.items && (b as Record<string, unknown>)[def.items.key];
    if (Array.isArray(list)) list.forEach((it, j) => checkObj(it, def.items!.spec, `${where} (${type}).${def.items!.key}[${j}]`, errs));
    if (type === 'text' || type === 'demo' || type === 'steps') {
      const arr = (b as Record<string, unknown>)[type === 'text' ? 'paragraphs' : 'items'];
      if (Array.isArray(arr) && arr.some((p) => typeof p !== 'string')) errs.push(`${where} (${type}): every entry must be a string`);
    }
  });
  return errs;
}

const ENTRY: Spec = { id: 'string', title: 'string', label: 'string', icon: 'string', color: 'string', summary: 'string', path: 'string', parent: 'string?' };
const EVENT: Spec = { page: 'string', title: 'string', text: 'string', icon: 'string', color: 'string' };
export function validateIndex(data: unknown, pageFiles: string[]): string[] {
  const errs: string[] = [];
  const s = data as SiteIndex;
  if (!Array.isArray(s?.pages)) return ['site.json: expected "pages": [ … ]'];
  const ids = new Set<string>();
  s.pages.forEach((p, i) => {
    checkObj(p, ENTRY, `site.json pages[${i}]`, errs, false);
    if (p.show !== undefined) checkObj(p.show, { desktop: 'boolean?', phone: 'boolean?', classic: 'boolean?', menu: 'boolean?' }, `site.json pages[${i}].show`, errs);
    if (ids.has(p.id)) errs.push(`site.json pages[${i}]: duplicate id "${p.id}"`);
    ids.add(p.id);
    if (typeof p.path === 'string' && !p.path.startsWith('/')) errs.push(`site.json pages[${i}].path: must start with "/"`);
    if (typeof p.path === 'string' && /^\/try(\/|$)/.test(p.path)) errs.push(`site.json pages[${i}].path: /try is the interactive view`);
    if (!pageFiles.includes(p.id)) errs.push(`site.json pages[${i}]: no file src/content/pages/${p.id}.json`);
  });
  s.pages.forEach((p, i) => { if (p.parent && !ids.has(p.parent)) errs.push(`site.json pages[${i}].parent: unknown page "${p.parent}"`); });
  const paths = s.pages.map((p) => p.path); paths.forEach((x, i) => { if (paths.indexOf(x) !== i) errs.push(`site.json pages[${i}]: duplicate path "${x}"`); });
  for (const k of ['notifications', 'feeds'] as const) {
    const list = s.events?.[k];
    if (!Array.isArray(list)) { errs.push(`site.json: expected "events.${k}": [ … ]`); continue; }
    list.forEach((e, i) => { checkObj(e, EVENT, `site.json events.${k}[${i}]`, errs); if (!ids.has(e.page)) errs.push(`site.json events.${k}[${i}]: unknown page "${e.page}"`); });
  }
  const cal = s.events?.calendar;
  if (cal !== undefined && !Array.isArray(cal)) errs.push('site.json: expected "events.calendar": [ … ]');
  else cal?.forEach((c, i) => checkObj(c, { time: 'string', title: 'string', text: 'string' }, `site.json events.calendar[${i}]`, errs));
  return errs;
}
