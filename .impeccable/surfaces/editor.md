# Editor / local operate mode

Route `/`. Primary job: draw or load a pattern, inspect its physical relief/mould and wrap the bar. The user's 19-studio/Braun/Apple reference governs the quiet grey Haas interface. Central objects, not promotional copy, own the page.

The desktop masthead is 66px high. The workbench uses 216px tools / fluid workspace / 260px inspector columns, with a 28px status bar. Relief mode pairs drawing and preview at 1:1.15; packaging mode fills the center with the model. A 59px workspace toolbar sits above the canvases. Tools, mirroring and dimensions remain left; materials, wrapper visibility and object layers remain right.

At 1180px the side columns narrow to 190px/230px; at 960px they become 180px/216px and the canvases stack. At 700px the workspace moves first and tools/inspector become two-column sections below it. The workspace keeps paired canvases until 420px, where they stack. At 1700px tools/inspector widen to 232px/280px. These are actual CSS breakpoints, not a generic device scale.

Keep drawing guides, dimensions and selection quiet. Material preview uses a continuous 3:6 bar by default, shallow unioned vector relief and a hard directional cast shadow. Mould is an inverse preview. Full-cover foil/sleeve/carton visibility is controlled independently of selection. Freehand/line editing uses scale, rotation, stroke and X/Y; dimension-based shapes additionally support width/height.

Evidence: `src/style.css`, `src/main.js`, `src/pattern.js`, `src/renderer.js`, `src/vector-relief.js`; `.impeccable/review/editor-desktop.png`, `editor-mobile.png`, `user-534.png`. Screenshots show the T01 project at 60 × 120mm; trace relief/bevel defaults differ from the blank/default project. Manufacturing suitability is not certified.

Starting patterns now presents all eight source-derived key variations directly in the editor, led by Scroll panel (T01). Each tile loads broad relief onto the current bar while preserving packaging layers, bar width, height and depth, with Undo support. Loading a variation sets relief height and bevel to that trace’s values. Next key variation cycles these eight designs. The original Doorway, Botanical, Sun and Blank options remain under Basic shapes. Fresh sessions begin with Scroll panel; saved work is preserved.

The key-variation tiles use a two-column grid, compact Haas labels and the incumbent olive selection surface/rule. Basic shapes is collapsed initially. Extension evidence: `src/main.js`, `src/style.css`, `.impeccable/review/key-presets-desktop.png`, `key-presets-mobile.png`. This extends existing controls without introducing a new visual system.
