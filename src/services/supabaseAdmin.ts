// El entorno de prueba DEBE usar un proyecto Supabase distinto al de producción.
const SUPABASE_URL=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const SUPABASE_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined;
if(!SUPABASE_URL||!SUPABASE_KEY)console.warn('EduVirtual TEST: Supabase de pruebas no configurado. El acceso remoto no funcionará.');
const SESSION_KEY='eduvirtual_admin_session_v1';

export type AdminSession={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string}};
export type ParticipantSummary={id:string;code:string;course:string;cohort:string|null;is_active:boolean;created_at:string;research_activities:number;quiz_attempts:number;quiz_average:number|null;last_quiz_at:string|null};
export type ResearchRow={id:string;participant_id:string;activity_id:'parabola'|'elipse'|'hiperbola';prediction:string;observation:string;reflection:string;submitted_at:string};
export type QuizAttempt={id:string;participant_id:string;quiz_key:string;mode:'practice'|'evaluation'|'pretest'|'posttest';score:number;correct_count:number;total_questions:number;started_at:string|null;submitted_at:string};

function headers(token?:string){if(!SUPABASE_URL||!SUPABASE_KEY)throw new Error('Configura las variables de Supabase TEST antes de usar cuentas.');return{'apikey':SUPABASE_KEY,'Content-Type':'application/json',...(token?{'Authorization':`Bearer ${token}`}:{})};}
async function parse(res:Response){const text=await res.text();let data:any=null;try{data=text?JSON.parse(text):null;}catch{data=text}if(!res.ok)throw new Error(data?.msg||data?.message||data?.error_description||data?.error||`Error ${res.status}`);return data;}

export function loadAdminSession():AdminSession|null{
 try{const raw=localStorage.getItem(SESSION_KEY);if(!raw)return null;const s=JSON.parse(raw) as AdminSession;if(!s?.access_token||!s?.expires_at)return null;return s;}catch{return null;}
}
export function saveAdminSession(s:AdminSession|null){try{s?localStorage.setItem(SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(SESSION_KEY);}catch{}}
export async function loginAdmin(email:string,password:string):Promise<AdminSession>{
 const res=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
 const data=await parse(res);const session:AdminSession={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in??3600),user:{id:data.user.id,email:data.user.email}};saveAdminSession(session);return session;
}
export async function refreshAdminSession(session:AdminSession):Promise<AdminSession>{
 const res=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})});
 const data=await parse(res);const next:AdminSession={access_token:data.access_token,refresh_token:data.refresh_token??session.refresh_token,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in??3600),user:{id:data.user.id,email:data.user.email}};saveAdminSession(next);return next;
}
export async function ensureFreshSession(session:AdminSession){return session.expires_at-Math.floor(Date.now()/1000)<90?refreshAdminSession(session):session;}
export async function logoutAdmin(session:AdminSession|null){if(session?.access_token){try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:headers(session.access_token)});}catch{}}saveAdminSession(null);}

async function rest<T>(path:string,token:string,init:RequestInit={}){const res=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{...headers(token),...(init.headers??{})}});return parse(res) as Promise<T>;}
export async function isAdmin(token:string){const rows=await rest<any[]>(`admin_users?select=user_id&limit=1`,token);return rows.length>0;}
export async function getParticipantSummary(token:string){return rest<ParticipantSummary[]>('admin_participant_summary?select=*&order=code.asc',token);}
export async function getResearch(token:string,participantId?:string){return rest<ResearchRow[]>(`research_responses?select=*&order=submitted_at.desc${participantId?`&participant_id=eq.${encodeURIComponent(participantId)}`:''}`,token);}
export async function getQuizAttempts(token:string,participantId?:string){return rest<QuizAttempt[]>(`quiz_attempts?select=*&order=submitted_at.desc${participantId?`&participant_id=eq.${encodeURIComponent(participantId)}`:''}`,token);}
export async function createParticipant(token:string,payload:{code:string;course:string;cohort?:string;pin:string}){return rest<any[]>('rpc/admin_create_participant',token,{method:'POST',body:JSON.stringify({p_code:payload.code,p_course:payload.course,p_cohort:payload.cohort??null,p_pin:payload.pin})});}
export async function submitResearchResponse(payload:{code:string;pin:string;activity:'parabola'|'elipse'|'hiperbola';prediction:string;observation:string;reflection:string}){const res=await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_research_response`,{method:'POST',headers:headers(),body:JSON.stringify({p_code:payload.code,p_pin:payload.pin,p_activity:payload.activity,p_prediction:payload.prediction,p_observation:payload.observation,p_reflection:payload.reflection})});return parse(res);}
export async function setParticipantActive(token:string,id:string,is_active:boolean){return rest<any[]>(`participants?id=eq.${encodeURIComponent(id)}&select=*`,token,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({is_active})});}
