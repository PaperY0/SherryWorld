# WEAVER 与弹层衔接

## 这次实现

- Explorer 后接 WEAVER：花体标题与大号无衬线标题，中央生活展窗随滚动出现，背景为低亮度粉色光晕与散落相片形状。
- 点击展窗或 EXPLORE MY LIFE，淡入生活相册；支持全部、旅游、日常、美食筛选及照片放大、Escape 返回。
- 暂放六张明确标注的 SVG 占位，不代表真实个人照片。实际素材入口是 `site/public/images/life/photos.json`。
- 技能展墙继续保留原来的弧形拖拽、左右切换、点击放大，以及淡入后卡片从上落入的节奏。

## 闪屏诊断与处理

原关闭动画没有设置 `fill`。浏览器在动画结束与 React 卸载之间，可能恢复不透明的基础样式；原清理顺序又先取消动画，后关闭原生 dialog。运行中已确认旧关闭动画的 fill 为 auto。

新增 `useFadingDialog` 统一技能展墙、项目详情、生活相册的生命周期：

1. layout effect 中先设透明，再 showModal，防止首帧露出。
2. 开合动画均保留最终帧；关闭从当前透明度开始，支持入场途中关闭。
3. 关闭原生 dialog 后才取消动画、解锁滚动和恢复原焦点/位置。
4. 锁滚动时保留滚动条空间。无滚动条宽度差的测试环境不能证明所有设备原来都曾发生位移，因此这一项属于防护。
5. 技能图片先解码，整页淡入结束后才挂载卡片落入动画。

WEAVER 与 Explorer 的重叠区域最初遮挡了最后一项技能按钮，测试复现后已修正：Explorer 末尾保留一个视口的退场空间，未进入的透明层不接收指针事件。

## 参考目录中确认的技术

本节分析对象是用户提供的本地参考复刻源码，不等同于对原站在线运行的性能测量。

- `Meer-Mohsin-Replica/src/app.js:16-17`：Lenis 平滑滚动，ScrollTrigger 更新与 Lenis RAF 接入同一个 GSAP ticker，减少两套更新节奏的不一致。
- `src/app.js:28-38`：弹层有交互状态控制；退场结束再隐藏/恢复滚动，避免退出中途改变页面布局。
- `src/app.js:62`：等待字体与图片就绪后刷新 ScrollTrigger，减少素材加载后的触发位置漂移。
- `Meer-Mohsin-Replica/src/scenes.js`：Awards 使用 Three.js 场景、模型地面、贴图展示平面和滚动驱动的相机运动，配合 pinned/scrub 时间轴。

本次采用其稳定生命周期、滚动时间轴和中央展窗构图思路。WEAVER 目前是 CSS/GSAP 场景，没有引入 Lenis，也没有复刻 Three.js 奖项场景；未宣称原站像素一致或同等性能。

## 个人照片配置

`site/public/images/life/photos.json` 是一个数组，例如：

```json
[
  {
    "src": "/images/life/travel-01.jpg",
    "alt": "照片内容描述",
    "caption": "照片标题",
    "category": "travel",
    "location": "可选地点"
  }
]
```

category 支持 travel / everyday / taste。空数组展示占位，不虚构经历或地点。

## 验证

生产构建通过。Playwright 覆盖重复开合的透明最终帧、焦点/滚动位置恢复，技能展墙交互，项目切换，视频铺满、反向滚动与缩放，连续曙光背景，WEAVER 居中入口与分类/放大，手机及减少动态效果布局。截图保存在本地 `work/weaver-*.png`。
