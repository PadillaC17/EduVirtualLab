/** Contrato inicial: preguntas de selección única para Geometría II. */
export type QuizChoice={id:'A'|'B'|'C'|'D';text:string};
export type QuizQuestion={id:string;prompt:string;choices:[QuizChoice,QuizChoice,QuizChoice,QuizChoice];correctId:'A'|'B'|'C'|'D';topic:'parabola'|'elipse'|'hiperbola';explanation:string};
export function validateQuestion(q:QuizQuestion):string[]{
 const errors:string[]=[];
 if(!q.id.trim()||!q.prompt.trim())errors.push('Faltan identificación o enunciado');
 if(q.choices.length!==4||q.choices.map(c=>c.id).join(',')!=='A,B,C,D')errors.push('Deben existir exactamente cuatro opciones A, B, C y D');
 if(q.choices.some(c=>!c.text.trim()))errors.push('Las cuatro opciones deben tener texto');
 if(new Set(q.choices.map(c=>c.text.trim().toLowerCase())).size!==4)errors.push('No deben repetirse opciones');
 if(!q.choices.some(c=>c.id===q.correctId))errors.push('La respuesta correcta debe existir');
 return errors;
}
export function gradeQuiz(questions:QuizQuestion[],answers:Record<string,string>){
 if(questions.length===0)throw new Error('El cuestionario no tiene preguntas');
 const bad=questions.filter(q=>validateQuestion(q).length>0);
 if(bad.length)throw new Error('Hay preguntas inválidas');
 const seen=new Set<string>();
 for(const q of questions){if(seen.has(q.id))throw new Error('Hay identificadores repetidos');seen.add(q.id);}
 const correct=questions.filter(q=>answers[q.id]===q.correctId).length;
 return {correct,total:questions.length,score:Math.round((100*correct/questions.length)*100)/100};
}
export const DEMO_QUESTIONS:QuizQuestion[]=[
{id:'geo-p1',topic:'parabola',prompt:'¿Cuál es el vértice de la parábola y = (x − 2)² + 3?',choices:[{id:'A',text:'(2, 3)'},{id:'B',text:'(−2, 3)'},{id:'C',text:'(3, 2)'},{id:'D',text:'(0, 3)'}],correctId:'A',explanation:'La forma y = (x − h)² + k tiene vértice (h, k).'},
{id:'geo-e1',topic:'elipse',prompt:'En una elipse con semieje mayor a = 5 y menor b = 3, ¿cuánto vale c?',choices:[{id:'A',text:'8'},{id:'B',text:'4'},{id:'C',text:'2'},{id:'D',text:'√34'}],correctId:'B',explanation:'En una elipse c² = a² − b² = 25 − 9 = 16.'},
{id:'geo-h1',topic:'hiperbola',prompt:'¿Cuáles son las asíntotas de x²/9 − y²/4 = 1?',choices:[{id:'A',text:'y = ±(3/2)x'},{id:'B',text:'x = ±3'},{id:'C',text:'y = ±(2/3)x'},{id:'D',text:'y = ±2'}],correctId:'C',explanation:'Para la hipérbola horizontal y = ±(b/a)x, con b = 2 y a = 3.'}
];
