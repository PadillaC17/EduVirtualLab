import {useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import type {Point,Viewport,Tool} from '../../domain/model';
import {validCoordinate} from '../../domain/model';
import {WIDTH,HEIGHT,worldToScreen,screenToWorld,gridStep,format} from '../../math/coordinates';
type Props={points:Point[];view:Viewport;tool:Tool;selected:string|null;grid:boolean;axes:boolean;onSelect:(id:string|null)=>void;onAdd:(x:number,y:number)=>void;onMove:(id:string,x:number,y:number)=>void;onView:(v:Viewport)=>void};
export default function Plane(p:Props){
 const ref=useRef<SVGSVGElement>(null);
 const drag=useRef<{id:string|null;x:number;y:number;view:Viewport}|null>(null);
 const [preview,setPreview]=useState<{id:string;x:number;y:number}|null>(null);
 const [pointer,setPointer]=useState<{x:number;y:number}|null>(null);
 function local(e:PointerEvent<SVGSVGElement>){const svg=ref.current!;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const matrix=svg.getScreenCTM();return matrix?pt.matrixTransform(matrix.inverse()):{x:0,y:0};}
 function down(e:PointerEvent<SVGSVGElement>){if(e.button!==0)return;const q=local(e);const id=(e.target as Element).closest('[data-point]')?.getAttribute('data-point')??null;
  if(p.tool==='point'){const w=screenToWorld(q.x,q.y,p.view);p.onAdd(w.x,w.y);return;}
  if(p.tool==='select')p.onSelect(id);
  if(id&&p.tool==='select'||p.tool==='pan'){drag.current={id:p.tool==='pan'?null:id,x:q.x,y:q.y,view:p.view};e.currentTarget.setPointerCapture(e.pointerId);}
 }
 function move(e:PointerEvent<SVGSVGElement>){const q=local(e);setPointer(screenToWorld(q.x,q.y,p.view));const d=drag.current;if(!d)return;
  if(d.id){const w=screenToWorld(q.x,q.y,p.view);if(validCoordinate(w.x)&&validCoordinate(w.y))setPreview({id:d.id,...w});}
  else p.onView({...d.view,cx:d.view.cx-(q.x-d.x)/d.view.scale,cy:d.view.cy+(q.y-d.y)/d.view.scale});
 }
 function finish(){if(preview)p.onMove(preview.id,preview.x,preview.y);setPreview(null);drag.current=null;}
 const step=gridStep(p.view.scale);const lines=[];
 const left=p.view.cx-WIDTH/2/p.view.scale,right=p.view.cx+WIDTH/2/p.view.scale;
 const bottom=p.view.cy-HEIGHT/2/p.view.scale,top=p.view.cy+HEIGHT/2/p.view.scale;
 for(let x=Math.ceil(left/step)*step;x<=right;x+=step){const s=worldToScreen(x,0,p.view);lines.push(<g key={'x'+x}>{p.grid&&<line x1={s.x} x2={s.x} y1={0} y2={HEIGHT} className="grid-line"/>}{p.axes&&Math.abs(x)>step/2&&<text x={s.x+5} y={Math.min(HEIGHT-12,Math.max(18,s.y+19))} className="tick">{format(x)}</text>}</g>);}
 for(let y=Math.ceil(bottom/step)*step;y<=top;y+=step){const s=worldToScreen(0,y,p.view);lines.push(<g key={'y'+y}>{p.grid&&<line x1={0} x2={WIDTH} y1={s.y} y2={s.y} className="grid-line"/>}{p.axes&&Math.abs(y)>step/2&&<text x={Math.min(WIDTH-35,Math.max(8,s.x+8))} y={s.y-7} className="tick">{format(y)}</text>}</g>);}
 const origin=worldToScreen(0,0,p.view);
 return <div className="plane-wrap"><svg ref={ref} className={'plane tool-'+p.tool} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="application" aria-label="Plano cartesiano. Añade puntos con la herramienta Punto o edita sus coordenadas en el panel." onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{setPreview(null);drag.current=null;}} onLostPointerCapture={()=>{setPreview(null);drag.current=null;}} onPointerLeave={()=>setPointer(null)}>
 {lines}{p.axes&&<g className="axis"><line x1={0} y1={origin.y} x2={WIDTH} y2={origin.y}/><line x1={origin.x} y1={0} x2={origin.x} y2={HEIGHT}/><text x={WIDTH-20} y={Math.min(HEIGHT-8,Math.max(20,origin.y-10))}>x</text><text x={Math.min(WIDTH-20,Math.max(8,origin.x+12))} y={20}>y</text></g>}
 {p.points.map(point=>{const w=preview?.id===point.id?preview:point;const s=worldToScreen(w.x,w.y,p.view);return <g key={point.id} data-point={point.id} style={{color:point.color}}><circle cx={s.x} cy={s.y} r={20} fill="transparent"/><circle cx={s.x} cy={s.y} r={p.selected===point.id?13:9} fill="currentColor" opacity=".14"/><circle cx={s.x} cy={s.y} r={5} fill="currentColor"/><text x={s.x+14} y={s.y-13} fill="currentColor" fontWeight="600" fontSize="16">{point.label}</text></g>;})}
 </svg><div className="plane-note"><span className="live-dot"/>Plano de prueba · coordenadas reales</div><div className="cursor-position">{pointer?`x: ${format(pointer.x)} · y: ${format(pointer.y)}`:'Explora el plano'}<span>1 unidad = {Math.round(p.view.scale)} px del plano</span></div></div>;
}
