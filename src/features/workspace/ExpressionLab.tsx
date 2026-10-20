import {useMemo,useState} from 'react';
import Icon from '../../components/Icon';
import {ExpressionError,classificationName,collectSymbols,evaluate,nodeToText,parseStatement,sampleFunction,sampleImplicit,type ParsedStatement} from '../../math/expression';

const W=900,H=540,XMIN=-10,XMAX=10,YMIN=-7,YMAX=7;
const sx=(x:number)=>(x-XMIN)/(XMAX-XMIN)*W;
const sy=(y:number)=>(YMAX-y)/(YMAX-YMIN)*H;
const fmt=(n:number)=>Number.isFinite(n)?(Math.abs(n)<1e-10?'0':Number(n.toFixed(6)).toString()):'—';

const examples=[
 {label:'Función',value:'f(x)=x^2+3*x-4'},
 {label:'Seno',value:'y=sin(x)'},
 {label:'Implícita',value:'x^2+y^2=25'},
 {label:'Superficie 3D',value:'z=x^2+y^2'},
 {label:'Punto',value:'A=(2,3)'},
 {label:'Fórmula',value:'V=pi*r^2*h'}
];

function Graph({statement}:{statement:ParsedStatement}){
 const content=useMemo(()=>{
  if(statement.kind==='function2d')return {kind:'segments' as const,data:sampleFunction(statement.expr,XMIN,XMAX)};
  if(statement.kind==='implicit2d')return {kind:'lines' as const,data:sampleImplicit(statement.left,statement.right,XMIN,XMAX,YMIN,YMAX)};
  if(statement.kind==='point2d'){try{return {kind:'point' as const,data:{x:evaluate(statement.x),y:evaluate(statement.y)}}}catch{return {kind:'none' as const,data:null}};}
  return {kind:'none' as const,data:null};
 },[statement]);
 const grid=[];for(let x=-10;x<=10;x++)grid.push(<line key={'x'+x} className={x===0?'expr-axis':'expr-grid'} x1={sx(x)} x2={sx(x)} y1={0} y2={H}/>);for(let y=-7;y<=7;y++)grid.push(<line key={'y'+y} className={y===0?'expr-axis':'expr-grid'} x1={0} x2={W} y1={sy(y)} y2={sy(y)}/>);
 return <svg className="expr-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Representación gráfica de la expresión">{grid}
  {content.kind==='segments'&&content.data.map((seg,i)=><polyline key={i} className="expr-curve" points={seg.filter(p=>p.y>=YMIN-3&&p.y<=YMAX+3).map(p=>`${sx(p.x)},${sy(p.y)}`).join(' ')}/>)}
  {content.kind==='lines'&&content.data.map((line,i)=><line key={i} className="expr-curve" x1={sx(line[0].x)} y1={sy(line[0].y)} x2={sx(line[1].x)} y2={sy(line[1].y)}/>)}
  {content.kind==='point'&&<g><circle className="expr-point-halo" cx={sx(content.data.x)} cy={sy(content.data.y)} r="14"/><circle className="expr-point" cx={sx(content.data.x)} cy={sy(content.data.y)} r="6"/><text className="expr-point-label" x={sx(content.data.x)+12} y={sy(content.data.y)-12}>{statement.kind==='point2d'?statement.label:'P'}</text></g>}
 </svg>;
}

