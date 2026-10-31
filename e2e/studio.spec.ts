import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
async function fixture(page:Page,width=800,height=1200){
 const data=await page.evaluate(({width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;const g=ctx.createLinearGradient(0,0,width,height);g.addColorStop(0,'#90BFA8');g.addColorStop(1,'#164833');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#E0CA84':'#3E8062';ctx.fillRect(i*width/8,height*.3,width/16,height*.7);}ctx.fillStyle='#001F01';ctx.font=`600 ${Math.min(width,height)/20}px sans-serif`;ctx.textAlign='center';ctx.fillText('PHOTO TEST',width/2,height*.2);return c.toDataURL('image/png').split(',')[1];},{width,height});
 return {name:'local-photo.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')};
}
async function ready(page:Page){await expect(page.locator('.render-status')).toHaveCount(0);await expect(page.locator('.preview-error')).toHaveCount(0);}
async function fill(page:Page){await page.getByRole('textbox',{name:/Full name/}).fill('Ada Okonkwo');await page.getByLabel('Choose photograph').setInputFiles(await fixture(page));await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeEnabled();}
test('all formats export the exact visible pixels at the required dimensions',async({page})=>{
 await page.goto('/');await fill(page);await page.getByRole('textbox',{name:/Professional title/}).fill('Salesforce Solution Architect');await page.getByRole('textbox',{name:/Organization/}).fill('Dreamers Collective');
 for(const [label,height] of [['Square',1080],['Portrait',1350],['Story',1920]] as const){
  await page.getByRole('radio',{name:new RegExp(label)}).check();await ready(page);
  const visible=await page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL());
  const repeat=await page.evaluate(async format=>{
   // @ts-expect-error runtime Vite module
   const {renderPoster}=await import('/src/lib/renderer.ts');
   const photo=new Image();photo.src=(document.querySelector('.has-photo img') as HTMLImageElement).src;await photo.decode();const c=document.createElement('canvas');
   await renderPoster(c,{format:format.toLowerCase(),photo,crop:{zoom:1,x:50,y:50},qr:false,participant:{name:'Ada Okonkwo',title:'Salesforce Solution Architect',organization:'Dreamers Collective',linkedin:''}});return c.toDataURL();
  },label);expect(repeat).toBe(visible);

  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:/Generate & Download Poster/}).click();const download=await downloading;expect(download.suggestedFilename()).toBe('WAD2026-Ada-Okonkwo-Attending.png');
  const path=await download.path();const png=await fs.readFile(path!);expect(png.readUInt32BE(16)).toBe(1080);expect(png.readUInt32BE(20)).toBe(height);
  const identical=await page.evaluate(async({visible,exported})=>{
   const pixels=async(src:string)=>{const i=new Image();i.src=src;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d')!;ctx.drawImage(i,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};
   const [a,b]=await Promise.all([pixels(visible),pixels(exported)]);return a.length===b.length&&a.every((v,i)=>v===b[i]);
  },{visible,exported:`data:image/png;base64,${png.toString('base64')}`});expect(identical).toBe(true);
  await download.saveAs(`work/qa-${label.toLowerCase()}.png`);await expect(page.getByText(/Your PNG is ready/)).toBeVisible();
 }
});
test('actual renderer keeps text within artboards and away from other text and portrait',async({page})=>{
 await page.goto('/');await ready(page);
 const issues=await page.evaluate(async()=>{
  // Import the actual Vite-transformed renderer, not a test copy.
  // @ts-expect-error runtime Vite module
  const {renderPoster}=await import('/src/lib/renderer.ts');
  // @ts-expect-error runtime Vite module
  const {portraitFrame,nameplateFrame}=await import('/src/lib/layout.ts');
  const failures:string[]=[];
  for(const format of ['square','portrait','story'])for(const name of ['Ada Okonkwo','W'.repeat(64),'Alexandria Oluwafunmilayo Chukwuemeka-Adeyemi Montgomery','Ọlá Adé Ọlúwọlé'])for(const optional of [0,1,2,3]){
   const c=document.createElement('canvas'),ctx=c.getContext('2d')!;const boxes:{text:string;x:number;y:number;w:number;h:number;insidePath:boolean}[]=[];
   const original=ctx.fillText.bind(ctx);ctx.fillText=(str,x,y)=>{const m=ctx.measureText(str);boxes.push({text:str,x:x-m.actualBoundingBoxLeft,y:y-m.actualBoundingBoxAscent,w:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,h:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent,insidePath:[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent]].every(([px,py])=>ctx.isPointInPath(px,py))});original(str,x,y);};
   await renderPoster(c,{format,photo:null,crop:{zoom:1,x:50,y:50},qr:true,participant:{name,title:optional&1?'W'.repeat(64):'',organization:optional&2?'W'.repeat(64):'',linkedin:optional?'https://www.linkedin.com/in/ada-okonkwo/':''}});
   const raw=portraitFrame(format),plate=nameplateFrame(format,Number(!!(optional&1))+Number(!!(optional&2)));
   const frame={...raw,h:Math.min(raw.h,plate.y-raw.y)}; // cream nameplate intentionally overlays the lower photo
   for(const a of boxes.filter(b=>b.y>=plate.y&&b.y<plate.y+plate.h&&b.x>=plate.x&&b.x<plate.x+plate.w)){if(!a.insidePath)failures.push(`${format}: text leaves cream contour: ${a.text}`);if(a.y+a.h>plate.y+plate.h)failures.push(`${format}: text leaves nameplate: ${a.text}`);}
   const overlaps=(a:typeof frame,b:typeof frame)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
   for(const a of boxes){if(a.x<0||a.y<0||a.x+a.w>c.width||a.y+a.h>c.height)failures.push(`${format}: out of bounds: ${a.text}`);if(a.text!=='YOUR PHOTO HERE'&&overlaps(a,frame))failures.push(`${format}: portrait overlap: ${a.text}`);}
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(overlaps(boxes[i],boxes[j]))failures.push(`${format}: text overlap: ${boxes[i].text} / ${boxes[j].text}`);
  }return [...new Set(failures)];
 });expect(issues).toEqual([]);
});
test('crop zoom, pointer, keyboard and replacement work on landscape and tall photographs',async({page})=>{
 await page.goto('/');await fill(page);const zoom=page.getByRole('slider',{name:/Zoom/});await zoom.fill('2');await expect(page.getByText('2.00×')).toBeVisible();await ready(page);
 await page.getByText('Adjust position',{exact:true}).click();await page.locator('canvas').focus();await page.keyboard.press('ArrowLeft');await expect(page.getByRole('slider',{name:/Horizontal position/})).toHaveValue('52');
 const canvas=await page.locator('canvas').boundingBox();expect(canvas).not.toBeNull();const x=canvas!.x+canvas!.width*.7,y=canvas!.y+canvas!.height*.65;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-25,y-20,{steps:5});await page.mouse.up();expect(Number(await page.getByRole('slider',{name:/Horizontal position/}).inputValue())).toBeGreaterThan(52);
 for(const [w,h] of [[8000,200],[200,8000]]){await page.getByLabel('Choose photograph').setInputFiles(await fixture(page,w,h));await expect(zoom).toHaveValue('1');await ready(page);await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeEnabled();}
 await page.getByRole('button',{name:/Remove/}).click();await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeDisabled();
});
test('rejects forged images and preserves the existing photograph',async({page})=>{
 await page.goto('/');await fill(page);await page.getByLabel('Choose photograph').setInputFiles({name:'forged.png',mimeType:'image/png',buffer:Buffer.from('<svg></svg>')});await expect(page.getByText(/does not contain a valid/)).toBeVisible();await expect(page.getByAltText('Your selected photograph')).toBeVisible();await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeEnabled();
});
test('desktop and mobile layouts stay within the viewport; data stays local',async({page})=>{
 const external:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5178')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:1000});await page.goto('/');await fill(page);await ready(page);await page.screenshot({path:'work/qa-desktop.png',fullPage:true});
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await expect(page.locator('body')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===390){
   await page.screenshot({path:'work/qa-mobile.png',fullPage:true});
   for(const format of ['Square','Story','Portrait']){await page.getByRole('radio',{name:new RegExp(format)}).check();await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('.preview-panel').screenshot({path:`work/qa-mobile-${format.toLowerCase()}.png`});}
  }
 }
 expect(external).toEqual([]);expect(errors).toEqual([]);expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length,cookies:document.cookie}))).toEqual({local:0,session:0,cookies:''});
});

