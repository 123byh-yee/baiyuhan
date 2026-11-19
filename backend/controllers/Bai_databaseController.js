// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 将 MySQL 错误码翻译为中文提示
function Bai_describeError(Bai_error) {
  switch (Bai_error.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return '用户名或密码错误，MySQL 拒绝访问';
    case 'ER_BAD_DB_ERROR':
      return '指定的数据库不存在';
    case 'ECONNREFUSED':
      return '无法连接 MySQL 服务，请确认服务已启动';
    case 'ETIMEDOUT':
      return '连接 MySQL 超时，请检查主机与端口';
    case 'ENOTFOUND':
      return '找不到数据库主机地址';
    case 'ER_NOT_SUPPORTED_AUTH_MODE':
      return 'MySQL 认证方式不受当前驱动支持';
    default:
      return '连接失败：' + (Bai_error.message || '未知错误');
  }
}

// 认证类错误统一使用 4001，其余使用 5002
function Bai_errorCode(Bai_error) {
  return Bai_error.code === 'ER_ACCESS_DENIED_ERROR' ? 4001 : 5002;
}

// POST /api/db/test —— 使用前端提交的用户名、密码测试 MySQL 连接
const Bai_testConnection = async (Bai_req, Bai_res) => {
  const Bai_body = Bai_req.body || {};
  const Bai_username = (Bai_body.username || '').trim();
  const Bai_password = Bai_body.password || '';

  if (!Bai_username || !Bai_password) {
    Bai_res.json({ code: 400, msg: '用户名和密码不能为空', data: null });
    return;
  }

  const Bai_startedAt = Date.now();
  let Bai_connection = null;

  try {
    Bai_connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: 3306,
      user: Bai_username,
      password: Bai_password,
      connectTimeout: 8000
    });

    const [Bai_infoRows] = await Bai_connection.query(
      'SELECT VERSION() AS Bai_version, CURRENT_USER() AS Bai_currentUser'
    );
    const [Bai_databaseRows] = await Bai_connection.query('SHOW DATABASES');

    Bai_res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        Bai_host: (process.env.DB_HOST || '127.0.0.1') + ':3306',
        Bai_version: Bai_infoRows[0].Bai_version,
        Bai_currentUser: Bai_infoRows[0].Bai_currentUser,
        Bai_databaseCount: Bai_databaseRows.length,
        Bai_databaseList: Bai_databaseRows
          .map((Bai_item) => Bai_item.Database)
          .filter((Bai_name) => ['information_schema', 'performance_schema', 'mysql', 'sys'].indexOf(Bai_name) === -1),
        Bai_elapsed: Date.now() - Bai_startedAt
      }
    });
  } catch (Bai_error) {
    console.error('[数据库连接失败]', Bai_error.code, Bai_error.message);
    Bai_res.json({
      code: Bai_errorCode(Bai_error),
      msg: Bai_describeError(Bai_error),
      data: {
        Bai_errorCode: Bai_error.code || 'UNKNOWN',
        Bai_errorNumber: Bai_error.errno || 0
      }
    });
  } finally {
    if (Bai_connection) {
      try {
        await Bai_connection.end();
      } catch (Bai_closeError) {
        console.error('[关闭连接失败]', Bai_closeError.message);
      }
    }
  }
};

module.exports = { Bai_testConnection };
