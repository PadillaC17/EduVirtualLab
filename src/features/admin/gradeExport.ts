/**
 * Exportación reproducible para análisis de tesis.
 * Una fila por participante, sin nombres; compara medias de intentos pretest/postest.
 * Nunca se expone una clave privada de Supabase en el cliente.
 */
export type GradeAttempt={participant_id:string;mode:string;score:number;submitted_at:string};
export type GradeParticipant={id:string;code:string;cohort:string|null;is_active:boolean};
export type GradeResearch={participant_id:string;activity_id:string};
export function scoreReport(participants:GradeParticipant[],attempts:GradeAttempt[],research:GradeResearch[]){
 return participants.map(p=>{
  const mine=attempts.filter(a=>a.participant_id===p.id);
  const mean=(mode:string)=>{const scores=mine.filter(a=>a.mode===mode&&Number.isFinite(Number(a.score))).map(a=>Number(a.score));return scores.length? scores.reduce((s,n)=>s+n,0)/scores.length:null;};
  const pre=mean('pretest'),post=mean('posttest');
  return {code:p.code,cohort:p.cohort??'',active:p.is_active,pretest:pre,posttest:post,change:pre===null||post===null?null:post-pre,preCount:mine.filter(a=>a.mode==='pretest').length,postCount:mine.filter(a=>a.mode==='posttest').length,practiceCount:mine.filter(a=>a.mode==='practice').length,evaluationCount:mine.filter(a=>a.mode==='evaluation').length,researchCount:new Set(research.filter(r=>r.participant_id===p.id).map(r=>r.activity_id)).size};
 });
}
function safeCell(value:unknown):string{
 const s=value===null||value===undefined?'':String(value);
 // Evita inyección de fórmulas en aplicaciones de hojas de cálculo.
 const neutral=/^[\s\u0000-\u001f]*[=+@\-]/.test(s)?"'"+s:s;
 return '"'+neutral.replace(/"/g,'""')+'"';
}
export function reportCSV(rows:ReturnType<typeof scoreReport>):string{
 const columns=['codigo','cohorte','activo','pretest_promedio_100','posttest_promedio_100','cambio_puntos','intentos_pretest','intentos_posttest','practicas','evaluaciones','actividades_reflexivas'];
 const data=rows.map(r=>[r.code,r.cohort,r.active?'si':'no',r.pretest===null?'':r.pretest.toFixed(2),r.posttest===null?'':r.posttest.toFixed(2),r.change===null?'':r.change.toFixed(2),r.preCount,r.postCount,r.practiceCount,r.evaluationCount,r.researchCount]);
 return '\uFEFF'+[columns,...data].map(row=>row.map(safeCell).join(';')).join('\r\n')+'\r\n';
}
export function downloadReport(csv:string){
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download='eduvirtual-tesis-pretest-postest.csv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
