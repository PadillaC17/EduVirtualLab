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
 |{kind:'point3d';source:string;label:string;x:ExprNode;y:ExprNode;z:ExprNode}
 |{kind:'scalar';source:string;label:string|null;expr:ExprNode};

export class ExpressionError extends Error{
 constructor(public code:'syntax'|'symbol'|'domain'|'limit'|'unsupported',message:string){super(message);}
}

const FUNCTIONS=new Set(['sin','cos','tan','sqrt','abs','exp','ln','log']);
const CONSTANTS=new Set(['pi','e']);
const MAX_LENGTH=512,MAX_NODES=128,MAX_DEPTH=32;

export function normalizeMath(input:string){
 return input.trim().replace(/−/g,'-').replace(/×|·/g,'*').replace(/÷/g,'/').replace(/π/g,'(pi)').replace(/²/g,'^2').replace(/³/g,'^3').replace(/\s+/g,' ');
}

type Token={type:'number'|'id'|'op'|'lparen'|'rparen'|'comma'|'eof';value:string};
function tokenize(source:string):Token[]{
 const s=normalizeMath(source);
 if(s.length>MAX_LENGTH)throw new ExpressionError('limit','La expresión supera 512 caracteres.');
 const raw:Token[]=[];let i=0;
 while(i<s.length){
  const ch=s[i];if(/\s/.test(ch)){i++;continue;}
  if(/[0-9.]/.test(ch)){
   const match=s.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
   if(!match||!Number.isFinite(Number(match[0])))throw new ExpressionError('domain','Número no finito o inválido.');
   raw.push({type:'number',value:match[0]});i+=match[0].length;continue;
  }
  if(/[A-Za-z_]/.test(ch)){
   const match=s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)!;const value=match[0];
   if(/^[xyzrh]{2,}$/i.test(value))for(const name of value)raw.push({type:'id',value:name});
   else raw.push({type:'id',value});
   i+=value.length;continue;
  }
  if('+-*/^='.includes(ch))raw.push({type:'op',value:ch});
  else if(ch==='(')raw.push({type:'lparen',value:ch});
  else if(ch===')')raw.push({type:'rparen',value:ch});
  else if(ch===',')raw.push({type:'comma',value:ch});
  else throw new ExpressionError('syntax',`Símbolo no admitido: ${ch}`);
  i++;
 }
 const out:Token[]=[];
 for(let k=0;k<raw.length;k++){
  const current=raw[k],next=raw[k+1];out.push(current);if(!next)continue;
  const end=['number','id','rparen'].includes(current.type),start=['number','id','lparen'].includes(next.type);
  const call=current.type==='id'&&next.type==='lparen'&&(FUNCTIONS.has(current.value.toLowerCase())||current.value.length>1);
  if(end&&start&&!call)out.push({type:'op',value:'*'});
 }
 out.push({type:'eof',value:''});return out;
}

class Parser{
 private i=0;private nodes=0;
 constructor(private tokens:Token[]){}
 private peek():Token{return this.tokens[this.i]??{type:'eof',value:''}}
 private take(){const token=this.peek();this.i++;return token;}
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
  if(depth>MAX_DEPTH)throw new ExpressionError('limit','La expresión es demasiado profunda.');
  const t=this.take();
  if(t.type==='number')return this.add({kind:'number',value:Number(t.value)},depth);
  if(t.type==='op'&&(t.value==='+'||t.value==='-'))return this.add({kind:'unary',op:t.value,arg:this.expression(3,depth+1)},depth);
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
export function parseExpression(source:string){
 if(source.length>MAX_LENGTH)throw new ExpressionError('limit','La expresión supera 512 caracteres.');
 const node=new Parser(tokenize(source)).parse();
 const check=(n:ExprNode,d:number):void=>{if(d>MAX_DEPTH)throw new ExpressionError('limit','La expresión es demasiado profunda.');if(n.kind==='unary')check(n.arg,d+1);if(n.kind==='binary'){check(n.left,d+1);check(n.right,d+1);}if(n.kind==='call')n.args.forEach(a=>check(a,d+1));};
 check(node,1);return node;
}

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
   const v=Object.hasOwn(scope,n.name)?scope[n.name]:undefined;if(v===undefined)throw new ExpressionError('symbol',`Falta un valor para ${n.name}.`);if(!Number.isFinite(v))throw new ExpressionError('domain',`El valor de ${n.name} no es finito.`);return v;
  }
  if(n.kind==='unary'){const v=go(n.arg);return n.op==='-'?-v:v;}
  if(n.kind==='binary'){const a=go(n.left),b=go(n.right);let v:number;if(n.op==='+')v=a+b;else if(n.op==='-')v=a-b;else if(n.op==='*')v=a*b;else if(n.op==='/'){if(b===0)throw new ExpressionError('domain','División entre cero.');v=a/b;}else v=Math.pow(a,b);if(!Number.isFinite(v))throw new ExpressionError('domain','El cálculo salió del dominio real.');return v;}
  const a=go(n.args[0]);let v:number;if(n.name==='sin')v=Math.sin(a);else if(n.name==='cos')v=Math.cos(a);else if(n.name==='tan'){if(Math.abs(Math.cos(a))<1e-14)throw new ExpressionError('domain','Tangente no definida en este punto.');v=Math.tan(a);}else if(n.name==='sqrt'){if(a<0)throw new ExpressionError('domain','Raíz cuadrada de un número negativo.');v=Math.sqrt(a);}else if(n.name==='abs')v=Math.abs(a);else if(n.name==='exp')v=Math.exp(a);else if(n.name==='ln'){if(a<=0)throw new ExpressionError('domain','ln requiere un valor positivo.');v=Math.log(a);}else {if(a<=0)throw new ExpressionError('domain','log requiere un valor positivo.');v=Math.log10(a);}if(!Number.isFinite(v))throw new ExpressionError('domain','El cálculo salió del dominio real.');return v;
 };const value=go(node);if(!Number.isFinite(value))throw new ExpressionError('domain','El resultado no es un número real finito.');return value;
}

