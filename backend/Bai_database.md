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

## 2026-11-19 14:18:00 — 创建科技新闻表 Bai_news 并插入 10 条测试数据

```sql
USE zhihu_clone;

CREATE TABLE Bai_news (
  Bai_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  Bai_title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  Bai_summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  Bai_category VARCHAR(50) NOT NULL COMMENT '所属分类',
  Bai_source VARCHAR(100) NOT NULL COMMENT '来源媒体',
  Bai_author VARCHAR(50) NOT NULL COMMENT '作者',
  Bai_publish_time DATETIME NOT NULL COMMENT '发布时间',
  Bai_views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '阅读量',
  PRIMARY KEY (Bai_id),
  KEY Bai_idx_category (Bai_category),
  KEY Bai_idx_publish_time (Bai_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科技新闻表';

INSERT INTO Bai_news (Bai_title, Bai_summary, Bai_category, Bai_source, Bai_author, Bai_publish_time, Bai_views) VALUES
('国产多模态大模型发布 2.0 版本，推理成本下降四成', '新版本在图文理解与长文档问答上均有明显提升，官方称单位推理成本较上一代下降约四成，并开放了面向开发者的调用接口。', '人工智能', '科技前沿观察', '林知远', '2026-11-19 09:20:00', 12864),
('新一代车规级 AI 芯片流片成功，算力提升至 512 TOPS', '该芯片采用 5nm 工艺，面向高阶辅助驾驶场景，单颗算力达到 512 TOPS，预计明年二季度进入量产阶段。', '芯片', '芯闻周报', '陈昊', '2026-11-18 16:45:00', 9341),
('云厂商上线 Serverless 推理服务，按毫秒计费', '开发者无需预置算力即可调用模型推理能力，冷启动时间压缩到 300 毫秒以内，闲置时不产生费用。', '云计算', '云端笔记', '周予安', '2026-11-18 10:12:00', 6217),
('折叠屏手机出货量同比增长 37%，铰链方案成竞争焦点', '第三方机构数据显示，折叠屏在高端市场的渗透率持续走高，水滴铰链与超薄玻璃成为厂商差异化重点。', '消费电子', '数码新视界', '苏晓棠', '2026-11-17 20:05:00', 15792),
('开源社区发布轻量级向量数据库，单机支持亿级向量检索', '该项目基于自研索引结构，在 16 核机器上实现亿级向量毫秒级召回，采用 Apache-2.0 协议开源。', '开源', '开源观察', '何嘉树', '2026-11-17 11:30:00', 4826),
('AI 编码助手引入代码库级上下文，重构任务通过率提升', '新版工具可索引整个代码仓库，在跨文件重构场景中的一次通过率提升明显，同时支持本地模型离线运行。', '人工智能', '开发者周刊', '沈亦白', '2026-11-16 15:40:00', 11305),
('新型液冷方案落地数据中心，PUE 降至 1.08', '采用冷板式液冷与余热回收组合方案后，该数据中心年均 PUE 降至 1.08，单机柜功率密度提升至 45kW。', '云计算', '数据中心观察', '罗佳宁', '2026-11-15 09:50:00', 3902),
('端侧语音识别模型体积压缩至 18MB，离线可用', '通过结构化剪枝与量化，该模型在保持识别准确率的前提下体积压缩到 18MB，可在中端手机芯片上实时运行。', '人工智能', '智能终端报', '顾清和', '2026-11-14 18:22:00', 7745),
('浏览器厂商收紧第三方 Cookie，广告技术栈加速重构', '主流浏览器将默认阻止第三方 Cookie，广告归因方案向隐私沙盒与设备端计算迁移，相关技术栈进入重构期。', '安全', '网络安全前线', '郑言', '2026-11-13 14:08:00', 5219),
('高校开源课程仓库上线，覆盖编译原理到分布式系统', '该仓库汇集十余门计算机专业课程的讲义、实验与参考答案，支持按章节浏览，已吸引数千名学生参与共建。', '开源', '开源观察', '何嘉树', '2026-11-12 08:35:00', 2864);
```

