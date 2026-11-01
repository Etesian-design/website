// Takes the review screenshots at desktop (1440 x 900) and phone (390 x 844) sizes.
// Usage: start the dev server (npm run dev, port 6120), then: npm run screenshots
import { chromium, firefox } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:6120';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];

async function page(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${viewport.width}] ${m.type()}: ${m.text().slice(0, 300)}`); });
  p.on('pageerror', (e) => problems.push(`[${viewport.width}] pageerror: ${e.message}`));
  return p;
}
async function shot(p, name, full = false) {
  await p.waitForTimeout(450);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (over > 0) problems.push(`${name}: horizontal overflow ${over}px`);
  await p.screenshot({ path: `${OUT}${name}.png`, fullPage: full });
  console.log('saved', name);
}
async function drag(p, from, to, steps = 12) {
  await p.mouse.move(from.x, from.y); await p.mouse.down();
  for (let i = 1; i <= steps; i++) await p.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
}

/* ---------- desktop ---------- */
{
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/`); await p.waitForSelector('.x-dock'); await p.waitForTimeout(900);
  await shot(p, 'desktop-1-home');
  // unlock the phone inside its window and open an app
  const lock = p.locator('.ph__lock').first(); const b = await lock.boundingBox();
  await drag(p, { x: b.x + 40, y: b.y + b.height / 2 }, { x: b.x + b.width - 10, y: b.y + b.height / 2 }); await p.mouse.up(); await p.waitForTimeout(500);
  await shot(p, 'desktop-2-phone-unlocked');
  // the dock holds only the open windows (the Overview button, then the phone and the Etesian page)
  const dockItems = await p.locator('.x-dock .x-dock__item').count();
  if (dockItems !== 2) problems.push(`dock: ${dockItems} items, want only the 2 open windows`);
  // open Mail from the Overview and the design doc from the desktop icons
  await p.locator('.x-dock__launcher').click(); await p.waitForSelector('.x-ov');
  await p.locator('.x-ov__apps .hd-app-icon', { hasText: 'Mail' }).first().click(); await p.waitForTimeout(300);
  await p.locator('.site-icons .hd-app-icon', { hasText: 'Design' }).click();
  await shot(p, 'desktop-3-windows');
  // drag the focused window to the left edge: snap zones
  const bar = p.locator('.x-win.is-focused .x-win__drag').first(); const bb = await bar.boundingBox();
  await drag(p, { x: bb.x + 30, y: bb.y + 20 }, { x: 80, y: 420 });
  await shot(p, 'desktop-4-snap-zones');
  await p.mouse.up(); await shot(p, 'desktop-5-snapped');
  // the Overview (dock button), windows, search (Super+Space), events, menu
  await p.locator('.x-dock__launcher').click(); await p.waitForSelector('.x-ov'); await p.keyboard.type('mu');
  await shot(p, 'desktop-6-overview');
  await p.keyboard.press('Escape');
  await p.getByRole('menuitem', { name: 'View' }).click(); await p.getByRole('menuitem', { name: 'Windows' }).click();
  await shot(p, 'desktop-6b-windows');
  await p.keyboard.press('Escape');
  await p.keyboard.press('Meta+Space'); await p.waitForSelector('.x-launch, .x-launcher, [aria-label="Search"]');
  await shot(p, 'desktop-7-launcher');
  await p.keyboard.press('Escape');
  await p.locator('.x-mbar__events').click(); await shot(p, 'desktop-8-events');
  await p.keyboard.press('Escape');
  await p.getByRole('menuitem', { name: 'Explore' }).click(); await shot(p, 'desktop-9-menu');
  await p.keyboard.press('Escape');
  await p.goto(`${BASE}/`); await p.waitForTimeout(800);
  await shot(p, 'desktop-classic-top');
  await shot(p, 'desktop-classic-full', true);
  await p.goto(`${BASE}/phone`); await p.waitForTimeout(800);
  await shot(p, 'desktop-phone-route');
}

