/* ============================================================
   BY Run 长跑社 — 数据渲染
   把 assets/js/data/*.js 里的"文本行"渲染成页面列表
   ------------------------------------------------------------
   每行格式：字段1 | 字段2 | 字段3 …
   以 # 开头的行会被忽略（可当备注用）。
   本文件一般不需要修改。
   ============================================================ */

(function () {
  'use strict';

  var WEEK_ORDER = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var IMG_BASE = 'assets/img/gallery/';

  /* ---------- 工具 ---------- */

  function toLines(raw) {
    if (typeof raw !== 'string') return null;
    return raw.split(/\r?\n/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0 && s.charAt(0) !== '#'; });
  }

  function toRows(raw) {
    var ls = toLines(raw);
    if (ls === null) return null;
    return ls.map(function (s) {
      return s.split('|').map(function (c) { return c.trim(); });
    });
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function cell(tr, text, cls) {
    var td = el('td', cls || null, text);
    tr.appendChild(td);
    return td;
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function limitOf(container, rows) {
    var n = parseInt(container.getAttribute('data-limit'), 10);
    return (isNaN(n) || n <= 0) ? rows : rows.slice(0, n);
  }

  function emptyState(container, msg) {
    container.innerHTML = '';
    var box = el('div', 'empty');
    box.appendChild(el('p', null, msg));
    container.appendChild(box);
  }

  function broken(container, file) {
    emptyState(container,
      '数据未加载：请检查 assets/js/data/' + file + ' 里的反引号 ` 是否被误删。' +
      '可在该文件的 History 中回滚到上一版本。');
  }

  /* ---------- 表格构造 ---------- */

  function buildTable(container, caption, headers, rows, numericFrom) {
    var wrap = el('div', 'table-wrap');
    var table = el('table', 'table');
    if (caption) {
      var cap = el('caption', null, caption);
      table.appendChild(cap);
    }
    var thead = el('thead');
    var htr = el('tr');
    headers.forEach(function (h) { htr.appendChild(el('th', null, h)); });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = el('tbody');
    var isRanked = headers[0] === '#';
    rows.forEach(function (r, i) {
      var tr = el('tr');
      if (isRanked) cell(tr, String(i + 1), 'rank num');
      headers.slice(isRanked ? 1 : 0).forEach(function (_, j) {
        var idx = isRanked ? j + 1 : j;
        var cls = (numericFrom !== undefined && j >= numericFrom) ? 'num' : null;
        var td = cell(tr, r[idx] || '', cls);
        if ((r[idx] || '').length > 14) td.classList.add('wrap-cell');
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);

    container.innerHTML = '';
    container.appendChild(wrap);
  }

  /* ---------- 各板块渲染器 ---------- */

  var renderers = {

    /* 公告栏 */
    announcements: function (container) {
      var rows = toRows(window.ANNOUNCEMENTS);
      if (rows === null) return broken(container, 'daily.js');
      if (!rows.length) return emptyState(container, '暂无公告。');

      rows.sort(function (a, b) { return (b[0] || '').localeCompare(a[0] || ''); });
      container.innerHTML = '';
      limitOf(container, rows).forEach(function (r) {
        var li = el('li', 'list-item');
        li.appendChild(el('div', 'list-item__date', r[0] || ''));
        var main = el('div', 'list-item__main');
        main.appendChild(el('p', 'list-item__title', r[1] || ''));
        if (r[2]) main.appendChild(el('p', 'list-item__desc', r[2]));
        li.appendChild(main);
        container.appendChild(li);
      });
    },

    /* 每周训练计划 */
    training: function (container) {
      var rows = toRows(window.TRAINING);
      if (rows === null) return broken(container, 'daily.js');
      if (!rows.length) return emptyState(container, '训练计划尚未填写。');

      rows.sort(function (a, b) {
        var ia = WEEK_ORDER.indexOf(a[0]), ib = WEEK_ORDER.indexOf(b[0]);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

      container.innerHTML = '';
      rows.forEach(function (r) {
        var isRest = (r[3] || '').indexOf('休息') > -1 || (r[1] || '').indexOf('休息') > -1;
        var d = el('div', 'day' + (isRest ? ' is-rest' : ''));
        d.appendChild(el('p', 'day__name', r[0] || ''));
        d.appendChild(el('p', 'day__time', r[1] || ''));
        if (r[2] && r[2] !== '-') d.appendChild(el('p', 'day__place', r[2]));
        d.appendChild(el('p', 'day__what', r[3] || ''));
        container.appendChild(d);
      });
    },

    /* 活动日历 */
    activities: function (container) {
      var rows = toRows(window.ACTIVITIES);
      if (rows === null) return broken(container, 'activities.js');
      if (!rows.length) return emptyState(container, '暂无活动安排。');

      rows.sort(function (a, b) { return (a[0] || '').localeCompare(b[0] || ''); });

      if (container.getAttribute('data-future') === '1') {
        var t = todayISO();
        var up = rows.filter(function (r) { return (r[0] || '') >= t; });
        if (up.length) rows = up;
      }

      container.innerHTML = '';
      limitOf(container, rows).forEach(function (r) {
        var li = el('li', 'list-item');
        li.appendChild(el('div', 'list-item__date', r[0] || ''));
        var main = el('div', 'list-item__main');
        var title = el('p', 'list-item__title', r[1] || '');
        main.appendChild(title);
        var bits = [];
        if (r[2]) bits.push(r[2]);
        if (r[3]) bits.push(r[3]);
        if (bits.length) main.appendChild(el('p', 'list-item__desc', bits.join(' · ')));
        li.appendChild(main);
        container.appendChild(li);
      });
    },

    /* 社团纪录榜 */
    'club-records': function (container) {
      var rows = toRows(window.CLUB_RECORDS);
      if (rows === null) return broken(container, 'records.js');
      if (!rows.length) return emptyState(container, '暂无纪录数据。');
      buildTable(container, '成绩为社团内部认定纪录，仅登记社团活动与正式赛事中的成绩。',
        ['项目', '成绩', '保持者', '日期'], rows, 1);
    },

    /* 近期赛事成绩 */
    'race-results': function (container) {
      var rows = toRows(window.RACE_RESULTS);
      if (rows === null) return broken(container, 'records.js');
      if (!rows.length) return emptyState(container, '暂无赛事成绩。');
      rows.sort(function (a, b) { return (b[0] || '').localeCompare(a[0] || ''); });
      buildTable(container, '按比赛日期倒序排列。',
        ['日期', '赛事', '姓名', '项目', '成绩'], rows, 4);
    },

    /* 成员 PB */
    'personal-bests': function (container) {
      var rows = toRows(window.PERSONAL_BESTS);
      if (rows === null) return broken(container, 'records.js');
      if (!rows.length) return emptyState(container, '暂无个人最好成绩。');
      rows.sort(function (a, b) { return (a[0] || '').localeCompare(b[0] || ''); });
      buildTable(container, '仅登记成员主动提交的个人最好成绩，不代表全部成员水平。',
        ['姓名', '项目', '成绩', '达成日期'], rows, 2);
    },

    /* 干部卡片 */
    'members-admin': function (container) {
      var rows = toRows(window.MEMBERS_ADMIN);
      if (rows === null) return broken(container, 'members.js');
      if (!rows.length) return emptyState(container, '暂无干部信息。');

      container.innerHTML = '';
      rows.forEach(function (r) {
        var box = el('div', 'member');
        var name = r[0] || '';
        var av = el('div', 'member__avatar');
        av.appendChild(el('span', null, name ? name.charAt(0) : '?'));
        box.appendChild(av);

        var body = el('div');
        body.appendChild(el('p', 'member__name', name));
        body.appendChild(el('p', 'member__role', r[1] || ''));
        if (r[2]) body.appendChild(el('p', 'member__bio', r[2]));
        box.appendChild(body);
        container.appendChild(box);
      });
    },

    /* 成员名单 */
    'members-list': function (container) {
      var rows = toRows(window.MEMBERS_LIST);
      if (rows === null) return broken(container, 'members.js');
      if (!rows.length) return emptyState(container, '暂无成员名单。');

      container.innerHTML = '';
      rows.forEach(function (r) {
        var li = el('li');
        li.appendChild(el('span', 'n', r[0] || ''));
        if (r[1]) li.appendChild(el('span', 'y', r[1]));
        container.appendChild(li);
      });
    },

    /* 相册 */
    gallery: function (container) {
      var rows = toRows(window.GALLERY);
      if (rows === null) return broken(container, 'gallery.js');
      if (!rows.length) return emptyState(container, '相册还是空的，欢迎投稿活动照片。');

      rows.sort(function (a, b) { return (b[2] || '').localeCompare(a[2] || ''); });

      container.innerHTML = '';
      rows.forEach(function (r) {
        var file = r[0] || '';
        if (!file) return;
        var src = /^https?:\/\//i.test(file) ? file : IMG_BASE + file;
        var cap = r[1] || '';

        var btn = el('button', 'photo');
        btn.type = 'button';
        btn.setAttribute('data-src', src);
        btn.setAttribute('data-cap', cap);
        btn.setAttribute('aria-label', '放大查看：' + (cap || file));

        var img = el('img');
        img.src = src;
        img.alt = cap || '社团活动照片';
        img.loading = 'lazy';
        img.decoding = 'async';
        btn.appendChild(img);

        if (cap) btn.appendChild(el('span', 'photo__cap', cap));
        container.appendChild(btn);
      });
    }
  };

  /* ---------- 启动 ---------- */

  function run() {
    var nodes = document.querySelectorAll('[data-render]');
    Array.prototype.forEach.call(nodes, function (node) {
      var name = node.getAttribute('data-render');
      var fn = renderers[name];
      if (fn) fn(node);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
