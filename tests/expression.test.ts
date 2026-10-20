import {describe,expect,it} from 'vitest';
import {ExpressionError,classificationName,evaluate,parseStatement,sampleFunction} from '../src/math/expression';

describe('Phase 3 expression parser',()=>{
 it('classifies the six planned input families',()=>{
  expect(classificationName(parseStatement('f(x)=x^2+3*x-4'))).toBe('Función 2D');
  expect(classificationName(parseStatement('y=sin(x)'))).toBe('Función 2D');
  expect(classificationName(parseStatement('x^2+y^2=25'))).toBe('Ecuación implícita 2D');
  expect(classificationName(parseStatement('z=x^2+y^2'))).toBe('Superficie explícita 3D');
  expect(classificationName(parseStatement('A=(2,3)'))).toBe('Punto 2D');
  expect(classificationName(parseStatement('V=pi*r^2*h'))).toBe('Fórmula escalar');
 });
 it('evaluates the acceptance example f(2)=6',()=>{
  const s=parseStatement('f(x)=x^2+3*x-4');if(s.kind!=='function2d')throw new Error('wrong type');
  expect(evaluate(s.expr,{x:2})).toBe(6);
 });
 it('evaluates scalar formulas with explicit parameters',()=>{
  const s=parseStatement('V=pi*r^2*h');if(s.kind!=='scalar')throw new Error('wrong type');
  expect(evaluate(s.expr,{r:2,h:3})).toBeCloseTo(12*Math.PI);
 });
 it('normalizes pi and superscript notation',()=>{
  const s=parseStatement('V=π*r²*h');if(s.kind!=='scalar')throw new Error('wrong type');
  expect(evaluate(s.expr,{r:2,h:1})).toBeCloseTo(4*Math.PI);
 });
 it('rejects arbitrary functions and property-like syntax',()=>{
  expect(()=>parseStatement('y=alert(x)')).toThrow(ExpressionError);
  expect(()=>parseStatement('y=x.foo')).toThrow(ExpressionError);
 });
 it('reports division by zero as a domain error',()=>{
  const s=parseStatement('f(x)=1/x');if(s.kind!=='function2d')throw new Error('wrong type');
  expect(()=>evaluate(s.expr,{x:0})).toThrow(ExpressionError);
 });
 it('breaks discontinuous function plots into segments',()=>{
  const s=parseStatement('f(x)=1/x');if(s.kind!=='function2d')throw new Error('wrong type');
  expect(sampleFunction(s.expr,-2,2,200).length).toBeGreaterThan(1);
 });
});
