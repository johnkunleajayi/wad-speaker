import { describe, expect, it } from 'vitest';
import { loadPhoto } from '../lib/images';
describe('declared image content verification',()=>{
 it.each(['image/png','image/jpeg','image/webp'])('rejects HTML disguised as %s before decoding',async type=>{
  const bytes=new TextEncoder().encode('<svg><script>unsafe</script></svg>');
  const file={type,size:bytes.length,slice:()=>({arrayBuffer:async()=>bytes.buffer})} as unknown as File;
  await expect(loadPhoto(file)).rejects.toThrow('does not contain a valid');
 });
});
