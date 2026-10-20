# 19 / Chocolate studio

Local mirrored pattern editor and deterministic Three.js chocolate / packaging mockup tool.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5179. For a production build: `npm run build`, then `npm run preview`. Dependencies are bundled locally; the running application makes no external service calls.

Features: mirrored freehand and primitives, move/scale/rotate/duplicate, geometry-only SVG import, continuous shallow relief with adjustable dimensions and bevel, inverse mould preview, orbital camera, material/light/background controls, add/remove/hide/reorder packaging shells, per-layer raster artwork and transforms, exploded assembly, undo/redo, local autosave, portable embedded-artwork projects, 2400px PNG and millimetre SVG export.

Known scope: packaging is a fitted shell preview, front artwork and solid-colour sides/back; no print dielines or physically simulated foil unwrapping. Relief uses unioned, bevelled vector geometry. SVG export is positive-face artwork, not manufacturing CAD. A mould maker must review the geometry before fabrication. Supported SVG imports are simple geometric elements and local transforms; convert text and symbols to paths. Browser WebGL is required for 3D.

Source architecture: `src/pattern.js` project model, geometry and SVG; `src/renderer.js` Three.js geometry, lighting and wrappers; `src/main.js` UI and gestures; `src/style.css` responsive interface. `public/guide.html` usage guide.

Private reference font from the user's 19-studio project, included for local use; no wider font licence asserted.

Azura frame library: `/library.html`, with all 23 Pinterest source captures, ten complete 4:6 relief SVGs, ten centerline studies, editable projects and geometry-rendered PNGs. Detailed pin-by-pin analysis is in `research/azura-design-study.md`. Working size 60 × 90 mm; physical dimensions remain editable.

Latest revision: default bar 3:6 (60 × 120 × 7.5 mm), stronger bevelled body and hard directional shadow. Wrappers cover the complete bar; visibility controls hide/unhide them. Source traces T01–T08 retain scan contours separately from broadened relief adaptations; both SVGs and 3:6 project files are available. The older A01–A10 interpretations remain archived in the library. Five independent terrain illustrations with opaque blanket gradients live at `/terrain.html`; built-in ImageGen prompts and revision history are included.

## GitHub deployment

Live site: https://npclabs-19.github.io/chocolate-studio/

The main branch contains editable source; gh-pages contains the Vite production build. Run `npm ci`, `npm test` and `npm run build` before publishing `dist/` to gh-pages. Relative asset URLs support the GitHub Pages project path. Browser uploads and projects stay on the device.

Optional contour-extraction tooling: `pip install -r research/requirements.txt`, then `python research/trace_sources.py`.
