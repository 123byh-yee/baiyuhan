// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

(function () {
  const Bai_uploadForm = document.getElementById('Bai_uploadForm');
  const Bai_file = document.getElementById('Bai_file');
  const Bai_uploadBtn = document.getElementById('Bai_uploadBtn');
  const Bai_uploadStatus = document.getElementById('Bai_uploadStatus');
  const Bai_docList = document.getElementById('Bai_docList');
  const Bai_docCount = document.getElementById('Bai_docCount');
  const Bai_askForm = document.getElementById('Bai_askForm');
  const Bai_question = document.getElementById('Bai_question');
  const Bai_askBtn = document.getElementById('Bai_askBtn');
  const Bai_askStatus = document.getElementById('Bai_askStatus');
  const Bai_kbAnswer = document.getElementById('Bai_kbAnswer');
  const Bai_answerMeta = document.getElementById('Bai_answerMeta');
  const Bai_answerText = document.getElementById('Bai_answerText');
  const Bai_refsList = document.getElementById('Bai_refsList');
  const Bai_apiUrl = document.getElementById('Bai_apiUrl');

  if (!Bai_docList) {
    return;
  }

  if (Bai_apiUrl) {
    Bai_apiUrl.textContent = window.location.origin + '/api/kb/docs';
  }

  function Bai_setStatus(Bai_el, Bai_text, Bai_isError, Bai_visible) {
    if (!Bai_el) {
      return;
    }
    Bai_el.hidden = !Bai_visible;
    Bai_el.textContent = Bai_text;
    Bai_el.className = 'Bai_status' + (Bai_isError ? ' Bai_statusError' : '');
  }

  function Bai_formatSize(Bai_bytes) {
    const Bai_size = Number(Bai_bytes || 0);
    if (Bai_size < 1024) {
      return Bai_size + ' B';
    }
    if (Bai_size < 1024 * 1024) {
      return (Bai_size / 1024).toFixed(1) + ' KB';
    }
    return (Bai_size / 1024 / 1024).toFixed(2) + ' MB';
  }

  // 渲染文档列表
  function Bai_renderDocs(Bai_data) {
    const Bai_items = (Bai_data && Bai_data.Bai_list) || [];
    Bai_docList.innerHTML = '';

    if (Bai_docCount) {
      Bai_docCount.textContent = Bai_items.length + ' 个文件 · ' +
        Number((Bai_data && Bai_data.Bai_chunkTotal) || 0) + ' 个片段';
    }

    if (!Bai_items.length) {
      const Bai_empty = document.createElement('div');
      Bai_empty.className = 'Bai_kbEmpty';
      Bai_empty.textContent = '知识库为空，先上传一个文件吧。';
      Bai_docList.appendChild(Bai_empty);
      return;
    }

    Bai_items.forEach(function (Bai_doc) {
      const Bai_row = document.createElement('div');
      Bai_row.className = 'Bai_kbDoc';

      const Bai_icon = document.createElement('span');
      Bai_icon.className = 'Bai_kbDocIcon';
      Bai_icon.textContent = String(Bai_doc.Bai_type || '').replace('.', '').toUpperCase().slice(0, 4);

      const Bai_body = document.createElement('div');
      Bai_body.className = 'Bai_kbDocBody';

      const Bai_name = document.createElement('span');
      Bai_name.className = 'Bai_kbDocName';
      Bai_name.textContent = Bai_doc.Bai_name;
      Bai_name.title = Bai_doc.Bai_name;

      const Bai_meta = document.createElement('span');
      Bai_meta.className = 'Bai_kbDocMeta';
      Bai_meta.textContent = Bai_formatSize(Bai_doc.Bai_size) + ' · ' +
        Bai_doc.Bai_chunk_count + ' 个片段 · ' + Bai_doc.Bai_uploadTime;

      Bai_body.appendChild(Bai_name);
      Bai_body.appendChild(Bai_meta);

      const Bai_del = document.createElement('button');
      Bai_del.className = 'Bai_kbDocDel';
      Bai_del.type = 'button';
      Bai_del.textContent = '删除';
      Bai_del.addEventListener('click', function () {
        Bai_deleteDoc(Bai_doc);
      });

      Bai_row.appendChild(Bai_icon);
      Bai_row.appendChild(Bai_body);
      Bai_row.appendChild(Bai_del);
      Bai_docList.appendChild(Bai_row);
    });
  }

  // 拉取文档列表
  async function Bai_loadDocs() {
    try {
      const Bai_response = await fetch('/api/kb/docs');
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] GET /api/kb/docs =>', Bai_result);

      if (Bai_result.code !== 0) {
        Bai_setStatus(Bai_uploadStatus, '获取知识库列表失败：' + Bai_result.msg, true, true);
        return;
      }
      Bai_renderDocs(Bai_result.data);
    } catch (Bai_error) {
      console.error('[接口异常] GET /api/kb/docs =>', Bai_error);
      Bai_setStatus(Bai_uploadStatus, '无法访问后端接口 /api/kb/docs，请确认服务已启动（端口 8326）。', true, true);
    }
  }

  // 上传文件
  async function Bai_upload(Bai_event) {
    Bai_event.preventDefault();

    const Bai_selected = Bai_file && Bai_file.files && Bai_file.files[0];
    if (!Bai_selected) {
      Bai_setStatus(Bai_uploadStatus, '请先选择要上传的文件。', true, true);
      return;
    }

    const Bai_formData = new FormData();
    Bai_formData.append('file', Bai_selected);

    Bai_uploadBtn.disabled = true;
    Bai_uploadBtn.textContent = '解析中…';
    Bai_setStatus(Bai_uploadStatus, '正在上传并解析「' + Bai_selected.name + '」…', false, true);
    console.log('[上传文件]', Bai_selected.name, Bai_selected.size + ' 字节');

    try {
      const Bai_response = await fetch('/api/kb/upload', { method: 'POST', body: Bai_formData });
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] POST /api/kb/upload =>', Bai_result);

      if (Bai_result.code !== 0) {
        console.error('[上传失败]', Bai_result.code, Bai_result.msg);
        Bai_setStatus(Bai_uploadStatus, '上传失败：' + Bai_result.msg, true, true);
        return;
      }

      Bai_setStatus(
        Bai_uploadStatus,
        '「' + Bai_result.data.Bai_name + '」解析完成：' +
          Bai_result.data.Bai_chars + ' 字，切分 ' + Bai_result.data.Bai_chunkCount + ' 段。',
        false,
        true
      );
      if (Bai_file) {
        Bai_file.value = '';
      }
      await Bai_loadDocs();
    } catch (Bai_error) {
      console.error('[接口异常] POST /api/kb/upload =>', Bai_error);
      Bai_setStatus(Bai_uploadStatus, '上传失败：无法访问后端接口，请确认服务已启动。', true, true);
    } finally {
      Bai_uploadBtn.disabled = false;
      Bai_uploadBtn.textContent = '上传并解析';
    }
  }

  // 删除文档
  async function Bai_deleteDoc(Bai_doc) {
    if (!window.confirm('确定删除「' + Bai_doc.Bai_name + '」及其全部片段吗？')) {
      return;
    }

    try {
      const Bai_response = await fetch('/api/kb/docs/' + Bai_doc.Bai_id, { method: 'DELETE' });
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] DELETE /api/kb/docs/' + Bai_doc.Bai_id + ' =>', Bai_result);

      if (Bai_result.code !== 0) {
        Bai_setStatus(Bai_uploadStatus, '删除失败：' + Bai_result.msg, true, true);
        return;
      }

      Bai_setStatus(Bai_uploadStatus, '已删除「' + Bai_doc.Bai_name + '」。', false, true);
      await Bai_loadDocs();
    } catch (Bai_error) {
      console.error('[接口异常] DELETE /api/kb/docs =>', Bai_error);
      Bai_setStatus(Bai_uploadStatus, '删除失败：无法访问后端接口。', true, true);
    }
  }

  // 知识库问答
  async function Bai_ask(Bai_event) {
    Bai_event.preventDefault();

    const Bai_text = (Bai_question.value || '').trim();
    if (!Bai_text) {
      Bai_setStatus(Bai_askStatus, '请输入问题后再提问。', true, true);
      return;
    }

    Bai_askBtn.disabled = true;
    Bai_askBtn.textContent = '检索中…';
    Bai_setStatus(Bai_askStatus, '正在检索知识库并请求大模型…', false, true);
    Bai_kbAnswer.hidden = true;
    console.log('[提问]', Bai_text);

    const Bai_startedAt = Date.now();

    try {
      const Bai_response = await fetch('/api/kb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: Bai_text })
      });
      const Bai_result = await Bai_response.json();
      console.log('[接口返回] POST /api/kb/ask =>', Bai_result);

      if (Bai_result.code !== 0) {
        console.error('[问答失败]', Bai_result.code, Bai_result.msg);
        Bai_setStatus(Bai_askStatus, '问答失败：' + Bai_result.msg, true, true);
        return;
      }

      const Bai_data = Bai_result.data;
      const Bai_usage = Bai_data.Bai_usage || {};

      Bai_setStatus(Bai_askStatus, '', false, false);
      Bai_answerText.textContent = Bai_data.Bai_answer;
      Bai_answerMeta.textContent =
        '模型 ' + Bai_data.Bai_model +
        ' · 用时 ' + (Date.now() - Bai_startedAt) + ' ms' +
        (Bai_usage.total_tokens ? ' · tokens ' + Bai_usage.total_tokens : '');

      Bai_refsList.innerHTML = '';
      (Bai_data.Bai_refs || []).forEach(function (Bai_ref) {
        const Bai_li = document.createElement('li');
        Bai_li.className = 'Bai_kbRef';

        const Bai_refName = document.createElement('span');
        Bai_refName.className = 'Bai_kbRefName';
        Bai_refName.textContent = Bai_ref.Bai_docName + ' 第 ' + Bai_ref.Bai_index + ' 段';

        const Bai_score = document.createTextNode('（相关度 ' + Bai_ref.Bai_score + '）');

        const Bai_snippet = document.createElement('span');
        Bai_snippet.className = 'Bai_kbRefSnippet';
        Bai_snippet.textContent = Bai_ref.Bai_snippet;

        Bai_li.appendChild(Bai_refName);
        Bai_li.appendChild(Bai_score);
        Bai_li.appendChild(Bai_snippet);
        Bai_refsList.appendChild(Bai_li);
      });

      Bai_kbAnswer.hidden = false;
      Bai_kbAnswer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (Bai_error) {
      console.error('[接口异常] POST /api/kb/ask =>', Bai_error);
      Bai_setStatus(Bai_askStatus, '问答失败：无法访问后端接口，请确认服务已启动。', true, true);
    } finally {
      Bai_askBtn.disabled = false;
      Bai_askBtn.textContent = '提问';
    }
  }

  if (Bai_uploadForm) {
    Bai_uploadForm.addEventListener('submit', Bai_upload);
  }
  if (Bai_askForm) {
    Bai_askForm.addEventListener('submit', Bai_ask);
  }

  Bai_loadDocs();
})();
