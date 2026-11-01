<p align="center">
  <img src=".github/readme/desktop.png" width="820" alt="The Etesian desktop in a browser: a window, the phone and the dock">
</p>

<h1 align="center">etesian-design.com</h1>

<p align="center">
  <b>Etesian, in your browser.</b> A working desktop with windows you can drag, snap and resize, and a phone you can
  swipe through, or the same content as a plain page.
</p>

<p align="center">
  <a href="https://etesian-design.com">Visit the site</a> ·
  <a href="https://github.com/etesian-design/design">Design</a> ·
  <a href="https://github.com/etesian-design/android_vendor_etesian">Phone</a> ·
  <a href="https://github.com/etesian-design/plasma">KDE Plasma</a>
</p>

---

<table>
  <tr>
    <td><img src=".github/readme/desktop-snap.png" alt="Dragging a window to the top shows the snap layouts"></td>
    <td><img src=".github/readme/desktop-events.png" alt="Events: notifications, calendar and feeds"></td>
  </tr>
  <tr>
    <td align="center">Drag a window to the top to snap it</td>
    <td align="center">Events, a click on the menu bar away</td>
  </tr>
</table>

Built with Vue 3 and Quasar on the [design repo](https://github.com/etesian-design/design)'s own packages
(`@etesian-design/tokens`, `vue`, `quasar` and `shell`), so the site is the design system in use.

## Run it

The packages are on GitHub Packages, which asks for a GitHub token even to install public packages. Once, put a
[classic token](https://github.com/settings/tokens) with `read:packages` in your `~/.npmrc`:

```sh
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

Then:

```sh
git clone https://github.com/etesian-design/website etesian-website
cd etesian-website && npm ci && npm run dev    # http://localhost:6120
```

| Command | What it does |
|---|---|
| `npm run build` | Pre-renders every page into `dist/ssg` |
| `npm run screenshots` | With the dev server running: checks every view and saves screenshots |

**Editing the text?** It's all JSON in `src/content`, no code needed. See [CONTENT.md](CONTENT.md).

Every push to `main` builds the site and publishes it to GitHub Pages.

## Licence

Etesian, founded by Kyriakos Bompotis. Licensed under the GNU Affero General Public License, version 3 only (AGPL-3.0-only, [LICENSE](LICENSE)), with additional terms under its section 7 ([ADDITIONAL-TERMS.md](ADDITIONAL-TERMS.md)): the attribution "Etesian, founded by Kyriakos Bompotis" must be kept, also where a work based on it shows legal notices; no rights are granted to the Etesian names and logos ([TRADEMARKS.md](TRADEMARKS.md)); the Phorepoc project has an exception. Commercial licences are available from the founder.

Etesian is an independent project and isn't affiliated with Nokia.
