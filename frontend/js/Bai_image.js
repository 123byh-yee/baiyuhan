// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

var Bai_API = {
  recognize: '/api/image/recognize',
  records: '/api/image/records'
};

// DOM 引用
var Bai_preview = document.getElementById('Bai_preview');
var Bai_previewImg = document.getElementById('Bai_previewImg');
var Bai_file = document.getElementById('Bai_file');
var Bai_prompt = document.getElementById('Bai_prompt');
var Bai_detail = document.getElementById('Bai_detail');
var Bai_uploadForm = document.getElementById('Bai_uploadForm');
var Bai_submitBtn = document.getElementById('Bai_submitBtn');
var Bai_status = document.getElementById('Bai_uploadStatus');
var Bai_resultEmpty = document.getElementById('Bai_resultEmpty');
var Bai_resultAnswer = document.getElementById('Bai_resultAnswer');
var Bai_answerMeta = document.getElementById('Bai_answerMeta');
var Bai_answerText = document.getElementById('Bai_answerText');
var Bai_usage = document.getElementById('Bai_usage');
var Bai_historyList = document.getElementById('Bai_historyList');
var Bai_historyCount = document.getElementById('Bai_historyCount');

// 文件选择 → 本地预览
Bai_file.addEventListener('change', function () {
  var Bai_f = Bai_file.files && Bai_file.files[0];
  if (!Bai_f) {
    Bai_preview.style.display = 'grid';
    Bai_previewImg.hidden = true;
    Bai_previewImg.src = '';
    return;
  }
  var Bai_reader = new FileReader();
  Bai_reader.onload = function (e) {
    Bai_preview.style.display = 'none';
    Bai_previewImg.hidden = false;
    Bai_previewImg.src = e.target.result;
  };
  Bai_reader.readAsDataURL(Bai_f);
});

// 识别按钮
Bai_uploadForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  var Bai_f = Bai_file.files && Bai_file.files[0];
  if (!Bai_f) {
    Bai_showStatus('请先选择一张图片', true);
    return;
  }

  var Bai_form = new FormData();
  Bai_form.append('file', Bai_f);
  Bai_form.append('prompt', Bai_prompt.value.trim());
  Bai_form.append('detail', Bai_detail.value);

  Bai_submitBtn.disabled = true;
  Bai_submitBtn.textContent = '识别中…';
  Bai_showStatus('正在调用视觉模型，首次可能需要 5–15 秒，请稍候…', false);
  Bai_resultAnswer.hidden = true;
  Bai_resultEmpty.style.display = 'grid';

  console.log('[前端发送] POST ' + Bai_API.recognize + '，文件名=' + Bai_f.name + '，大小=' + Bai_f.size);

  var Bai_t0 = Date.now();
  try {
    var Bai_resp = await fetch(Bai_API.recognize, {
      method: 'POST',
      body: Bai_form
    });
    var Bai_json = await Bai_resp.json();
    console.log('[前端收到]', Bai_json);

    if (!Bai_json || Bai_json.code !== 0) {
      Bai_showStatus((Bai_json && Bai_json.msg) || '识别失败', true);
      return;
    }

    var Bai_data = Bai_json.data || {};
    Bai_showStatus('识别成功！耗时 ' + Bai_data.Bai_elapsed + ' ms', false);
    Bai_renderAnswer(Bai_data);
    Bai_renderHistory();
  } catch (err) {
    console.error('[前端错误]', err);
    Bai_showStatus('网络错误：' + err.message, true);
  } finally {
    Bai_submitBtn.disabled = false;
    Bai_submitBtn.textContent = '开始识别';
  }
});

function Bai_renderAnswer(Bai_data) {
  Bai_resultEmpty.style.display = 'none';
  Bai_resultAnswer.hidden = false;
  Bai_answerText.textContent = Bai_data.Bai_answer || '（无回答）';
  Bai_answerMeta.textContent =
    (Bai_data.Bai_model || '') + ' · ' + Bai_detail.value + ' · ' + Bai_data.Bai_elapsed + 'ms';

  if (Bai_data.Bai_usage) {
    var Bai_u = Bai_data.Bai_usage;
    Bai_usage.textContent =
      'tokens: prompt=' + (Bai_u.prompt_tokens || 0) +
      ' completion=' + (Bai_u.completion_tokens || 0) +
      ' total=' + (Bai_u.total_tokens || 0);
    Bai_usage.hidden = false;
  } else {
    Bai_usage.hidden = true;
  }
}

function Bai_showStatus(msg, isError) {
  Bai_status.hidden = false;
  Bai_status.className = 'Bai_status' + (isError ? ' Bai_statusError' : '');
  Bai_status.textContent = msg;
  if (!isError) {
    setTimeout(function () { Bai_status.hidden = true; }, 5000);
  }
}

// 渲染历史
async function Bai_renderHistory() {
  try {
    var Bai_resp = await fetch(Bai_API.records);
    var Bai_json = await Bai_resp.json();
    console.log('[前端历史]', Bai_json);

    var Bai_list = (Bai_json && Bai_json.data && Bai_json.data.Bai_list) || [];
    Bai_historyCount.textContent = '共 ' + Bai_list.length + ' 条';

    if (!Bai_list.length) {
      Bai_historyList.innerHTML = '<div class="Bai_imageResultEmpty" style="grid-column: 1/-1;">暂无识别记录</div>';
      return;
    }

    Bai_historyList.innerHTML = Bai_list.map(function (item) {
      return (
        '<div class="Bai_imageHistoryItem">' +
          '<div class="Bai_imageHistoryHead">' +
            '<span class="Bai_imageHistoryName">' + Bai_esc(item.Bai_name) + '</span>' +
            '<span class="Bai_imageHistoryTime">' + Bai_fmtTime(item.Bai_create_time) + '</span>' +
          '</div>' +
          '<div class="Bai_imageHistoryPrompt">提示：' + Bai_esc(item.Bai_prompt || '（默认）') + '</div>' +
          '<div class="Bai_imageHistoryAnswer">' + Bai_esc(item.Bai_answer || '') + '</div>' +
        '</div>'
      );
    }).join('');

    // 点击历史 → 填充到结果区
    Bai_historyList.querySelectorAll('.Bai_imageHistoryItem').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = Array.prototype.indexOf.call(Bai_historyList.children, el);
        var item = Bai_list[idx];
        if (!item) return;
        Bai_resultEmpty.style.display = 'none';
        Bai_resultAnswer.hidden = false;
        Bai_answerText.textContent = item.Bai_answer || '';
        Bai_answerMeta.textContent = (item.Bai_model || '') + ' · ' + item.Bai_elapsed + 'ms · 历史记录';
        Bai_usage.hidden = true;
      });
    });
  } catch (err) {
    console.error('[历史加载失败]', err);
    Bai_historyList.innerHTML = '<div class="Bai_imageResultEmpty" style="grid-column: 1/-1;">历史加载失败</div>';
  }
}

function Bai_esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function Bai_fmtTime(s) {
  if (!s) return '';
  var d = new Date(s);
  if (isNaN(d.getTime())) return String(s);
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// 页面加载即拉历史
Bai_renderHistory();
