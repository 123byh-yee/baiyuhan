// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const { Bai_findNews, Bai_countNews, Bai_findCategories } = require('../models/Bai_newsModel');

// GET /api/news —— 科技新闻列表（支持 page、pageSize、keyword、category）
const Bai_getNewsList = async (Bai_req, Bai_res) => {
  const Bai_page = Math.max(1, parseInt(Bai_req.query.page, 10) || 1);
  const Bai_pageSize = Math.min(50, Math.max(1, parseInt(Bai_req.query.pageSize, 10) || 10));
  const Bai_keyword = (Bai_req.query.keyword || '').trim();
  const Bai_category = (Bai_req.query.category || '').trim();
  const Bai_offset = (Bai_page - 1) * Bai_pageSize;

  try {
    const [Bai_list, Bai_total, Bai_categories] = await Promise.all([
      Bai_findNews({
        keyword: Bai_keyword,
        category: Bai_category,
        offset: Bai_offset,
        pageSize: Bai_pageSize
      }),
      Bai_countNews({ keyword: Bai_keyword, category: Bai_category }),
      Bai_findCategories()
    ]);

    Bai_res.json({
      code: 0,
      msg: '获取科技新闻列表成功',
      data: {
        Bai_total: Bai_total,
        Bai_page: Bai_page,
        Bai_pageSize: Bai_pageSize,
        Bai_keyword: Bai_keyword,
        Bai_category: Bai_category,
        Bai_categories: Bai_categories,
        Bai_list: Bai_list
      }
    });
  } catch (Bai_error) {
    console.error('[获取新闻列表失败]', Bai_error);
    Bai_res.json({ code: 5002, msg: '获取新闻列表失败：' + Bai_error.message, data: null });
  }
};

module.exports = { Bai_getNewsList };
