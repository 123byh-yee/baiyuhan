// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

// 将长文本切分为带重叠的片段，便于检索命中
function Bai_chunkText(Bai_text, Bai_size, Bai_overlap) {
  const Bai_maxSize = Bai_size || 400;
  const Bai_overlapSize = Bai_overlap || 60;

  const Bai_clean = String(Bai_text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!Bai_clean) {
    return [];
  }

  const Bai_paragraphs = Bai_clean
    .split(/\n+/)
    .map(function (Bai_item) {
      return Bai_item.trim();
    })
    .filter(Boolean);

  const Bai_chunks = [];
  let Bai_current = '';

  Bai_paragraphs.forEach(function (Bai_paragraph) {
    if (Bai_paragraph.length > Bai_maxSize) {
      if (Bai_current) {
        Bai_chunks.push(Bai_current);
        Bai_current = '';
      }
      let Bai_start = 0;
      while (Bai_start < Bai_paragraph.length) {
        Bai_chunks.push(Bai_paragraph.slice(Bai_start, Bai_start + Bai_maxSize));
        Bai_start += Bai_maxSize - Bai_overlapSize;
      }
      return;
    }

    const Bai_merged = Bai_current ? Bai_current + '\n' + Bai_paragraph : Bai_paragraph;
    if (Bai_merged.length <= Bai_maxSize) {
      Bai_current = Bai_merged;
    } else {
      Bai_chunks.push(Bai_current);
      Bai_current = Bai_paragraph;
    }
  });

  if (Bai_current) {
    Bai_chunks.push(Bai_current);
  }

  return Bai_chunks
    .filter(function (Bai_item) {
      return Bai_item.trim().length > 0;
    })
    .map(function (Bai_item, Bai_index) {
      return { Bai_index: Bai_index, Bai_content: Bai_item.trim() };
    });
}

module.exports = { Bai_chunkText };