export default function ExpressionLab(){
 const [input,setInput]=useState('f(x)=x^2+3*x-4');const [submitted,setSubmitted]=useState(input);const [xValue,setXValue]=useState(2);const [params,setParams]=useState<Record<string,number>>({r:3,h:5});
 const result=useMemo(()=>{try{return{statement:parseStatement(submitted),error:null as string|null}}catch(e){return{statement:null,error:e instanceof ExpressionError?e.message:'No se pudo interpretar la expresión.'}}},[submitted]);
 const statement=result.statement;const symbols=statement?(()=>{if(statement.kind==='scalar')return [...collectSymbols(statement.expr)];if(statement.kind==='point2d')return [...new Set([...collectSymbols(statement.x),...collectSymbols(statement.y)])];return []})():[];
 const scalarValue=useMemo(()=>{if(!statement)return null;try{if(statement.kind==='scalar')return evaluate(statement.expr,params);if(statement.kind==='function2d')return evaluate(statement.expr,{x:xValue});if(statement.kind==='point2d')return null;return null;}catch{return null;}},[statement,params,xValue]);
 const astText=statement?(statement.kind==='function2d'||statement.kind==='surface3d'||statement.kind==='scalar'?nodeToText(statement.expr):statement.kind==='implicit2d'?nodeToText(statement.left)+' = '+nodeToText(statement.right):'('+nodeToText(statement.x)+', '+nodeToText(statement.y)+')'):'';

 function submit(e:React.FormEvent){e.preventDefault();setSubmitted(input);}
 return <div className="expression-lab">
  <aside className="expr-editor">
   <div className="expr-title"><span className="eyebrow">EDITOR MATEMÁTICO · FASE 3</span><h2>Escribe. Interpreta. Contrasta.</h2><p>La entrada se analiza como estructura matemática. No se ejecuta código JavaScript.</p></div>
   <form onSubmit={submit}>
    <label className="expr-input-label">Expresión o ecuación</label><textarea value={input} onChange={e=>setInput(e.target.value)} maxLength={512} spellCheck={false} aria-label="Expresión matemática"/>
    <div className="expr-keyboard"><button type="button" onClick={()=>setInput(v=>v+'^2')}>x²</button><button type="button" onClick={()=>setInput(v=>v+'pi')}>π</button><button type="button" onClick={()=>setInput(v=>v+'sqrt(')}>√</button><button type="button" onClick={()=>setInput(v=>v+'sin(')}>sin</button><button type="button" onClick={()=>setInput(v=>v+'cos(')}>cos</button></div>
    <button className="primary expr-submit" type="submit"><Icon name="arrow" size={16}/>Analizar y representar</button>
   </form>
   <div className="expr-examples"><span className="eyebrow">PRUEBA UN EJEMPLO</span>{examples.map(ex=><button key={ex.value} onClick={()=>{setInput(ex.value);setSubmitted(ex.value)}}><span>{ex.label}</span><code>{ex.value}</code></button>)}</div>
  </aside>

  <section className="expr-stage">
   <div className="expr-stage-head"><div><span className={result.error?'expr-dot error-dot':'live-dot'}/><strong>{result.error?'Entrada no válida':statement?classificationName(statement):'Esperando expresión'}</strong></div><span className="conic-engine-badge">Analizador seguro · Fase 3</span></div>
   {result.error?<div className="expr-error-state"><div className="expr-error-icon">!</div><h2>No pudimos interpretar esa entrada</h2><p>{result.error}</p><small>Usa números reales, x/y/z, paréntesis, + − × ÷ ^ y funciones como sin, cos, tan, sqrt, abs, exp, ln y log.</small></div>:statement&&<>
    {(statement.kind==='function2d'||statement.kind==='implicit2d'||statement.kind==='point2d')?<div className="expr-graph-wrap"><Graph statement={statement}/><div className="expr-graph-badge"><span>Ventana</span><strong>x: −10…10 · y: −7…7</strong></div></div>:statement.kind==='surface3d'?<div className="expr-3d-preview"><div className="expr-3d-orbit"><span>z</span><span>x</span><span>y</span></div><h2>Superficie 3D reconocida</h2><p>La expresión está validada como <strong>z = f(x,y)</strong>. Su representación espacial se activará con el motor 3D de la Fase 4.</p></div>:<div className="expr-formula-preview"><div className="formula-symbol">ƒ</div><h2>Fórmula escalar reconocida</h2><p>Asigna valores a sus parámetros para obtener un resultado numérico.</p></div>}
    <div className="expr-stage-footer"><span><Icon name="grid" size={14}/>Entrada normalizada</span><code>{submitted}</code></div>
   </>}
  </section>

  <aside className="expr-analysis">
   <span className="eyebrow">ANÁLISIS MATEMÁTICO</span>{statement&&!result.error?<><h2>{classificationName(statement)}</h2><div className="expr-analysis-block"><span>Estructura interna</span><code>{astText}</code></div>
    {statement.kind==='function2d'&&<div className="expr-eval"><label>Evaluar en x = <input type="number" value={xValue} step="0.5" onChange={e=>setXValue(Number(e.target.value))}/></label><strong>{statement.label}({fmt(xValue)}) = {scalarValue===null?'—':fmt(scalarValue)}</strong><small>Las funciones trigonométricas usan radianes.</small></div>}
    {statement.kind==='scalar'&&<div className="expr-params"><span className="eyebrow">PARÁMETROS</span>{symbols.length?symbols.map(s=><label key={s}><b>{s}</b><input type="number" value={params[s]??1} step="0.5" onChange={e=>setParams(p=>({...p,[s]:Number(e.target.value)}))}/></label>):<p>No requiere parámetros externos.</p>}<div className="expr-result"><span>Resultado</span><strong>{scalarValue===null?'—':fmt(scalarValue)}</strong></div></div>}
    {statement.kind==='implicit2d'&&<div className="expr-note"><strong>Representación implícita</strong><p>La gráfica se aproxima mediante contornos numéricos. No se fuerza una única forma y = f(x).</p></div>}
    {statement.kind==='point2d'&&<div className="expr-note"><strong>Objeto geométrico</strong><p>Se interpreta como punto 2D, no como vector por inferencia automática.</p></div>}
    {statement.kind==='surface3d'&&<div className="expr-note"><strong>Preparado para Fase 4</strong><p>La expresión ya puede clasificarse y validarse; la escena 3D se incorporará en el siguiente módulo.</p></div>}
    <div className="expr-security"><span className="eyebrow">VALIDACIÓN</span><p>✓ Sin <code>eval()</code></p><p>✓ Límite de 512 caracteres</p><p>✓ Funciones y símbolos en lista permitida</p><p>✓ Errores de dominio separados</p></div>
   </>:<div className="property-empty"><div className="expr-mini-icon">ƒ</div><h3>Escribe una expresión válida</h3><p>Aquí aparecerán su clasificación, estructura y evaluación.</p></div>}
  </aside>
 </div>;
}
