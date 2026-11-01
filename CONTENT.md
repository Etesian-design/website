# Content

All site text lives in JSON. No code changes are needed to add, remove or reorder pages.

- `src/content/site.json`: the page index (order, id, title, label, icon, colour, summary, where each page is listed) and the Events items.
- `src/content/pages/<id>.json`: one file per page, `{ "blocks": [ … ] }`, rendered in order.

Both are checked at start-up (`src/content/schema.ts`). A mistake stops the site with a message naming the file, block and field, e.g.
`pages/phone.json blocks[2] (features).items[0]: missing "icon"`.

## Adding a page

1. Create `src/content/pages/<id>.json` with a `blocks` list.
2. Add an entry to `pages` in `site.json` with the same `id`.

Removing a page is the reverse. The order in `site.json` is the order everywhere.

### Index entry

```json
{ "id": "phone", "title": "The phone", "label": "Phone", "icon": "phone", "color": "#1C51AF",
  "summary": "One line for menus and overviews.",
  "show": { "desktop": true, "phone": true, "classic": true, "menu": true } }
```

- `label`: short name under icons. `color`: the page's own colour (its header on the phone, its icon).
- `show`: where the page is listed. `desktop` = desktop icons (the dock only shows open windows), `phone` = phone app grid, `classic` = a section and nav link on the website page (`/`), `menu` = the desktop's Explore menu. Omitted means not listed (the page can still be linked to).
- `icon`: one of the design icon names: back, chevron-right, chevron-down, menu, more, add, close, check, search, edit, delete, share, refresh, settings, flight, moon, location, record, hotspot, cast, mic, camera, qr, accessibility, speaker, headset, power, torch, data, restart, folder, wrench, attach, smile, bag, list, phone, message, mail, person, home, calendar, clock, music, photo, info, warning, wifi, battery, globe, lock, star, bluetooth, play, split, maximize, minimize, window, grid, drag.

### Events items

`events.notifications` and `events.feeds` fill the Events view on the phone, the desktop Events panel and the lock-screen cards:
`{ "page": "<page id>", "title": "…", "text": "…", "icon": "…", "color": "#…" }`. Tapping one opens the page.

`events.calendar` (optional) lists today's entries for the Calendar section of the desktop Events panel (and under today in
its month): `{ "time": "10:00", "title": "…", "text": "Today 10:00" }`. With none, the section is left out, as on the N9.

## Targets

Buttons and links take a `target`: a page id, `try-phone` (the interactive phone), a site route such as `/try`, or an `https://` URL (opens in a new tab).

## Block types

Optional fields are marked `?`.

| type | fields | renders |
|---|---|---|
| `hero` | `title`, `eyebrow?`, `lead?`, `actions?: [{ label, target, primary?, icon? }]` | page heading with buttons |
| `text` | `paragraphs: [string]`, `heading?`, `note?: true` | paragraphs; `note` draws them as a highlighted note |
| `features` | `items: [{ title, text, icon, color? }]`, `heading?`, `intro?`, `color?`, `style?: "list" \| "apps"` | grid of lit squircle icons with a title and a line; `apps` uses larger app icons |
| `status` | `items: [{ part, state, tone: "done" \| "progress" \| "planned", detail? }]`, `heading?` | status rows with coloured tags |
| `demo` | `device: "phone" \| "lock" \| "widgets" \| "desktop" \| "settings"`, `heading?`, `text?`, `caption?`, `items?: [string]` | live demos: the interactive phone, lock-screen cards, Belle widgets, the desktop sketch, or the phone's Lock screen settings page with its live preview |
| `image` | `images: [{ src, alt, caption? }]`, `heading?` | one image or a gallery; `src` is a path under `public/` or a URL |
| `planned` | `title`, `text`, `icon?`, `tag?` (default "Planned") | a dashed "planned / coming soon" card |
| `site` | `title`, `text`, `icon?` | the "this website" card: in the desktop view it says "You're using it", anywhere else it links to the desktop view |
| `links` | `items: [{ label, target, text?, icon?, color? }]`, `heading?` | link tiles; a page target uses that page's icon and colour unless given |
