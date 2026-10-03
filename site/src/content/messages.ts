const zh = {
  title: 'PaperY · 文书颖的个人世界',
  skip: '跳到个人世界', themeLabel: '页面主题', languageLabel: '页面语言',
  portraitAlt: 'PaperY 人物视觉参考：黑发、黑框眼镜与针织上衣',
  about: '关于我', name: '文书颖', identity: '山东科技大学 · 智能科学与技术 · 大三',
  intro: '我在探索 AI、后端与 Agent，也在收集生活里那些值得记住的瞬间。',
  aboutText: '技术是我的一种表达方式。羽毛球、舞蹈、音乐和旅行，是另外几种。这里有我的作品，也有作品之外的我。',
  role: 'AI / 后端 / AGENT', personality: 'INFJ · 多面的我',
  projectsLabel: '项目', projectsAction: '查看项目', projectsText: '全栈负责，AI 辅助开发。我的作品与探索，记录在 GitHub。',
  interests: '兴趣爱好', interestLead: '让日常有自己的节奏。',
  hobbies: ['羽毛球', '舞蹈', '音乐'], photo: '留给下一张照片',
  life: '生活碎片', lifeLead: '平常的一天，也值得留下。', lifeText: '这里留给日常照片和那些微小的瞬间。',
  travel: '旅游足迹', travelLead: '去看看，世界的另一面。', places: ['上海', '北京', '云南'],
  contact: '联系我', contactLead: '让一个想法，成为下一段对话。', email: '发送邮件',
  footer: '作品、生活，以及还在展开的故事。', back: '回到顶部'
};
type Messages = { [K in keyof typeof zh]: typeof zh[K] extends string[] ? string[] : string };
const en: Messages = {
  title: 'PaperY · A world of my own',
  skip: 'Skip to my world', themeLabel: 'Color theme', languageLabel: 'Page language',
  portraitAlt: 'PaperY character concept with dark hair, black glasses and a knit top',
  about: 'ABOUT ME', name: '文书颖', identity: 'Shandong University of Science and Technology · Intelligent Science & Technology · Third year',
  intro: 'Exploring AI, backend systems and agents. Collecting moments worth remembering along the way.',
  aboutText: 'Technology is one way I express myself. Badminton, dance, music and travel are a few others. This space holds my work, and the person behind it.',
  role: 'AI / BACKEND / AGENT', personality: 'INFJ · MORE THAN ONE SIDE',
  projectsLabel: 'PROJECTS', projectsAction: 'VIEW PROJECTS', projectsText: 'Full-stack work, built with AI assistance. My projects and experiments live on GitHub.',
  interests: 'INTERESTS', interestLead: 'A rhythm of my own.',
  hobbies: ['BADMINTON', 'DANCE', 'MUSIC'], photo: 'A place for the next photo',
  life: 'LIFE, IN FRAGMENTS', lifeLead: 'Ordinary days. Worth keeping.', lifeText: 'A space for everyday photos and the little moments.',
  travel: 'PLACES I’VE BEEN', travelLead: 'Another place. Another perspective.', places: ['SHANGHAI', 'BEIJING', 'YUNNAN'],
  contact: 'LET’S TALK', contactLead: 'An idea can start a conversation.', email: 'SEND AN EMAIL',
  footer: 'Work, life, and stories still unfolding.', back: 'BACK TO TOP'
};
export const messages: Record<'zh' | 'en', Messages> = { zh, en };