/* ---------- phone ---------- */
{
  const p = await page({ width: 390, height: 844 }, { touch: true });
  await p.goto(`${BASE}/`); await p.waitForSelector('.ph__lock'); await p.waitForTimeout(700);
  await shot(p, 'phone-1-lock');
  await p.locator('.ph__unlock').click(); await p.waitForTimeout(500);
  await shot(p, 'phone-2-apps');
  await p.locator('.hd-page-indicator button').first().click().catch(() => {});
  await p.evaluate(() => document.querySelector('.ph__track').scrollTo({ left: 0 })); await p.waitForTimeout(500);
  await shot(p, 'phone-3-events');
  await p.evaluate(() => { const t = document.querySelector('.ph__track'); t.scrollTo({ left: t.clientWidth }); }); await p.waitForTimeout(500);
  await p.locator('.ph-apps .hd-app-icon', { hasText: 'Phone' }).first().click({ force: true }); await p.waitForTimeout(900);
  await shot(p, 'phone-4-app-page');
  await p.locator('.ph__app .ph-surface__scroll').evaluate((e) => e.scrollTo({ top: 900 })); await shot(p, 'phone-5-app-scrolled');
  await p.locator('.ph__app .hd-toolbar__back').click(); await p.waitForTimeout(500);
  await p.locator('.ph-apps .hd-app-icon', { hasText: 'Mail' }).first().click({ force: true }); await p.waitForTimeout(900);
  await shot(p, 'phone-6-mail');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.evaluate(() => { const t = document.querySelector('.ph__track'); t.scrollTo({ left: t.clientWidth * 2 }); }); await p.waitForTimeout(500);
  await shot(p, 'phone-7-open-apps');
  await p.goto(`${BASE}/`); await p.waitForTimeout(800);
  await shot(p, 'phone-classic-top');
  await shot(p, 'phone-classic-full', true);
}

/* behaviour checks, each for a fix that broke before */
{
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  const win = () => p.locator('[data-win="doc:overview"]').first().boundingBox();
  // snap layouts: dropping a window on the top-edge picker's zone puts it in that zone
  const tb = await p.locator('[data-win="doc:overview"] .x-win__bar').first().boundingBox();
  await drag(p, { x: tb.x + 200, y: tb.y + 20 }, { x: 700, y: 2 }, 10); await p.waitForTimeout(300);
  const zb = await p.locator('.x-lpick__z[aria-label="Three columns, zone 2"]').boundingBox();
  if (!zb) problems.push('snap: no layout picker at the top edge');
  else {
    await drag(p, { x: 700, y: 2 }, { x: zb.x + zb.width / 2, y: zb.y + zb.height / 2 }, 8); await shot(p, 'desktop-snap-picker'); await p.mouse.up(); await p.waitForTimeout(400);
    const r = await win(); if (Math.abs(r.width - (1440 - 72) / 3) > 40) problems.push(`snap: zone drop gave width ${r.width}, want a third`);
  }
  // Super+Z (Ctrl+Alt+Z), layout 1, zone 2: the right half
  await p.keyboard.press('Control+Alt+z'); await p.keyboard.press('1'); await p.keyboard.press('2'); await p.waitForTimeout(300);
  { const r = await win(); if (r.x < 700) problems.push(`snap: Ctrl+Alt+Z 1 2 left the window at x ${r.x}, want the right half`); }
  // Super+D hides every window, again brings them back
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(400); await shot(p, 'desktop-widgets');
  if (await p.locator('.x-win:visible').count()) problems.push('Super+D: windows still shown');
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(400);
  // dock settings: bottom edge, auto-hide; the edge reveals it, it stays while the pointer is near, hides once away
  await p.locator('nav.x-dock').click({ button: 'right', position: { x: 30, y: 20 } }); await p.waitForTimeout(300);
  await p.locator('.x-cmenu__item', { hasText: 'Dock settings' }).click(); await p.waitForTimeout(300); await shot(p, 'desktop-dock-settings');
  await p.locator('.x-dset__posbtn', { hasText: 'Bottom' }).click(); await p.locator('.x-dset__segbtn', { hasText: 'Auto-hide' }).click(); await p.locator('.x-dset button', { hasText: 'Done' }).click();
  await p.mouse.move(700, 400); await p.waitForTimeout(1200);
  const hidden = async () => (await p.locator('nav.x-dock.is-hidden').count()) === 1;
  if (!(await hidden())) problems.push('dock: auto-hide did not hide it');
  await p.mouse.move(720, 895, { steps: 12 }); await p.waitForTimeout(900);
  if (await hidden()) problems.push('dock: the edge did not reveal it');
  await p.mouse.move(720, 860, { steps: 4 }); await p.waitForTimeout(400);
  if (await hidden()) problems.push('dock: hid while the pointer was at it');
  await p.mouse.move(720, 400, { steps: 6 }); await p.waitForTimeout(900);
  if (!(await hidden())) problems.push('dock: stayed out after the pointer left');
}
{
  const p = await page({ width: 390, height: 844 }, { touch: true });
  await p.goto(`${BASE}/`); await p.waitForTimeout(1200);
  if (await p.locator('.ph__unlock').count()) await p.locator('.ph__unlock').click(); await p.waitForTimeout(500);
  // tapping the status bar opens the status menu; tapping below closes it
  await p.locator('.ph__sbtap').click(); await p.waitForTimeout(400); await shot(p, 'phone-status-menu');
  if (!(await p.locator('.ph-sm').count())) problems.push('phone: no status menu on tapping the status bar');
  await p.locator('.ph-sm-wrap').click({ position: { x: 200, y: 800 } }); await p.waitForTimeout(300);
  if (await p.locator('.ph-sm').count()) problems.push('phone: status menu did not close');
  // peek: swipe up from the bottom and hold over an app, release opens it
  await p.locator('.ph-apps .hd-app-icon').first().click(); await p.waitForTimeout(900);
  await p.mouse.move(195, 840); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(195, 840 - 12 * i); await p.waitForTimeout(200);
  const ic = await p.locator('.ph-peek__i').nth(1).boundingBox();
  if (!ic) problems.push('phone: no peek on swipe up and hold');
  else {
    await p.mouse.move(ic.x + ic.width / 2, ic.y + ic.height / 2, { steps: 5 }); await shot(p, 'phone-peek');
    const want = (await p.locator('.ph-peek__i').nth(1).innerText()).trim(); // the app released over (the second in the peek row)
    await p.mouse.up(); await p.waitForTimeout(600);
    const got = await p.locator('.ph__app').getAttribute('aria-label'); if (got !== want) problems.push(`phone: peek release opened ${got}, want ${want}`);
  }
}

