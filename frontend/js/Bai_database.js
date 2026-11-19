// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
'use strict';

(function () {
  const Bai_form = document.getElementById('Bai_form');
  const Bai_username = document.getElementById('Bai_username');
  const Bai_password = document.getElementById('Bai_password');
  const Bai_eye = document.getElementById('Bai_eye');
  const Bai_submit = document.getElementById('Bai_submit');
  const Bai_reset = document.getElementById('Bai_reset');

  const Bai_result = document.getElementById('Bai_result');
  const Bai_resultTitle = document.getElementById('Bai_resultTitle');
  const Bai_resultMsg = document.getElementById('Bai_resultMsg');
  const Bai_resultTime = document.getElementById('Bai_resultTime');
  const Bai_resultList = document.getElementById('Bai_resultList');

  if (!Bai_form) {
    return;
  }

  // 密码可见性切换
  if (Bai_eye) {
    Bai_eye.addEventListener('click', function () {
      const Bai_isPassword = Bai_password.type === 'password';
      Bai_password.type = Bai_isPassword ? 'text' : 'password';
      Bai_eye.setAttribute('aria-pressed', String(Bai_isPassword));
      Bai_eye.setAttribute('aria-label', Bai_isPassword ? '隐藏密码' : '显示密码');
    });
  }

  // 动态添加一条结果明细
  function Bai_appendItem(Bai_key, Bai_value) {
    const Bai_li = document.createElement('li');
    Bai_li.className = 'Bai_resultItem';

    const Bai_keyNode = document.createElement('span');
    Bai_keyNode.className = 'Bai_resultKey';
    Bai_keyNode.textContent = Bai_key;

    const Bai_valueNode = document.createElement('span');
    Bai_valueNode.className = 'Bai_resultValue';
    Bai_valueNode.textContent = Bai_value;

    Bai_li.appendChild(Bai_keyNode);
    Bai_li.appendChild(Bai_valueNode);
    Bai_resultList.appendChild(Bai_li);
  }

  // 渲染结果面板
  function Bai_renderResult(Bai_state, Bai_title, Bai_message, Bai_elapsed, Bai_items) {
    Bai_result.hidden = false;
    Bai_result.className = 'Bai_result Bai_result' + (Bai_state === 'success' ? 'Success' : 'Error');
    Bai_resultTitle.textContent = Bai_title;
    Bai_resultMsg.textContent = Bai_message;
    Bai_resultTime.textContent = Bai_elapsed + ' ms';
    Bai_resultList.innerHTML = '';

    (Bai_items || []).forEach(function (Bai_item) {
      if (Bai_item.value !== undefined && Bai_item.value !== null && Bai_item.value !== '') {
        Bai_appendItem(Bai_item.key, Bai_item.value);
      }
    });

    Bai_result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 提交表单：调用后端连接测试接口
  async function Bai_submitForm(Bai_event) {
    if (Bai_event) {
      Bai_event.preventDefault();
    }

    const Bai_userValue = Bai_username.value.trim();
    const Bai_passwordValue = Bai_password.value;

    if (!Bai_userValue || !Bai_passwordValue) {
      Bai_result.hidden = false;
      Bai_result.className = 'Bai_result Bai_resultError';
      Bai_resultTitle.textContent = '无法提交';
      Bai_resultMsg.textContent = '用户名和密码不能为空，请填写后再试。';
      Bai_resultTime.textContent = '';
      Bai_resultList.innerHTML = '';
      console.error('[数据库连接] 校验失败：用户名或密码为空');
      return;
    }

    Bai_submit.disabled = true;
    Bai_submit.textContent = '连接中…';
    const Bai_startedAt = performance.now();

    try {
      const Bai_response = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: Bai_userValue,
          password: Bai_passwordValue
        })
      });

      const Bai_resultData = await Bai_response.json();
      const Bai_elapsed = Math.round(performance.now() - Bai_startedAt);
      console.log('[接口返回] POST /api/db/test =>', Bai_resultData);

      if (Bai_resultData.code === 0) {
        const Bai_data = Bai_resultData.data || {};
        Bai_renderResult(
          'success',
          Bai_resultData.msg,
          '已成功连接 MySQL 数据库，可正常执行查询。',
          Bai_elapsed,
          [
            { key: '数据库主机', value: Bai_data.Bai_host },
            { key: 'MySQL 版本', value: Bai_data.Bai_version },
            { key: '当前用户', value: Bai_data.Bai_currentUser },
            { key: '可见数据库数', value: Bai_data.Bai_databaseCount },
            { key: '业务数据库', value: (Bai_data.Bai_databaseList || []).join('、') }
          ]
        );
      } else {
        const Bai_error = Bai_resultData.data || {};
        Bai_renderResult(
          'error',
          Bai_resultData.msg,
          '连接未建立，请根据提示检查用户名、密码或 MySQL 服务状态。',
          Bai_elapsed,
          [
            { key: '错误码', value: Bai_resultData.code },
            { key: 'MySQL 错误编号', value: Bai_error.Bai_errorNumber },
            { key: 'MySQL 错误标识', value: Bai_error.Bai_errorCode }
          ]
        );
        console.error('[数据库连接失败]', Bai_resultData.code, Bai_resultData.msg);
      }
    } catch (Bai_error) {
      const Bai_elapsed = Math.round(performance.now() - Bai_startedAt);
      Bai_renderResult(
        'error',
        '请求失败',
        '无法访问后端接口 /api/db/test，请确认服务已启动（端口 8326）。',
        Bai_elapsed,
        []
      );
      console.error('[接口异常] POST /api/db/test =>', Bai_error);
    } finally {
      Bai_submit.disabled = false;
      Bai_submit.textContent = '连接数据库';
    }
  }

  Bai_form.addEventListener('submit', Bai_submitForm);

  // 重置：清空结果面板
  if (Bai_reset) {
    Bai_reset.addEventListener('click', function () {
      Bai_result.hidden = true;
      Bai_resultList.innerHTML = '';
      console.log('[数据库连接] 表单已重置为默认值');
    });
  }
})();
