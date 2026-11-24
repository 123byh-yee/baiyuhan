// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Bai_kbModel = require('../models/Bai_kbModel');
const { Bai_extractText } = require('../services/Bai_textExtractor');
const { Bai_chunkText } = require('../services/Bai_chunker');
const { Bai_retrieve } = require('../services/Bai_retriever');

const Bai_API_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const Bai_MODEL = 'deepseek-ai/DeepSeek-V4-Flash';
const Bai_TIMEOUT = 120000;
const Bai_MAX_ATTEMPTS = 3;
const Bai_RETRY_DELAY = 800;
const Bai_ALLOWED_EXT = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];

const Bai_uploadDir = path.join(__dirname, '..', 'uploads', 'kb');
fs.mkdirSync(Bai_uploadDir, { recursive: true });

// 中文文件名在 multipart 中常被按 latin1 解码，这里做一次纠正
function Bai_decodeName(Bai_name) {
  if (/[\u4e00-\u9fa5]/.test(Bai_name)) {
    return Bai_name;
  }
  const Bai_fixed = Buffer.from(Bai_name, 'latin1').toString('utf8');
  return Bai_fixed.indexOf('\uFFFD') >= 0 ? Bai_name : Bai_fixed;
}

const Bai_storage = multer.diskStorage({
  destination: function (Bai_req, Bai_file, Bai_cb) {
    Bai_cb(null, Bai_uploadDir);
  },
  filename: function (Bai_req, Bai_file, Bai_cb) {
    const Bai_ext = path.extname(Bai_decodeName(Bai_file.originalname)).toLowerCase();
    Bai_cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + Bai_ext);
  }
});

const Bai_multer = multer({
  storage: Bai_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (Bai_req, Bai_file, Bai_cb) {
    const Bai_ext = path.extname(Bai_decodeName(Bai_file.originalname)).toLowerCase();
    if (Bai_ALLOWED_EXT.indexOf(Bai_ext) === -1) {
      Bai_cb(new Error('不支持的文件类型：' + Bai_ext + '，仅支持 ' + Bai_ALLOWED_EXT.join(' / ')));
      return;
    }
    Bai_cb(null, true);
  }
});

// 包一层，把 multer 的错误转成统一 JSON
const Bai_uploadMiddleware = function (Bai_req, Bai_res, Bai_next) {
  Bai_multer.single('file')(Bai_req, Bai_res, function (Bai_error) {
    if (Bai_error) {
      console.error('[文件上传失败]', Bai_error.message);
      Bai_res.json({ code: 400, msg: Bai_error.message || '文件上传失败', data: null });
      return;
    }
    Bai_next();
  });
};

// 提取网络错误原因
function Bai_describeCause(Bai_error) {
  if (!Bai_error) {
    return '未知错误';
  }
  if (Bai_error.name === 'TimeoutError' || Bai_error.name === 'AbortError') {
    return '请求超时';
  }
  if (Bai_error.cause) {
    return Bai_error.cause.code || Bai_error.cause.message || Bai_error.message;
  }
  return Bai_error.message || '未知错误';
}

// 调用大模型（带重试），发送与接收都打印到控制台
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
        '[大模型调用异常] 第 ' + Bai_attempt + '/' + Bai_MAX_ATTEMPTS + ' 次：' +
        Bai_error.message + '（' + Bai_describeCause(Bai_error) + '）'
      );
      if (Bai_attempt < Bai_MAX_ATTEMPTS) {
        await new Promise(function (Bai_resolve) {
          setTimeout(Bai_resolve, Bai_RETRY_DELAY);
        });
      }
    }
  }

  throw Bai_lastError;
}

