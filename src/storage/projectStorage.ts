import type {Point,Viewport} from '../domain/model';
import type {Dimensions,SolidKind,SpatialObject} from '../math/spatial';

export const PROJECT_SCHEMA_VERSION=1 as const;
export const MAX_IMPORT_BYTES=2*1024*1024;

export const STORAGE_KEYS={
 plane:'eduvirtual_plane_v1',
 conics:'eduvirtual_conics_v1',
 expression:'eduvirtual_expression_v1',
 spatial:'eduvirtual_spatial_v1',
 research:'eduvirtual_research_responses_v1',
 ui:'eduvirtual_ui_v1'
} as const;

export type PlaneSnapshot={points:Point[];view:Viewport;grid:boolean;axes:boolean};
export type ConicSnapshot={type:'parabola'|'ellipse'|'hyperbola';orientation:'horizontal'|'vertical';h:number;k:number;p:number;a:number;b:number;showGuides:boolean;showDefinition:boolean};
export type ExpressionSnapshot={input:string;submitted:string;mode:'text'|'visual';xValue:string;params:Record<string,string>};
export type SpatialSnapshot={mode:'solids'|'objects'|'surfaces'|'sections';solid:SolidKind;dimensions:Dimensions;objects:SpatialObject[];selected:string|null;source:string;submitted:string;params:Record<string,string>;domain:number;angle:number;offset:number;axes:boolean;grid:boolean;wireframe:boolean};
export type UiSnapshot={module:'plane'|'2d'|'3d'|'activities';workspace:'conics'|'equations'};
export type ResearchRecord={schemaVersion:1;activityId:'parabola'|'elipse'|'hiperbola';prediction:string;observation:string;reflection:string;completedAt:string};

export type ProjectFile={
 schemaVersion:1;
 kind:'eduvirtual-project';
 exportedAt:string;
 app:'EduVirtual Lab';
 data:{
  plane:PlaneSnapshot|null;
  conics:ConicSnapshot|null;
  expression:ExpressionSnapshot|null;
  spatial:SpatialSnapshot|null;
  research:ResearchRecord[];
  ui:UiSnapshot|null;
 };
};

