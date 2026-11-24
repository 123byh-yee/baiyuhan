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

## POST /api/chat — AI 聊天（代理 SiliconFlow 大模型）

- **接口路径**：`/api/chat`
- **HTTP 方法**：`POST`
- **请求参数**（Body，JSON）：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| messages | Array | 是 | 对话消息数组，元素为 `{ role, content }`，role 取值 `user` / `assistant` / `system` |

请求示例：

```json
{
  "messages": [
    { "role": "user", "content": "你好，请介绍一下你自己" }
  ]
}
```

说明：后端会自动在最前面附加 system 提示词「你是一个有用的助手」，并携带 `SILICON_API_KEY` 调用
`https://api.siliconflow.cn/v1/chat/completions`，模型固定为 `deepseek-ai/DeepSeek-V4-Flash`；
发送给大模型的请求体与收到的响应会完整输出到后端控制台。
网络异常时自动重试 3 次（间隔 800ms），单次请求超时 120 秒。

- **响应格式**：

成功：

```json
{
  "code": 0,
  "msg": "对话成功",
  "data": {
    "Bai_reply": "我是你的智能助手，随时准备为你解答问题、提供信息或协助完成任务！",
    "Bai_model": "deepseek-ai/DeepSeek-V4-Flash",
    "Bai_usage": { "prompt_tokens": 12, "completion_tokens": 17, "total_tokens": 29 },
    "Bai_elapsed": 1485
  }
}
```

失败：

```json
{ "code": 400,  "msg": "messages 不能为空，格式为 [{ role, content }]", "data": null }
{ "code": 5001, "msg": "未配置 SILICON_API_KEY，请在 backend/.env 中设置", "data": null }
{ "code": 5003, "msg": "大模型接口调用失败：<上游错误信息>", "data": { "Bai_status": 401 } }
{ "code": 5004, "msg": "大模型响应超时：请求超时（已重试 3 次）", "data": null }
{ "code": 5005, "msg": "调用大模型失败：<错误原因，如 UND_ERR_CONNECT_TIMEOUT>（已重试 3 次）", "data": null }
```

- **修改时间**：2026-11-23 10:20:00

---

## POST /api/kb/upload — 上传并解析知识库文件

- **接口路径**：`/api/kb/upload`
- **HTTP 方法**：`POST`
- **请求参数**：`multipart/form-data`，字段名 `file`
  - 支持类型：`.txt` `.md` `.pdf` `.doc` `.docx` `.ppt` `.pptx`，单文件 ≤ 20MB
  - 示例：`curl -F "file=@智能客服FAQ.docx" http://localhost:8326/api/kb/upload`
- **响应格式**：

成功：

```json
{
  "code": 0,
  "msg": "上传并解析成功",
  "data": {
    "Bai_id": 7,
    "Bai_name": "智能客服FAQ.docx",
    "Bai_type": ".docx",
    "Bai_chars": 458,
    "Bai_chunkCount": 2
  }
}
```

失败：`{ "code": 400, "msg": "不支持的文件类型：<扩展名>…", "data": null }`
`{ "code": 500, "msg": "文件解析失败：<错误信息>", "data": null }`

- **修改时间**：2026-11-23 14:10:00

## GET /api/kb/docs — 知识库文档列表

- **接口路径**：`/api/kb/docs`
- **HTTP 方法**：`GET`
- **请求参数**：无
- **响应格式**：

```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "Bai_total": 8,
    "Bai_chunkTotal": 9,
    "Bai_allowedExt": [".txt", ".md", ".pdf", ".doc", ".docx", ".ppt", ".pptx"],
    "Bai_list": [
      { "Bai_id": 8, "Bai_name": "物流配送.txt", "Bai_type": ".txt", "Bai_size": 291,
        "Bai_chunk_count": 1, "Bai_status": "ready", "Bai_uploadTime": "2026-11-23 14:07" }
    ]
  }
}
```

- **修改时间**：2026-11-23 14:10:00

## DELETE /api/kb/docs/:id — 删除文档及其片段

- **接口路径**：`/api/kb/docs/:id`
- **HTTP 方法**：`DELETE`
- **请求参数**：路径参数 `id`（文档主键），示例：`DELETE /api/kb/docs/8`
- **响应格式**：

成功：`{ "code": 0, "msg": "删除成功", "data": { "Bai_id": 8, "Bai_name": "物流配送.txt" } }`
失败：`{ "code": 404, "msg": "文档不存在", "data": null }`

- **修改时间**：2026-11-23 14:10:00

## POST /api/kb/ask — 基于知识库的检索增强问答（RAG）

- **接口路径**：`/api/kb/ask`
- **HTTP 方法**：`POST`
- **请求参数**（Body，JSON）：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| question | String | 是 | 用户问题 |

示例：`{ "question": "会员可以退款吗" }`

