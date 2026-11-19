// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');

const Bai_routes = require('./routes/Bai_index');

const Bai_app = express();

// 支持所有跨域访问
Bai_app.use(cors());
Bai_app.use(express.json());
Bai_app.use(express.urlencoded({ extended: true }));

// 托管前端静态资源（frontend 目录）
const Bai_frontendPath = path.join(__dirname, '..', 'frontend');
Bai_app.use(express.static(Bai_frontendPath));

// 所有接口统一以 /api 为前缀
Bai_app.use('/api', Bai_routes);

// 未匹配到的请求统一返回 JSON
Bai_app.use((Bai_req, Bai_res) => {
  Bai_res.status(404).json({ code: 404, msg: '接口或资源不存在', data: null });
});

// 统一错误处理
Bai_app.use((Bai_error, Bai_req, Bai_res, Bai_next) => {
  console.error('[服务器错误]', Bai_error);
  Bai_res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

module.exports = Bai_app;
