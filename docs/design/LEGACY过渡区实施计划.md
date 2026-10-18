# LEGACY 过渡区

依据本地参考站 index.html 的 box-section-ups、services-heading 与 scroll.js 中的 heading 迁移和字符放大。此轮只接入火焰后的介绍与 LEGACY 过渡，不提前引入项目、能力词或下落素材。

- 保留参考介绍原文，右上对齐；黑色背景，粉色文字。
- 艺术体 LEGACY 从右侧小标题向中央移动并放大，随滚动正反变化；线条舞台逐渐展开。
- 独立 StageLegacy.tsx / stage-legacy.css，挂在 StageFacts 之后。沿用原站 Ruthie 字体。
- 用浏览器滚动时间线驱动，不增加持续 RAF；不支持时和减少动态模式使用可读静态布局。
- 用浏览器检查开始/中间的标题尺寸和位置变化、反向恢复、手机不溢出。
- 人物淡入同步缩短到用户指定的 2.5 秒。

## 逐字放大与缓冲修订

用户复核后，取消整词 CSS 缩放，使用参考站相同版本 GSAP 3.13.0 / ScrollTrigger：LEGACY 拆为六个独立字母，字号按 0.16 的时间差依次增大；滚动进度正反控制，scrub .75 使动画平滑追随滚轮。sticky 舞台维持定位。所有字母初始化为小字号，避免后续字母提前以大字号闪现。字体加载完毕刷新测量；媒体偏好改变或卸载时回收时间线和观察器。

三个英文描述、上方宣言和 LEGACY 介绍统一调用 textReveal.ts：40px 上移、4px 模糊到清晰、单词时长 3 秒、随机错峰 50ms。保留原英文、大写和字重。角色标题仍逐字出现。

验证：生产构建通过；About 三项检查及最终角色/Legacy 五项检查通过。逐字检查覆盖中途 L 大于 Y、字号依次递减、最终居中放大和反向恢复；手机减少动态效果模式文字可读且不溢出。

来源：https://www.meermohsin.me/ ，本地参考 src/scroll.js，https://gsap.com/docs/v3/Plugins/ScrollTrigger/ 。
