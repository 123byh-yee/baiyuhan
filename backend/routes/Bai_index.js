// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const express = require('express');
const { Bai_health } = require('../controllers/Bai_healthController');

const Bai_router = express.Router();

// 服务与数据库健康检查
Bai_router.get('/health', Bai_health);

module.exports = Bai_router;
