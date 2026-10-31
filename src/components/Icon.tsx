import type { CSSProperties } from 'react';
export function Icon({name,size=20,style}:{name:'arrow'|'download'|'upload'|'shield'|'spark'|'check'|'image'|'reset'|'close'|'move';size?:number;style?:CSSProperties}) {
 const paths = {arrow:'M7 17 17 7M7 7h10v10',download:'M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4',upload:'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',check:'m5 12 4 4L19 6',image:'M4 4h16v16H4V4Zm0 12 5-5 5 5 3-3 3 3M15 8h.01',reset:'M3 10a9 9 0 1 1 2 8M3 4v6h6',close:'m6 6 12 12M6 18 18 6',move:'M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4'};
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]}/></svg>;
}
