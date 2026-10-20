import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {coneSection,type Dimensions,type SolidKind,type SpatialObject} from '../../math/spatial';

export type SceneConfig={mode:'solids'|'objects'|'surfaces'|'sections';solid:SolidKind;dimensions:Dimensions;objects:SpatialObject[];selected:string|null;surface:{positions:number[];indices:number[]}|null;angle:number;offset:number;axes:boolean;grid:boolean;wireframe:boolean;dark:boolean};
export type SpatialSceneHandle={view:(type:'home'|'front'|'top'|'in'|'out')=>void};
function dispose(root:THREE.Object3D){
 root.traverse(object=>{const o=object as THREE.Mesh;o.geometry?.dispose();const materials=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const material of materials){const m=material as THREE.MeshBasicMaterial;m.map?.dispose();material.dispose();}});
}
function label(text:string,position:THREE.Vector3,color:string){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d');if(!ctx)return new THREE.Group();
 ctx.font='bold 32px sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,64,42);
 const texture=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.position.copy(position);sprite.scale.set(1.5,.75,1);return sprite;
}
const vector=(p:{x:number;y:number;z:number})=>new THREE.Vector3(p.x,p.y,p.z);
function line(points:THREE.Vector3[],color:number){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color}));}
function pyramid(w:number,d:number,h:number){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,-d/2,0,w/2,-d/2,0,w/2,d/2,0,-w/2,d/2,0,0,0,h],3));geometry.setIndex([0,2,1,0,3,2,0,1,4,1,2,4,2,3,4,3,0,4]);geometry.computeVertexNormals();return geometry;
}
function content(config:SceneConfig){
 const group=new THREE.Group();
 if(config.grid){const grid=new THREE.GridHelper(20,20,config.dark?0x59757d:0x9eafb3,config.dark?0x283b43:0xe0e8e9);grid.rotateX(Math.PI/2);group.add(grid);}
 if(config.axes){for(const [axis,color] of [[new THREE.Vector3(10,0,0),0xdc645d],[new THREE.Vector3(0,10,0),0x249c83],[new THREE.Vector3(0,0,10),0x698ce2]] as const){group.add(line([axis.clone().negate(),axis],color));}for(const [text,pos,color] of [['x',new THREE.Vector3(10,0,.3),'#dc645d'],['y',new THREE.Vector3(0,10,.3),'#249c83'],['z',new THREE.Vector3(0,0,10.3),'#698ce2']] as const)group.add(label(text,pos,color));}
 const material=(color=0x159b8a,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.05,side:THREE.DoubleSide,wireframe:config.wireframe,transparent:opacity<1,opacity});
 if(config.mode==='solids'){
  const d=config.dimensions;let geometry:THREE.BufferGeometry;
  if(config.solid==='prism')geometry=new THREE.BoxGeometry(d.width,d.depth,d.height);
  else if(config.solid==='pyramid')geometry=pyramid(d.width,d.depth,d.height);
  else if(config.solid==='sphere')geometry=new THREE.SphereGeometry(d.radius,48,32);
  else geometry=new THREE.CylinderGeometry(config.solid==='cone'?0:d.radius,d.radius,d.height,64);
  const mesh=new THREE.Mesh(geometry,material());
  if(config.solid==='cone'||config.solid==='cylinder')mesh.rotateX(Math.PI/2);
  if(config.solid!=='pyramid')mesh.position.z=config.solid==='sphere'?d.radius:d.height/2;
  group.add(mesh);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),new THREE.LineBasicMaterial({color:config.dark?0x99e4d6:0x084f4b}));edges.position.copy(mesh.position);edges.quaternion.copy(mesh.quaternion);group.add(edges);
 }
 if(config.mode==='surfaces'&&config.surface){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(config.surface.positions,3));geometry.setIndex(config.surface.indices);geometry.computeVertexNormals();group.add(new THREE.Mesh(geometry,material()));
 }
 if(config.mode==='objects')for(const object of config.objects){
  const color=object.id===config.selected?0xf39a62:0x159b8a;let center:THREE.Vector3;
  if(object.kind==='point'){center=vector(object.position);const point=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),material(color));point.position.copy(center);group.add(point);}
  else if(object.kind==='plane'){const normal=vector(object.normal),length=normal.length();normal.normalize();center=normal.clone().multiplyScalar(object.offset/length);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(12,12),material(color,.35));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);mesh.position.copy(center);group.add(mesh,new THREE.ArrowHelper(normal,center,2,color));}
  else{const from=vector(object.from),to=vector(object.to),direction=to.clone().sub(from).normalize();center=to;if(object.kind==='vector')group.add(new THREE.ArrowHelper(direction,from,from.distanceTo(to),color,.4,.2));else group.add(line([from.clone().addScaledVector(direction,-20),from.clone().addScaledVector(direction,20)],color));}
  group.add(label(object.label,center.clone().add(new THREE.Vector3(.3,0,.35)),object.id===config.selected?'#de8148':config.dark?'#c8f5eb':'#0b6b61'));
 }
 if(config.mode==='sections'){
  for(const sign of [-1,1]){const mesh=new THREE.Mesh(new THREE.ConeGeometry(6,6,64,1,true),material(0x159b8a,.2));mesh.rotateX(sign===1?-Math.PI/2:Math.PI/2);mesh.position.z=sign*3;group.add(mesh);}
  const m=Math.tan(config.angle*Math.PI/180),normal=new THREE.Vector3(-m,0,1).normalize();
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(15,15),material(0x7a8ad5,.22));plane.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);plane.position.z=config.offset;group.add(plane);
  for(const points of coneSection(config.angle,config.offset)){
   if(points.length===1){const point=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),material(0xf19857));group.add(point);}
   else{const curve=line(points.map(vector),0xff8d4a);(curve.material as THREE.LineBasicMaterial).depthTest=false;curve.renderOrder=10;group.add(curve);}
  }
 }
 return group;
}

