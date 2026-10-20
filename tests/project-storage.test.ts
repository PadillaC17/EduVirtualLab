import {describe,expect,it} from 'vitest';
import {MAX_IMPORT_BYTES,parseProjectFile,validateConics,validatePlane,validateSpatial} from '../src/storage/projectStorage';

const valid={
 schemaVersion:1,
 kind:'eduvirtual-project',
 exportedAt:'2026-10-20T00:00:00.000Z',
 app:'EduVirtual Lab',
 data:{
  plane:{points:[{id:'a',label:'A',x:1,y:2,color:'#0f9385'}],view:{cx:0,cy:0,scale:45},grid:true,axes:true},
  conics:{type:'parabola',orientation:'vertical',h:0,k:0,p:2,a:4,b:2.5,showGuides:true,showDefinition:true},
  expression:{input:'y=x²',submitted:'y=x²',mode:'text',xValue:'2',params:{}},
  spatial:{mode:'solids',solid:'cone',dimensions:{width:4,depth:3,height:4,radius:2},objects:[],selected:null,source:'z=x²+y²',submitted:'z=x²+y²',params:{},domain:3,angle:35,offset:1.5,axes:true,grid:true,wireframe:false},
  research:[],
  ui:{module:'2d',workspace:'conics'}
 }
};

describe('Phase 5 project files',()=>{
 it('accepts a complete version 1 project',()=>{
  const parsed=parseProjectFile(JSON.stringify(valid));
  expect(parsed.kind).toBe('eduvirtual-project');
  expect(parsed.data.plane?.points[0].label).toBe('A');
  expect(parsed.data.conics?.type).toBe('parabola');
 });
 it('rejects unsupported schema versions',()=>{
  expect(()=>parseProjectFile(JSON.stringify({...valid,schemaVersion:9}))).toThrow();
 });
 it('rejects malformed plane coordinates',()=>{
  const copy=structuredClone(valid);copy.data.plane.points[0].x=50000;
  expect(()=>parseProjectFile(JSON.stringify(copy))).toThrow(/Plano libre/);
 });
 it('rejects invalid ellipse semiaxes',()=>{
  expect(validateConics({type:'ellipse',orientation:'horizontal',h:0,k:0,p:2,a:2,b:3,showGuides:true,showDefinition:true})).toBeNull();
 });
 it('rejects too many 3D objects',()=>{
  const objects=Array.from({length:25},(_,i)=>({id:'p'+i,label:'P'+i,kind:'point',position:{x:0,y:0,z:0}}));
  expect(validateSpatial({...valid.data.spatial,objects})).toBeNull();
 });
 it('rejects dangerous object keys',()=>{
  expect(()=>parseProjectFile('{"schemaVersion":1,"kind":"eduvirtual-project","data":{"constructor":{}}}')).toThrow();
 });
 it('enforces a 2 MiB import limit',()=>{
  const huge=' '.repeat(MAX_IMPORT_BYTES+1);
  expect(()=>parseProjectFile(huge)).toThrow(/2 MiB/);
 });
 it('validates a normal plane snapshot',()=>{
  expect(validatePlane(valid.data.plane)?.view.scale).toBe(45);
 });
});
