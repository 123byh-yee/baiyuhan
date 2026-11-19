<!--
姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# Bai_database.md — 数据库脚本记录

> 规则：每次建表、改表或插入数据后，按执行顺序追加对应 SQL（含测试数据 INSERT），
> 保证仅凭本文件即可在新机器上完整重建数据库。禁止覆盖已有内容。

- 数据库：MySQL 9.0
- 字符集：`utf8mb4` / `utf8mb4_unicode_ci`

---

## 2026-11-19 13:52:00 — 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS zhihu_clone
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zhihu_clone;
```

> 说明：本阶段仅初始化数据库，业务表将在后续接口开发时按需创建，
> 每张表建立后追加建表 SQL 及至少 8 条真实业务测试数据的 `INSERT`。

---
