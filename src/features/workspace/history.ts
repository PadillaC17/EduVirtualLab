import type { Point } from '../../domain/model';
export type History={past:Point[][];present:Point[];future:Point[][]};
export type Action={type:'commit';points:Point[]}|{type:'undo'}|{type:'redo'};
export function historyReducer(state:History,action:Action):History{
 if(action.type==='undo') {if(!state.past.length)return state;return {past:state.past.slice(0,-1),present:state.past.at(-1)!,future:[state.present,...state.future]};}
 if(action.type==='redo') {if(!state.future.length)return state;return {past:[...state.past,state.present].slice(-50),present:state.future[0],future:state.future.slice(1)};}
 if(JSON.stringify(state.present)===JSON.stringify(action.points))return state;
 return {past:[...state.past,state.present].slice(-50),present:action.points,future:[]};
}