{
  // no flash of the plain summary while the scripts load (it is for search engines and no-JS visitors only)
  const p = await page({ width: 1440, height: 900 });
  await p.route('**/*.{js,ts,vue}*', async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); await r.continue(); });
  await p.goto(`${BASE}/`, { waitUntil: 'commit' });
  const pre = await p.waitForSelector('.site-pre > *', { state: 'attached', timeout: 15000 }).catch(() => null);
  if (pre && (await pre.evaluate((e) => getComputedStyle(e).visibility)) === 'visible') problems.push('load: the plain summary flashes before the app');
}

{
  // content images are public/ paths: they must load on a page below the root too (they once resolved against /classic/; now /try/ is the page below the root)
  const p = await page({ width: 1440, height: 900 });
  // with the trailing slash, as GitHub Pages serves it (try/index.html)
  await p.goto(`${BASE}/try/`); await p.waitForTimeout(1500);
  await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; } await new Promise((r) => setTimeout(r, 1500)); });
  const broken = await p.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
  if (broken.length) problems.push(`classic: images that do not load: ${broken.join(', ')}`);
  await p.close();
}

{
  // the pre-rendered classic page must not draw the hero phone at the unmeasured 25% (a tiny box growing to full size)
  const html = await (await fetch(`${BASE}/`)).text();
  const inner = html.match(/class="x-fit__inner"[^>]*style="([^"]*)"/);
  if (inner && !/visibility:\s*hidden/.test(inner[1])) problems.push('classic: the hero phone is pre-rendered at its unmeasured size');
  // under a resting lock screen the home grid is not drawn
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/`); await p.waitForTimeout(1200);
  const vis = await p.locator('.classic-hero__phone .ph__home').evaluate((e) => getComputedStyle(e).visibility);
  if (vis !== 'hidden') problems.push('phone: the home grid is drawn under the lock screen');
  // the lock cards must not blur what is behind them: in a scaled window the GPU sampled the desktop's widgets through them
  const blur = await p.locator('.classic-hero__phone .hd-lock-card').first().evaluate((e) => getComputedStyle(e).backdropFilter);
  if (blur && blur !== 'none') problems.push(`phone: lock card still blurs what is behind it (${blur})`);
}

{
  // right-click menus: what is under the pointer decides the menu; window content keeps the browser's own
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  const menu = async () => (await p.locator('.x-cmenu .x-cmenu__item').allTextContents()).map((t) => t.trim());
  const want = async (where, first) => { const m = await menu(); if (m[0] !== first) problems.push(`right-click ${where}: menu starts "${m[0]}", want "${first}"`); await p.keyboard.press('Escape'); await p.waitForTimeout(150); };
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(300);
  await p.mouse.click(700, 500, { button: 'right' }); await p.waitForTimeout(200); await shot(p, 'desktop-menu-wallpaper'); await want('wallpaper', 'Add widgets…');
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(300);
  const bar = await p.locator('[data-win="doc:overview"] .x-win__bar').boundingBox();
  await p.mouse.click(bar.x + 300, bar.y + 15, { button: 'right' }); await p.waitForTimeout(200); await shot(p, 'desktop-menu-window'); await want('title bar', 'Minimise');
  await p.locator('nav.x-dock .x-dock__item').first().click({ button: 'right' }); await p.waitForTimeout(200); await want('dock item', 'Minimise');
  await p.locator('nav.x-dock .x-dock__launcher').click({ button: 'right' }); await p.waitForTimeout(200); await want('dock', 'Dock settings…');
  await p.locator('.site-icons .hd-app-icon').first().click({ button: 'right' }); await p.waitForTimeout(200); await want('desktop icon', 'Open Etesian');
  const kept = await p.evaluate(() => { const el = document.querySelector('[data-win="doc:overview"] h1'); const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); el.dispatchEvent(ev); return !ev.defaultPrevented; });
  if (!kept) problems.push('right-click inside a window took over the browser menu');
  // edit the desktop: the windows move aside, a widget is added, moved, removed, Done brings the windows back
  await p.mouse.click(700, 500, { button: 'right' }); await p.waitForTimeout(200);
  if ((await menu())[0] !== 'Add widgets…') { await p.keyboard.press('Escape'); await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(300); await p.mouse.click(700, 500, { button: 'right' }); await p.waitForTimeout(200); }
  await p.locator('.x-cmenu__item', { hasText: 'Add widgets' }).click(); await p.waitForTimeout(400);
  if (await p.locator('.x-win:visible').count()) problems.push('edit desktop: windows still in the way');
  const n0 = await p.locator('.site-wg__at').count();
  await p.locator('.site-wg__sheet .x-wg__item', { hasText: 'Big clock' }).click(); await p.waitForTimeout(200);
  if ((await p.locator('.site-wg__at').count()) !== n0 + 1) problems.push('add widgets: Big clock was not added');
  const nw = p.locator('.site-wg__at').last(); const b0 = await nw.boundingBox();
  await drag(p, { x: b0.x + 60, y: b0.y + 60 }, { x: b0.x + 160, y: b0.y + 160 }, 8); await p.mouse.up(); await p.waitForTimeout(200);
  const b1 = await nw.boundingBox(); if (Math.abs(b1.x - b0.x - 100) > 10) problems.push(`edit desktop: widget moved ${b1.x - b0.x}px, want 100`);
  await shot(p, 'desktop-edit-widgets');
  await nw.locator('.bw-close').click(); await p.waitForTimeout(200);
  if ((await p.locator('.site-wg__at').count()) !== n0) problems.push('edit desktop: ✕ did not remove the widget');
  await p.locator('.x-wg__done').click(); await p.waitForTimeout(400);
  if (!(await p.locator('.x-win:visible').count())) problems.push('edit desktop: Done did not bring the windows back');
}

{
  // resizing from the edges: a corner, the left edge, the minimum size, and a snapped window turning floating
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  const W = () => p.locator('[data-win="doc:overview"]').first().boundingBox();
  const pull = async (x0, y0, x1, y1) => { await drag(p, { x: x0, y: y0 }, { x: x1, y: y1 }, 8); await p.mouse.up(); await p.waitForTimeout(200); };
  const r0 = await W(); await pull(r0.x + r0.width, r0.y + r0.height, r0.x + r0.width - 150, r0.y + r0.height - 100);
  const r1 = await W(); if (Math.abs(r1.width - r0.width + 150) > 4 || Math.abs(r1.height - r0.height + 100) > 4) problems.push(`resize corner: ${r1.width - r0.width} x ${r1.height - r0.height}, want -150 x -100`);
  await pull(r1.x, r1.y + 200, r1.x + 60, r1.y + 200);
  const r2 = await W(); if (Math.abs(r2.x - r1.x - 60) > 4 || Math.abs(r2.width - r1.width + 60) > 4) problems.push('resize left edge: the window did not follow');
  await pull(r2.x + r2.width, r2.y + 200, r2.x - 900, r2.y + 200);
  if ((await W()).width !== 320) problems.push(`resize: width ${(await W()).width}, want the 320 px minimum`);
  await shot(p, 'desktop-resized');
  await p.keyboard.press('Control+Alt+ArrowLeft'); await p.waitForTimeout(200); const h = await W();
  await pull(h.x + h.width, h.y + 300, h.x + h.width - 200, h.y + 300);
  const h2 = await W(); if (Math.abs(h2.width - h.width + 200) > 4 || h2.x !== h.x) problems.push('resize: a snapped window did not turn floating at its size');
}

{
  // Events: one line above Notifications (the section header's), none under the time or the month (reported twice)
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1200);
  await p.locator('.x-mbar__events').click(); await p.waitForTimeout(400);
  const rule = (sel) => p.locator(`.x-ev ${sel}`).first().evaluate((e) => getComputedStyle(e).borderBottomWidth);
  if ((await rule('.x-ev__now')) !== '0px') problems.push('Events: a line under the time as well as the Notifications header line');
  await p.locator('.x-ev__date').click(); await p.waitForTimeout(300); await shot(p, 'desktop-events-month');
  if ((await rule('.x-ev__month')) !== '0px') problems.push('Events: a line under the month as well as the Notifications header line');
}

{
  // the design audit (docs/21-desktop.md and the Desktop v2 story): each item once found off-design
  const p = await page({ width: 1920, height: 1080 });
  try { await p.goto(`${BASE}/desktop`); await p.evaluate(() => localStorage.clear()); } catch { /* fresh */ }
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  // Super+Tab opens the carousel (one large card)
  await p.keyboard.press('Meta+Tab'); await p.waitForTimeout(400);
  if (!(await p.locator('.x-wins--1').count())) problems.push('audit: Super+Tab did not open the carousel');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // Events: Notifications, Calendar (today), Feeds
  await p.locator('.x-mbar__events').click(); await p.waitForTimeout(400);
  const heads = (await p.locator('.x-ev .hd-section-header').allTextContents()).map((t) => t.trim());
  if (heads.join('|') !== 'Notifications|Calendar|Feeds') problems.push(`audit: Events sections ${heads.join(', ')}, want Notifications, Calendar, Feeds`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // the design's widget set
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(400);
  const kinds = await p.locator('.site-wg__at > *').evaluateAll((els) => els.map((e) => [...e.classList].find((c) => c.startsWith('bw--') && c !== 'bw--editing')));
  if (kinds.join(',') !== 'bw--flipclock,bw--agenda,bw--mail,bw--chats,bw--rss,bw--analog') problems.push(`audit: desktop widgets ${kinds.join(',')}, want the design's six`);
  await shot(p, 'audit-widgets');
  await p.keyboard.press('Control+Alt+d'); await p.waitForTimeout(300);
  // Edit dock: outline, × badges, move handle, gear, banner, styled
  await p.locator('nav.x-dock').click({ button: 'right', position: { x: 30, y: 20 } }); await p.locator('.x-cmenu__item', { hasText: 'Dock settings' }).click(); await p.waitForTimeout(400);
  if (!(await p.locator('nav.x-dock.is-editing .x-dock__move').count()) || !(await p.locator('nav.x-dock .x-dock__rm').count())) problems.push('audit: Edit dock has no handle or × badges');
  const ban = await p.locator('.x-editbanner').evaluate((e) => getComputedStyle(e).position).catch(() => 'missing');
  if (ban !== 'absolute') problems.push(`audit: Edit dock banner ${ban === 'missing' ? 'missing' : 'unstyled'}`);
  await shot(p, 'audit-dock-edit');
  // the handle drags the dock to the nearest edge
  const h = await p.locator('.x-dock__move').boundingBox();
  await drag(p, { x: h.x + 8, y: h.y + 8 }, { x: 960, y: 1070 }, 8); await p.mouse.up(); await p.waitForTimeout(300);
  if (!(await p.locator('nav.x-dock.x-dock--bottom').count())) problems.push('audit: the move handle did not take the dock to the bottom edge');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // dragging to the top: the hovered layout's zones show, numbered
  const bar = await p.locator('[data-win="doc:overview"] .x-win__bar').boundingBox();
  await drag(p, { x: bar.x + 200, y: bar.y + 20 }, { x: 1100, y: 2 }, 10); await p.waitForTimeout(300);
  const z = await p.locator('.x-lpick__z[aria-label="Three columns, zone 3"]').boundingBox();
  await drag(p, { x: 1100, y: 2 }, { x: z.x + z.width / 2, y: z.y + z.height / 2 }, 6); await p.waitForTimeout(300);
  const zones = await p.locator('.x-zones .x-zones__z').count();
  if (zones !== 3) problems.push(`audit: dragging over Three columns shows ${zones} zones, want 3`);
  await shot(p, 'audit-drag-zones'); await p.mouse.up();
}

