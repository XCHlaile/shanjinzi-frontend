# 前端架构约定

## 目标

前端按业务能力拆分，而不是按 `components`、`utils`、`api` 这类技术类型堆放全部代码。一次业务变更应尽量只影响一个业务模块，并通过公开入口连接页面。

## 依赖方向

```text
app / views
    |
    v
features  -----> entities
    |              |
    +-------> shared

app/api/applicationApi.js
    |
    `-- 仅组合各业务 API，用于契约完整性验证
```

- `app`：应用启动、路由和全局访问策略。
- `views`：路由页面，只负责组合业务能力和页面状态，不直接访问应用级聚合 API。
- `features`：按业务用例组织，例如认证、消息、赛事、学校管理；逻辑能力通过 `index.js` 暴露，Vue 组件通过 `ui/index.js` 暴露。
- `entities`：学生等稳定业务实体的纯模型、选择器和展示规则；不得发起网络请求。
- `shared`：无业务归属的基础能力，例如 HTTP 客户端、请求工具和 UI 反馈组件。
跨模块依赖只能从目标模块的 `index.js` 或 `ui/index.js` 导入，不能引用其 `api`、`lib`、`model` 或具体组件文件。模块内部的 UI 组件可以使用相对路径访问本模块实现。`pnpm run check:architecture` 会检查这些边界。

## 用户端目录

```text
apps/web/src/
|-- app/
|   |-- api/
|   `-- router/
|-- entities/
|   |-- student/
|   |   |-- index.js
|   |   `-- model/
|   `-- user/
|       |-- index.js
|       `-- model/
|-- features/
|   |-- authentication/
|   |-- student-context/
|   |-- activities/
|   |-- messaging/
|   |-- forum/
|   |-- competition/
|   |-- content/
|   |-- school-administration/
|   |-- school-roster/
|   `-- operations/
|-- shared/
|   |-- api/
|   |-- composables/
|   `-- ui/
|-- components/
`-- views/
```

管理端沿用相同方向：路由放在 `app`，实体展示规则放在 `entities`，通用 UI 能力放在 `shared`。管理端 feature 通过各自的 `features/*/api` 暴露窄业务端口；底层 `api/adminApi.js` 只组合 `api/clients` 中按业务拆分的请求客户端。

后台请求转换同样按业务组织：`api/payloads` 分别维护学校、班级、用户、学生、新闻和赛事 payload，`api/adminPayloads.js` 只作为兼容导出入口。新增业务转换不得继续堆入聚合入口。

## 新代码放置规则

1. 一个完整用户动作或会独立变化的业务能力放进 `features/<business>`。
2. 被多个业务能力复用、且代表稳定业务名词的数据规则放进 `entities/<entity>`。
3. 与业务无关并能被任意模块复用的能力才放进 `shared`。
4. 只有路由页面组合代码留在 `views`；可独立测试的转换、排序和标签规则下沉到所属业务模块。
5. 不因文件数量少而创建空层级，也不把不同业务仅因技术类型相同而合并。
6. 发布表单、数据表格、回复线程、评论面板和弹窗等可独立变化的界面单元放进所属 feature 的 `ui`，页面只连接模型状态与组件事件。

## API 维护流程

1. 后端接口文档更新到 `docs/api/openapi.json`。
2. 运行 `pnpm run generate:api` 更新 `packages/api-contracts`。
3. 在所属 `features/*/api/*Api.js` 中公开业务需要的方法。
4. 页面从该业务模块的 `index.js` 导入 API 端口。
5. 运行 `pnpm run check` 完成契约、架构、测试、静态检查和构建验证。

## 质量门禁

- `pnpm run check:api`：确认生成契约与当前 OpenAPI 一致。
- `pnpm run check:architecture`：检查跨层和跨 feature 导入边界。
- `pnpm run test`：运行前后台业务模型、请求映射和契约测试。
- `pnpm run lint`：执行 JavaScript/Vue 规则；`vue/no-undef-properties` 会阻止模板引用未在脚本中声明的状态或动作。
- `pnpm run build`：分别构建用户端和管理端，验证真实模块解析与 Vue 模板编译。
- 提交前统一运行 `pnpm run check`，不要只依赖开发服务器的热更新结果。

当前迁移状态：

- 所有业务模块均已迁移为独立契约、请求转换和可注入 transport 的 API 工厂。
- HTTP 客户端位于 `shared/api/httpClient.js`，业务 API 不再依赖 `stores`。
- 消息附件、频道分类、会话目录、私信线程、通知状态和实时/轮询同步由 `features/messaging` 统一维护，页面只负责模型组合；通用刷新组合式函数位于 `shared/composables`。
- 用户角色规则位于 `entities/user`；当前学生持久化、绑定状态、亲属关系和展示归一化位于 `features/student-context`；认证会话位于 `features/authentication/model`。
- 学校名册的目录查询、表单规则、记录维护、展示规则、家长绑定和学生导入导出流程统一位于 `features/school-roster`；工具栏、双模式表格和弹窗均由该 feature 管理，页面只保留路由模式和状态编排。
- 家园论坛的目录查询、实时合并、展示规则、主题维护、点赞举报与回复线程状态统一位于 `features/forum`，页面只保留身份展示与控制器组合。
- 幼儿动态的展示规则、发布流程、编辑互动与评论线程状态统一位于 `features/activities`；发布面板、动态卡片和评论面板也由该 feature 管理，页面只组合身份上下文、路由定位和业务控制器。
- 开放运维的审计/导出目录状态、用户名称补全、详情、任务操作和展示字典统一位于 `features/operations`，页面只组合业务控制器。
- 赛事中心的目录查询、路由定位、家长报名、校方名单与带队教师管理、报名统计和展示规则统一位于 `features/competition`，页面只组合角色上下文和业务控制器。
- 学校管理 API 在模块内部按学校班级、用户、学生三个子域组合，班级成员分配状态也由该模块维护；外部仍只从模块 `index.js` 使用统一端口。
- 管理端学生目录、记录弹窗、关系弹窗和导入弹窗位于 `features/student-management/ui`，`Students.vue` 只负责页面级操作与控制器连接。
- 管理端底层请求由 `api/clients` 按班级、内容举报、开放用户、开放学生、赛事报名和开放运维组合；请求数据转换由 `api/payloads` 按业务维护。
- `app/api/applicationApi.js` 仅组合业务 API 并验证整体契约；页面和状态模块不得依赖该聚合层。
