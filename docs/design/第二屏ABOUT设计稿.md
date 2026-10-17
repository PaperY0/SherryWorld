# 第二屏 ABOUT 设计稿

2026-10-17。用户已确认采用下列原站英文正文，正在接入 `/stage`。用户希望依次设计、尽量保留参考站，不大改结构。本稿以本地 Meer-Mohsin-Replica 的 index.html、layout.css、scroll.js 与 about 截图为依据。下文个人介绍候选稿仅保留为历史提案，不用于本轮页面。

## 保留的原设计

首屏下方衔接黑色/暖黑整屏。视觉中心为三行巨字 THIS WILL / FEEL / DIFFERENT，中间 FEEL 用 Ruthie 连笔字体，其余用轻字重无衬线。没有卡片、履历列表或额外头像。

原桌面标题容器约125vh，整个 about 区约135vh；标题约16rem，原站 rem 基准约.8333vw，1440px下约192px。FEEL 约20rem。段落宽90vw，字号约2.5rem（1440px下约30px），首行有约25vw缩进。标题下的段落通过负边距向上衔接。

这些数值说明其比例，不直接复制到当前网站的全局 rem。当前页面保留系统字号基准，通过限定到 about 容器的 clamp/vw 换算复现。

原手机布局单独缩短：about约60vh、标题容器约50vh；存在大负边距与更高字重。不照抄原手机负偏移，以避免中文和较长介绍重叠；保留大标题、连笔中行、宽段落的视觉关系。

## Sherry 版修改范围

1. 背景沿用首屏底部暖黑 #171217，实现自然接缝。
2. 原鲜红改柔粉：主字 #E7A9C1，连笔 FEEL 可略浅 #F0C0D2，正文 #CDA9BA。
3. 标题暂保留 THIS WILL / FEEL / DIFFERENT，不自作主张替换成另一套口号。英文全部大写。
4. 中文模式也保留这组英文视觉标题，正文中英切换；避免用中文字体替代 FEEL 后丢失原设计。
5. 正文仅替换为本人信息。原站翼形模型不作为本人标识引入；跨屏模型/标识动线单独评审，不在这一屏自动增加。
6. 这一轮不加数字、作品卡片、技能标签、兴趣照片或额外按钮，保持原站这一段的留白。

## 原标题与原正文

标题：THIS WILL / FEEL / DIFFERENT。

正文原文：

> I don't just build websites I create experiences that people enjoy exploring. From the first impression to the smallest interaction, I care about the details that make a website feel smooth, memorable, and worth coming back to.

这段是参考作者介绍，不直接作为 Sherry 的经历声明。

## 建议替换正文：中文

我是文书颖，也叫 Sherry，山东科技大学智能科学与技术专业的大三学生。我正在探索 AI、后端与 Agent，借助 AI 协作把想法做成可以体验的作品。我在意功能如何实现，也在意它带给人的感受。代码之外，我喜欢羽毛球、舞蹈和音乐。这里有我的作品，也有生活里不同侧面的我。

## 建议替换正文：英文

I'm Sherry, a third-year Intelligent Science and Technology student at Shandong University of Science and Technology. I explore AI, backend development and agents, turning ideas into projects through AI-assisted development. I care about how things work and how they feel. Beyond code, I enjoy badminton, dance and music. This is a space for my work and the different sides of my life.

英文在页面里按参考站样式显示大写，源数据保留正常大小写。INFJ 先不塞进这一段，可在后续个人故事中自然呈现。

## 滚动编排

- 首屏正常向下滚入第二屏，不再次播放加载计数。
- 到标题上沿进入约视口50%位置时触发标题揭示：字符轻微向上移动、透明度上升、模糊消退，沿用参考站的逐字节奏。
- FEEL 作为连笔词整体出现，避免把书法字母拆开后出现不自然断连。
- 段落进入约视口85%位置时按词/短句错峰揭示；中文按短句处理，避免机械按空格分词。
- 每次进入页面播放一次；向上回看时保持完整，不不断闪烁或重播。
- 文字先有可读的静态内容，动画增强不应让脚本失败时整屏为空。
- 减少动态模式直接显示全部文字。
- 桌面与手机分别校准，确保标题不与正文重叠、不裁断字符，没有横向溢出。

## 接下来实施时的文件与验收

新增独立 StageAbout 组件及局部样式，插入 /stage 首屏后。正文放独立双语数据；所有滚动监听和动画在卸载时清理。首先实现标题、正文与揭示，不复制整个原站的其他分区。

检查：首屏渐变与第二屏背景接缝、标题整体比例、粉色对比度、中文换行、英文大写、滚回稳定、减少动态、加载层只在最初出现，以及粉色鼠标效果是否仍可用。

## 下一段边界

ABOUT 后原站是10+ / 25+ / 6+数字区及火焰转场。本稿不实施该段；以后单独展示原布局和文字，再决定替换成哪些真实数据，不继承他人成绩。