const isRecord=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const finite=(v:unknown,min=-Infinity,max=Infinity):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const bool=(v:unknown):v is boolean=>typeof v==='boolean';
const str=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
const safeId=(v:unknown,max=64)=>str(v,max)&&/^[\p{L}\p{N}_\-π]+$/u.test(v);
function hasDangerousKeys(value:unknown,depth=0):boolean{
 if(depth>16)return true;
 if(!isRecord(value)&&!Array.isArray(value))return false;
 if(Array.isArray(value))return value.some(v=>hasDangerousKeys(v,depth+1));
 for(const [k,v] of Object.entries(value)){if(k==='__proto__'||k==='prototype'||k==='constructor')return true;if(hasDangerousKeys(v,depth+1))return true;}
 return false;
}
function validParams(v:unknown):v is Record<string,string>{
 if(!isRecord(v)||Object.keys(v).length>32)return false;
 return Object.entries(v).every(([k,val])=>safeId(k,32)&&str(val,64));
}
function validPoint(v:unknown):v is Point{
 if(!isRecord(v))return false;
 return safeId(v.id,80)&&str(v.label,24)&&finite(v.x,-10000,10000)&&finite(v.y,-10000,10000)&&str(v.color,32);
}
function validVec3(v:unknown){return isRecord(v)&&finite(v.x,-10,10)&&finite(v.y,-10,10)&&finite(v.z,-10,10);}
function validSpatialObject(v:unknown):v is SpatialObject{
 if(!isRecord(v)||!safeId(v.id,80)||!str(v.label,24)||!['point','vector','line','plane'].includes(String(v.kind)))return false;
 if(v.kind==='point')return validVec3(v.position);
 if(v.kind==='plane')return validVec3(v.normal)&&finite(v.offset,-10,10)&&Math.hypot((v.normal as any).x,(v.normal as any).y,(v.normal as any).z)>1e-8;
 return validVec3(v.from)&&validVec3(v.to);
}
export function validatePlane(v:unknown):PlaneSnapshot|null{
 if(!isRecord(v)||!Array.isArray(v.points)||v.points.length>100||!v.points.every(validPoint)||!isRecord(v.view)||!finite(v.view.cx,-10000,10000)||!finite(v.view.cy,-10000,10000)||!finite(v.view.scale,15,160)||!bool(v.grid)||!bool(v.axes))return null;
 return{points:v.points,view:{cx:v.view.cx,cy:v.view.cy,scale:v.view.scale},grid:v.grid,axes:v.axes};
}
export function validateConics(v:unknown):ConicSnapshot|null{
 if(!isRecord(v)||!['parabola','ellipse','hyperbola'].includes(String(v.type))||!['horizontal','vertical'].includes(String(v.orientation))||!finite(v.h,-4,4)||!finite(v.k,-3,3)||!finite(v.p,-4,4)||Math.abs(v.p as number)<.24||!finite(v.a,1.5,5)||!finite(v.b,.75,4)||!bool(v.showGuides)||!bool(v.showDefinition))return null;
 if(v.type==='ellipse'&&(v.b as number)>=(v.a as number))return null;
 return v as unknown as ConicSnapshot;
}
export function validateExpression(v:unknown):ExpressionSnapshot|null{
 if(!isRecord(v)||!str(v.input,512)||!str(v.submitted,512)||!['text','visual'].includes(String(v.mode))||!str(v.xValue,64)||!validParams(v.params))return null;
 return{input:v.input,submitted:v.submitted,mode:v.mode as 'text'|'visual',xValue:v.xValue,params:v.params};
}
export function validateSpatial(v:unknown):SpatialSnapshot|null{
 if(!isRecord(v)||!['solids','objects','surfaces','sections'].includes(String(v.mode))||!['prism','pyramid','cylinder','cone','sphere'].includes(String(v.solid))||!isRecord(v.dimensions)||!finite(v.dimensions.width,.01,20)||!finite(v.dimensions.depth,.01,20)||!finite(v.dimensions.height,.01,20)||!finite(v.dimensions.radius,.01,20)||!Array.isArray(v.objects)||v.objects.length>24||!v.objects.every(validSpatialObject)||(v.selected!==null&&!safeId(v.selected,80))||!str(v.source,512)||!str(v.submitted,512)||!validParams(v.params)||!finite(v.domain,1,6)||!finite(v.angle,0,75)||!finite(v.offset,-3,3)||!bool(v.axes)||!bool(v.grid)||!bool(v.wireframe))return null;
 return v as unknown as SpatialSnapshot;
}
export function validateUi(v:unknown):UiSnapshot|null{
 if(!isRecord(v)||!['plane','2d','3d','activities'].includes(String(v.module))||!['conics','equations'].includes(String(v.workspace)))return null;
 return v as unknown as UiSnapshot;
}
export function validateResearch(v:unknown):ResearchRecord[]{
 if(!Array.isArray(v)||v.length>3)return[];
 const ids=new Set<string>();const out:ResearchRecord[]=[];
 for(const item of v){
  if(!isRecord(item)||item.schemaVersion!==1||!['parabola','elipse','hiperbola'].includes(String(item.activityId))||!str(item.prediction,2000)||!str(item.observation,3000)||!str(item.reflection,4000)||!str(item.completedAt,64)||ids.has(String(item.activityId)))continue;
  ids.add(String(item.activityId));out.push(item as unknown as ResearchRecord);
 }
 return out;
}

function readRaw(key:string):unknown{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch{return null;}}
function writeRaw(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}

export const loadPlane=()=>validatePlane(readRaw(STORAGE_KEYS.plane));
export const loadConics=()=>validateConics(readRaw(STORAGE_KEYS.conics));
export const loadExpression=()=>validateExpression(readRaw(STORAGE_KEYS.expression));
export const loadSpatial=()=>validateSpatial(readRaw(STORAGE_KEYS.spatial));
export const loadUi=()=>validateUi(readRaw(STORAGE_KEYS.ui));
export const loadResearch=()=>validateResearch(readRaw(STORAGE_KEYS.research));

