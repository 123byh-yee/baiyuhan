// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

const Bai_app = require('./app');

const Bai_PORT = 8326;

// 启动横幅由 Node 输出（避免中文写在 .bat 中被 cmd 误解析）
console.log('============================================================');
console.log('  项目：知乎的模仿和制作');
console.log('  作者：白雨涵 24001010326');
console.log(`  服务：http://localhost:${Bai_PORT}`);
console.log(`  接口：http://localhost:${Bai_PORT}/api`);
console.log('  停止：按 Ctrl + C');
console.log('============================================================');

Bai_app.listen(Bai_PORT, () => {
  console.log(`[启动成功] 服务地址：http://localhost:${Bai_PORT}`);
  console.log(`[启动成功] 接口前缀：http://localhost:${Bai_PORT}/api`);
});
