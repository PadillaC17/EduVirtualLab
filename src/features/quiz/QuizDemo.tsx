import {useState} from 'react';
import {DEMO_QUESTIONS,gradeQuiz} from './quizDomain';
export default function QuizDemo(){
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [submitted,setSubmitted]=useState(false);
 const result=submitted?gradeQuiz(DEMO_QUESTIONS,answers):null;
 return <main style={{maxWidth:820,margin:'36px auto',padding:20,fontFamily:'system-ui, sans-serif',color:'#152a46'}}>
  <a href="/" style={{color:'#007ac9'}}>← Volver a EduVirtual LAB</a>
  <header style={{margin:'25px 0'}}><p style={{color:'#1379bf',fontWeight:700}}>AULA DE GEOMETRÍA II · DEMOSTRACIÓN</p><h1>Cuestionario de secciones cónicas</h1><p>Ejemplo local para revisar el diseño. No solicita cuentas ni envía calificaciones a Supabase.</p></header>
  {DEMO_QUESTIONS.map((q,index)=><fieldset key={q.id} disabled={submitted} style={{border:'1px solid #cdd9e9',borderRadius:12,padding:18,marginBottom:16,background:'white'}}>
   <legend style={{fontWeight:700}}>Pregunta {index+1} de {DEMO_QUESTIONS.length} · {q.topic}</legend>
   <p style={{fontWeight:600}}>{q.prompt}</p>
   {q.choices.map(c=><label key={c.id} style={{display:'block',padding:9,cursor:'pointer'}}>
    <input type="radio" name={q.id} checked={answers[q.id]===c.id} onChange={()=>setAnswers(v=>({...v,[q.id]:c.id}))}/> <b>{c.id}.</b> {c.text}
   </label>)}
   {submitted&&<p style={{background:'#e8f3ff',borderRadius:6,padding:10}}>Respuesta correcta: {q.correctId}. {q.explanation}</p>}
  </fieldset>)}
  {result?<section aria-live="polite"><h2>Resultado: {result.score}/100</h2><p>{result.correct} de {result.total} respuestas correctas.</p><button onClick={()=>{setSubmitted(false);setAnswers({});}} style={{padding:12,background:'#0c80c6',color:'white',border:0,borderRadius:8}}>Reiniciar práctica</button></section>
  :<button disabled={Object.keys(answers).length!==DEMO_QUESTIONS.length} onClick={()=>setSubmitted(true)} style={{padding:14,background:'#0c80c6',color:'white',border:0,borderRadius:8,opacity:Object.keys(answers).length!==DEMO_QUESTIONS.length?.5:1}}>Finalizar cuestionario</button>}
  <p style={{fontSize:12,marginTop:20,color:'#617287'}}>Las respuestas correctas se incluyen en el navegador únicamente porque es una demostración de práctica. Una evaluación real deberá calificarse en un servidor protegido.</p>
 </main>;
}
