/**
 * Content schema: TypeScript types for site.json and pages/*.json, plus a runtime check that reports the exact file,
 * block and field that is wrong. Block types are documented in CONTENT.md.
 */

/** Where a link or button goes: a page id, "try-phone" (the interactive phone), or a URL ("https://…", or a site route such as "/try"). */
export type Target = string;
export interface Action { label: string; target: Target; primary?: boolean; icon?: string }
export interface Item { title: string; text: string; icon: string; color?: string }

export type Block =
  | { type: 'hero'; eyebrow?: string; title: string; lead?: string; actions?: Action[] }
  | { type: 'text'; heading?: string; paragraphs: string[]; note?: boolean }
  | { type: 'features'; heading?: string; intro?: string; color?: string; style?: 'list' | 'apps'; items: Item[] }
  | { type: 'status'; heading?: string; items: { part: string; state: string; detail?: string; tone: 'done' | 'progress' | 'planned' }[] }
  | { type: 'demo'; heading?: string; device: 'phone' | 'lock' | 'widgets' | 'desktop' | 'settings'; text?: string; caption?: string; items?: string[] }
  | { type: 'image'; heading?: string; images: { src: string; alt: string; caption?: string }[] }
  | { type: 'planned'; title: string; text: string; icon?: string; tag?: string }
  | { type: 'site'; title: string; text: string; icon?: string }
  | { type: 'links'; heading?: string; items: { label: string; target: Target; text?: string; icon?: string; color?: string }[] };
export type BlockType = Block['type'];

export interface PageEntry {
  id: string; title: string; label: string; icon: string; color: string; summary: string;
  /** where the page is listed; omitted = false */
  show?: { desktop?: boolean; phone?: boolean; classic?: boolean; menu?: boolean };
}
export interface EventItem { page: string; title: string; text: string; icon: string; color: string }
/** a calendar entry for today: shown in Events under Calendar (and under today in the month), sample data */
export interface CalendarItem { time: string; title: string; text: string }
export interface SiteIndex { pages: PageEntry[]; events: { notifications: EventItem[]; calendar?: CalendarItem[]; feeds: EventItem[] } }
export interface PageFile { blocks: Block[] }
export interface Page extends PageEntry { blocks: Block[] }

/* ---------------- runtime check ---------------- */
type Spec = Record<string, 'string' | 'string?' | 'boolean?' | 'array' | 'array?' | `enum:${string}` | `enum?:${string}`>;
const ITEM: Spec = { title: 'string', text: 'string', icon: 'string', color: 'string?' };
const ACTION: Spec = { label: 'string', target: 'string', primary: 'boolean?', icon: 'string?' };
export const BLOCKS: Record<BlockType, { spec: Spec; items?: { key: string; spec: Spec } }> = {
  hero: { spec: { eyebrow: 'string?', title: 'string', lead: 'string?', actions: 'array?' }, items: { key: 'actions', spec: ACTION } },
  text: { spec: { heading: 'string?', paragraphs: 'array', note: 'boolean?' } },
  features: { spec: { heading: 'string?', intro: 'string?', color: 'string?', style: 'enum?:list|apps', items: 'array' }, items: { key: 'items', spec: ITEM } },
  status: { spec: { heading: 'string?', items: 'array' }, items: { key: 'items', spec: { part: 'string', state: 'string', detail: 'string?', tone: 'enum:done|progress|planned' } } },
  demo: { spec: { heading: 'string?', device: 'enum:phone|lock|widgets|desktop|settings', text: 'string?', caption: 'string?', items: 'array?' } },
  image: { spec: { heading: 'string?', images: 'array' }, items: { key: 'images', spec: { src: 'string', alt: 'string', caption: 'string?' } } },
  planned: { spec: { title: 'string', text: 'string', icon: 'string?', tag: 'string?' } },
  site: { spec: { title: 'string', text: 'string', icon: 'string?' } },
  links: { spec: { heading: 'string?', items: 'array' }, items: { key: 'items', spec: { label: 'string', target: 'string', text: 'string?', icon: 'string?', color: 'string?' } } },
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
  const errs: string[] = [];
  const blocks = (data as PageFile | undefined)?.blocks;
  if (!Array.isArray(blocks)) return [`${file}: expected { "blocks": [ … ] }`];
  blocks.forEach((b, i) => {
    const where = `${file} blocks[${i}]`;
    const type = (b as { type?: string })?.type;
    const def = type ? BLOCKS[type as BlockType] : undefined;
    if (!def) { errs.push(`${where}: unknown block type "${String(type)}" (allowed: ${Object.keys(BLOCKS).join(', ')})`); return; }
    checkObj(b, def.spec, `${where} (${type})`, errs);
    const list = def.items && (b as Record<string, unknown>)[def.items.key];
    if (Array.isArray(list)) list.forEach((it, j) => checkObj(it, def.items!.spec, `${where} (${type}).${def.items!.key}[${j}]`, errs));
    if (type === 'text' || type === 'demo') {
      const arr = (b as Record<string, unknown>)[type === 'text' ? 'paragraphs' : 'items'];
      if (Array.isArray(arr) && arr.some((p) => typeof p !== 'string')) errs.push(`${where} (${type}): every entry must be a string`);
    }
  });
  return errs;
}

const ENTRY: Spec = { id: 'string', title: 'string', label: 'string', icon: 'string', color: 'string', summary: 'string' };
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
    if (!pageFiles.includes(p.id)) errs.push(`site.json pages[${i}]: no file src/content/pages/${p.id}.json`);
  });
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
