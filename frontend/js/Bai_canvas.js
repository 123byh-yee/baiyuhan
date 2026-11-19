// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

/* ===== 背景粒子动画 ===== */
(function () {
  const Bai_canvas = document.getElementById('Bai_canvas');
  if (!Bai_canvas) {
    return;
  }

  const Bai_ctx = Bai_canvas.getContext('2d');
  const Bai_Colors = ['#2f7bff', '#38d6ff', '#7aa2ff'];
  const Bai_LinkDistance = 132;
  const Bai_MouseRadius = 150;
  const Bai_MaxParticles = 96;

  let Bai_width = 0;
  let Bai_height = 0;
  let Bai_dpr = 1;
  let Bai_particles = [];

  const Bai_pointer = { Bai_x: null, Bai_y: null };

  // 生成 [Bai_min, Bai_max) 区间的随机数
  function Bai_randomBetween(Bai_min, Bai_max) {
    return Math.random() * (Bai_max - Bai_min) + Bai_min;
  }

  // 创建一个粒子
  function Bai_createParticle() {
    const Bai_radius = Bai_randomBetween(0.8, 2.2);
    return {
      Bai_x: Bai_randomBetween(0, Bai_width),
      Bai_y: Bai_randomBetween(0, Bai_height),
      Bai_vx: Bai_randomBetween(-0.32, 0.32),
      Bai_vy: Bai_randomBetween(-0.32, 0.32),
      Bai_r: Bai_radius,
      Bai_color: Bai_Colors[Math.floor(Math.random() * Bai_Colors.length)]
    };
  }

  // 计算当前屏幕应生成的粒子数量
  function Bai_particleCount() {
    const Bai_byArea = Math.round((Bai_width * Bai_height) / 17000);
    return Math.max(28, Math.min(Bai_MaxParticles, Bai_byArea));
  }

  // 初始化粒子集合
  function Bai_buildParticles() {
    const Bai_count = Bai_particleCount();
    Bai_particles = [];
    for (let Bai_i = 0; Bai_i < Bai_count; Bai_i += 1) {
      Bai_particles.push(Bai_createParticle());
    }
  }

  // 画布尺寸自适应（含高清屏 DPR 处理）
  function Bai_resize() {
    Bai_dpr = Math.min(window.devicePixelRatio || 1, 2);
    Bai_width = window.innerWidth;
    Bai_height = window.innerHeight;

    Bai_canvas.width = Math.floor(Bai_width * Bai_dpr);
    Bai_canvas.height = Math.floor(Bai_height * Bai_dpr);
    Bai_canvas.style.width = Bai_width + 'px';
    Bai_canvas.style.height = Bai_height + 'px';

    Bai_ctx.setTransform(Bai_dpr, 0, 0, Bai_dpr, 0, 0);
    Bai_buildParticles();
  }

  // 每帧更新与绘制
  function Bai_draw() {
    Bai_ctx.clearRect(0, 0, Bai_width, Bai_height);

    for (let Bai_i = 0; Bai_i < Bai_particles.length; Bai_i += 1) {
      const Bai_p = Bai_particles[Bai_i];

      // 鼠标轻微排斥
      if (Bai_pointer.Bai_x !== null) {
        const Bai_dx = Bai_p.Bai_x - Bai_pointer.Bai_x;
        const Bai_dy = Bai_p.Bai_y - Bai_pointer.Bai_y;
        const Bai_distance = Math.hypot(Bai_dx, Bai_dy);
        if (Bai_distance < Bai_MouseRadius && Bai_distance > 0.1) {
          const Bai_force = (Bai_MouseRadius - Bai_distance) / Bai_MouseRadius;
          Bai_p.Bai_x += (Bai_dx / Bai_distance) * Bai_force * 1.1;
          Bai_p.Bai_y += (Bai_dy / Bai_distance) * Bai_force * 1.1;
        }
      }

      // 位移与边界回弹
      Bai_p.Bai_x += Bai_p.Bai_vx;
      Bai_p.Bai_y += Bai_p.Bai_vy;

      if (Bai_p.Bai_x < -20 || Bai_p.Bai_x > Bai_width + 20) {
        Bai_p.Bai_vx *= -1;
      }
      if (Bai_p.Bai_y < -20 || Bai_p.Bai_y > Bai_height + 20) {
        Bai_p.Bai_vy *= -1;
      }

      // 绘制粒子
      Bai_ctx.beginPath();
      Bai_ctx.arc(Bai_p.Bai_x, Bai_p.Bai_y, Bai_p.Bai_r, 0, Math.PI * 2);
      Bai_ctx.fillStyle = Bai_p.Bai_color;
      Bai_ctx.globalAlpha = 0.72;
      Bai_ctx.fill();
      Bai_ctx.globalAlpha = 1;
    }

    // 绘制粒子之间的连线
    for (let Bai_i = 0; Bai_i < Bai_particles.length; Bai_i += 1) {
      for (let Bai_j = Bai_i + 1; Bai_j < Bai_particles.length; Bai_j += 1) {
        const Bai_a = Bai_particles[Bai_i];
        const Bai_b = Bai_particles[Bai_j];
        const Bai_gap = Math.hypot(Bai_a.Bai_x - Bai_b.Bai_x, Bai_a.Bai_y - Bai_b.Bai_y);

        if (Bai_gap < Bai_LinkDistance) {
          const Bai_alpha = (1 - Bai_gap / Bai_LinkDistance) * 0.28;
          Bai_ctx.beginPath();
          Bai_ctx.moveTo(Bai_a.Bai_x, Bai_a.Bai_y);
          Bai_ctx.lineTo(Bai_b.Bai_x, Bai_b.Bai_y);
          Bai_ctx.strokeStyle = 'rgba(122, 162, 255, ' + Bai_alpha.toFixed(3) + ')';
          Bai_ctx.lineWidth = 0.9;
          Bai_ctx.stroke();
        }
      }
    }

    Bai_frameId = window.requestAnimationFrame(Bai_draw);
  }

  // 鼠标 / 触摸跟随
  function Bai_bindPointer() {
    window.addEventListener('pointermove', function (Bai_event) {
      Bai_pointer.Bai_x = Bai_event.clientX;
      Bai_pointer.Bai_y = Bai_event.clientY;
    });

    window.addEventListener('pointerleave', function () {
      Bai_pointer.Bai_x = null;
      Bai_pointer.Bai_y = null;
    });
  }

  // 启动动画
  function Bai_startCanvas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('[canvas] 已检测到减少动态效果偏好，静态渲染一帧');
      Bai_resize();
      return;
    }

    Bai_resize();
    Bai_bindPointer();
    Bai_frameId = window.requestAnimationFrame(Bai_draw);

    window.addEventListener('resize', function () {
      window.cancelAnimationFrame(Bai_frameId);
      Bai_resize();
      Bai_frameId = window.requestAnimationFrame(Bai_draw);
    });
  }

  Bai_startCanvas();
})();

/* ===== 页面导航数量统计 ===== */
(function () {
  const Bai_grid = document.getElementById('Bai_navGrid');
  const Bai_count = document.getElementById('Bai_navCount');
  if (!Bai_grid || !Bai_count) {
    return;
  }

  const Bai_links = Bai_grid.querySelectorAll('a.Bai_navCard');
  Bai_count.textContent = Bai_links.length + ' 个页面';
  console.log('[导航] 当前已完成的页面数量：', Bai_links.length);
})();

/* ===== 后端接口连通性自检 ===== */
(function () {
  if (!window.location.protocol.startsWith('http')) {
    return;
  }

  async function Bai_checkHealth() {
    try {
      const Bai_response = await fetch('/api/health');
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] GET /api/health =>', Bai_result);
    } catch (Bai_error) {
      console.error('[接口异常] GET /api/health =>', Bai_error);
    }
  }

  Bai_checkHealth();
})();
