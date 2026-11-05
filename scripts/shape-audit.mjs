// Shape audit: every control-sized element on every page, in Firefox (the user's browser), at desktop and phone
// sizes. Flags what breaks the Etesian shape rules (language guide, Shape): buttons, text fields, chips, badges and
// count bubbles take squircle-half ends (n = 2.8, a CSS mask), icon-only buttons and highlights full squircles;
// never a pill or a rounded rectangle. Allowed round/pill: radio dots, switch tracks/knobs, progress bars, page dots,
// sliders, scrollbars, and the N9-era Belle widgets' own skeuomorphic parts.
// Usage: dev server running (BASE, default http://localhost:6121), then: node scripts/shape-audit.mjs  (exit 1 on findings)
import { firefox } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:6121';
const ALLOWED = ['q-toggle', 'hd-switch', 'q-radio', 'hd-radio', 'q-linear-progress', 'hd-progress', 'hd-page-indicator',
  'q-slider', 'q-range', 'q-scrollarea', 'bw-', 'q-carousel__navigation', 'q-spinner', 'hd-busy', 'hd-squircle', 'hd-sq',
  'x-dock__run', 'x-ev__dot', 'md-finger', 'q-tab__indicator', 'q-field__control', 'q-focus-helper',
  // Surfaces, not controls: windows, chat bubbles (their own rounded speech-bubble shape)
  'x-win__bar', 'x-msg__bubble', 'q-message-text', 'xm-bub', 'p2-wt', 'q-tooltip', 'hd-tooltip', 'hd-selection__item',
  // Small radii by the guide: checkboxes; key caps; slider parts; placeholders; the clock face's dots
  'q-checkbox', 'hd-check', 'xm-key', 'hd-colorpicker__hue', 'hd-colorpicker__hmark', 'q-skeleton', 'q-time__clock'];
// Large surfaces (cards, sheets, panels, hints, tiles) keep --hd-radius-card; scaled-down previews can make them look like pills.
const CARD_RADIUS = 8;

function audit() {
  const out = [];
  const allowed = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) {
    const c = typeof e.className === 'string' ? e.className : ''; if (window.__ALLOWED.some((a) => c.includes(a))) return true; } return false; };
  const masked = (el) => { const m = (s) => s && s !== 'none';
    const a = getComputedStyle(el), b = getComputedStyle(el, '::before'), c = getComputedStyle(el, '::after');
    return m(a.maskImage) || m(b.maskImage) || m(c.maskImage); };
  const painted = (cs) => (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') || cs.backgroundImage !== 'none'
    || (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none' && !/rgba\(.*, 0\)$|transparent/.test(cs.borderTopColor))
    || cs.boxShadow !== 'none';
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6 || r.height > 64) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    const kind = el.matches('.q-chip') ? 'chip' : el.matches('.q-badge, .hd-count, [class*="badge"], [class*="__count"], [class*="tag"]') ? 'badge'
      : el.matches('button, .q-btn, a[role="button"], [class*="btn"]') ? 'button' : el.matches('input, textarea, .q-field') ? 'field' : '';
    if (allowed(el) || el.tagName === 'KBD') continue;   // key caps: small radii, like checkboxes
    const W = el.offsetWidth || r.width, H = el.offsetHeight || r.height;   // the element's own size, not a scaled preview's
    if (Math.abs(rad - window.__CARD) < 0.6 && (!kind || H > 56)) continue;   // cards and tiles
    if (!kind && (H <= 8 || (W <= 16 && H <= 16))) continue;   // progress/slider tracks, page and status dots
    const name = `${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).slice(0, 3).join('.')}`;
    if (rad > 2 && painted(cs) && !masked(el)) {
      out.push({ name, why: rad >= H / 2 - 1 ? (W > H * 1.15 ? 'pill' : 'circle') : `rounded ${rad}px`, kind, w: Math.round(r.width), h: Math.round(r.height) });
    } else if ((kind === 'chip' || kind === 'badge') && painted(cs) && !masked(el)) {
      out.push({ name, why: 'chip/badge without squircle mask', kind, w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  return out;
}

const browser = await firefox.launch();
const found = new Map();
async function check(viewport, path, label, before) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.addInitScript(([a, c]) => { window.__ALLOWED = a; window.__CARD = c; window.__scale = (el) => { const r = el.getBoundingClientRect(); return el.offsetWidth ? el.offsetWidth / r.width : 1; }; }, [ALLOWED, CARD_RADIUS]);
  await p.goto(BASE + path); await p.waitForTimeout(1500);
  if (before) await before(p);
  for (const f of await p.evaluate(audit)) {
    const k = `${f.name} | ${f.why}`; if (!found.has(k)) found.set(k, { ...f, where: `${label}` });
  }
  await ctx.close();
}
const desk = { width: 1440, height: 900 }, phone = { width: 390, height: 844 };
for (const [vp, tag] of [[desk, 'desktop'], [phone, 'phone']]) {
  await check(vp, '/', `${tag} /`);
  await check(vp, '/phone', `${tag} /phone`);
  await check(vp, '/desktop', `${tag} /desktop`);
}
// Every window the desktop's dock opens.
const ctx = await browser.newContext({ viewport: desk }); const p = await ctx.newPage();
await p.addInitScript(([a, c]) => { window.__ALLOWED = a; window.__CARD = c; window.__scale = (el) => { const r = el.getBoundingClientRect(); return el.offsetWidth ? el.offsetWidth / r.width : 1; }; }, [ALLOWED, CARD_RADIUS]);
await p.goto(BASE + '/desktop'); await p.waitForTimeout(1500);
const n = await p.locator('.x-dock button, .x-dock a').count();
for (let i = 0; i < n; i++) {
  await p.locator('.x-dock button, .x-dock a').nth(i).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700);
  for (const f of await p.evaluate(audit)) { const k = `${f.name} | ${f.why}`; if (!found.has(k)) found.set(k, { ...f, where: `desktop dock #${i}` }); }
}
await browser.close();
for (const f of [...found.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)))
  console.log(`${(f.kind || '-').padEnd(6)} ${f.why.padEnd(34)} ${f.w}x${f.h}  ${f.name}  (${f.where})`);
console.log(`${found.size} finding(s)`);
process.exit(found.size ? 1 : 0);
