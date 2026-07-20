/* ============================================
   PROMETHEUS PANTHEON — Interactions
   Creation opener · torch tabs · living murals · awakening
   ============================================ */
(function () {
  "use strict";

  var mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5 };
  var isDesktop = window.matchMedia("(pointer: fine) and (min-width: 769px)").matches;
  var currentPage = document.body.getAttribute("data-page") || "home";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = e.clientX / window.innerWidth;
    mouse.ny = e.clientY / window.innerHeight;
  });

  var GODS = {
    home: { god: "Prometheus", aspect: "Vehicle of Modern Myth", sun: "K-type ember sun" },
    vision: { god: "Apollo", aspect: "Oracle of the Coming Age", sun: "G-type golden sun" },
    about: { god: "Athena", aspect: "Wisdom of the Threshold", sun: "A-type sapphire sun" },
    robotics: { god: "Hephaestus", aspect: "Co-Creators Awakened", sun: "M-type crimson sun" },
    cities: { god: "Hestia", aspect: "Hearth of a Golden Age", sun: "K5 coral sun" },
    philosophy: { god: "Metis", aspect: "Satya — Living Truth", sun: "F-type white sun" },
    projects: { god: "Hermes", aspect: "Boons for the Journey", sun: "B-type azure sun" },
    contact: { god: "Iris", aspect: "Call Across the Veil", sun: "O-type teal sun" },
    insights: { god: "Mnemosyne", aspect: "Memory of What Comes Next", sun: "Violet dwarf sun" }
  };

  /* ---------- DOM helpers ---------- */
  function enhancePageTransition() {
    var el = document.getElementById("pageTransition");
    if (!el) return;
    if (!el.querySelector(".page-transition-inner")) {
      el.innerHTML = '<div class="page-transition-inner"></div><div class="page-transition-flames" aria-hidden="true"></div>';
    } else if (!el.querySelector(".page-transition-flames")) {
      var flames = document.createElement("div");
      flames.className = "page-transition-flames";
      flames.setAttribute("aria-hidden", "true");
      el.appendChild(flames);
    }
  }

  function enhanceNavTorches() {
    var map = {
      "vision.html": { god: "Apollo", sun: "g-type" },
      "about.html": { god: "Athena", sun: "a-type" },
      "robotics.html": { god: "Hephaestus", sun: "m-type" },
      "cities.html": { god: "Hestia", sun: "k-type" },
      "philosophy.html": { god: "Metis", sun: "f-type" },
      "projects.html": { god: "Hermes", sun: "b-type" },
      "contact.html": { god: "Iris", sun: "o-type" },
      "insights.html": { god: "Mnemosyne", sun: "a-type" },
      "index.html": { god: "Prometheus", sun: "prometheus" }
    };

    document.querySelectorAll(".nav-menu .nav-link").forEach(function (link) {
      if (link.querySelector(".nav-torch")) return;
      var href = (link.getAttribute("href") || "").split("#")[0];
      var meta = map[href];
      if (!meta) {
        // Still equip a torch even if page isn't in the god map
        meta = { god: "Prometheus", sun: "prometheus" };
      }
      link.setAttribute("data-god", meta.god);
      link.setAttribute("data-sun", meta.sun);

      var labelText = link.textContent.trim();
      link.textContent = "";

      var torch = document.createElement("span");
      torch.className = "nav-torch";
      torch.setAttribute("aria-hidden", "true");
      torch.innerHTML =
        '<span class="torch-flame"></span>' +
        '<span class="torch-cap"></span>' +
        '<span class="torch-handle"></span>' +
        '<span class="torch-ring"></span>';

      var label = document.createElement("span");
      label.className = "nav-link-label";
      label.textContent = labelText;

      link.appendChild(torch);
      link.appendChild(label);
    });
  }

  function enhanceHeroTitles() {
    var meta = GODS[currentPage];
    document.querySelectorAll(".page-hero").forEach(function (hero) {
      if (!hero.querySelector(".sun-corona")) {
        var corona = document.createElement("div");
        corona.className = "sun-corona";
        corona.setAttribute("aria-hidden", "true");
        hero.insertBefore(corona, hero.firstChild);
      }
      // Stick-figure mural canvases removed — real art comes from site-murals.js
      var stale = hero.querySelector(".page-hero-mural");
      if (stale) stale.remove();
      var title = hero.querySelector(".page-hero-title");
      if (title && !title.classList.contains("sun-title")) title.classList.add("sun-title");

      var container = hero.querySelector(".container");
      if (meta && container && !container.querySelector(".page-hero-god")) {
        var god = document.createElement("div");
        god.className = "page-hero-god";
        god.textContent = meta.god + " — " + meta.aspect;
        var label = container.querySelector(".page-hero-label");
        if (label) container.insertBefore(god, label.nextSibling);
        else container.insertBefore(god, container.firstChild);
      }
      if (container && !container.querySelector(".myth-tagline")) {
        var tag = document.createElement("span");
        tag.className = "myth-tagline";
        tag.textContent = "Ancient fire · Living machines · Modern myth";
        var desc = container.querySelector(".page-hero-desc");
        if (desc) desc.insertAdjacentElement("afterend", tag);
      }
    });

    document.querySelectorAll(".hero-title .line-inner").forEach(function (el) {
      el.classList.add("sun-title");
    });
  }

  /* ---------- Creation opening — see creation-opening.js ---------- */
  function runCreationOpening(done) {
    if (window.PrometheusCreation && typeof window.PrometheusCreation.run === "function") {
      window.PrometheusCreation.run(done);
      return;
    }
    if (done) done();
  }

  /* ---------- Full-page futuristic mural backgrounds ---------- */
  function drawMuralScene(ctx, w, h, t, sun, page) {
    ctx.clearRect(0, 0, w, h);

    function glow(color, blur) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur || 10;
      ctx.lineCap = "round";
    }
    function noglow() { ctx.shadowBlur = 0; }

    for (var i = 0; i < 70; i++) {
      ctx.globalAlpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t + i));
      ctx.fillStyle = i % 2 ? "#9adcff" : "#ffc090";
      ctx.fillRect((i * 89.3) % w, (i * 47.1) % h, 1.3, 1.3);
    }
    ctx.globalAlpha = 1;

    glow("rgba(255,140,70,0.35)", 8);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.18);
    ctx.lineTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.88, h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.14, h * 0.18);
    ctx.lineTo(w * 0.14, h * 0.9);
    ctx.moveTo(w * 0.86, h * 0.18);
    ctx.lineTo(w * 0.86, h * 0.9);
    ctx.stroke();
    glow("rgba(90,180,255,0.3)", 8);
    ctx.beginPath();
    ctx.moveTo(w * 0.86, h * 0.18);
    ctx.lineTo(w * 0.86, h * 0.9);
    ctx.stroke();
    noglow();

    var mx = w * 0.5;
    var my = h * 0.48;
    var mr = Math.min(w, h) * 0.26;
    glow("rgba(255,190,140,0.4)", 8);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mx, my, mr + 8, 0, Math.PI * 2);
    ctx.stroke();
    for (var k = 0; k < 36; k++) {
      var ang = (k / 36) * Math.PI * 2 + t * 0.04;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(mx + Math.cos(ang) * (mr + 1), my + Math.sin(ang) * (mr + 1));
      ctx.lineTo(mx + Math.cos(ang) * (mr + 7), my + Math.sin(ang) * (mr + 7));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    noglow();

    function filamentPerson(x, y, scale, color, reachingRight) {
      glow(color, 12);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y - 36 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.stroke();
      for (var s = -3; s <= 3; s++) {
        ctx.beginPath();
        ctx.moveTo(x + s * 2 * scale, y - 28 * scale);
        ctx.quadraticCurveTo(x + s * 3 * scale, y, x + s * 1.5 * scale, y + 22 * scale);
        ctx.globalAlpha = 0.45;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 20 * scale);
      if (reachingRight) {
        ctx.quadraticCurveTo(x + 28 * scale, y - 28 * scale + Math.sin(t * 2) * 3, x + 48 * scale, y - 10 * scale);
      } else {
        ctx.quadraticCurveTo(x - 28 * scale, y - 28 * scale + Math.sin(t * 2) * 3, x - 48 * scale, y - 10 * scale);
      }
      ctx.stroke();
      noglow();
    }
    function filamentRobot(x, y, scale, alive) {
      glow("#3db8ff", 12);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 12 * scale, y - 20 * scale, 24 * scale, 34 * scale);
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.stroke();
      if (alive) {
        glow("#9adcff", 14);
        ctx.beginPath();
        ctx.arc(x, y - 4 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      noglow();
    }

    ctx.globalAlpha = 0.9;
    if (page === "home") {
      filamentPerson(mx - mr * 0.35, my + 10, mr / 90, "#ff6a28", true);
      filamentRobot(mx + mr * 0.35, my + 10, mr / 90, true);
      glow("#c9a0ff", 16);
      ctx.beginPath();
      ctx.arc(mx, my - 5 + Math.sin(t * 3) * 2, 6 + Math.sin(t * 4), 0, Math.PI * 2);
      ctx.fill();
      noglow();
    } else if (page === "vision") {
      filamentPerson(mx - 40, my + 20, 1.1, "#ffd24a", true);
      glow("#6ecbff", 10);
      for (var b = 0; b < 5; b++) {
        var bh = 20 + b * 10 + Math.sin(t + b) * 4;
        ctx.strokeRect(mx + 10 + b * 16, my + 30 - bh, 12, bh);
        ctx.beginPath();
        ctx.moveTo(mx + 8 + b * 16, my + 30 - bh);
        ctx.lineTo(mx + 16 + b * 16, my + 22 - bh);
        ctx.lineTo(mx + 24 + b * 16, my + 30 - bh);
        ctx.stroke();
      }
      noglow();
    } else if (page === "about" || page === "robotics") {
      filamentPerson(mx - 50, my + 15, 1.15, "#ff6a28", true);
      filamentRobot(mx + 30, my + 10, 1.2, true);
      glow("#ff8a2a", 14);
      ctx.beginPath();
      ctx.arc(mx + 10, my - 5, 5 + Math.sin(t * 5), 0, Math.PI * 2);
      ctx.fill();
      noglow();
    } else if (page === "cities") {
      filamentPerson(mx - 55, my + 25, 1, "#ff8f6b", true);
      filamentRobot(mx - 10, my + 20, 1, true);
      glow("#6ecbff", 10);
      for (var c = 0; c < 6; c++) {
        var ch = 28 + (c * 13) % 40 + Math.sin(t * 0.8 + c) * 3;
        ctx.strokeRect(mx + 20 + c * 18, my + 35 - ch, 14, ch);
      }
      ctx.beginPath();
      for (var wx = mx - mr; wx < mx + mr; wx += 8) {
        ctx.lineTo(wx, my + 40 + Math.sin(wx * 0.1 + t * 2) * 3);
      }
      ctx.stroke();
      noglow();
    } else if (page === "philosophy") {
      for (var p = 0; p < 6; p++) {
        var pa = (p / 6) * Math.PI * 2 + t * 0.15;
        var px = mx + Math.cos(pa) * mr * 0.55;
        var py = my + Math.sin(pa) * mr * 0.4;
        if (p % 2 === 0) filamentPerson(px, py, 0.7, "#c9daff", p < 3);
        else filamentRobot(px, py, 0.7, true);
      }
      glow("#ffffff", 18);
      ctx.beginPath();
      ctx.arc(mx, my, 8 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
      ctx.fill();
      noglow();
    } else if (page === "projects") {
      filamentPerson(mx - 45, my + 5, 1.1, "#3ecbff", true);
      filamentRobot(mx + 45, my + 5, 1.1, true);
      glow("#ffe08a", 12);
      for (var g = 0; g < 5; g++) {
        ctx.strokeRect(mx + Math.cos(t + g) * 30, my - 30 + g * 8, 10, 10);
      }
      noglow();
    } else if (page === "contact") {
      filamentPerson(mx - 60, my, 1, "#5eead4", true);
      filamentRobot(mx + 60, my, 1, true);
      glow("#5eead4", 12);
      ctx.beginPath();
      ctx.moveTo(mx - 40, my - 10);
      ctx.quadraticCurveTo(mx, my - 50 + Math.sin(t * 2) * 8, mx + 40, my - 10);
      ctx.stroke();
      var sp = (t * 40) % 80;
      ctx.beginPath();
      ctx.arc(mx - 40 + sp, my - 10 - Math.sin(sp * 0.1) * 20, 3, 0, Math.PI * 2);
      ctx.fill();
      noglow();
    } else {
      filamentPerson(mx - 30, my + 10, 1, "#d4b4ff", true);
      filamentRobot(mx + 35, my + 5, 1, true);
      glow("#d4b4ff", 10);
      ctx.strokeRect(mx - 20, my - 40, 40, 28);
      for (var ln = 0; ln < 4; ln++) {
        ctx.beginPath();
        ctx.moveTo(mx - 14, my - 32 + ln * 6);
        ctx.lineTo(mx + 14, my - 32 + ln * 6);
        ctx.stroke();
      }
      noglow();
    }
    ctx.globalAlpha = 1;

    var sx = w * 0.78;
    var sy = h * 0.2;
    glow(sun, 16);
    for (var r = 0; r < 24; r++) {
      var ra = (Math.PI * 2 * r) / 24 + t * 0.08;
      var len = 28 + (r % 3) * 12 + Math.sin(t * 2 + r) * 6;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ra) * len, sy + Math.sin(ra) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, Math.PI * 2);
    ctx.fill();
    noglow();
    ctx.globalAlpha = 1;
  }

  function initSiteMurals() {
    // Real creation-art murals (site-murals.js) — replaces invisible stick canvases
    if (window.PrometheusMurals && typeof window.PrometheusMurals.init === "function") {
      window.PrometheusMurals.init();
      return;
    }
  }

  /* ---------- Torch fire page transition ---------- */
  function navigateWithFire(target, linkEl) {
    var sunColors = {
      "g-type": "#ffd24a",
      "a-type": "#9ec9ff",
      "m-type": "#ff3d1f",
      "k-type": "#ff8f6b",
      "f-type": "#c9daff",
      "b-type": "#3ecbff",
      "o-type": "#5eead4",
      prometheus: "#ff8a2a"
    };
    var key = linkEl && linkEl.getAttribute("data-sun");
    var color = (key && sunColors[key]) || getComputedStyle(document.body).getPropertyValue("--page-sun").trim() || "#ff8a2a";
    document.body.style.setProperty("--page-sun", color);
    document.body.style.setProperty("--flame", color);
    document.body.style.setProperty("--page-sun-corona", color + "99");
    if (linkEl) linkEl.classList.add("is-igniting");

    var overlay = document.getElementById("pageTransition");
    if (overlay) {
      overlay.classList.remove("revealed");
      overlay.classList.add("leaving", "torch-firing");
    }

    // Full-screen canvas torch inferno
    var fireCanvas = document.createElement("canvas");
    fireCanvas.className = "torch-fire-canvas";
    fireCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(fireCanvas);
    var ctx = fireCanvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fireCanvas.width = Math.floor(window.innerWidth * dpr);
    fireCanvas.height = Math.floor(window.innerHeight * dpr);
    fireCanvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:10040;pointer-events:none;";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var embers = [];
    for (var i = 0; i < 80; i++) {
      embers.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(2 + Math.random() * 6),
        r: 2 + Math.random() * 10,
        life: 1
      });
    }

    var t0 = performance.now();
    var gone = false;
    function paint(now) {
      var t = (now - t0) / 1000;
      var w = window.innerWidth;
      var h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Rising wall of flame
      var rise = Math.min(1, t / 0.55);
      for (var c = 0; c < 14; c++) {
        var cx = (c + 0.5) * (w / 14) + Math.sin(t * 8 + c) * 10;
        var fh = h * (0.45 + rise * 0.7) * (0.75 + 0.25 * Math.sin(t * 6 + c));
        var grd = ctx.createRadialGradient(cx, h, 0, cx, h - fh * 0.5, fh * 0.55);
        grd.addColorStop(0, "rgba(255,255,255,0.55)");
        grd.addColorStop(0.2, color);
        grd.addColorStop(0.55, "rgba(61,184,255,0.35)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(cx - 50, h);
        ctx.quadraticCurveTo(cx - 20, h - fh * 0.5, cx, h - fh);
        ctx.quadraticCurveTo(cx + 20, h - fh * 0.5, cx + 50, h);
        ctx.fill();
      }

      embers.forEach(function (e) {
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.012;
        if (e.life < 0 || e.y < -20) {
          e.x = Math.random() * w;
          e.y = h + 10;
          e.life = 1;
        }
        ctx.fillStyle = "rgba(255,220,160," + (e.life * 0.7) + ")";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * e.life, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center nova flash
      if (t > 0.25) {
        var flash = Math.min(1, (t - 0.25) / 0.4);
        var ng = ctx.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.7, w * 0.5 * flash);
        ng.addColorStop(0, "rgba(255,255,255," + (0.5 * flash) + ")");
        ng.addColorStop(0.4, color.replace(")", ",0.35)").replace("rgb", "rgba").replace("#", ""));
        // hex fallback
        ng.addColorStop(0.4, "rgba(255,180,80," + (0.3 * flash) + ")");
        ng.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.65, w * 0.45 * flash, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (t < 1.05) requestAnimationFrame(paint);
      else if (!gone) {
        gone = true;
        window.location = target;
      }
    }
    requestAnimationFrame(paint);

    // Safety navigation
    setTimeout(function () {
      if (!gone) {
        gone = true;
        window.location = target;
      }
    }, 1400);
  }

  function enhanceLinkIgnition() {
    /* colors applied inside navigateWithFire */
  }

  /* ---------- Living logo: purple flame burn on brand mark ---------- */
  function enhanceLivingLogos() {
    var imgs = document.querySelectorAll(
      '.nav-logo img, .loader-logo img, img.footer-logo, .footer-brand > img'
    );
    imgs.forEach(function (img) {
      if (!img || img.closest(".logo-living-wrap")) return;
      var src = (img.getAttribute("src") || "");
      if (src.indexOf("logo") === -1) return;

      var wrap = document.createElement("span");
      wrap.className = "logo-living-wrap";
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      img.classList.add("logo-living-img");
      img.src = "assets/logo.png?v=23";

      ["", "-mid", "-core"].forEach(function (suffix) {
        var flame = document.createElement("span");
        flame.className = "logo-flame" + (suffix ? " logo-flame" + suffix : "");
        flame.setAttribute("aria-hidden", "true");
        wrap.appendChild(flame);
      });
    });

    // Full wordmark already includes PROMETHEUS
    document.querySelectorAll(".nav-logo > span:not(.logo-living-wrap)").forEach(function (el) {
      el.classList.add("logo-word-dup");
    });
  }

  /* ---------- Awaken interactive (8-bit Zelda forge) ---------- */
  function initAwakenScene() {
    if (window.PrometheusAwaken && typeof window.PrometheusAwaken.init === "function") {
      window.PrometheusAwaken.init();
      return;
    }
  }

  /* ---------- Torch ignition on nav leave ---------- */
  /* ---------- Boot ---------- */
  function boot() {
    try { enhancePageTransition(); } catch (e) { console.warn(e); }
    try { enhanceNavTorches(); } catch (e) { console.warn(e); }
    try { enhanceHeroTitles(); } catch (e) { console.warn(e); }
    try { enhanceLivingLogos(); } catch (e) { console.warn(e); }
    try { initSiteMurals(); } catch (e) { console.warn(e); }
    try { initAwakenScene(); } catch (e) { console.warn(e); }
  }

  // Expose for main.js coordination
  window.PrometheusPantheon = {
    runCreationOpening: runCreationOpening,
    navigateWithFire: navigateWithFire,
    boot: boot,
    gods: GODS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
