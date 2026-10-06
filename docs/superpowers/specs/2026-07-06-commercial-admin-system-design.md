# 山巾子科技教育商用运营后台设计说明

## 目标

将当前 Vue 3 + Express `server.cjs` + JSON 文件存储的原型系统，升级为 Spring Boot + MySQL 的商用运营系统。新系统包含独立超级管理员后台、学校数据范围控制、用户端消息闭环、动态内容发布、审计和异步导出。

## 当前项目事实

- 当前后端入口是 `server.cjs`，数据源是 `data/*.json`。
- 当前用户端入口在 `src/`，已有登录、注册、仪表盘、幼儿动态、赛事专区、家长论坛、新闻资讯、我的报名等页面。
- 当前后台入口在 `src/views/AdminLogin.vue` 和 `src/views/AdminDashboard.vue`，只覆盖用户和报名管理。
- 当前后台鉴权依赖前端 localStorage 标记，服务端 `/api/admin/*` 没有可靠权限边界。
- 当前 JSON 数据存在中文 mojibake 风险，例如 `涓滄柟骞煎効鍥?` 这类字段，不能直接无校验导入生产库。

## 目标架构

- 新建 `shanjinzi-backend/`：正式 Spring Boot 后端，负责认证、权限、用户、学校、消息、内容、资讯、看板、审计、导出和 JSON 迁移。
- 新建 `admin-web/`：独立超级管理员后台，使用 Vue 3 + Element Plus + ECharts。
- 保留 `src/`：继续作为用户端，改造 API 客户端、消息中心、公开内容动态渲染和校方范围视图。
- 保留 `server.cjs`：只作为旧系统和迁移参考，不再承载新增正式业务。

## 角色与权限

统一角色枚举：

- `SUPER_ADMIN`：可访问全部 `/api/admin/*`。
- `SCHOOL_ADMIN`：只能通过用户端访问本校数据，禁止访问 `/api/admin/*`。
- `TEACHER`：只能访问本校和本人相关数据，禁止访问 `/api/admin/*`。
- `PARENT`：只能访问本校和本人相关数据，禁止访问 `/api/admin/*`。

旧角色映射：

- `data/admin.json` -> `SUPER_ADMIN`
- `users.json.role = school` -> `SCHOOL_ADMIN`
- `users.json.role = teacher` -> `TEACHER`
- `users.json.role = parent` -> `PARENT`

## JSON 到 MySQL 映射

| JSON 源 | 目标表 | 关键字段 |
| --- | --- | --- |
| `admin.json` | `admin_users` | `username`, `password_hash`, `nickname`, `role` |
| `users.json` | `app_users` | `legacy_id`, `phone`, `password_hash`, `role`, `school_id`, `child_name`, `nickname`, `created_at` |
| `users.json.school` | `schools` | `name`, `status` |
| `registrations.json` | `competition_registrations` | `legacy_id`, `comp_id`, `comp_name`, `user_id`, `student_name`, `student_class`, `student_age`, `parent_contact`, `created_at` |
| `activities.json` | `activity_posts` | `legacy_id`, `school_id`, `author_phone`, `role`, `content`, `tag`, `class_name`, `media_url`, `likes`, `created_at` |
| `forum.json` | `forum_topics` | `legacy_id`, `school_id`, `author`, `role`, `title`, `body`, `likes`, `created_at` |
| `news.json` | `news_articles` | `legacy_id`, `category`, `title`, `summary`, `content`, `author`, `published_at` |

迁移时不移动二进制文件，只保存旧 URL 和元数据。对象存储迁移单独执行。

## 迁移策略

1. dry-run：读取 JSON，不写数据库，输出总量、重复手机号、缺失学校、异常角色、乱码风险。
2. 正式导入：使用事务导入核心数据，任一核心表失败则回滚。
3. 导入校验：比对用户、学校、报名、动态、论坛、资讯数量，并抽样核对关键字段。
4. 切换：新系统通过验收前，旧 `server.cjs` 保持可运行；验收后流量切到 Spring Boot。

## 核心接口

管理端接口：

- `/api/admin/auth/*`
- `/api/admin/dashboard/*`
- `/api/admin/users/*`
- `/api/admin/schools/*`
- `/api/admin/messages/*`
- `/api/admin/pages/*`
- `/api/admin/news/*`
- `/api/admin/audit-logs`
- `/api/admin/export-tasks`
- `/api/admin/migration/*`

用户端接口：

- `/api/auth/*`
- `/api/messages/unread-count`
- `/api/messages/conversations`
- `/api/messages/{id}/reply`
- `/api/pages/{route}`
- `/api/news`

## 安全与审计

- 管理端只允许 `SUPER_ADMIN`。
- 学校范围数据必须校验 `schoolId`。
- 写操作统一写入 `audit_logs`。
- 审计记录使用 hash chain：`prev_hash` + 当前记录摘要 -> `entry_hash`。
- 删除默认软删除。
- 密码使用 BCrypt。
- JWT 密钥、数据库密码、对象存储密钥全部来自环境变量。

## 首版范围

包含：

- Spring Boot/MySQL 后端骨架和核心实体。
- JSON dry-run 与导入服务。
- 超级管理员后台骨架。
- 用户端消息中心入口。
- 页面和资讯动态读取接口。
- 看板、导出和审计基础能力。

不包含：

- 支付。
- 短信营销。
- 复杂实时 IM。
- CRM 销售线索。
- 对象存储历史文件批量迁移。
