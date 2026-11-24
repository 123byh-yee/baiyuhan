// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

var Bai_EXAMPLES = [
  '这款 iPhone 16 Pro Max 做工非常精致，钛金属边框手感一流，A18 Pro 芯片性能强劲，游戏体验极佳。但续航比宣传的要差一些，充电速度太慢，价格也偏贵，性价比一般。',
  '昨天在星巴克望京店买了一杯拿铁，店员态度很好，出餐很快。咖啡味道不错，奶泡细腻。但店里座位有点脏，WiFi 信号也不稳定。总体体验 7/10。',
  '对比了华为 Mate70 和小米 15 Ultra，我最终选择了小米 15 Ultra。原因是镜头参数更强、价格便宜 2000 元、MIUI 更符合我的使用习惯。但不得不承认华为的信号确实好一些。',
  '蔚来汽车的售后真的是业界标杆，换电站 3 分钟完成，比加油还快。但最近新车发布节奏太快，老车主心理落差大。电池质保政策很良心，这点值得点赞。'
];

var Bai_sentimentEmoji = { positive: '😊', negative: '😡', neutral: '😐', mixed: '🤔' };
var Bai_sentimentLabel = { positive: '积极 Positive', negative: '消极 Negative', neutral: '中性 Neutral', mixed: '混合 Mixed' };

// DOM
var Bai_inputText = document.getElementById('Bai_inputText');
var Bai_analyzeBtn = document.getElementById('Bai_analyzeBtn');
var Bai_schemaBtn = document.getElementById('Bai_schemaBtn');
var Bai_copyBtn = document.getElementById('Bai_copyBtn');
var Bai_status = document.getElementById('Bai_status');
var Bai_emptyTip = document.getElementById('Bai_emptyTip');
var Bai_result = document.getElementById('Bai_result');
var Bai_sentimentCard = document.getElementById('Bai_sentimentCard');
var Bai_entityList = document.getElementById('Bai_entityList');
var Bai_entityCount = document.getElementById('Bai_entityCount');
var Bai_suggestionList = document.getElementById('Bai_suggestionList');
var Bai_suggestionCount = document.getElementById('Bai_suggestionCount');
var Bai_complaintList = document.getElementById('Bai_complaintList');
var Bai_complaintCount = document.getElementById('Bai_complaintCount');
var Bai_summaryText = document.getElementById('Bai_summaryText');
var Bai_rawJson = document.getElementById('Bai_rawJson');
var Bai_historyList = document.getElementById('Bai_historyList');
var Bai_historyCount = document.getElementById('Bai_historyCount');
var Bai_examples = document.getElementById('Bai_examples');

// 渲染示例
Bai_EXAMPLES.forEach(function (text) {
  var el = document.createElement('div');
  el.className = 'Bai_harnessExampleItem';
  el.title = text;
  el.textContent = text;
  el.addEventListener('click', function () { Bai_inputText.value = text; Bai_inputText.focus(); });
  Bai_examples.appendChild(el);
});

