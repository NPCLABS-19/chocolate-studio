import test from 'node:test';
import assert from 'node:assert/strict';
import {object,initialProject,validateProject} from '../src/pattern.js';
import {objectBounds,objectCopies,resizeObject,rotateObject} from '../src/transform.js';
const bar={width:100,height:150},copy={sx:1,sy:1};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} differs from ${expected}`);

test('corner resizing holds the opposite corner fixed and preserves proportions',()=>{
  const original=object('rect',50,50,{w:20,h:40}),next=resizeObject(original,'se',[70,90],copy,bar);
  close(next.scale,1.5);close(next.x,55);close(next.y,60);
  close(next.x-next.w*next.scale/2,40);close(next.y-next.h*next.scale/2,30);
  assert.equal(next.w/next.h,original.w/original.h);assert.equal(original.scale,1);
});
test('edge handles resize a linked pattern from the opposite edge',()=>{
  const original=object('rect',50,50,{w:20,h:40});
  const east=resizeObject(original,'e',[70,50],copy,bar);close(east.scale,1.5);close(east.x,55);close(east.y,50);
  const north=resizeObject(original,'n',[50,10],copy,bar);close(north.scale,1.5);close(north.x,50);close(north.y,40);
});
test('resizing a rotated form keeps its opposite corner stationary',()=>{
  const original=object('rect',50,50,{w:20,h:40,rotation:90}),next=resizeObject(original,'se',[-10,80],copy,bar);
  close(next.scale,2);close(next.x,30);close(next.y,60);assert.equal(next.rotation,90);
  close(next.x+next.h*next.scale/2,70);close(next.y-next.w*next.scale/2,40);
});
test('handles on a mirrored copy resize its linked original in the correct direction',()=>{
  const original=object('rect',25,40,{w:10,h:20,mirrorX:true});
  const next=resizeObject(original,'se',[50,60],{sx:-1,sy:1},{width:85,height:147});
  close(next.scale,1.5);close(next.x,27.5);close(next.y,45);
  assert.deepEqual(objectCopies({...original,mirrorY:true}),[{sx:1,sy:1},{sx:-1,sy:1},{sx:1,sy:-1},{sx:-1,sy:-1}]);
});
test('freehand selection bounds include negative points and stroke; resizing leaves stroke data intact',()=>{
  const original=object('freehand',20,30,{points:[[-10,-4],[5,6]],stroke:2});
  assert.deepEqual(objectBounds(original),{x:-11,y:-5,width:17,height:12});
  const next=resizeObject(original,'se',[40,50],copy,bar);assert.deepEqual(next.points,original.points);
  const p=initialProject();p.objects=[next];validateProject(p);
});
test('crossing an anchor cannot invert a pattern, and extreme drags remain valid projects',()=>{
  const original=object('rect',50,50,{w:20,h:40});
  const small=resizeObject(original,'se',[-100,-100],copy,bar);assert.equal(small.scale,.05);
  const large=resizeObject(original,'se',[100000,100000],copy,bar);assert.equal(large.scale,20);
  const p=initialProject();p.objects=[large];validateProject(p);
});
test('rotation handles support mirrored copies and Shift snapping without moving the form',()=>{
  const original=object('rect',50,50,{w:20,h:40});
  const next=rotateObject(original,[50,10],[90,50],copy,bar);close(next.rotation,90);assert.equal(next.x,50);assert.equal(next.y,50);
  close(rotateObject(original,[50,10],[10,50],{sx:-1,sy:1},bar).rotation,90);
  const pointer=[50+40*Math.cos(-70*Math.PI/180),50+40*Math.sin(-70*Math.PI/180)];
  close(rotateObject(original,[50,10],pointer,copy,bar,true).rotation,15);
});