说明：先用 BM25（中文二元组 + 英文单词）在 `Bai_kb_chunk` 中检索最相关的前 4 段，
把片段拼成上下文写入 system 提示词，再调用 `deepseek-ai/DeepSeek-V4-Flash` 生成回答；
发送给大模型的完整请求体与收到的响应都会输出到后端控制台。网络异常自动重试 3 次，单次超时 120 秒。

- **响应格式**：

成功：

```json
{
  "code": 0,
  "msg": "回答成功",
  "data": {
    "Bai_question": "忘记密码怎么办？",
    "Bai_answer": "在登录页点击「忘记密码」，输入注册手机号获取验证码…",
    "Bai_model": "deepseek-ai/DeepSeek-V4-Flash",
    "Bai_usage": { "prompt_tokens": 812, "completion_tokens": 96, "total_tokens": 908 },
    "Bai_elapsed": 8666,
    "Bai_refs": [
      { "Bai_docName": "智能客服FAQ.docx", "Bai_index": 1, "Bai_score": 12.033, "Bai_snippet": "知乎模仿站 · 智能客服常见问题（FAQ）…" }
    ]
  }
}
```

失败：

```json
{ "code": 400, "msg": "知识库为空，请先上传知识库文件", "data": null }
{ "code": 400, "msg": "知识库中没有检索到相关内容，请更换问法或补充资料", "data": null }
{ "code": 5004, "msg": "大模型响应超时：请求超时（已重试 3 次）", "data": null }
{ "code": 5005, "msg": "调用大模型失败：<错误原因>（已重试 3 次）", "data": null }
```

- **修改时间**：2026-11-23 14:10:00


---

## AI 聊天增强（持久化 + 自动压缩）

| 接口 | 方法 | 请求参数 | 响应示例 | 修改时间 |
|------|------|----------|----------|----------|
| /api/chat/sessions | GET | 无 | { code:0, data:{ Bai_total:1, Bai_list:[{ Bai_id:1, Bai_title:'新会话', Bai_summary:'', Bai_create_time:'...' }] } } | 2026-11-23 |
| /api/chat/sessions | POST | { "title": "可选" } | { code:0, data:{ Bai_id:1, Bai_title:'新会话' } } | 2026-11-23 |
| /api/chat/sessions/:id | DELETE | URL 参数 id | { code:0, msg:'删除成功' } | 2026-11-23 |
| /api/chat/sessions/:id/messages | GET | URL 参数 id | { code:0, data:{ Bai_sessionId:1, Bai_title:'...', Bai_summary:'压缩摘要', Bai_messages:[{ Bai_role:'user', Bai_content:'...' }] } } | 2026-11-23 |
| /api/chat | POST | { "sessionId": 0, "message": "你好" }（sessionId 为 0 或不传时自动新建会话） | { code:0, data:{ Bai_sessionId:1, Bai_reply:'...', Bai_model:'deepseek-ai/DeepSeek-V4.1-Flash', Bai_elapsed:1234, Bai_compressed:null或'压缩摘要文本' } } | 2026-11-23 |

**触发压缩**：当某会话未压缩消息数 > 20 时，后端自动调用 LLM 对全部未压缩消息生成 200 字中文摘要，事务性地标记旧消息 Bai_is_compressed=1 并更新会话摘要，保留最近 10 条不压缩。前端会在收到 Bai_compressed 非空时提示用户。

---

## Harness Engineering（情感分类 + 实体抽取）

| 接口 | 方法 | 请求参数 | 响应示例 | 修改时间 |
|------|------|----------|----------|----------|
| /api/harness/schema | GET | 无 | 返回预先设计好的 JSON Schema（见 Bai_harnessController.js） | 2026-11-23 |
| /api/harness/analyze | POST | { "text": "iPhone 16 Pro Max 做工精致但续航一般" } | { code:0, data:{ Bai_analysis:{ sentiment:{ label:'mixed', score:0.1, confidence:0.92 }, entities:[{ text:'iPhone 16 Pro Max', type:'PRODUCT', sentiment:'neutral' }], key_phrases:[{ phrase:'做工精致', importance:0.9 }], suggestions:[], complaints:[], summary:'...' }, Bai_elapsed:2345 } } | 2026-11-23 |
| /api/harness/list | GET | 可选 ?limit=20 | { code:0, data:{ Bai_total:8, Bai_list:[{ Bai_input_text:'...', Bai_output_json:{...}, Bai_create_time:'...' }] } } | 2026-11-23 |

**JSON Schema 字段**：sentiment（label ∈ {positive,negative,neutral,mixed}, score ∈ [-1,1], confidence ∈ [0,1]）、entities（text + type ∈ {PRODUCT,BRAND,PERSON,LOCATION,ORGANIZATION,TIME,PRICE,OTHER} + 可选子情感）、key_phrases、suggestions[]、complaints[]、summary。

**实现细节**：Prompt 里把完整 Schema 喂给 LLM，要求"只输出纯 JSON"。返回后用正则兜底抠 JSON（兼容 LLM 加的 markdown 代码块或前后缀）。
