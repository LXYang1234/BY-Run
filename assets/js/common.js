/* ============================================================
   BY Run 长跑社 — 通用交互
   主题切换、导航高亮、移动端菜单、页脚年份、滚动渐入
   本文件一般不需要修改。
   ============================================================ */

(function () {
  'use strict';

  var THEME_KEY = 'byrun-theme';

  /* ---------- 主题切换 ---------- */
  function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');

    // 尽早应用已保存的偏好
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* 隐私模式 */ }
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    if (!btn) return;

    function effective() {
      var cur = root.getAttribute('data-theme');
      if (cur === 'light' || cur === 'dark') return cur;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light' : 'dark';
    }

    function label() {
      var next = effective() === 'light' ? '暗色' : '亮色';
      btn.setAttribute('aria-label', '切换到' + next + '主题');
      btn.setAttribute('title', '切换到' + next + '主题');
    }
    label();

    btn.addEventListener('click', function () {
      var next = effective() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 忽略 */ }
      label();
    });
  }

  /* ---------- 导航当前页高亮 ---------- */
  function initNavHighlight() {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('#site-nav a[href]');
    Array.prototype.forEach.call(links, function (a) {
      var target = a.getAttribute('href');
      if (target === here) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- 移动端汉堡菜单 ---------- */
  function initMobileNav() {
    var btn = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        btn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---------- 页脚年份 ---------- */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- 滚动渐入 ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* ---------- 图片缺失时自动降级 ----------
     用法：<img src="assets/img/join-qr.png" data-fallback="assets/img/join-qr.svg">
     真实图片放上去后自动显示真实图片，不再走占位图。 */
  function initImageFallback() {
    var imgs = document.querySelectorAll('img[data-fallback]');
    Array.prototype.forEach.call(imgs, function (img) {
      function swap() {
        var fb = img.getAttribute('data-fallback');
        if (!fb || img.dataset.fallbackDone === '1') return;
        img.dataset.fallbackDone = '1';
        img.src = fb;
      }
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener('error', swap);
    });
  }

  function run() {
    initTheme();
    initNavHighlight();
    initMobileNav();
    initYear();
    initReveal();
    initImageFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
