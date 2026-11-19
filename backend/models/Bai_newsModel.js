// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_pool = require('../config/Bai_db');

// 根据关键词、分类拼接 WHERE 条件
function Bai_buildWhere(Bai_keyword, Bai_category) {
  const Bai_conditions = [];
  const Bai_params = [];

  if (Bai_category) {
    Bai_conditions.push('Bai_category = ?');
    Bai_params.push(Bai_category);
  }

  if (Bai_keyword) {
    Bai_conditions.push('(Bai_title LIKE ? OR Bai_summary LIKE ?)');
    const Bai_like = '%' + Bai_keyword + '%';
    Bai_params.push(Bai_like, Bai_like);
  }

  return {
    Bai_whereSql: Bai_conditions.length ? ' WHERE ' + Bai_conditions.join(' AND ') : '',
    Bai_params: Bai_params
  };
}

// 分页查询新闻列表
async function Bai_findNews(Bai_options) {
  const Bai_where = Bai_buildWhere(Bai_options.keyword, Bai_options.category);
  const Bai_sql =
    'SELECT Bai_id, Bai_title, Bai_summary, Bai_category, Bai_source, Bai_author, ' +
    "DATE_FORMAT(Bai_publish_time, '%Y-%m-%d %H:%i') AS Bai_publishTime, Bai_views " +
    'FROM Bai_news' +
    Bai_where.Bai_whereSql +
    ' ORDER BY Bai_publish_time DESC, Bai_id DESC LIMIT ?, ?';

  const [Bai_rows] = await Bai_pool.query(
    Bai_sql,
    Bai_where.Bai_params.concat([Bai_options.offset, Bai_options.pageSize])
  );
  return Bai_rows;
}

// 统计符合条件的新闻总数
async function Bai_countNews(Bai_options) {
  const Bai_where = Bai_buildWhere(Bai_options.keyword, Bai_options.category);
  const [Bai_rows] = await Bai_pool.query(
    'SELECT COUNT(*) AS Bai_total FROM Bai_news' + Bai_where.Bai_whereSql,
    Bai_where.Bai_params
  );
  return Bai_rows[0].Bai_total;
}

// 查询全部新闻分类
async function Bai_findCategories() {
  const [Bai_rows] = await Bai_pool.query(
    'SELECT DISTINCT Bai_category FROM Bai_news ORDER BY Bai_category'
  );
  return Bai_rows.map((Bai_row) => Bai_row.Bai_category);
}

module.exports = { Bai_findNews, Bai_countNews, Bai_findCategories };
