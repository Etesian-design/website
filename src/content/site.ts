/**
 * Loads the content: site.json (page index, order, where each page is listed, Events items) and one
 * pages/<id>.json per page (an ordered list of blocks). Both are checked against schema.ts at start-up.
 * Adding a page = a pages/<id>.json file + an entry in site.json. No code changes.
 */
import index from './site.json';
import { validateIndex, validatePage, type Page, type PageFile, type SiteIndex, type EventItem, type CalendarItem } from './schema';

const files = import.meta.glob<PageFile>('./pages/*.json', { eager: true, import: 'default' });
const byId: Record<string, unknown> = Object.fromEntries(Object.entries(files).map(([k, v]) => [k.replace(/^.*\/(.+)\.json$/, '$1'), v]));

const errors = [...validateIndex(index, Object.keys(byId)), ...Object.entries(byId).flatMap(([id, d]) => validatePage(`pages/${id}.json`, d))];
if (errors.length) {
  const msg = `Content error${errors.length > 1 ? 's' : ''}:\n- ${errors.join('\n- ')}`;
  console.error(msg);
  throw new Error(msg);
}

const site = index as SiteIndex;
export type DocId = string;
export type SiteDoc = Page;
export const DOCS: Page[] = site.pages.map((p) => ({ ...p, blocks: (byId[p.id] as PageFile).blocks }));
export const doc = (id: DocId): Page => DOCS.find((d) => d.id === id) ?? DOCS[0]!;
export const listed = (where: 'desktop' | 'phone' | 'classic' | 'menu') => DOCS.filter((d) => d.show?.[where]);
export const EVENTS: { notifications: EventItem[]; calendar: CalendarItem[]; feeds: EventItem[] } = { ...site.events, calendar: site.events.calendar ?? [] };