> 说明：`Bai_news` 共 10 条测试数据，覆盖人工智能、芯片、云计算、消费电子、开源、安全 6 个分类。

---

## 2026-11-19 14:42:00 — 创建科技图文表 Bai_gallery 并插入 8 条测试数据

```sql
USE zhihu_clone;

CREATE TABLE Bai_gallery (
  Bai_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文主键',
  Bai_title VARCHAR(120) NOT NULL COMMENT '图文标题',
  Bai_desc VARCHAR(300) NOT NULL COMMENT '图文描述',
  Bai_image VARCHAR(255) NOT NULL COMMENT '图片相对路径',
  Bai_category VARCHAR(50) NOT NULL COMMENT '所属分类',
  Bai_author VARCHAR(50) NOT NULL COMMENT '作者',
  Bai_likes INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  Bai_publish_time DATETIME NOT NULL COMMENT '发布时间',
  PRIMARY KEY (Bai_id),
  KEY Bai_idx_category (Bai_category),
  KEY Bai_idx_publish_time (Bai_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科技图文表';

INSERT INTO Bai_gallery (Bai_title, Bai_desc, Bai_image, Bai_category, Bai_author, Bai_likes, Bai_publish_time) VALUES
('多模态大模型 2.0 发布现场', '发布会主视觉以神经网络节点与数据流构成，强调图文、语音的统一理解能力。', '/images/Bai_gallery_1.jpg', '人工智能', '林知远', 328, '2026-11-19 09:20:00'),
('车规级 AI 芯片实物特写', '芯片采用 5nm 工艺，单颗算力 512 TOPS，主要面向高阶辅助驾驶场景。', '/images/Bai_gallery_2.jpg', '芯片', '陈昊', 276, '2026-11-18 16:45:00'),
('模块化数据中心机柜走廊', '新建数据中心采用模块化部署，单机柜功率密度提升至 45kW。', '/images/Bai_gallery_3.jpg', '云计算', '罗佳宁', 194, '2026-11-18 10:12:00'),
('折叠屏手机铰链与屏幕结构', '水滴铰链配合超薄玻璃方案，折痕控制与整机厚度进一步优化。', '/images/Bai_gallery_4.jpg', '消费电子', '苏晓棠', 412, '2026-11-17 20:05:00'),
('向量数据库演示环境', '轻量级向量数据库在单机上完成亿级向量检索，索引结构可视化如图。', '/images/Bai_gallery_5.jpg', '开源', '何嘉树', 158, '2026-11-17 11:30:00'),
('夜间编码与 AI 助手协作', '编码助手接入代码库级上下文后，跨文件重构场景的一次通过率明显提升。', '/images/Bai_gallery_6.jpg', '人工智能', '沈亦白', 503, '2026-11-16 15:40:00'),
('冷板式液冷管路实拍', '冷板式液冷结合余热回收，使数据中心年均 PUE 降至 1.08。', '/images/Bai_gallery_7.jpg', '云计算', '罗佳宁', 137, '2026-11-15 09:50:00'),
('端侧语音识别演示', '18MB 的端侧语音模型可在中端手机芯片上实时运行，断网环境下依旧可用。', '/images/Bai_gallery_8.jpg', '人工智能', '顾清和', 362, '2026-11-14 18:22:00');
```

> 说明：`Bai_gallery` 共 8 条测试数据；`Bai_image` 存放相对前端根目录的图片路径，
> 对应图片文件位于 `frontend/images/Bai_gallery_1.jpg` ～ `Bai_gallery_8.jpg`（本地生成，无外链）。

---

## 2026-11-23 14:10:00 — 知识库（RAG）表

### 1. 建表语句

