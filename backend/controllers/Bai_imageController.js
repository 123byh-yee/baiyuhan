// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Bai_imageModel = require('../models/Bai_imageModel');

// SiliconFlow 视觉模型配置
const Bai_API_URL = process.env.SILICON_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const Bai_VL_MODEL = 'Qwen/Qwen3-VL-32B-Instruct';
const Bai_TIMEOUT = 120000;
const Bai_MAX_ATTEMPTS = 3;
const Bai_RETRY_DELAY = 800;

const Bai_ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const Bai_MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp'
};

const Bai_uploadDir = path.join(__dirname, '..', 'uploads', 'image');
fs.mkdirSync(Bai_uploadDir, { recursive: true });

// 纠正 multer 对中文文件名的 latin1 解码问题
function Bai_decodeName(Bai_name) {
  if (!Bai_name) {
    return Bai_name;
  }
  if (/[\u4e00-\u9fa5]/.test(Bai_name)) {
    return Bai_name;
  }
  const Bai_fixed = Buffer.from(Bai_name, 'latin1').toString('utf8');
  return Bai_fixed.indexOf('\uFFFD') >= 0 ? Bai_name : Bai_fixed;
}

// 用文件扩展名推断 MIME
function Bai_getMime(Bai_ext) {
  return Bai_MIME_MAP[Bai_ext] || 'image/jpeg';
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (Bai_req, Bai_file, Bai_cb) {
    const Bai_ext = path.extname(Bai_decodeName(Bai_file.originalname)).toLowerCase();
    if (Bai_ALLOWED_EXT.indexOf(Bai_ext) === -1) {
      Bai_cb(new Error('不支持的图片类型：' + Bai_ext + '，仅支持 ' + Bai_ALLOWED_EXT.join(' / ')));
      return;
    }
    Bai_cb(null, true);
  }
});

const Bai_uploadMiddleware = function (Bai_req, Bai_res, Bai_next) {
  Bai_multer.single('file')(Bai_req, Bai_res, function (Bai_error) {
    if (Bai_error) {
      console.error('[图片上传失败]', Bai_error.message);
      Bai_res.json({ code: 400, msg: Bai_error.message || '图片上传失败', data: null });
      return;
    }
    Bai_next();
  });
};

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

// 带重试的大模型调用
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
        '[视觉模型调用异常] 第 ' + Bai_attempt + '/' + Bai_MAX_ATTEMPTS + ' 次：' +
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

// POST /api/image/recognize —— 上传图片并调用视觉模型识别
const Bai_recognize = async (Bai_req, Bai_res) => {
  if (!Bai_req.file) {
    Bai_res.json({ code: 400, msg: '请选择要上传的图片（字段名 file）', data: null });
    return;
  }

  const Bai_filePath = Bai_req.file.path;
  const Bai_originalName = Bai_decodeName(Bai_req.file.originalname);
  const Bai_ext = path.extname(Bai_originalName).toLowerCase();
  const Bai_prompt = String((Bai_req.body && Bai_req.body.prompt) || '').trim() || '请详细描述这张图片的内容，包含主体、场景、颜色、文字等所有可见信息，使用简体中文回答。';
  const Bai_detail = String((Bai_req.body && Bai_req.body.detail) || 'low').trim();

  try {
    // 读取图片 → base64
    const Bai_buffer = fs.readFileSync(Bai_filePath);
    const Bai_base64 = Bai_buffer.toString('base64');
    const Bai_mime = Bai_getMime(Bai_ext);
    const Bai_dataUrl = 'data:' + Bai_mime + ';base64,' + Bai_base64;

    const Bai_payload = {
      model: Bai_VL_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: Bai_dataUrl, detail: Bai_detail }
            },
            {
              type: 'text',
              text: Bai_prompt
            }
          ]
        }
      ]
    };

    console.log('\n[视觉识别] 图片 ' + Bai_originalName + '，大小 ' + Bai_buffer.length + ' 字节，MIME ' + Bai_mime);
    console.log('[发送给大模型] POST ' + Bai_API_URL);
    // 控制台打印发送体，但把 base64 截断避免刷屏
    const Bai_logPayload = JSON.parse(JSON.stringify(Bai_payload));
    Bai_logPayload.messages[0].content[0].image_url.url = 'data:' + Bai_mime + ';base64,<已省略 ' + Bai_base64.length + ' 字符>';
    console.log(JSON.stringify(Bai_logPayload, null, 2));

    const Bai_startedAt = Date.now();
    let Bai_response = null;

    try {
      Bai_response = await Bai_callModel(Bai_payload);
    } catch (Bai_error) {
      const Bai_isTimeout = Bai_error && (Bai_error.name === 'TimeoutError' || Bai_error.name === 'AbortError');
      Bai_res.json({
        code: Bai_isTimeout ? 5004 : 5005,
        msg: (Bai_isTimeout ? '视觉模型响应超时：' : '调用视觉模型失败：') + Bai_describeCause(Bai_error) + '（已重试 ' + Bai_MAX_ATTEMPTS + ' 次）',
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
        msg: '视觉模型接口调用失败：' + ((Bai_data && Bai_data.message) || 'HTTP ' + Bai_response.status),
        data: { Bai_status: Bai_response.status }
      });
      return;
    }

    const Bai_choice = (Bai_data && Bai_data.choices && Bai_data.choices[0]) || {};
    const Bai_answer = (Bai_choice.message && Bai_choice.message.content) || '';
    const Bai_model = (Bai_data && Bai_data.model) || Bai_VL_MODEL;
    const Bai_elapsed = Date.now() - Bai_startedAt;

    // 入库保存识别历史
    let Bai_recordId = null;
    try {
      Bai_recordId = await Bai_imageModel.Bai_createRecord({
        Bai_name: Bai_originalName,
        Bai_type: Bai_ext,
        Bai_size: Bai_buffer.length,
        Bai_prompt: Bai_prompt,
        Bai_answer: Bai_answer,
        Bai_model: Bai_model,
        Bai_elapsed: Bai_elapsed
      });
    } catch (Bai_dbError) {
      console.error('[识别历史入库失败]', Bai_dbError.message);
    }

    Bai_res.json({
      code: 0,
      msg: '识别成功',
      data: {
        Bai_recordId: Bai_recordId,
        Bai_name: Bai_originalName,
        Bai_size: Bai_buffer.length,
        Bai_prompt: Bai_prompt,
        Bai_answer: Bai_answer,
        Bai_model: Bai_model,
        Bai_usage: (Bai_data && Bai_data.usage) || null,
        Bai_elapsed: Bai_elapsed,
        Bai_detail: Bai_detail
      }
    });
  } catch (Bai_error) {
    console.error('[图片识别失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '图片识别失败：' + Bai_error.message, data: null });
  }
};

// GET /api/image/records —— 识别历史
const Bai_listRecords = async (Bai_req, Bai_res) => {
  try {
    const Bai_limit = Number(Bai_req.query.limit) || 20;
    const Bai_list = await Bai_imageModel.Bai_findRecords(Bai_limit);
    Bai_res.json({
      code: 0,
      msg: '获取成功',
      data: { Bai_total: Bai_list.length, Bai_list: Bai_list }
    });
  } catch (Bai_error) {
    console.error('[获取识别历史失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '获取识别历史失败：' + Bai_error.message, data: null });
  }
};

module.exports = {
  Bai_uploadMiddleware,
  Bai_recognize,
  Bai_listRecords
};
