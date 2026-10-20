import {describe,it,expect} from 'vitest';
import {convertLatexToAsciiMath} from 'mathlive';
import {evaluate} from '../src/math/expression';
import {statementToLatex,visualAsciiToStatement} from '../src/math/format';

describe('adaptador real de MathLive',()=>{
 it('convierte una función LaTeX a una función calculable',()=>{const s=visualAsciiToStatement(convertLatexToAsciiMath('f(x)=x^{2}+3x-4'));if(s.kind!=='function2d')throw Error();expect(evaluate(s.expr,{x:2})).toBe(6);});
 it('conserva pi, multiplicación y parámetros de una fórmula',()=>{const s=visualAsciiToStatement(convertLatexToAsciiMath('V=\\pi r^2 h'));if(s.kind!=='scalar')throw Error();expect(evaluate(s.expr,{r:2,h:3})).toBeCloseTo(12*Math.PI);});
 it('convierte fracciones sin evaluar LaTeX como código',()=>{const s=visualAsciiToStatement(convertLatexToAsciiMath('y=\\frac{1}{x}'));if(s.kind!=='function2d')throw Error();expect(evaluate(s.expr,{x:4})).toBe(.25);});
 it('conserva signos y exponentes al volver a representar',()=>{const s=visualAsciiToStatement(convertLatexToAsciiMath('y=-x^2'));if(s.kind!=='function2d')throw Error();expect(evaluate(s.expr,{x:3})).toBe(-9);const again=visualAsciiToStatement(convertLatexToAsciiMath(statementToLatex(s)));if(again.kind!=='function2d')throw Error();expect(evaluate(again.expr,{x:3})).toBe(-9);});
 it('convierte superficies y puntos espaciales',()=>{expect(visualAsciiToStatement(convertLatexToAsciiMath('z=\\sin(x)\\cos(y)')).kind).toBe('surface3d');expect(visualAsciiToStatement(convertLatexToAsciiMath('A=(2,3,4)')).kind).toBe('point3d');});
});
