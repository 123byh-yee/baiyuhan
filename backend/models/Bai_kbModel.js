// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 新增知识库文档，返回自增主键
async function Bai_createDoc(Bai_doc) {
  const [Bai_result] = await Bai_pool.query(
    'INSERT INTO Bai_kb_doc (Bai_name, Bai_type, Bai_size, Bai_file_path, Bai_chunk_count, Bai_status) VALUES (?, ?, ?, ?, ?, ?)',
    [Bai_doc.Bai_name, Bai_doc.Bai_type, Bai_doc.Bai_size, Bai_doc.Bai_file_path, Bai_doc.Bai_chunk_count, Bai_doc.Bai_status || 'ready']
  );
  return Bai_result.insertId;
}

// 批量写入片段
async function Bai_insertChunks(Bai_docId, Bai_docName, Bai_chunks) {
  if (!Bai_chunks.length) {
    return 0;
  }
  const Bai_values = Bai_chunks.map(function (Bai_chunk) {
    return [Bai_docId, Bai_docName, Bai_chunk.Bai_index, Bai_chunk.Bai_content];
  });
  const [Bai_result] = await Bai_pool.query(
    'INSERT INTO Bai_kb_chunk (Bai_doc_id, Bai_doc_name, Bai_index, Bai_content) VALUES ?',
    [Bai_values]
  );
  return Bai_result.affectedRows;
}

// 文档列表（按上传时间倒序）
async function Bai_findDocs() {
  const [Bai_rows] = await Bai_pool.query(
    'SELECT Bai_id, Bai_name, Bai_type, Bai_size, Bai_chunk_count, Bai_status, ' +
    "DATE_FORMAT(Bai_upload_time, '%Y-%m-%d %H:%i') AS Bai_uploadTime " +
    'FROM Bai_kb_doc ORDER BY Bai_upload_time DESC, Bai_id DESC'
  );
  return Bai_rows;
}

// 查询单个文档
async function Bai_findDocById(Bai_id) {
  const [Bai_rows] = await Bai_pool.query(
    'SELECT Bai_id, Bai_name, Bai_file_path FROM Bai_kb_doc WHERE Bai_id = ?',
    [Bai_id]
  );
  return Bai_rows[0] || null;
}

// 删除文档及其全部片段
async function Bai_deleteDoc(Bai_id) {
  const Bai_connection = await Bai_pool.getConnection();
  try {
    await Bai_connection.beginTransaction();
    await Bai_connection.query('DELETE FROM Bai_kb_chunk WHERE Bai_doc_id = ?', [Bai_id]);
    const [Bai_result] = await Bai_connection.query('DELETE FROM Bai_kb_doc WHERE Bai_id = ?', [Bai_id]);
    await Bai_connection.commit();
    return Bai_result.affectedRows;
  } catch (Bai_error) {
    await Bai_connection.rollback();
    throw Bai_error;
  } finally {
    Bai_connection.release();
  }
}

// 取出全部片段用于检索
async function Bai_findAllChunks() {
  const [Bai_rows] = await Bai_pool.query(
    'SELECT Bai_id, Bai_doc_id, Bai_doc_name, Bai_index, Bai_content FROM Bai_kb_chunk ORDER BY Bai_doc_id, Bai_index'
  );
  return Bai_rows;
}

module.exports = {
  Bai_createDoc,
  Bai_insertChunks,
  Bai_findDocs,
  Bai_findDocById,
  Bai_deleteDoc,
  Bai_findAllChunks
};