function topLevelEqual(source:string){let depth=0;for(let i=0;i<source.length;i++){const c=source[i];if(c==='(')depth++;else if(c===')')depth--;else if(c==='='&&depth===0)return i;}return -1;}
function only(set:Set<string>,allowed:string[]){for(const x of set)if(!allowed.includes(x))return false;return true;}

function parseStatementInner(raw:string):ParsedStatement{
 if(raw.length>MAX_LENGTH)throw new ExpressionError('limit','La expresión supera 512 caracteres.');
 const source=normalizeMath(raw);if(!source)throw new ExpressionError('syntax','Escribe una expresión.');
 const point=source.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=\s*\((.+)\)$/);
 if(point){let depth=0;const parts:string[]=[];let start=0;for(let i=0;i<point[2].length;i++){const c=point[2][i];if(c==='(')depth++;if(c===')')depth--;if(c===','&&depth===0){parts.push(point[2].slice(start,i));start=i+1;}}parts.push(point[2].slice(start));
  if(parts.length===2)return{kind:'point2d',source,label:point[1],x:parseExpression(parts[0]),y:parseExpression(parts[1])};
  if(parts.length===3)return{kind:'point3d',source,label:point[1],x:parseExpression(parts[0]),y:parseExpression(parts[1]),z:parseExpression(parts[2])};
 }
 const eq=topLevelEqual(source);
 if(eq<0){const expr=parseExpression(source);return{kind:'scalar',source,label:null,expr};}
 const leftText=source.slice(0,eq).trim(),rightText=source.slice(eq+1).trim();if(!leftText||!rightText)throw new ExpressionError('syntax','La ecuación necesita contenido a ambos lados del signo igual.');
 if(/^f\s*\(\s*x\s*\)$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(syms.has('y')||syms.has('z'))throw new ExpressionError('symbol','f(x) no puede depender de y o z.');return{kind:'function2d',source,label:'f',expr};}
 if(/^y$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(!syms.has('y')&&!syms.has('z'))return{kind:'function2d',source,label:'y',expr};}
 if(/^z$/i.test(leftText)){const expr=parseExpression(rightText);const syms=collectSymbols(expr);if(!syms.has('z'))return{kind:'surface3d',source,expr};}
 if(/^[A-Za-z][A-Za-z0-9_]*$/.test(leftText)&&!['x','y','z'].includes(leftText.toLowerCase())){const expr=parseExpression(rightText);return{kind:'scalar',source,label:leftText,expr};}
 const left=parseExpression(leftText),right=parseExpression(rightText);const syms=new Set([...collectSymbols(left),...collectSymbols(right)]);
 if(!syms.has('z'))return{kind:'implicit2d',source,left,right};
 throw new ExpressionError('unsupported','Esta ecuación todavía no pertenece a una familia compatible con la Fase 3.');
}

export function nodeToText(n:ExprNode):string{
 if(n.kind==='number')return String(n.value);if(n.kind==='symbol')return n.name==='pi'?'π':n.name;if(n.kind==='unary')return n.op+nodeToText(n.arg);if(n.kind==='call')return `${n.name}(${nodeToText(n.args[0])})`;
 const op=n.op==='*'?'·':n.op==='^'?'^':n.op;return `(${nodeToText(n.left)} ${op} ${nodeToText(n.right)})`;
}

