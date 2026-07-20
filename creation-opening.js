/* ============================================
   PROMETHEUS — Framed mural opening
   Gate button → looping murals + Bach → spark title menu
   ============================================ */
(function () {
  "use strict";

  var ASSET_VER = "v22";

  var INTRO = [
    {
      src: "assets/opening/open-01-hologram-sun.png?" + ASSET_VER,
      hold: 10000,
      ken: { from: 1.0, to: 1.0 },
      focus: { x: 0.5, y: 0.5 },
      fit: "contain",
      hologram: true,
      title: { warm: 0.8, glow: 1.15 }
    },
    {
      src: "assets/opening/open-06-robot-child.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.0, to: 1.02 },
      focus: { x: 0.5, y: 0.28 },
      title: { warm: 0.7, glow: 1.1 }
    },
    {
      src: "assets/opening/open-02-city.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.04, to: 1.0 },
      focus: { x: 0.5, y: 0.5 },
      title: { warm: 0.4, glow: 1.1 }
    },
    {
      src: "assets/opening/open-07-elderly-groceries.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.03, to: 1.0 },
      focus: { x: 0.5, y: 0.5 },
      title: { warm: 0.55, glow: 1.1 }
    },
    {
      src: "assets/opening/open-03-care.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.0, to: 1.04 },
      focus: { x: 0.5, y: 0.48 },
      title: { warm: 0.55, glow: 1.1 }
    },
    {
      src: "assets/opening/open-08-firefighter.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.05, to: 1.0 },
      focus: { x: 0.5, y: 0.46 },
      title: { warm: 0.85, glow: 1.15 }
    },
    {
      src: "assets/opening/open-09-caregiver.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.0, to: 1.04 },
      focus: { x: 0.5, y: 0.5 },
      title: { warm: 0.45, glow: 1.1 }
    },
    {
      src: "assets/opening/open-04-journey.png?" + ASSET_VER,
      hold: 10000,
      ken: { from: 1.05, to: 1.0 },
      focus: { x: 0.5, y: 0.45 },
      title: { warm: 0.3, glow: 1.15 }
    },
    {
      src: "assets/opening/open-10-harvest.png?" + ASSET_VER,
      hold: 9500,
      ken: { from: 1.03, to: 1.0 },
      focus: { x: 0.5, y: 0.5 },
      title: { warm: 0.65, glow: 1.1 }
    }
  ];

  var MENU_SCENE = {
    src: "assets/opening/open-05-spark.png?" + ASSET_VER,
    ken: { from: 1.0, to: 1.0 },
    focus: { x: 0.5, y: 0.5 },
    fit: "contain",
    title: { warm: 0.5, glow: 0.85 }
  };

  function runCreationOpening(done) {
    var page = document.body.getAttribute("data-page") || "home";
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var params = new URLSearchParams(window.location.search || "");
    var forceIntro = params.get("intro") === "1";
    var goHomeView = params.get("home") === "1";

    // Home tab → mural page (no opener). Logo (?intro=1) → opener.
    // Cold first visit this session also plays the opener once.
    function cleanQuery() {
      try {
        if (window.history && window.history.replaceState) {
          var clean = window.location.pathname + (window.location.hash || "");
          window.history.replaceState({}, "", clean || "index.html");
        }
      } catch (e) {}
    }

    if (page !== "home" || reduced || goHomeView) {
      if (goHomeView) cleanQuery();
      if (done) done();
      return;
    }
    if (!forceIntro && sessionStorage.getItem("promIntroSeen") === "1") {
      if (done) done();
      return;
    }

    var wrap = document.createElement("div");
    wrap.className = "creation-opening is-gate";
    wrap.id = "creationOpening";
    wrap.innerHTML =
      '<div class="creation-toolbar" id="creationToolbar">' +
      '<button type="button" class="creation-skip-top" id="creationSkipTop" aria-label="Skip to site">Skip</button>' +
      '<div class="creation-toolbar-end">' +
      '<button type="button" class="creation-mute" id="creationMute" aria-pressed="false" aria-label="Mute opening music">Mute</button>' +
      "</div>" +
      "</div>" +
      '<div class="creation-holo-frame" aria-hidden="true">' +
      '<span class="creation-holo-corner tl"></span>' +
      '<span class="creation-holo-corner tr"></span>' +
      '<span class="creation-holo-corner bl"></span>' +
      '<span class="creation-holo-corner br"></span>' +
      '<span class="creation-holo-edge top"></span>' +
      '<span class="creation-holo-edge right"></span>' +
      '<span class="creation-holo-edge bottom"></span>' +
      '<span class="creation-holo-edge left"></span>' +
      "</div>" +
      '<div class="creation-slides" id="creationSlides"></div>' +
      '<div class="creation-title-plate" id="creationTitlePlate" aria-hidden="true">' +
      '<img class="creation-title-img" src="assets/opening/prometheus-title-glass.png?' + ASSET_VER + '" alt="Prometheus" />' +
      "</div>" +
      '<canvas class="creation-canvas" id="creationCanvas"></canvas>' +
      '<div class="creation-gate" id="creationGate">' +
      '<button type="button" class="creation-start-btn" id="creationStart" aria-label="Press the flame to begin">' +
      '<span class="creation-flame" aria-hidden="true">' +
      '<span class="creation-flame-glow"></span>' +
      '<span class="creation-flame-outer"></span>' +
      '<span class="creation-flame-mid"></span>' +
      '<span class="creation-flame-core"></span>' +
      '<span class="creation-flame-ember e1"></span>' +
      '<span class="creation-flame-ember e2"></span>' +
      '<span class="creation-flame-ember e3"></span>' +
      "</span>" +
      "</button>" +
      '<p class="creation-gate-hint">Press the flame</p>' +
      "</div>" +
      '<div class="creation-menu" id="creationMenu" hidden>' +
      '<div class="creation-menu-actions">' +
      '<button type="button" class="creation-menu-btn" id="creationReplay">Replay intro</button>' +
      '<button type="button" class="creation-menu-btn creation-menu-btn--primary" id="creationEnterSite">Enter site</button>' +
      "</div>" +
      '<div class="creation-quote is-visible">' +
      "<blockquote>“Render unto man the things which are man’s and unto the computer the things which are the computer’s.”</blockquote>" +
      "<cite>— Norbert Wiener, <em>God &amp; Golem, Inc.</em></cite>" +
      '<p class="creation-philosophy">Prometheus does not build machines to replace humanity. We build them to expand what humanity can become.</p>' +
      "</div>" +
      "</div>" +
      '<audio id="creationAudio" preload="auto" loop playsinline aria-label="Opening music: Bach Air">' +
      '<source src="assets/audio/bach-air.mp3?' + ASSET_VER + '" type="audio/mpeg" />' +
      "</audio>";
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";

    var slidesEl = document.getElementById("creationSlides");
    var canvas = document.getElementById("creationCanvas");
    var ctx = canvas.getContext("2d");
    var gateEl = document.getElementById("creationGate");
    var menuEl = document.getElementById("creationMenu");
    var audio = document.getElementById("creationAudio");
    var muteBtn = document.getElementById("creationMute");
    var skipTopBtn = document.getElementById("creationSkipTop");
    var startBtn = document.getElementById("creationStart");
    var replayBtn = document.getElementById("creationReplay");
    var enterBtn = document.getElementById("creationEnterSite");
    var titlePlate = document.getElementById("creationTitlePlate");
    var titleImg = titlePlate ? titlePlate.querySelector(".creation-title-img") : null;

    var finished = false;
    var mode = "gate"; // gate | play | menu
    var sceneIndex = 0;
    var sceneStarted = 0;
    var loopCount = 0;
    var LOOPS_BEFORE_MENU = 1;
    var userWantsSound = localStorage.getItem("promOpeningMuted") !== "1";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var titleState = { warm: 0.5, glow: 1.15, opacity: 1 };
    var titleTarget = Object.assign({}, titleState);
    var slideNodes = [];
    var particles = [];
    var focal = { x: 0.5, y: 0.47 };
    var allScenes = INTRO.concat([MENU_SCENE]);

    for (var p = 0; p < 48; p++) {
      particles.push({
        a: Math.random() * Math.PI * 2,
        r: 0.2 + Math.random() * 0.9,
        s: 0.6 + Math.random() * 2,
        sp: 0.4 + Math.random() * 1.5,
        warm: Math.random() > 0.35
      });
    }

    allScenes.forEach(function (scene, i) {
      var slide = document.createElement("div");
      slide.className =
        "creation-slide" +
        (scene.fit === "contain" ? " creation-slide--contain" : "") +
        (i === 0 ? " is-active" : "");

      // Side-fill backdrop: same mural expanded to cover gaps, sharp art stays fully visible
      if (scene.fit === "contain") {
        var fill = document.createElement("img");
        fill.className = "creation-slide-fill";
        fill.alt = "";
        fill.src = scene.src;
        fill.decoding = "async";
        fill.setAttribute("aria-hidden", "true");
        slide.appendChild(fill);
      }

      var img = document.createElement("img");
      img.className = "creation-slide-img";
      img.alt = "";
      img.src = scene.src;
      img.decoding = "async";
      img.onload = function () {
        fitSlide(img, scene);
      };
      slide.appendChild(img);
      slidesEl.appendChild(slide);
      slideNodes.push({ el: slide, img: img, scene: scene });
    });

    function viewportAspect() {
      var vv = window.visualViewport;
      var w = (vv && vv.width) || window.innerWidth;
      var h = (vv && vv.height) || window.innerHeight;
      return { w: w, h: h, ar: w / Math.max(1, h) };
    }

    function fitSlide(img, scene) {
      if (!img || !img.naturalWidth) return;
      var focus = scene.focus || { x: 0.5, y: 0.5 };
      focal.x = focus.x;
      focal.y = focus.y;

      if (scene.fit === "contain") {
        img.style.objectFit = "contain";
        img.style.objectPosition = "50% 50%";
        img.style.transformOrigin = "50% 50%";
        img.style.transform = "scale(1)";
        img.dataset.coverBoost = "1";
        return;
      }

      // Fill the framed display — cover the frame edge-to-edge
      img.style.objectFit = "cover";
      var px = (focus.x * 100).toFixed(2) + "%";
      var py = (focus.y * 100).toFixed(2) + "%";
      img.style.objectPosition = px + " " + py;
      img.style.transformOrigin = px + " " + py;
      // Mild fill only — avoid hard crop from aggressive zoom
      img.dataset.coverBoost = "1";
    }

    function fitAllSlides() {
      slideNodes.forEach(function (s) {
        fitSlide(s.img, s.scene);
      });
    }

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", function () {
      resize();
      fitAllSlides();
    });

    function showSlide(i) {
      slideNodes.forEach(function (s, idx) {
        s.el.classList.toggle("is-active", idx === i);
        s.el.classList.toggle("is-prev", idx === i - 1);
      });
      fitSlide(slideNodes[i].img, slideNodes[i].scene);
    }

    function activateIntro(i) {
      sceneIndex = i;
      sceneStarted = performance.now();
      showSlide(i);
      titleTarget = Object.assign({}, INTRO[i].title || titleTarget);
    }

    function enterMenu() {
      mode = "menu";
      wrap.classList.remove("is-gate", "is-play");
      wrap.classList.add("is-menu");
      if (gateEl) gateEl.hidden = true;
      if (menuEl) {
        menuEl.hidden = false;
        menuEl.classList.add("is-visible");
      }
      showSlide(INTRO.length); // spark mural
      sceneStarted = performance.now();
      titleTarget = Object.assign({}, MENU_SCENE.title);
      titleTarget.glow = 1.05;
    }

    function startPlay() {
      mode = "play";
      loopCount = 0;
      wrap.classList.remove("is-gate", "is-menu");
      wrap.classList.add("is-play");
      if (gateEl) gateEl.hidden = true;
      if (menuEl) {
        menuEl.hidden = true;
        menuEl.classList.remove("is-visible");
      }
      activateIntro(0);
      startAudio(true);
    }

    function replayIntro() {
      startPlay();
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function updateTitleState() {
      titleState.warm = lerp(titleState.warm, titleTarget.warm, 0.04);
      titleState.glow = lerp(titleState.glow, titleTarget.glow, 0.04);
      titleState.opacity = lerp(titleState.opacity, titleTarget.opacity != null ? titleTarget.opacity : 1, 0.05);
    }

    function kenBurns(now) {
      var idx = mode === "menu" ? INTRO.length : sceneIndex;
      var s = slideNodes[idx];
      if (!s) return;
      var scene = s.scene;
      if (scene.fit === "contain") {
        s.img.style.transform = "scale(1)";
        return;
      }
      var hold = scene.hold || 10000;
      var t = Math.min(1, (now - sceneStarted) / hold);
      var ease = t * t * (3 - 2 * t);
      var from = (scene.ken && scene.ken.from) || 1;
      var to = (scene.ken && scene.ken.to) || 1;
      var scale = from + (to - from) * ease;
      s.img.style.transform = "scale(" + scale.toFixed(4) + ")";
    }

    function focalScreen() {
      var idx = mode === "menu" ? INTRO.length : sceneIndex;
      var s = slideNodes[idx];
      var vp = viewportAspect();
      if (!s || !s.img.naturalWidth) return { x: vp.w * 0.5, y: vp.h * 0.47 };
      var iw = s.img.naturalWidth;
      var ih = s.img.naturalHeight;
      var imageAR = iw / ih;
      var vpAR = vp.w / vp.h;
      var fx = focal.x;
      var fy = focal.y;
      var dispW, dispH, offX, offY;
      if (imageAR > vpAR) {
        dispH = vp.h;
        dispW = vp.h * imageAR;
        offX = (vp.w - dispW) * fx;
        offY = 0;
      } else {
        dispW = vp.w;
        dispH = vp.w / imageAR;
        offX = 0;
        offY = (vp.h - dispH) * fy;
      }
      return { x: offX + dispW * fx, y: offY + dispH * fy };
    }

    /** Stained-glass PROMETHEUS title plate (matches spark mural lettering) */
    function updateTitlePlate(time) {
      if (!titlePlate) return;
      // Final spark mural already includes PROMETHEUS — no overlay title
      if (mode === "gate" || mode === "menu") {
        titlePlate.classList.remove("is-visible");
        return;
      }
      titlePlate.classList.add("is-visible");
      var warm = titleState.warm;
      var glow = titleState.glow;
      var shimmer = 0.94 + Math.sin(time * 2.1) * 0.04;
      var scale = 0.92 * (0.98 + glow * 0.04);
      var y = 50;
      // Subtle fire↔ice color grade as scenes change
      var hue = (0.5 - warm) * 14;
      var sat = 1.7 + glow * 0.28;
      titlePlate.style.top = y + "%";
      titlePlate.style.transform =
        "translate(-50%, -50%) scale(" + scale.toFixed(3) + ")";
      titlePlate.style.opacity = String(Math.min(1, Math.max(0.88, titleState.opacity * shimmer)));
      if (titleImg) {
        // Screen-blend glass letters: bright + readable on every mural
        titleImg.style.filter =
          "hue-rotate(" + hue.toFixed(1) + "deg) saturate(" + sat.toFixed(2) + ") contrast(1.28) brightness(" +
          (1.28 + glow * 0.16).toFixed(2) +
          ") drop-shadow(0 0 " + (14 * glow).toFixed(0) +
          "px rgba(255,220,140,0.9)) drop-shadow(0 0 " + (26 * glow).toFixed(0) +
          "px rgba(255,160,60,0.55)) drop-shadow(0 0 " + (30 * glow).toFixed(0) +
          "px rgba(90,170,255,0.5))";
      }

      // Soft glass scan shimmer over the title
      var vp = viewportAspect();
      var tw = Math.min(vp.w * 0.72, 820);
      var th = tw * 0.28;
      var cx = vp.w * 0.5;
      var cy = vp.h * (y / 100);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(255,255,255," + (0.04 + Math.sin(time * 4) * 0.025) + ")";
      var scanY = cy - th * 0.35 + ((time * 28) % (th * 0.7));
      ctx.fillRect(cx - tw * 0.45, scanY, tw * 0.9, 2);
      ctx.restore();
    }

    function drawHologram(time, power) {
      if (power <= 0.01 || mode !== "play") return;
      var scene = INTRO[sceneIndex];
      if (!scene || !scene.hologram) return;
      var w = window.innerWidth;
      var h = window.innerHeight;
      var sunX = w * 0.5;
      var sunY = h * 0.2;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var bloom = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, h * 0.22);
      bloom.addColorStop(0, "rgba(255,255,200," + (0.4 * power) + ")");
      bloom.addColorStop(0.4, "rgba(255,160,50," + (0.2 * power) + ")");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(sunX, sunY, h * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /** Amber flame at divine spark — not purple */
    function drawFlame(time) {
      if (mode !== "menu") return;
      var fp = focalScreen();
      var cx = fp.x;
      var cy = fp.y;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var pulse = 0.85 + Math.sin(time * 3.2) * 0.15;
      var R = Math.min(viewportAspect().w, viewportAspect().h) * 0.065 * pulse;

      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.2);
      core.addColorStop(0, "rgba(255,255,255,0.85)");
      core.addColorStop(0.2, "rgba(255,220,140,0.6)");
      core.addColorStop(0.5, "rgba(255,120,40,0.32)");
      core.addColorStop(0.8, "rgba(100,180,255,0.12)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2);
      ctx.fill();

      for (var i = 0; i < 10; i++) {
        var ang = -Math.PI / 2 + Math.sin(time * 4 + i) * 0.35;
        var len = R * (0.95 + Math.sin(time * 5 + i * 0.7) * 0.35);
        var bx = cx + Math.cos(ang) * 4;
        var by = cy + Math.sin(ang) * 4;
        var tipX = cx + Math.cos(ang - 0.2) * len * 0.25 + Math.sin(time * 6 + i) * 6;
        var tipY = cy - len;
        var g = ctx.createLinearGradient(bx, by, tipX, tipY);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(0.4, i % 2 ? "rgba(255,160,50,0.5)" : "rgba(255,200,100,0.4)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 3 + (i % 3);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + Math.sin(time * 7 + i) * 12, by - len * 0.5, tipX, tipY);
        ctx.stroke();
      }

      particles.forEach(function (pt) {
        var rr = R * (0.35 + pt.r);
        var x = cx + Math.cos(pt.a + time * pt.sp) * rr;
        var y = cy + Math.sin(pt.a + time * pt.sp * 0.8) * rr * 0.5 - ((time * 30 * pt.s) % (R * 2.4));
        ctx.fillStyle = pt.warm ? "rgba(255,170,80,0.55)" : "rgba(140,200,255,0.4)";
        ctx.beginPath();
        ctx.arc(x, y, pt.s * 0.85, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function updateMuteButton() {
      if (!muteBtn) return;
      var isMuted = !userWantsSound;
      muteBtn.setAttribute("aria-pressed", isMuted ? "true" : "false");
      muteBtn.setAttribute("aria-label", isMuted ? "Unmute opening music" : "Mute opening music");
      muteBtn.textContent = isMuted ? "Unmute" : "Mute";
    }

    function startAudio(forceUnmute) {
      if (!audio || finished) return Promise.resolve(false);
      if (forceUnmute) userWantsSound = true;
      audio.loop = true;
      audio.volume = 0.55;
      audio.muted = !userWantsSound;
      updateMuteButton();
      var playPromise = audio.play();
      if (!playPromise || !playPromise.then) return Promise.resolve(!audio.paused);
      return playPromise.then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    function toggleMute(e) {
      if (e) e.stopPropagation();
      userWantsSound = !userWantsSound;
      localStorage.setItem("promOpeningMuted", userWantsSound ? "0" : "1");
      if (audio) audio.muted = !userWantsSound;
      updateMuteButton();
      if (userWantsSound && mode !== "gate") startAudio(true);
    }

    function finish() {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem("promIntroSeen", "1");
      } catch (e) {}
      cleanQuery();
      if (audio) {
        try {
          audio.pause();
        } catch (e) {}
      }
      wrap.classList.add("is-done");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (done) done();
      }, 550);
    }

    function onKey(e) {
      if (e.key === "m" || e.key === "M") {
        toggleMute();
        return;
      }
      if (e.key === "Escape") {
        finish();
        return;
      }
      if (mode === "gate" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        startPlay();
        return;
      }
      if (mode === "menu" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        finish();
      }
    }

    document.addEventListener("keydown", onKey);
    if (skipTopBtn) skipTopBtn.addEventListener("click", finish);
    if (muteBtn) muteBtn.addEventListener("click", toggleMute);
    if (startBtn) startBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      startPlay();
    });
    if (replayBtn) replayBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      replayIntro();
    });
    if (enterBtn) enterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      finish();
    });

    updateMuteButton();
    showSlide(0);
    if (audio) audio.load();

    (function loop(now) {
      if (finished) return;
      kenBurns(now);
      updateTitleState();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (mode === "play") {
        var scene = INTRO[sceneIndex];
        var elapsed = now - sceneStarted;
        if (scene.hologram) drawHologram(now / 1000, Math.min(1, elapsed / 1600));
        updateTitlePlate(now / 1000);

        if (elapsed >= scene.hold) {
          if (sceneIndex < INTRO.length - 1) {
            activateIntro(sceneIndex + 1);
          } else {
            loopCount++;
            if (loopCount >= LOOPS_BEFORE_MENU) {
              enterMenu();
            } else {
              activateIntro(0);
            }
          }
        }
      } else if (mode === "menu") {
        drawFlame(now / 1000);
        updateTitlePlate(now / 1000);
      } else {
        // gate: gentle idle pulse on first mural only
        kenBurns(now);
      }

      requestAnimationFrame(loop);
    })(performance.now());
  }

  window.PrometheusCreation = { run: runCreationOpening };
})();
