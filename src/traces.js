import {initialProject,object} from './pattern.js';
export function traceProject(entry,raw=false){
  const p=initialProject();p.name=`${entry.id} ${entry.name}`;p.bar={width:60,height:120,thickness:7.5,relief:.55,bevel:.12};
  p.objects=[object('svg',30,60,{name:raw?'Source contour':'Broadened source contour',w:56,h:112,viewBox:`0 0 ${entry.width} ${entry.height}`,svg:`<path fill="currentColor" fill-rule="evenodd" d="${raw?entry.path:entry.reliefPath}"/>`})];
  p.traceId=entry.id;p.sourceId=entry.source;p.sourceMode=raw?'raw contour':'broadened relief';return p;
}
