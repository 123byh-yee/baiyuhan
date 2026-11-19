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

## POST /api/db/test — 数据库连接测试

- **接口路径**：`/api/db/test`
- **HTTP 方法**：`POST`
- **请求参数**（JSON Body）：

```json
{ "username": "root", "password": "root" }
```

- **响应格式**：

成功：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "Bai_host": "127.0.0.1:3306",
    "Bai_version": "9.0.1",
    "Bai_currentUser": "root@localhost",
    "Bai_databaseCount": 12,
    "Bai_databaseList": ["zhihu_clone"],
    "Bai_elapsed": 18
  }
}
```

失败（用户名或密码错误）：

```json
{
  "code": 4001,
  "msg": "用户名或密码错误，MySQL 拒绝访问",
  "data": {
    "Bai_errorCode": "ER_ACCESS_DENIED_ERROR",
    "Bai_errorNumber": 1045
  }
}
```

- 错误码：`400` 参数为空；`4001` 认证失败；`5002` 其他连接错误（服务未启动、超时等）
- **修改时间**：2026-11-19 14:00:00

---

## GET /api/news — 科技新闻列表

- **接口路径**：`/api/news`
- **HTTP 方法**：`GET`
- **请求参数**（Query，均可选）：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 10 | 每页条数，最大 50 |
| `keyword` | string | 空 | 关键词，匹配标题或摘要 |
| `category` | string | 空 | 分类，如「人工智能」 |

- 示例：`GET /api/news?page=1&pageSize=20&category=人工智能`
- **响应格式**：

```json
{
  "code": 0,
  "msg": "获取科技新闻列表成功",
  "data": {
    "Bai_total": 10,
    "Bai_page": 1,
    "Bai_pageSize": 20,
    "Bai_keyword": "",
    "Bai_category": "",
    "Bai_categories": ["云计算", "人工智能", "开源", "消费电子", "芯片", "安全"],
    "Bai_list": [
      {
        "Bai_id": 1,
        "Bai_title": "国产多模态大模型发布 2.0 版本，推理成本下降四成",
        "Bai_summary": "新版本在图文理解与长文档问答上均有明显提升……",
        "Bai_category": "人工智能",
        "Bai_source": "科技前沿观察",
        "Bai_author": "林知远",
        "Bai_publishTime": "2026-11-19 09:20",
        "Bai_views": 12864
      }
    ]
  }
}
```

- 失败：

```json
{ "code": 5002, "msg": "获取新闻列表失败：<错误信息>", "data": null }
```

- **修改时间**：2026-11-19 14:20:00

---

## GET /api/gallery — 科技图文列表

- **接口路径**：`/api/gallery`
- **HTTP 方法**：`GET`
- **请求参数**：无
  - 示例：`GET http://localhost:8326/api/gallery`
- **响应格式**：

```json
{
  "code": 0,
  "msg": "获取图文列表成功",
  "data": {
    "Bai_total": 8,
    "Bai_list": [
      {
        "Bai_id": 1,
        "Bai_title": "多模态大模型 2.0 发布现场",
        "Bai_desc": "发布会主视觉以神经网络节点与数据流构成……",
        "Bai_image": "/images/Bai_gallery_1.jpg",
        "Bai_category": "人工智能",
        "Bai_author": "林知远",
        "Bai_likes": 328,
        "Bai_publishTime": "2026-11-19 09:20"
      }
    ]
  }
}
```

- 失败：

```json
{ "code": 5003, "msg": "获取图文列表失败：<错误信息>", "data": null }
```

- **修改时间**：2026-11-19 14:45:00

---