// POST /api/kb/upload —— 上传并解析知识库文件
const Bai_uploadDoc = async (Bai_req, Bai_res) => {
  if (!Bai_req.file) {
    Bai_res.json({ code: 400, msg: '请选择要上传的文件（字段名 file）', data: null });
    return;
  }

  const Bai_filePath = Bai_req.file.path;
  const Bai_originalName = Bai_decodeName(Bai_req.file.originalname);
  const Bai_ext = path.extname(Bai_originalName).toLowerCase();

  try {
    const Bai_text = await Bai_extractText(Bai_filePath);
    const Bai_chunks = Bai_chunkText(Bai_text, 400, 60);

    if (!Bai_chunks.length) {
      fs.unlink(Bai_filePath, function () {});
      Bai_res.json({ code: 400, msg: '未从文件中解析到有效文本，请确认文件内容', data: null });
      return;
    }

    const Bai_docId = await Bai_kbModel.Bai_createDoc({
      Bai_name: Bai_originalName,
      Bai_type: Bai_ext,
      Bai_size: Bai_req.file.size,
      Bai_file_path: Bai_filePath,
      Bai_chunk_count: Bai_chunks.length,
      Bai_status: 'ready'
    });

    await Bai_kbModel.Bai_insertChunks(Bai_docId, Bai_originalName, Bai_chunks);

    console.log('[知识库解析完成] ' + Bai_originalName + '，文本 ' + Bai_text.length + ' 字，切分 ' + Bai_chunks.length + ' 段');
    console.log('[首个片段预览] ' + Bai_chunks[0].Bai_content.slice(0, 120));

    Bai_res.json({
      code: 0,
      msg: '上传并解析成功',
      data: {
        Bai_id: Bai_docId,
        Bai_name: Bai_originalName,
        Bai_type: Bai_ext,
        Bai_chars: Bai_text.length,
        Bai_chunkCount: Bai_chunks.length
      }
    });
  } catch (Bai_error) {
    console.error('[知识库文件解析失败]', Bai_error);
    fs.unlink(Bai_filePath, function () {});
    Bai_res.json({ code: 500, msg: '文件解析失败：' + Bai_error.message, data: null });
  }
};