const SpatialScene=forwardRef<SpatialSceneHandle,{config:SceneConfig;onReady:(ready:boolean)=>void}>(({config,onReady},ref)=>{
 const host=useRef<HTMLDivElement>(null);const engine=useRef<{renderer:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.PerspectiveCamera;controls:OrbitControls;group:THREE.Group|null}|null>(null);
 const latest=useRef(config);latest.current=config;const readyCallback=useRef(onReady);readyCallback.current=onReady;
 const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);
 useImperativeHandle(ref,()=>({view(type){const e=engine.current;if(!e)return;const {camera,controls}=e;if(type==='in'||type==='out'){camera.position.sub(controls.target).multiplyScalar(type==='in'?.8:1.25).add(controls.target);}else{camera.up.set(0,0,1);controls.target.set(0,0,0);if(type==='home')camera.position.set(13,-17,13);if(type==='front')camera.position.set(0,-22,0);if(type==='top'){camera.up.set(0,1,0);camera.position.set(0,0,22);}}controls.update();}}),[]);
 useEffect(()=>{
  const node=host.current;if(!node)return;let renderer:THREE.WebGLRenderer;
  setError('');readyCallback.current(false);
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch{setError('Este navegador no pudo iniciar WebGL. Activa la aceleración gráfica o prueba otro navegador.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(Math.max(1,node.clientWidth),Math.max(1,node.clientHeight));node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Vista tridimensional: arrastra para rotar, usa la rueda o dos dedos para ampliar.');renderer.domElement.tabIndex=0;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x607078,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(10,-8,15);scene.add(light);
  const camera=new THREE.PerspectiveCamera(45,Math.max(1,node.clientWidth)/Math.max(1,node.clientHeight),.05,500);camera.up.set(0,0,1);camera.position.set(13,-17,13);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=100;controls.update();
  const e={renderer,scene,camera,controls,group:null as THREE.Group|null};engine.current=e;
  scene.background=new THREE.Color(latest.current.dark?0x15252b:0xf8fbfc);e.group=content(latest.current);scene.add(e.group);
  let frame=0,visible=true;
  const render=()=>{frame=requestAnimationFrame(render);if(!document.hidden&&visible){controls.update();renderer.render(scene,camera);}};render();
  const resize=()=>{const w=Math.max(1,node.clientWidth),h=Math.max(1,node.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(node);window.addEventListener('resize',resize);
  const visibility=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;}):null;visibility?.observe(node);
  const lost=(event:Event)=>{event.preventDefault();setError('La vista perdió el contexto gráfico. Pulsa Reintentar para recuperarla.');readyCallback.current(false);};renderer.domElement.addEventListener('webglcontextlost',lost);
  readyCallback.current(true);
  return()=>{readyCallback.current(false);cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',resize);visibility?.disconnect();controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',lost);if(e.group)dispose(e.group);scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();if(engine.current===e)engine.current=null;};
 },[attempt]);
 useEffect(()=>{const e=engine.current;if(!e)return;if(e.group){e.scene.remove(e.group);dispose(e.group);}e.group=content(config);e.scene.add(e.group);e.scene.background=new THREE.Color(config.dark?0x15252b:0xf8fbfc);},[config]);
 return <div className="spatial-viewport" ref={host}>{error&&<div className="spatial-render-error" role="alert"><p>{error}</p><button className="primary" onClick={()=>setAttempt(n=>n+1)}>Reintentar vista 3D</button></div>}</div>;
});
export default SpatialScene;
