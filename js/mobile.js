/* Мобильная оболочка: подгонка сцены, шапка/подвал, шторка, свайп, просмотр фото */
(function () {
  "use strict";

  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var total = slides.length;
  var DESIGN_W = 1600, DESIGN_H = 900;
  var M_TOP = 60, M_BOTTOM = 88;
  var peeked = false;

  var mqMobile = window.matchMedia("(max-width: 760px), (max-height: 500px) and (pointer: coarse)");
  var mqRotated = window.matchMedia("(orientation: landscape)");
  function isMobile() {
    // повёрнутый телефон/планшет ((pointer: coarse)) — тоже мобильный интерфейс
    var coarse = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    return mqMobile.matches || (coarse && mqRotated.matches && Math.min(window.innerWidth, window.innerHeight) < 900);
  }
  function current() { return parseInt(window.__deckIndex ? window.__deckIndex() : "0", 10); }

  function viewportSize() {
    var vv = window.visualViewport;
    if (vv && vv.width) return { w: vv.width, h: vv.height };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  var OE = ""; // кеш превью поворота
  var curPad = { t: M_TOP, b: M_BOTTOM };

  function fitMobile() {
    var top = peeked ? 8 : M_TOP;
    var bottom = peeked ? 24 : M_BOTTOM;
    var v = viewportSize();
    var sc = Math.min(v.w / DESIGN_W, (v.h - top - bottom) / DESIGN_H);
    if (!(sc > 0)) return;
    curPad = { t: top, b: bottom, sc: sc };
    var vp = document.getElementById("viewport");
    vp.style.transform = "scale(" + sc + ")";
    vp.style.position = "absolute";
    vp.style.left = ((v.w - DESIGN_W * sc) / 2) + "px";
    vp.style.top = (top + (v.h - top - bottom - DESIGN_H * sc) / 2) + "px";
  }

  /* поворот на телефоне: альбомный слайд на весь экран */
  var rotTimer;

  /* крупный кадр для альбомного режима: у каждого слайда свой герой */
  var HERO = {
    1: "img/cover_manor.jpg", 2: "img/estate.jpg", 3: "img/estate.jpg",
    4: "img/autumn.jpg", 5: "img/desk.jpg", 6: "img/autumn.jpg",
    7: "img/autumn.jpg", 8: "img/portrait_wall.jpg", 9: "img/cover_manor.jpg",
    10: "img/bust.jpg", 11: "img/manuscript.jpg", 12: "img/doodle.jpg",
    13: "img/estate.jpg", 14: "img/estate.jpg", 15: "img/sokolov.jpg"
  };

  function enterLandscape() {
    if (!isMobile()) return;
    fitMobile();
    var idx = current() + 1;
    var src = HERO[idx] ? { src: HERO[idx] } : null;
    if (!src) return;
    if (!OE) {
      OE = document.createElement("div");
      OE.className = "m-orient";
      OE.innerHTML = '<img alt=""><div class="m-orient-tip">Поверните телефон<br><span>вертикально — надписи будут читаться</span></div>';
      document.body.appendChild(OE);
    }
    OE.querySelector("img").src = src.currentSrc || src.src;
    OE.classList.add("on");
    clearTimeout(rotTimer);
    rotTimer = setTimeout(function () { exitLandscape(); }, 5200);
  }
  function exitLandscape() {
    if (OE) OE.classList.remove("on");
    clearTimeout(rotTimer);
  }
  if (OE_orientation_supported()) {
    window.addEventListener("orientationchange", function () {
      exitLandscape();
      if (Math.abs(window.orientation) === 90) setTimeout(enterLandscape, 450);
    });
  }
  function OE_orientation_supported() {
    return typeof window.orientation !== "undefined" || (navigator.maxTouchPoints > 0);
  }
  window.__mobileOpenHero = function () {
    setPeek(false);
    enterLandscape();
  };
  window.__mobileEnterLandscape = enterLandscape;
  window.__mobileExitLandscape = exitLandscape;
  window.__mobileFit = fitMobile;
  window.__isMobile = isMobile;

  var mTitle = document.getElementById("mTitle");
  var mKicker = document.getElementById("mKicker");
  var mLabel = document.getElementById("mLabel");
  var mCount = document.getElementById("mCount");
  var mRailFill = document.getElementById("mRailFill");
  var mSheet = document.getElementById("mSheet");
  var mList = document.getElementById("mList");
  var mLightbox = document.getElementById("mLightbox");
  var mLbImg = document.getElementById("mLbImg");
  var mLbCap = document.getElementById("mLbCap");

  var toastEl = document.createElement("div");
  toastEl.className = "m-swipe-toast";
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(text) {
    if (!isMobile()) return;
    toastEl.textContent = text;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 1100);
  }

  function slideTitle(i) { return slides[i].getAttribute("data-title") || ("Слайд " + (i + 1)); }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function update() {
    if (!isMobile()) return;
    var cur = current();
    mRailFill.style.width = (total > 1 ? cur / (total - 1) * 100 : 100) + "%";
    mCount.textContent = cur + 1;
    mTitle.textContent = slideTitle(cur);
    mLabel.textContent = slideTitle(cur);
    mKicker.textContent = "Слайд " + (cur + 1) + " из " + total;
    var items = mList.children;
    for (var i = 0; i < items.length; i++) items[i].classList.toggle("now", i === cur);
  }
  window.__mobileUpdate = update;

  function buildMenu() {
    if (mList.children.length) return;
    for (var i = 0; i < total; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "m-item";
      b.setAttribute("data-i", i);
      b.innerHTML = '<span class="n">' + pad(i + 1) + '</span><span class="t">' + slideTitle(i) + "</span>";
      mList.appendChild(b);
    }
    mList.addEventListener("click", function (e) {
      var item = e.target.closest(".m-item");
      if (!item) return;
      closeMenu();
      window.__deckGo(parseInt(item.getAttribute("data-i"), 10));
    });
  }

  function openMenu() {
    buildMenu();
    update();
    mSheet.classList.add("open");
    mSheet.setAttribute("aria-hidden", "false");
    document.getElementById("btnMenu").setAttribute("aria-expanded", "true");
    var now = mList.querySelector(".m-item.now");
    if (now) setTimeout(function () {
      mList.scrollTop = Math.max(0, now.offsetTop - mList.clientHeight / 2 + now.offsetHeight / 2);
    }, 60);
  }
  function closeMenu() {
    mSheet.classList.remove("open");
    mSheet.setAttribute("aria-hidden", "true");
    document.getElementById("btnMenu").setAttribute("aria-expanded", "false");
  }
  function isMenuOpen() { return mSheet.classList.contains("open"); }

  document.getElementById("btnMenu").addEventListener("click", function () {
    if (isMenuOpen()) closeMenu(); else openMenu();
  });
  document.getElementById("btnMHelp").addEventListener("click", function () {
    if (isMenuOpen()) closeMenu(); else openMenu();
  });
  document.getElementById("mSheetBack").addEventListener("click", closeMenu);
  document.getElementById("btnMExpand").addEventListener("click", function () { setPeek(false); enterLandscape(); });
  document.getElementById("mPrev").addEventListener("click", function () { window.__deckPrev(); });
  document.getElementById("mNext").addEventListener("click", function () { window.__deckNext(); });
  document.querySelector(".m-rail").addEventListener("click", openMenu);

  /* рассмотреть фото */
  function captionFor(fig) {
    var img = fig.querySelector("img");
    var cap = fig.querySelector("figcaption") || (fig.parentNode && fig.parentNode.querySelector(".caption"));
    var tag = fig.querySelector(".fig-tag");
    return (cap && cap.textContent.trim()) || (tag && tag.textContent.trim()) || (img ? (img.getAttribute("alt") || "") : "");
  }
  function openPhoto(fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    mLbImg.src = img.currentSrc || img.src;
    mLbImg.alt = img.getAttribute("alt") || "";
    mLbCap.textContent = captionFor(fig);
    mLightbox.classList.add("open");
    mLightbox.setAttribute("aria-hidden", "false");
  }
  function closePhoto() {
    mLightbox.classList.remove("open");
    mLightbox.setAttribute("aria-hidden", "true");
    var mTop = document.getElementById("mTop");
    if (mTop) mTop.style.opacity = "";
  }
  function isPhotoOpen() { return mLightbox.classList.contains("open"); }

  document.addEventListener("click", function (e) {
    if (!isMobile() || isMenuOpen() || isPhotoOpen()) return;
    var fig = e.target.closest && e.target.closest(".figure");
    if (!fig) return;
    e.preventDefault();
    e.stopPropagation();
    openPhoto(fig);
    var mTop = document.getElementById("mTop");
    if (mTop) mTop.style.opacity = "0";
    setTimeout(function () { if (!isPhotoOpen() && mTop) mTop.style.opacity = ""; }, 1200);
  }, true);
  document.getElementById("mLbClose").addEventListener("click", closePhoto);
  mLightbox.addEventListener("click", function (e) { if (e.target === mLightbox) closePhoto(); });

  /* --- панели прячутся по двойному тапу --- */
  function setPeek(on) {
    if (!isMobile()) on = false;
    if (on === peeked) return;
    peeked = on;
    if (on) closeMenu();
    document.body.classList.toggle("peek", on);
    fitMobile();
  }
  window.__mobilePeek = setPeek;

  window.__mobileCloseMenus = function () { closeMenu(); closePhoto(); };

  function interactive(el) {
    return !!(el.closest && el.closest(".m-top, .m-bottom, .m-sheet, .m-lightbox, .uk-ans, a, button"));
  }

  var tx = 0, ty = 0, tt = 0, tracked = false, lastTap = 0;
  window.addEventListener("touchstart", function (e) {
    if (!isMobile() || e.touches.length !== 1) { tracked = false; return; }
    tracked = !interactive(e.target);
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    tt = Date.now();
  }, { passive: true });

  window.addEventListener("touchend", function (e) {
    if (!isMobile() || !tracked) return;
    tracked = false;
    if (isMenuOpen() || isPhotoOpen()) return;
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    var dt = Date.now() - tt;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3 && dt < 900) {
      lastTap = 0;
      if (dx < 0) { window.__deckNext(); if (current() !== total - 1) toast("Дальше"); }
      else { window.__deckPrev(); if (current() !== total - 1) toast("Назад"); }
      return;
    }
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      var now = Date.now();
      if (now - lastTap < 320) {
        lastTap = 0;
        setPeek(!peeked);
        toast(peeked ? "Слайд на весь экран" : "Показать кнопки");
      } else {
        lastTap = now;
      }
    }
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (isPhotoOpen()) { closePhoto(); return; }
    if (isMenuOpen()) { closeMenu(); return; }
    setPeek(false);
  });

  function setVH() {
    document.documentElement.style.setProperty("--vh", viewportSize().h + "px");
  }
  function refresh() {
    setVH();
    if (isMobile()) {
      fitMobile();
      update();
    } else {
      setPeek(false);
    }
  }
  window.__mobileRefresh = refresh;

  window.addEventListener("resize", refresh);
  window.addEventListener("orientationchange", function () { setTimeout(refresh, 260); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", refresh);
    window.visualViewport.addEventListener("scroll", refresh);
  }
  if (mqMobile.addEventListener) mqMobile.addEventListener("change", refresh);
  else mqMobile.addListener(refresh);

  setVH();
})();