// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Bai_chatSessionModel = require('../models/Bai_chatSessionModel');

const Bai_API_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const Bai_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash';
const Bai_SYSTEM_PROMPT = '你是一个有用的中文助手。请根据上下文准确回答用户问题。';
const Bai_COMPRESS_THRESHOLD = 20; // 未压缩消息超过 20 条时触发摘要
const Bai_KEEP_RECENT = 10;       // 压缩时保留最近 10 条不压缩
const Bai_TIMEOUT = 120000;
const Bai_MAX_ATTEMPTS = 3;
const Bai_RETRY_DELAY = 800;

// === 网络工具 ===
function Bai_describeCause(Bai_error) {
  if (!Bai_error) return '未知错误';
  if (Bai_error.name === 'TimeoutError' || Bai_error.name === 'AbortError') return '请求超时';
  if (Bai_error.cause) return Bai_error.cause.code || Bai_error.cause.message || Bai_error.message;
  return Bai_error.message || '未知错误';
}

async function Bai_callModel(Bai_payload) {
  let Bai_lastError = null;
  for (let Bai_attempt = 1; Bai_attempt <= Bai_MAX_ATTEMPTS; Bai_attempt += 1) {
    try {
      return await fetch(Bai_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.SILICON_API_KEY
        },
        body: JSON.stringify(Bai_payload),
        signal: AbortSignal.timeout(Bai_TIMEOUT)
      });
    } catch (Bai_error) {
      Bai_lastError = Bai_error;
      console.error(
        '[聊天模型调用异常] 第 ' + Bai_attempt + '/' + Bai_MAX_ATTEMPTS + ' 次：' +
        Bai_error.message + '（' + Bai_describeCause(Bai_error) + '）'
      );
      if (Bai_attempt < Bai_MAX_ATTEMPTS) {
        await new Promise(function (Bai_resolve) { setTimeout(Bai_resolve, Bai_RETRY_DELAY); });
      }
    }
  }
  throw Bai_lastError;
}

// 统一调用大模型 → 返回 { answer, usage, model } 或抛错
async function Bai_complete(Bai_messages) {
  const Bai_payload = { model: Bai_MODEL, messages: Bai_messages };

  let Bai_response;
  try {
    Bai_response = await Bai_callModel(Bai_payload);
  } catch (err) {
    throw new Error(Bai_describeCause(err) + '（已重试 ' + Bai_MAX_ATTEMPTS + ' 次）');
  }

  const Bai_text = await Bai_response.text();
  let Bai_data = null;
  try { Bai_data = JSON.parse(Bai_text); } catch (e) { Bai_data = null; }

  if (!Bai_response.ok) {
    throw new Error('HTTP ' + Bai_response.status + ' ' + ((Bai_data && Bai_data.message) || Bai_text.slice(0, 200)));
  }

  const Bai_choice = (Bai_data && Bai_data.choices && Bai_data.choices[0]) || {};
  return {
    Bai_answer: (Bai_choice.message && Bai_choice.message.content) || '',
    Bai_usage: (Bai_data && Bai_data.usage) || null,
    Bai_model: (Bai_data && Bai_data.model) || Bai_MODEL
  };
}

// === 历史压缩：让 LLM 把旧对话总结成一段中文摘要 ===
async function Bai_compressHistory(Bai_sessionId, Bai_oldSummary, Bai_messages) {
  if (Bai_messages.length === 0) return '';

  const Bai_texts = Bai_messages.map(function (Bai_m) {
    return (Bai_m.Bai_role === 'user' ? '用户' : '助手') + '：' + Bai_m.Bai_content;
  }).join('\n');

  const Bai_messagesLLM = [
    { role: 'system', content: '你是一个对话历史摘要器。请把下面的旧对话总结为一段不超过 200 字的中文摘要，保留关键事实、用户偏好、已达成的结论。用第一人称"我们"来指代。' },
    { role: 'user', content: Bai_texts }
  ];

  const Bai_result = await Bai_complete(Bai_messagesLLM);
  const Bai_newSummary = Bai_result.Bai_answer.trim();

  await Bai_chatSessionModel.Bai_markCompressed(Bai_sessionId, Bai_oldSummary, Bai_newSummary, Bai_KEEP_RECENT);
  console.log('[历史压缩] 会话 id=' + Bai_sessionId + '，摘要 → ' + Bai_newSummary.slice(0, 80) + '…');

  return Bai_newSummary;
}

// === 接口 ===

