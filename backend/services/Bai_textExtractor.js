// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const fs = require('fs');
const path = require('path');
const officeParser = require('officeparser');
const WordExtractor = require('word-extractor');
const { PDFParse } = require('pdf-parse');

// 纯文本：优先 UTF-8，出现乱码时回退 GBK（GB18030）
function Bai_readPlainText(Bai_filePath) {
  const Bai_buffer = fs.readFileSync(Bai_filePath);
  let Bai_text = Bai_buffer.toString('utf8');
  if (Bai_text.indexOf('\uFFFD') >= 0) {
    try {
      Bai_text = new TextDecoder('gbk').decode(Bai_buffer);
    } catch (Bai_error) {
      console.error('[文本解码回退失败] 保持 UTF-8 结果');
    }
  }
  return Bai_text;
}

// 旧版 .ppt 二进制：按 UTF-16LE 扫描可读文本片段
function Bai_extractLegacyPpt(Bai_filePath) {
  const Bai_buffer = fs.readFileSync(Bai_filePath);
  const Bai_raw = Bai_buffer.toString('utf16le');
  const Bai_parts = Bai_raw.match(/[\u4e00-\u9fa5A-Za-z0-9，。、；：""''（）()《》,.!?%\-_\s]{4,}/g) || [];
  return Bai_parts.join('\n');
}

// 按扩展名选择解析方式，统一返回纯文本
async function Bai_extractText(Bai_filePath) {
  const Bai_ext = path.extname(Bai_filePath).toLowerCase();

  if (Bai_ext === '.txt' || Bai_ext === '.md') {
    return Bai_readPlainText(Bai_filePath);
  }

  if (Bai_ext === '.doc') {
    const Bai_extractor = new WordExtractor();
    const Bai_doc = await Bai_extractor.extract(Bai_filePath);
    return Bai_doc.getBody();
  }

  if (Bai_ext === '.docx' || Bai_ext === '.pptx') {
    const Bai_result = await officeParser.parseOffice(Bai_filePath);
    if (typeof Bai_result === 'string') {
      return Bai_result;
    }
    // officeparser 7.x 返回 AST 对象，需转成纯文本
    if (Bai_result && typeof Bai_result.to === 'function') {
      const Bai_converted = await Bai_result.to('text');
      if (Bai_converted && typeof Bai_converted.value === 'string') {
        return Bai_converted.value;
      }
      if (typeof Bai_converted === 'string') {
        return Bai_converted;
      }
    }
    return (Bai_result && typeof Bai_result.content === 'string') ? Bai_result.content : '';
  }

  if (Bai_ext === '.ppt') {
    return Bai_extractLegacyPpt(Bai_filePath);
  }

  if (Bai_ext === '.pdf') {
    const Bai_buffer = fs.readFileSync(Bai_filePath);
    const Bai_parser = new PDFParse({ data: new Uint8Array(Bai_buffer) });
    try {
      const Bai_result = await Bai_parser.getText();
      return Bai_result.text || '';
    } finally {
      if (typeof Bai_parser.destroy === 'function') {
        await Bai_parser.destroy();
      }
    }
  }

  throw new Error('不支持的文件类型：' + Bai_ext);
}

module.exports = { Bai_extractText };
