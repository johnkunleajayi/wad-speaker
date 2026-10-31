import QRCode from 'qrcode';
import { EVENT, FORMATS, type Crop, type Format, type Participant } from '../config';
import { BRAND as B } from './brand';
import { drawAtmosphere, drawLagosWaterfront } from './artwork';
import { fitText, imagePlacement, portraitFrame, nameplateFrame } from './layout';
let assetsPromise: Promise<HTMLImageElement> | undefined;
export function loadAssets(): Promise<HTMLImageElement> {
  if (!assetsPromise) assetsPromise = (async () => {
    await Promise.all([document.fonts.load('500 30px "General Sans"'),document.fonts.load('700 60px "General Sans"'),document.fonts.load('400 80px Trophy')]);
    await document.fonts.ready;
    if (!document.fonts.check('500 30px "General Sans"') || !document.fonts.check('400 80px Trophy')) throw new Error('Poster fonts did not load. Please refresh and try again.');
    const logo = new Image(); logo.src = EVENT.whiteLogo; await logo.decode(); return logo;
  })().catch(error => { assetsPromise = undefined; throw error; });
  return assetsPromise;
}
function arch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x,y+w/2);
  ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0); ctx.lineTo(x+w,y+h-95); ctx.quadraticCurveTo(x+w,y+h,x+w-110,y+h); ctx.lineTo(x+110,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-95); ctx.closePath();
}
function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,size:number,color:string=B.white,weight=500,font='General Sans') {
  ctx.font=`${weight} ${size}px "${font}"`; ctx.fillStyle=color; ctx.textBaseline='alphabetic';
  const m=ctx.measureText(value);ctx.fillText(value,x+m.actualBoundingBoxLeft,y+m.actualBoundingBoxAscent);
}
/** Individually set font glyphs retain sharp Canvas typography and explicit optical spacing. */
function displayWord(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,initial:number,tracking:number,fill:string|CanvasGradient,maxWidth:number,weight=700){
  let size=initial;const letters=Array.from(value);
  const measure=()=>{ctx.font=`${weight} ${size}px "General Sans"`;return letters.reduce((sum,c)=>sum+ctx.measureText(c).width,0)+Math.max(0,letters.length-1)*tracking;};
  while(measure()>maxWidth&&size>12)size--;
  const width=measure(),ascent=ctx.measureText(value).actualBoundingBoxAscent;
  ctx.textBaseline='alphabetic';ctx.fillStyle=fill;let cursor=x;
  for(const letter of letters){const m=ctx.measureText(letter);ctx.fillText(letter,cursor+m.actualBoundingBoxLeft,y+ascent);cursor+=m.width+tracking;}
  return width;
}
function textBox(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,w:number,h:number,initial:number,min:number,color:string,weight=500,maxLines=2) {
  let fit=fitText(value,w,maxLines,initial,min,(s,n)=>{ctx.font=`${weight} ${n}px "General Sans"`;return ctx.measureText(s).width;});
  while(fit.lines.length*fit.size*1.2>h&&fit.size>min){fit=fitText(value,w,maxLines,fit.size-1,min,(s,n)=>{ctx.font=`${weight} ${n}px "General Sans"`;return ctx.measureText(s).width;});}
  fit.lines.forEach((line,i)=>text(ctx,line,x,y+i*fit.size*1.2,fit.size,color,weight));
  return fit.lines.length*fit.size*1.2;
}
function polygon(ctx:CanvasRenderingContext2D,points:number[][],fill:string|CanvasGradient){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function eventIcon(ctx:CanvasRenderingContext2D,x:number,y:number,kind:'calendar'|'pin'){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=B.yellow;ctx.lineWidth=2.8;
  if(kind==='calendar'){ctx.strokeRect(0,4,27,25);ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(27,12);ctx.moveTo(7,0);ctx.lineTo(7,8);ctx.moveTo(20,0);ctx.lineTo(20,8);ctx.stroke();for(let r=0;r<2;r++)for(let c=0;c<3;c++){ctx.fillStyle=B.yellow;ctx.fillRect(5+c*7,17+r*6,3,3);}}
  else{ctx.beginPath();ctx.moveTo(14,32);ctx.bezierCurveTo(9,24,0,15,2,8);ctx.bezierCurveTo(5,-4,24,-4,27,8);ctx.bezierCurveTo(30,15,19,26,14,32);ctx.fillStyle=B.yellow;ctx.fill();ctx.beginPath();ctx.arc(14,10,5,0,Math.PI*2);ctx.fillStyle='#540B21';ctx.fill();}ctx.restore();
}
/** Recolor only green atmospheric pixels; gold, ivory, red and artwork remain intact. */
function drawBurgundyAtmosphere(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const surface = layer.getContext('2d', { willReadFrequently: true });
  if (!surface) throw new Error('Poster background rendering is unavailable.');
  drawAtmosphere(surface, w, h);
  const image = surface.getImageData(0, 0, w, h);
  const pixels = image.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    // Only green/cyan-green tones are mapped. Yellow/gold and red are preserved.
    if (g > r * 1.13 && g > b * 1.12 && g - r > 7) {
      const light = Math.max(r, g, b) / 255;
      const depth = Math.min(1, Math.max(0, (g - r) / 100));
      const intensity = Math.min(1, light * 0.88 + depth * 0.2);
      pixels[i] = Math.round(48 + 105 * intensity);
      pixels[i + 1] = Math.round(3 + 18 * intensity);
      pixels[i + 2] = Math.round(15 + 37 * intensity);
    } else if (g >= r && g >= b && r < 55 && g < 85 && b < 65) {
      // Near-black forest pixels should also become dark wine, not remain green.
      const light = g / 85;
      pixels[i] = Math.round(35 + 43 * light);
      pixels[i + 1] = Math.round(3 + 8 * light);
      pixels[i + 2] = Math.round(11 + 15 * light);
    }
  }
  surface.putImageData(image, 0, 0);
  ctx.drawImage(layer, 0, 0);
}

