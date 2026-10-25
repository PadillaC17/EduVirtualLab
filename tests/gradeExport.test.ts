import {describe,it,expect} from 'vitest';
import {reportCSV,scoreReport} from '../src/features/admin/gradeExport';
describe('reporte para tesis',()=>{
 const people=[{id:'a',code:'EST-001',cohort:'2026',is_active:true},{id:'b',code:'EST-002',cohort:null,is_active:true}];
 const attempts=[{participant_id:'a',mode:'pretest',score:30,submitted_at:''},{participant_id:'a',mode:'posttest',score:70,submitted_at:''},{participant_id:'a',mode:'posttest',score:90,submitted_at:''}];
 it('calcula cambio entre medias sin inventar datos incompletos',()=>{
  const rows=scoreReport(people,attempts,[{participant_id:'a',activity_id:'parabola'},{participant_id:'a',activity_id:'parabola'}]);
  expect(rows[0].pretest).toBe(30);expect(rows[0].posttest).toBe(80);expect(rows[0].change).toBe(50);expect(rows[0].researchCount).toBe(1);
  expect(rows[1].change).toBeNull();expect(reportCSV(rows)).toContain('"50.00"');
 });
 it('neutraliza fórmulas inyectadas en celdas',()=>{
  const data=scoreReport([{id:'c',code:'=HYPERLINK("bad")',cohort:null,is_active:true}],[],[]);
  expect(reportCSV(data)).toContain('"\'=HYPERLINK(""bad"")"');
 });
});
