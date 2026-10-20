import {useReducer,useState} from 'react';
import {INITIAL_POINTS,INITIAL_VIEW,validCoordinate,type Tool} from '../domain/model';
import {historyReducer} from '../features/workspace/history';
import {format,zoom} from '../math/coordinates';
import Plane from '../engines/svg/Plane';
import Icon from '../components/Icon';
import PointProperties from '../components/PointProperties';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({embedded=false}:{embedded?:boolean}){
 const [tool,setTool]=useState<Tool>('select');
 const [history,dispatch]=useReducer(historyReducer,{past:[],present:INITIAL_POINTS,future:[]});
 const [selected,setSelected]=useState<string|null>('a');
 const [view,setView]=useState(INITIAL_VIEW);
 const [grid,setGrid]=useState(true);
 const [axes,setAxes]=useState(true);
 const [message,setMessage]=useState('Selecciona un punto o arrástralo para cambiar sus coordenadas.');
 const points=history.present;
 const current=points.find(p=>p.id===selected);

 function add(x:number,y:number){
  if(!validCoordinate(x)||!validCoordinate(y)){setMessage('Las coordenadas deben estar entre −10000 y 10000.');return;}
  if(points.length>=100){setMessage('Este plano admite hasta 100 puntos.');return;}
  const id=crypto.randomUUID();let index=0;while(points.some(p=>p.label===`P${index+1}`))index++;
  const label=`P${index+1}`;dispatch({type:'commit',points:[...points,{id,label,x,y,color:'#0f9385'}]});setSelected(id);setMessage(`Punto ${label} creado. Puedes editarlo en Propiedades.`);
 }
 function reset(){dispatch({type:'commit',points:[]});setSelected(null);setView(INITIAL_VIEW);setMessage('Plano vacío. Puedes deshacer para recuperar los puntos.');}

 const body=<>
  <div className="workspace-heading plane-heading"><div><div className="eyebrow">PLANO LIBRE · GEOMETRÍA 2D</div><h1>Construye sobre el plano<span>.</span></h1><p>Crea puntos, mueve la vista y modifica coordenadas sin salir del laboratorio.</p></div><span className="phase-badge"><span className="live-dot"/>Herramienta base</span></div>
  <main className="workspace plane-workspace">
   <aside className="left-panel">
    <div className="panel-heading"><h2>Herramientas</h2><span>2D</span></div>
    <div className="tools">{([{id:'select',icon:'cursor',title:'Seleccionar',text:'Selecciona y mueve puntos'},{id:'point',icon:'point',title:'Punto',text:'Haz clic sobre el plano'},{id:'pan',icon:'pan',title:'Mover vista',text:'Arrastra el espacio'}] as const).map(t=><button className={'tool-button '+(tool===t.id?'selected':'')} key={t.id} onClick={()=>{setTool(t.id);setMessage(t.text+'.');}} aria-pressed={tool===t.id}><Icon name={t.icon}/><span>{t.title}<small>{t.text}</small></span>{tool===t.id&&<span className="tool-indicator"/>}</button>)}</div>
    <div className="objects-heading"><h2>Objetos</h2><span>{points.length}</span></div>
    <div className="object-list">{points.map(p=><button key={p.id} className={'object-row '+(selected===p.id?'selected':'')} onClick={()=>{setSelected(p.id);setTool('select');}}><span className="object-dot" style={{background:p.color}}/><strong>{p.label}</strong><span>({format(p.x)}, {format(p.y)})</span></button>)}{!points.length&&<p className="muted small">No hay puntos. Usa la herramienta Punto para crear el primero.</p>}</div>
    <div className="aside-tip"><Icon name="help" size={18}/><p><strong>Consejo</strong>Arrastra un punto y observa cómo cambian sus coordenadas.</p></div>
   </aside>

   <section className="canvas-panel" aria-label="Área de construcción">
    <div className="canvas-toolbar"><div className="canvas-title"><span className="live-dot"/>Plano cartesiano</div><div className="canvas-actions"><button className="icon-button" disabled={!history.past.length} aria-label="Deshacer" title="Deshacer" onClick={()=>dispatch({type:'undo'})}><Icon name="undo" size={18}/></button><button className="icon-button" disabled={!history.future.length} aria-label="Rehacer" title="Rehacer" onClick={()=>dispatch({type:'redo'})}><Icon name="redo" size={18}/></button><span className="divider"/><button className={'icon-button '+(grid?'toggled':'')} aria-label="Mostrar cuadrícula" aria-pressed={grid} title="Cuadrícula" onClick={()=>setGrid(!grid)}><Icon name="grid" size={18}/></button></div></div>
    <Plane points={points} view={view} tool={tool} selected={selected} grid={grid} axes={axes} onSelect={setSelected} onAdd={add} onMove={(id,x,y)=>dispatch({type:'commit',points:points.map(p=>p.id===id?{...p,x,y}:p)})} onView={setView}/>
    <div className="zoom-controls"><button className="icon-button" disabled={view.scale>=160} onClick={()=>setView(zoom(view,1.2))} aria-label="Acercar"><Icon name="plus"/></button><span>{Math.round(view.scale/INITIAL_VIEW.scale*100)}%</span><button className="icon-button" disabled={view.scale<=15} onClick={()=>setView(zoom(view,1/1.2))} aria-label="Alejar"><Icon name="minus"/></button><span className="divider"/><button className="icon-button" onClick={()=>setView(INITIAL_VIEW)} aria-label="Restablecer vista" title="Restablecer vista"><Icon name="reset" size={18}/></button></div>
    <div className="canvas-status" role="status"><Icon name={tool==='point'?'point':'cursor'} size={15}/>{message}</div>
   </section>

   <aside className="right-panel">
    <div className="panel-heading"><h2>Propiedades</h2><Icon name="eye" size={17}/></div>
    {current?<PointProperties key={`${current.id}:${current.x}:${current.y}`} point={current} onUpdate={point=>{dispatch({type:'commit',points:points.map(p=>p.id===point.id?point:p)});setMessage(`Coordenadas de ${point.label} actualizadas.`);}} onDelete={()=>{dispatch({type:'commit',points:points.filter(p=>p.id!==current.id)});setSelected(null);setMessage('Punto eliminado. Puedes deshacer esta operación.');}}/>:<div className="property-empty"><Icon name="cursor" size={28}/><h3>Selecciona un punto</h3><p>Sus coordenadas aparecerán aquí para que puedas editarlas.</p></div>}
    <div className="view-settings"><p className="eyebrow">VISUALIZACIÓN</p><label><span>Cuadrícula</span><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/></label><label><span>Ejes cartesianos</span><input type="checkbox" checked={axes} onChange={e=>setAxes(e.target.checked)}/></label></div>
    <button className="reset-workspace" onClick={reset}><Icon name="reset" size={16}/>Vaciar plano</button>
   </aside>
  </main>
 </>;

 return <ErrorBoundary>{embedded?body:<div className="app-shell">{body}</div>}</ErrorBoundary>;
}