export function classificationName(s:ParsedStatement){
 return s.kind==='function2d'?'Función 2D':s.kind==='implicit2d'?'Ecuación implícita 2D':s.kind==='surface3d'?'Superficie explícita 3D':s.kind==='point2d'?'Punto 2D':s.kind==='point3d'?'Punto 3D':'Fórmula escalar';
}

export function statementSymbols(s:ParsedStatement):string[]{
 const nodes=s.kind==='implicit2d'?[s.left,s.right]:s.kind==='point2d'?[s.x,s.y]:s.kind==='point3d'?[s.x,s.y,s.z]:[s.expr];
 const independent=s.kind==='function2d'?['x']:s.kind==='surface3d'||s.kind==='implicit2d'?['x','y']:[];
 return [...new Set(nodes.flatMap(n=>[...collectSymbols(n)]))].filter(name=>!independent.includes(name));
}

export function sampleFunction(expr:ExprNode,xmin=-10,xmax=10,steps=420,scope:Record<string,number>={}){
 const segments:{x:number;y:number}[][]=[];let current:{x:number;y:number}[]=[];
 for(let i=0;i<=steps;i++){
  const x=xmin+(xmax-xmin)*i/steps;
  try{
   const y=evaluate(expr,{...scope,x});if(Math.abs(y)>1e4)throw new Error();
   const prev=current.at(-1);
   if(prev&&Math.abs(y-prev.y)>8){
    const middle=evaluate(expr,{...scope,x:(x+prev.x)/2});
    if(Math.abs(middle-(y+prev.y)/2)>Math.max(8,Math.abs(y-prev.y)*.5)){if(current.length>1)segments.push(current);current=[];}
   }
   current.push({x,y});
  }catch{if(current.length>1)segments.push(current);current=[];}
 }
 if(current.length>1)segments.push(current);return segments;
}

export function sampleImplicit(left:ExprNode,right:ExprNode,xmin=-10,xmax=10,ymin=-7,ymax=7,cols=90,rows=64,scope:Record<string,number>={}){
 const lines:{x:number;y:number}[][]=[];const f=(x:number,y:number)=>{try{return evaluate(left,{...scope,x,y})-evaluate(right,{...scope,x,y});}catch{return NaN;}};
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const x0=xmin+(xmax-xmin)*i/cols,x1=xmin+(xmax-xmin)*(i+1)/cols,y0=ymin+(ymax-ymin)*j/rows,y1=ymin+(ymax-ymin)*(j+1)/rows;
  const p=[{x:x0,y:y0,v:f(x0,y0)},{x:x1,y:y0,v:f(x1,y0)},{x:x1,y:y1,v:f(x1,y1)},{x:x0,y:y1,v:f(x0,y1)}];
  if(p.some(v=>!Number.isFinite(v.v)))continue;
  const hits:{x:number;y:number}[]=[];
  for(const [a,b] of [[p[0],p[1]],[p[1],p[2]],[p[2],p[3]],[p[3],p[0]]] as const){
   let hit:{x:number;y:number}|null=null;
   if(a.v===0)hit={x:a.x,y:a.y};
   else if(a.v*b.v<0){
    let lo={...a},hi={...b};
    for(let n=0;n<24;n++){const mid={x:(lo.x+hi.x)/2,y:(lo.y+hi.y)/2,v:0};mid.v=f(mid.x,mid.y);if(!Number.isFinite(mid.v))break;if(lo.v*mid.v<=0)hi=mid;else lo=mid;}
    const x=(lo.x+hi.x)/2,y=(lo.y+hi.y)/2;
    if(Math.abs(f(x,y))<1e-5*Math.max(1,Math.abs(a.v),Math.abs(b.v)))hit={x,y};
   }
   if(hit&&!hits.some(h=>Math.hypot(h.x-hit!.x,h.y-hit!.y)<1e-9))hits.push(hit);
  }
  if(hits.length===2)lines.push([hits[0],hits[1]]);
  else if(hits.length===4){const center=f((x0+x1)/2,(y0+y1)/2);const same=center*p[0].v>0;lines.push(same?[hits[0],hits[1]]:[hits[0],hits[3]],same?[hits[2],hits[3]]:[hits[1],hits[2]]);}
 }
 return lines;
}

export function parseStatement(raw:string):ParsedStatement{
 const s=parseStatementInner(raw);let count=0;
 const visit=(node:ExprNode):void=>{count++;if(count>128)throw new ExpressionError('limit','La expresión tiene demasiados elementos.');if(node.kind==='unary')visit(node.arg);else if(node.kind==='binary'){visit(node.left);visit(node.right);}else if(node.kind==='call')node.args.forEach(visit);};
 if(s.kind==='implicit2d'){visit(s.left);visit(s.right);}else if(s.kind==='point2d'||s.kind==='point3d'){visit(s.x);visit(s.y);if(s.kind==='point3d')visit(s.z);}else visit(s.expr);
 return s;
}
