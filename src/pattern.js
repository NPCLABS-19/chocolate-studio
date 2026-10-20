export const uid = () => crypto.randomUUID();
export const clone = x => structuredClone(x);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const clamp = (x,a,b) => Math.min(b,Math.max(a,Number(x)));
const n = x => Math.round(x*1000)/1000;

export function newLayer(type) {
  const common = {id:uid(),type,visible:true,color:'#e8e3d6',coverage:100,offset:0,roughness:0.65,artwork:null,artScale:1,artX:0,artY:0,artRotation:0};
  return {...common,...({chocolate:{name:'Chocolate',color:'#49291c',roughness:0.36},foil:{name:'Foil',color:'#b8b9b6',roughness:0.29},sleeve:{name:'Inner sleeve',color:'#ded9cb'},carton:{name:'Outer packaging',color:'#707859'}}[type])};
}
export function object(type,x,y,options={}) {
  return {id:uid(),name:type[0].toUpperCase()+type.slice(1),type,x,y,w:10,h:10,rotation:0,scale:1,stroke:2,filled:true,visible:true,mirrorX:false,mirrorY:false,...options};
}
export function petalPath(w,h) {return `M 0 ${-h/2} C ${w*.72} ${-h*.22} ${w*.5} ${h*.28} 0 ${h/2} C ${-w*.5} ${h*.28} ${-w*.72} ${-h*.22} 0 ${-h/2} Z`;}
export function shapeMarkup(o) {
  const {w,h}=o;
  const attrs=`fill="${o.filled?'currentColor':'none'}" stroke="${o.filled?'none':'currentColor'}" stroke-width="${o.stroke}" stroke-linejoin="round" stroke-linecap="round"`;
  if(o.type==='svg') return `<svg x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" viewBox="${o.viewBox}" overflow="visible">${o.svg}</svg>`;
  if(o.type==='freehand'||o.type==='line') {
    const p=o.points||[];
    return `<path d="${p.map((p,i)=>`${i?'L':'M'} ${n(p[0])} ${n(p[1])}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  if(o.type==='frame') return `<path fill="currentColor" fill-rule="evenodd" d="M ${-w/2} ${-h/2} h ${w} v ${h} h ${-w} Z M ${-w/2+o.stroke} ${-h/2+o.stroke} v ${h-o.stroke*2} h ${w-o.stroke*2} v ${-h+o.stroke*2} Z"/>`;
  if(o.type==='ellipse') return `<ellipse cx="0" cy="0" rx="${w/2}" ry="${h/2}" ${attrs}/>`;
  if(o.type==='rect') return `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${Math.min(1,w/5,h/5)}" ${attrs}/>`;
  if(o.type==='diamond') return `<path d="M 0 ${-h/2} L ${w/2} 0 L 0 ${h/2} L ${-w/2} 0 Z" ${attrs}/>`;
  if(o.type==='leaf') return `<path d="${petalPath(w,h)}" ${attrs}/>`;
  if(o.type==='flower') {
    const petals=o.petals||8;
    return `<g fill="currentColor">${Array.from({length:petals},(_,i)=>`<ellipse cx="0" cy="${-h*.25}" rx="${w*.13}" ry="${h*.25}" transform="rotate(${i*360/petals})"/>`).join('')}<circle r="${w*.19}"/></g>`;
  }
  return '';
}
export function mirrors(o,w,h) {
  const t=[''];if(o.mirrorX)t.push(`translate(${w} 0) scale(-1 1)`);
  if(o.mirrorY)t.push(`translate(0 ${h}) scale(1 -1)`);
  if(o.mirrorX&&o.mirrorY)t.push(`translate(${w} ${h}) scale(-1 -1)`);return t;
}
export function objectMarkup(o,w,h,editor=false,selected=null) {
  if(!o.visible)return '';
  return mirrors(o,w,h).map(m=>`<g ${editor?`data-object="${o.id}" class="pattern-object ${selected===o.id?'selected':''}"`:''} transform="${m}" color="${editor&&selected===o.id?'#687f4f':'#292c27'}"><g transform="translate(${o.x} ${o.y}) rotate(${o.rotation}) scale(${o.scale})">${shapeMarkup(o)}</g></g>`).join('');
}
export function svgDocument(project,white=false) {
  const {width:w,height:h}=project.bar;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><title>${esc(project.name)} — relief artwork</title><desc>Units: mm. Relief ${project.bar.relief} mm; bevel ${project.bar.bevel} mm. Positive face artwork; tool maker must determine tooling inversion and draft.</desc><defs><clipPath id="boundary"><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="0.5"/></clipPath></defs><g clip-path="url(#boundary)" ${white?'style="color:white"':''}>${project.objects.map(o=>objectMarkup(o,w,h).replaceAll('color="#292c27"',`color="${white?'#ffffff':'#000000'}"`)).join('')}</g></svg>`;
}
export function preset(name='door',w=49.8,h=99,variant=0) {
  const sx=w/49.8,sy=h/99;const a=[];
  const add=(type,x,y,opts={})=>{const o=object(type,x*sx,y*sy,{...opts,w:(opts.w||10)*sx,h:(opts.h||10)*sy});a.push(o);return o;};
  if(name==='blank')return [];
  if(name==='door') {
    add('frame',24.9,49.5,{w:45.8,h:95,stroke:1.9,name:'Continuous door frame'});
    add('flower',14.5,24,{w:14,h:14,petals:variant%2?6:8,mirrorX:true,name:'Paired rosettes'});
    add('line',14.5,43,{points:[[0,0],[0,43*sy]],stroke:2.1,mirrorX:true,name:'Paired stems'});
    [[-4,52,-36],[4,61,36],[-4,71,-36],[4,80,36]].forEach(([dx,y,r],i)=>add('leaf',14.5+dx,y,{w:7,h:12,rotation:r,mirrorX:true,name:`Broad leaves ${i+1}`}));
    add('leaf',14.5,45,{w:6,h:10,mirrorX:true,name:'Stem crowns'});
  } else if(name==='botanical') {
    add('line',24.9,17,{points:[[0,0],[0,67*sy]],stroke:2.8,name:'Central stem'});
    [28,45,62,79].forEach((y,i)=>add('leaf',17.8,y,{w:11,h:18,rotation:-48,mirrorX:true,name:`Leaf pair ${i+1}`}));
    add('leaf',24.9,17,{w:10,h:19,name:'Crown leaf'});
  } else if(name==='sun') {
    add('flower',24.9,34,{w:32,h:32,petals:variant%2?6:8,name:'Large rosette'});
    add('line',24.9,54,{points:[[0,0],[0,30*sy]],stroke:3,name:'Sun stem'});
    add('leaf',18,69,{w:11,h:19,rotation:-45,mirrorX:true,name:'Mirrored leaves'});
  }
  return a;
}
export function initialProject(){return {format:'19-chocolate-studio',version:1,name:'Omani doorway',bar:{width:60,height:120,thickness:7.5,relief:0.65,bevel:0.35},objects:preset('door',60,120),layers:['chocolate','foil','sleeve','carton'].map((t,i)=>({...newLayer(t),visible:i===0})),scene:{background:'#e6e6e2',explode:0,light:1.2,shadow:true},symmetry:{x:true,y:false}};}

// Project files are untrusted input. Limits prevent accidentally allocating giant meshes or SVGs.
export function validateProject(p) {
  if(!p||p.format!=='19-chocolate-studio'||p.version!==1)throw Error('Choose a Chocolate studio .json project.');
  if(!Array.isArray(p.objects)||p.objects.length>300||!Array.isArray(p.layers)||p.layers.length>16)throw Error('Project exceeds the 300 shapes / 16 layers limit.');
  const finite=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
  if(!p.bar||!finite(p.bar.width,20,200)||!finite(p.bar.height,30,300)||!finite(p.bar.thickness,2,20)||!finite(p.bar.relief,0.1,2)||!finite(p.bar.bevel,.1,1))throw Error('Bar dimensions or relief are outside the supported range.');
  const types=['line','freehand','frame','ellipse','rect','diamond','leaf','flower','svg'];
  for(const o of p.objects){
    if(!types.includes(o.type)||!/^[-\w]{1,80}$/.test(o.id)||!finite(o.x,-1000,1000)||!finite(o.y,-1000,1000)||!finite(o.w,.1,1000)||!finite(o.h,.1,1000)||!finite(o.scale,.05,20)||!finite(o.rotation,-360,360)||!finite(o.stroke,.1,20))throw Error('A shape has invalid geometry.');
    if(o.type==='svg'&&(typeof o.svg!=='string'||typeof o.viewBox!=='string'||o.svg.length>1500000))throw Error('A vector form has invalid SVG data.');
    if(o.points&&(!Array.isArray(o.points)||o.points.length>5000||o.points.some(pt=>!Array.isArray(pt)||pt.length!==2||pt.some(v=>!finite(v,-1000,1000)))))throw Error('A stroke has invalid points.');
  }
  const color=v=>/^#[0-9a-f]{6}$/i.test(v);
  for(const l of p.layers){
    if(!/^[-\w]{1,80}$/.test(l.id)||!['chocolate','foil','sleeve','carton'].includes(l.type)||!color(l.color)||!finite(l.coverage,10,100)||!finite(l.offset,-50,50)||!finite(l.artScale,.25,4)||!finite(l.artX,-100,100)||!finite(l.artY,-100,100)||!finite(l.artRotation,-180,180)||!finite(l.roughness,.05,1))throw Error('A packaging layer has invalid properties.');
    if(l.artwork&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(l.artwork))throw Error('Artwork must be an embedded PNG, JPEG or WebP.');
  }
  if(!p.scene||!color(p.scene.background)||!finite(p.scene.explode,0,1)||!finite(p.scene.light,.5,2))throw Error('Scene settings are invalid.');
  p.name=String(p.name||'Untitled').slice(0,100);p.symmetry={x:!!p.symmetry?.x,y:!!p.symmetry?.y};return p;
}
