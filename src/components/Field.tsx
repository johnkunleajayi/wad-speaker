import { useId } from 'react';
import { LIMITS, type Participant } from '../config';
interface Props {field:keyof Participant;label:string;value:string;placeholder:string;error?:string;onChange:(value:string)=>void;onBlur:()=>void}
export function Field({field,label,value,placeholder,error,onChange,onBlur}:Props){
 const id=useId(); const count=Array.from(value).length;
 return <div className="field"><div className="label-row"><label htmlFor={id}>{label} {field==='name'?<span className="required">*</span>:<span className="optional">optional</span>}</label>{value.length>0&&<span className="count">{count}/{LIMITS[field]}</span>}</div><input id={id} name={field} type={field==='linkedin'?'url':'text'} value={value} placeholder={placeholder} maxLength={LIMITS[field]} required={field==='name'} autoComplete={field==='name'?'name':field==='title'?'organization-title':field==='organization'?'organization':'url'} aria-invalid={!!error} aria-describedby={error?`${id}-error`:field==='linkedin'?`${id}-help`:undefined} onChange={event=>onChange(event.target.value)} onBlur={onBlur}/>{error&&<p id={`${id}-error`} className="field-error" role="alert">{error}</p>}{field==='linkedin'&&!error&&<p id={`${id}-help`} className="field-help">Shown as a short profile address on your poster.</p>}</div>;
}