// 分析按钮
Bai_analyzeBtn.addEventListener('click', async function () {
  var text = Bai_inputText.value.trim();
  if (!text) { Bai_showStatus('请输入要分析的文本', true); return; }

  Bai_analyzeBtn.disabled = true;
  Bai_analyzeBtn.textContent = '分析中…';
  Bai_showStatus('正在调用大模型，请稍候…', false);
  Bai_emptyTip.style.display = 'none';
  Bai_result.hidden = true;

  console.log('[前端发送] POST /api/harness/analyze');

  try {
    var resp = await fetch('/api/harness/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });
    var json = await resp.json();
    console.log('[前端收到]', json);

    if (!json || json.code !== 0) {
      Bai_showStatus((json && json.msg) || '分析失败', true);
      return;
    }

    Bai_render(json.data.Bai_analysis);
    Bai_showStatus('分析成功！耗时 ' + json.data.Bai_elapsed + ' ms', false);
    Bai_loadHistory();
  } catch (err) {
    console.error(err);
    Bai_showStatus('网络错误：' + err.message, true);
  } finally {
    Bai_analyzeBtn.disabled = false;
    Bai_analyzeBtn.textContent = '开始分析';
  }
});

Bai_schemaBtn.addEventListener('click', function () {
  window.open('/api/harness/schema', '_blank', 'noopener');
});

Bai_copyBtn.addEventListener('click', function () {
  var text = Bai_rawJson.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(function () {
    Bai_copyBtn.textContent = '已复制 ✓';
    setTimeout(function () { Bai_copyBtn.textContent = '复制 JSON'; }, 1500);
  });
});

function Bai_render(data) {
  Bai_result.hidden = false;

  // 情感卡片
  var s = data.sentiment || {};
  var label = s.label || 'neutral';
  Bai_sentimentCard.className = 'Bai_harnessSentiment Bai_harnessSentiment' + label.charAt(0).toUpperCase() + label.slice(1);
  Bai_sentimentCard.innerHTML =
    '<div class="Bai_harnessSentimentEmoji">' + (Bai_sentimentEmoji[label] || '❓') + '</div>' +
    '<div class="Bai_harnessSentimentLabel">' + (Bai_sentimentLabel[label] || label) + '</div>' +
    '<div class="Bai_harnessSentimentScore">score: ' + (s.score || 0) + ' · confidence: ' + (s.confidence || 0) + '</div>';

  // 实体
  var ents = data.entities || [];
  Bai_entityCount.textContent = '(' + ents.length + ')';
  Bai_entityList.innerHTML = ents.map(function (e) {
    var cls = 'Bai_harnessEntity';
    if (e.sentiment === 'positive') cls += ' Bai_harnessEntityPos';
    else if (e.sentiment === 'negative') cls += ' Bai_harnessEntityNeg';
    return '<div class="' + cls + '">' +
      '<span class="Bai_harnessEntityText">' + Bai_esc(e.text) + '</span>' +
      '<span class="Bai_harnessEntityType">' + Bai_esc(e.type) + '</span>' +
    '</div>';
  }).join('');

  // 建议 / 投诉
  var sugs = data.suggestions || [];
  var comps = data.complaints || [];
  Bai_suggestionCount.textContent = '(' + sugs.length + ')';
  Bai_complaintCount.textContent = '(' + comps.length + ')';
  Bai_suggestionList.innerHTML = sugs.length
    ? sugs.map(function (t) { return '<li>' + Bai_esc(t) + '</li>'; }).join('')
    : '<li class="Bai_harnessEmptyList">无</li>';
  Bai_complaintList.innerHTML = comps.length
    ? comps.map(function (t) { return '<li>' + Bai_esc(t) + '</li>'; }).join('')
    : '<li class="Bai_harnessEmptyList">无</li>';

  // 总结
  Bai_summaryText.textContent = data.summary || '';

  // 原始 JSON
  Bai_rawJson.textContent = JSON.stringify(data, null, 2);
}

function Bai_showStatus(msg, isError) {
  Bai_status.hidden = false;
  Bai_status.className = 'Bai_harnessStatus' + (isError ? ' Bai_harnessStatusError' : '');
  Bai_status.textContent = msg;
  if (!isError) { setTimeout(function () { Bai_status.hidden = true; }, 4000); }
}

function Bai_esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// 历史
async function Bai_loadHistory() {
  try {
    var resp = await fetch('/api/harness/list');
    var json = await resp.json();
    var list = (json.data && json.data.Bai_list) || [];
    Bai_historyCount.textContent = '共 ' + list.length + ' 条';

    if (!list.length) {
      Bai_historyList.innerHTML = '<div class="Bai_harnessEmpty" style="grid-column: 1/-1;">暂无历史</div>';
      return;
    }

    Bai_historyList.innerHTML = list.map(function (item) {
      var a = item.Bai_output_json || {};
      var s = a.sentiment || {};
      return (
        '<div class="Bai_harnessHistoryItem">' +
          '<div class="Bai_harnessHistoryText">' + Bai_esc(item.Bai_input_text) + '</div>' +
          '<div class="Bai_harnessHistoryMeta">' +
            '<span>' + (s.label || '-') + ' · ' + ((a.entities || []).length) + ' entities</span>' +
            '<span>' + (item.Bai_create_time || '').slice(0, 19).replace('T', ' ') + '</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    Bai_historyList.querySelectorAll('.Bai_harnessHistoryItem').forEach(function (el, i) {
      el.addEventListener('click', function () {
        var item = list[i];
        if (!item) return;
        Bai_inputText.value = item.Bai_input_text;
        Bai_render(item.Bai_output_json);
        Bai_emptyTip.style.display = 'none';
        Bai_result.hidden = false;
        window.scrollTo({ top: Bai_result.offsetTop - 20, behavior: 'smooth' });
      });
    });
  } catch (err) {
    console.error('[历史加载失败]', err);
  }
}

Bai_loadHistory();
