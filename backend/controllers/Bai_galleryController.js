// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const { Bai_findGallery } = require('../models/Bai_galleryModel');

// GET /api/gallery —— 科技图文列表
const Bai_getGalleryList = async (Bai_req, Bai_res) => {
  try {
    const Bai_list = await Bai_findGallery();

    Bai_res.json({
      code: 0,
      msg: '获取图文列表成功',
      data: {
        Bai_total: Bai_list.length,
        Bai_list: Bai_list
      }
    });
  } catch (Bai_error) {
    console.error('[获取图文列表失败]', Bai_error);
    Bai_res.json({ code: 5003, msg: '获取图文列表失败：' + Bai_error.message, data: null });
  }
};

module.exports = { Bai_getGalleryList };
