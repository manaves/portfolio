/* María Navarro — portfolio. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------------------------------------------------------------- theme */
  var STORE = "mn-theme";
  function stored() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(STORE, v); } catch (e) {} }

  /* light is the default: the stored choice wins, otherwise stay light */
  var saved = stored();
  root.setAttribute("data-theme", saved === "dark" ? "dark" : "light");

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      store(next);
      var label = "Switch to " + (next === "light" ? "dark" : "light") + " theme";
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    });
  }

  /* ------------------------------------------------------------------ nav */
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("primary-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      menuBtn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.setAttribute("data-open", "false"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* --------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    }
  }

  /* ---------------------------------------------------------- copy email */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", old);
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = value; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ----------------------------------------------------------------- year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------ carousel */
  var track = document.getElementById("projects-track");
  if (track) {
    var prevBtn = document.getElementById("carousel-prev");
    var nextBtn = document.getElementById("carousel-next");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var step = function () {
      var card = track.querySelector(".card");
      if (!card) { return track.clientWidth * 0.8; }
      var cs = getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap || "16") || 16;
      return card.getBoundingClientRect().width + gap;
    };
    var go = function (dir) {
      track.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    };
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (prevBtn) { prevBtn.setAttribute("aria-disabled", track.scrollLeft <= 1 ? "true" : "false"); }
      if (nextBtn) { nextBtn.setAttribute("aria-disabled", track.scrollLeft >= max ? "true" : "false"); }
    };

    if (prevBtn) { prevBtn.addEventListener("click", function () { go(-1); }); }
    if (nextBtn) { nextBtn.addEventListener("click", function () { go(1); }); }
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* -------------------------------------------------------------- gallery */
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var slides = gallery.querySelectorAll(".gallery-slide");
    if (slides.length < 2) { return; }
    var current = 0;
    var prev = gallery.querySelector(".gallery-prev");
    var next = gallery.querySelector(".gallery-next");
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle("is-active", i === current); });
    }
    if (prev) { prev.addEventListener("click", function () { show(current - 1); }); }
    if (next) { next.addEventListener("click", function () { show(current + 1); }); }
    gallery.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });
    show(0);
  });

  /* ------------------------------------------------------------ video cue */
  document.querySelectorAll("video[data-poster-play]").forEach(function (vid) {
    vid.addEventListener("click", function () {
      if (vid.paused) { vid.play(); } else { vid.pause(); }
    });
  });

  /* ------------------------------------------------------ youtube facades */
  document.querySelectorAll("[data-yt]").forEach(function (box) {
    var btn = box.querySelector("button");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-yt") + "?autoplay=1&rel=0";
      frame.title = box.getAttribute("data-yt-title") || "Video";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      box.textContent = "";
      box.appendChild(frame);
    });
  });

  /* ------------------------------------------------------ image lightbox */
  /* Every content image opens enlarged in a dialog of its own. Wrapped in a
     real <button> so the affordance is focusable, not just clickable. */
  function initLightbox() {
    var SELECTOR = ".portrait img, .card-media img, .media-strip img, .gallery-slide img, .stills img, .comp-media img, .job-media img";
    var sources = Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).filter(function (img) {
      /* the YouTube facades are click-to-play: leave their posters alone */
      return !img.closest("[data-yt], a, button");
    });
    if (!sources.length) { return; }

    var box = document.createElement("div");
    box.className = "lightbox";
    box.id = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Enlarged image");
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close the enlarged image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<img alt="">';
    document.body.appendChild(box);

    var big = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox-close");
    var pinned = null;

    function open(img, trigger) {
      big.setAttribute("src", img.currentSrc || img.getAttribute("src"));
      big.setAttribute("alt", img.getAttribute("alt") || "");
      /* pixel art stays pixel art when it is enlarged */
      big.style.imageRendering = getComputedStyle(img).imageRendering === "pixelated" ? "pixelated" : "";
      pinned = trigger;
      box.hidden = false;
      root.classList.add("lightbox-open");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    }

    function close() {
      if (box.hidden) { return; }
      box.hidden = true;
      big.removeAttribute("src");
      root.classList.remove("lightbox-open");
      document.body.classList.remove("lightbox-open");
      if (pinned && pinned.focus) { pinned.focus(); }
      pinned = null;
    }

    sources.forEach(function (img) {
      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "zoom-trigger";
      trigger.setAttribute("aria-label", "Enlarge image: " + (img.getAttribute("alt") || "screenshot"));
      img.parentNode.insertBefore(trigger, img);
      trigger.appendChild(img);
      trigger.addEventListener("click", function () { open(img, trigger); });
    });

    /* any click inside the overlay dismisses it — the whole surface is zoom-out */
    box.addEventListener("click", function () { close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) { return; }
      if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
    });
  }
  initLightbox();

  /* ------------------------------------------------------------ back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    /* nothing to scroll back to (the 404 page, say) means nothing to show */
    function syncToTop() {
      toTop.hidden = document.documentElement.scrollHeight <= window.innerHeight + 120;
    }
    syncToTop();
    window.addEventListener("resize", syncToTop);

    toTop.addEventListener("click", function (e) {
      var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
      /* keyboard activation moves focus back to the top; a mouse click does not need the ring */
      var brand = document.querySelector(".brand");
      if (e.detail === 0 && brand && brand.focus) { brand.focus({ preventScroll: true }); }
    });
  }

})();
