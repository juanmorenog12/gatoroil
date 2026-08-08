# Places & Moments — Ashly Map

This is a simple static website built with HTML, CSS, JavaScript, Leaflet, and OpenStreetMap.

## The easiest way to edit memories

Open `script.js`.

At the top you will see:

```js
const MEMORIES = [
  {
    title: "Islands of Adventure",
    date: "August 2026",
    note: "Your note...",
    lat: 28.4717,
    lng: -81.4734,
    type: "memory",
    image: ""
  }
];
```

For every new place, copy one block and change:

- `title`: place name
- `date`: date or month
- `note`: your message to Ashly
- `lat`: latitude
- `lng`: longitude
- `type`: `"memory"` or `"future"`
- `image`: optional image path, e.g. `"images/islands.jpg"`

## How to get coordinates

Open Google Maps.

1. Press and hold the exact location.
2. Google Maps will show latitude and longitude.
3. Copy those values into `lat` and `lng`.

## Adding photos

Put the photo inside the `images` folder.

Example:

`images/islands.jpg`

Then set:

```js
image: "images/islands.jpg"
```

If you don't want a photo:

```js
image: ""
```

## How to preview it on your computer

Because this site uses map tiles from the internet, your computer needs an internet connection.

The simplest option is opening `index.html` in a browser.

For the most reliable local preview, run a small local server from this folder:

Python:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## How to publish it so Ashly gets only a link

### Easiest option: Netlify Drop

1. Make your edits.
2. Keep `index.html`, `style.css`, `script.js`, and the `images` folder together.
3. Sign in to Netlify.
4. Open Netlify Drop.
5. Drag the whole website folder into the deploy area.
6. Netlify gives you a public `.netlify.app` URL.
7. Send that URL to Ashly.

When you want to update it later, edit your files and deploy the updated folder again from the site's Deploys page.

### Alternative: GitHub Pages

You can also upload these files to a GitHub repository and enable GitHub Pages from the repository settings.

## Important

The current "Dinner" and "Movies" coordinates are demo placeholders.
Replace them with the exact places you visited.

The Islands of Adventure marker is already located around Universal's Islands of Adventure.

## Suggested workflow

Keep one master copy of this folder on your computer.

Every time you make a new memory:

1. Add the new memory to `script.js`.
2. Add a photo if desired.
3. Preview it.
4. Redeploy the updated folder.
5. The same public site can continue growing over time.


## Fixed map rendering version

This version initializes Leaflet only after the map becomes visible and also uses a ResizeObserver plus multiple invalidateSize passes. This prevents the partial-tile/blank-area rendering bug that can happen when Leaflet is initialized inside a hidden container.


## Rendering fix v2

If you saw map tiles stacked only on the right side, the Leaflet JavaScript was
working but Leaflet's stylesheet was not being applied. This version removes
the external stylesheet integrity check and includes Leaflet's essential layout
rules directly in `style.css` as a fallback.

After replacing the old files, use Ctrl+F5 in Chrome to force a fresh reload.