export const savePlane=(v:PlaneSnapshot)=>writeRaw(STORAGE_KEYS.plane,validatePlane(v)??v);
export const saveConics=(v:ConicSnapshot)=>writeRaw(STORAGE_KEYS.conics,validateConics(v)??v);
export const saveExpression=(v:ExpressionSnapshot)=>writeRaw(STORAGE_KEYS.expression,validateExpression(v)??v);
export const saveSpatial=(v:SpatialSnapshot)=>writeRaw(STORAGE_KEYS.spatial,validateSpatial(v)??v);
export const saveUi=(v:UiSnapshot)=>writeRaw(STORAGE_KEYS.ui,validateUi(v)??v);

export function createProjectFile():ProjectFile{
 return{schemaVersion:PROJECT_SCHEMA_VERSION,kind:'eduvirtual-project',exportedAt:new Date().toISOString(),app:'EduVirtual Lab',data:{plane:loadPlane(),conics:loadConics(),expression:loadExpression(),spatial:loadSpatial(),research:loadResearch(),ui:loadUi()}};
}
export function parseProjectFile(text:string):ProjectFile{
 if(new TextEncoder().encode(text).byteLength>MAX_IMPORT_BYTES)throw new Error('El archivo supera el límite de 2 MiB.');
 let raw:unknown;try{raw=JSON.parse(text);}catch{throw new Error('El archivo no contiene JSON válido.');}
 if(hasDangerousKeys(raw))throw new Error('El archivo contiene claves no permitidas.');
 if(!isRecord(raw)||raw.schemaVersion!==1||raw.kind!=='eduvirtual-project'||!isRecord(raw.data))throw new Error('No es un proyecto compatible con EduVirtual Lab.');
 const plane=raw.data.plane===null?null:validatePlane(raw.data.plane);if(raw.data.plane!==null&&!plane)throw new Error('Los datos del Plano libre no son válidos.');
 const conics=raw.data.conics===null?null:validateConics(raw.data.conics);if(raw.data.conics!==null&&!conics)throw new Error('Los datos de Cónicas no son válidos.');
 const expression=raw.data.expression===null?null:validateExpression(raw.data.expression);if(raw.data.expression!==null&&!expression)throw new Error('Los datos del editor matemático no son válidos.');
 const spatial=raw.data.spatial===null?null:validateSpatial(raw.data.spatial);if(raw.data.spatial!==null&&!spatial)throw new Error('Los datos de Geometría 3D no son válidos.');
 const research=validateResearch(raw.data.research);if(Array.isArray(raw.data.research)&&research.length!==raw.data.research.length)throw new Error('Las evidencias de investigación contienen registros inválidos.');
 const ui=raw.data.ui===null?null:validateUi(raw.data.ui);if(raw.data.ui!==null&&!ui)throw new Error('La navegación guardada no es válida.');
 return{schemaVersion:1,kind:'eduvirtual-project',exportedAt:str(raw.exportedAt,64)?raw.exportedAt:new Date().toISOString(),app:'EduVirtual Lab',data:{plane,conics,expression,spatial,research,ui}};
}
export function importProjectFile(project:ProjectFile){
 const entries:[[string,unknown]]|[string,unknown][]=[
  [STORAGE_KEYS.plane,project.data.plane],[STORAGE_KEYS.conics,project.data.conics],[STORAGE_KEYS.expression,project.data.expression],[STORAGE_KEYS.spatial,project.data.spatial],[STORAGE_KEYS.research,project.data.research],[STORAGE_KEYS.ui,project.data.ui]
 ];
 try{
  for(const [key,value] of entries){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value));}
 }catch{throw new Error('El navegador no pudo guardar el proyecto importado.');}
}
export function clearProjectData(){
 try{Object.values(STORAGE_KEYS).forEach(key=>localStorage.removeItem(key));}catch{}
}
