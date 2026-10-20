import {lazy,Suspense,useEffect,useState} from 'react';
import BrandLogo from '../components/BrandLogo';
const SpatialLab=lazy(()=>import('../features/spatial/SpatialLab'));
import App from './App';
import ConicLab from '../features/workspace/ConicLab';
import ExpressionLab from '../features/workspace/ExpressionLab';
import ResearchLab from '../features/activities/ResearchLab';
import Icon from '../components/Icon';
import './styles.css';
import './fase2.css';
import './fase3.css';
import './fase4.css';
import './research.css';

function initialDark(){try{const stored=localStorage.getItem('eduvirtual-theme');return stored?stored==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}catch{return false;}}

type Module='plane'|'2d'|'3d'|'activities';

export default function AppPhase2(){
 const [spatialDraft,setSpatialDraft]=useState<{source:string;scope:Record<string,number>}>({source:'',scope:{}});
 const [dark,setDark]=useState(initialDark);
 const [module,setModule]=useState<Module>('2d');
 const [workspace,setWorkspace]=useState<'conics'|'equations'>('equations');

 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('eduvirtual-theme',dark?'dark':'light');}catch{}},[dark]);

 const open2d=(view:'conics'|'equations')=>{setWorkspace(view);setModule('2d');};

 return <div className="app-shell phase2-shell phase3-shell">
  <header className="topbar">
   <button className="brand" onClick={()=>open2d('conics')} aria-label="Ir al laboratorio de cónicas">
    <span className="brand-mark"><BrandLogo size={30}/></span>
    <span>EduVirtual <b>Lab</b><small>LABORATORIO DE MATEMÁTICAS</small></span>
   </button>
   <nav className="modules" aria-label="Laboratorios">
    <button className={module==='plane'?'active':''} onClick={()=>setModule('plane')}><Icon name="cursor" size={17}/>Plano libre</button>
    <button className={module==='2d'?'active':''} onClick={()=>setModule('2d')}><Icon name="grid" size={17}/>Geometría 2D</button>
    <button className={module==='3d'?'active':''} onClick={()=>setModule('3d')}><Icon name="cube" size={17}/>Geometría 3D</button>
    <button className={module==='activities'?'active':''} onClick={()=>setModule('activities')}><Icon name="book" size={17}/>Investigación</button>
   </nav>
   <div className="top-actions">
    <button className="icon-button" onClick={()=>setDark(!dark)} aria-label={dark?'Activar modo claro':'Activar modo oscuro'} title="Cambiar tema"><Icon name={dark?'sun':'moon'}/></button>
   </div>
  </header>

  {module==='plane'?<App embedded/>:
   module==='2d'?<>
    <div className="workspace-heading phase2-heading phase3-heading">
     <div><div className="eyebrow">GEOMETRÍA II · UNIVERSIDAD DE GUAYAQUIL</div><h1>{workspace==='equations'?'De la ecuación a la gráfica':'Explora las secciones cónicas'}<span>.</span></h1><p>{workspace==='equations'?'Escribe expresiones, analiza su estructura y contrasta su representación matemática.':'Relaciona elementos, parámetros, gráfica y ecuación mediante experimentación dinámica.'}</p></div>
     <div className="phase-heading-actions"><div className="workspace-mode-toggle" aria-label="Cambiar herramienta"><button className={workspace==='conics'?'active':''} onClick={()=>setWorkspace('conics')}>Cónicas dinámicas</button><button className={workspace==='equations'?'active':''} onClick={()=>setWorkspace('equations')}>Ecuaciones y gráficas</button></div><span className="phase-badge"><span className="live-dot"/>Laboratorio matemático</span></div>
    </div>
    {workspace==='conics'?<ConicLab/>:<ExpressionLab onOpen3D={(source,scope={})=>{setSpatialDraft({source,scope});setModule('3d');}}/>}
   </>:
   module==='3d'?<>
    <div className="workspace-heading"><div><div className="eyebrow">GEOMETRÍA II · LABORATORIO ESPACIAL</div><h1>Otra dimensión para tus ideas<span>.</span></h1><p>Relaciona coordenadas, sólidos, superficies y secciones cónicas.</p></div><span className="phase-badge"><span className="live-dot"/>Geometría 3D</span></div>
    <Suspense fallback={<p className="empty" role="status">Cargando motor espacial…</p>}><SpatialLab dark={dark} initialSource={spatialDraft.source} initialScope={spatialDraft.scope}/></Suspense>
   </>:
   <>
    <div className="workspace-heading research-heading"><div><div className="eyebrow">INSTRUMENTO PILOTO · TESIS</div><h1>Del supuesto a la explicación<span>.</span></h1><p>Registra una idea inicial, contrástala mediante exploración y reconstruye la respuesta con evidencia.</p></div><span className="phase-badge"><span className="live-dot"/>Actividades de investigación</span></div>
    <ResearchLab/>
   </>}

  <footer><span>EduVirtual Lab <span className="footer-dot">·</span> Geometría II</span><span>Plano libre · 2D · 3D · Investigación</span></footer>
 </div>;
}
