import { useLayoutEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../components/PosterPreview',()=>({PosterPreview:({onReady}:{onReady:(value:HTMLCanvasElement)=>void})=>{useLayoutEffect(()=>onReady(document.createElement('canvas')),[onReady]);return <div>Poster preview</div>;}}));
vi.mock('../lib/images',()=>({loadPhoto:vi.fn(async()=>({naturalWidth:800,naturalHeight:1200,src:'data:image/png;base64,AA=='}))}));
vi.mock('../lib/renderer',()=>({canvasBlob:vi.fn()}));
import { canvasBlob } from '../lib/renderer';
import App from '../App';
async function fillRequired(){
 const user=userEvent.setup();await user.type(screen.getByRole('textbox',{name:/Full name/}),'Ada Okonkwo');fireEvent.change(screen.getByLabelText('Choose photograph'),{target:{files:[new File(['abc'],'photo.png',{type:'image/png'})]}});await waitFor(()=>expect(screen.getByAltText('Your selected photograph')).toBeVisible());return user;
}
describe('attendee poster generator',()=>{
 it('shows a compact generator without a disclaimer or extra fields',()=>{render(<App/>);expect(screen.queryByText(/Not affiliated with or endorsed/)).not.toBeInTheDocument();expect(screen.getByRole('button',{name:/Generate & Download Poster/})).toBeDisabled();expect(screen.getByRole('heading',{level:1,name:'WAD 2026 Attendee Poster Generator'})).toBeVisible();expect(screen.getAllByRole('textbox')).toHaveLength(3);expect(screen.queryByRole('textbox',{name:/LinkedIn/})).not.toBeInTheDocument();expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();expect(screen.queryByText(/The vision is bigger/)).not.toBeInTheDocument();});
 it('validates the required name live and retains optional details',async()=>{const user=userEvent.setup();render(<App/>);const name=screen.getByRole('textbox',{name:/Full name/});await user.click(name);await user.tab();expect(screen.getByText('Please enter your full name.')).toBeVisible();await user.type(name,'Ada Okonkwo');expect(screen.queryByText('Please enter your full name.')).not.toBeInTheDocument();await user.type(screen.getByRole('textbox',{name:/Professional title/}),'Architect');await user.type(screen.getByRole('textbox',{name:/Organization/}),'Dreamers');expect(screen.getByRole('textbox',{name:/Professional title/})).toHaveValue('Architect');});
 it('defaults to portrait and switches formats accessibly',async()=>{const user=userEvent.setup();render(<App/>);expect(screen.getByRole('radio',{name:'Portrait'})).toBeChecked();for(const name of [/Square/,/Story/,/Portrait/]){const radio=screen.getByRole('radio',{name});await user.click(radio);expect(radio).toBeChecked();}expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();});
 it('adjusts, resets and removes a photo',async()=>{render(<App/>);const user=await fillRequired();const zoom=screen.getByRole('slider',{name:/Zoom/});fireEvent.change(zoom,{target:{value:'2'}});expect(screen.getByText('2.00×')).toBeVisible();await user.click(screen.getByText('Adjust position'));await user.click(screen.getByRole('button',{name:/Reset crop/}));expect(zoom).toHaveValue('1');await user.click(screen.getByRole('button',{name:'Remove'}));expect(screen.queryByAltText('Your selected photograph')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:/Generate & Download Poster/})).toBeDisabled();});
 it('recovers from export failure',async()=>{vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:vi.fn()} as unknown as CanvasRenderingContext2D);vi.mocked(canvasBlob).mockRejectedValue(new Error('encode failed'));render(<App/>);const user=await fillRequired();await user.click(screen.getByRole('button',{name:/Generate & Download Poster/}));expect(await screen.findByText(/We could not download the PNG/)).toBeVisible();expect(screen.getByRole('button',{name:/Generate & Download Poster/})).toBeEnabled();});
});

it('shows export progress, downloads a named PNG and cleans up the URL',async()=>{
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:vi.fn()} as unknown as CanvasRenderingContext2D);
 let finish!:(blob:Blob)=>void;vi.mocked(canvasBlob).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 const create=vi.fn(()=> 'blob:test-download'),revoke=vi.fn();const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;URL.createObjectURL=create;URL.revokeObjectURL=revoke;
 let downloadedName='';vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){downloadedName=this.download;});
 try{
  const {unmount}=render(<App/>);const user=await fillRequired();await user.click(screen.getByRole('button',{name:/Generate & Download Poster/}));expect(screen.getByRole('button',{name:/Preparing your PNG/})).toBeDisabled();finish(new Blob(['png'],{type:'image/png'}));await screen.findByText(/Your PNG is ready/);expect(downloadedName).toBe('WAD2026-Ada-Okonkwo-Attending.png');expect(create).toHaveBeenCalledOnce();unmount();expect(revoke).toHaveBeenCalledWith('blob:test-download');
 }finally{URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;}
});
