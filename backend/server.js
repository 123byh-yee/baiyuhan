// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_app = require('./app');

const Bai_PORT = 8326;

Bai_app.listen(Bai_PORT, () => {
  console.log(`[启动成功] 服务地址：http://localhost:${Bai_PORT}`);
  console.log(`[启动成功] 接口前缀：http://localhost:${Bai_PORT}/api`);
});
