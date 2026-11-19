// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const express = require('express');
const { Bai_health } = require('../controllers/Bai_healthController');
const { Bai_testConnection } = require('../controllers/Bai_databaseController');
const { Bai_getNewsList } = require('../controllers/Bai_newsController');
const { Bai_getGalleryList } = require('../controllers/Bai_galleryController');

const Bai_router = express.Router();

// 服务与数据库健康检查
Bai_router.get('/health', Bai_health);

// 数据库连接测试
Bai_router.post('/db/test', Bai_testConnection);

// 科技新闻列表
Bai_router.get('/news', Bai_getNewsList);

// 科技图文列表
Bai_router.get('/gallery', Bai_getGalleryList);

module.exports = Bai_router;
