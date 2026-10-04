import snapshot from './project-snapshot.json';
import type { LocalizedText, Project } from '@/types/project';
const text = (zh: string, en: string): LocalizedText => ({ zh, en });
const summaries: Record<string, LocalizedText> = {
  Zhiye: text('知野：面向乡村小学教师的课堂复盘与精准补讲原型。从课堂录音整理复习卡、教师报告、补讲教案与练习。', 'Zhiye is a classroom review and targeted follow-up teaching prototype for rural primary-school teachers. It turns classroom recordings into review cards, teacher reports, lesson plans and exercises.'),
  Lumi: text('Lumi 恋语：本地优先的 AI 关系沟通伙伴。React 前端、Express API 与 AI 集成，探索关系中的表达与沟通。', 'Lumi is a local-first AI companion for relationship communication, with a React frontend, Express API and AI integration.'),
  'zxcvbn-MoonBit': text('Dropbox zxcvbn 密码强度估计器的 MoonBit 移植。包含模式匹配、猜测次数估计和强度反馈。', 'A MoonBit port of Dropbox’s zxcvbn password-strength estimator, covering pattern matching, guess estimation and strength feedback.'),
  'journeyvault-obsidian-travel-os': text('JourneyVault：个性化旅行规划、智能行李清单与 Obsidian 项目导出 Skill。', 'JourneyVault is a skill for personalized travel planning, packing lists and exporting trip projects to Obsidian.'),
  'pres-zero-basics-navigation': text('PRES：零基础项目学习导航 Skill，将真实项目组织为能力地图、课程和断点续学记录。', 'PRES is a project-learning skill that organizes real projects into capability maps, lessons and resumable learning records.'),
  'moodweaver-life-orchestrator': text('MoodWeaver：围绕时间、预算与生活能量，组织理想轨、省电轨和救场轨的生活规划 Skill。', 'MoodWeaver is a life-planning skill that balances time, budget and energy with ideal, low-energy and recovery plans.'),
  Realm: text('藏梦书境：把心事写成童话的 Web 探索原型。', 'Realm is a web prototype exploring how personal thoughts can become fairy tales.'),
  'algorithm-visualizer': text('排序算法可视化学习工具，提供 HTML 与 Streamlit 展示方式，包含代码高亮、暂停与单步交互。', 'A sorting-algorithm learning tool with HTML and Streamlit views, code highlighting, pause and step-by-step interaction.'),
  ShengXinGO: text('README 提供 GO 代码包、Figma 原稿与前后端启动说明。', 'The README provides a GO code bundle, a Figma source design and frontend/backend startup instructions.'),
  SherryWorld: text('这个正在展开的个人世界：黑粉双主题、中英切换、个人形象、作品与生活。', 'The personal world you are visiting: black-and-pink themes, Chinese/English switching, a personal character, projects and life.'),
};
const displayNames: Record<string,string> = {Zhiye:'ZHIYE',Lumi:'LUMI','zxcvbn-MoonBit':'ZXCVBN','journeyvault-obsidian-travel-os':'JOURNEY VAULT','pres-zero-basics-navigation':'PRES','moodweaver-life-orchestrator':'MOOD WEAVER',Realm:'REALM','algorithm-visualizer':'ALGORITHM',ShengXinGO:'GO','project-weekly-closure':'WEEKLY CLOSURE',SherryWorld:'SHERRY WORLD'};
const order = ['Zhiye','Lumi','zxcvbn-MoonBit','SherryWorld','Realm','journeyvault-obsidian-travel-os','algorithm-visualizer'];
export const projects: Project[] = snapshot.repositories.map<Project>((r, index) => ({
  slug: r.name.toLowerCase(), name:r.name, displayName:displayNames[r.name]??r.name.toUpperCase(), repositoryUrl:r.url,
  isFork:r.fork, upstreamUrl:r.upstreamUrl, language:r.primaryLanguage,
  summary: summaries[r.name] ?? (r.fork ? text('学习与参考收录的 Fork 仓库。具体改动及上游贡献记录待补充。','A fork included for learning and reference. Specific changes and upstream contributions have not been documented here.') : text('已收录的公开项目，功能介绍与作品截图待补充。','A public project in this collection. A detailed description and project images will be added.')),
  status:r.name==='SherryWorld' ? text('网站正在构建：双主题和中英骨架已验证，真实人物模型与完整内容持续完善。','In progress: the bilingual shell and themes have been checked. The real character model and full content are still being developed.') : r.name==='Realm' ? text('README 明确为本地单实例 Demo；真实生图尚未验收，完整七章绘本仍在规划中。','The README describes a local single-instance demo. Real image generation has not been validated; the full seven-chapter storybook remains planned.') : r.name==='ShengXinGO' ? text('具体业务、完成情况与贡献细节待补充。','Business context, completion status and contribution details still need to be added.') : text('介绍依据公开资料；本次没有实际运行或测量此项目。','This description is based on public information. This project has not been executed or measured in this review.'),
  role:r.fork ? text('学习 / Fork · 保留上游来源，不作为独立原创成果。','Learning / Fork · Upstream attribution retained; not presented as an independently original project.') : text('全栈负责 · AI 辅助开发。具体设计决策、整合、调试与验证记录逐步补齐。','Full-stack owner · AI-assisted development. Design decisions, integration, debugging and validation notes are being documented.'),
  evidenceStatus:r.evidenceLevel==='metadata-and-readme'?'metadata-and-readme':'metadata-only',
  cover:{kind:'concept',palette:index%6,category:r.fork?'fork':r.name==='zxcvbn-MoonBit'?'engineering':/vault|pres-|mood|Skills/.test(r.name)?'skill':'product'}
})).sort((a,b)=>{const rank=(n:string)=>order.includes(n)?order.indexOf(n):99;return rank(a.name)-rank(b.name);});
export const projectSnapshotDate = snapshot.asOfLocalDate;
