import {useEffect,useRef,useState} from 'react';
import {parseStatement} from '../math/expression';
import {statementToLatex,visualAsciiToStatement} from '../math/format';
import type {MathfieldElement} from 'mathlive';

export default function MathEditor({initialValue,onChange}:{initialValue:string;onChange:(value:string)=>void}){
 const host=useRef<HTMLDivElement>(null);const change=useRef(onChange);
 const [error,setError]=useState('');const [ready,setReady]=useState(false);
 useEffect(()=>{change.current=onChange;},[onChange]);
 useEffect(()=>{
  let active=true;let field:MathfieldElement|null=null;
  const input=()=>{if(!field)return;const ascii=field.getValue('ascii-math');change.current(ascii);try{visualAsciiToStatement(ascii);setError('');}catch(e){setError(e instanceof Error?e.message:'Entrada no compatible.');}};
  void import('mathlive').then(({MathfieldElement})=>{
   if(!active||!host.current)return;
   MathfieldElement.fontsDirectory='/mathlive-fonts';MathfieldElement.soundsDirectory=null;
   field=new MathfieldElement();field.mathVirtualKeyboardPolicy='auto';field.setAttribute('aria-label','Editor visual de expresiones matemáticas');
   try{field.value=statementToLatex(parseStatement(initialValue));}catch{field.value='';setError('Corrige la expresión en modo texto o escribe una nueva expresión visual.');}
   host.current.appendChild(field);field.addEventListener('input',input);setReady(true);
  }).catch(()=>{if(active)setError('No se pudo cargar el editor visual. Usa el modo texto.');});
  return()=>{active=false;if(field){field.removeEventListener('input',input);window.mathVirtualKeyboard?.hide();field.remove();}};
 },[]);
 return <div className="visual-editor"><div ref={host}/>{!ready&&!error&&<p role="status">Cargando editor visual…</p>}{error&&<p className="math-error" role="status">{error}</p>}<small>LaTeX visual → ASCIIMath validado → árbol matemático. Las operaciones no admitidas muestran un error.</small></div>;
}
