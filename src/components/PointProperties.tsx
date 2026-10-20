import {useState} from 'react';
import type {Point} from '../domain/model';
import {validCoordinate} from '../domain/model';
import {format} from '../math/coordinates';
import Icon from './Icon';
export default function PointProperties({point,onUpdate,onDelete}:{point:Point;onUpdate:(p:Point)=>void;onDelete:()=>void}){
 const [x,setX]=useState(String(point.x));const [y,setY]=useState(String(point.y));const [error,setError]=useState('');
 return <form key={`${point.x},${point.y}`} onSubmit={e=>{e.preventDefault();const a=Number(x),b=Number(y);if(!x.trim()||!y.trim()||!validCoordinate(a)||!validCoordinate(b)){setError('Introduce números entre −10000 y 10000. Usa punto decimal.');return;}setError('');onUpdate({...point,x:a,y:b});}}>
 <div className="property-object"><span style={{background:point.color}}>{point.label}</span><div><strong>Punto {point.label}</strong><small>Objeto libre · 2 dimensiones</small></div></div>
 <p className="eyebrow">COORDENADAS</p><div className="coordinate-fields"><label>x<input aria-label="Coordenada x" type="number" step="any" min="-10000" max="10000" value={x} onChange={e=>setX(e.target.value)}/></label><label>y<input aria-label="Coordenada y" type="number" step="any" min="-10000" max="10000" value={y} onChange={e=>setY(e.target.value)}/></label></div>
 <p className="coordinate-readout">{point.label} = ({format(point.x)}, {format(point.y)})</p>{error&&<p role="alert" className="error">{error}</p>}
 <button className="primary w-full" type="submit">Aplicar coordenadas</button><button className="delete-button" type="button" onClick={onDelete}><Icon name="trash" size={16}/>Eliminar punto</button>
 </form>;
}
