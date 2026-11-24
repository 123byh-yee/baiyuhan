// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Bai_pool = require('../config/Bai_db');

// === 预先设计好的返回 JSON Schema ===
// Harness Engineering 要求：把自然语言 → 结构化 JSON
// 本 Schema 覆盖：情感分类、实体抽取、关键短语、建议/投诉分类
const Bai_JSON_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Harness_Analysis_Result",
  "type": "object",
  "required": ["sentiment", "entities", "key_phrases", "suggestions", "complaints", "summary"],
  "properties": {
    "sentiment": {
      "type": "object",
      "description": "情感分类结果",
      "required": ["label", "score", "confidence"],
      "properties": {
        "label": {
          "type": "string",
          "enum": ["positive", "negative", "neutral", "mixed"],
          "description": "情感极性：positive 积极 / negative 消极 / neutral 中性 / mixed 混合"
        },
        "score": {
          "type": "number",
          "minimum": -1,
          "maximum": 1,
          "description": "情感得分，-1 最消极，+1 最积极"
        },
        "confidence": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "置信度，0-1"
        }
      }
    },
    "entities": {
      "type": "array",
      "description": "实体抽取：从文本中识别出的品牌 / 产品 / 人名 / 地点 / 组织 / 时间 等",
      "items": {
        "type": "object",
        "required": ["text", "type"],
        "properties": {
          "text": { "type": "string", "description": "实体文本" },
          "type": {
            "type": "string",
            "enum": ["PRODUCT", "BRAND", "PERSON", "LOCATION", "ORGANIZATION", "TIME", "PRICE", "OTHER"],
            "description": "实体类型"
          },
          "sentiment": {
            "type": "string",
            "enum": ["positive", "negative", "neutral"],
            "description": "针对该实体的子情感"
          }
        }
      }
    },
    "key_phrases": {
      "type": "array",
      "description": "关键短语：影响评价的核心短语",
      "items": {
        "type": "object",
        "properties": {
          "phrase": { "type": "string" },
          "importance": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    },
    "suggestions": {
      "type": "array",
      "description": "建议类内容：用户推荐、点赞、复购意愿",
      "items": { "type": "string" }
    },
    "complaints": {
      "type": "array",
      "description": "投诉/抱怨类内容",
      "items": { "type": "string" }
    },
    "summary": {
      "type": "string",
      "description": "一句话总结全文（不超过 50 字）"
    }
  }
};

const Bai_API_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const Bai_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash';
const Bai_TIMEOUT = 60000;
const Bai_MAX_ATTEMPTS = 2;

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
      if (Bai_attempt < Bai_MAX_ATTEMPTS) {
        await new Promise(function (Bai_resolve) { setTimeout(Bai_resolve, 500); });
      }
    }
  }
  throw Bai_lastError;
}

// 把 LLM 输出里的 JSON 片段抠出来（兼容 LLM 可能加的前后缀）
function Bai_extractJson(Bai_text) {
  Bai_text = String(Bai_text || '').trim();
  // 如果直接能 parse，最好
  try { return JSON.parse(Bai_text); } catch (e) {}
  // 找第一个 { 和最后一个 }
  const Bai_start = Bai_text.indexOf('{');
  const Bai_end = Bai_text.lastIndexOf('}');
  if (Bai_start >= 0 && Bai_end > Bai_start) {
    try { return JSON.parse(Bai_text.slice(Bai_start, Bai_end + 1)); } catch (e) {}
  }
  // ```json ... ``` 代码块
  const Bai_codeMatch = Bai_text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (Bai_codeMatch) {
    try { return JSON.parse(Bai_codeMatch[1].trim()); } catch (e) {}
  }
  return null;
}

// === 接口 ===

// GET /api/harness/schema —— 返回预设计的 JSON Schema
const Bai_getSchema = async (Bai_req, Bai_res) => {
  Bai_res.json({
    code: 0,
    msg: 'Schema 设计稿',
    data: Bai_JSON_SCHEMA
  });
};

