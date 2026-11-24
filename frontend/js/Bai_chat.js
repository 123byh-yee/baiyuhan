// 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
'use strict';

var Bai_CURRENT_SID_KEY = 'Bai_chat_current_session_id';
var Bai_currentSid = Number(localStorage.getItem(Bai_CURRENT_SID_KEY)) || 0;

// DOM
var Bai_sessionsEl = document.getElementById('Bai_sessions');
var Bai_sessionCountEl = document.getElementById('Bai_sessionCount');
var Bai_newBtn = document.getElementById('Bai_newBtn');
var Bai_messagesEl = document.getElementById('Bai_messages');
var Bai_welcomeEl = document.getElementById('Bai_welcome');
var Bai_titleEl = document.getElementById('Bai_currentTitle');
var Bai_form = document.getElementById('Bai_chatForm');
var Bai_input = document.getElementById('Bai_input');
var Bai_send = document.getElementById('Bai_send');
var Bai_status = document.getElementById('Bai_status');

// 初始化
Bai_loadSessions();

Bai_newBtn.addEventListener('click', function () {
  Bai_currentSid = 0;
  localStorage.setItem(Bai_CURRENT_SID_KEY, '0');
  Bai_titleEl.textContent = '新会话';
  Bai_renderMessages([], '');
  Bai_send.disabled = false;
  Bai_input.focus();
});

Bai_form.addEventListener('submit', async function (e) {
  e.preventDefault();
  var text = Bai_input.value.trim();
  if (!text) return;

  Bai_input.value = '';
  Bai_send.disabled = true;

  // 先把用户消息显示出来
  Bai_renderMessage('user', text);
  Bai_scrollToBottom();

  Bai_showStatus('思考中…', false);

  try {
    var payload = { message: text };
    if (Bai_currentSid) payload.sessionId = Bai_currentSid;

    console.log('[前端发送] POST /api/chat sessionId=' + Bai_currentSid);

    var resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var json = await resp.json();
    console.log('[前端收到]', json);

    if (!json || json.code !== 0) {
      Bai_showStatus((json && json.msg) || '请求失败', true);
      return;
    }

    // 保存 sessionId
    Bai_currentSid = json.data.Bai_sessionId;
    localStorage.setItem(Bai_CURRENT_SID_KEY, String(Bai_currentSid));

    Bai_renderMessage('assistant', json.data.Bai_reply);
    Bai_showStatus('完成 · ' + json.data.Bai_elapsed + ' ms', false);

    // 刷新会话列表 + 更新标题
    Bai_loadSessions();
    Bai_updateCurrentTitle();

    // 如果触发了压缩，提示一下
    if (json.data.Bai_compressed) {
      Bai_showStatus('💾 历史已自动压缩摘要', false);
    }
  } catch (err) {
    console.error(err);
    Bai_showStatus('网络错误：' + err.message, true);
    Bai_renderMessage('assistant', '❌ 请求失败：' + err.message);
  } finally {
    Bai_send.disabled = false;
    Bai_input.focus();
    Bai_scrollToBottom();
  }
});

Bai_input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    Bai_form.requestSubmit();
  }
});

// ===== 会话列表 =====
async function Bai_loadSessions() {
  try {
    var resp = await fetch('/api/chat/sessions');
    var json = await resp.json();
    var list = (json.data && json.data.Bai_list) || [];
    Bai_sessionCountEl.textContent = list.length;

    if (!list.length) {
      Bai_sessionsEl.innerHTML = '<div class="Bai_chatEmptyHint">还没有会话，点上方按钮新建</div>';
    } else {
      Bai_sessionsEl.innerHTML = list.map(function (s) {
        var isActive = Number(s.Bai_id) === Bai_currentSid;
        return (
          '<div class="Bai_sessionItem' + (isActive ? ' Bai_sessionActive' : '') + '" data-id="' + s.Bai_id + '">' +
            '<div class="Bai_sessionTitle">' + Bai_esc(s.Bai_title) + '</div>' +
            '<div class="Bai_sessionTime">' + Bai_fmtTime(s.Bai_create_time) + '</div>' +
            '<button class="Bai_sessionDel" data-del="' + s.Bai_id + '" title="删除">✕</button>' +
          '</div>'
        );
      }).join('');
    }

    // 绑定点击
    Bai_sessionsEl.querySelectorAll('.Bai_sessionItem').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-del')) return; // 点击删除按钮不走这里
        var id = Number(el.getAttribute('data-id'));
        Bai_currentSid = id;
        localStorage.setItem(Bai_CURRENT_SID_KEY, String(id));
        Bai_loadSessions();
        Bai_loadMessages();
        Bai_send.disabled = false;
      });
    });

    // 删除按钮
    Bai_sessionsEl.querySelectorAll('.Bai_sessionDel').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        var id = Number(btn.getAttribute('data-del'));
        if (!confirm('确定删除这个会话吗？')) return;
        try {
          await fetch('/api/chat/sessions/' + id, { method: 'DELETE' });
          if (Bai_currentSid === id) {
            Bai_currentSid = 0;
            localStorage.setItem(Bai_CURRENT_SID_KEY, '0');
            Bai_titleEl.textContent = '未选择会话';
            Bai_renderMessages([], '');
            Bai_send.disabled = true;
          }
          Bai_loadSessions();
        } catch (err) { console.error(err); }
      });
    });

    Bai_updateCurrentTitle();
  } catch (err) {
    console.error('[会话列表加载失败]', err);
  }
}

