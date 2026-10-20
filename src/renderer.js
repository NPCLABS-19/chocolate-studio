import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {vectorRelief} from './vector-relief.js';

function roundRect(w,h,r=1) {
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
function slab(w,h,t,mat){const bevel=Math.min(.65,t*.22);const geo=new THREE.ExtrudeGeometry(roundRect(w-bevel*2,h-bevel*2,1.25),{depth:t-bevel*2,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:5,steps:1,curveSegments:20});geo.translate(0,0,-t/2+bevel);const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m;}

export class MockupRenderer {
  constructor(host,onError){
    this.host=host;this.onError=onError;this.revision=0;this.assets=new Map();this.mode='chocolate';this.disposed=false;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Interactive 3D chocolate and packaging preview. Drag to orbit; scroll to zoom.');
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#e6e6e2');
    this.camera=new THREE.PerspectiveCamera(32,1,.1,2000);this.camera.position.set(82,72,220);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.12;this.controls.minDistance=50;this.controls.maxDistance=700;this.controls.maxPolarAngle=Math.PI;this.controls.target.set(0,0,0);
    const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;room.dispose();pmrem.dispose();
    this.key=new THREE.DirectionalLight('#fff8ed',4);this.key.position.set(-90,110,95);this.key.castShadow=true;this.key.shadow.mapSize.set(4096,4096);Object.assign(this.key.shadow.camera,{left:-130,right:130,top:170,bottom:-170,near:1,far:500});this.key.shadow.bias=-.00005;this.key.shadow.normalBias=.025;this.key.shadow.radius=.5;this.scene.add(this.key);
    const fill=new THREE.DirectionalLight('#eff4ff',.4);fill.position.set(100,-20,80);this.scene.add(fill);this.scene.add(new THREE.HemisphereLight('#ffffff','#878b7c',.35));
    this.ground=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.ShadowMaterial({opacity:.43}));this.ground.position.z=-4;this.ground.receiveShadow=true;this.scene.add(this.ground);
    this.product=new THREE.Group();this.scene.add(this.product);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();this.animate();
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;const changed=this.lastWidth!==w||this.lastHeight!==h;this.lastWidth=w;this.lastHeight=h;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();if(changed&&this.project)this.resetCamera();}
  animate(){if(this.disposed)return;this.frame=requestAnimationFrame(()=>this.animate());this.controls.update();this.renderer.render(this.scene,this.camera);}
  resetCamera(view='perspective'){const h=this.project?.bar.height||99;const dist=Math.max(h*2.25,(this.project?.bar.width||50)*2.25/this.camera.aspect);this.controls.target.set(0,0,0);this.camera.position.set(view==='front'?0:dist*.27,view==='front'?0:dist*.22,dist);this.camera.up.set(0,1,0);this.controls.update();}
  clear(){while(this.product.children.length){const o=this.product.children[0];this.product.remove(o);o.traverse(n=>{n.geometry?.dispose();if(n.material){for(const m of Array.isArray(n.material)?n.material:[n.material]){m.map?.dispose();m.dispose();}}});}}
  textureFor(layer,w,h){
    const c=document.createElement('canvas');c.width=1024;c.height=Math.max(128,Math.round(1024*h/w));const ctx=c.getContext('2d');ctx.fillStyle=layer.color;ctx.fillRect(0,0,c.width,c.height);
    if(layer.artwork&&this.assets.has(layer.artwork)){const img=this.assets.get(layer.artwork);ctx.save();ctx.translate(c.width/2+layer.artX/100*c.width,c.height/2+layer.artY/100*c.height);ctx.rotate(layer.artRotation*Math.PI/180);const scale=Math.max(c.width/img.width,c.height/img.height)*layer.artScale;ctx.drawImage(img,-img.width*scale/2,-img.height*scale/2,img.width*scale,img.height*scale);ctx.restore();}
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();return texture;
  }
  wrapper(layer,index,p){
    const {width:w,height:h,thickness:t,relief:r}=p.bar,g=new THREE.Group();g.userData.layer=layer.id;g.visible=layer.visible;
    const gap=.35+index*.5,W=w+gap*2,H=h+gap*1.2,y=0,z=t/2+r+gap;
    const foil=layer.type==='foil';const mat=new THREE.MeshStandardMaterial({color:foil?layer.color:'#ffffff',metalness:foil?.93:0,roughness:layer.roughness,side:THREE.DoubleSide,map:foil?null:this.textureFor(layer,W,H)});
    if(foil&&layer.artwork)mat.map=this.textureFor(layer,W,H);
    const geo=new THREE.PlaneGeometry(W,H,foil?60:1,foil?90:1);
    if(foil){const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),py=pos.getY(i),edge=Math.pow(Math.abs(py/H*2),8)+Math.pow(Math.abs(x/W*2),10);const crease=.1*Math.exp(-Math.pow((x+.23*py-W*.2)/.7,2))-.07*Math.exp(-Math.pow((x-.18*py+W*.28)/.5,2));const fold=(Math.sin(x*.9+py*.3)*.025+Math.sin(x*.31-py*1.1)*.018)*edge;pos.setZ(i,crease+fold);}geo.computeVertexNormals();}
    const front=new THREE.Mesh(geo,mat);front.position.set(0,y,z);front.castShadow=true;front.receiveShadow=true;g.add(front);
    const sideMat=new THREE.MeshStandardMaterial({color:layer.color,metalness:foil?.9:0,roughness:layer.roughness,side:THREE.DoubleSide});
    const back=new THREE.Mesh(new THREE.PlaneGeometry(W,H),sideMat);back.position.set(0,y,-z);back.rotation.y=Math.PI;g.add(back);
    for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(z*2,H),sideMat);m.rotation.y=side*Math.PI/2;m.position.set(side*W/2,y,0);m.castShadow=true;g.add(m);}
    if(layer.type==='carton'||foil){for(const side of [-1,1]){const end=new THREE.Mesh(new THREE.PlaneGeometry(W,z*2),sideMat);end.rotation.x=side*Math.PI/2;end.position.set(0,side*H/2,0);end.castShadow=true;g.add(end);}if(layer.type==='carton'){const seam=new THREE.Mesh(new THREE.BoxGeometry(W*.82,.11,.12),new THREE.MeshStandardMaterial({color:layer.color,roughness:.8}));seam.position.set(0,H/2+.01,z*.5);g.add(seam);}}
    if(!foil){const edge=new THREE.Mesh(new THREE.BoxGeometry(W,.17,.2),sideMat);edge.position.set(0,y+H/2,z);g.add(edge);}
    g.position.z=p.scene.explode*(index+1)*22;return g;
  }
  async update(p){
    const revision=++this.revision;const oldBar=this.project?.bar,dimensionsChanged=!oldBar||oldBar.width!==p.bar.width||oldBar.height!==p.bar.height||oldBar.thickness!==p.bar.thickness;this.project=p;
    try{
      for(const l of p.layers){if(l.artwork&&!this.assets.has(l.artwork)){const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(Error('A packaging image could not be loaded.'));img.src=l.artwork;});this.assets.set(l.artwork,img);}}
      const vector=vectorRelief(p,this.mode==='mould'),geo=vector.relief;if(revision!==this.revision){geo.dispose();vector.floor?.dispose();return;}
      this.clear();this.scene.background.set(p.scene.background);this.key.intensity=p.scene.light*3;this.ground.visible=p.scene.shadow;this.ground.position.z=-p.bar.thickness/2-.8;
      const {width:w,height:h,thickness:t}=p.bar;
      if(this.mode==='mould'){
        const mat=new THREE.MeshPhysicalMaterial({color:'#6e8984',roughness:.3,metalness:0,transmission:.08,thickness:2,ior:1.58,clearcoat:.2,envMapIntensity:.65});
        const outer=roundRect(w+16,h+16,2);const hole=new THREE.Path();hole.moveTo(-w/2,-h/2);hole.lineTo(-w/2,h/2);hole.lineTo(w/2,h/2);hole.lineTo(w/2,-h/2);hole.closePath();outer.holes.push(hole);
        const rim=new THREE.Mesh(new THREE.ExtrudeGeometry(outer,{depth:t,bevelEnabled:true,bevelSize:.4,bevelThickness:.4,bevelSegments:2}),mat);rim.castShadow=true;this.product.add(rim);
        const floor=new THREE.Mesh(vector.floor,mat);floor.receiveShadow=true;this.product.add(floor);const recess=new THREE.Mesh(geo,mat);recess.receiveShadow=true;recess.castShadow=true;this.product.add(recess);const bottom=slab(w+16,h+16,1.4,mat);bottom.position.z=-p.bar.relief-1.2;this.product.add(bottom);
      }else{
        const chocolate=p.layers.find(l=>l.type==='chocolate');
        if(chocolate?.visible){const mat=new THREE.MeshPhysicalMaterial({color:chocolate.color,roughness:chocolate.roughness,metalness:0,clearcoat:.12,clearcoatRoughness:.45});const base=slab(w,h,t,mat);this.product.add(base);const surface=new THREE.Mesh(geo,mat);surface.position.z=t/2-.012;surface.castShadow=true;surface.receiveShadow=true;this.product.add(surface);}else geo.dispose();
        p.layers.filter(l=>l.type!=='chocolate').forEach((l,i)=>this.product.add(this.wrapper(l,i,p)));
      }
      if(dimensionsChanged)this.resetCamera();this.host.dataset.ready='true';this.host.querySelector('.loading')?.remove();this.renderer.render(this.scene,this.camera);this.host.dispatchEvent(new Event('modelready'));
    }catch(error){this.onError(error.message);}
  }
  async exportPNG(width=2400){
    const height=Math.round(width*1.15),oldSize=new THREE.Vector2();this.renderer.getSize(oldSize);const ratio=this.renderer.getPixelRatio(),aspect=this.camera.aspect;
    try{this.renderer.setPixelRatio(1);this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);const blob=await new Promise(resolve=>this.renderer.domElement.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG export failed.');return blob;
    }finally{this.renderer.setPixelRatio(ratio);this.renderer.setSize(oldSize.x,oldSize.y,false);this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
  }
}