// POST /api/harness/analyze —— 分析一段文本
const Bai_analyze = async (Bai_req, Bai_res) => {
  const Bai_text = String((Bai_req.body && Bai_req.body.text) || '').trim();
  if (!Bai_text) {
    Bai_res.json({ code: 400, msg: 'text 不能为空', data: null });
    return;
  }

  try {
    const Bai_prompt =
      '你是一个商业评论分析器。请严格按照下面的 JSON Schema 对给定文本进行情感分类和实体抽取，只输出纯 JSON，不要任何 markdown 或额外解释。\n\n' +
      'JSON Schema：\n' + JSON.stringify(Bai_JSON_SCHEMA, null, 2) + '\n\n' +
      '待分析文本：\n"' + Bai_text + '"';

    const Bai_payload = {
      model: Bai_MODEL,
      messages: [
        { role: 'system', content: '你只能输出符合指定 schema 的 JSON，不要输出任何其它内容。' },
        { role: 'user', content: Bai_prompt }
      ],
      temperature: 0.2
    };

    console.log('\n[Harness 分析] 输入长度 ' + Bai_text.length);
    console.log('[发送给大模型] POST ' + Bai_API_URL);
    console.log(Bai_text.slice(0, 200) + (Bai_text.length > 200 ? '…' : ''));

    const Bai_startedAt = Date.now();
    let Bai_response;
    try {
      Bai_response = await Bai_callModel(Bai_payload);
    } catch (Bai_error) {
      Bai_res.json({ code: 5005, msg: '调用大模型失败：' + Bai_describeCause(Bai_error), data: null });
      return;
    }

    const Bai_respText = await Bai_response.text();
    let Bai_data = null;
    try { Bai_data = JSON.parse(Bai_respText); } catch (e) {}

    console.log('[大模型返回] HTTP ' + Bai_response.status);
    if (Bai_data && Bai_data.choices) {
      console.log('content: ' + (Bai_data.choices[0].message.content || '').slice(0, 300));
    } else {
      console.log(Bai_respText.slice(0, 500));
    }

    if (!Bai_response.ok) {
      Bai_res.json({ code: 5003, msg: '大模型返回错误：HTTP ' + Bai_response.status, data: null });
      return;
    }

    const Bai_raw = (Bai_data && Bai_data.choices && Bai_data.choices[0].message && Bai_data.choices[0].message.content) || '';
    const Bai_parsed = Bai_extractJson(Bai_raw);

    if (!Bai_parsed) {
      Bai_res.json({ code: 5003, msg: '大模型返回无法解析为 JSON', data: { Bai_raw: Bai_raw } });
      return;
    }

    // 入库
    let Bai_recordId = null;
    try {
      const Bai_insertSql = 'INSERT INTO Bai_harness_record (Bai_input_text, Bai_output_json, Bai_mode, Bai_create_time) VALUES (?, ?, ?, NOW())';
      const [Bai_insertResult] = await Bai_pool.execute(Bai_insertSql, [
        Bai_text, JSON.stringify(Bai_parsed), 'full'
      ]);
      Bai_recordId = Bai_insertResult.insertId;
    } catch (Bai_dbError) {
      console.error('[Harness 入库失败]', Bai_dbError.message);
    }

    Bai_res.json({
      code: 0,
      msg: '分析成功',
      data: {
        Bai_recordId: Bai_recordId,
        Bai_inputText: Bai_text,
        Bai_analysis: Bai_parsed,
        Bai_elapsed: Date.now() - Bai_startedAt
      }
    });
  } catch (Bai_error) {
    console.error('[Harness 分析失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

// GET /api/harness/list —— 历史
const Bai_listRecords = async (Bai_req, Bai_res) => {
  try {
    const Bai_limit = Number(Bai_req.query.limit) || 20;
    const [Bai_rows] = await Bai_pool.execute(
      'SELECT * FROM Bai_harness_record ORDER BY Bai_create_time DESC LIMIT ' + Bai_limit
    );
    Bai_rows.forEach(function (Bai_r) {
      try { Bai_r.Bai_output_json = JSON.parse(Bai_r.Bai_output_json); } catch (e) {}
    });
    Bai_res.json({ code: 0, msg: '获取成功', data: { Bai_total: Bai_rows.length, Bai_list: Bai_rows } });
  } catch (Bai_error) {
    Bai_res.json({ code: 5003, msg: Bai_error.message, data: null });
  }
};

module.exports = { Bai_getSchema, Bai_analyze, Bai_listRecords, Bai_JSON_SCHEMA };
