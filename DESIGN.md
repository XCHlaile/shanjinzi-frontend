---
name: "山巾子科技 Web"
description: "面向幼儿园与家庭的科技教育平台，公开体验温暖、操作界面克制。"
colors:
  brand: "#2D72AD"
  brand-deep: "#205781"
  brand-soft: "#DCEEF7"
  brand-wash: "#EEF6FA"
  warm: "#E87955"
  warm-deep: "#B9573A"
  warm-soft: "#FFF0E9"
  ink: "#17324D"
  muted: "#526B7F"
  quiet: "#6C8292"
  canvas: "#F7FAFC"
  surface: "#FBFDFE"
  line: "#D5E3EA"
  success: "#10B981"
  error: "#EF4444"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 5.25rem)"
    fontWeight: 780
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(1.45rem, 2.4vw, 2.25rem)"
    fontWeight: 760
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 680
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-warm-action:
    backgroundColor: "{colors.warm-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px"
---

# Design System: 山巾子科技 Web

## Overview

**Creative North Star: "温暖探索，克制工作"**

这套界面为同一个教育品牌提供两种相互衔接的表达：公开页面通过真实儿童场景、宽松留白和暖色关键动作传达好奇、陪伴与信任；登录后界面保持更高的信息密度与更少的装饰，用稳定蓝色、清晰分组和单一首要任务支持家长、教师与校方高效行动。

暖色不是第二套品牌色，而是与儿童成长、人际关怀和当前重点相关的稀缺信号。管理界面的品牌感来自任务语言、上下文和比例，而不是卡通化或装饰性图形。

**Key Characteristics:**
- 公开页温暖、有画面感；操作页克制、任务导向。
- 每个工作页面只有一个首要行动，其余能力按业务场景分组。
- 蓝色建立稳定和范围，暖橙只用于成长语义与当前重点。
- 真实数据、真实状态和真实图像优先于装饰。

## Colors

主色是偏青的稳定教育蓝，辅以少量珊瑚暖橙；大面积使用带蓝绿倾向的浅中性表面，避免纯白带来的医疗或企业感。

### Primary
- **探索蓝**：主要操作、导航激活和品牌标识。
- **深海蓝**：页面标题、管理端高强度表面与高对比信息。
- **薄雾蓝**：选中状态、浅色背景与范围提示。

### Secondary
- **成长珊瑚**：与孩子成长、人际关怀或当前首要任务相关的小面积强调。

**The Warm Signal Rule.** 同一个操作屏中只有一个暖色焦点；它必须指向当前最重要的任务或成长语义。

### Neutral
- **深墨蓝**：主文字和深色标题表面。
- **灰蓝**：说明文本、辅助信息和非首要操作。
- **冷纸面**：页面画布、卡片和弱分隔。

## Typography

**Display Font:** 系统无衬线字体，优先 PingFang SC / Microsoft YaHei
**Body Font:** 与标题共用系统无衬线字体

**Character:** 不通过额外字体制造儿童感，而通过标题比例、松弛行高和真实图像建立温度。操作页的标题简洁直接，正文保持易读。

### Hierarchy
- **Display**：仅用于公开页 Hero 和少数高价值叙事节点。
- **Headline**：工作台与业务页的单一页面标题。
- **Title**：业务分组、主要面板和对话框标题。
- **Body**：任务说明最大阅读宽度为 66ch，避免管理端说明文字横跨整屏。
- **Label**：表单标签、范围信息与状态标记，不全大写。

**The Heading Carries the Page Rule.** 工作页不在标题上方堆叠装饰性 kicker；页面标题自己完成定位。

## Layout

公开页使用最大 1200px 容器、宽松的 64–80px 区段节奏和图文交替。操作页继续使用同一容器，但收紧区段间距，以“定位—首要任务—工作概览—分组入口”为固定阅读顺序。

导航顶层不超过 4 个业务入口与 1 个账户入口。宽度低于 1100px 时收入可键盘操作的移动菜单；低于 900px 时主要多列布局转为单列。

**The One Primary Task Rule.** 每个操作页首屏只允许一个主操作，快捷入口必须在视觉上降级。

## Elevation & Depth

系统默认使用色调分层和 1px 边界，而不是为每个容器添加阴影。阴影仅用于固定导航、浮层、关键上下文卡和公开页主图。

### Shadow Vocabulary
- **微弱悬浮**：按钮和可交互卡片 hover，必须带位移与柔和模糊。
- **环境浮层**：导航下拉和登录卡的低对比蓝灰阴影。
- **叙事主图**：仅在公开页图像与关键证据上使用更宽的环境阴影。

**The Flat-by-Default Rule.** 管理端静态容器默认不靠阴影分层；先使用间距、色调和边界。

## Shapes

控件与高密度管理容器使用 8–12px 圆角，公开页图像和叙事容器可使用 16–28px 圆角。胶囊造型只用于小型标签、未读数和选中状态，不作为普通卡片或大按钮的默认外形。

## Components

### Buttons
- **Shape:** 稳定的小圆角，默认 8px。
- **Primary:** 教育蓝用于通用主操作；同屏只有一个。
- **Warm Action:** 暖橙仅用于成长语义或当前首要任务。
- **Hover / Focus:** hover 可轻微上移，focus 必须保留 3px 可见焦点环。

### Chips
- **Style:** 使用浅色表面、深色文字和最小必要内边距。
- **State:** 暖色 chip 表示当前孩子/学校等上下文，不表示普通装饰。

### Cards / Containers
- **Corner Style:** 管理端 12px，公开页可放宽到 16–28px。
- **Background:** 优先使用冷纸面与薄雾蓝建立层次。
- **Shadow Strategy:** 静态管理容器使用边界，浮层和叙事图像才使用阴影。
- **Internal Padding:** 高密度容器 16–24px，公开页叙事容器 24–32px。

### Inputs / Fields
- **Style:** 白色或冷纸背景、1–1.5px 边界、8–10px 圆角。
- **Focus:** 边界切换为品牌蓝，增加浅蓝 3px 焦点影响区。
- **Error / Disabled:** 错误紧邻字段并告知恢复方式；禁用状态保留文本可读性。

### Navigation
- 未登录导航保留简洁的内容路径和注册行动。
- 登录后导航按角色分成不超过 4 个业务组，个人资料与退出进入账户菜单。
- 当前学生或学校上下文始终可见，但不与业务入口争抢权重。

### Workbench Focus Panel
- 位于角色定位之后、概览与全部入口之前。
- 用暖色浅表面指出“今天先做什么”，只携带一个主按钮和最多两个降级快捷入口。

## Do's and Don'ts

### Do:
- **Do** 先确定角色与当前数据范围，再展示操作。
- **Do** 在公开页使用真实儿童与园所图像，在工作页使用真实状态和数据。
- **Do** 将高频任务排在首位，将低频操作收入分组或账户菜单。
- **Do** 保留键盘焦点、加载、错误、空状态和减少动效支持。

### Don't:
- **Don't** 把登录后页面做成卡通化儿童界面；温度来自上下文和语言。
- **Don't** 在同一屏展示两个等权主操作，或把所有模块做成等权卡片。
- **Don't** 用大量阴影、渐变、玻璃效果或额外颜色代替信息层级。
- **Don't** 用暖橙装饰普通容器；没有成长或首要任务语义时就不使用。