// GET /api/chat/sessions — 列出会话
const Bai_listSessions = async (Bai_req, Bai_res) => {
  try {
    const Bai_list = await Bai_chatSessionModel.Bai_listSessions();
    Bai_res.json({ code: 0, msg: '获取成功', data: { Bai_total: Bai_list.length, Bai_list: Bai_list } });
  } catch (Bai_error) {
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

// POST /api/chat/sessions — 新建会话
const Bai_createSession = async (Bai_req, Bai_res) => {
  try {
    const Bai_title = String((Bai_req.body && Bai_req.body.title) || '').trim() || '新会话';
    const Bai_id = await Bai_chatSessionModel.Bai_createSession(Bai_title);
    Bai_res.json({ code: 0, msg: '创建成功', data: { Bai_id: Bai_id, Bai_title: Bai_title } });
  } catch (Bai_error) {
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

// DELETE /api/chat/sessions/:id
const Bai_deleteSession = async (Bai_req, Bai_res) => {
  try {
    await Bai_chatSessionModel.Bai_deleteSession(Number(Bai_req.params.id));
    Bai_res.json({ code: 0, msg: '删除成功', data: null });
  } catch (Bai_error) {
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

// GET /api/chat/sessions/:id/messages — 取会话消息（摘要 + 未压缩消息）
const Bai_getSessionMessages = async (Bai_req, Bai_res) => {
  try {
    const Bai_sessionId = Number(Bai_req.params.id);
    const Bai_session = await Bai_chatSessionModel.Bai_getSession(Bai_sessionId);
    if (!Bai_session) {
      Bai_res.json({ code: 404, msg: '会话不存在', data: null });
      return;
    }
    const Bai_data = await Bai_chatSessionModel.Bai_getMessages(Bai_sessionId, Bai_KEEP_RECENT);
    Bai_res.json({
      code: 0,
      msg: '获取成功',
      data: {
        Bai_sessionId: Bai_sessionId,
        Bai_title: Bai_session.Bai_title,
        Bai_summary: Bai_data.Bai_summary,
        Bai_messages: Bai_data.Bai_messages
      }
    });
  } catch (Bai_error) {
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

// POST /api/chat — 增强版聊天，带持久化 + 自动压缩
const Bai_chat = async (Bai_req, Bai_res) => {
  const Bai_body = Bai_req.body || {};
  const Bai_sessionId = Number(Bai_body.sessionId) || 0;
  const Bai_userMsg = String((Bai_body.message) || '').trim();

  if (!Bai_userMsg) {
    Bai_res.json({ code: 400, msg: 'message 不能为空', data: null });
    return;
  }

  try {
    let Bai_sid = Bai_sessionId;

    // 如果没有 sessionId，自动创建一个
    if (!Bai_sid) {
      Bai_sid = await Bai_chatSessionModel.Bai_createSession(Bai_userMsg.slice(0, 20));
      console.log('[聊天] 新建会话 id=' + Bai_sid);
    }

    // 加载上下文
    const Bai_ctx = await Bai_chatSessionModel.Bai_getMessages(Bai_sid, Bai_KEEP_RECENT);

    // 组装 messages：system + 摘要作为 user 消息（如果有）+ 历史对话 + 当前问题
    const Bai_messages = [{ role: 'system', content: Bai_SYSTEM_PROMPT }];
    if (Bai_ctx.Bai_summary) {
      Bai_messages.push({ role: 'user', content:
        '[对话历史摘要（已压缩）]\n' + Bai_ctx.Bai_summary +
        '\n\n--- 以下是最近未压缩的对话 ---'
      });
    }
    Bai_ctx.Bai_messages.forEach(function (Bai_m) {
      Bai_messages.push({ role: Bai_m.Bai_role, content: Bai_m.Bai_content });
    });
    Bai_messages.push({ role: 'user', content: Bai_userMsg });

    // 先保存用户消息
    await Bai_chatSessionModel.Bai_saveMessage(Bai_sid, 'user', Bai_userMsg);

    console.log('\n[聊天请求] session=' + Bai_sid + '，历史消息 ' + Bai_ctx.Bai_messages.length + ' 条' +
      (Bai_ctx.Bai_summary ? '，已带摘要' : ''));
    console.log('[发送给大模型] POST ' + Bai_API_URL);
    console.log(JSON.stringify(Bai_messages, null, 2));

    const Bai_t0 = Date.now();
    const Bai_result = await Bai_complete(Bai_messages);

    // 保存助手回复
    await Bai_chatSessionModel.Bai_saveMessage(Bai_sid, 'assistant', Bai_result.Bai_answer);

    // 检查是否需要触发压缩
    const Bai_activeCount = await Bai_chatSessionModel.Bai_countActive(Bai_sid);
    let Bai_compressed = null;
    if (Bai_activeCount > Bai_COMPRESS_THRESHOLD) {
      console.log('[历史压缩触发] 当前 ' + Bai_activeCount + ' 条未压缩消息，超过阈值 ' + Bai_COMPRESS_THRESHOLD);
      // 取全部未压缩消息来做摘要
      const Bai_all = await Bai_chatSessionModel.Bai_getMessages(Bai_sid, 99999);
      Bai_compressed = await Bai_compressHistory(Bai_sid, Bai_ctx.Bai_summary, Bai_all.Bai_messages);
    }

    console.log('[聊天回答] 耗时 ' + (Date.now() - Bai_t0) + ' ms');

    Bai_res.json({
      code: 0,
      msg: '回答成功',
      data: {
        Bai_sessionId: Bai_sid,
        Bai_reply: Bai_result.Bai_answer,
        Bai_model: Bai_result.Bai_model,
        Bai_usage: Bai_result.Bai_usage,
        Bai_elapsed: Date.now() - Bai_t0,
        Bai_compressed: Bai_compressed
      }
    });
  } catch (Bai_error) {
    console.error('[聊天失败]', Bai_error);
    Bai_res.json({ code: 5005, msg: '调用大模型失败：' + Bai_error.message, data: null });
  }
};

module.exports = {
  Bai_chat,
  Bai_listSessions,
  Bai_createSession,
  Bai_deleteSession,
  Bai_getSessionMessages
};
