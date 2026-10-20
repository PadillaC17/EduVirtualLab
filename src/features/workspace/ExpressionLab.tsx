import {useMemo,useState} from 'react';
import Formula from '../../components/Formula';
import MathEditor from '../../components/MathEditor';
import {classificationName,evaluate,parseStatement,sampleFunction,sampleImplicit,statementSymbols,type ParsedStatement} from '../../math/expression';
import {statementToLatex} from '../../math/format';

const W=900,H=540,XMIN=-10,XMAX=10,YMIN=-7,YMAX=7;
const sx=(x:number)=>(x-XMIN)/(XMAX-XMIN)*W,sy=(y:number)=>(YMAX-y)/(YMAX-YMIN)*H;
const fmt=(n:number)=>Number.isFinite(n)?Number(n.toPrecision(8)).toString():'—';
const examples=[['Función','f(x)=x²+3x-4'],['Seno','y=sin(x)'],['Implícita','x²+y²=25'],['Superficie 3D','z=x²+y²'],['Punto','A=(2,3)'],['Fórmula','V=πr²h']];
function Graph({statement,scope}:{statement:ParsedStatement;scope:Record<string,number>}){
 const content=useMemo(()=>{
  if(statement.kind==='function2d')return{kind:'lines' as const,data:sampleFunction(statement.expr,XMIN,XMAX,420,scope)};
  if(statement.kind==='implicit2d')return{kind:'lines' as const,data:sampleImplicit(statement.left,statement.right,XMIN,XMAX,YMIN,YMAX,90,64,scope)};
  if(statement.kind==='point2d'){try{return{kind:'point' as const,data:{x:evaluate(statement.x,scope),y:evaluate(statement.y,scope)}};}catch{return{kind:'none' as const};}}
  return{kind:'none' as const};
 },[statement,scope]);
 const grid=[];for(let x=-10;x<=10;x++)grid.push(<line key={'x'+x} className={x===0?'expr-axis':'expr-grid'} x1={sx(x)} x2={sx(x)} y1={0} y2={H}/>);for(let y=-7;y<=7;y++)grid.push(<line key={'y'+y} className={y===0?'expr-axis':'expr-grid'} x1={0} x2={W} y1={sy(y)} y2={sy(y)}/>);
 return <svg className="expr-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfica matemática aproximada">{grid}{content.kind==='lines'&&content.data.map((line,i)=><polyline key={i} className="expr-curve" points={line.map(p=>`${sx(p.x)},${sy(p.y)}`).join(' ')}/>)}{content.kind==='point'&&<g><circle className="expr-point-halo" cx={sx(content.data.x)} cy={sy(content.data.y)} r="14"/><circle className="expr-point" cx={sx(content.data.x)} cy={sy(content.data.y)} r="6"/></g>}</svg>;
}
export default function ExpressionLab({onOpen3D}:{onOpen3D:(source:string,scope?:Record<string,number>)=>void}){
 const [input,setInput]=useState('f(x)=x²+3x-4');const [submitted,setSubmitted]=useState(input);const [mode,setMode]=useState<'text'|'visual'>('text');const [revision,setRevision]=useState(0);
 const [xValue,setXValue]=useState('2');const [params,setParams]=useState<Record<string,string>>({r:'3',h:'5'});
 const result=useMemo(()=>{try{return{statement:parseStatement(submitted),error:''};}catch(e){return{statement:null,error:e instanceof Error?e.message:'No se pudo interpretar la expresión.'};}},[submitted]);
 const statement=result.statement;
 const symbols=useMemo(()=>statement?statementSymbols(statement):[],[statement]);
 const scope=useMemo(()=>Object.fromEntries(symbols.map(s=>[s,params[s]===undefined?1:params[s].trim()?Number(params[s]):NaN])),[symbols,params]);
 const evaluation=useMemo(()=>{
  if(!statement)return{value:'',error:''};
  try{
   if(Object.values(scope).some(v=>!Number.isFinite(v)))throw new Error('Completa los parámetros con números finitos.');
   if(statement.kind==='function2d'){if(!xValue.trim())throw new Error('Introduce un valor de x.');return{value:fmt(evaluate(statement.expr,{...scope,x:Number(xValue)})),error:''};}
   if(statement.kind==='scalar')return{value:fmt(evaluate(statement.expr,scope)),error:''};
   if(statement.kind==='point2d'||statement.kind==='point3d')return{value:`(${[statement.x,statement.y,...(statement.kind==='point3d'?[statement.z]:[])].map(n=>fmt(evaluate(n,scope))).join(', ')})`,error:''};
   return{value:'',error:''};
  }catch(e){return{value:'',error:e instanceof Error?e.message:'No se pudo evaluar.'};}
 },[statement,scope,xValue]);
 return <div className="expression-lab"><aside className="expr-editor"><div className="expr-title"><span className="eyebrow">EDITOR MATEMÁTICO</span><h2>Escribe. Interpreta. Contrasta.</h2><p>Texto y escritura visual comparten el mismo analizador validado.</p></div><div className="workspace-mode-toggle"><button className={mode==='text'?'active':''} onClick={()=>setMode('text')}>Teclado</button><button className={mode==='visual'?'active':''} onClick={()=>setMode('visual')}>Visual · MathLive</button></div><form onSubmit={e=>{e.preventDefault();setSubmitted(input);}}>{mode==='text'?<label className="expr-input-label">Expresión o ecuación<textarea value={input} onChange={e=>setInput(e.target.value)} maxLength={512} spellCheck={false}/></label>:<MathEditor key={revision} initialValue={input} onChange={setInput}/>}<button className="primary expr-submit" type="submit">Analizar y representar</button></form><div className="expr-examples"><span className="eyebrow">PRUEBA UN EJEMPLO</span>{examples.map(([label,value])=><button key={value} onClick={()=>{setInput(value);setSubmitted(value);setRevision(v=>v+1);}}><span>{label}</span><code>{value}</code></button>)}</div></aside>
 <section className="expr-stage"><div className="expr-stage-head"><strong>{statement?classificationName(statement):'Entrada no válida'}</strong><span className="conic-engine-badge">AST seguro · sin eval()</span></div>{result.error?<div className="expr-error-state" role="alert"><h2>Revisa la expresión</h2><p>{result.error}</p></div>:statement&&<><Formula latex={statementToLatex(statement)}/>{statement.kind==='surface3d'||statement.kind==='point3d'?<div className="expr-3d-preview"><h2>{classificationName(statement)} reconocida</h2><p>Ábrela en el laboratorio espacial para rotar, ampliar y explorar su geometría.</p><button className="primary" onClick={()=>onOpen3D(submitted,scope)}>Abrir en Geometría 3D</button></div>:statement.kind==='scalar'?<div className="expr-formula-preview"><h2>Resultado numérico</h2><p>{evaluation.error||evaluation.value}</p></div>:<div className="expr-graph-wrap"><Graph statement={statement} scope={scope}/><div className="expr-graph-badge">x: −10…10 · y: −7…7 · aproximación numérica</div></div>}<div className="expr-stage-footer"><code>{statement.source}</code></div></>}</section>
 <aside className="expr-analysis"><span className="eyebrow">ANÁLISIS MATEMÁTICO</span>{statement&&<><h2>{classificationName(statement)}</h2>{statement.kind==='function2d'&&<label className="spatial-field">Evaluar en x<input type="number" value={xValue} step="any" onChange={e=>setXValue(e.target.value)}/></label>}{symbols.length>0&&<div className="expr-params"><p className="small">Parámetros explícitos (valor inicial 1)</p>{symbols.map(s=><label key={s}>{s}<input type="number" step="any" value={params[s]??'1'} onChange={e=>setParams(p=>({...p,[s]:e.target.value}))}/></label>)}</div>}{evaluation.value&&<div className="expr-result"><span>Evaluación</span><strong>{evaluation.value}</strong></div>}{evaluation.error&&<p className="math-error" role="alert">{evaluation.error}</p>}<div className="expr-note"><p>Trigonometría en radianes. Se admiten sin, cos, tan, sqrt, abs, exp, ln y log (base 10).</p><p>Las gráficas son aproximaciones numéricas. Los errores de dominio producen cortes, no resultados inventados.</p></div><div className="expr-security"><p>✓ 512 caracteres · 128 nodos · profundidad 32</p><p>✓ LaTeX separado de la representación interna</p></div></>}</aside></div>;
}