{
  // GPU bleed: backdrop blur on the dock, its previews or the lock cards drew other icons and windows inside them (not visible headless)
  const p = await page({ width: 1920, height: 1080 });
  for (const path of ['/desktop', '/phone', '/']) {
    await p.goto(`${BASE}${path}`); await p.waitForTimeout(1500);
    const blurred = await p.evaluate(() => [...new Set([...document.querySelectorAll('*')].filter((e) => { const c = getComputedStyle(e).backdropFilter; return c && c !== 'none'; }).map((e) => e.className.toString().split(' ')[0]))]);
    if (blurred.length) problems.push(`${path}: backdrop blur on ${blurred.join(', ')} (it bleeds on the GPU)`);
  }
}

{
  // dragging a window (to the snap picker) or resizing one must not select text on the page. In Firefox: there the menu
  // bar got selected as the picker dropped (Chrome never showed it)
  const ff = await firefox.launch(); const p = await ff.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  const bar = await p.locator('[data-win="doc:overview"] .x-win__bar').boundingBox();
  await drag(p, { x: bar.x + 200, y: bar.y + 20 }, { x: 1100, y: 2 }, 10); await p.waitForTimeout(300);
  const z = await p.locator('.x-lpick__z').first().boundingBox();
  await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 6 });
  let sel = await p.evaluate(() => window.getSelection()?.toString() ?? '');
  await p.mouse.up(); await p.waitForTimeout(200);
  if (sel.trim()) problems.push(`dragging a window to the snap picker selected text: "${sel.trim().slice(0, 40)}"`);
  await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500); // the resize on a fresh page: the drag above left the window partly off-screen
  const w = await p.locator('[data-win="doc:overview"]').boundingBox();
  await drag(p, { x: w.x + w.width - 2, y: w.y + w.height / 2 }, { x: w.x + w.width - 300, y: w.y + 300 }, 10);
  sel = await p.evaluate(() => window.getSelection()?.toString() ?? ''); await p.mouse.up();
  if (sel.trim()) problems.push(`resizing a window selected text: "${sel.trim().slice(0, 40)}"`);
  await ff.close();
}

