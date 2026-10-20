export type ExprNode=
 |{kind:'number';value:number}
 |{kind:'symbol';name:string}
 |{kind:'unary';op:'+'|'-';arg:ExprNode}
 |{kind:'binary';op:'+'|'-'|'*'|'/'|'^';left:ExprNode;right:ExprNode}
 |{kind:'call';name:string;args:ExprNode[]};

export type ParsedStatement=
 |{kind:'function2d';source:string;label:string;expr:ExprNode}
 |{kind:'implicit2d';source:string;left:ExprNode;right:ExprNode}
 |{kind:'surface3d';source:string;expr:ExprNode}
 |{kind:'point2d';source:string;label:string;x:ExprNode;y:ExprNode}
 |{kind:'scalar';source:string;label:string|null;expr:ExprNode};

export class ExpressionError extends Error{
 constructor(public code:'syntax'|'symbol'|'domain'|'limit'|'unsupported',message:string){super(message);}
}

const FUNCTIONS=new Set(['sin','cos','tan','sqrt','abs','exp','ln','log']);
const CONSTANTS=new Set(['pi','e']);
const MAX_LENGTH=512,MAX_NODES=128,MAX_DEPTH=32;

export function normalizeMath(input:string){
 return input.trim().replace(/−/g,'-').replace(/×|·/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/²/g,'^2').replace(/³/g,'^3').replace(/\s+/g,' ');
}

type Token={type:'number'|'id'|'op'|'lparen'|'rparen'|'comma'|'eof';value:string};
function tokenize(source:string):Token[]{
 const s=normalizeMath(source);if(s.length>MAX_LENGTH)throw new ExpressionError('limit','La expresión supera 512 caracteres.');
 const out:Token[]=[];let i=0;
 while(i<s.length){
  const ch=s[i];if(/\s/.test(ch)){i++;continue;}
  if(/[0-9.]/.test(ch)){let j=i+1;while(j<s.length&&/[0-9.eE+-]/.test(s[j])){if((s[j]=='+'||s[j]=='-')&&!/[eE]/.test(s[j-1]))break;j++;}const raw=s.slice(i,j);if(!/^((\d+\.?\d*)|(\.\d+))([eE][+-]?\d+)?$/.test(raw))throw new ExpressionError('syntax',`Número inválido: ${raw}`);out.push({type:'number',value:raw});i=j;continue;}
  if(/[A-Za-z_]/.test(ch)){let j=i+1;while(j<s.length&&/[A-Za-z0-9_]/.test(s[j]))j++;out.push({type:'id',value:s.slice(i,j)});i=j;continue;}
  if('+-*/^='.includes(ch)){out.push({type:'op',value:ch});i++;continue;}
  if(ch==='('){out.push({type:'lparen',value:ch});i++;continue;}if(ch===')'){out.push({type:'rparen',value:ch});i++;continue;}if(ch===','){out.push({type:'comma',value:ch});i++;continue;}
  throw new ExpressionError('syntax',`Símbolo no admitido: ${ch}`);
 }
 out.push({type:'eof',value:''});return out;
}

