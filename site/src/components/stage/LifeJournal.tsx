'use client';
import { useEffect, useRef, useState } from 'react';
import { useFadingDialog } from './useFadingDialog';
type Category = 'travel' | 'everyday' | 'taste';
type Moment = { src: string; alt: string; caption: string; category: Category; location?: string };
const categories = [{key:'all',label:'ALL MOMENTS'}, {key:'travel',label:'TRAVEL'}, {key:'everyday',label:'EVERYDAY'}, {key:'taste',label:'TASTE'}] as const;
const previewMoments: Moment[] = Array.from({length:6},(_,i)=>({ src:`/images/life/placeholders/photo-${i+1}.svg`, alt:`Life photograph placeholder ${i+1}`, caption:['A place to remember','An ordinary afternoon','Something worth tasting','A different horizon','The little in-between','A table of memories'][i], category:(['travel','everyday','taste'] as Category[])[i%3] }));
function validMoment(value:unknown): value is Moment {
  if(!value || typeof value!=='object') return false;
  const item=value as Record<string,unknown>;
  return typeof item.src==='string' && item.src.startsWith('/images/') && typeof item.alt==='string' && typeof item.caption==='string' && ['travel','everyday','taste'].includes(String(item.category)) && (item.location===undefined || typeof item.location==='string');
}
export function LifeJournal({open,onClose}:{open:boolean;onClose:()=>void}) {
  const [moments,setMoments]=useState<Moment[]>(previewMoments),[preview,setPreview]=useState(true);
  const [category,setCategory]=useState<'all'|Category>('all'),[selected,setSelected]=useState<Moment|null>(null);
  const source=useRef<HTMLButtonElement|null>(null),back=useRef<HTMLButtonElement>(null);
  const {dialog,close}=useFadingDialog(open?'weaver-life':null,onClose);
  useEffect(()=>{
    if(!open) return;
    setCategory('all');setSelected(null);
    const controller=new AbortController();
    void fetch('/images/life/photos.json',{signal:controller.signal}).then(async response=>{
      if(!response.ok) return;
      const data:unknown=await response.json();
      if(Array.isArray(data)&&data.length&&data.every(validMoment)&&!controller.signal.aborted){setMoments(data);setPreview(false);}
    }).catch(()=>{});
    return()=>controller.abort();
  },[open]);
  useEffect(()=>{if(selected)back.current?.focus();},[selected]);
  const closePhoto=()=>{setSelected(null);requestAnimationFrame(()=>source.current?.focus());};
  const visible=category==='all'?moments:moments.filter(item=>item.category===category);
  return <dialog ref={dialog} className="life-journal skill-exhibition" aria-labelledby="life-journal-title" onCancel={event=>{event.preventDefault();if(selected)closePhoto();else close();}}>
    {open&&<>
      <div className="life-journal-body" inert={!!selected}>
        <button className="skill-exhibition-close" autoFocus onClick={close} aria-label="Close life journal">CLOSE ×</button>
        <header className="life-journal-heading"><p>WEAVER / A PERSONAL JOURNAL</p><h2 id="life-journal-title">Life, <em>woven together.</em></h2><p>Places I wander. Days I keep. Little things I love.</p></header>
        <nav className="life-categories" aria-label="Life photo categories">{categories.map(item=><button key={item.key} aria-pressed={category===item.key} onClick={()=>setCategory(item.key)}>{item.label}</button>)}</nav>
        {preview&&<p className="life-preview-note">PHOTO PLACEHOLDERS / YOUR MOMENTS WILL LIVE HERE</p>}
        <div className="life-photo-grid">{visible.map((moment,index)=><button className={`life-photo-tile tile-${index%4}`} key={moment.src} onClick={event=>{source.current=event.currentTarget;setSelected(moment);}} aria-label={`Enlarge life photo: ${moment.caption}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={moment.src} alt={moment.alt} loading="lazy"/><span><small>{moment.category.toUpperCase()}{moment.location?` / ${moment.location}`:''}</small><span>{moment.caption}</span></span>
        </button>)}</div>
        <footer className="life-journal-footer">Not every moment needs a reason to be remembered.</footer>
      </div>
      {selected&&<div className="skill-photo-lightbox" role="region" aria-label="Enlarged life photo"><button ref={back} className="skill-photo-back" onClick={closePhoto}>BACK TO JOURNAL ×</button><figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selected.src} alt={selected.alt}/><figcaption>{selected.caption}</figcaption></figure></div>}
    </>}
  </dialog>;
}
