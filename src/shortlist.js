import {BAR_FORMATS, CHOCOLATE_APPEARANCE, RELIEF_DEFAULTS, initialProject, newLayer, object} from './pattern.js';

export function shortlistProject(entry) {
  const project = initialProject();
  applyShortlistPreset(project, entry);
  return project;
}

export function applyShortlistPreset(project, entry) {
  const dimensions = BAR_FORMATS[entry.format];
  if (!dimensions || !entry.path) throw Error('This mould preset is unavailable.');
  const {width, height} = dimensions;
  project.name = `${entry.number} · ${entry.name}`;
  project.bar = {...dimensions, ...RELIEF_DEFAULTS};
  project.barFormatVersion = 3;
  project.appearanceVersion = 2;
  project.shortlistId = entry.id;
  delete project.traceId;
  delete project.sourceId;
  delete project.sourceMode;
  project.objects = [object('svg', width / 2, height / 2, {
    name: entry.name,
    w: width,
    h: height,
    viewBox: `0 0 ${width} ${height}`,
    svg: `<path fill="currentColor" d="${entry.path}"/>`
  })];
  project.symmetry = {x: false, y: false};
  if (!project.layers.some(layer => layer.type === 'chocolate')) {
    project.layers.unshift(newLayer('chocolate'));
  }
  for (const layer of project.layers) {
    layer.visible = layer.type === 'chocolate';
    if (layer.type === 'chocolate' && layer.color === '#49291c') {
      layer.color = CHOCOLATE_APPEARANCE.color;
      layer.roughness = CHOCOLATE_APPEARANCE.roughness;
    }
  }
  Object.assign(project.scene, {background: CHOCOLATE_APPEARANCE.background, explode: 0, light: 1.2, shadow: true});
  return project;
}

export function shortlistURL(base, id) {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('mould', id);
  return url.href;
}
