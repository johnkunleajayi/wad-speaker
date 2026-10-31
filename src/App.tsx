import { useCallback, useEffect, useRef, useState } from 'react';
import { EVENT, FORMATS, INITIAL_CROP, type Crop, type Format, type Participant } from './config';
import { Atmosphere } from './components/Atmosphere';
import { Field } from './components/Field';
import { Icon } from './components/Icon';
import { PhotoEditor } from './components/PhotoEditor';
import { PosterPreview } from './components/PosterPreview';
import { loadPhoto } from './lib/images';
import { canvasBlob } from './lib/renderer';
import { filename, validateParticipant } from './lib/validation';
const EMPTY:Participant={name:'',title:'',organization:'',linkedin:''};
export default function App(){
 const [participant,setParticipant]=useState<Participant>(EMPTY);const [touched,setTouched]=useState<Partial<Record<keyof Participant,boolean>>>({});
 const [photo,setPhoto]=useState<HTMLImageElement|null>(null);const [crop,setCrop]=useState<Crop>({...INITIAL_CROP});const [format,setFormat]=useState<Format>('portrait');
 const [photoBusy,setPhotoBusy]=useState(false);const [photoError,setPhotoError]=useState('');const [canvas,setCanvas]=useState<HTMLCanvasElement|null>(null);const [exportBusy,setExportBusy]=useState(false);const [status,setStatus]=useState('');const [exportError,setExportError]=useState('');
 const uploadVersion=useRef(0);const mounted=useRef(true);const downloadURLs=useRef(new Map<string,ReturnType<typeof setTimeout>>());
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;uploadVersion.current++;for(const [url,timer] of downloadURLs.current){clearTimeout(timer);URL.revokeObjectURL(url);}downloadURLs.current.clear();};},[]);
 const ready=useCallback((next:HTMLCanvasElement|null)=>setCanvas(next),[]);
 const errors=validateParticipant(participant);
 const canExport=!!canvas&&!!photo&&!photoBusy&&!exportBusy&&Object.keys(errors).length===0;
 const setField=(key:keyof Participant,value:string)=>{setParticipant(prev=>({...prev,[key]:value}));setTouched(prev=>({...prev,[key]:true}));setStatus('');};
 async function choosePhoto(file:File){
  const version=++uploadVersion.current;setPhotoBusy(true);setPhotoError('');setStatus('');
  try{const image=await loadPhoto(file);if(mounted.current&&version===uploadVersion.current){setPhoto(image);setCrop({...INITIAL_CROP});}}
  catch(error){if(mounted.current&&version===uploadVersion.current)setPhotoError(error instanceof Error?error.message:'Could not load your photograph.');}
  finally{if(mounted.current&&version===uploadVersion.current)setPhotoBusy(false);}
 }
 async function download(){
  setTouched({name:true,title:true,organization:true,linkedin:true});if(!canExport||!canvas)return;
  setExportBusy(true);setStatus('');setExportError('');
  try{
   // Snapshot the visible, fully rendered bitmap before any later edit can change it.
   const snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;
   const ctx=snapshot.getContext('2d');if(!ctx)throw new Error('PNG export is unavailable.');ctx.drawImage(canvas,0,0);
   const blob=await canvasBlob(snapshot);if(!mounted.current)return;
   const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename(participant.name);document.body.appendChild(link);link.click();link.remove();
   const timer=setTimeout(()=>{URL.revokeObjectURL(url);downloadURLs.current.delete(url);},30000);downloadURLs.current.set(url,timer);
   setStatus('Your PNG is ready. Check your downloads.');
  }catch{if(mounted.current)setExportError('We could not download the PNG. Please try again.');}
  finally{if(mounted.current)setExportBusy(false);}
 }
 return <>
  <Atmosphere/>
  <a className="skip-link" href="#generator">Skip to poster generator</a>
  <main id="generator" className="generator" aria-label="Attendee poster generator">
  <header className="page-header">
   <a className="brand-link" href={EVENT.website} target="_blank" rel="noreferrer" aria-label="West Africa Dreamin’ official website"><img src={EVENT.logo} alt="West Africa Dreamin’"/></a>
   <div><h1 aria-label="WAD 2026 Attendee Poster Generator"><span className="sr-only">WAD 2026 </span>Attendee<br/>Poster Generator</h1><p>Upload your photo, enter your details, and download your personalized poster.</p></div>
  </header>
   <form id="poster-form" className="form-panel" noValidate onSubmit={e=>{e.preventDefault();void download();}}>
    <PhotoEditor photo={photo} crop={crop} busy={photoBusy} error={photoError} onFile={file=>void choosePhoto(file)} onCrop={next=>{setCrop(next);setStatus('');}} onRemove={()=>{uploadVersion.current++;setPhoto(null);setPhotoBusy(false);setPhotoError('');setCrop({...INITIAL_CROP});setStatus('');}}/>
    <Field field="name" label="Full name" placeholder="e.g. Ada Okonkwo" value={participant.name} error={touched.name?errors.name:undefined} onChange={value=>setField('name',value)} onBlur={()=>setTouched(prev=>({...prev,name:true}))}/>
    <Field field="title" label="Professional title" placeholder="e.g. Salesforce Solution Architect" value={participant.title} error={touched.title?errors.title:undefined} onChange={value=>setField('title',value)} onBlur={()=>setTouched(prev=>({...prev,title:true}))}/>
    <Field field="organization" label="Organization" placeholder="e.g. Dreamers Collective" value={participant.organization} error={touched.organization?errors.organization:undefined} onChange={value=>setField('organization',value)} onBlur={()=>setTouched(prev=>({...prev,organization:true}))}/>

   </form>
   <section className="preview-panel" aria-labelledby="preview-heading">
    <div className="preview-toolbar"><h2 id="preview-heading">Poster format</h2>
     <fieldset className="format-picker"><legend className="sr-only">Poster format</legend>{(Object.keys(FORMATS) as Format[]).map(key=><label key={key} className={format===key?'selected':''}><input type="radio" aria-label={FORMATS[key].label} name="format" value={key} checked={format===key} onChange={()=>{setFormat(key);setStatus('');}}/><strong>{FORMATS[key].label}</strong><small>{FORMATS[key].ratio}</small></label>)}</fieldset>
    </div>
    <div className={`preview-stage format-${format}`}><PosterPreview participant={participant} photo={photo} crop={crop} format={format} qr={false} onCrop={next=>{setCrop(next);setStatus('');}} onReady={ready}/></div>
    <p className="stage-caption">{FORMATS[format].width} × {FORMATS[format].height} px · PNG</p>
   </section>
   <div className="download-area">
    <button type="submit" form="poster-form" className="download-button" disabled={!canExport} aria-busy={exportBusy} aria-describedby="download-help"><Icon name="download" size={19}/>{exportBusy?'Preparing your PNG…':'Generate & Download Poster'}</button>
    <p id="download-help" className="download-help">{!participant.name.trim()||!photo?'Add your name and photo to download.':Object.keys(errors).length?'Please correct the highlighted details.':!canvas?'Preparing your preview…':''}</p>
    {status&&<p className="success-message" role="status"><Icon name="check" size={15}/>{status}</p>}
    {exportError&&<p className="field-error" role="alert">{exportError}</p>}
    <p className="privacy-note"><Icon name="shield" size={14}/>Your photo and details stay in your browser. No uploads or tracking.</p>
   </div>
  </main>

 </>;
}
