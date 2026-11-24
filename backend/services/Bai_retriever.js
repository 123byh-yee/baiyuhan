// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

// 中文按二元组切分，英文/数字按单词切分
function Bai_tokenize(Bai_text) {
  const Bai_lower = String(Bai_text || '').toLowerCase();
  const Bai_tokens = [];

  const Bai_latin = Bai_lower.match(/[a-z0-9_]+/g) || [];
  Bai_latin.forEach(function (Bai_word) {
    Bai_tokens.push(Bai_word);
  });

  const Bai_cjkRuns = Bai_lower.match(/[\u4e00-\u9fa5]+/g) || [];
  Bai_cjkRuns.forEach(function (Bai_run) {
    if (Bai_run.length === 1) {
      Bai_tokens.push(Bai_run);
      return;
    }
    for (let Bai_i = 0; Bai_i < Bai_run.length - 1; Bai_i += 1) {
      Bai_tokens.push(Bai_run.slice(Bai_i, Bai_i + 2));
    }
  });

  return Bai_tokens;
}

// BM25 检索：返回与问题最相关的片段
function Bai_retrieve(Bai_chunks, Bai_question, Bai_topK) {
  const Bai_k1 = 1.5;
  const Bai_b = 0.75;
  const Bai_top = Bai_topK || 4;

  const Bai_docs = Bai_chunks.map(function (Bai_chunk) {
    const Bai_tokens = Bai_tokenize(Bai_chunk.Bai_content);
    const Bai_tf = {};
    Bai_tokens.forEach(function (Bai_token) {
      Bai_tf[Bai_token] = (Bai_tf[Bai_token] || 0) + 1;
    });
    return {
      Bai_chunk: Bai_chunk,
      Bai_tf: Bai_tf,
      Bai_length: Bai_tokens.length
    };
  });

  const Bai_total = Bai_docs.length;
  const Bai_avgLength =
    Bai_docs.reduce(function (Bai_sum, Bai_doc) {
      return Bai_sum + Bai_doc.Bai_length;
    }, 0) / (Bai_total || 1);

  const Bai_queryTokens = Array.from(new Set(Bai_tokenize(Bai_question)));
  const Bai_df = {};
  Bai_queryTokens.forEach(function (Bai_token) {
    Bai_df[Bai_token] = Bai_docs.reduce(function (Bai_count, Bai_doc) {
      return Bai_count + (Bai_doc.Bai_tf[Bai_token] ? 1 : 0);
    }, 0);
  });

  const Bai_scored = Bai_docs.map(function (Bai_doc) {
    let Bai_score = 0;
    Bai_queryTokens.forEach(function (Bai_token) {
      const Bai_freq = Bai_doc.Bai_tf[Bai_token] || 0;
      if (!Bai_freq) {
        return;
      }
      const Bai_idf = Math.log(1 + (Bai_total - Bai_df[Bai_token] + 0.5) / (Bai_df[Bai_token] + 0.5));
      const Bai_norm = Bai_freq * (Bai_k1 + 1) /
        (Bai_freq + Bai_k1 * (1 - Bai_b + Bai_b * Bai_doc.Bai_length / (Bai_avgLength || 1)));
      Bai_score += Bai_idf * Bai_norm;
    });

    // 问题原串直接命中的片段额外加权
    if (Bai_question && Bai_doc.Bai_chunk.Bai_content.indexOf(Bai_question) >= 0) {
      Bai_score += 3;
    }

    return { Bai_chunk: Bai_doc.Bai_chunk, Bai_score: Bai_score };
  });

  return Bai_scored
    .filter(function (Bai_item) {
      return Bai_item.Bai_score > 0;
    })
    .sort(function (Bai_a, Bai_bItem) {
      return Bai_bItem.Bai_score - Bai_a.Bai_score;
    })
    .slice(0, Bai_top);
}

module.exports = { Bai_retrieve, Bai_tokenize };
