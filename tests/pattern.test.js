import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validateProject,svgDocument,preset,mirrors,newLayer,applyBarFormat,migrateBarFormat} from '../src/pattern.js';
import {traceProject} from '../src/traces.js';
import {readFileSync} from 'node:fs';
test('project round-trip preserves hidden packaging and linked mirrored forms',()=>{const p=initialProject();const next=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(next,p);assert.equal(next.layers.length,4);assert.equal(next.layers.filter(l=>l.visible).length,1);assert.ok(next.objects.some(o=>o.mirrorX));});
test('SVG exports a continuous face in mm, mirrors as geometry, and hides removed forms',()=>{const p=initialProject();p.objects[0].visible=false;const svg=svgDocument(p);assert.match(svg,/width="85mm" height="147mm"/);assert.match(svg,/translate\(85 0\) scale\(-1 1\)/);assert.ok(!svg.includes(p.objects[0].name));assert.match(svg,/Relief 0.55 mm/);});
test('mirror combinations preserve original and cover both axes',()=>{assert.equal(mirrors({mirrorX:true,mirrorY:true},50,100).length,4);assert.equal(mirrors({},50,100).length,1);});
test('unsafe dimensions and unsupported embedded artwork are rejected',()=>{const p=initialProject();p.bar.width=100000;assert.throws(()=>validateProject(p));const q=initialProject();q.layers[1].artwork='https://example.com/asset.png';assert.throws(()=>validateProject(q));});
test('empty design and removal of all packaging layers remain valid projects',()=>{const p=initialProject();p.objects=preset('blank');p.layers=[];assert.equal(validateProject(p).objects.length,0);assert.equal(newLayer('foil').type,'foil');});
test('new bars use the No. 749 footprint and 6 mm base and every wrapper is full cover',()=>{const p=initialProject();assert.equal(p.bar.width,85);assert.equal(p.bar.height,147);assert.equal(p.bar.thickness,6);assert.equal(p.bar.relief,.55);assert.equal(p.bar.bevel,.25);for(const type of ['foil','sleeve','carton']){const l=newLayer(type);assert.equal(l.coverage,100);assert.equal(l.offset,0);}});
test('source traces keep raw contours separate from broadened relief projects',()=>{const entries=JSON.parse(readFileSync(new URL('../public/library/traces/manifest.json',import.meta.url),'utf8'));assert.equal(entries.length,8);for(const entry of entries){const raw=traceProject(entry,true),broad=traceProject(entry);assert.equal(raw.bar.width/raw.bar.height,.5);assert.notEqual(raw.objects[0].svg,broad.objects[0].svg);assert.match(raw.objects[0].svg,/fill-rule="evenodd"/);validateProject(raw);validateProject(broad);}});

test('square toggles update physical dimensions, retain materials, and do not shrink the pattern on repeated cycles',()=>{
  const p=initialProject(),original=structuredClone(p),point=p.objects.find(o=>o.type==='line').points;
  for(let i=0;i<4;i++){
    applyBarFormat(p,'square');
    assert.equal(p.bar.width,p.bar.height);assert.equal(p.bar.width,85);assert.equal(p.bar.thickness,3.2);
    assert.deepEqual(p.layers,original.layers);assert.deepEqual(point,p.objects.find(o=>o.type==='line').points);
    validateProject(p);assert.match(svgDocument(p),/width="85mm" height="85mm"/);
    applyBarFormat(p,'mfs749');
    for(let j=0;j<p.objects.length;j++)for(const key of ['x','y','scale'])assert.ok(Math.abs(p.objects[j][key]-original.objects[j][key])<1e-9);
  }
  assert.deepEqual(p.bar,original.bar);
});
test('legacy autosaves upgrade once while retaining artwork, relief settings and custom sizes',()=>{
  const p=initialProject();p.bar={width:60,height:120,thickness:7.5,relief:.55,bevel:.12};delete p.barFormatVersion;
  const artwork=p.objects[0],layers=structuredClone(p.layers);
  assert.equal(migrateBarFormat(p),true);assert.equal(p.bar.width,85);assert.equal(p.bar.height,147);assert.equal(p.bar.thickness,6);
  assert.equal(p.bar.relief,.55);assert.equal(p.bar.bevel,.12);assert.equal(p.objects[0],artwork);assert.deepEqual(p.layers,layers);
  p.bar.width=60;p.bar.height=120;p.bar.thickness=7.5;assert.equal(migrateBarFormat(p),false);assert.equal(p.bar.width,60);
  const custom=initialProject();delete custom.barFormatVersion;custom.bar.width=73;
  assert.equal(migrateBarFormat(custom),false);assert.equal(custom.bar.width,73);
});

test('previous 10.3 mm preset autosaves adopt weight-based depths without changing the pattern',()=>{
  for(const [height,depth] of [[147,6],[85,3.2]]){
    const p=initialProject();p.bar.height=height;p.bar.thickness=10.3;p.barFormatVersion=1;
    const objects=structuredClone(p.objects),layers=structuredClone(p.layers);
    assert.equal(migrateBarFormat(p),true);assert.equal(p.bar.thickness,depth);assert.equal(p.bar.height,height);
    assert.deepEqual(p.objects,objects);assert.deepEqual(p.layers,layers);assert.equal(p.barFormatVersion,3);
    p.bar.thickness=10.3;assert.equal(migrateBarFormat(p),false);assert.equal(p.bar.thickness,10.3);
  }
  const custom=initialProject();custom.barFormatVersion=1;custom.bar.thickness=5;
  assert.equal(migrateBarFormat(custom),false);assert.equal(custom.bar.thickness,5);
});

test('saved rectangular 4.3 mm presets upgrade to a 6 mm base without moving the artwork',()=>{
  const p=initialProject();p.bar.thickness=4.3;p.barFormatVersion=2;
  const objects=structuredClone(p.objects),layers=structuredClone(p.layers),relief=p.bar.relief;
  assert.equal(migrateBarFormat(p),true);assert.equal(p.bar.thickness,6);assert.equal(p.bar.width,85);assert.equal(p.bar.height,147);
  assert.deepEqual(p.objects,objects);assert.deepEqual(p.layers,layers);assert.equal(p.bar.relief,relief);
  p.bar.thickness=4.3;assert.equal(migrateBarFormat(p),false);assert.equal(p.bar.thickness,4.3);
  const square=initialProject();applyBarFormat(square,'square');square.barFormatVersion=2;
  assert.equal(migrateBarFormat(square),false);assert.equal(square.bar.thickness,3.2);
});
