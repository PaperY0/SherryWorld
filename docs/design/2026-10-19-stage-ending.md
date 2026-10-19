# 网站收尾页

用户要求先完成最后一页，再统一调整。收尾页接在 WEAVER 之后，进入与离开上一屏仍沿用共同淡入淡出层，不增加新场景引擎或媒体资产。

构图：左侧大号无衬线 The story 与花体 continues.，呼应 CRAFTER / EXPLORER / WEAVER；右侧为联系入口。背景保留粉黑色、低对比花体 Sherry 水印与滚动绘制的细线。

邮箱 `19511635329@163.com` 和 GitHub `https://github.com/PaperY0` 都来自已有 `site/src/components/Home.tsx` 的联系区，没有新编联系方式。提供 mailto 链接、复制邮箱（失败时展示可手动复制的地址）、GitHub 外链、三个章节锚点与返回顶部。复制只是复制，不发送消息；没有模拟表单成功状态。

章节跳转/返回顶部会将键盘焦点交给目标标题。减少动态效果时使用静态布局与即时定位；手机采用上下排布。复制提示定时器、GSAP 动画与触发器在卸载时清理。

验证：生产构建与 TypeScript 通过；Playwright 验证入场透明度、页头主题归属、真实剪贴板内容、邮箱与 GitHub 链接、回到顶部及焦点恢复、手机宽度、章节锚点；同时回归 WEAVER 开门、城市相册和既有切屏。截图人工检查：`work/stage-ending-desktop.png`、`work/stage-ending-mobile.png`。
