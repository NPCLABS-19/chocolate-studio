import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initialProject, validateProject, svgDocument, migrateAppearance} from '../src/pattern.js';
import {shortlistProject, applyShortlistPreset, shortlistURL} from '../src/shortlist.js';

const entries=JSON.parse(readFileSync(new URL('../public/shortlist/manifest.json',import.meta.url),'utf8'));

test('every shortlisted SVG is placed within the correct physical face with no mirroring',()=>{
  assert.equal(entries.length,20);
  assert.equal(new Set(entries.map(entry=>entry.id)).size,20);
  assert.equal(entries.filter(entry=>entry.format==='square').length,8);
  for(const entry of entries){
    const original=readFileSync(new URL('../public/shortlist/originals/'+entry.source,import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'),entry.sourceHash);
    const project=validateProject(shortlistProject(entry));
    assert.equal(project.bar.relief,.55);assert.equal(project.bar.bevel,.25);
    const square=entry.format==='square';
    assert.deepEqual([project.bar.width,project.bar.height,project.bar.thickness],[85,square?85:147,square?3.2:6]);
    const form=project.objects[0];
    assert.deepEqual([form.x,form.y,form.w,form.h,form.rotation,form.scale],[42.5,project.bar.height/2,85,project.bar.height,0,1]);
    assert.equal(form.mirrorX,false);assert.equal(form.mirrorY,false);
    assert.equal(entry.path.includes('NaN'),false);
    assert.ok(entry.bounds[0]>=.999&&entry.bounds[1]>=.999);
    assert.ok(entry.bounds[2]<=84.001&&entry.bounds[3]<=project.bar.height-.999);
    assert.match(svgDocument(project),new RegExp(`width="85mm" height="${project.bar.height}mm"`));
  }
});

test('switching presets updates dimensions and restores approved placement without accumulating transforms',()=>{
  const p=initialProject();
  p.layers[1].artwork='data:image/png;base64,YQ==';
  p.scene.explode=1;
  p.traceId='T01';
  const material=p.layers[0].color;
  for(const id of ['asset-26','asset-23','asset-8','asset-22','asset-26']){
    const entry=entries.find(entry=>entry.id===id);
    applyShortlistPreset(p,entry);
    const fresh=shortlistProject(entry);
    assert.deepEqual(p.bar,fresh.bar);
    assert.deepEqual({...p.objects[0],id:''},{...fresh.objects[0],id:''});
    assert.equal(p.layers[1].artwork,'data:image/png;base64,YQ==');
    assert.equal(p.layers[0].color,material);
    assert.equal(p.scene.explode,0);
    assert.equal(p.traceId,undefined);
    assert.deepEqual(p.layers.map(layer=>layer.visible),[true,false,false,false]);
    validateProject(p);
  }
});

test('design links select a single pristine preset and discard unrelated editor query parameters',()=>{
  assert.equal(shortlistURL('https://npclabs-19.github.io/chocolate-studio/?trace=T01&raw=1&view=mould#old','asset-23'),
    'https://npclabs-19.github.io/chocolate-studio/?mould=asset-23');
});


test('red and dark cacao defaults upgrade legacy sessions once and retain later user choices',()=>{
  const p=initialProject();delete p.appearanceVersion;
  p.scene.background='#ff0000';p.layers[0].color='#49291c';
  assert.equal(migrateAppearance(p),true);
  assert.equal(p.scene.background,'#ff0000');assert.equal(p.layers[0].color,'#3b1d12');
  p.scene.background='#123456';p.layers[0].color='#654321';
  assert.equal(migrateAppearance(p),false);
  assert.equal(p.scene.background,'#123456');assert.equal(p.layers[0].color,'#654321');
  const preset=shortlistProject(entries[0]);assert.equal(preset.scene.background,'#ff0000');
});
