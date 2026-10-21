"use client";
import { useEffect,useRef,useState } from 'react';
import type { SiteContent,ContentSnapshot,StudioPhoto,StudioProject,StudioCity,StudioSkill } from '@/content/site-content';
import './studio.css';
import { adminFetch } from './admin-session';
import { UploadDropZone } from './upload-drop-zone';
type Tab=keyof SiteContent;type Entry=StudioProject|StudioCity|StudioSkill;
const sections:{key:Tab;name:string;en:string;note:string}[]=[{key:'projects',name:'项目',en:'01 / CRAFTER',note:'管理作品、封面和项目介绍。'},{key:'skills',name:'技能与照片',en:'02 / EXPLORER',note:'管理每项技能及它的照片展览。'},{key:'cities',name:'城市与生活',en:'03 / WEAVER',note:'每个城市一本书，收藏个人照、风景和美食。'}];
const headers={'Content-Type':'application/json','x-sherry-admin':'1'};
function Field({label,value,onChange,multiline=false,hint='',type='text'}:{label:string;value:string;onChange:(value:string)=>void;multiline?:boolean;hint?:string;type?:string}){return <label className={`studio-field ${multiline?'studio-wide':''}`}><span>{label}</span>{multiline?<textarea value={value} rows={4} onChange={event=>onChange(event.target.value)}/>:<input type={type} value={value} onChange={event=>onChange(event.target.value)}/>} {hint&&<small>{hint}</small>}</label>;}
async function upload(file:File){
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const signature=Array.from(bytes.slice(0,8)).join(',');
  const type=signature==='137,80,78,71,13,10,26,10'?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'?'image/webp':['GIF87a','GIF89a'].includes(String.fromCharCode(...bytes.slice(0,6)))?'image/gif':'';
  if(!type||file.size>15*1024*1024)throw new Error('请选择15MB以内的 JPG、PNG、WebP、GIF 图片');
  const session=await (await fetch('/api/admin/session')).json();
  let response:Response;
  if(session.cloud){
    response=await adminFetch('/api/admin/upload',{method:'POST',headers,body:JSON.stringify({name:file.name,type,size:file.size})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'上传失败');
    const uploaded=await fetch(data.uploadUrl,{method:'PUT',headers:{'Content-Type':type},body:file});
    if(!uploaded.ok)throw new Error('图片上传失败，请重试');
    return data as {src:string;name:string};
  }
  const form=new FormData();form.append('file',file);response=await adminFetch('/api/admin/upload',{method:'POST',headers:{'x-sherry-admin':'1'},body:form});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'上传失败');return data as {src:string;name:string};
}
export function AdminStudio(){
  const [snapshot,setSnapshot]=useState<ContentSnapshot|null>(null),[content,setContent]=useState<SiteContent|null>(null),[tab,setTab]=useState<Tab>('projects'),[selected,setSelected]=useState(0),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const alive=useRef(true);useEffect(()=>{alive.current=true;void adminFetch('/api/admin/content',{cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);if(alive.current){setSnapshot(data);setContent(data.content);}}).catch(error=>setError(error.message));return()=>{alive.current=false;};},[]);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  useEffect(()=>{
    const preventFileNavigation=(event:DragEvent)=>{if(event.dataTransfer&&Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();};
    window.addEventListener('dragover',preventFileNavigation);window.addEventListener('drop',preventFileNavigation);
    return()=>{window.removeEventListener('dragover',preventFileNavigation);window.removeEventListener('drop',preventFileNavigation);};
  },[]);
  const change=(next:SiteContent)=>{setContent(next);setDirty(true);setNotice('');setError('');};
  const patch=(value:Record<string,unknown>)=>{if(!content)return;const next=structuredClone(content);(next[tab] as Entry[])[selected]={...next[tab][selected],...value} as Entry;change(next);};
  const add=()=>{if(!content)return;const next=structuredClone(content),slug=`${tab==='cities'?'city':tab==='skills'?'skill':'project'}-${Date.now().toString(36)}`;
    if(tab==='projects')next.projects.push({slug,title:'NEW PROJECT',name:'New Project',category:'NEW WORK',summary:'Introduce your project.',detail:'Tell the story behind this project.',tags:[],image:'/images/stage/portfolio/lumi-cover.png',github:''});
    if(tab==='skills')next.skills.push({slug,title:'New Chapter',label:'A NEW PURSUIT',text:'Write about this part of your world.',tags:'',photos:[]});
    if(tab==='cities')next.cities.push({slug,name:'New City',title:'New City',motif:'A new horizon to keep.',color:'#392a32',ink:'#e2a5ba',photos:[]});
    change(next);setSelected(next[tab].length-1);
  };
  const remove=()=>{if(!content||!window.confirm('确定移除这一项？保存后才会更新前台；已上传的原图仍保留。'))return;const next=structuredClone(content);next[tab].splice(selected,1);change(next);setSelected(Math.max(0,selected-1));};
  const move=(from:number,to:number)=>{if(!content||to<0||to>=content[tab].length)return;const next=structuredClone(content);const list=next[tab] as Entry[];[list[from],list[to]]=[list[to],list[from]];change(next);setSelected(to);};
  const save=async()=>{if(!content||!snapshot)return;setBusy(true);setError('');setNotice('');try{
    const normalized=structuredClone(content);normalized.projects.forEach(project=>project.tags=[...new Set(project.tags.map(tag=>tag.trim()).filter(Boolean))]);
    const response=await adminFetch('/api/admin/content',{method:'PUT',headers,body:JSON.stringify({revision:snapshot.revision,content:normalized})});const data=await response.json();if(!response.ok)throw new Error(data.error||'保存失败');setSnapshot(data);setContent(data.content);setDirty(false);setNotice('已保存。刷新前台页面即可查看。');
  }catch(error){setError((error as Error).message);}finally{setBusy(false);}};
  const uploadCover=async(files:FileList|File[]|null)=>{if(busy||!files?.length)return;setBusy(true);setError('');try{const result=await upload(files[0]);patch({image:result.src});}catch(error){setError((error as Error).message);}finally{setBusy(false);}};
  const uploadPhotos=async(files:FileList|File[]|null)=>{if(busy||!files?.length||!content)return;const item=content[tab][selected];if(!('photos'in item))return;setBusy(true);setError('');try{
    const photos=[...item.photos];for(const file of Array.from(files)){const result=await upload(file);photos.push({src:result.src,alt:file.name.replace(/\.[^.]+$/,''),caption:'',...(tab==='cities'?{category:'portrait' as const}:{})});}
    patch({photos});
  }catch(error){setError((error as Error).message);}finally{setBusy(false);}};
  const updatePhoto=(index:number,value:Partial<StudioPhoto>)=>{if(!content)return;const item=content[tab][selected];if('photos'in item)patch({photos:item.photos.map((photo,i)=>i===index?{...photo,...value}:photo)});};
  const photoAction=(index:number,action:'delete'|'up'|'down')=>{if(!content)return;const item=content[tab][selected];if(!('photos'in item))return;const photos=[...item.photos];if(action==='delete')photos.splice(index,1);else{const other=index+(action==='up'?-1:1);if(other<0||other>=photos.length)return;[photos[index],photos[other]]=[photos[other],photos[index]];}patch({photos});};
  const exportContent=()=>{if(!content)return;const link=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));link.href=url;link.download=`sherry-content-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);};
  const section=sections.find(section=>section.key===tab)!,item=content?.[tab][selected];
  const textField=(key:string,label:string,multiline=false,hint='')=><Field key={key} label={label} value={String((item as unknown as Record<string,unknown>)?.[key]??'')} multiline={multiline} hint={hint} onChange={value=>patch({[key]:value})}/>;
  return <main className="studio-shell">
    <aside className="studio-sidebar"><a href="/stage" target="_blank" rel="noreferrer" className="studio-brand">SHERRY<span>CONTENT ATELIER</span></a><p className="studio-local"><i/> 内容管理工作室</p><nav aria-label="管理板块">{sections.map(section=><button key={section.key} className={tab===section.key?'is-selected':''} onClick={()=>{setTab(section.key);setSelected(0);}} disabled={busy}><small>{section.en}</small><span>{section.name}</span><b>{content?.[section.key].length??'—'}</b></button>)}</nav><div className="studio-sidebar-note">记录作品，收藏成长，<br/>把生活织成自己的世界。<a href="/stage" target="_blank" rel="noreferrer">打开前台 ↗</a></div></aside>
    <div className="studio-main"><header className="studio-topbar"><div><p>PERSONAL WORLD / STUDIO</p><span className={dirty?'studio-unsaved':''}>{dirty?'有未保存的修改':'内容已同步'}</span></div><div className="studio-top-actions"><button onClick={exportContent} disabled={!content||busy}>导出备份</button><button className="studio-save" onClick={save} disabled={!content||busy||!dirty}>{busy?'处理中…':'保存全部修改'}</button></div></header>
      <div className="studio-messages" aria-live="polite">{error&&<p className="studio-error" role="alert">{error}</p>}{notice&&<p className="studio-success" role="status">{notice}</p>}</div>
      <div className="studio-section-heading"><div><p>{section.en}</p><h1>{section.name}</h1><span>{section.note}</span></div><button className="studio-add" disabled={!content||busy} onClick={add}>＋ {tab==='projects'?'新增项目':tab==='skills'?'新增技能':'新增城市'}</button></div>
      {!content?<div className="studio-empty">{error?'请检查存储连接或重新登录。':'正在读取你的内容…'}</div>:<div className="studio-workspace"><div className="studio-entries" aria-label="内容列表">{content[tab].map((entry,index)=><button key={index} onClick={()=>setSelected(index)} className={index===selected?'is-selected':''} disabled={busy}><span className="studio-entry-number">{String(index+1).padStart(2,'0')}</span><span>{'name'in entry?entry.name:entry.title}<small>{entry.slug}</small></span></button>)}{!content[tab].length&&<p className="studio-empty">这里还没有内容，<br/>从新增开始。</p>}</div>
      {item?<section className="studio-editor" aria-label="内容编辑" inert={busy} aria-busy={busy}><div className="studio-editor-top"><div><p>EDITING / {String(selected+1).padStart(2,'0')}</p><h2>{'name'in item?item.name:item.title}</h2></div><div className="studio-item-actions"><button disabled={busy||selected===0} onClick={()=>move(selected,selected-1)} aria-label="内容上移">↑</button><button disabled={busy||selected===content[tab].length-1} onClick={()=>move(selected,selected+1)} aria-label="内容下移">↓</button><button className="studio-danger" disabled={busy} onClick={remove}>移除</button></div></div>
        <fieldset disabled={busy} className="studio-fields"><legend className="studio-sr">基本信息</legend>{textField('slug','英文标识',false,'网址中的唯一标识，使用小写英文、数字和短横线。')}{textField('title',tab==='projects'?'封面标题':'展示标题')}
        {tab==='projects'&&'image'in item&&<>{textField('name','项目名称')}{textField('category','项目类别')}{textField('summary','项目简介',true)}{textField('detail','详细介绍',true)}<Field label="技术标签" hint="多个标签用英文逗号分隔。" value={item.tags.join(',')} onChange={value=>patch({tags:value.split(',')})}/>{textField('github','项目链接',false,'可留空；填写时使用 https:// 地址。')}<UploadDropZone label="项目封面拖拽区" className="studio-cover studio-wide" disabled={busy} onFiles={files=>{void uploadCover(files);}} onError={setError}><img src={item.image} alt="项目封面预览"/><div><h3>项目封面</h3><p>将一张照片拖到这里，或点击更换封面。<br/>支持 JPG / PNG / WebP / GIF，单张不超过15MB。</p><label className="studio-upload-button">更换封面<input aria-label="上传项目封面" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event=>{void uploadCover(event.target.files);event.target.value='';}}/></label></div></UploadDropZone></>}
        {tab==='skills'&&'label'in item&&<>{textField('label','顶部微字')}{textField('text','技能介绍',true)}{textField('tags','底部标签',true,'标签之间可以使用 / 分隔。')}</>}
        {tab==='cities'&&'color'in item&&<>{textField('name','城市名称')}{textField('motif','城市短句',true)}<Field label="书皮侧面颜色" type="color" value={item.color} onChange={value=>patch({color:value})}/><Field label="城市花体颜色" type="color" value={item.ink} onChange={value=>patch({ink:value})}/></>}
        </fieldset>
        {'photos'in item&&<section className="studio-photos"><header><div><p>PHOTO COLLECTION</p><h3>照片展览 <small>{item.photos.length} 张</small></h3></div><label className={`studio-upload-button ${busy?'is-disabled':''}`}>＋ 上传照片<input aria-label="上传展览照片" type="file" multiple disabled={busy} accept="image/png,image/jpeg,image/webp,image/gif" onChange={event=>{void uploadPhotos(event.target.files);event.target.value='';}}/></label></header><p className="studio-photo-help">可多选上传。调整顺序后保存，前台展墙会按这里的顺序显示。空集合会显示预览占位。</p>
        <UploadDropZone label="展览照片拖拽区" className="studio-photo-dropzone" disabled={busy} multiple onFiles={files=>{void uploadPhotos(files);}} onError={setError}><span className="studio-drop-icon" aria-hidden="true">↑</span><strong>{busy?'正在上传照片…':'将照片拖到这里'}</strong><span>支持一次拖入多张，或使用上方「上传照片」按钮</span><small>JPG / PNG / WebP / GIF · 单张不超过15MB · 保存后更新前台</small></UploadDropZone>
        <div className="studio-photo-list">{item.photos.map((photo,index)=><article className="studio-photo-row" key={`${photo.src}-${index}`}><img src={photo.src} alt={photo.alt}/><div><Field label={`照片 ${index+1} · 描述`} value={photo.alt} onChange={alt=>updatePhoto(index,{alt})}/><Field label="照片说明" value={photo.caption} onChange={caption=>updatePhoto(index,{caption})}/>{tab==='cities'&&<label className="studio-field"><span>分类</span><select aria-label={`照片 ${index+1} 分类`} value={photo.category} onChange={event=>updatePhoto(index,{category:event.target.value as StudioPhoto['category']})}><option value="portrait">个人照 / PORTRAITS</option><option value="scenery">风景 / SCENERY</option><option value="food">美食 / FOOD</option></select></label>}</div><div className="studio-photo-actions"><button disabled={busy||index===0} onClick={()=>photoAction(index,'up')} aria-label={`照片 ${index+1} 上移`}>↑</button><button disabled={busy||index===item.photos.length-1} onClick={()=>photoAction(index,'down')} aria-label={`照片 ${index+1} 下移`}>↓</button><button disabled={busy} className="studio-danger" onClick={()=>photoAction(index,'delete')}>移除照片</button></div></article>)}</div>{!item.photos.length&&<p className="studio-empty studio-photo-empty">这本收藏还没有照片。<br/><span>上传第一张，留下一个真实的瞬间。</span></p>}</section>}
      </section>:<section className="studio-editor studio-empty">选择左侧内容，或新增一项。</section>}</div>}
      <footer className="studio-bottom-note">保存时自动保留上一版备份 · 上传图片只有保存到内容后才会出现在前台</footer>
    </div>
  </main>;
}
