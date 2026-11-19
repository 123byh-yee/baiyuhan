// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 查询全部图文，按发布时间倒序
async function Bai_findGallery() {
  const [Bai_rows] = await Bai_pool.query(
    'SELECT Bai_id, Bai_title, Bai_desc, Bai_image, Bai_category, Bai_author, Bai_likes, ' +
      "DATE_FORMAT(Bai_publish_time, '%Y-%m-%d %H:%i') AS Bai_publishTime " +
      'FROM Bai_gallery ORDER BY Bai_publish_time DESC, Bai_id DESC'
  );
  return Bai_rows;
}

module.exports = { Bai_findGallery };
