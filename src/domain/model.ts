export type Point = { id:string; label:string; x:number; y:number; color:string };
export type Viewport = { cx:number; cy:number; scale:number };
export type Tool = 'select'|'point'|'pan';
export type Module = '2d'|'3d'|'activities';
export const INITIAL_VIEW:Viewport = {cx:0,cy:0,scale:45};
export const INITIAL_POINTS:Point[] = [
 {id:'a',label:'A',x:-3,y:2,color:'#0f9385'},
 {id:'b',label:'B',x:3,y:2,color:'#e38256'},
 {id:'c',label:'C',x:0,y:-2,color:'#7882ce'}
];
export const COORDINATE_LIMIT = 10000;
export function validCoordinate(n:number):boolean {return Number.isFinite(n)&&Math.abs(n)<=COORDINATE_LIMIT;}