export interface PosterOptions { participant:Participant; format:Format; photo:HTMLImageElement|null; crop:Crop; qr:boolean }
export async function renderPoster(canvas:HTMLCanvasElement,options:PosterOptions):Promise<void>{
  const logo=await loadAssets();const {format,participant:p,photo,crop,qr}=options;
  const {width:w,height:h}=FORMATS[format];canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is unavailable in this browser.');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const square=format==='square',story=format==='story';
  drawBurgundyAtmosphere(ctx,w,h);
  const logoWidth=square?190:265;ctx.drawImage(logo,78,square?30:44,logoWidth,logoWidth*logo.naturalHeight/logo.naturalWidth);
  text(ctx,EVENT.year,110,square?174:235,square?20:24,B.white,400,'Trophy');
  // Unified conference theme: one deliberate eyebrow and one Trophy headline.
  const themeX = square ? 664 : 650;
  const themeW = 365;
  displayWord(ctx, 'BEYOND THE', themeX, square ? 51 : 66, square ? 19 : 21, 1.5, '#EDD18A', themeW, 600);
  text(ctx, 'VISION.', themeX, square ? 84 : 99, square ? 47 : 52, '#FFFCED', 400, 'Trophy');
  textBox(ctx, EVENT.themeDetail, themeX, square ? 153 : 172, themeW, 66, square ? 16 : 17, 13, '#F2DBD8', 400, 3);
  const themeRule = ctx.createLinearGradient(themeX, 0, themeX + themeW, 0);
  themeRule.addColorStop(0, '#F29E07AA');
  themeRule.addColorStop(1, '#F5CB0300');
  ctx.fillStyle = themeRule;
  ctx.fillRect(themeX, square ? 229 : 259, themeW, 1);

  // Reduce the main headline while retaining its existing position and visual identity.
  const headlineY = square ? 250 : story ? 354 : 328;
  const headlineSize = square ? 91 : 99;
  displayWord(ctx, 'I’M', 80, headlineY - 44, square ? 22 : 24, 2.6, B.gold, 140, 600);
  ctx.fillStyle = B.red;
  ctx.fillRect(78, headlineY - 45, 2, square ? 20 : 22);
  const enamel = ctx.createLinearGradient(0, headlineY, 0, headlineY + headlineSize * .85);
  enamel.addColorStop(0, '#FFFEF4');
  enamel.addColorStop(.33, '#FFFFFF');
  enamel.addColorStop(.66, '#F4F5E8');
  enamel.addColorStop(.87, '#E3E9D9');
  enamel.addColorStop(1, '#D3B96F');
  const announcementWidth = displayWord(ctx, 'SPEAKING', 74, headlineY, headlineSize, 1.2, enamel, 750);
  const signatureRule = ctx.createLinearGradient(78, 0, 78 + announcementWidth * .28, 0);
  signatureRule.addColorStop(0, B.gold);
  signatureRule.addColorStop(1, '#F5CB0300');
  ctx.fillStyle = signatureRule;
  ctx.fillRect(78, headlineY + headlineSize * .8 + 14, announcementWidth * .28, 2);
  // Speaker distinction sits in the clear left column, below the announcement.
  // Keep this separate from the headline, portrait, event details and nameplate.
  const badgeX=78, badgeY=square?375:story?448:458, badgeW=300, badgeH=39;
  const badgeGold=ctx.createLinearGradient(badgeX,badgeY,badgeX+badgeW,badgeY);
  badgeGold.addColorStop(0,'#FBE5A1');badgeGold.addColorStop(.55,'#EAC15B');badgeGold.addColorStop(1,'#C9922C');
  ctx.save();ctx.shadowColor='#21030E88';ctx.shadowBlur=15;ctx.shadowOffsetY=5;
  ctx.beginPath();ctx.roundRect(badgeX,badgeY,badgeW,badgeH,19);
  ctx.fillStyle=badgeGold;ctx.fill();ctx.restore();
  // Microphone icon, drawn in Canvas so no new font or external asset is required.
  ctx.save();ctx.translate(badgeX+20,badgeY+9);ctx.strokeStyle='#4B0B20';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.roundRect(4,0,11,17,5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,10);ctx.arc(9.5,10,10,Math.PI,0,true);ctx.moveTo(9.5,20);ctx.lineTo(9.5,25);ctx.moveTo(3,25);ctx.lineTo(16,25);ctx.stroke();ctx.restore();
  text(ctx,'FEATURED SPEAKER',badgeX+51,badgeY+9,18,'#4B0B20',700);
  const frame = portraitFrame(format);
  const plate = nameplateFrame(format); // Fixed height, regardless of optional fields.
  // Broad gold arch separates the portrait from the burgundy artwork; the photo is never stretched.
  const gold=ctx.createLinearGradient(frame.x,frame.y,frame.x+frame.w,frame.y+frame.h);
  gold.addColorStop(0,'#C38B20');gold.addColorStop(.2,'#F5CB03');gold.addColorStop(.38,'#FFF1AE');gold.addColorStop(.57,'#E6B62C');gold.addColorStop(.83,'#F5CB03');gold.addColorStop(1,'#BD7A18');
  ctx.save();ctx.shadowColor='#26041090';ctx.shadowBlur=32;ctx.shadowOffsetY=14;
  arch(ctx,frame.x-14,frame.y-14,frame.w+28,frame.h+14);ctx.fillStyle=gold;ctx.fill();ctx.restore();
  ctx.strokeStyle='#FFF2BA90';ctx.lineWidth=1.3;ctx.stroke();
  ctx.strokeStyle='#F5CB03AA';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(frame.x+frame.w/2,frame.y+frame.w/2+60,frame.w/2+40,Math.PI*1.1,Math.PI*1.7);ctx.stroke();
  ctx.save();arch(ctx,frame.x,frame.y,frame.w,frame.h);ctx.clip();
  ctx.fillStyle='#E5CE73';ctx.fillRect(frame.x,frame.y,frame.w,frame.h);
  if(photo){const pos=imagePlacement(photo.naturalWidth,photo.naturalHeight,frame.w,frame.h,crop);ctx.drawImage(photo,frame.x+pos.x,frame.y+pos.y,pos.w,pos.h);}
  else{
   ctx.fillStyle='#D6B951';ctx.beginPath();ctx.arc(frame.x+frame.w*.52,frame.y+frame.h*.32,frame.w*.15,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(frame.x+frame.w*.52,frame.y+frame.h*.94,frame.w*.38,frame.h*.4,0,0,Math.PI*2);ctx.fill();
   text(ctx,'YOUR PHOTO HERE',frame.x+frame.w*.21,frame.y+frame.h*.59,26,'#540B21',600);
  }ctx.restore();
  arch(ctx,frame.x,frame.y,frame.w,frame.h);ctx.strokeStyle='#FFF8D450';ctx.lineWidth=1.1;ctx.stroke();
  // Upper-right geometric accent and fine contour around the portrait.
  const prism=ctx.createLinearGradient(900,frame.y,1028,frame.y+90);prism.addColorStop(0,B.yellow);prism.addColorStop(1,B.gold);polygon(ctx,[[965,frame.y+18],[1028,frame.y+80],[902,frame.y+80]],prism);polygon(ctx,[[965,frame.y+18],[991,frame.y+44],[939,frame.y+44]],B.red);polygon(ctx,[[939,frame.y+44],[965,frame.y+80],[902,frame.y+80]],'#A56C1580');
  const infoY=square?422:story?506:554;
  eventIcon(ctx,78,infoY+1,'calendar');text(ctx,EVENT.shortDate,126,infoY,square?24:26,B.white,600);text(ctx,EVENT.time,126,infoY+40,22,'#F7E7E3',400);
  const venueX=story?590:126,venueY=story?infoY:infoY+116;
  if(!story){ctx.strokeStyle='#DCC57538';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(91,infoY+47);ctx.lineTo(91,venueY-15);ctx.stroke();}
  eventIcon(ctx,story?542:78,venueY+1,'pin');textBox(ctx,EVENT.venue,venueX,venueY,story?400:square?300:250,76,square?25:26,20,B.white,600,2);
  textBox(ctx,EVENT.venueLocation+', Nigeria',venueX,venueY+(story?43:78),story?400:270,75,22,16,'#F7E7E3',400,3);
  // Sparse gold dots and a folded red/gold ribbon echo the reference without copying its artwork.
  ctx.fillStyle='#F5CB03AA';for(let r=0;r<5;r++)for(let c=0;c<6;c++)ctx.fillRect(24+c*16,plate.y-88+r*16,2,2);
  polygon(ctx,[[0,plate.y+44],[210,plate.y+plate.h+30],[142,plate.y+plate.h+30],[0,plate.y+112]],B.red);
  polygon(ctx,[[0,plate.y+112],[142,plate.y+plate.h+30],[200,plate.y+plate.h+30],[58,plate.y+112]],B.gold);
  drawLagosWaterfront(ctx,h);
  // Sculpted, softly lit nameplate; the right contour echoes the portrait arch.
  ctx.save();ctx.shadowColor='#26041055';ctx.shadowBlur=28;ctx.shadowOffsetY=13;
  const x=plate.x,y=plate.y;ctx.beginPath();ctx.moveTo(x+24,y);ctx.lineTo(x+635,y);
  ctx.bezierCurveTo(x+758,y,x+814,y+plate.h*.18,x+865,y+plate.h*.4);
  ctx.bezierCurveTo(x+883,y+plate.h*.48,x+878,y+plate.h*.54,x+861,y+plate.h*.61);
  ctx.bezierCurveTo(x+791,y+plate.h*.9,x+726,y+plate.h,x+620,y+plate.h);
  ctx.lineTo(x+24,y+plate.h);ctx.quadraticCurveTo(x,y+plate.h,x,y+plate.h-24);ctx.lineTo(x,y+24);ctx.quadraticCurveTo(x,y,x+24,y);
  const paper=ctx.createLinearGradient(x,y,x+300,y+plate.h);paper.addColorStop(0,'#FFFDF5');paper.addColorStop(.5,'#F6F3E5');paper.addColorStop(1,'#EAE7D7');ctx.fillStyle=paper;ctx.fill();ctx.restore();
  ctx.strokeStyle='#FFFDF1C0';ctx.lineWidth=1.4;ctx.stroke();
  // Lay out name/title/organization inside a fixed-size panel.
  // Each field is fitted independently, and the full stack is vertically scaled if necessary.
  const tx = x + 43;
  const insetTop = square ? 17 : 20;
  const insetBottom = square ? 14 : 17;
  const maxTextHeight = plate.h - insetTop - insetBottom;
  const hasTitle = !!p.title.trim();
  const hasOrganization = !!p.organization.trim();
  const textWidth = plate.textWidth;
  const name = p.name.trim() || 'Your name';
  const measure = (value: string, size: number, weight: number) => {
    ctx.font = `${weight} ${size}px "General Sans"`;
    return ctx.measureText(value).width;
  };
  type Fitted = { lines: string[]; size: number; color: string; weight: number };
  const fitted = (value: string, initial: number, min: number, maxLines: number, color: string, weight: number): Fitted => {
    const result = fitText(value, textWidth, maxLines, initial, min, (line, size) => measure(line, size, weight));
    return { ...result, lines: result.lines.slice(0, maxLines), color, weight };
  };
  const fields: Fitted[] = [
    fitted(name, square ? 43 : 51, 19, 2, '#540B21', 650),
  ];
  if (hasTitle) fields.push(fitted(p.title.trim(), square ? 20 : 24, 12, 2, '#540B21', 400));
  if (hasOrganization) fields.push(fitted(p.organization.trim(), square ? 18 : 22, 12, 2, '#77505B', 400));
  const lineHeight = (field: Fitted) => field.size * 1.16;
  const fieldHeight = (field: Fitted) => field.lines.length * lineHeight(field);
  const gaps = fields.length > 1 ? 10 + (fields.length - 2) * 5 : 0;
  const totalHeight = fields.reduce((sum, field) => sum + fieldHeight(field), 0) + gaps;
  const scaleY = Math.min(1, maxTextHeight / Math.max(1, totalHeight));
  ctx.save();
  ctx.translate(0, y + insetTop);
  ctx.scale(1, scaleY);
  let cursor = 0;
  fields.forEach((field, fieldIndex) => {
    ctx.font = `${field.weight} ${field.size}px "General Sans"`;
    ctx.fillStyle = field.color;
    ctx.textBaseline = 'top';
    field.lines.forEach((line, lineIndex) => ctx.fillText(line, tx, cursor + lineIndex * lineHeight(field)));
    cursor += fieldHeight(field);
    if (fieldIndex === 0 && fields.length > 1) {
      cursor += 4;
      const rule = ctx.createLinearGradient(tx, 0, tx + 75, 0);
      rule.addColorStop(0, B.gold);
      rule.addColorStop(1, '#F5CB0300');
      ctx.fillStyle = rule;
      ctx.fillRect(tx, cursor, 75, 2);
      cursor += 8;
    } else if (fieldIndex < fields.length - 1) {
      cursor += 5;
    }
  });
  ctx.restore();
  // Website stays on a quiet strip; the illustration remains to its right.
  ctx.strokeStyle=B.yellow;ctx.lineWidth=2;ctx.beginPath();ctx.arc(89,h-48,14,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(89,h-48,6,14,0,0,Math.PI*2);ctx.moveTo(75,h-48);ctx.lineTo(103,h-48);ctx.stroke();
  text(ctx,EVENT.websiteLabel,124,h-59,22,B.white,400);
  if(qr){const code=QRCode.create(EVENT.website,{errorCorrectionLevel:'M'}),cell=2,size=(code.modules.size+8)*cell,qx=w-size-22,qy=h-size-15;ctx.fillStyle=B.white;ctx.fillRect(qx,qy,size,size);ctx.fillStyle='#540B21';for(let r=0;r<code.modules.size;r++)for(let c=0;c<code.modules.size;c++)if(code.modules.get(r,c))ctx.fillRect(qx+(c+4)*cell,qy+(r+4)*cell,cell,cell);}
}
export function canvasBlob(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not create the PNG. Please try again.')),'image/png'));}
