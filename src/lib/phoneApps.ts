/** Everything the phone UI can open: the site's content pages (as N9 apps) and the design repo's mock apps. */
import { listed, type DocId } from '../content/site';
import { app as mockApp } from '@etesian-design/shell/parts/data';

export interface PhoneApp { key: string; label: string; icon: string; color: string; tone?: 'colour' | 'light'; doc?: DocId; mock?: string; href?: string }
const MOCKS = ['Mail', 'Messages', 'Calendar', 'Music', 'Gallery', 'Notes', 'Browser', 'Settings'];

export const PHONE_APPS: PhoneApp[] = [
  ...listed('phone').map((d) => ({ key: d.id, label: d.label, icon: d.icon, color: d.color, doc: d.id })),
  ...MOCKS.map((m) => { const a = mockApp(m); return { key: m, label: m, icon: a.icon, color: a.color, tone: a.tone, mock: m }; }),
  { key: 'classic', label: 'Website', icon: 'globe', color: '#2EA8C7', href: '/' },
];
export const phoneApp = (key: string) => PHONE_APPS.find((a) => a.key === key);
