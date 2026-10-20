# Chocolate studio

A private local chocolate relief and packaging editor for Aditya Sangal / 19 studio. It supports direct drawing, deterministic vector relief and visual packaging exploration on a continuous chocolate face with no portion grid.

## Current product

The default bar is 60 × 120 × 7.5 mm (3:6); a 3:7 proportion shortcut and editable dimensions are available. Mirrored freehand, line and primitive tools, SVG import, selection, translation, scale, rotation and stroke controls produce editable patterns. Width/height fields apply to dimension-based shapes rather than freehand strokes and lines. Relief height and bevel drive actual bevelled vector geometry; chocolate and inverse mould previews use the same pattern.

Chocolate, foil, inner sleeve and outer carton are separate assembly layers. Fitted wrappers cover the complete bar and can be shown/hidden, added/removed and reordered. Materials, light, background, cast shadow and exploded assembly are adjustable. PNG/JPG/WebP artwork is uploaded locally and positioned, scaled and rotated on wrapper fronts. Wrapper sides/back remain solid colour.

Local autosave, undo/redo, portable JSON projects with embedded artwork, 2400px PNG scene export and millimetre SVG positive-face pattern export support iteration and handoff. The runtime uses bundled dependencies and requires browser WebGL for 3D. No runtime external service dependency is required.

## Reference collections

`/library.html` contains 23 captured Pinterest sources and eight source traces (T01–T08). Each trace preserves a raw contour separately from a broadened relief adaptation, with source comparisons, SVGs, 3:6 editable projects, chocolate/mould renders and downloads. Earlier interpretations A01–A10 remain an explicitly separate 4:6 archive with reliefs, centerline studies and projects. The full library is downloadable as a ZIP; source provenance and analysis remain in `research/`.

`/terrain.html` displays five independent PNG terrain illustrations and a ZIP download. Black/off-white stippled geology frames solid opaque aquamarine-to-off-white gradient openings. Artwork contains no branding or text. Prompts and revision records accompany the images. These raster assets are independent artwork, not relief geometry.

## Direction and limits

The confirmed visual authority is the user's 19-studio.com / Braun / Apple direction and supplied relief-brush reference: operate mode, canvas first, quiet greys, fine rules, restrained controls and minimal explanatory copy. `DESIGN.md` records implemented reusable visual tokens; `.impeccable/surfaces/` records page-specific composition.

Dimensions and mould previews are design references. Manufacturing suitability is not certified; a mould maker must determine tooling inversion, draft and fabrication suitability. The product does not provide manufacturing CAD export, print dielines or physically simulated foil unwrapping. SVG imports support simple geometric elements and local transforms; text and linked symbols must be converted to paths. The bundled private reference font is for local use, with no wider licence asserted.
