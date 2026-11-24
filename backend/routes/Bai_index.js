// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const express = require('express');
const { Bai_health } = require('../controllers/Bai_healthController');
const { Bai_testConnection } = require('../controllers/Bai_databaseController');
const { Bai_getNewsList } = require('../controllers/Bai_newsController');
const { Bai_getGalleryList } = require('../controllers/Bai_galleryController');
const Bai_chat = require('../controllers/Bai_chatController');
const Bai_kb = require('../controllers/Bai_kbController');
const Bai_image = require('../controllers/Bai_imageController');
const Bai_harness = require('../controllers/Bai_harnessController');

const Bai_router = express.Router();

// 服务与数据库健康检查
Bai_router.get('/health', Bai_health);

// 数据库连接测试
Bai_router.post('/db/test', Bai_testConnection);

// 科技新闻列表
Bai_router.get('/news', Bai_getNewsList);

// 科技图文列表
Bai_router.get('/gallery', Bai_getGalleryList);

// AI 聊天（增强版：带持久化 + 自动压缩）
Bai_router.get('/chat/sessions', Bai_chat.Bai_listSessions);
Bai_router.post('/chat/sessions', Bai_chat.Bai_createSession);
Bai_router.delete('/chat/sessions/:id', Bai_chat.Bai_deleteSession);
Bai_router.get('/chat/sessions/:id/messages', Bai_chat.Bai_getSessionMessages);
Bai_router.post('/chat', Bai_chat.Bai_chat);

// 知识库（RAG）：上传、列表、删除、问答
Bai_router.get('/kb/docs', Bai_kb.Bai_listDocs);
Bai_router.post('/kb/upload', Bai_kb.Bai_uploadMiddleware, Bai_kb.Bai_uploadDoc);
Bai_router.delete('/kb/docs/:id', Bai_kb.Bai_deleteDoc);
Bai_router.post('/kb/ask', Bai_kb.Bai_ask);

// 图像识别：上传图片调用视觉大模型
Bai_router.get('/image/records', Bai_image.Bai_listRecords);
Bai_router.post('/image/recognize', Bai_image.Bai_uploadMiddleware, Bai_image.Bai_recognize);

// Harness Engineering：情感分类 + 实体抽取
Bai_router.post('/harness/analyze', Bai_harness.Bai_analyze);
Bai_router.get('/harness/schema', Bai_harness.Bai_getSchema);
Bai_router.get('/harness/list', Bai_harness.Bai_listRecords);

module.exports = Bai_router;
