import { describe, expect, it } from 'vitest';
import { FORMATS } from '../config';
import { filename, validateParticipant } from '../lib/validation';
import { validateDimensions, validateFile, MAX_FILE_BYTES } from '../lib/images';
import { fitText, imagePlacement, portraitFrame, wrapText } from '../lib/layout';
const participant={name:'Ada Okonkwo',title:'',organization:'',linkedin:''};
describe('participant validation',()=>{
 it('requires a name; optional details may be absent',()=>{expect(validateParticipant(participant)).toEqual({});expect(validateParticipant({...participant,name:'   '})).toHaveProperty('name');});
 it('limits every text field',()=>{expect(validateParticipant({...participant,name:'a'.repeat(65),title:'t'.repeat(65),organization:'o'.repeat(65)})).toMatchObject({name:expect.any(String),title:expect.any(String),organization:expect.any(String)});});
 it.each(['javascript:alert(1)','https://linkedin.com.evil.com/in/ada','http://linkedin.com/in/ada','https://www.linkedin.com/company/ada','https://www.linkedin.com/in/','https://user:pass@linkedin.com/in/ada'])('rejects invalid profile %s',linkedin=>expect(validateParticipant({...participant,linkedin})).toHaveProperty('linkedin'));
 it('accepts HTTPS LinkedIn profiles',()=>expect(validateParticipant({...participant,linkedin:'https://www.linkedin.com/in/ada-okonkwo/'})).toEqual({}));
 it('rejects control characters',()=>expect(validateParticipant({...participant,name:'Ada\nOkonkwo'})).toHaveProperty('name'));
 it('makes safe Unicode filenames',()=>{expect(filename(' Jane Doe ')).toBe('WAD2026-Jane-Doe-Attending.png');expect(filename('../../Ada<>:"\\?*')).toBe('WAD2026-Ada-Attending.png');expect(filename('Ọlá Adé')).toBe('WAD2026-Ọlá-Adé-Attending.png');});
});
describe('photo validation',()=>{
 it('accepts supported nonempty photographs',()=>expect(()=>validateFile(new File(['data'],'photo.png',{type:'image/png'}))).not.toThrow());
 it('rejects SVG, empty and oversized files',()=>{expect(()=>validateFile(new File(['<svg/>'],'x.svg',{type:'image/svg+xml'}))).toThrow('JPEG');expect(()=>validateFile(new File([],'x.png',{type:'image/png'}))).toThrow('empty');expect(()=>validateFile({type:'image/png',size:MAX_FILE_BYTES+1} as File)).toThrow('large');});
 it.each([[0,1000],[100,1000],[10000,10000],[17000,200]])('rejects unusable %s × %s dimensions',(w,h)=>expect(()=>validateDimensions(w,h)).toThrow());
 it.each([[200,8000],[8000,200],[1080,1350]])('accepts unusual safe %s × %s dimensions',(w,h)=>expect(()=>validateDimensions(w,h)).not.toThrow());
});
describe('deterministic layout',()=>{
 it('defines exact required export sizes',()=>expect(Object.values(FORMATS).map(({width,height})=>[width,height])).toEqual([[1080,1080],[1080,1350],[1080,1920]]));
 for(const format of Object.keys(FORMATS) as (keyof typeof FORMATS)[]){
  it(`covers the ${format} frame at all crop extremes`,()=>{
   const f=portraitFrame(format);
   for(const [iw,ih] of [[200,8000],[8000,200],[800,1200]])for(const zoom of [1,3])for(const x of [0,50,100])for(const y of [0,50,100]){
    const p=imagePlacement(iw,ih,f.w,f.h,{zoom,x,y});expect(p.x).toBeLessThanOrEqual(0);expect(p.y).toBeLessThanOrEqual(0);expect(p.w+p.x).toBeGreaterThanOrEqual(f.w-.00001);expect(p.h+p.y).toBeGreaterThanOrEqual(f.h-.00001);
   }
  });
  it(`fits long and unbroken names in ${format}`,()=>{
   const width=format==='story'?950:382;
   for(const name of ['Alexandria Oluwafunmilayo Chukwuemeka-Adeyemi Montgomery','W'.repeat(64),'Ọlá Adé Ọlúwọlé']){
    const result=fitText(name,width,2,52,10,(s,n)=>Array.from(s).length*n*.95);expect(result.lines.length).toBeLessThanOrEqual(2);for(const line of result.lines)expect(Array.from(line).length*result.size*.95).toBeLessThanOrEqual(width);
   }
  });
 }
 it('wraps a long token without losing characters',()=>expect(wrapText('abcdefghij',3,s=>s.length).join('')).toBe('abcdefghij'));
});
