import type { Crop, Format } from '../config';
export function portraitFrame(format: Format) {
  if (format === 'story') return { x: 245, y: 655, w: 750, h: 900 };
  if (format === 'portrait') return { x: 390, y: 435, w: 640, h: 790 };
  return { x: 470, y: 350, w: 550, h: 560 };
}
export function nameplateFrame(format: Format, optionalCount: number) {
  const height = (format === 'square' ? 142 : 164) + optionalCount * (format === 'square' ? 46 : 58);
  const bottom = format === 'square' ? 980 : format === 'portrait' ? 1220 : 1740;
  return { x: 74, y: bottom - height, w: 905, h: height, textWidth: format === 'square' ? 690 : 710 };
}
export function imagePlacement(iw: number, ih: number, w: number, h: number, crop: Crop) {
  const scale = Math.max(w / iw, h / ih) * Math.max(1, Math.min(3, crop.zoom));
  const dw = Math.max(w, iw * scale), dh = Math.max(h, ih * scale);
  return {w: dw, h: dh, x: -(dw-w)*Math.min(100,Math.max(0,crop.x))/100, y: -(dh-h)*Math.min(100,Math.max(0,crop.y))/100};
}
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/u)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= maxWidth) {line = candidate; continue;}
    if (line) {lines.push(line); line = '';}
    for (const char of Array.from(word)) {
      if (line && measure(line + char) > maxWidth) {lines.push(line); line = '';}
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}
export function fitText(text: string, width: number, maxLines: number, initialSize: number, minSize: number, measureAt: (text:string,size:number)=>number) {
  let size = initialSize;
  let lines = wrapText(text, width, s=>measureAt(s,size));
  while(lines.length > maxLines && size > minSize) { size -= 1; lines = wrapText(text,width,s=>measureAt(s,size)); }
  return {size,lines};
}