class Parser{
 private i=0;private nodes=0;
 constructor(private tokens:Token[]){}
 private peek(){return this.tokens[this.i]}
 private take(){return this.tokens[this.i++]}
 private add<T extends ExprNode>(node:T,depth:number){this.nodes++;if(this.nodes>MAX_NODES)throw new ExpressionError('limit','La expresión tiene demasiados elementos.');if(depth>MAX_DEPTH)throw new ExpressionError('limit','La expresión es demasiado profunda.');return node;}
 parse(){const n=this.expression(0);if(this.peek().type!=='eof')throw new ExpressionError('syntax','Hay contenido adicional que no se pudo interpretar.');return n;}
 private expression(min:number,depth=1):ExprNode{
  let left=this.prefix(depth+1);
  const prec:Record<string,number>={'+':1,'-':1,'*':2,'/':2,'^':3};
  while(this.peek().type==='op'&&this.peek().value!=='='){
   const op=this.peek().value as '+'|'-'|'*'|'/'|'^';const p=prec[op]??-1;if(p<min)break;this.take();const right=this.expression(op==='^'?p:p+1,depth+1);left=this.add({kind:'binary',op,left,right},depth);
  }
  return left;
 }
 private prefix(depth:number):ExprNode{
  const t=this.take();
  if(t.type==='number')return this.add({kind:'number',value:Number(t.value)},depth);
  if(t.type==='op'&&(t.value==='+'||t.value==='-'))return this.add({kind:'unary',op:t.value,arg:this.prefix(depth+1)},depth);
  if(t.type==='id'){
   const name=t.value.toLowerCase();
   if(this.peek().type==='lparen'){
    if(!FUNCTIONS.has(name))throw new ExpressionError('unsupported',`La función ${t.value} no está permitida.`);
    this.take();const args:ExprNode[]=[];if(this.peek().type!=='rparen'){args.push(this.expression(0,depth+1));while(this.peek().type==='comma'){this.take();args.push(this.expression(0,depth+1));}}
    if(this.take().type!=='rparen')throw new ExpressionError('syntax','Falta cerrar un paréntesis.');if(args.length!==1)throw new ExpressionError('unsupported','Solo se admiten funciones de un argumento.');
    return this.add({kind:'call',name,args},depth);
   }
   return this.add({kind:'symbol',name},depth);
  }
  if(t.type==='lparen'){const n=this.expression(0,depth+1);if(this.take().type!=='rparen')throw new ExpressionError('syntax','Falta cerrar un paréntesis.');return n;}
  throw new ExpressionError('syntax','Se esperaba un número, variable o paréntesis.');
 }
}
export function parseExpression(source:string){return new Parser(tokenize(source)).parse();}

export function collectSymbols(node:ExprNode,out=new Set<string>()){
 if(node.kind==='symbol'&&!CONSTANTS.has(node.name))out.add(node.name);
 else if(node.kind==='unary')collectSymbols(node.arg,out);
 else if(node.kind==='binary'){collectSymbols(node.left,out);collectSymbols(node.right,out);}
 else if(node.kind==='call')node.args.forEach(a=>collectSymbols(a,out));
 return out;
}

export function evaluate(node:ExprNode,scope:Record<string,number>={}):number{
 const go=(n:ExprNode):number=>{
  if(n.kind==='number')return n.value;
  if(n.kind==='symbol'){
   if(n.name==='pi')return Math.PI;if(n.name==='e')return Math.E;
   const v=scope[n.name];if(v===undefined)throw new ExpressionError('symbol',`Falta un valor para ${n.name}.`);if(!Number.isFinite(v))throw new ExpressionError('domain',`El valor de ${n.name} no es finito.`);return v;
  }
  if(n.kind==='unary'){const v=go(n.arg);return n.op==='-'?-v:v;}
  if(n.kind==='binary'){const a=go(n.left),b=go(n.right);let v:number;if(n.op==='+')v=a+b;else if(n.op==='-')v=a-b;else if(n.op==='*')v=a*b;else if(n.op==='/'){if(Math.abs(b)<1e-15)throw new ExpressionError('domain','División entre cero.');v=a/b;}else v=Math.pow(a,b);if(!Number.isFinite(v))throw new ExpressionError('domain','El cálculo salió del dominio real.');return v;}
  const a=go(n.args[0]);let v:number;if(n.name==='sin')v=Math.sin(a);else if(n.name==='cos')v=Math.cos(a);else if(n.name==='tan')v=Math.tan(a);else if(n.name==='sqrt'){if(a<0)throw new ExpressionError('domain','Raíz cuadrada de un número negativo.');v=Math.sqrt(a);}else if(n.name==='abs')v=Math.abs(a);else if(n.name==='exp')v=Math.exp(a);else if(n.name==='ln'){if(a<=0)throw new ExpressionError('domain','ln requiere un valor positivo.');v=Math.log(a);}else {if(a<=0)throw new ExpressionError('domain','log requiere un valor positivo.');v=Math.log10(a);}if(!Number.isFinite(v))throw new ExpressionError('domain','El cálculo salió del dominio real.');return v;
 };return go(node);
}

function topLevelEqual(source:string){let depth=0;for(let i=0;i<source.length;i++){const c=source[i];if(c==='(')depth++;else if(c===')')depth--;else if(c==='='&&depth===0)return i;}return -1;}
function only(set:Set<string>,allowed:string[]){for(const x of set)if(!allowed.includes(x))return false;return true;}

