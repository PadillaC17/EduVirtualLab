import {useEffect,useMemo,useState} from 'react';
import Icon from '../../components/Icon';
import {loadConics,saveConics} from '../../storage/projectStorage';

type ConicType='parabola'|'ellipse'|'hyperbola';
type Orientation='horizontal'|'vertical';

const W=900,H=560,S=46;
const sx=(x:number)=>W/2+x*S;
const sy=(y:number)=>H/2-y*S;
const fmt=(n:number)=>Number.isInteger(n)?String(n):n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
const sq=(n:number)=>fmt(n*n);

function Slider({label,value,min,max,step=0.25,onChange,symbol}:{label:string;value:number;min:number;max:number;step?:number;onChange:(n:number)=>void;symbol:string}){
 return <label className="conic-slider"><span><b>{symbol}</b>{label}<output>{fmt(value)}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}

export default function ConicLab(){
 const saved=loadConics();
 const [type,setType]=useState<ConicType>(saved?.type??'parabola');
 const [orientation,setOrientation]=useState<Orientation>(saved?.orientation??'vertical');
 const [h,setH]=useState(saved?.h??0);const [k,setK]=useState(saved?.k??0);const [p,setP]=useState(saved?.p??2);const [a,setA]=useState(saved?.a??4);const [b,setB]=useState(saved?.b??2.5);
 const [showGuides,setShowGuides]=useState(saved?.showGuides??true);const [showDefinition,setShowDefinition]=useState(saved?.showDefinition??true);
 useEffect(()=>{saveConics({type,orientation,h,k,p,a,b,showGuides,showDefinition});},[type,orientation,h,k,p,a,b,showGuides,showDefinition]);
 const c=type==='ellipse'?Math.sqrt(Math.max(0,a*a-b*b)):Math.sqrt(a*a+b*b);
 const equation=useMemo(()=>{
  const X=h===0?'x':`(x ${h>0?'−':'+'} ${fmt(Math.abs(h))})`;const Y=k===0?'y':`(y ${k>0?'−':'+'} ${fmt(Math.abs(k))})`;
  if(type==='parabola') return orientation==='vertical'?`${X}² = ${fmt(4*p)}${Y}`:`${Y}² = ${fmt(4*p)}${X}`;
  if(type==='ellipse') return orientation==='horizontal'?`${X}²/${sq(a)} + ${Y}²/${sq(b)} = 1`:`${X}²/${sq(b)} + ${Y}²/${sq(a)} = 1`;
  return orientation==='horizontal'?`${X}²/${sq(a)} − ${Y}²/${sq(b)} = 1`:`${Y}²/${sq(a)} − ${X}²/${sq(b)} = 1`;
 },[type,orientation,h,k,p,a,b]);

 const curve=useMemo(()=>{
  const pts:string[]=[];
  if(type==='parabola'){
   for(let t=-6;t<=6;t+=.08){const q=t*t/(4*p);const x=orientation==='vertical'?h+t:h+q;const y=orientation==='vertical'?k+q:k+t;pts.push(`${sx(x)},${sy(y)}`)}
   return [pts.join(' ')];
  }
  if(type==='ellipse'){
   for(let t=0;t<=Math.PI*2+.04;t+=.04){let x=a*Math.cos(t),y=b*Math.sin(t);if(orientation==='vertical')[x,y]=[y,x];pts.push(`${sx(h+x)},${sy(k+y)}`)}
   return [pts.join(' ')];
  }
  const one:string[]=[];const two:string[]=[];
  for(let t=-1.75;t<=1.75;t+=.035){let x=a*Math.cosh(t),y=b*Math.sinh(t);if(orientation==='vertical')[x,y]=[y,x];one.push(`${sx(h+x)},${sy(k+y)}`);two.push(`${sx(h-x)},${sy(k-y)}`)}
  return [one.join(' '),two.join(' ')];
 },[type,orientation,h,k,p,a,b]);

 const info=type==='parabola'
  ? {title:'Parábola',definition:'Cada punto mantiene la misma distancia al foco y a la directriz.',relation:'PF = distancia(P, directriz)',accent:'Lugar geométrico de equidistancia'}
  : type==='ellipse'
  ? {title:'Elipse',definition:'La suma de las distancias desde cualquier punto a los dos focos permanece constante.',relation:'PF₁ + PF₂ = 2a',accent:'Suma constante de distancias'}
  : {title:'Hipérbola',definition:'La diferencia absoluta de las distancias desde cualquier punto a los dos focos permanece constante.',relation:'|PF₁ − PF₂| = 2a',accent:'Diferencia constante de distancias'};

 const guides=()=>{
  const nodes=[] as React.ReactNode[];
  if(type==='parabola'){
   const fx=orientation==='vertical'?h:h+p,fy=orientation==='vertical'?k+p:k;
   nodes.push(<g key="par-guides"><line className="conic-guide-line" x1={orientation==='vertical'?0:sx(h-p)} x2={orientation==='vertical'?W:sx(h-p)} y1={orientation==='vertical'?sy(k-p):0} y2={orientation==='vertical'?sy(k-p):H}/><circle className="conic-focus" cx={sx(fx)} cy={sy(fy)} r="6"/><text className="conic-label" x={sx(fx)+10} y={sy(fy)-10}>F</text><circle className="conic-center" cx={sx(h)} cy={sy(k)} r="5"/><text className="conic-label" x={sx(h)+10} y={sy(k)-10}>V</text></g>);
  } else {
   const horizontal=orientation==='horizontal';const f1={x:h+(horizontal?c:0),y:k+(horizontal?0:c)},f2={x:h-(horizontal?c:0),y:k-(horizontal?0:c)};
   nodes.push(<g key="foci"><circle className="conic-focus" cx={sx(f1.x)} cy={sy(f1.y)} r="6"/><circle className="conic-focus" cx={sx(f2.x)} cy={sy(f2.y)} r="6"/><text className="conic-label" x={sx(f1.x)+9} y={sy(f1.y)-9}>F₁</text><text className="conic-label" x={sx(f2.x)+9} y={sy(f2.y)-9}>F₂</text><circle className="conic-center" cx={sx(h)} cy={sy(k)} r="5"/><text className="conic-label" x={sx(h)+9} y={sy(k)-9}>C</text></g>);
   if(type==='hyperbola'){
    const m=b/a; if(horizontal){nodes.push(<g key="asym"><line className="conic-asymptote" x1={0} y1={sy(k+m*(-W/2/S-h))} x2={W} y2={sy(k+m*(W/2/S-h))}/><line className="conic-asymptote" x1={0} y1={sy(k-m*(-W/2/S-h))} x2={W} y2={sy(k-m*(W/2/S-h))}/></g>)}
    else {const inv=a/b;nodes.push(<g key="asym"><line className="conic-asymptote" x1={0} y1={sy(k+inv*(-W/2/S-h))} x2={W} y2={sy(k+inv*(W/2/S-h))}/><line className="conic-asymptote" x1={0} y1={sy(k-inv*(-W/2/S-h))} x2={W} y2={sy(k-inv*(W/2/S-h))}/></g>)}
   }
  }
  return nodes;
 };

 const ticks=[];for(let x=-9;x<=9;x++)ticks.push(<line key={'gx'+x} className={x===0?'conic-axis':'conic-grid'} x1={sx(x)} x2={sx(x)} y1={0} y2={H}/>);for(let y=-6;y<=6;y++)ticks.push(<line key={'gy'+y} className={y===0?'conic-axis':'conic-grid'} x1={0} x2={W} y1={sy(y)} y2={sy(y)}/>);

 return <div className="conic-lab">
  <aside className="conic-sidebar">
   <div className="conic-side-title"><span className="eyebrow">SECCIONES CÓNICAS</span><h2>Explorador dinámico</h2><p>Modifica parámetros y observa cómo cambia cada representación.</p></div>
   <div className="conic-tabs" role="tablist" aria-label="Seleccionar cónica">
    {(['parabola','ellipse','hyperbola'] as const).map(t=><button key={t} className={type===t?'active':''} onClick={()=>{setType(t);if(t==='ellipse'&&b>=a)setB(Math.max(.75,a-.5));}}>{t==='parabola'?'Parábola':t==='ellipse'?'Elipse':'Hipérbola'}</button>)}
   </div>
   <div className="conic-section"><span className="eyebrow">ORIENTACIÓN</span><div className="orientation-toggle"><button className={orientation==='horizontal'?'active':''} onClick={()=>setOrientation('horizontal')}>Horizontal</button><button className={orientation==='vertical'?'active':''} onClick={()=>setOrientation('vertical')}>Vertical</button></div></div>
   <div className="conic-section"><span className="eyebrow">CENTRO / VÉRTICE</span><Slider symbol="h" label="Desplazamiento x" value={h} min={-4} max={4} onChange={setH}/><Slider symbol="k" label="Desplazamiento y" value={k} min={-3} max={3} onChange={setK}/></div>
   {type==='parabola'?<div className="conic-section"><span className="eyebrow">APERTURA</span><Slider symbol="p" label="Distancia focal" value={p} min={-4} max={4} step={.25} onChange={n=>setP(Math.abs(n)<.25?.25:n)}/></div>:<div className="conic-section"><span className="eyebrow">SEMIEJES</span><Slider symbol="a" label="Semieje principal" value={a} min={1.5} max={5} onChange={n=>{setA(n);if(type==='ellipse'&&b>=n)setB(Math.max(.75,n-.5));}}/><Slider symbol="b" label="Semieje secundario" value={b} min={.75} max={type==='ellipse'?Math.max(.75,a-.5):4} onChange={setB}/></div>}
   <div className="conic-section conic-switches"><label><span>Elementos notables</span><input type="checkbox" checked={showGuides} onChange={e=>setShowGuides(e.target.checked)}/></label><label><span>Definición geométrica</span><input type="checkbox" checked={showDefinition} onChange={e=>setShowDefinition(e.target.checked)}/></label></div>
  </aside>

  <section className="conic-stage-card">
   <div className="conic-stage-head"><div><span className="live-dot"/><strong>{info.title}</strong><small>{info.accent}</small></div><span className="conic-engine-badge">Motor 2D · Fase 2</span></div>
   <div className="conic-canvas-wrap"><svg className="conic-canvas" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Gráfica dinámica de ${info.title}`}>{ticks}{showGuides&&guides()}{curve.map((points,i)=><polyline key={i} className="conic-curve" points={points}/>)}</svg><div className="conic-equation"><span>Ecuación actual</span><strong>{equation}</strong></div></div>
   <div className="conic-stage-footer"><span><Icon name="cursor" size={15}/>Usa los controles para explorar</span><span>h = {fmt(h)} · k = {fmt(k)}{type==='parabola'?` · p = ${fmt(p)}`:` · a = ${fmt(a)} · b = ${fmt(b)} · c = ${fmt(c)}`}</span></div>
  </section>

  <aside className="conic-insight">
   <span className="eyebrow">COMPRENSIÓN GEOMÉTRICA</span><h2>{info.title}</h2>{showDefinition&&<><p>{info.definition}</p><div className="definition-card"><span>Propiedad fundamental</span><strong>{info.relation}</strong></div></>}
   <div className="element-list"><span className="eyebrow">OBSERVA</span>{type==='parabola'?<><p><b>V</b> Vértice: ({fmt(h)}, {fmt(k)})</p><p><b>F</b> Foco a {fmt(Math.abs(p))} u. del vértice</p><p><b>d</b> Directriz a {fmt(Math.abs(p))} u. del vértice</p></>:type==='ellipse'?<><p><b>C</b> Centro: ({fmt(h)}, {fmt(k)})</p><p><b>F</b> Distancia focal c = {fmt(c)}</p><p><b>Σ</b> Suma constante = {fmt(2*a)}</p></>:<><p><b>C</b> Centro: ({fmt(h)}, {fmt(k)})</p><p><b>F</b> Distancia focal c = {fmt(c)}</p><p><b>Δ</b> Diferencia constante = {fmt(2*a)}</p></>}</div>
   <div className="reflection-card"><span className="eyebrow">PIENSA ANTES DE MOVER</span><p>¿Qué crees que cambiará en la gráfica si modificas el parámetro <b>{type==='parabola'?'p':'a'}</b>?</p><small>Esta pregunta prepara las actividades de naturalización, contraste y reconstrucción reflexiva de las siguientes fases.</small></div>
  </aside>
 </div>;
}