// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 健康检查：确认服务运行与数据库连接状态
const Bai_health = async (Bai_req, Bai_res) => {
  try {
    const [Bai_rows] = await Bai_pool.query(
      'SELECT VERSION() AS Bai_version, DATABASE() AS Bai_database, NOW() AS Bai_now'
    );
    Bai_res.json({ code: 0, msg: '服务运行正常', data: Bai_rows[0] });
  } catch (Bai_error) {
    console.error('[健康检查失败]', Bai_error);
    Bai_res.json({ code: 5001, msg: '数据库连接失败：' + Bai_error.message, data: null });
  }
};

module.exports = { Bai_health };
