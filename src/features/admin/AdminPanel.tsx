import {useEffect,useMemo,useState} from 'react';
import BrandLogo from '../../components/BrandLogo';
import Icon from '../../components/Icon';
import {createParticipant,ensureFreshSession,getParticipantSummary,getQuizAttempts,getResearch,isAdmin,loadAdminSession,loginAdmin,logoutAdmin,setParticipantActive,type AdminSession,type ParticipantSummary,type QuizAttempt,type ResearchRow} from '../../services/supabaseAdmin';

function fmtDate(value:string|null){if(!value)return '—';try{return new Intl.DateTimeFormat('es-EC',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch{return value;}}
function pct(v:number|null){return v===null?'—':`${Number(v).toFixed(1)}%`;}

export default function AdminPanel(){
 const [session,setSession]=useState<AdminSession|null>(loadAdminSession());
 const [authorized,setAuthorized]=useState<boolean|null>(null);
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loginError,setLoginError]=useState('');
 const [participants,setParticipants]=useState<ParticipantSummary[]>([]);const [research,setResearch]=useState<ResearchRow[]>([]);const [attempts,setAttempts]=useState<QuizAttempt[]>([]);
 const [selected,setSelected]=useState<string|null>(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 const [newCode,setNewCode]=useState('');const [cohort,setCohort]=useState('2026-2027');const [showCreate,setShowCreate]=useState(false);
 const [section,setSection]=useState<'overview'|'students'|'research'|'quiz'>('overview');

 async function hydrate(s:AdminSession){
  setLoading(true);setError('');
  try{
   const fresh=await ensureFreshSession(s);setSession(fresh);
   const ok=await isAdmin(fresh.access_token);setAuthorized(ok);
   if(!ok){setLoading(false);return;}
   const [p,r,q]=await Promise.all([getParticipantSummary(fresh.access_token),getResearch(fresh.access_token),getQuizAttempts(fresh.access_token)]);
   setParticipants(p);setResearch(r);setAttempts(q);
  }catch(e){setError(e instanceof Error?e.message:'No se pudo cargar el panel.');}
  finally{setLoading(false);}
 }
 useEffect(()=>{if(session)void hydrate(session);else setAuthorized(false);},[]);

 async function login(e:React.FormEvent){e.preventDefault();setLoginError('');setLoading(true);try{const s=await loginAdmin(email.trim(),password);setSession(s);await hydrate(s);}catch(err){setLoginError(err instanceof Error?err.message:'No se pudo iniciar sesión.');setLoading(false);}}
 async function signout(){await logoutAdmin(session);setSession(null);setAuthorized(false);setParticipants([]);setResearch([]);setAttempts([]);}
 async function addParticipant(e:React.FormEvent){e.preventDefault();if(!session)return;setError('');try{await createParticipant(session.access_token,{code:newCode.trim().toUpperCase(),course:'Geometría II',cohort:cohort.trim()});setNewCode('');setShowCreate(false);await hydrate(session);}catch(err){setError(err instanceof Error?err.message:'No se pudo crear el participante.');}}
 async function toggleParticipant(p:ParticipantSummary){if(!session)return;try{await setParticipantActive(session.access_token,p.id,!p.is_active);await hydrate(session);}catch(err){setError(err instanceof Error?err.message:'No se pudo actualizar.');}}

 const stats=useMemo(()=>({
  students:participants.length,
  active:participants.filter(p=>p.is_active).length,
  research:research.length,
  attempts:attempts.length,
  avg:attempts.length?attempts.reduce((a,b)=>a+Number(b.score),0)/attempts.length:null
 }),[participants,research,attempts]);
 const selectedP=participants.find(p=>p.id===selected)??null;
 const selectedResearch=selected?research.filter(r=>r.participant_id===selected):research;
 const selectedAttempts=selected?attempts.filter(a=>a.participant_id===selected):attempts;

 if(!session)return <div className="admin-login-shell"><div className="admin-login-card"><div className="admin-brand"><BrandLogo size={42}/><div><strong>EduVirtual Lab</strong><span>Panel del administrador</span></div></div><span className="eyebrow">ACCESO PRIVADO</span><h1>Resultados de Geometría II</h1><p>Consulta calificaciones, respuestas de investigación y progreso de los participantes desde un único panel.</p><form onSubmit={login}><label>Correo del administrador<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{loginError&&<p className="math-error" role="alert">{loginError}</p>}<button className="primary" disabled={loading}>{loading?'Verificando…':'Ingresar al panel'}</button></form><small>El acceso depende de Supabase Auth y de estar registrado como administrador del proyecto.</small><a href="/">← Volver al laboratorio</a></div></div>;

 if(authorized===false)return <div className="admin-login-shell"><div className="admin-login-card"><div className="admin-brand"><BrandLogo size={42}/><div><strong>EduVirtual Lab</strong><span>Panel del administrador</span></div></div><span className="eyebrow">ACCESO RESTRINGIDO</span><h1>Cuenta sin permisos de administrador</h1><p>La sesión es válida, pero este usuario todavía no figura en la tabla de administradores.</p><button className="primary" onClick={signout}>Cerrar sesión</button><a href="/">← Volver al laboratorio</a></div></div>;

 return <div className="admin-shell">
  <aside className="admin-sidebar"><div className="admin-brand"><BrandLogo size={34}/><div><strong>EduVirtual Lab</strong><span>Administración</span></div></div><nav>{([['overview','grid','Resumen'],['students','cursor','Estudiantes'],['research','book','Investigación'],['quiz','circle','Calificaciones']] as const).map(([id,icon,label])=><button key={id} className={section===id?'active':''} onClick={()=>setSection(id)}><Icon name={icon} size={17}/>{label}</button>)}</nav><div className="admin-side-bottom"><a href="/">Abrir laboratorio ↗</a><button onClick={signout}>Cerrar sesión</button></div></aside>
  <main className="admin-main">
   <header className="admin-top"><div><span className="eyebrow">PANEL DEL DOCENTE</span><h1>{section==='overview'?'Resumen general':section==='students'?'Participantes':section==='research'?'Evidencias de investigación':'Calificaciones y quiz'}</h1></div><div className="admin-top-actions"><button onClick={()=>session&&hydrate(session)} disabled={loading}><Icon name="reset" size={16}/>{loading?'Actualizando…':'Actualizar'}</button><button className="primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={16}/>Nuevo participante</button></div></header>
   {error&&<p className="admin-error" role="alert">{error}</p>}
   {section==='overview'&&<><section className="admin-kpis"><article><span>Participantes</span><strong>{stats.students}</strong><small>{stats.active} activos</small></article><article><span>Actividades registradas</span><strong>{stats.research}</strong><small>Naturalización → reconstrucción</small></article><article><span>Intentos de quiz</span><strong>{stats.attempts}</strong><small>Evaluaciones almacenadas</small></article><article><span>Promedio general</span><strong>{pct(stats.avg)}</strong><small>Sobre 100 puntos</small></article></section><section className="admin-grid-two"><div className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">RENDIMIENTO</span><h2>Últimos intentos</h2></div><button onClick={()=>setSection('quiz')}>Ver todos</button></div><AttemptTable attempts={attempts.slice(0,6)} participants={participants}/></div><div className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">INVESTIGACIÓN</span><h2>Últimas evidencias</h2></div><button onClick={()=>setSection('research')}>Ver todas</button></div>{research.slice(0,5).map(r=><div className="admin-feed" key={r.id}><span>{participants.find(p=>p.id===r.participant_id)?.code??'—'}</span><div><strong>{r.activity_id[0].toUpperCase()+r.activity_id.slice(1)}</strong><small>{fmtDate(r.submitted_at)}</small></div></div>)}{!research.length&&<p className="admin-empty">Todavía no hay evidencias registradas.</p>}</div></section></>}
   {section==='students'&&<section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">GEOMETRÍA II</span><h2>Listado de participantes</h2></div><span>{participants.length} registros</span></div><div className="admin-table-wrap"><table><thead><tr><th>Código</th><th>Cohorte</th><th>Investigación</th><th>Quiz</th><th>Promedio</th><th>Estado</th><th/></tr></thead><tbody>{participants.map(p=><tr key={p.id} className={selected===p.id?'selected':''}><td><button className="admin-code" onClick={()=>setSelected(p.id)}>{p.code}</button></td><td>{p.cohort||'—'}</td><td>{p.research_activities}/3</td><td>{p.quiz_attempts}</td><td>{pct(p.quiz_average)}</td><td><span className={p.is_active?'status-active':'status-off'}>{p.is_active?'Activo':'Inactivo'}</span></td><td><button onClick={()=>toggleParticipant(p)}>{p.is_active?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table></div>{selectedP&&<div className="admin-student-detail"><div><span className="eyebrow">PARTICIPANTE SELECCIONADO</span><h3>{selectedP.code}</h3><p>{selectedP.course} · {selectedP.cohort||'Sin cohorte'}</p></div><button onClick={()=>{setSection('research')}}>Ver respuestas</button><button onClick={()=>{setSection('quiz')}}>Ver calificaciones</button></div>}</section>}
   {section==='research'&&<section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">RESPUESTAS CUALITATIVAS</span><h2>{selectedP?`Evidencias de ${selectedP.code}`:'Todas las evidencias'}</h2></div>{selected&&<button onClick={()=>setSelected(null)}>Ver todos</button>}</div><div className="admin-research-list">{selectedResearch.map(r=><article key={r.id}><header><span>{participants.find(p=>p.id===r.participant_id)?.code??'—'}</span><strong>{r.activity_id[0].toUpperCase()+r.activity_id.slice(1)}</strong><small>{fmtDate(r.submitted_at)}</small></header><div><section><b>Naturalización</b><p>{r.prediction}</p></section><section><b>Desnaturalización</b><p>{r.observation}</p></section><section><b>Reconstrucción reflexiva</b><p>{r.reflection}</p></section></div></article>)}</div>{!selectedResearch.length&&<p className="admin-empty">No hay respuestas para mostrar.</p>}</section>}
   {section==='quiz'&&<section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">EVALUACIÓN</span><h2>{selectedP?`Resultados de ${selectedP.code}`:'Todos los intentos'}</h2></div>{selected&&<button onClick={()=>setSelected(null)}>Ver todos</button>}</div><AttemptTable attempts={selectedAttempts} participants={participants}/></section>}
  </main>
  {showCreate&&<div className="admin-modal-backdrop" onClick={()=>setShowCreate(false)}><form className="admin-modal" onSubmit={addParticipant} onClick={e=>e.stopPropagation()}><button type="button" className="project-close" onClick={()=>setShowCreate(false)}>×</button><span className="eyebrow">NUEVO PARTICIPANTE</span><h2>Crear código de estudiante</h2><p>No necesitas guardar nombres. Usa códigos como EST-001 para mantener la investigación seudonimizada.</p><label>Código<input required pattern="EST-[0-9]{3,4}" placeholder="EST-001" value={newCode} onChange={e=>setNewCode(e.target.value.toUpperCase())}/></label><label>Cohorte o periodo<input maxLength={40} value={cohort} onChange={e=>setCohort(e.target.value)}/></label><button className="primary">Crear participante</button></form></div>}
 </div>;
}

function AttemptTable({attempts,participants}:{attempts:QuizAttempt[];participants:ParticipantSummary[]}){
 return <div className="admin-table-wrap"><table><thead><tr><th>Estudiante</th><th>Evaluación</th><th>Modo</th><th>Aciertos</th><th>Calificación</th><th>Fecha</th></tr></thead><tbody>{attempts.map(a=><tr key={a.id}><td>{participants.find(p=>p.id===a.participant_id)?.code??'—'}</td><td>{a.quiz_key}</td><td>{a.mode}</td><td>{a.correct_count}/{a.total_questions}</td><td><strong>{Number(a.score).toFixed(1)}%</strong></td><td>{fmtDate(a.submitted_at)}</td></tr>)}</tbody></table>{!attempts.length&&<p className="admin-empty">Todavía no hay intentos registrados.</p>}</div>;
}
