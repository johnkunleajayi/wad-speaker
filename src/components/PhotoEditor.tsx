import { useRef, useState, type DragEvent } from 'react';
import { INITIAL_CROP, type Crop } from '../config';
import { Icon } from './Icon';
interface Props {photo:HTMLImageElement|null;crop:Crop;busy:boolean;error:string;onFile:(file:File)=>void;onCrop:(crop:Crop)=>void;onRemove:()=>void}
export function PhotoEditor({photo,crop,busy,error,onFile,onCrop,onRemove}:Props){
 const input=useRef<HTMLInputElement>(null);const [drag,setDrag]=useState(false);
 function drop(event:DragEvent){event.preventDefault();setDrag(false);if(!busy&&event.dataTransfer.files[0])onFile(event.dataTransfer.files[0]);}
 return <section aria-labelledby="photo-label" className="photo-section">
  <div className="label-row"><h2 id="photo-label">Photograph <span className="required">*</span></h2>{photo&&<button type="button" className="text-button" onClick={onRemove} disabled={busy}>Remove</button>}</div>
  <input className="sr-only" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" ref={input} aria-label="Choose photograph" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)onFile(file);e.target.value='';}}/>
  <button type="button" className={`upload-zone ${drag?'dragging':''} ${photo?'has-photo':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={drop} onClick={()=>input.current?.click()} disabled={busy} aria-describedby="photo-help photo-error">
   {photo?<img src={photo.src} alt="Your selected photograph"/>:<Icon name="upload" size={23}/>}
   <span><strong>{busy?'Preparing your photo…':photo?'Replace photo':'Upload photo'}</strong><small>{photo?'Choose a different photograph':'Choose a file or drag it here'}</small></span>
  </button>
  <p id="photo-help" className="field-help">JPEG, PNG or WebP · up to 12 MB · min. 200 × 200 px</p><p id="photo-error" className="field-error" role={error?'alert':undefined}>{error}</p>
  {photo&&<div className="photo-adjustments">
   <label className="range-row"><span>Zoom</span><input type="range" min={1} max={3} step={.01} value={crop.zoom} onChange={e=>onCrop({...crop,zoom:Number(e.target.value)})}/><output>{crop.zoom.toFixed(2)}×</output></label>
   <details className="position-details"><summary>Adjust position</summary><p>Drag your photo on the preview, use arrow keys when it is focused, or use these controls.</p>
    {([{key:'x',label:'Horizontal position'},{key:'y',label:'Vertical position'}] as const).map(control=><label className="range-row position-row" key={control.key}><span>{control.label}</span><input type="range" min={0} max={100} step={1} value={crop[control.key]} onChange={e=>onCrop({...crop,[control.key]:Number(e.target.value)})}/><output>{Math.round(crop[control.key])}%</output></label>)}
    <button className="text-button" type="button" onClick={()=>onCrop({...INITIAL_CROP})}><Icon name="reset" size={13}/>Reset crop</button>
   </details>
  </div>}
 </section>;
}
