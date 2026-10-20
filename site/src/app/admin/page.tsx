import type { Metadata } from 'next';
import { AdminStudio } from './studio';
import { AdminSession } from './admin-session';
export const metadata:Metadata={title:'Sherry · 内容工作室',robots:{index:false,follow:false}};
export default function AdminPage(){return <AdminSession><AdminStudio/></AdminSession>;}
