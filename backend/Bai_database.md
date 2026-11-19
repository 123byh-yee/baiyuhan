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
