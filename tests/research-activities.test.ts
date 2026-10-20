import {describe,expect,it} from 'vitest';
import {researchActivities} from '../src/data/researchActivities';

describe('Thesis research activities',()=>{
 it('covers the three conic sections',()=>{
  expect(researchActivities.map(a=>a.id)).toEqual(['parabola','elipse','hiperbola']);
 });
 it('provides naturalization, denaturalization and reflective reconstruction prompts',()=>{
  for(const activity of researchActivities){
   expect(activity.naturalizacion.question.trim().length).toBeGreaterThan(20);
   expect(activity.desnaturalizacion.instruction.trim().length).toBeGreaterThan(20);
   expect(activity.desnaturalizacion.observationQuestion.trim().length).toBeGreaterThan(20);
   expect(activity.reconstruccion.question.trim().length).toBeGreaterThan(20);
  }
 });
});
