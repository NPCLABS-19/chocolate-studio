// Transform controls use the same local -> scale -> rotation -> mirror order as the artwork.
export const HANDLE_DIRECTIONS={nw:[-1,-1],n:[0,-1],ne:[1,-1],e:[1,0],se:[1,1],s:[0,1],sw:[-1,1],w:[-1,0]};
const radians=degrees=>degrees*Math.PI/180;
const rotate=([x,y],angle)=>[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];

export function objectBounds(o){
  let left=-o.w/2,right=o.w/2,top=-o.h/2,bottom=o.h/2;
  if(o.points?.length){const xs=o.points.map(p=>p[0]),ys=o.points.map(p=>p[1]);left=Math.min(...xs);right=Math.max(...xs);top=Math.min(...ys);bottom=Math.max(...ys);}
  const padding=o.points||(!o.filled&&o.type!=='svg')?o.stroke/2:0;
  const width=Math.max(.5,right-left+padding*2),height=Math.max(.5,bottom-top+padding*2);
  return {x:(left+right-width)/2,y:(top+bottom-height)/2,width,height};
}

export function objectCopies(o){
  const copies=[{sx:1,sy:1}];
  if(o.mirrorX)copies.push({sx:-1,sy:1});
  if(o.mirrorY)copies.push({sx:1,sy:-1});
  if(o.mirrorX&&o.mirrorY)copies.push({sx:-1,sy:-1});
  return copies;
}

export function unmirrorPoint([x,y],copy,bar){return [copy.sx<0?bar.width-x:x,copy.sy<0?bar.height-y:y];}

export function canvasToObjectPoint(o,pointer,copy,bar){
  const [x,y]=unmirrorPoint(pointer,copy,bar);
  const [lx,ly]=rotate([x-o.x,y-o.y],-radians(o.rotation));
  return [lx/o.scale,ly/o.scale];
}

export function resizeObject(o,handle,pointer,copy,bar){
  const [dx,dy]=HANDLE_DIRECTIONS[handle],b=objectBounds(o),cx=b.x+b.width/2,cy=b.y+b.height/2;
  const anchor=[cx-dx*b.width/2,cy-dy*b.height/2],vector=[dx*b.width,dy*b.height];
  const local=canvasToObjectPoint(o,pointer,copy,bar),delta=[local[0]-anchor[0],local[1]-anchor[1]];
  const factor=(delta[0]*vector[0]+delta[1]*vector[1])/(vector[0]**2+vector[1]**2);
  const scale=Math.min(20,Math.max(.05,o.scale*factor));
  const [shiftX,shiftY]=rotate(anchor.map(v=>v*(o.scale-scale)),radians(o.rotation));
  return {...o,x:Math.min(1000,Math.max(-1000,o.x+shiftX)),y:Math.min(1000,Math.max(-1000,o.y+shiftY)),scale};
}

export function rotateObject(o,start,pointer,copy,bar,snap=false){
  const angle=p=>{const [x,y]=unmirrorPoint(p,copy,bar);return Math.atan2(y-o.y,x-o.x)*180/Math.PI;};
  const delta=((angle(pointer)-angle(start)+540)%360)-180;
  let rotation=o.rotation+delta;
  if(snap)rotation=Math.round(rotation/15)*15;
  rotation=((rotation+540)%360)-180;
  return {...o,rotation};
}
