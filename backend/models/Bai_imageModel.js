// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 新建一条识别记录
async function Bai_createRecord(Bai_payload) {
  const Bai_sql =
    'INSERT INTO Bai_image_record (Bai_name, Bai_type, Bai_size, Bai_prompt, Bai_answer, Bai_model, Bai_elapsed, Bai_create_time) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
  const Bai_values = [
    Bai_payload.Bai_name || '',
    Bai_payload.Bai_type || '',
    Bai_payload.Bai_size || 0,
    Bai_payload.Bai_prompt || '',
    Bai_payload.Bai_answer || '',
    Bai_payload.Bai_model || '',
    Bai_payload.Bai_elapsed || 0
  ];
  const [Bai_result] = await Bai_pool.execute(Bai_sql, Bai_values);
  return Bai_result.insertId;
}

// 取最近的识别记录列表
async function Bai_findRecords(Bai_limit) {
  const Bai_sql = 'SELECT * FROM Bai_image_record ORDER BY Bai_create_time DESC LIMIT ' + (Number(Bai_limit) || 20);
  const [Bai_rows] = await Bai_pool.execute(Bai_sql);
  return Bai_rows;
}

module.exports = { Bai_createRecord, Bai_findRecords };
