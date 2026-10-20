import {useRef,useState} from 'react';
import Icon from './Icon';
import {clearProjectData,createProjectFile,importProjectFile,parseProjectFile} from '../storage/projectStorage';

function downloadProject(){
 const project=createProjectFile();
 const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 const stamp=new Date().toISOString().slice(0,10);
 a.href=url;a.download=`eduvirtual-proyecto-${stamp}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

export default function ProjectPanel({open,onClose}:{open:boolean;onClose:()=>void}){
 const input=useRef<HTMLInputElement>(null);const [status,setStatus]=useState('');const [error,setError]=useState('');
 if(!open)return null;
 async function importFile(file:File){
  setError('');setStatus('');
  try{
   if(file.size>2*1024*1024)throw new Error('El archivo supera el límite de 2 MiB.');
   const text=await file.text();const project=parseProjectFile(text);importProjectFile(project);
   setStatus('Proyecto importado correctamente. Se recargará el laboratorio.');
   window.setTimeout(()=>location.reload(),450);
  }catch(e){setError(e instanceof Error?e.message:'No se pudo importar el proyecto.');}
 }
 function clear(){
  if(!confirm('¿Vaciar el proyecto guardado en este navegador? Las evidencias locales también se eliminarán.'))return;
  clearProjectData();setStatus('Proyecto local eliminado. Se recargará el laboratorio.');window.setTimeout(()=>location.reload(),450);
 }
 return <div className="project-backdrop" onClick={onClose}>
  <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={e=>e.stopPropagation()}>
   <button className="project-close" onClick={onClose} aria-label="Cerrar">×</button>
   <span className="eyebrow">FASE 5 · PROYECTOS</span>
   <h2 id="project-title">Tu trabajo, ahora sí se puede conservar.</h2>
   <p>EduVirtual Lab guarda automáticamente el estado compatible de cada laboratorio en este navegador. También puedes llevarlo a otro equipo mediante un archivo JSON validado.</p>
   <div className="project-actions">
    <button className="project-card primary-card" onClick={()=>{downloadProject();setStatus('Proyecto exportado como archivo JSON.');}}><Icon name="arrow" size={20}/><strong>Exportar proyecto</strong><span>Descarga una copia portátil del trabajo actual.</span></button>
    <button className="project-card" onClick={()=>input.current?.click()}><Icon name="plus" size={20}/><strong>Importar proyecto</strong><span>Abre un archivo .json de EduVirtual Lab, máximo 2 MiB.</span></button>
    <input ref={input} hidden type="file" accept=".json,application/json" onChange={e=>{const file=e.target.files?.[0];if(file)void importFile(file);e.currentTarget.value='';}}/>
   </div>
   <div className="project-security"><Icon name="help" size={18}/><div><strong>Importación segura</strong><p>Se valida versión, tamaños, tipos, coordenadas y campos admitidos. No se ejecuta código del archivo y no se importan scripts, HTML ni XML.</p></div></div>
   <div className="project-local"><div><span className="live-dot"/><strong>Guardado automático local</strong><small>No es una copia de seguridad. Si borras los datos del navegador, se pierde salvo que hayas exportado el JSON.</small></div><button onClick={clear}>Vaciar proyecto local</button></div>
   {status&&<p className="project-status" role="status">{status}</p>}
   {error&&<p className="math-error" role="alert">{error}</p>}
  </section>
 </div>;
}
