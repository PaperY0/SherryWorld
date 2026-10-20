"use client";
import { createContext,useContext } from 'react';import type { SiteContent } from '@/content/site-content';
const Context=createContext<SiteContent|null>(null);
export function SiteContentProvider({content,children}:{content:SiteContent;children:React.ReactNode}){return <Context.Provider value={content}>{children}</Context.Provider>;}
export function useSiteContent(){const value=useContext(Context);if(!value)throw new Error('SiteContentProvider is required');return value;}