// GET /api/kb/docs —— 知识库文档列表
const Bai_listDocs = async (Bai_req, Bai_res) => {
  try {
    const Bai_docs = await Bai_kbModel.Bai_findDocs();
    const Bai_chunkTotal = Bai_docs.reduce(function (Bai_sum, Bai_doc) {
      return Bai_sum + Number(Bai_doc.Bai_chunk_count || 0);
    }, 0);

    Bai_res.json({
      code: 0,
      msg: '获取成功',
      data: {
        Bai_total: Bai_docs.length,
        Bai_chunkTotal: Bai_chunkTotal,
        Bai_allowedExt: Bai_ALLOWED_EXT,
        Bai_list: Bai_docs
      }
    });
  } catch (Bai_error) {
    console.error('[获取知识库列表失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '获取知识库列表失败：' + Bai_error.message, data: null });
  }
};

// DELETE /api/kb/docs/:id —— 删除文档及其片段
const Bai_deleteDoc = async (Bai_req, Bai_res) => {
  const Bai_id = Number(Bai_req.params.id);
  if (!Bai_id) {
    Bai_res.json({ code: 400, msg: '文档 id 不合法', data: null });
    return;
  }

  try {
    const Bai_doc = await Bai_kbModel.Bai_findDocById(Bai_id);
    if (!Bai_doc) {
      Bai_res.json({ code: 404, msg: '文档不存在', data: null });
      return;
    }

    await Bai_kbModel.Bai_deleteDoc(Bai_id);

    if (Bai_doc.Bai_file_path && fs.existsSync(Bai_doc.Bai_file_path)) {
      fs.unlink(Bai_doc.Bai_file_path, function () {});
    }

    console.log('[知识库文档已删除] id=' + Bai_id + '，名称=' + Bai_doc.Bai_name);
    Bai_res.json({ code: 0, msg: '删除成功', data: { Bai_id: Bai_id, Bai_name: Bai_doc.Bai_name } });
  } catch (Bai_error) {
    console.error('[删除知识库文档失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '删除失败：' + Bai_error.message, data: null });
  }
};

// POST /api/kb/ask —— 基于知识库检索后回答
const Bai_ask = async (Bai_req, Bai_res) => {
  const Bai_question = String((Bai_req.body && Bai_req.body.question) || '').trim();
  if (!Bai_question) {
    Bai_res.json({ code: 400, msg: 'question 不能为空', data: null });
    return;
  }

  try {
    const Bai_chunks = await Bai_kbModel.Bai_findAllChunks();
    if (!Bai_chunks.length) {
      Bai_res.json({ code: 400, msg: '知识库为空，请先上传知识库文件', data: null });
      return;
    }

    const Bai_top = Bai_retrieve(Bai_chunks, Bai_question, 4);
    if (!Bai_top.length) {
      Bai_res.json({ code: 400, msg: '知识库中没有检索到相关内容，请更换问法或补充资料', data: null });
      return;
    }

    const Bai_context = Bai_top
      .map(function (Bai_item, Bai_index) {
        const Bai_chunk = Bai_item.Bai_chunk;
        return '【资料' + (Bai_index + 1) + '｜' + Bai_chunk.Bai_doc_name + ' 第' + (Bai_chunk.Bai_index + 1) + '段】\n' + Bai_chunk.Bai_content;
      })
      .join('\n\n');

    const Bai_payload = {
      model: Bai_MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是「知乎的模仿和制作」项目的智能客服。请严格依据下面提供的知识库资料回答问题；' +
            '资料中没有的信息要明确说明「知识库中暂无相关内容」，不要编造。回答使用简体中文，条理清晰。\n\n' +
            Bai_context
        },
        { role: 'user', content: Bai_question }
      ]
    };

    console.log('\n[知识库检索] 命中 ' + Bai_top.length + ' 段：' +
      Bai_top.map(function (Bai_item) {
        return Bai_item.Bai_chunk.Bai_doc_name + '#' + (Bai_item.Bai_chunk.Bai_index + 1) + '(' + Bai_item.Bai_score.toFixed(2) + ')';
      }).join('，'));
    console.log('[发送给大模型] POST ' + Bai_API_URL);
    console.log(JSON.stringify(Bai_payload, null, 2));

    const Bai_startedAt = Date.now();
    let Bai_response = null;

    try {
      Bai_response = await Bai_callModel(Bai_payload);
    } catch (Bai_error) {
      const Bai_isTimeout = Bai_error && (Bai_error.name === 'TimeoutError' || Bai_error.name === 'AbortError');
      Bai_res.json({
        code: Bai_isTimeout ? 5004 : 5005,
        msg: (Bai_isTimeout ? '大模型响应超时：' : '调用大模型失败：') + Bai_describeCause(Bai_error) + '（已重试 ' + Bai_MAX_ATTEMPTS + ' 次）',
        data: null
      });
      return;
    }

    const Bai_text = await Bai_response.text();
    let Bai_data = null;
    try {
      Bai_data = JSON.parse(Bai_text);
    } catch (Bai_parseError) {
      Bai_data = null;
    }

    console.log('[大模型返回] HTTP ' + Bai_response.status);
    console.log(Bai_data ? JSON.stringify(Bai_data, null, 2) : Bai_text);

    if (!Bai_response.ok) {
      Bai_res.json({
        code: 5003,
        msg: '大模型接口调用失败：' + ((Bai_data && Bai_data.message) || 'HTTP ' + Bai_response.status),
        data: { Bai_status: Bai_response.status }
      });
      return;
    }

    const Bai_choice = (Bai_data && Bai_data.choices && Bai_data.choices[0]) || {};
    const Bai_answer = (Bai_choice.message && Bai_choice.message.content) || '';

    Bai_res.json({
      code: 0,
      msg: '回答成功',
      data: {
        Bai_question: Bai_question,
        Bai_answer: Bai_answer,
        Bai_model: (Bai_data && Bai_data.model) || Bai_MODEL,
        Bai_usage: (Bai_data && Bai_data.usage) || null,
        Bai_elapsed: Date.now() - Bai_startedAt,
        Bai_refs: Bai_top.map(function (Bai_item) {
          return {
            Bai_docName: Bai_item.Bai_chunk.Bai_doc_name,
            Bai_index: Bai_item.Bai_chunk.Bai_index + 1,
            Bai_score: Number(Bai_item.Bai_score.toFixed(3)),
            Bai_snippet: Bai_item.Bai_chunk.Bai_content.slice(0, 120)
          };
        })
      }
    });
  } catch (Bai_error) {
    console.error('[知识库问答失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '知识库问答失败：' + Bai_error.message, data: null });
  }
};

module.exports = {
  Bai_uploadMiddleware,
  Bai_uploadDoc,
  Bai_listDocs,
  Bai_deleteDoc,
  Bai_ask
};