```sql
CREATE TABLE IF NOT EXISTS Bai_kb_doc (
  Bai_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '文档主键',
  Bai_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  Bai_type VARCHAR(16) NOT NULL COMMENT '文件扩展名',
  Bai_size INT NOT NULL DEFAULT 0 COMMENT '文件字节数',
  Bai_file_path VARCHAR(500) NOT NULL COMMENT '服务器存储路径',
  Bai_chunk_count INT NOT NULL DEFAULT 0 COMMENT '切分片段数',
  Bai_status VARCHAR(16) NOT NULL DEFAULT 'ready' COMMENT '解析状态',
  Bai_upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文档表';

CREATE TABLE IF NOT EXISTS Bai_kb_chunk (
  Bai_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '片段主键',
  Bai_doc_id INT NOT NULL COMMENT '所属文档 id',
  Bai_doc_name VARCHAR(255) NOT NULL COMMENT '所属文档名',
  Bai_index INT NOT NULL COMMENT '片段序号（从 0 开始）',
  Bai_content TEXT NOT NULL COMMENT '片段文本',
  Bai_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY Bai_idx_doc (Bai_doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库片段表';
```

### 2. 测试数据（9 个知识库文件、10 个片段）

```sql
-- 文档表数据
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (1, '产品培训课件.pptx', '.pptx', 3124, 'backend/uploads/kb/1795414022918_obvgbx.pptx', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (2, '会员权益.txt', '.txt', 279, 'backend/uploads/kb/1795414023279_y9qi7s.txt', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (3, '发票说明.txt', '.txt', 307, 'backend/uploads/kb/1795414023298_l5uey5.txt', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (4, '售后政策.txt', '.txt', 366, 'backend/uploads/kb/1795414023319_lv77v9.txt', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (5, '支付方式.txt', '.txt', 312, 'backend/uploads/kb/1795414023339_je1chb.txt', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (6, '故障排查.txt', '.txt', 439, 'backend/uploads/kb/1795414023354_al9ks0.txt', 1, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (7, '智能客服FAQ.docx', '.docx', 1732, 'backend/uploads/kb/1795414023369_wm6x2f.docx', 2, 'ready', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (8, '物流配送.txt', '.txt', 291, 'backend/uploads/kb/1795414023403_dpa2tp.txt', 1, 'ready', '2026-11-23 14:07:03');

-- 片段表数据
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (1, 1, '产品培训课件.pptx', 0, '产品培训课件：社区功能导览\n知乎的模仿和制作 · 内部培训\n模块一：首页信息流\n首页展示推荐问题与热门回答\n支持按话题筛选与关键词搜索\n下拉自动加载更多内容\n模块二：提问与回答\n提问需填写标题、描述和至少一个话题\n回答支持文字与图片内容\n优质回答会被推荐到首页\n模块三：账号与安全\n支持手机号注册与验证码登录\n异常登录会触发安全提醒\n可在个人中心查看登录设备并退出', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (2, 2, '会员权益.txt', 0, '盐选会员权益说明\n会员可免费阅读盐选专栏、使用专属头像挂件、享有提问优先展示权益。\n会员有效期按自然日计算，到期后自动失效，续费可叠加时长。\n会员权益不可转让，同一账号最多可在 3 台设备登录。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (3, 3, '发票说明.txt', 0, '发票开具说明\n订单支付完成后可申请电子普通发票，开票金额为实付金额。\n开票路径：我的订单 - 申请发票，填写抬头与税号，1-3 个工作日内发送至预留邮箱。\n企业增值税专用发票需要提供营业执照与开票资料，审核通过后邮寄。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (4, 4, '售后政策.txt', 0, '会员售后与退款政策\n盐选会员购买后 7 天内未使用会员权益的，可申请全额退款；超过 7 天按剩余天数比例退款。\n申请路径：个人中心 - 会员中心 - 订单详情 - 申请退款，审核通过后 3 个工作日内原路退回。\n若因系统故障导致权益未到账，请联系在线客服核实后补发或退款。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (5, 5, '支付方式.txt', 0, '支付方式与发票说明\n本站支持微信支付、支付宝支付两种在线支付方式，暂不支持货到付款。\n支付成功后订单状态会变为「已支付」，若长时间未变更请勿重复支付并联系客服。\n支付遇到问题可提供订单号，客服会协助核对支付流水。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (6, 6, '故障排查.txt', 0, '常见故障排查指引\n无法登录：请确认网络正常，尝试清除浏览器缓存或更换浏览器，仍失败可重置密码。\n图片上传失败：单张图片不超过 5MB，支持 jpg、png、webp 格式，请压缩后重新上传。\n页面白屏：按 F12 打开控制台查看报错，或禁用浏览器插件后刷新重试。\n接口超时：可能是网络波动，请稍后重试；持续超时请截图联系客服。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (7, 7, '智能客服FAQ.docx', 0, '知乎模仿站 · 智能客服常见问题（FAQ）\nQ1：如何注册账号？答：在首页点击右上角「注册」，填写用户名、手机号与密码即可完成注册，注册后系统自动登录。\nQ2：忘记密码怎么办？答：在登录页点击「忘记密码」，输入注册手机号获取验证码，验证通过后可重置新密码。\nQ3：如何发起提问？答：登录后点击首页「提问」按钮，填写问题标题、问题描述并选择话题标签，提交后即可在信息流中查看。\nQ4：如何修改头像和昵称？答：进入「个人中心」-「编辑资料」，上传图片并填写昵称后保存，修改会实时生效。\nQ5：如何举报违规内容？答：在提问或回答右上角点击「更多」-「举报」，选择违规类型并提交，运营团队会在 24 小时内处理。\nQ6：如何关注话题？答：进入话题详情页点击「关注」，关注后可在此后信息流中优先看到该话题内容。\nQ7：回答可以修改吗？答：可以。进入「我的回答」点击编辑按钮，修改后保存，历史版本会保留记录。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (8, 7, '智能客服FAQ.docx', 1, 'Q8：账号被封禁如何申诉？答：在「帮助中心」提交申诉，填写账号与申诉理由，审核结果会在 3 个工作日内通过站内信通知。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (9, 8, '物流配送.txt', 0, '实体商品配送说明\n实体周边商品默认使用顺丰或中通快递，下单后 48 小时内发货。\n偏远地区（新疆、西藏、内蒙古部分区域）发货时间可能延长 1-2 天。\n订单发货后可在「我的订单」查看物流单号，支持在线查询轨迹。', '2026-11-23 14:07:03');
INSERT INTO Bai_kb_doc (Bai_id, Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status, Bai_upload_time) VALUES (9, 'PDF测试文档.pdf', '.pdf', 412, 'backend/uploads/kb/1795414240822_z9e1ei.pdf', 1, 'ready', '2026-11-23 14:10:40');
INSERT INTO Bai_kb_chunk (Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content, Bai_create_time) VALUES (10, 9, 'PDF测试文档.pdf', 0, 'PDF Knowledge Base Demo 2026\n-- 1 of 1 --', '2026-11-23 14:10:40');
```

