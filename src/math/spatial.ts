import {evaluate,type ExprNode} from './expression';
export type Vec3={x:number;y:number;z:number};
export type SolidKind='prism'|'pyramid'|'cylinder'|'cone'|'sphere';
export type Dimensions={width:number;depth:number;height:number;radius:number};
export type SpatialObject=
 |{id:string;label:string;kind:'point';position:Vec3}
 |{id:string;label:string;kind:'vector'|'line';from:Vec3;to:Vec3}
 |{id:string;label:string;kind:'plane';normal:Vec3;offset:number};
export const DEFAULT_DIMENSIONS:Dimensions={width:4,depth:3,height:4,radius:2};
export const norm=(p:Vec3)=>Math.hypot(p.x,p.y,p.z);
export function solidMeasures(kind:SolidKind,d:Dimensions){
 for(const n of Object.values(d))if(!Number.isFinite(n)||n<=0||n>20)throw new Error('Las dimensiones deben ser positivas y menores o iguales que 20.');
 const {width:w,depth:b,height:h,radius:r}=d;
 if(kind==='prism')return{area:2*(w*b+w*h+b*h),volume:w*b*h,areaFormula:'2(wd+wh+dh)',volumeFormula:'wdh'};
 if(kind==='pyramid')return{area:w*b+w*Math.hypot(h,b/2)+b*Math.hypot(h,w/2),volume:w*b*h/3,areaFormula:'wd+w√(h²+d²/4)+d√(h²+w²/4)',volumeFormula:'wdh/3'};
 if(kind==='sphere')return{area:4*Math.PI*r*r,volume:4*Math.PI*r**3/3,areaFormula:'4πr²',volumeFormula:'4πr³/3'};
 if(kind==='cylinder')return{area:2*Math.PI*r*(r+h),volume:Math.PI*r*r*h,areaFormula:'2πr(r+h)',volumeFormula:'πr²h'};
 return{area:Math.PI*r*(r+Math.hypot(r,h)),volume:Math.PI*r*r*h/3,areaFormula:'πr(r+√(r²+h²))',volumeFormula:'πr²h/3'};
}
export function validateObject(object:SpatialObject){
 const check=(p:Vec3)=>{if(Object.values(p).some(n=>!Number.isFinite(n)||Math.abs(n)>10))throw new Error('Las coordenadas deben estar entre −10 y 10.');};
 if(object.kind==='point')check(object.position);
 else if(object.kind==='plane'){check(object.normal);if(norm(object.normal)<1e-8)throw new Error('El plano necesita una normal no nula.');if(!Number.isFinite(object.offset)||Math.abs(object.offset)>10)throw new Error('El término d debe estar entre −10 y 10.');}
 else{check(object.from);check(object.to);if(norm({x:object.to.x-object.from.x,y:object.to.y-object.from.y,z:object.to.z-object.from.z})<1e-8)throw new Error('Los puntos A y B deben ser diferentes.');}
 return object;
}
export function objectMeasure(object:SpatialObject){
 validateObject(object);
 if(object.kind==='point')return{label:'Distancia al origen',value:norm(object.position)};
 if(object.kind==='plane')return{label:'Distancia del plano al origen',value:Math.abs(object.offset)/norm(object.normal)};
 const length=norm({x:object.to.x-object.from.x,y:object.to.y-object.from.y,z:object.to.z-object.from.z});
 return{label:object.kind==='vector'?'Módulo del vector':'Distancia entre A y B (recta infinita)',value:length};
}
export function sampleSurface(expr:ExprNode,scope:Record<string,number>,domain:number,resolution=48){
 if(!Number.isFinite(domain)||domain<1||domain>6||!Number.isInteger(resolution)||resolution<8||resolution>64)throw new Error('Dominio o resolución fuera de los límites de la vista.');
 const positions:number[]=[],indices:number[]=[],values:(number|null)[]=[];
 for(let j=0;j<=resolution;j++)for(let i=0;i<=resolution;i++){
  const x=-domain+2*domain*i/resolution,y=-domain+2*domain*j/resolution;let z:number|null=null;
  try{const value=evaluate(expr,{...scope,x,y});if(Math.abs(value)<=10)z=value;}catch{}
  positions.push(x,y,z??0);values.push(z);
 }
 const triangle=(a:number,b:number,c:number)=>{const zs=[values[a],values[b],values[c]];if(zs.every(z=>z!==null)&&Math.max(...zs as number[])-Math.min(...zs as number[])<=4)indices.push(a,b,c);};
 for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){const a=j*(resolution+1)+i,b=a+1,c=a+resolution+1,d=c+1;triangle(a,b,d);triangle(a,d,c);}
 return{positions,indices,omitted:values.filter(z=>z===null).length,triangles:indices.length/3};
}
export function sectionType(angle:number,offset:number){
 if(!Number.isFinite(angle)||angle<0||angle>75||!Number.isFinite(offset)||Math.abs(offset)>3)throw new Error('Plano fuera del intervalo permitido.');
 if(Math.abs(offset)<1e-9)return angle<45?'Punto (degenerada)':angle===45?'Recta tangente (degenerada)':'Dos rectas (degenerada)';
 return angle===0?'Circunferencia':angle<45?'Elipse':angle===45?'Parábola':'Hipérbola';
}
export function coneSection(angle:number,offset:number,limit=6):Vec3[][]{
 sectionType(angle,offset);const m=Math.tan(angle*Math.PI/180);
 if(Math.abs(offset)<1e-9){
  if(angle<45)return[[{x:0,y:0,z:0}]];
  const span=limit/Math.max(1,m);
  if(angle===45)return[[{x:-span,y:0,z:-span},{x:span,y:0,z:span}]];
  const k=Math.sqrt(m*m-1);return[-1,1].map(sign=>[{x:-span,y:-sign*k*span,z:-m*span},{x:span,y:sign*k*span,z:m*span}]);
 }
 const segments:Vec3[][]=[];
 for(const sign of [-1,1]){
  let current:Vec3[]=[];
  for(let i=0;i<=960;i++){
   const t=2*Math.PI*i/960,denominator=sign-m*Math.cos(t),r=offset/denominator;
   if(r>=0&&r<=limit&&Number.isFinite(r))current.push({x:r*Math.cos(t),y:r*Math.sin(t),z:sign*r});
   else{if(current.length>1)segments.push(current);current=[];}
  }
  if(current.length>1)segments.push(current);
 }
 return segments;
}
