<!--
姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 知乎的模仿和制作

- 姓名：白雨涵
- 学号：24001010326
- 项目类别：模仿
- 项目说明：使用原生 HTML / CSS / JavaScript 仿制知乎问答社区，配合 Node.js + Express + MySQL 提供数据服务；不使用任何第三方前端框架、UI 库与 CDN 资源。

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | 原生 HTML、CSS、JavaScript（含 Canvas 动画） |
| 后端 | Node.js + Express（RESTful + MVC） |
| 数据库 | MySQL 9.0 |
| 端口 | 8326 |

## 目录结构

```
白雨涵全栈开发/
├── frontend/                 # 前端（由 Express 静态托管）
│   ├── index.html            # 首页：项目信息 + 页面导航
│   ├── css/                  # 样式
│   ├── js/                   # 脚本（canvas 背景动画）
│   ├── fonts/                # iconfont 图标（如有）
│   └── images/               # 图片资源
├── backend/
│   ├── app.js                # Express 应用装配（跨域、静态托管、路由）
│   ├── server.js             # 启动入口，端口 8326
│   ├── config/Bai_db.js      # MySQL 连接池
│   ├── routes/               # 路由层
│   ├── controllers/          # 控制层
│   ├── models/               # 数据模型层
│   ├── .env                  # 数据库凭据（不提交到 Git）
│   ├── Bai_interface.md      # 接口记录
│   └── Bai_database.md       # 数据库脚本记录
├── AGENTS.md                 # 项目开发规则
├── Bai_prompt.md             # 提示词记录
└── readme.md
```

## 本地运行

1. 安装后端依赖（在 `backend/` 目录下）：

```bash
cnpm i
# 若 cnpm 不可用或超时
npm i
```

2. 准备数据库：

- 确认 MySQL 已启动；
- 在 `backend/.env` 中配置 `DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`；
- 按 `backend/Bai_database.md` 执行 SQL 即可完整重建数据库。

3. 启动服务：

```bash
cd backend
node server.js
```

4. 浏览器访问 <http://localhost:8326>

## 接口约定

- 所有接口统一以 `/api/` 为前缀；
- 统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

- `code = 0` 表示成功，非 0 表示失败；
- 接口明细见 `backend/Bai_interface.md`。
