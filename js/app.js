/* Пушкин. Детство и Лицей — управление презентацией */
(function () {
  "use strict";

  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var total = slides.length;
  var current = 0;
  var busy = false;

  var progress = document.getElementById("progress");
  var curLabel = document.getElementById("cur");
  var hint = document.getElementById("hint");

  /* ---------- масштаб сцены под окно ---------- */
  var DESIGN_W = 1600;
  var DESIGN_H = 900;

  function fit() {
    if (window.__isMobile && window.__isMobile()) { window.__mobileFit(); return; }
    var scale = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
    var vp = document.getElementById("viewport");
    if (vp) {
      vp.style.transform = "scale(" + scale + ")";
      vp.style.margin = "0";
      vp.style.position = "absolute";
      vp.style.left = ((window.innerWidth - DESIGN_W * scale) / 2) + "px";
      vp.style.top = ((window.innerHeight - DESIGN_H * scale) / 2) + "px";
    }
    var hud = document.getElementById("hud");
    if (hud) hud.style.bottom = Math.max(0, (window.innerHeight - DESIGN_H * scale) / 2 - 4) + "px";
    var h = document.getElementById("hint");
    if (h) h.style.bottom = Math.max(0, (window.innerHeight - DESIGN_H * scale) / 2) + 62 + "px";
  }
  window.addEventListener("resize", fit);

  /* ---------- полоса прогресса ---------- */
  var ticks = [];
  for (var i = 0; i < total; i++) {
    var t = document.createElement("i");
    t.className = "tick";
    t.title = slides[i].getAttribute("data-title") || ("Слайд " + (i + 1));
    (function (idx) {
      t.addEventListener("click", function (e) {
        e.stopPropagation();
        go(idx);
      });
    })(i);
    progress.appendChild(t);
    ticks.push(t);
  }

  function paintProgress() {
    for (var i = 0; i < total; i++) {
      ticks[i].className = "tick" + (i < current ? " done" : i === current ? " now" : "");
    }
    curLabel.textContent = current + 1 < 10 ? "0" + (current + 1) : String(current + 1);
  }

  /* ---------- переключение ---------- */
  function restartAnimations(el) {
    // Перезапуск CSS-анимаций входа при повторном показе слайда
    el.classList.remove("is-active");
    void el.offsetWidth;
    el.classList.add("is-active");
  }

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === current && slides[n].classList.contains("is-active")) return;
    if (busy) return;
    if (window.__mobileCloseMenus) window.__mobileCloseMenus();
    busy = true;

    var prev = slides[current];
    var next = slides[n];

    if (prev !== next) {
      prev.classList.remove("is-active");
      prev.classList.add("is-leaving");
      setTimeout(function () { prev.classList.remove("is-leaving"); }, 620);
    }

    current = n;
    next.classList.remove("is-leaving");
    restartAnimations(next);
    paintProgress();
    updateHash();
    if (window.__mobileUpdate) window.__mobileUpdate();

    setTimeout(function () { busy = false; }, 320);
  }

  function next() {
    if (current === total - 1) { go(0); return; }
    go(current + 1);
  }
  function prev() {
    if (current === 0) { go(total - 1); return; }
    go(current - 1);
  }

  /* точка входа для мобильной оболочки (js/mobile.js) */
  window.__deckGo = go;
  window.__deckNext = next;
  window.__deckPrev = prev;
  window.__deckIndex = function () { return current; };

  /* ---------- адрес слайда ---------- */
  function updateHash() {
    var id = String(current + 1);
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    else location.hash = id;
  }
  function readHash() {
    var h = parseInt((location.hash || "").replace("#", ""), 10);
    return isNaN(h) ? 1 : Math.max(1, Math.min(total, h));
  }

  /* ---------- клавиатура ---------- */
  document.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " " || k === "Spacebar" || k === "Enter") {
      e.preventDefault(); next(); touch();
    } else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || k === "Backspace") {
      e.preventDefault(); prev(); touch();
    } else if (k === "Home") {
      e.preventDefault(); go(0);
    } else if (k === "End") {
      e.preventDefault(); go(total - 1);
    } else if (k === "f" || k === "F" || k === "а" || k === "А") {
      toggleFull();
    } else if (k === "p" || k === "P" || k === "з" || k === "З") {
      window.print();
    } else if (k === "?") {
      toggleHelp();
    }
  });

  /* ---------- колесо и свайпы ---------- */
  var lastWheel = 0;
  window.addEventListener("wheel", function (e) {
    if (window.matchMedia("print").matches) return;
    var now = Date.now();
    if (window.__isMobile && window.__isMobile()) return;
    if (now - lastWheel < 700) return;
    if (Math.abs(e.deltaY) < 24) return;
    lastWheel = now;
    touch();
    if (e.deltaY > 0) next(); else prev();
  }, { passive: true });

  var tx = 0, ty = 0;
  window.addEventListener("touchstart", function (e) {
    if (window.__isMobile && window.__isMobile()) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", function (e) {
    if (window.__isMobile && window.__isMobile()) return;
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      touch();
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ---------- кнопки ---------- */
  function $(id) { return document.getElementById(id); }
  if ($("btnPrev")) $("btnPrev").addEventListener("click", function (e) { e.stopPropagation(); prev(); });
  if ($("btnNext")) $("btnNext").addEventListener("click", function (e) { e.stopPropagation(); next(); });
  if ($("btnFull")) $("btnFull").addEventListener("click", function (e) { e.stopPropagation(); toggleFull(); });
  if ($("btnHelp")) $("btnHelp").addEventListener("click", function (e) { e.stopPropagation(); toggleHelp(); });

  function toggleFull() {
    var d = document.documentElement;
    if (!document.fullscreenElement) {
      if (d.requestFullscreen) d.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setTimeout(fit, 120);
  }

  /* ---------- подсказка ---------- */
  var helpOpen = false;
  var helpBox = null;
  function toggleHelp() {
    if (!helpBox) {
      helpBox = document.createElement("div");
      helpBox.style.cssText = "position:fixed;inset:auto 50% 96px auto;transform:translateX(50%);background:#1d1b17;color:#f3ecdd;padding:22px 28px;z-index:60;" +
        "font-family:'Cormorant Garamond',serif;font-size:17px;line-height:2;box-shadow:0 30px 60px rgba(0,0,0,.5);min-width:340px";
      helpBox.innerHTML = "<div style='letter-spacing:.2em;text-transform:uppercase;font-size:13px;opacity:.6;margin-bottom:8px'>Управление</div>" +
        "<div><b>→ / пробел / колесо</b> — вперёд</div>" +
        "<div><b>←</b> — назад</div>" +
        "<div><b>F</b> — во весь экран</div>" +
        "<div><b>P</b> — печать / PDF</div>" +
        "<div><b>1&ndash;26</b> — номер слайда, затем Enter</div>" +
        "<div><b>клик по полоске внизу</b> — переход</div>" +
        "<div style='letter-spacing:.2em;text-transform:uppercase;font-size:13px;opacity:.6;margin-top:10px;border-top:1px solid rgba(255,255,255,.15);padding-top:8px'>Слайды 1&ndash;26</div>";
      document.body.appendChild(helpBox);
      helpBox.addEventListener("click", function (e) { e.stopPropagation(); toggleHelp(); });
    }
    helpOpen = !helpOpen;
    helpBox.style.display = helpOpen ? "block" : "none";
  }

  var hintTimer = setTimeout(function () { hint.classList.add("hide"); }, 7000);
  function touch() {
    document.body.classList.add("touched");
    clearTimeout(hintTimer);
    hint.classList.add("hide");
    idle();
  }

  /* ---------- автоскрытие интерфейса ---------- */
  var idleTimer;
  function idle() {
    clearTimeout(idleTimer);
    document.body.classList.remove("idle");
    idleTimer = setTimeout(function () { document.body.classList.add("idle"); }, 3200);
  }
  window.addEventListener("mousemove", idle);
  idle();

  /* ---------- набираемые номера слайдов ---------- */
  var numBuf = "", numTimer;
  document.addEventListener("keydown", function (e) {
    if (/^[0-9]$/.test(e.key)) {
      numBuf += e.key;
      clearTimeout(numTimer);
      numTimer = setTimeout(function () { numBuf = ""; }, 1200);
      if (numBuf.length >= 2 || parseInt(numBuf, 10) * 10 > total) {
        var n = parseInt(numBuf, 10);
        numBuf = "";
        if (n >= 1 && n <= total) go(n - 1);
      }
    }
  });

  /* ---------- ответы «проверь себя» ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".uk-ans[data-answer]"), function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!el.dataset.filled) { el.dataset.filled = "1"; }
      el.classList.toggle("is-open");
    });
  });

  /* ---------- старт ---------- */
  fit();
  current = readHash() - 1;
  for (var s = 0; s < total; s++) slides[s].classList.remove("is-active");
  slides[current].classList.add("is-active");
  paintProgress();
  if (window.__mobileUpdate) window.__mobileUpdate();

  window.addEventListener("hashchange", function () {
    var n = readHash() - 1;
    if (n !== current) go(n);
  });
})();