export function parseStatement(raw:string):ParsedStatement{
 const source=normalizeMath(raw);if(!source)throw new ExpressionError('syntax','Escribe una expresión.');
 const point=source.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=\s*\((.+),(.+)\)$/);
 if(point){return{kind:'point2d',source,label:point[1],x:parseExpression(point[2]),y:parseExpression(point[3])};}
 const eq=topLevelEqual(source);
 if(eq<0){const expr=parseExpression(source);return{kind:'scalar',source,label:null,expr};}
 const leftText=source.slice(0,eq).trim(),rightText=source.slice(eq+1).trim();if(!leftText||!rightText)throw new ExpressionError('syntax','La ecuación necesita contenido a ambos lados del signo igual.');
 if(/^f\s*\(\s*x\s*\)$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(!only(syms,['x']))throw new ExpressionError('symbol','f(x) solo puede usar x y constantes.');return{kind:'function2d',source,label:'f',expr};}
 if(/^y$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(only(syms,['x']))return{kind:'function2d',source,label:'y',expr};}
 if(/^z$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(only(syms,['x','y']))return{kind:'surface3d',source,expr};}
 if(/^[A-Za-z][A-Za-z0-9_]*$/.test(leftText)&&!['x','y','z'].includes(leftText.toLowerCase())){const expr=parseExpression(rightText);return{kind:'scalar',source,label:leftText,expr};}
 const left=parseExpression(leftText),right=parseExpression(rightText);const syms=new Set([...collectSymbols(left),...collectSymbols(right)]);
 if(only(syms,['x','y']))return{kind:'implicit2d',source,left,right};
 throw new ExpressionError('unsupported','Esta ecuación todavía no pertenece a una familia compatible con la Fase 3.');
}

export function nodeToText(n:ExprNode):string{
 if(n.kind==='number')return String(n.value);if(n.kind==='symbol')return n.name==='pi'?'π':n.name;if(n.kind==='unary')return n.op+nodeToText(n.arg);if(n.kind==='call')return `${n.name}(${nodeToText(n.args[0])})`;
 const op=n.op==='*'?'·':n.op==='^'?'^':n.op;return `(${nodeToText(n.left)} ${op} ${nodeToText(n.right)})`;
}

export function classificationName(s:ParsedStatement){
 return s.kind==='function2d'?'Función 2D':s.kind==='implicit2d'?'Ecuación implícita 2D':s.kind==='surface3d'?'Superficie explícita 3D':s.kind==='point2d'?'Punto 2D':'Fórmula escalar';
}

export function sampleFunction(expr:ExprNode,xmin=-10,xmax=10,steps=420){
 const segments:{x:number;y:number}[][]=[];let current:{x:number;y:number}[]=[];
 for(let i=0;i<=steps;i++){const x=xmin+(xmax-xmin)*i/steps;try{const y=evaluate(expr,{x});if(Math.abs(y)>1e4)throw new Error();if(current.length){const prev=current[current.length-1];if(Math.abs(y-prev.y)>8){if(current.length>1)segments.push(current);current=[];}}current.push({x,y});}catch{if(current.length>1)segments.push(current);current=[];}}
 if(current.length>1)segments.push(current);return segments;
}

export function sampleImplicit(left:ExprNode,right:ExprNode,xmin=-10,xmax=10,ymin=-7,ymax=7,cols=90,rows=64){
 const lines:{x:number;y:number}[][]=[];const f=(x:number,y:number)=>{try{return evaluate(left,{x,y})-evaluate(right,{x,y});}catch{return NaN;}};
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const x0=xmin+(xmax-xmin)*i/cols,x1=xmin+(xmax-xmin)*(i+1)/cols,y0=ymin+(ymax-ymin)*j/rows,y1=ymin+(ymax-ymin)*(j+1)/rows;
  const p=[{x:x0,y:y0,v:f(x0,y0)},{x:x1,y:y0,v:f(x1,y0)},{x:x1,y:y1,v:f(x1,y1)},{x:x0,y:y1,v:f(x0,y1)}];const hits:{x:number;y:number}[]=[];
  for(const [a,b] of [[p[0],p[1]],[p[1],p[2]],[p[2],p[3]],[p[3],p[0]]] as const){if(!Number.isFinite(a.v)||!Number.isFinite(b.v))continue;if(a.v===0)hits.push({x:a.x,y:a.y});else if(a.v*b.v<0){const t=Math.abs(a.v)/(Math.abs(a.v)+Math.abs(b.v));hits.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}
  if(hits.length>=2)lines.push([hits[0],hits[1]]);
 }
 return lines;
}
