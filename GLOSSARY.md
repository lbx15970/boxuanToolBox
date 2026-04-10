# 专属术语与指代词字典 (Glossary)

本文档用于存储和统一本项目（boxuanToolBox）在开发沟通过程中常用的专有"指代词"，以便于 AI 以及人类开发者在每次执行任务时能够准确理解彼此的意图。**在每次执行新任务前，请务必阅读本文档以对齐认知。**

---

### 📚 核心界面与元素指代

- **"卡片" (Card / Tool Card)**
  - **具体含义**：指代本项目首页 (`HomePage`) 居中显示的那些可以划动切换（Swipe）的精美 UI 矩形板块（即 `CarouselStack` 组件渲染的界面）。
  - **交互行为**：每一个卡片对应一个特定的子工具。点击不同的卡片，即可跳转进入该工具的具体操作页面（例如：视频生成工具页面）。
  - **代码位置**：主要由 `homepage/src/components/CarouselStack.tsx` 与 `items.ts` 控制。
  - **卡片顺序**：
    - 第一张卡片：**视频生成工具**（Seedance 2.0），当前已完成开发并集成。
    - 第二张卡片：**待开发工具**，具体功能未定，留白以备后续补充。

- **"视频生成工具" (Video Generator Tool / Seedance 2.0)**
  - **具体含义**：指代名为 `video-generator` 的子功能模块，底层调用火山引擎 Seedance 2.0 自动生成视频。
  - **核心逻辑在**：前端主要在 `homepage/src/tools/video-generator/VideoGeneratorPage.tsx`，后端 API 主要在 `server/routes/video-generator.js`。

---

> _（注意：如果有新的称呼习惯或高频沟通暗语，请随时在此文档中追加，以保持理解的一致性。）_
