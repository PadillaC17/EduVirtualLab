import {describe,it,expect} from 'vitest';
import {historyReducer,type History} from '../src/features/workspace/history';
import {INITIAL_POINTS} from '../src/domain/model';
const initial:History={past:[],present:INITIAL_POINTS,future:[]};
describe('historial de construcciones',()=>{
 it('restaura puntos y coordenadas al deshacer y rehacer',()=>{const moved=INITIAL_POINTS.map(p=>p.id==='a'?{...p,x:8}:p);const edited=historyReducer(initial,{type:'commit',points:moved});const undone=historyReducer(edited,{type:'undo'});expect(undone.present).toEqual(INITIAL_POINTS);expect(historyReducer(undone,{type:'redo'}).present).toEqual(moved);});
 it('permite recuperar puntos al vaciar el plano',()=>{const cleared=historyReducer(initial,{type:'commit',points:[]});expect(historyReducer(cleared,{type:'undo'}).present).toEqual(INITIAL_POINTS);});
 it('invalida rehacer cuando se abre una nueva rama',()=>{const undone=historyReducer(historyReducer(initial,{type:'commit',points:[]}),{type:'undo'});expect(historyReducer(undone,{type:'commit',points:[INITIAL_POINTS[0]]}).future).toEqual([]);});
 it('no registra cambios idénticos ni muta el estado anterior',()=>{expect(historyReducer(initial,{type:'commit',points:INITIAL_POINTS})).toBe(initial);historyReducer(initial,{type:'commit',points:[]});expect(initial.present).toHaveLength(3);});
 it('conserva como máximo 50 pasos',()=>{let s=initial;for(let i=0;i<60;i++)s=historyReducer(s,{type:'commit',points:[{...INITIAL_POINTS[0],x:i}]});expect(s.past).toHaveLength(50);});
});
