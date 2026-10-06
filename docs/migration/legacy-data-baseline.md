# 旧 JSON 数据基线报告

生成时间：2026-07-06

## 数据文件状态

| 文件 | 解析状态 | 当前记录数 | 用途 |
| --- | --- | ---: | --- |
| `data/users.json` | OK | 8 | 用户、角色、学校来源 |
| `data/registrations.json` | OK | 3 | 赛事报名 |
| `data/activities.json` | OK | 3 | 幼儿动态 |
| `data/forum.json` | OK | 3 | 家长论坛 |
| `data/news.json` | OK | 3 | 新闻资讯 |
| `data/admin.json` | OK | 1 | 初始超级管理员 |

## 已知数据风险

- 多个中文字段在源码展示中已出现 mojibake，例如学校名、资讯标题、动态正文和论坛正文。
- 旧密码为明文保存，正式迁移时必须使用 BCrypt 重新写入。
- 旧用户通过字符串学校名关联，正式迁移时必须先创建 `schools`，再绑定 `school_id`。
- 旧系统没有软删除状态，迁移时默认所有记录为 `ACTIVE`。
- 旧系统没有审计历史，迁移完成后只对新操作建立 hash chain 审计。

## 角色分布

| 旧角色 | 新角色 | 迁移规则 |
| --- | --- | --- |
| `school` | `SCHOOL_ADMIN` | 校方管理员，只能访问本校范围 |
| `teacher` | `TEACHER` | 教师，只能访问本校和本人相关数据 |
| `parent` | `PARENT` | 家长，只能访问本校和本人相关数据 |
| `admin.json` | `SUPER_ADMIN` | 独立后台唯一管理角色 |

## 导入验收

正式导入后必须满足：

- `app_users` 数量等于 `users.json` 记录数。
- `competition_registrations` 数量等于 `registrations.json` 记录数。
- `activity_posts` 数量等于 `activities.json` 记录数。
- `forum_topics` 数量等于 `forum.json` 记录数。
- `news_articles` 数量等于 `news.json` 记录数。
- 每个非空学校名都能对应一条 `schools` 记录。
- 重复手机号、异常角色、缺失学校和乱码风险必须出现在 dry-run 报告中。
