// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

(function () {
  const Bai_grid = document.getElementById('Bai_galleryGrid');
  const Bai_status = document.getElementById('Bai_status');
  const Bai_summary = document.getElementById('Bai_summary');
  const Bai_apiUrl = document.getElementById('Bai_apiUrl');

  if (!Bai_grid) {
    return;
  }

  // 状态提示
  function Bai_setStatus(Bai_text, Bai_isError, Bai_visible) {
    Bai_status.hidden = !Bai_visible;
    Bai_status.textContent = Bai_text;
    Bai_status.className = 'Bai_status' + (Bai_isError ? ' Bai_statusError' : '');
  }

  // 创建单张图文卡片
  function Bai_createCard(Bai_item, Bai_index) {
    const Bai_card = document.createElement('article');
    Bai_card.className = 'Bai_galleryCard';
    Bai_card.style.animationDelay = Bai_index * 60 + 'ms';

    const Bai_thumb = document.createElement('div');
    Bai_thumb.className = 'Bai_galleryThumb';

    const Bai_img = document.createElement('img');
    Bai_img.src = Bai_item.Bai_image;
    Bai_img.alt = Bai_item.Bai_title;
    Bai_img.loading = 'lazy';
    Bai_img.addEventListener('error', function () {
      Bai_thumb.className = 'Bai_galleryThumb Bai_galleryThumbError';
      console.error('[图片加载失败]', Bai_item.Bai_image, Bai_item.Bai_title);
    });
    Bai_thumb.appendChild(Bai_img);

    const Bai_body = document.createElement('div');
    Bai_body.className = 'Bai_galleryBody';

    const Bai_top = document.createElement('div');
    Bai_top.className = 'Bai_galleryTop';

    const Bai_tag = document.createElement('span');
    Bai_tag.className = 'Bai_galleryTag';
    Bai_tag.textContent = Bai_item.Bai_category;

    const Bai_time = document.createElement('span');
    Bai_time.className = 'Bai_galleryTime';
    Bai_time.textContent = Bai_item.Bai_publishTime;

    Bai_top.appendChild(Bai_tag);
    Bai_top.appendChild(Bai_time);

    const Bai_title = document.createElement('h3');
    Bai_title.className = 'Bai_galleryTitle';
    Bai_title.textContent = Bai_item.Bai_title;

    const Bai_desc = document.createElement('p');
    Bai_desc.className = 'Bai_galleryDesc';
    Bai_desc.textContent = Bai_item.Bai_desc;

    const Bai_meta = document.createElement('div');
    Bai_meta.className = 'Bai_galleryMeta';

    ['作者：' + Bai_item.Bai_author, '点赞 ' + Number(Bai_item.Bai_likes).toLocaleString('zh-CN')].forEach(
      function (Bai_text) {
        const Bai_metaItem = document.createElement('span');
        Bai_metaItem.textContent = Bai_text;
        Bai_meta.appendChild(Bai_metaItem);
      }
    );

    Bai_body.appendChild(Bai_top);
    Bai_body.appendChild(Bai_title);
    Bai_body.appendChild(Bai_desc);
    Bai_body.appendChild(Bai_meta);

    Bai_card.appendChild(Bai_thumb);
    Bai_card.appendChild(Bai_body);

    return Bai_card;
  }

  // 请求并渲染图文列表
  async function Bai_loadGallery() {
    const Bai_path = '/api/gallery';
    Bai_apiUrl.textContent = window.location.origin + Bai_path;
    Bai_grid.innerHTML = '';
    Bai_summary.textContent = '';
    Bai_setStatus('正在加载图文数据…', false, true);

    try {
      const Bai_response = await fetch(Bai_path);
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] GET ' + Bai_path + ' =>', Bai_result);

      if (Bai_result.code !== 0) {
        Bai_setStatus('获取图文失败：' + Bai_result.msg, true, true);
        console.error('[获取图文失败]', Bai_result.code, Bai_result.msg);
        return;
      }

      const Bai_items = (Bai_result.data && Bai_result.data.Bai_list) || [];
      if (Bai_items.length === 0) {
        Bai_setStatus('暂无图文数据。', false, true);
        Bai_summary.textContent = '共 0 条';
        return;
      }

      Bai_setStatus('', false, false);
      Bai_items.forEach(function (Bai_item, Bai_index) {
        Bai_grid.appendChild(Bai_createCard(Bai_item, Bai_index));
      });

      Bai_summary.textContent = '共 ' + Bai_result.data.Bai_total + ' 条图文';
    } catch (Bai_error) {
      Bai_setStatus('无法访问后端接口 /api/gallery，请确认服务已启动（端口 8326）。', true, true);
      console.error('[接口异常] GET /api/gallery =>', Bai_error);
    }
  }

  Bai_loadGallery();
})();
