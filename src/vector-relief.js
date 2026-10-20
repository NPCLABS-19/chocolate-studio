import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import ClipperLib from 'clipper-lib';
import {svgDocument} from './pattern.js';
const S=1000;
const toClip=points=>points.map(p=>({X:Math.round(p.x*S),Y:Math.round(p.y*S)}));
function normalize(path,outer=true){if(ClipperLib.Clipper.Orientation(path)!==outer)path.reverse();return path;}
function execute(subject,clip,type){const c=new ClipperLib.Clipper();c.AddPaths(subject,ClipperLib.PolyType.ptSubject,true);if(clip?.length)c.AddPaths(clip,ClipperLib.PolyType.ptClip,true);const tree=new ClipperLib.PolyTree();c.Execute(type,tree,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);return tree;}
function polygonPaths(tree){return ClipperLib.Clipper.PolyTreeToPaths(tree);}
function shapesFrom(tree,w,h){return ClipperLib.JS.PolyTreeToExPolygons(tree).map(poly=>{const coords=p=>p.map(v=>new THREE.Vector2(v.X/S-w/2,h/2-v.Y/S));const shape=new THREE.Shape(coords(poly.outer));shape.holes=poly.holes.map(hole=>new THREE.Path(coords(hole)));return shape;});}
function offset(paths,delta){const off=new ClipperLib.ClipperOffset(2,.018*S);off.AddPaths(paths,ClipperLib.JoinType.jtRound,ClipperLib.EndType.etClosedPolygon);const out=new ClipperLib.Paths();off.Execute(out,delta*S);return out;}

// getCTM resolves nested SVG viewBoxes and mirrored / scaled imported art before
// flattening. No photographic mask or AI image becomes product geometry.
function flatSVG(p){
  const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none';holder.innerHTML=svgDocument(p);document.body.append(holder);const root=holder.querySelector('svg');root.setAttribute('width',p.bar.width);root.setAttribute('height',p.bar.height);const rootMatrix=root.getScreenCTM().inverse();const nodes=[];
  for(const el of root.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon')){
    if(el.closest('defs'))continue;const style=getComputedStyle(el);if(Number(style.opacity)===0)continue;const m=rootMatrix.multiply(el.getScreenCTM());const copy=el.cloneNode(false);copy.removeAttribute('style');copy.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);copy.setAttribute('fill',style.fill==='none'?'none':'#000000');copy.setAttribute('stroke',style.stroke==='none'?'none':'#000000');copy.setAttribute('stroke-width',String(parseFloat(style.strokeWidth)*Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))));copy.setAttribute('fill-rule',style.fillRule);nodes.push(copy.outerHTML);
  }holder.remove();return `<svg xmlns="http://www.w3.org/2000/svg">${nodes.join('')}</svg>`;
}
export function vectorRelief(p,mould=false){
  const {width:w,height:h,relief,bevel}=p.bar,loaded=new SVGLoader().parse(flatSVG(p)),polys=[];
  for(const path of loaded.paths){const style=path.userData.style;
    if(style.fill!=='none'&&style.fillOpacity!==0){for(const shape of SVGLoader.createShapes(path)){const points=shape.extractPoints(shape.curves.length>150?3:24);polys.push(normalize(toClip(points.shape)));for(const hole of points.holes)polys.push(normalize(toClip(hole),false));}}
    if(style.stroke!=='none'&&style.strokeWidth>0&&style.strokeOpacity!==0){for(const sub of path.subPaths){const pts=toClip(sub.getPoints(48));if(pts.length<2)continue;const isClosed=sub.autoClose||(pts[0].X===pts.at(-1).X&&pts[0].Y===pts.at(-1).Y);if(isClosed&&pts.length>2)pts.pop();const off=new ClipperLib.ClipperOffset(2,.018*S);off.AddPath(pts,ClipperLib.JoinType.jtRound,isClosed?ClipperLib.EndType.etClosedLine:ClipperLib.EndType.etOpenRound);const out=new ClipperLib.Paths();off.Execute(out,style.strokeWidth*S/2);polys.push(...out);}}
  }
  const boundary=[[{X:S,Y:S},{X:(w-1)*S,Y:S},{X:(w-1)*S,Y:(h-1)*S},{X:S,Y:(h-1)*S}]],union=execute(polys,null,ClipperLib.ClipType.ctUnion),clipped=execute(polygonPaths(union),boundary,ClipperLib.ClipType.ctIntersection),paths=polygonPaths(clipped),shapes=shapesFrom(clipped,w,h);
  const bt=Math.min(.18,relief*.32),bs=Math.min(bevel,.55),geometry=new THREE.ExtrudeGeometry(shapes,{depth:Math.max(.03,relief-bt),steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:bs,bevelThickness:bt,curveSegments:24});
  if(!mould)return {relief:geometry};
  // Only the exposed positive relief is inverted. The bottom bevel stays inside
  // chocolate, so dropping it leaves the mould cavity open at the floor plane.
  const position=geometry.attributes.position,normal=geometry.attributes.normal,vertices=[],normals=[];
  for(let i=0;i<position.count;i+=3){if([i,i+1,i+2].some(j=>position.getZ(j)<-.0001))continue;for(const j of [i,i+1,i+2]){vertices.push(position.getX(j),position.getY(j),-position.getZ(j));normals.push(-normal.getX(j),-normal.getY(j),normal.getZ(j));}}
  const cavity=new THREE.BufferGeometry();cavity.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cavity.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.dispose();
  const foot=offset(paths,bs),floorRect=[[{X:-.1*S,Y:-.1*S},{X:(w+.1)*S,Y:-.1*S},{X:(w+.1)*S,Y:(h+.1)*S},{X:-.1*S,Y:(h+.1)*S}]],floorTree=execute(floorRect,foot,ClipperLib.ClipType.ctDifference),floor=new THREE.ShapeGeometry(shapesFrom(floorTree,w,h),24);return {relief:cavity,floor};
}
