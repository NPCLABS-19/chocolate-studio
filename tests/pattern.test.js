import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validateProject,svgDocument,preset,mirrors,newLayer,BAR_FORMATS,applyBarFormat,migrateBarFormat} from '../src/pattern.js';
import {traceProject} from '../src/traces.js';
import {readFileSync} from 'node:fs';
test('project round-trip preserves hidden packaging and linked mirrored forms',()=>{const p=initialProject();const next=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(next,p);assert.equal(next.layers.length,4);assert.equal(next.layers.filter(l=>l.visible).length,1);assert.ok(next.objects.some(o=>o.mirrorX));});
test('SVG exports a continuous face in mm, mirrors as geometry, and hides removed forms',()=>{const p=initialProject();p.objects[0].visible=false;const svg=svgDocument(p);assert.match(svg,/width="85mm" height="147mm"/);assert.match(svg,/translate\(85 0\) scale\(-1 1\)/);assert.ok(!svg.includes(p.objects[0].name));assert.match(svg,/Relief 0.65 mm/);});
test('mirror combinations preserve original and cover both axes',()=>{assert.equal(mirrors({mirrorX:true,mirrorY:true},50,100).length,4);assert.equal(mirrors({},50,100).length,1);});
test('unsafe dimensions and unsupported embedded artwork are rejected',()=>{const p=initialProject();p.bar.width=100000;assert.throws(()=>validateProject(p));const q=initialProject();q.layers[1].artwork='https://example.com/asset.png';assert.throws(()=>validateProject(q));});
test('empty design and removal of all packaging layers remain valid projects',()=>{const p=initialProject();p.objects=preset('blank');p.layers=[];assert.equal(validateProject(p).objects.length,0);assert.equal(newLayer('foil').type,'foil');});
test('new bars use MFS No. 749 dimensions and every wrapper is full cover',()=>{const p=initialProject();assert.equal(p.bar.width,85);assert.equal(p.bar.height,147);assert.equal(p.bar.thickness,10.3);for(const type of ['foil','sleeve','carton']){const l=newLayer(type);assert.equal(l.coverage,100);assert.equal(l.offset,0);}});
test('source traces keep raw contours separate from broadened relief projects',()=>{const entries=JSON.parse(readFileSync(new URL('../public/library/traces/manifest.json',import.meta.url),'utf8'));assert.equal(entries.length,8);for(const entry of entries){const raw=traceProject(entry,true),broad=traceProject(entry);assert.equal(raw.bar.width/raw.bar.height,.5);assert.notEqual(raw.objects[0].svg,broad.objects[0].svg);assert.match(raw.objects[0].svg,/fill-rule="evenodd"/);validateProject(raw);validateProject(broad);}});

test('square toggles update physical dimensions, retain materials, and do not shrink the pattern on repeated cycles',()=>{
  const p=initialProject(),original=structuredClone(p),point=p.objects.find(o=>o.type==='line').points;
  for(let i=0;i<4;i++){
    applyBarFormat(p,'square');
    assert.equal(p.bar.width,p.bar.height);assert.equal(p.bar.width,85);assert.equal(p.bar.thickness,10.3);
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
  assert.equal(migrateBarFormat(p),true);assert.equal(p.bar.width,85);assert.equal(p.bar.height,147);assert.equal(p.bar.thickness,10.3);
  assert.equal(p.bar.relief,.55);assert.equal(p.bar.bevel,.12);assert.equal(p.objects[0],artwork);assert.deepEqual(p.layers,layers);
  p.bar.width=60;p.bar.height=120;p.bar.thickness=7.5;assert.equal(migrateBarFormat(p),false);assert.equal(p.bar.width,60);
  const custom=initialProject();delete custom.barFormatVersion;custom.bar.width=73;
  assert.equal(migrateBarFormat(custom),false);assert.equal(custom.bar.width,73);
});
