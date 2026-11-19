// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// MySQL 连接池：凭据全部来自 backend/.env
const Bai_pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = Bai_pool;