> 说明：上传的原始文件保存在 `backend/uploads/kb/`（已被 `.gitignore` 排除），
> 表内 `Bai_file_path` 记录其相对项目根目录的路径；重建时需同步放置同名文件才能再次解析。

---

---

## 三、AI 聊天持久化

`sql
CREATE TABLE IF NOT EXISTS Bai_chat_session (
  Bai_id INT AUTO_INCREMENT PRIMARY KEY,
  Bai_title VARCHAR(255) NOT NULL DEFAULT '',
  Bai_summary TEXT NOT NULL,
  Bai_create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  Bai_update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 注意：MySQL 9.0 的 TEXT 列不允许设置 DEFAULT 值，
-- INSERT 时必须显式传值（后端 Bai_createSession 已显式传 ''）。

CREATE TABLE IF NOT EXISTS Bai_chat_message (
  Bai_id INT AUTO_INCREMENT PRIMARY KEY,
  Bai_session_id INT NOT NULL,
  Bai_role ENUM('user','assistant','system') NOT NULL,
  Bai_content TEXT NOT NULL,
  Bai_is_compressed TINYINT(1) NOT NULL DEFAULT 0,
  Bai_create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY Bai_idx_session (Bai_session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

**压缩触发逻辑**：每轮 /api/chat 返回后，后端检查 Bai_is_compressed=0 的消息条数，超过 20 时调用 LLM 对全部未压缩消息生成中文摘要（≤200 字），事务性地标记旧消息为 Bai_is_compressed=1 并更新 Bai_summary，同时保留最近 10 条不压缩。

---

## 四、Harness Engineering 分析记录

`sql
CREATE TABLE IF NOT EXISTS Bai_harness_record (
  Bai_id INT AUTO_INCREMENT PRIMARY KEY,
  Bai_input_text TEXT NOT NULL,
  Bai_output_json JSON NOT NULL,
  Bai_mode VARCHAR(32) NOT NULL DEFAULT 'full',
  Bai_create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

**测试数据（8 条评论）**：

`sql
INSERT INTO Bai_harness_record (Bai_input_text, Bai_output_json, Bai_mode, Bai_create_time) VALUES
('这款 iPhone 16 Pro Max 做工非常精致，钛金属边框手感一流，A18 Pro 芯片性能强劲，游戏体验极佳。但续航比宣传的要差一些，充电速度太慢，价格也偏贵，性价比一般。', '{"placeholder":true}', 'full', '2026-11-20 09:30:00'),
('昨天在星巴克望京店买了一杯拿铁，店员态度很好，出餐很快。咖啡味道不错，奶泡细腻。但店里座位有点脏，WiFi 信号也不稳定。总体体验 7/10。', '{"placeholder":true}', 'full', '2026-11-20 10:15:00'),
('北京今天的天气真糟糕，沙尘暴加上雾霾，完全不想出门。好在公司的远程办公政策很灵活，在家也能正常工作。京东昨天送的 MacBook Pro M5 也到了，拆箱很满意。', '{"placeholder":true}', 'full', '2026-11-20 11:42:00'),
('对比了华为 Mate70 和小米 15 Ultra，我最终选择了小米 15 Ultra。原因是镜头参数更强、价格便宜 2000 元、MIUI 更符合我的使用习惯。但不得不承认华为的信号确实好一些。', '{"placeholder":true}', 'full', '2026-11-21 08:55:00'),
('周末去了一次上海迪士尼乐园，排队两小时拍照五分钟，价格贵得离谱。但加勒比海盗和创极速光轮两个项目真的非常刺激，孩子玩得很开心。餐饮质量一般，建议自己带水。', '{"placeholder":true}', 'full', '2026-11-21 15:30:00'),
('OpenAI 的 o3 模型刚发布就爆了，推理能力确实比 GPT-4o 强不少，但 token 价格也翻了三倍。国内的 SiliconFlow 和 Moonshot 都第一时间接入了，生态跟进速度很快。', '{"placeholder":true}', 'full', '2026-11-22 11:08:00'),
('蔚来汽车的售后真的是业界标杆，换电站 3 分钟完成，比加油还快。但最近新车发布节奏太快，老车主心理落差大。电池质保政策很良心，这点值得点赞。', '{"placeholder":true}', 'full', '2026-11-22 16:20:00'),
('对比了小红书和抖音两个平台的算法推荐，小红书更精准但内容不够丰富，抖音内容量大但容易信息茧房。字节跳动的工程师效率确实高，产品迭代速度远超同行。', '{"placeholder":true}', 'full', '2026-11-22 19:45:00');
`

---
