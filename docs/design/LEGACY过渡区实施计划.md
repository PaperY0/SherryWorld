# LEGACY 过渡区

依据本地参考站 index.html 的 box-section-ups、services-heading 与 scroll.js 中的 heading 迁移和字符放大。此轮只接入火焰后的介绍与 LEGACY 过渡，不提前引入项目、能力词或下落素材。

- 保留参考介绍原文，右上对齐；黑色背景，粉色文字。
- 艺术体 LEGACY 从右侧小标题向中央移动并放大，随滚动正反变化；线条舞台逐渐展开。
- 独立 StageLegacy.tsx / stage-legacy.css，挂在 StageFacts 之后。沿用原站 Ruthie 字体。
- 用浏览器滚动时间线驱动，不增加持续 RAF；不支持时和减少动态模式使用可读静态布局。
- 用浏览器检查开始/中间的标题尺寸和位置变化、反向恢复、手机不溢出。
- 人物淡入同步缩短到用户指定的 2.5 秒。
