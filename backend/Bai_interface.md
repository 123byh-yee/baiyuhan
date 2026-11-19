<!--
姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# Bai_interface.md — 接口记录

> 规则：每次创建或修改接口后追加记录，禁止覆盖已有内容。
> 统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`，`code = 0` 表示成功。

---

## GET /api/health — 服务与数据库健康检查

- **接口路径**：`/api/health`
- **HTTP 方法**：`GET`
- **请求参数**：无
  - 示例：`GET http://localhost:8326/api/health`
- **响应格式**：

成功（数据库连接正常）：

```json
{
  "code": 0,
  "msg": "服务运行正常",
  "data": {
    "Bai_version": "9.0.1",
    "Bai_database": "zhihu_clone",
    "Bai_now": "2026-11-19T13:53:00.000Z"
  }
}
```

失败（数据库连接异常）：

```json
{
  "code": 5001,
  "msg": "数据库连接失败：<错误信息>",
  "data": null
}
```

- **修改时间**：2026-11-19 13:53:00

---
