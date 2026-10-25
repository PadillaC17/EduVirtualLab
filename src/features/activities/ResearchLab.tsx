import {useMemo,useState} from 'react';
import Icon from '../../components/Icon';
import {researchActivities,type ResearchActivityId} from '../../data/researchActivities';
import {submitResearchResponse} from '../../services/supabaseAdmin';

type Step=1|2|3;
type SavedResponse={schemaVersion:1;activityId:ResearchActivityId;prediction:string;observation:string;reflection:string;completedAt:string};
const STORAGE_KEY='eduvirtual_research_responses_v1';
const W=780,H=440;
const sx=(x:number,extent=7)=>W/2+x*(W/(extent*2));
const sy=(y:number,extent=5)=>H/2-y*(H/(extent*2));

function safeLoad():SavedResponse[]{
 try{
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return[];
  const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))return[];
  return parsed.filter((x):x is SavedResponse=>{
   if(typeof x!=='object'||x===null)return false;
   const r=x as Record<string,unknown>;
   return r.schemaVersion===1&&['parabola','elipse','hiperbola'].includes(String(r.activityId))
    &&typeof r.prediction==='string'&&r.prediction.length<=2000
    &&typeof r.observation==='string'&&r.observation.length<=3000
    &&typeof r.reflection==='string'&&r.reflection.length<=4000
    &&typeof r.completedAt==='string';
  });
 }catch{return[];}
}

