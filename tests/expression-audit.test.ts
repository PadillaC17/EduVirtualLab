import {describe,it,expect} from 'vitest';
import {evaluate,parseExpression,parseStatement,sampleImplicit,sampleFunction,statementSymbols} from '../src/math/expression';
import {nodeToLatex,statementToLatex,visualAsciiToStatement} from '../src/math/format';
describe('auditoría matemática de Fase 3',()=>{
 it.each([['-x^2',-9],['(-x)^2',9],['2^-2',.25],['2^3^2',512],['-2^2',-4],['2(-3+5)',4],['3x+2',11]])('respeta la precedencia: %s',(source,value)=>{expect(evaluate(parseExpression(source as string),{x:3})).toBe(value);});
 it('admite el ejemplo original sin asteriscos',()=>{const s=parseStatement('V=πr²h');if(s.kind!=='scalar')throw Error();expect(evaluate(s.expr,{r:2,h:3})).toBeCloseTo(12*Math.PI);});
 it('clasifica un punto espacial y recupera sus parámetros',()=>{const s=parseStatement('A=(a,2,3)');expect(s.kind).toBe('point3d');expect(statementSymbols(s)).toEqual(['a']);});
 it('recupera parámetros de una función y una superficie',()=>{expect(statementSymbols(parseStatement('f(x)=a*x²+b'))).toEqual(['a','b']);expect(statementSymbols(parseStatement('z=a*x²+y²'))).toEqual(['a']);});
 it('no rechaza divisores pequeños pero no nulos',()=>{expect(evaluate(parseExpression('1/(10^-16)'))).toBeCloseTo(1e16);});
 it.each(['1e309','y=constructor(x)','y=x.foo','y=sin()','y=(x','y=sin(x,2)','='.repeat(513)])('rechaza entradas fuera del alcance: %s',s=>{expect(()=>parseStatement(s)).toThrow();});
 it('limita la profundidad antes de evaluar',()=>{expect(()=>parseStatement('y='+'('.repeat(40)+'x'+')'.repeat(40))).toThrow('profunda');});
 it('no convierte la asíntota de 1/x=0 en un contorno',()=>{const s=parseStatement('1/x=0');if(s.kind!=='implicit2d')throw Error();expect(sampleImplicit(s.left,s.right,-1,1,-1,1,10,10)).toHaveLength(0);});
 it('no corta artificialmente una recta de pendiente grande',()=>{const mesh=sampleFunction(parseExpression('100*x'),-1,1,10);expect(mesh).toHaveLength(1);});
 it('los puntos del contorno circular satisfacen la ecuación',()=>{const s=parseStatement('x²+y²=25');if(s.kind!=='implicit2d')throw Error();const lines=sampleImplicit(s.left,s.right);expect(lines.length).toBeGreaterThan(100);for(const p of lines.flat())expect(p.x*p.x+p.y*p.y).toBeCloseTo(25,3);});
 it('separa formato visual y representación interna',()=>{const s=visualAsciiToStatement('y=((x)^(2))+(3*x)-4');if(s.kind!=='function2d')throw Error();expect(evaluate(s.expr,{x:2})).toBe(6);expect(statementToLatex(s)).toContain('y=');expect(nodeToLatex(parseExpression('1/x'))).toContain('\\frac');});
});
