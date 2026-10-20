---
name: 19 / Chocolate studio
description: A restrained local workbench for chocolate relief and packaging.
colors:
  ink: "#20221f"
  muted: "#60635b"
  rule: "#d4d5ce"
  gallery-rule: "#c8cbc0"
  accent: "#626f49"
  panel: "#fafaf8"
  background: "#f2f2f0"
  drawing-surface: "#efefec"
  preview-surface: "#e6e6e2"
  gallery-surface: "#e6e7e1"
  selected-surface: "#e9eddf"
  selected-rule: "#bdc5ac"
  selected-ink: "#3c472c"
  hover-surface: "#e8e9e2"
  pressed-surface: "#dfe2d6"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "74px"
    fontWeight: 400
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  panel-title:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  control:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  label:
    fontFamily: "Haas, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  control: "4px"
  field: "3px"
  swatch: "2px"
spacing:
  compact: "5px"
  control-gap: "7px"
  control-inline: "12px"
  section: "18px"
  mobile-gutter: "20px"
  gallery-gutter: "40px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-hover:
    backgroundColor: "{colors.hover-surface}"
  button-active:
    backgroundColor: "{colors.pressed-surface}"
  export:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  selected-tool:
    backgroundColor: "{colors.selected-surface}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.control}"
    padding: "9px 8px"
  field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "7px 8px"
  gallery-tile:
    backgroundColor: "{colors.gallery-surface}"
---

# Design System: 19 / Chocolate studio

## Overview

**Creative North Star: “The Quiet Workbench.”** This names the shipped direction: 19-studio.com restraint, Braun instrument clarity and Apple's economical controls. Neutral framing and Neue Haas Roman let the work carry visual interest. Small olive state cues support operation; the interface stays calm around elaborate vector contours and material previews.

The editor is dense and canvas first. The library and terrain gallery share its type, palette and fine rules while giving collections more breathing room. Their page compositions are documented in `.impeccable/surfaces/`, rather than imposed on every future surface.

**Key characteristics:**

- Quiet grey surfaces and regular-weight Haas typography.
- Fine divisions, compact controls and concise operational copy.
- Olive selection and focus, with material colour confined to artwork and the model.
- Strong directional object shadows within a mostly flat interface.

## Colors

The palette is warm neutral with a subdued olive operational accent. Frontmatter contains the normative values extracted from the shipped CSS.

### Primary

**Olive accent** identifies drawing controls, checked ranges and keyboard focus. **Selected surface**, **selected rule** and **selected ink** provide a gentle active-tool treatment.

### Neutral

**Ink** carries readable labels and the dark Export control. **Muted** supports captions, measurements and secondary actions. **Background**, **panel**, **drawing surface** and **preview surface** distinguish adjacent working areas without decorative containers. **Rule** divides the editor; **gallery rule** supports the library and terrain collection. **Gallery surface** frames source imagery. **White** lifts the selected segmented tab.

**The State Colour Rule.** Olive communicates operation or selection. Chocolate, foil, carton and terrain colours belong to the content and remain independently editable or asset-specific.

## Typography

Haas is the local alias for `NeueHaasDisplayRoman.ttf`, with Arial and sans-serif fallbacks. The private reference font is included for local use; its availability does not establish a wider licence.

The main UI uses the body, control and label roles above. Panel titles are slightly larger and closely spaced. Gallery display type is regular, large and tightly led; its responsive sizes belong to the relevant surface brief. Measurements use tabular numerals where fields or captions require alignment. Labels use sentence case rather than pervasive uppercase.

**The Working Copy Rule.** Use short labels that name the action, property or material. Reserve explanatory paragraphs for the guide, design study and gallery introductions.

## Layout

Fine rules and tonal changes define regions. Space follows each surface's task: a compact editor workbench, open collection grids and unboxed artwork. Small gaps repeat in controls; section spacing and gallery gutters open the hierarchy without adding ornamental cards.

At narrow widths the editor moves its workspace above stacked tool and layer controls. Galleries reduce their column count and side margins. Preserve functional density and readable labels when extending the system; consult the surface briefs for the actual breakpoint compositions.

## Elevation & Depth

The interface is mostly flat, with two small exceptions: a selected segmented tab (`0 1px 2px #20221f14`) and the export menu (`0 10px 30px #20221f20`). Keyboard focus uses an olive outline (2px, generally offset 3px in the editor and 4px in the library).

The physical preview uses directional light and a clearly defined cast shadow. This is scene rendering, not a card-shadow vocabulary. The key light uses a shadow radius of 0.5 and a 4096-square shadow map. Terrain gradients are opaque artwork openings; they are not interface decoration.

## Shapes

Controls have lightly softened corners, with the control, field and swatch radii specified above. Gallery imagery stays rectangular and unboxed. Thin dividers and line icons supply structure; editor icons use rounded strokes (1.4px). Small circular colour inputs and status dots are functional exceptions to the rectangular control language.

## Components

### Buttons

Neutral outlined controls use the button token, a fine rule border and a short background transition (0.15s). Hover and pressed values come from their sibling tokens. Disabled editor buttons use opacity (0.35). Export uses the dark filled treatment. Icon buttons remove the border and use compact padding. Focus must remain visible.

### Fields

Numeric and text fields use the field token, a fine rule border and full available width. Selects share the panel fill and field radius. Ranges and checkboxes use the olive accent. Colour inputs are circular swatches.

### Navigation

Editor modes use segmented controls: muted text at rest, white fill and a minimal shadow for the selected segment. Library tabs use a rule-bounded row, muted inactive text and an underlined active item; the row wraps on small screens. Collection downloads remain lightweight text links.

### Selection rows

Selected layer and pattern-object rows use the selected surface. Material swatches identify the wrapper or chocolate visually; an independent eye control indicates visibility. Selection must not imply that a material is visible.

### Collection tiles

Source and relief images sit on the gallery surface with no card outline, rounded frame or shadow. Captions pair a small trace/source identifier with a regular title. Download actions are compact text links. Terrain artwork is shown directly, with a title and PNG action below.

### Drawing and material preview

The planar drawing and physical preview are the signature pair. Drawing uses dark editable contours and restrained guides; the preview translates the same pattern into shallow vector relief or its inverse mould. Material colour, light and object shadow express the physical object without decorating the surrounding controls.

## Do's and Don'ts

- **Do** preserve the user's quiet 19-studio/Braun/Apple direction, local Haas typography and restrained grey framing.
- **Do** keep operative state, object selection and material visibility visually distinguishable.
- **Do** show source contours and broadened relief adaptations as separate assets.
- **Do** retain obvious focus treatment and honour the existing reduced-motion override.
- **Don't** add ornamental gradients or decorative card shadows to the UI; opaque gradients remain valid terrain artwork.
- **Don't** replace the continuous chocolate face with a portion grid.
- **Don't** turn the editor into a marketing page or expand helper copy into the central canvas.
