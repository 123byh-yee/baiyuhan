// 临时脚本：建 Bai_image_record 表并插入 8 条测试数据
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true
  });

  const createTable = `
    CREATE TABLE IF NOT EXISTS Bai_image_record (
      Bai_id INT AUTO_INCREMENT PRIMARY KEY,
      Bai_name VARCHAR(255) NOT NULL,
      Bai_type VARCHAR(16) NOT NULL,
      Bai_size INT NOT NULL DEFAULT 0,
      Bai_prompt VARCHAR(500) NOT NULL DEFAULT '',
      Bai_answer TEXT NOT NULL,
      Bai_model VARCHAR(128) NOT NULL DEFAULT '',
      Bai_elapsed INT NOT NULL DEFAULT 0,
      Bai_create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await conn.execute(createTable);
  console.log('[OK] 表 Bai_image_record 已就绪');

  const testData = [
    ['黄山云海.jpg', '.jpg', 2456789, '描述这张风景图片', '这是一幅黄山云海风光照：前景是嶙峋的黄山松和花岗岩山峰，中景铺满翻涌的白色云海，远景隐约可见天都峰轮廓；天空湛蓝，光线清朗，整体呈现出典型的中国山水画意境。', 'deepseek-ai/deepseek-vl2', 3420, '2026-11-20 09:12:00'],
    ['城市夜景.png', '.png', 1876543, '分析图片中的建筑', '图片展示现代都市夜景：高楼群密集，玻璃幕墙反射霓虹灯光；中央有一座约 88 层的标志性尖顶塔楼，周围道路上车流形成光轨；整体色调以蓝紫和金色为主，城市发达且充满活力。', 'deepseek-ai/deepseek-vl2', 2980, '2026-11-20 10:05:00'],
    ['水果拼盘.jpg', '.jpg', 987654, '识别水果种类', '拼盘中可见以下水果：左上角切半的红心火龙果、旁边是紫色葡萄串、中央是切片橙与完整草莓、右下角摆放着绿色奇异果切片和黄色香蕉段；色彩鲜艳，摆盘精致。', 'deepseek-ai/deepseek-vl2', 2210, '2026-11-20 11:33:00'],
    ['机械零件.webp', '.webp', 654321, '做 OCR 提取图中文字', '图中为工业机械齿轮组件，金属材质银灰色，表面刻印文字：「Bearing No. 6205-2RS」、「SKF Sweden」、「Max RPM 12000」；背景是粗糙的灰色工作台面。', 'deepseek-ai/deepseek-vl2', 4150, '2026-11-20 14:21:00'],
    ['猫咪写真.jpeg', '.jpeg', 3210987, '描述猫的动作和神态', '一只橘白相间的英国短毛猫正趴在沙发扶手上打盹，身体蜷成一团，眼睛微闭，前爪搭在脸颊旁；午后阳光从左侧窗户斜射入，毛发纹理清晰，氛围温暖慵懒。', 'deepseek-ai/deepseek-vl2', 1890, '2026-11-21 08:47:00'],
    ['课堂板书.png', '.png', 543210, 'OCR 提取所有文字', '黑板板书，白色粉笔字，标题「第三章 数据结构」，内容包括：「3.1 线性表」、「3.2 二叉树遍历 (前/中/后序)」、「3.3 图的最短路径 Dijkstra」；右下角有教师签名「张老师 2026.11」。', 'deepseek-ai/deepseek-vl2', 5670, '2026-11-21 16:02:00'],
    ['户外广告.jpg', '.jpg', 1567890, '判断广告品牌和产品', '大型户外 LED 广告屏，品牌为「Nebula 星图」，主打产品是一款折叠屏智能手机，标语「展开未来 · 触手可及」；画面背景为深空星轨，主体手机呈展开状态，标价 ¥7999。', 'deepseek-ai/deepseek-vl2', 2340, '2026-11-22 12:18:00'],
    ['仪表盘截图.png', '.png', 765432, '识别仪表盘关键数据', '汽车仪表盘截图，时速表指针指向 62 km/h，转速约 2100 RPM，油表剩 3/8，水温正常；右侧中控屏显示导航地图，目的地「西湖景区」，预计到达 15:42；时间显示 15:27，室外温度 18℃。', 'deepseek-ai/deepseek-vl2', 1980, '2026-11-22 18:55:00']
  ];

  for (const row of testData) {
    await conn.execute(
      'INSERT INTO Bai_image_record (Bai_name, Bai_type, Bai_size, Bai_prompt, Bai_answer, Bai_model, Bai_elapsed, Bai_create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      row
    );
  }
  console.log('[OK] 已插入 ' + testData.length + ' 条测试数据');

  await conn.end();
})().catch(err => { console.error(err); process.exit(1); });