async function Bai_updateCurrentTitle() {
  if (!Bai_currentSid) {
    Bai_titleEl.textContent = '未选择会话';
    return;
  }
  try {
    var resp = await fetch('/api/chat/sessions/' + Bai_currentSid + '/messages');
    var json = await resp.json();
    if (json.code === 0) {
      Bai_titleEl.textContent = json.data.Bai_title;
    }
  } catch (e) {}
}

async function Bai_loadMessages() {
  if (!Bai_currentSid) {
    Bai_renderMessages([], '');
    return;
  }
  try {
    var resp = await fetch('/api/chat/sessions/' + Bai_currentSid + '/messages');
    var json = await resp.json();
    if (json.code === 0) {
      Bai_renderMessages(json.data.Bai_messages || [], json.data.Bai_summary || '');
    }
  } catch (err) { console.error(err); }
}

function Bai_renderMessages(messages, summary) {
  Bai_welcomeEl.hidden = messages.length > 0 || !!summary;
  Bai_messagesEl.innerHTML = '';

  if (summary) {
    var summaryEl = document.createElement('div');
    summaryEl.className = 'Bai_chatCompressed';
    summaryEl.innerHTML = '<div class="Bai_chatCompressedLabel">📋 历史摘要（已压缩）</div><div class="Bai_chatCompressedText">' + Bai_esc(summary) + '</div>';
    Bai_messagesEl.appendChild(summaryEl);
  }

  messages.forEach(function (m) {
    Bai_renderMessage(m.Bai_role === 'assistant' ? 'assistant' : 'user', m.Bai_content, m.Bai_create_time);
  });
}

function Bai_renderMessage(role, content, time) {
  Bai_welcomeEl.hidden = true;
  var el = document.createElement('div');
  el.className = 'Bai_chatMsg Bai_chatMsg' + role.charAt(0).toUpperCase() + role.slice(1);
  el.innerHTML =
    '<div class="Bai_chatMsgAvatar">' + (role === 'user' ? '👤' : '🤖') + '</div>' +
    '<div class="Bai_chatMsgBody">' +
      '<div class="Bai_chatMsgName">' + (role === 'user' ? '你' : 'AI 助手') +
        (time ? '<span class="Bai_chatMsgTime">' + Bai_fmtTime(time) + '</span>' : '') +
      '</div>' +
      '<div class="Bai_chatMsgText">' + Bai_esc(content) + '</div>' +
    '</div>';
  Bai_messagesEl.appendChild(el);
}

function Bai_scrollToBottom() {
  Bai_messagesEl.scrollTop = Bai_messagesEl.scrollHeight;
}

function Bai_showStatus(msg, isError) {
  Bai_status.hidden = false;
  Bai_status.className = 'Bai_chatStatus' + (isError ? ' Bai_chatStatusError' : '');
  Bai_status.textContent = msg;
  if (!isError) { setTimeout(function () { Bai_status.hidden = true; }, 4000); }
}

function Bai_esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function Bai_fmtTime(s) {
  if (!s) return '';
  var d = new Date(s);
  if (isNaN(d.getTime())) return '';
  var p = function (n) { return n < 10 ? '0' + n : '' + n; };
  return p(d.getMonth() + 1) + '/' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

// 启动时如果有 currentSid，加载消息
if (Bai_currentSid) Bai_loadMessages();