test('desktop and mobile pass automated WCAG AA accessibility checks',async({page})=>{
 const {default:AxeBuilder}=await import('@axe-core/playwright');
 await page.goto('/');await fill(page);await ready(page);
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);}
});

test('asset and PNG export failures show clear errors and support retry',async({page})=>{
 await page.route('**/brand/wad-logo-white.png',route=>route.abort());await page.goto('/');await expect(page.getByText(/The poster could not render/)).toBeVisible();await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeDisabled();await page.unroute('**/brand/wad-logo-white.png');await page.getByRole('button',{name:'Try again'}).click();await ready(page);await fill(page);
 await page.evaluate(()=>{const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback){HTMLCanvasElement.prototype.toBlob=original;callback(null);};});
 await page.getByRole('button',{name:/Generate & Download Poster/}).click();await expect(page.getByText(/We could not download the PNG/)).toBeVisible();await expect(page.getByRole('button',{name:/Generate & Download Poster/})).toBeEnabled();const downloading=page.waitForEvent('download');await page.getByRole('button',{name:/Generate & Download Poster/}).click();await downloading;await expect(page.getByText(/Your PNG is ready/)).toBeVisible();await expect(page.getByText(/We could not download the PNG/)).toHaveCount(0);
});


test('the simplified workflow is compact and removes marketing and extra inputs',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await ready(page);
 await expect(page.getByRole('heading',{level:1,name:'WAD 2026 Attendee Poster Generator'})).toBeVisible();
 await expect(page.getByText('Upload your photo, enter your details, and download your personalized poster.')).toBeVisible();
 await expect(page.getByText(/Independent WAD 2026 concept prototype/)).toHaveCount(0);await expect(page.getByRole('textbox')).toHaveCount(3);await expect(page.getByRole('checkbox')).toHaveCount(0);await expect(page.getByRole('radio',{name:'Portrait'})).toBeChecked();
 await expect(page.locator('.hero,.registration,.how-it-works,.step-number')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThanOrEqual(900);
 await fill(page);await expect(page.locator('.position-details')).not.toHaveAttribute('open','');await expect(page.getByRole('slider',{name:'Zoom'})).toBeVisible();await expect(page.getByRole('slider',{name:'Horizontal position'})).toHaveCount(0);
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Generate & Download Poster'}).click();await downloaded;
});

