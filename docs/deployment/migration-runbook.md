# JSON 到 MySQL 迁移 Runbook

## 迁移前

- 确认当前生产 `data/*.json` 已完成备份。
- 确认 `SJZ_DB_URL`、`SJZ_DB_USERNAME`、`SJZ_DB_PASSWORD` 指向目标 MySQL。
- 确认 `SJZ_LEGACY_DATA_DIR` 指向只读 JSON 数据目录。
- 确认对象存储迁移不在本轮执行，本轮只保存旧 URL。

## Dry Run

运行：

```powershell
Invoke-RestMethod -Uri http://localhost:8081/api/admin/migration/dry-run -Headers @{ Authorization = "Bearer <SUPER_ADMIN_TOKEN>" }
```

验收：

- 所有 JSON 文件解析状态为 OK。
- `users.json`、`registrations.json`、`activities.json`、`forum.json`、`news.json` 数量与基线一致。
- 重复手机号、异常角色、缺失学校和乱码风险已被人工确认。

## 正式导入

- 先停止旧系统写入。
- 执行正式导入任务。
- 导入失败必须回滚事务，不允许留下半成品核心数据。
- 导入完成后抽样核对用户、学校、报名、动态、论坛和资讯。

## 切换

- 新后端健康检查通过后，将 API 流量切到 Spring Boot。
- `server.cjs` 已移除，回退需要使用数据库备份和 Spring Boot 服务版本。
- 不再恢复旧 Node API 路由，也不反向同步新库数据到 JSON。
