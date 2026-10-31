/** Original Lagos architectural montage. Study sources are documented in LAGOS-ARTWORK.md.
 * Photographs are never embedded; geometry and materials are drawn locally and deterministically.
 */
export function drawLagosWaterfront(ctx: CanvasRenderingContext2D, height: number) {
  ctx.save();
  const scale=.76, baseline=height-23;
  ctx.translate(305,baseline-195*scale);ctx.scale(scale,scale);
  const line=(points:number[][],color:string,width=1)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  const poly=(points:number[][],fill:string|CanvasGradient,stroke?:string)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};
  const gold='#EBCB6D',edge='#F5CB03',haze=ctx.createRadialGradient(800,135,5,800,135,255);haze.addColorStop(0,'#149A5370');haze.addColorStop(1,'#149A5300');ctx.fillStyle=haze;ctx.fillRect(450,-35,550,265);
  // Receding Marina frontage: varied parapets, louvres and waterfront podiums.
  for(const [x,y,w,h] of [[590,120,45,69],[641,98,31,92],[681,111,34,79],[858,115,33,74],[907,119,29,72]]){
    const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'#0C5F40');g.addColorStop(1,'#002D20');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);line([[x,y+h],[x,y],[x+w,y]],'#94AB5970');for(let r=y+8;r<y+h;r+=9)line([[x+3,r],[x+w-3,r]],'#D8C87945');
  }
  // NECOM House: stepped modernist slab, central cylindrical service tower,
  // circular communications crown and slender antenna; not a generic spired box.
  poly([[718,187],[718,64],[736,56],[790,56],[804,66],[804,187]],'#064C34',gold);
  poly([[790,56],[804,66],[804,187],[790,187]],'#002D20');
  for(let y=70;y<180;y+=8){line([[721,y],[789,y]],'#D7D39890',1.2);for(let x=727;x<788;x+=9)line([[x,y-4],[x,y+2]],'#163F2A',2.5);}
  const shaft=ctx.createLinearGradient(749,0,765,0);shaft.addColorStop(0,'#7C8D44');shaft.addColorStop(.5,'#E0CA7C');shaft.addColorStop(1,'#365D32');ctx.fillStyle=shaft;ctx.fillRect(749,45,16,142);
  ctx.fillStyle='#C4B971';ctx.beginPath();ctx.ellipse(757,43,18,7,0,0,Math.PI*2);ctx.fill();ctx.fillRect(739,33,36,11);ctx.fillStyle='#6F8044';ctx.beginPath();ctx.ellipse(757,33,18,6,0,0,Math.PI*2);ctx.fill();
  poly([[751,30],[753,1],[761,1],[764,30]],'#9DAD67',gold);for(let y=5;y<29;y+=5)line([[753,y],[762,y+3]],'#F9E9A090');line([[757,0],[757,-8]],gold,1.3);
  // Civic Towers: green glass planes, projecting podium, stepped crown and lattice spire.
  const glass=ctx.createLinearGradient(911,0,990,0);glass.addColorStop(0,'#1A7950');glass.addColorStop(.55,'#0C4833');glass.addColorStop(1,'#002919');
  poly([[909,174],[909,64],[949,52],[988,63],[988,174]],glass,gold);poly([[949,52],[988,63],[988,174],[949,174]],'#003E2C');
  for(let x=917;x<986;x+=8)line([[x,66],[x,171]],'#99AC6260');for(let y=71;y<172;y+=7)line([[912,y],[986,y]],'#C0C77645');
  poly([[900,174],[996,174],[996,190],[900,190]],'#22583A',gold);poly([[939,52],[939,42],[959,42],[959,52]],'#5B8451',gold);
  poly([[935,42],[945,31],[949,1],[952,31],[964,42]],'#375E3A',gold);for(let y=9;y<37;y+=5)line([[946-(y-9)*.22,y],[952+(y-9)*.22,y]],'#F0D986B0');line([[949,-6],[949,1]],edge,1.4);
  // Victoria Island Civic Centre: inverted-terrace section with a flying steel arch.
  poly([[448,152],[588,146],[575,186],[468,186]],'#11563A',gold);
  for(let y=155;y<184;y+=9)line([[451+(y-152)*.5,y],[585-(y-152)*.32,y-3]],'#D7CF7B90',1.2);
  ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(435,155);ctx.bezierCurveTo(468,83,551,90,602,148);ctx.stroke();ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(439,157);ctx.bezierCurveTo(470,93,550,100,599,151);ctx.stroke();
  for(let i=0;i<9;i++){const t=i/8,x=441+154*t,y=151-42*Math.sin(Math.PI*t);line([[x,y],[454+128*t,153]],'#F1D88090',1);}
  line([[466,185],[452,150],[479,181],[486,148],[504,180],[521,147],[531,179],[555,145],[561,178],[585,146]],'#D8BC5FA0',1.4);
  // Lekki–Ikoyi Link Bridge: open twin tips, coupled upper shaft and flared legs.
  // Fourteen cables on each side retain the researched fan arrangement.
  ctx.save();
  // Lower viewpoint in the square crop keeps the forked pylon clear of the nameplate.
  if(height===1080){ctx.translate(0,195*.32);ctx.scale(1,.68);}
  for(let i=0;i<14;i++){
    const anchorY=86+i*3.9;
    line([[293+i*.15,anchorY],[20+i*17,194]],i%3===0?'#FFE29BC0':'#E9C96E80',i%3===0?1.5:1);
    line([[313-i*.15,anchorY],[365+i*20,194]],i%3===0?'#FFE29BC0':'#E9C96E80',i%3===0?1.5:1);
  }
  const concrete=ctx.createLinearGradient(263,0,340,0);concrete.addColorStop(0,'#BAA75A');concrete.addColorStop(.4,'#FAE9A5');concrete.addColorStop(1,'#7C853A');
  poly([[278,61],[294,73],[303,129],[275,205],[258,205],[287,126]],concrete,gold);
  poly([[324,61],[309,74],[300,129],[327,205],[344,205],[315,126]],concrete,gold);
  for(const y of [89,102,115])poly([[292,y],[313,y],[314,y+5],[292,y+5]],'#F0D382',gold);
  line([[280,65],[292,128],[263,203]],'#FFF2B9C0',1.2);line([[323,65],[310,128],[340,203]],'#F5DF89B0',1.2);
  // Deck thickness, parapets, piers, repeated road lights and reflected illumination.
  poly([[0,193],[310,190],[688,196],[688,202],[307,197],[0,201]],'#42612E',gold);
  line([[0,191],[310,188],[688,194]],'#FFF0AC',1.5);for(const x of [40,148,460,596])poly([[x,201],[x+9,201],[x+12,218],[x-3,218]],'#355531','#ABAB5660');
  for(let x=28;x<680;x+=38){const y=x<310?190:193;line([[x,y],[x,y-19],[x+4,y-22]],'#F4DC8BA0',.9);ctx.save();ctx.shadowColor='#FFD854';ctx.shadowBlur=7;ctx.fillStyle='#FFF1AD';ctx.beginPath();ctx.arc(x+4,y-22,1.5,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.restore();
  line([[0,218],[1000,218]],'#8EAF6570');
  for(let row=0;row<3;row++){const alpha=Math.round(52-row*5).toString(16).padStart(2,'0');for(const [x,w] of [[276,54],[734,47],[930,62],[473,88]]){ctx.strokeStyle='#F5CB03'+alpha;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-row*2,220+row*2);ctx.lineTo(x+w+row*2,220+row*2);ctx.stroke();}}
  ctx.restore();
}

