// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

(function () {
  const Bai_list = document.getElementById('Bai_newsList');
  const Bai_status = document.getElementById('Bai_status');
  const Bai_chips = document.getElementById('Bai_chips');
  const Bai_search = document.getElementById('Bai_search');
  const Bai_keyword = document.getElementById('Bai_keyword');
  const Bai_summary = document.getElementById('Bai_summary');
  const Bai_apiUrl = document.getElementById('Bai_apiUrl');
  const Bai_apiOpen = document.getElementById('Bai_apiOpen');

  if (!Bai_list) {
    return;
  }

  const Bai_state = {
    Bai_category: '',
    Bai_keyword: '',
    Bai_pageSize: 20,
    Bai_categories: []
  };

  // 根据当前筛选条件拼接接口地址
  function Bai_buildQuery() {
    const Bai_params = new URLSearchParams();
    Bai_params.set('page', '1');
    Bai_params.set('pageSize', String(Bai_state.Bai_pageSize));
    if (Bai_state.Bai_category) {
      Bai_params.set('category', Bai_state.Bai_category);
    }
    if (Bai_state.Bai_keyword) {
      Bai_params.set('keyword', Bai_state.Bai_keyword);
    }
    return '/api/news?' + Bai_params.toString();
  }

  // 状态提示
  function Bai_setStatus(Bai_text, Bai_isError, Bai_visible) {
    Bai_status.hidden = !Bai_visible;
    Bai_status.textContent = Bai_text;
    Bai_status.className = 'Bai_status' + (Bai_isError ? ' Bai_statusError' : '');
  }

  // 渲染分类标签
  function Bai_renderChips() {
    Bai_chips.innerHTML = '';

    const Bai_allNames = [''].concat(Bai_state.Bai_categories);
    Bai_allNames.forEach((Bai_name) => {
      const Bai_btn = document.createElement('button');
      Bai_btn.type = 'button';
      Bai_btn.className = 'Bai_chip' + (Bai_state.Bai_category === Bai_name ? ' Bai_chipActive' : '');
      Bai_btn.textContent = Bai_name || '全部';
      Bai_btn.addEventListener('click', function () {
        Bai_state.Bai_category = Bai_name;
        Bai_loadNews();
      });
      Bai_chips.appendChild(Bai_btn);
    });
  }

  // 创建单条新闻卡片
  function Bai_createCard(Bai_item, Bai_index) {
    const Bai_card = document.createElement('article');
    Bai_card.className = 'Bai_newsCard';
    Bai_card.style.animationDelay = Bai_index * 45 + 'ms';

    const Bai_top = document.createElement('div');
    Bai_top.className = 'Bai_newsTop';

    const Bai_tag = document.createElement('span');
    Bai_tag.className = 'Bai_tag';
    Bai_tag.textContent = Bai_item.Bai_category;

    const Bai_time = document.createElement('span');
    Bai_time.className = 'Bai_newsTime';
    Bai_time.textContent = Bai_item.Bai_publishTime;

    Bai_top.appendChild(Bai_tag);
    Bai_top.appendChild(Bai_time);

    const Bai_title = document.createElement('h3');
    Bai_title.className = 'Bai_newsTitle';
    Bai_title.textContent = Bai_item.Bai_title;

    const Bai_summaryText = document.createElement('p');
    Bai_summaryText.className = 'Bai_newsSummary';
    Bai_summaryText.textContent = Bai_item.Bai_summary;

    const Bai_meta = document.createElement('div');
    Bai_meta.className = 'Bai_newsMeta';

    [
      '来源：' + Bai_item.Bai_source,
      '作者：' + Bai_item.Bai_author,
      '阅读 ' + Number(Bai_item.Bai_views).toLocaleString('zh-CN')
    ].forEach(function (Bai_text) {
      const Bai_metaItem = document.createElement('span');
      Bai_metaItem.className = 'Bai_newsMetaItem';
      Bai_metaItem.textContent = Bai_text;
      Bai_meta.appendChild(Bai_metaItem);
    });

    Bai_card.appendChild(Bai_top);
    Bai_card.appendChild(Bai_title);
    Bai_card.appendChild(Bai_summaryText);
    Bai_card.appendChild(Bai_meta);

    return Bai_card;
  }

  // 请求并渲染新闻列表
  async function Bai_loadNews() {
    const Bai_path = Bai_buildQuery();
    Bai_apiUrl.textContent = window.location.origin + Bai_path;
    if (Bai_apiOpen) {
      Bai_apiOpen.href = Bai_path;
    }

    Bai_list.innerHTML = '';
    Bai_summary.textContent = '';
    Bai_setStatus('正在加载新闻数据…', false, true);

    try {
      const Bai_response = await fetch(Bai_path);
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] GET ' + Bai_path + ' =>', Bai_result);

      if (Bai_result.code !== 0) {
        Bai_setStatus('获取新闻失败：' + Bai_result.msg, true, true);
        console.error('[获取新闻失败]', Bai_result.code, Bai_result.msg);
        return;
      }

      const Bai_data = Bai_result.data || {};
      Bai_state.Bai_categories = Bai_data.Bai_categories || [];
      Bai_renderChips();

      const Bai_items = Bai_data.Bai_list || [];
      if (Bai_items.length === 0) {
        Bai_setStatus('没有符合条件的新闻，试试切换分类或清空关键词。', false, true);
        Bai_summary.textContent = '共 0 条';
        return;
      }

      Bai_setStatus('', false, false);
      Bai_items.forEach(function (Bai_item, Bai_index) {
        Bai_list.appendChild(Bai_createCard(Bai_item, Bai_index));
      });

      Bai_summary.textContent =
        '共 ' + Bai_data.Bai_total + ' 条新闻' +
        (Bai_data.Bai_category ? ' · 分类：' + Bai_data.Bai_category : '') +
        (Bai_data.Bai_keyword ? ' · 关键词：' + Bai_data.Bai_keyword : '');
    } catch (Bai_error) {
      Bai_setStatus('无法访问后端接口 /api/news，请确认服务已启动（端口 8326）。', true, true);
      console.error('[接口异常] GET /api/news =>', Bai_error);
    }
  }

  // 搜索
  if (Bai_search) {
    Bai_search.addEventListener('submit', function (Bai_event) {
      Bai_event.preventDefault();
      Bai_state.Bai_keyword = Bai_keyword.value.trim();
      Bai_loadNews();
    });
  }

  Bai_loadNews();
})();
