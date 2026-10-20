import type { Viewport } from '../domain/model';
export const WIDTH=900, HEIGHT=620;
export function worldToScreen(x:number,y:number,v:Viewport){return {x:WIDTH/2+(x-v.cx)*v.scale,y:HEIGHT/2-(y-v.cy)*v.scale};}
export function screenToWorld(x:number,y:number,v:Viewport){return {x:v.cx+(x-WIDTH/2)/v.scale,y:v.cy-(y-HEIGHT/2)/v.scale};}
export function zoom(v:Viewport,factor:number):Viewport{return {...v,scale:Math.min(160,Math.max(15,v.scale*factor))};}
export function gridStep(scale:number){const target=40/scale;const base=10**Math.floor(Math.log10(target));return [1,2,5,10].map(n=>n*base).find(n=>n>=target)!;}
export const format = (n:number) => Number(n.toFixed(3)).toLocaleString('es-EC');
