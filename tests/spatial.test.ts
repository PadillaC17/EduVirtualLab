import {describe,it,expect} from 'vitest';
import {parseStatement} from '../src/math/expression';
import {coneSection,DEFAULT_DIMENSIONS,objectMeasure,sampleSurface,sectionType,solidMeasures,validateObject} from '../src/math/spatial';

describe('medidas de sólidos',()=>{
 it('calcula área y volumen de un prisma 2×3×4',()=>{const m=solidMeasures('prism',{...DEFAULT_DIMENSIONS,width:2,depth:3,height:4});expect(m.area).toBe(52);expect(m.volume).toBe(24);});
 it('calcula la pirámide recta cuadrada de lado 6 y altura 4',()=>{const m=solidMeasures('pyramid',{width:6,depth:6,height:4,radius:2});expect(m.area).toBe(96);expect(m.volume).toBe(48);});
 it('calcula cono r=3,h=4, esfera r=3 y cilindro r=3,h=4',()=>{const d={...DEFAULT_DIMENSIONS,radius:3,height:4};expect(solidMeasures('cone',d).area).toBeCloseTo(24*Math.PI);expect(solidMeasures('cone',d).volume).toBeCloseTo(12*Math.PI);expect(solidMeasures('sphere',d).volume).toBeCloseTo(36*Math.PI);expect(solidMeasures('cylinder',d).area).toBeCloseTo(42*Math.PI);});
 it('al duplicar el radio, el volumen del cono se cuadruplica',()=>{const d=DEFAULT_DIMENSIONS;expect(solidMeasures('cone',{...d,radius:d.radius*2}).volume/solidMeasures('cone',d).volume).toBeCloseTo(4);});
 it.each([0,-1,Infinity,NaN])('rechaza dimensiones degeneradas: %s',n=>{expect(()=>solidMeasures('cone',{...DEFAULT_DIMENSIONS,radius:n})).toThrow();});
});
describe('objetos espaciales',()=>{
 it('mide el módulo de un vector 2,3,6',()=>{expect(objectMeasure({id:'v',label:'v',kind:'vector',from:{x:0,y:0,z:0},to:{x:2,y:3,z:6}}).value).toBe(7);});
 it('usa la normal completa para medir la distancia a un plano',()=>{expect(objectMeasure({id:'p',label:'p',kind:'plane',normal:{x:0,y:3,z:4},offset:10}).value).toBe(2);});
 it('rechaza una recta definida por dos puntos coincidentes',()=>{expect(()=>validateObject({id:'l',label:'r',kind:'line',from:{x:1,y:2,z:3},to:{x:1,y:2,z:3}})).toThrow('diferentes');});
 it('rechaza una normal nula',()=>{expect(()=>validateObject({id:'p',label:'p',kind:'plane',normal:{x:0,y:0,z:0},offset:2})).toThrow('no nula');});
});
describe('secciones reales del cono',()=>{
 it.each([[0,'Circunferencia'],[30,'Elipse'],[45,'Parábola'],[60,'Hipérbola']] as const)('clasifica θ=%s', (angle,name)=>{expect(sectionType(angle,1.5)).toBe(name);});
 it.each([0,30,45,60])('todos los puntos satisfacen el cono y el plano: %s°',angle=>{
  const segments=coneSection(angle,1.5);expect(segments.length).toBeGreaterThan(0);const m=Math.tan(angle*Math.PI/180);
  for(const p of segments.flat()){expect(p.x*p.x+p.y*p.y).toBeCloseTo(p.z*p.z,8);expect(p.z).toBeCloseTo(m*p.x+1.5,8);expect(Math.abs(p.z)).toBeLessThanOrEqual(6.000001);}
 });
 it.each([0,45,60])('detecta las secciones degeneradas y sus puntos: %s°',angle=>{
  expect(sectionType(angle,0)).toContain('degenerada');
  for(const p of coneSection(angle,0).flat()){expect(p.x*p.x+p.y*p.y).toBeCloseTo(p.z*p.z,8);expect(p.z).toBeCloseTo(Math.tan(angle*Math.PI/180)*p.x,8);}
 });
});
describe('mallas de superficies',()=>{
 it('evalúa z=x²+y² en cada vértice utilizado',()=>{const s=parseStatement('z=x²+y²');if(s.kind!=='surface3d')throw Error();const mesh=sampleSurface(s.expr,{},2,16);expect(mesh.triangles).toBeGreaterThan(0);for(const i of new Set(mesh.indices)){const [x,y,z]=mesh.positions.slice(i*3,i*3+3);expect(z).toBeCloseTo(x*x+y*y,8);}});
 it('omite puntos fuera del dominio real en una semiesfera',()=>{const s=parseStatement('z=sqrt(1-x²-y²)');if(s.kind!=='surface3d')throw Error();const mesh=sampleSurface(s.expr,{},2,16);expect(mesh.omitted).toBeGreaterThan(0);for(const i of new Set(mesh.indices)){const [x,y,z]=mesh.positions.slice(i*3,i*3+3);expect(x*x+y*y+z*z).toBeCloseTo(1,7);}});
 it('aplica parámetros explícitos sin cambiar x e y',()=>{const s=parseStatement('z=a*x+y');if(s.kind!=='surface3d')throw Error();const mesh=sampleSurface(s.expr,{a:2},1,8);expect(mesh.positions.slice(0,3)).toEqual([-1,-1,-3]);});
});
