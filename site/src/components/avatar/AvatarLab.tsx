'use client';
import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '../settings/PreferencesProvider';
import type { AvatarController } from './runtime';
import './avatar.css';

const copy = {
  zh: {title:'人物小样',note:'真实 3D · 第一版造型试验',description:'先看看空间中的我。黑框眼镜、银白挂耳染与一点点态度。',status:'这是几何小样，相似度与最终表情还在打磨。',front:'正面',left:'左侧面',right:'右侧面',pause:'暂停动作',play:'播放动作',hint:'移动鼠标轻轻转头 · 横向拖动转身 · 方向键旋转，Home 回正',loading:'正在加载人物…',error:'模型暂时无法加载，已显示造型参考。',retry:'重新加载',back:'返回个人世界',reference:'造型参考',download:'下载模型 GLB',label:'可交互的三维人物小样'},
  en: {title:'CHARACTER STUDY',note:'REAL 3D · FIRST SHAPE STUDY',description:'A first look at me in space. Black frames, a silver streak, and a little attitude.',status:'An early geometry study. Likeness and the final expression are still being refined.',front:'FRONT',left:'LEFT VIEW',right:'RIGHT VIEW',pause:'Pause motion',play:'Play motion',hint:'Move to turn the head · Drag sideways to rotate · Arrow keys turn, Home resets',loading:'Loading character…',error:'The model is unavailable. A styling reference is shown.',retry:'Retry',back:'BACK TO MY WORLD',reference:'Styling reference',download:'DOWNLOAD GLB',label:'Interactive three-dimensional character study'}
};

export function AvatarLab() {
  const {theme,locale}=usePreferences(), text=copy[locale];
  const host=useRef<HTMLDivElement>(null), controller=useRef<AvatarController|null>(null);
  const preferences=useRef({theme,paused:false});
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [paused,setPaused]=useState(false),[attempt,setAttempt]=useState(0);
  preferences.current={theme,paused};
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setPaused(media.matches);update();media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    let cancelled=false;setState('loading');
    import('./runtime').then(({createAvatar})=>{
      if(cancelled)return;
      try {controller.current=createAvatar(host.current!,preferences.current.theme,preferences.current.paused,s=>{if(!cancelled)setState(s);});}
      catch {if(!cancelled)setState('error');}
    }).catch(()=>{if(!cancelled)setState('error');});
    return()=>{cancelled=true;controller.current?.dispose();controller.current=null;};
  },[attempt]);
  useEffect(()=>{controller.current?.setTheme(theme);},[theme]);
  useEffect(()=>{controller.current?.setPaused(paused);},[paused]);
  return <main className="avatar-lab">
    <div className="avatar-lab-heading"><p className="eyebrow">PAPERY · {text.note}</p><h1>{text.title}</h1><p>{text.description}</p></div>
    <div className="avatar-canvas" ref={host} data-state={state} tabIndex={0} role="region" aria-label={text.label}>
      {state!=='ready'&&<div className="avatar-fallback">
        {state==='error'&&<img src={`/images/intro-${theme}-silver-v5.png`} alt={text.reference} />}
        <p role="status">{state==='error'?text.error:text.loading}</p>
      </div>}
    </div>
    <div className="avatar-toolbar">
      <button onClick={()=>controller.current?.setView(-.6)} disabled={state!=='ready'}>{text.left}</button>
      <button onClick={()=>controller.current?.setView(0)} disabled={state!=='ready'}>{text.front}</button>
      <button onClick={()=>controller.current?.setView(.6)} disabled={state!=='ready'}>{text.right}</button>
      <button onClick={()=>setPaused(p=>!p)} aria-pressed={paused} disabled={state!=='ready'}>{paused?text.play:text.pause}</button>
      {state==='error'&&<button onClick={()=>setAttempt(a=>a+1)}>{text.retry}</button>}
    </div>
    <p className="avatar-hint">{text.hint}</p><p className="avatar-status">{text.status}</p>
    <div className="avatar-links"><a className="text-link" href="/#top">{text.back} <span aria-hidden="true">↗</span></a><a className="text-link" href="/models/sherry-avatar-v1.glb" download>{text.download} <span aria-hidden="true">↓</span></a></div>
  </main>;
}
