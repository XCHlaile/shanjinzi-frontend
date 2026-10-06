# 当前 API 契约

`openapi.json` 是 `shanjinzi-frontend` 工作区唯一的当前接口文档。

- 更新接口文档后运行 `pnpm generate:api`，同步生成 operation 列表和可供 TypeScript/JSDoc 使用的 schema 类型。
- 提交 `openapi.json` 与生成的 `packages/api-contracts/src/operations.generated.js`。
- `pnpm test` 会先执行 `pnpm check:api`，生成文件过期时直接失败。
- 历史 OpenAPI 快照仅用于迁移回归，不作为当前接口实现依据。

Web 登录页通过 `VITE_ADMIN_WEB_URL` 配置独立管理后台根地址；开发环境默认使用
`http://localhost:3101`，生产环境默认使用同域 `/admin`。
