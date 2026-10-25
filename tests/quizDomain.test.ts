import {describe,it,expect} from 'vitest';
import {DEMO_QUESTIONS,gradeQuiz,validateQuestion} from '../src/features/quiz/quizDomain';
describe('cuestionarios de Geometría II',()=>{
 it('valida las cuatro opciones',()=>{expect(DEMO_QUESTIONS.every(q=>validateQuestion(q).length===0)).toBe(true);});
 it('calcula calificación sobre 100',()=>{expect(gradeQuiz(DEMO_QUESTIONS,{'geo-p1':'A','geo-e1':'B','geo-h1':'D'})).toEqual({correct:2,total:3,score:66.67});});
 it('rechaza cuestionario vacío',()=>{expect(()=>gradeQuiz([],{})).toThrow();});
});