test('CSS atmosphere moves continuously, preserves static poster pixels and respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});await page.goto('/');await fill(page);await ready(page);
 const animations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>({name:(a as CSSAnimation).animationName,duration:a.effect?.getTiming().duration})));
 expect(animations.some(a=>a.name==='emerald-tide')).toBe(true);expect(animations.some(a=>a.name==='gold-passage')).toBe(true);
 const before=await page.locator('.ambient-emerald').evaluate(e=>getComputedStyle(e).transform);const bitmap=await page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL());
 await page.screenshot({path:'work/signature-motion-a.png'});await page.waitForTimeout(1200);
 const after=await page.locator('.ambient-emerald').evaluate(e=>getComputedStyle(e).transform);expect(after).not.toBe(before);await page.screenshot({path:'work/signature-motion-b.png'});
 expect(await page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(bitmap);await expect(page.locator('.atmosphere')).toHaveAttribute('aria-hidden','true');expect(await page.locator('.atmosphere').evaluate(e=>getComputedStyle(e).pointerEvents)).toBe('none');
 await page.getByRole('textbox',{name:/Full name/}).fill('Alexandria Oluwafunmilayo Chukwuemeka-Adeyemi');await page.getByRole('textbox',{name:/Professional title/}).fill('Principal Salesforce Architect & Digital Transformation Lead');await expect(page.getByRole('button',{name:'Generate & Download Poster'})).toBeEnabled();
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
 const reduced=await page.locator('.ambient-emerald').evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(200);expect(await page.locator('.ambient-emerald').evaluate(e=>getComputedStyle(e).transform)).toBe(reduced);
 await page.screenshot({path:'work/signature-reduced-motion.png'});
});