{
  // Etesian for the web: "This website" says "You're using it" in the desktop view and links to it anywhere else; no "Other systems"
  const p = await page({ width: 1440, height: 900 }); await p.goto(`${BASE}/desktop`); await p.waitForTimeout(1500);
  if (await p.getByText('Other systems').count()) problems.push('web: "Other systems" is still on the desktop');
  await p.locator('.site-icons .hd-app-icon', { hasText: /^\s*Web\s*$/ }).first().click(); await p.waitForTimeout(600);
  const site = p.locator('.blk-site').first();
  if (!(await site.count())) problems.push('web: the desktop did not open the Etesian for the web page');
  else {
    if (!(await site.getByText("You're using it").count())) problems.push('web: in the desktop view "This website" does not say "You\'re using it"');
    if (await site.getByRole('button', { name: 'Open the desktop view' }).count()) problems.push('web: the desktop view links to itself');
  }
  await p.goto(`${BASE}/`); await p.waitForTimeout(1500);
  if (await p.getByText('Other systems').count()) problems.push('web: "Other systems" is still on the classic page');
  const go = p.locator('.blk-site').getByRole('button', { name: 'Open the desktop view' });
  if (!(await go.count())) problems.push('web: the classic page has no link to the desktop view');
  else { await go.click(); await p.waitForTimeout(800); if (!p.url().endsWith('/desktop')) problems.push(`web: the link went to ${p.url()}`); }
}

await browser.close();
console.log(problems.length ? `\nPROBLEMS:\n${[...new Set(problems)].join('\n')}` : '\nno problems');
