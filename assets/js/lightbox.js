/* ============================================================
   BY Run 长跑社 — 相册灯箱
   点击照片放大、左右切换、Esc 关闭
   本文件一般不需要修改。
   ============================================================ */

(function () {
  'use strict';

  var box = null;      // 灯箱容器
  var imgEl = null;    // 大图
  var capEl = null;    // 说明文字
  var cntEl = null;    // 计数
  var items = [];      // 当前照片列表 [{src, cap}]
  var index = 0;
  var lastFocus = null;

  function photos() {
    return Array.prototype.slice.call(document.querySelectorAll('.photo[data-src]'));
  }

  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '照片查看');
    box.hidden = true;

    var fig = document.createElement('figure');
    imgEl = document.createElement('img');
    imgEl.alt = '';
    capEl = document.createElement('figcaption');
    fig.appendChild(imgEl);
    fig.appendChild(capEl);
    box.appendChild(fig);

    function mkBtn(cls, text, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = text;
      b.setAttribute('aria-label', label);
      return b;
    }

    var closeBtn = mkBtn('lightbox-close', '×', '关闭');
    var prevBtn = mkBtn('lightbox-prev', '‹', '上一张');
    var nextBtn = mkBtn('lightbox-next', '›', '下一张');

    cntEl = document.createElement('div');
    cntEl.className = 'lightbox-counter';

    box.appendChild(closeBtn);
    box.appendChild(prevBtn);
    box.appendChild(nextBtn);
    box.appendChild(cntEl);

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.body.appendChild(box);
  }

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var it = items[index];
    imgEl.src = it.src;
    imgEl.alt = it.cap || '社团活动照片';
    capEl.textContent = it.cap || '';
    capEl.style.display = it.cap ? '' : 'none';
    cntEl.textContent = (index + 1) + ' / ' + items.length;
  }

  function step(d) { show(index + d); }

  function open(list, i, trigger) {
    if (!box) build();
    items = list;
    lastFocus = trigger || document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    var c = box.querySelector('.lightbox-close');
    if (c) c.focus();
  }

  function close() {
    if (!box || box.hidden) return;
    box.hidden = true;
    imgEl.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.photo[data-src]') : null;
    if (!btn) return;
    e.preventDefault();
    var all = photos();
    var list = all.map(function (n) {
      return { src: n.getAttribute('data-src'), cap: n.getAttribute('data-cap') || '' };
    });
    var i = all.indexOf(btn);
    open(list, i < 0 ? 0 : i, btn);
  });

  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { step(-1); }
    else if (e.key === 'ArrowRight') { step(1); }
  });
})();
