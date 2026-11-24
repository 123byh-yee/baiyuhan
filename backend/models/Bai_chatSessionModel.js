// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 新建会话
async function Bai_createSession(Bai_title) {
  const Bai_sql = 'INSERT INTO Bai_chat_session (Bai_title, Bai_summary, Bai_create_time) VALUES (?, \'\', NOW())';
  const [Bai_result] = await Bai_pool.execute(Bai_sql, [Bai_title || '新会话']);
  return Bai_result.insertId;
}

// 列出全部会话（按创建时间倒序）
async function Bai_listSessions() {
  const Bai_sql = 'SELECT * FROM Bai_chat_session ORDER BY Bai_create_time DESC';
  const [Bai_rows] = await Bai_pool.execute(Bai_sql);
  return Bai_rows;
}

// 取一个会话（含摘要）
async function Bai_getSession(Bai_id) {
  const Bai_sql = 'SELECT * FROM Bai_chat_session WHERE Bai_id = ?';
  const [Bai_rows] = await Bai_pool.execute(Bai_sql, [Number(Bai_id)]);
  return Bai_rows[0] || null;
}

// 取会话的完整消息列表（排除已被压缩的旧消息，只保留压缩后的摘要 + 近 N 条）
async function Bai_getMessages(Bai_sessionId, Bai_recentCount) {
  const Bai_n = Number(Bai_recentCount) || 10;
  // 先取摘要（如果有）
  const Bai_summarySql = 'SELECT Bai_summary FROM Bai_chat_session WHERE Bai_id = ?';
  const [Bai_sess] = await Bai_pool.execute(Bai_summarySql, [Bai_sessionId]);
  const Bai_summary = Bai_sess[0] && Bai_sess[0].Bai_summary;

  // 取最近 N 条消息
  const Bai_msgsSql =
    'SELECT Bai_role, Bai_content, Bai_create_time FROM Bai_chat_message ' +
    'WHERE Bai_session_id = ? AND Bai_is_compressed = 0 ' +
    'ORDER BY Bai_create_time DESC LIMIT ' + Bai_n;
  const [Bai_rows] = await Bai_pool.execute(Bai_msgsSql, [Bai_sessionId]);
  Bai_rows.reverse(); // 时间正序

  return {
    Bai_summary: Bai_summary || '',
    Bai_messages: Bai_rows
  };
}

// 保存一条消息
async function Bai_saveMessage(Bai_sessionId, Bai_role, Bai_content) {
  const Bai_sql =
    'INSERT INTO Bai_chat_message (Bai_session_id, Bai_role, Bai_content, Bai_create_time) ' +
    'VALUES (?, ?, ?, NOW())';
  const [Bai_result] = await Bai_pool.execute(Bai_sql, [Bai_sessionId, Bai_role, Bai_content]);
  return Bai_result.insertId;
}

// 取当前未压缩的消息条数
async function Bai_countActive(Bai_sessionId) {
  const Bai_sql = 'SELECT COUNT(*) AS c FROM Bai_chat_message WHERE Bai_session_id = ? AND Bai_is_compressed = 0';
  const [Bai_rows] = await Bai_pool.execute(Bai_sql, [Bai_sessionId]);
  return Number(Bai_rows[0].c);
}

// 事务性地标记一批消息为已压缩，并更新会话摘要
async function Bai_markCompressed(Bai_sessionId, Bai_oldSummary, Bai_newSummary, Bai_keepRecent) {
  const Bai_conn = await Bai_pool.getConnection();
  try {
    await Bai_conn.beginTransaction();

    // 找要保留的最新 N 条的最早一条 id，把比它老的都标记为压缩
    const Bai_keepSql =
      'SELECT Bai_id FROM Bai_chat_message WHERE Bai_session_id = ? AND Bai_is_compressed = 0 ' +
      'ORDER BY Bai_id DESC LIMIT ' + Number(Bai_keepRecent);
    const [Bai_keepRows] = await Bai_conn.execute(Bai_keepSql, [Bai_sessionId]);

    if (Bai_keepRows.length > 0) {
      const Bai_keepId = Bai_keepRows[Bai_keepRows.length - 1].Bai_id;
      await Bai_conn.execute(
        'UPDATE Bai_chat_message SET Bai_is_compressed = 1 WHERE Bai_session_id = ? AND Bai_id < ? AND Bai_is_compressed = 0',
        [Bai_sessionId, Bai_keepId]
      );
    }

    // 更新摘要（把旧摘要和新摘要合并）
    const Bai_combined = (Bai_oldSummary ? Bai_oldSummary + '\n' : '') + Bai_newSummary;
    await Bai_conn.execute(
      'UPDATE Bai_chat_session SET Bai_summary = ?, Bai_update_time = NOW() WHERE Bai_id = ?',
      [Bai_combined, Bai_sessionId]
    );

    await Bai_conn.commit();
  } catch (err) {
    await Bai_conn.rollback();
    throw err;
  } finally {
    Bai_conn.release();
  }
}

// 删除会话及其消息
async function Bai_deleteSession(Bai_sessionId) {
  const Bai_conn = await Bai_pool.getConnection();
  try {
    await Bai_conn.beginTransaction();
    await Bai_conn.execute('DELETE FROM Bai_chat_message WHERE Bai_session_id = ?', [Bai_sessionId]);
    await Bai_conn.execute('DELETE FROM Bai_chat_session WHERE Bai_id = ?', [Bai_sessionId]);
    await Bai_conn.commit();
  } catch (err) {
    await Bai_conn.rollback();
    throw err;
  } finally {
    Bai_conn.release();
  }
}

module.exports = {
  Bai_createSession,
  Bai_listSessions,
  Bai_getSession,
  Bai_getMessages,
  Bai_saveMessage,
  Bai_countActive,
  Bai_markCompressed,
  Bai_deleteSession
};