export function drawAtmosphere(ctx:CanvasRenderingContext2D,w:number,h:number){
  const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,'#001707');base.addColorStop(.4,'#003F27');base.addColorStop(.7,'#002D1A');base.addColorStop(1,'#001C0C');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(w*.79,h*.56,15,w*.79,h*.56,w*.78);glow.addColorStop(0,'#149A5380');glow.addColorStop(.45,'#11844B25');glow.addColorStop(1,'#001F0100');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(w+120-i*40,-120);ctx.bezierCurveTo(w*.3-i*75,h*.22,w*.42-i*90,h*.57,-130,h*.77+i*70);ctx.lineTo(-130,h);ctx.bezierCurveTo(w*.5,h*.61,w*.5,h*.19,w+150,-70);ctx.closePath();const sweep=ctx.createLinearGradient(0,0,w,h);sweep.addColorStop(0,'#002912B0');sweep.addColorStop(.5,i%2?'#149A5330':'#001F0170');sweep.addColorStop(1,'#0C7D4110');ctx.fillStyle=sweep;ctx.fill();}
  ctx.save();ctx.strokeStyle='#C6CF7E0D';ctx.lineWidth=.7;for(let i=0;i<23;i++){ctx.beginPath();ctx.moveTo(w*.75+i*12,-5);ctx.bezierCurveTo(w*.73+i*11,h*.31,w*.52+i*16,h*.64,w+20,h*.9+i*7);ctx.stroke();}ctx.restore();
  const light=ctx.createRadialGradient(40,0,0,40,0,w*.75);light.addColorStop(0,'#7AAB6A15');light.addColorStop(1,'#001F0100');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
  // Fixed seed gives a subtle print-grain texture without random exports.
  let seed=2026;ctx.fillStyle='#D9E8B50A';for(let i=0;i<7500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%w;seed=(seed*1664525+1013904223)>>>0;const y=seed%h;ctx.fillRect(x,y,.7,.7);}
  const vignette=ctx.createRadialGradient(w*.55,h*.45,w*.3,w*.55,h*.45,w*1.1);vignette.addColorStop(0,'#00130000');vignette.addColorStop(1,'#00100080');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}