function download(name:string,content:string,type:string){
 const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

function Experiment({id,contrast,far}:{id:ResearchActivityId;contrast:boolean;far:boolean}){
 const extent=far?14:7;
 const grid=[];for(let x=-Math.floor(extent);x<=extent;x++)grid.push(<line key={'x'+x} className={x===0?'research-axis':'research-grid'} x1={sx(x,extent)} x2={sx(x,extent)} y1={0} y2={H}/>);for(let y=-Math.floor(extent*.7);y<=Math.floor(extent*.7);y++)grid.push(<line key={'y'+y} className={y===0?'research-axis':'research-grid'} x1={0} x2={W} y1={sy(y,extent*.7)} y2={sy(y,extent*.7)}/>);
 const paths=useMemo(()=>{
  if(id==='parabola'){
   const one:string[]=[];const two:string[]=[];for(let x=-4;x<=4;x+=.05){one.push(`${sx(x,extent)},${sy(x*x,extent*.7)}`);two.push(`${sx(x,extent)},${sy(4*x*x,extent*.7)}`)}return{main:[one],compare:[two]};
  }
  if(id==='elipse'){
   const e:string[]=[];const c:string[]=[];for(let t=0;t<=Math.PI*2+.04;t+=.04){e.push(`${sx(3*Math.cos(t),extent)},${sy(2*Math.sin(t),extent*.7)}`);c.push(`${sx(2*Math.cos(t),extent)},${sy(2*Math.sin(t),extent*.7)}`)}return{main:[e],compare:[c]};
  }
  const left:string[]=[];const right:string[]=[];for(let t=-2.2;t<=2.2;t+=.035){right.push(`${sx(3*Math.cosh(t),extent)},${sy(2*Math.sinh(t),extent*.7)}`);left.push(`${sx(-3*Math.cosh(t),extent)},${sy(2*Math.sinh(t),extent*.7)}`)}return{main:[left,right],compare:[]};
 },[id,extent]);
 return <svg className="research-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Experimento geométrico">{grid}{id==='hiperbola'&&contrast&&<g><line className="research-asymptote" x1={sx(-extent,extent)} y1={sy(-(2/3)*extent,extent*.7)} x2={sx(extent,extent)} y2={sy((2/3)*extent,extent*.7)}/><line className="research-asymptote" x1={sx(-extent,extent)} y1={sy((2/3)*extent,extent*.7)} x2={sx(extent,extent)} y2={sy(-(2/3)*extent,extent*.7)}/></g>}{paths.main.map((p,i)=><polyline key={'m'+i} className="research-curve" points={p.join(' ')}/>)}{contrast&&paths.compare.map((p,i)=><polyline key={'c'+i} className="research-compare" points={p.join(' ')}/>)}</svg>;
}

export default function ResearchLab(){
 const [activityId,setActivityId]=useState<ResearchActivityId>('parabola');const [step,setStep]=useState<Step>(1);
 const [prediction,setPrediction]=useState('');const [observation,setObservation]=useState('');const [reflection,setReflection]=useState('');
 const [contrast,setContrast]=useState(false);const [far,setFar]=useState(false);const [saved,setSaved]=useState<SavedResponse[]>(safeLoad);const [status,setStatus]=useState('');
 const [participantCode,setParticipantCode]=useState(()=>{try{return localStorage.getItem('eduvirtual_participant_code')??'';}catch{return'';}});const [participantPin,setParticipantPin]=useState('');
 const activity=researchActivities.find(a=>a.id===activityId)!;

 function choose(id:ResearchActivityId){setActivityId(id);setStep(1);setPrediction('');setObservation('');setReflection('');setContrast(false);setFar(false);setStatus('');}
 async function save(){
  if(!prediction.trim()||!observation.trim()||!reflection.trim())return;
  const record:SavedResponse={schemaVersion:1,activityId,prediction:prediction.trim(),observation:observation.trim(),reflection:reflection.trim(),completedAt:new Date().toISOString()};
  const next=[...saved.filter(r=>r.activityId!==activityId),record];
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setSaved(next);}catch{}
  if(!participantCode.trim()||!participantPin.trim()){setStatus('Evidencia guardada solo en este navegador. Ingresa tu código y PIN para enviarla al docente.');return;}
  setStatus('Enviando evidencia…');
  try{localStorage.setItem('eduvirtual_participant_code',participantCode.trim().toUpperCase());await submitResearchResponse({code:participantCode.trim().toUpperCase(),pin:participantPin.trim(),activity:activityId,prediction:record.prediction,observation:record.observation,reflection:record.reflection});setStatus('Evidencia guardada y enviada al docente correctamente.');}catch(e){setStatus(e instanceof Error?`Guardado localmente, pero no se pudo enviar: ${e.message}`:'Guardado localmente, pero no se pudo enviar.');}
 }
 function exportJson(){download('eduvirtual-evidencias.json',JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),responses:saved},null,2),'application/json');}
 function exportCsv(){
  const esc=(s:string)=>'"'+s.replace(/"/g,'""')+'"';const rows=[['actividad','prediccion','observacion','reconstruccion','fecha'],...saved.map(r=>[r.activityId,r.prediction,r.observation,r.reflection,r.completedAt])];
  download('eduvirtual-evidencias.csv',rows.map(row=>row.map(esc).join(',')).join('\n'),'text/csv;charset=utf-8');
 }
 return <div className="research-lab">
  <aside className="research-nav">
   <span className="eyebrow">ACTIVIDADES DE INVESTIGACIÓN</span><h2>Predice, explora y reconstruye</h2><p>Secuencia alineada con las dimensiones de análisis del Capítulo I.</p>
   <div className="research-activity-list">{researchActivities.map(a=><button key={a.id} className={a.id===activityId?'active':''} onClick={()=>choose(a.id)}><span>{a.title}</span><small>{a.subtitle}</small></button>)}</div>
   <div className="research-participant"><span className="eyebrow">PARTICIPANTE</span><label>Código<input placeholder="EST-001" value={participantCode} onChange={e=>setParticipantCode(e.target.value.toUpperCase())}/></label><label>PIN<input type="password" inputMode="numeric" placeholder="••••" value={participantPin} onChange={e=>setParticipantPin(e.target.value)}/></label><small>Tu código identifica tus respuestas sin pedir nombre ni correo.</small></div><div className="research-progress-summary"><span className="eyebrow">EVIDENCIAS LOCALES</span><strong>{saved.length}/3</strong><p>Actividades guardadas en este navegador.</p>{saved.length>0&&<div className="research-export"><button onClick={exportJson}>Exportar JSON</button><button onClick={exportCsv}>Exportar CSV</button></div>}</div>
  </aside>

  <section className="research-stage">
   <div className="research-stage-head"><div><span className="live-dot"/><strong>{activity.title}</strong><small>{activity.subtitle}</small></div><span>Actividad piloto</span></div>
   <div className="research-visual"><Experiment id={activityId} contrast={contrast} far={far}/><div className="research-equation-chip">{activityId==='parabola'?'y = x²':activityId==='elipse'?'x²/9 + y²/4 = 1':'x²/9 − y²/4 = 1'}</div></div>
   <div className="research-controls"><button className={contrast?'active':''} onClick={()=>setContrast(v=>!v)}><Icon name="eye" size={15}/>{contrast?'Ocultar contraste':'Activar contraste'}</button>{activityId==='hiperbola'&&<button className={far?'active':''} onClick={()=>setFar(v=>!v)}><Icon name="grid" size={15}/>{far?'Vista cercana':'Ver más lejos'}</button>}<span>{activityId==='parabola'?(contrast?'Comparando y = x² con y = 4x²':'Curva base'):activityId==='elipse'?(contrast?'Comparando con x²/4 + y²/4 = 1':'Elipse base'):(contrast?'Asíntotas y = ±(2/3)x visibles':'Hipérbola base')}</span></div>
  </section>

  <aside className="research-form">
   <div className="research-stepper" aria-label="Progreso de la actividad">{[1,2,3].map(n=><button key={n} className={step===n?'active':n<step?'done':''} onClick={()=>{if(n<step)setStep(n as Step)}}>{n}</button>)}</div>
   {step===1&&<><span className="eyebrow">1 · NATURALIZACIÓN</span><h2>Explica tu idea inicial</h2><p>{activity.naturalizacion.question}</p><textarea maxLength={2000} value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder={activity.naturalizacion.placeholder}/><button className="primary research-next" disabled={!prediction.trim()} onClick={()=>setStep(2)}>Registrar predicción y explorar</button></>}
   {step===2&&<><span className="eyebrow">2 · DESNATURALIZACIÓN</span><h2>Contrasta tu supuesto</h2><p>{activity.desnaturalizacion.instruction}</p><div className="research-prompt">{activity.desnaturalizacion.prompt}</div><blockquote>Tu predicción: {prediction}</blockquote><label>Después de explorar, registra lo que observaste.</label><textarea maxLength={3000} value={observation} onChange={e=>setObservation(e.target.value)} placeholder={activity.desnaturalizacion.observationPlaceholder}/><button className="primary research-next" disabled={!observation.trim()} onClick={()=>setStep(3)}>Continuar a reconstrucción</button></>}
   {step===3&&<><span className="eyebrow">3 · RECONSTRUCCIÓN REFLEXIVA</span><h2>Reformula tu explicación</h2><p>{activity.reconstruccion.question}</p><textarea maxLength={4000} value={reflection} onChange={e=>setReflection(e.target.value)} placeholder={activity.reconstruccion.placeholder}/><button className="primary research-next" disabled={!reflection.trim()} onClick={save}>Guardar evidencia</button><button className="research-back" onClick={()=>setStep(2)}>← Volver a explorar</button></>}
   {status&&<p className="research-status" role="status">{status}</p>}
   <div className="research-privacy"><Icon name="help" size={16}/><p><strong>Sin nombres ni cuentas.</strong> Las respuestas se guardan en este navegador. Al pulsar Guardar evidencia, se envían también a Supabase si has introducido código y PIN. El PIN no se almacena en este navegador.</p></div>
  </aside>
 </div>;
}
