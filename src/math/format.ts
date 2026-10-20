import {parseStatement,type ExprNode,type ParsedStatement} from './expression';
const name=(value:string)=>value==='pi'?'\\pi':value.length===1?value:`\\mathrm{${value.replace(/_/g,'\\_')}}`;
export function nodeToLatex(n:ExprNode):string{
 if(n.kind==='number')return String(n.value);
 if(n.kind==='symbol')return name(n.name);
 if(n.kind==='unary')return `${n.op}\\left(${nodeToLatex(n.arg)}\\right)`;
 if(n.kind==='call')return n.name==='sqrt'?`\\sqrt{${nodeToLatex(n.args[0])}}`:`\\operatorname{${n.name}}\\left(${nodeToLatex(n.args[0])}\\right)`;
 const a=nodeToLatex(n.left),b=nodeToLatex(n.right);
 if(n.op==='/')return `\\frac{${a}}{${b}}`;
 if(n.op==='^')return `{\\left(${a}\\right)}^{${b}}`;
 return `\\left(${a}${n.op==='*'?'\\cdot ':n.op}${b}\\right)`;
}
export function statementToLatex(s:ParsedStatement):string{
 if(s.kind==='implicit2d')return `${nodeToLatex(s.left)}=${nodeToLatex(s.right)}`;
 if(s.kind==='point2d'||s.kind==='point3d')return `${name(s.label)}=\\left(${[s.x,s.y,...(s.kind==='point3d'?[s.z]:[])].map(nodeToLatex).join(',')}\\right)`;
 const prefix=s.kind==='surface3d'?'z=':s.kind==='function2d'?`${s.label==='f'?'f(x)':'y'}=`:s.label?`${name(s.label)}=`:'';
 return prefix+nodeToLatex(s.expr);
}
export function visualAsciiToStatement(ascii:string):ParsedStatement{
 return parseStatement(ascii.replace(/\bxx\b/g,'*').replace(/\bdiv\b/g,'/'));
}
