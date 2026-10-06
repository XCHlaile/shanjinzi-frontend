# 山巾子前端工作区

本目录是前端 pnpm workspace。用户端官网和超级管理员后台分别放在 `apps/web` 与 `apps/admin-web`，后端目录不参与前端依赖安装和构建。

## 目录结构

```text
shanjinzi-frontend/
|-- apps/
|   |-- web/              # 用户端/官网，Vue 3 + Vite
|   |   |-- package.json
|   |   |-- index.html
|   |   |-- public/
|   |   |-- src/
|   |   `-- vite.config.js
|   `-- admin-web/        # 超级管理员后台，Vue 3 + Element Plus
|       |-- package.json
|       |-- index.html
|       |-- src/
|       `-- vite.config.js
|-- docs/                 # 产品需求、部署和 API 文档
|-- pnpm-workspace.yaml   # pnpm 工作区配置
|-- package.json          # 根目录脚本
|-- pnpm-lock.yaml
`-- README.md
```

> 后端已独立放在同级目录 `../shanjinzi-backend/`。若后续拆成独立前端 Git 仓库，只需要带走当前 `shanjinzi-frontend/` 目录。

## 安装依赖

```bash
pnpm install
```

## 本地开发

```bash
pnpm run dev:web
pnpm run dev:admin
```

- 用户端默认运行在 `http://localhost:3064`
- 管理端默认运行在 `http://localhost:3101`

## 构建

```bash
pnpm run build
```

也可以单独构建：

```bash
pnpm run build:web
pnpm run build:admin
```

## 架构与质量检查

用户端已经按业务能力建立 `features`、`entities`、`shared` 与 `app` 分层。新增功能和后续拆分规则见[前端架构约定](docs/architecture/frontend-architecture.md)。

提交前运行：

```bash
pnpm run check
```

该命令会依次校验 OpenAPI 契约、模块边界、单元测试、代码规范和两个应用的生产构建。
