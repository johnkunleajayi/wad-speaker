import { useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { FORMATS, type Crop } from '../config';
import { imagePlacement, portraitFrame } from '../lib/layout';
import { renderPoster, type PosterOptions } from '../lib/renderer';
interface Props extends PosterOptions {onCrop:(crop:Crop)=>void;onReady:(canvas:HTMLCanvasElement|null)=>void}
export function PosterPreview({onReady,onCrop,...options}:Props) {
 const canvas=useRef<HTMLCanvasElement>(null); const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [retry,setRetry]=useState(0);
 const drag=useRef<{startX:number;startY:number;crop:Crop;overflowX:number;overflowY:number}|null>(null);
 const {participant,format,photo,crop,qr}=options;
 useLayoutEffect(()=>{
  let canceled=false;setLoading(true);setError('');onReady(null);
  const staging=document.createElement('canvas');
  renderPoster(staging,{participant,format,photo,crop,qr}).then(()=>{
   if(canceled||!canvas.current)return;
   const target=canvas.current;target.width=staging.width;target.height=staging.height;
   const ctx=target.getContext('2d');if(!ctx)throw new Error('Poster preview is unavailable.');
   ctx.drawImage(staging,0,0);setLoading(false);onReady(target);
  }).catch(()=>{if(!canceled){setError('The poster could not render. Check that the local fonts and logo are available, then try again.');setLoading(false);onReady(null);}});
  return ()=>{canceled=true;};
 },[participant,format,photo,crop,qr,onReady,retry]);
 function start(e:PointerEvent<HTMLCanvasElement>){
  if(!photo||!canvas.current)return;
  const bounds=canvas.current.getBoundingClientRect(),scale=1080/bounds.width;
  const x=(e.clientX-bounds.left)*scale,y=(e.clientY-bounds.top)*scale,f=portraitFrame(format);
  if(x<f.x||x>f.x+f.w||y<f.y||y>f.y+f.h)return;
  const p=imagePlacement(photo.naturalWidth,photo.naturalHeight,f.w,f.h,crop);
  drag.current={startX:e.clientX,startY:e.clientY,crop:{...crop},overflowX:p.w-f.w,overflowY:p.h-f.h};
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function move(e:PointerEvent<HTMLCanvasElement>){
  const d=drag.current;if(!d||!canvas.current)return;const scale=1080/canvas.current.getBoundingClientRect().width;
  onCrop({...d.crop,x:d.overflowX>1?Math.max(0,Math.min(100,d.crop.x-(e.clientX-d.startX)*scale/d.overflowX*100)):50,y:d.overflowY>1?Math.max(0,Math.min(100,d.crop.y-(e.clientY-d.startY)*scale/d.overflowY*100)):50});
 }
 function keyboard(e:KeyboardEvent<HTMLCanvasElement>){
  if(!photo||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();
  const step=e.shiftKey?10:2;
  onCrop({...crop,x:Math.min(100,Math.max(0,crop.x+(e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0))),y:Math.min(100,Math.max(0,crop.y+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0)))});
 }
 return <div className={`poster-wrap ${photo?'editable':''}`} style={{aspectRatio:`1080 / ${FORMATS[format].height}`}}><canvas ref={canvas} width={1080} height={FORMATS[format].height} tabIndex={photo?0:undefined} aria-label={`${FORMATS[format].label} poster for ${participant.name.trim()||'your name'}. ${photo?'Drag the photograph to reposition it. Use arrow keys when focused, or the labeled position controls.':'Upload your photograph to personalize this preview.'}`} onPointerDown={start} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={keyboard}/>{loading&&<div className="render-status" role="status">Refining your preview…</div>}{error&&<div className="preview-error" role="alert"><p>{error}</p><button type="button" onClick={()=>setRetry(v=>v+1)}>Try again</button></div>}</div>;
}
