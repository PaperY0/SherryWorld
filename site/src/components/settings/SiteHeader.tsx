"use client";
import { usePathname } from 'next/navigation';
export function SiteHeader(){const path=usePathname();if(path.startsWith('/admin'))return null;return <><a className="skip-link" href={path==='/stage'?'#stage-about':'#about'}>Skip to content</a><header className="site-header"><a className="brand" href={path==='/stage'?'#top':'/stage'}>PERSONAL SPACE</a></header></>;}
