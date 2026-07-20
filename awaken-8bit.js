/* ============================================
   PROMETHEUS — 8-bit Zelda-style Awakening
   Gauntlet + fire → stove → zoom out → robot dance
   ============================================ */
(function () {
  "use strict";

  var DIALOGUE = {
    intro: "A cold forge waits in the dark...",
    hint: "Take the Flaming Gauntlet.\nGuide it into the stove.",
    near: "The mouth of the forge grows hungry...",
    insert: "You offer the sacred fire!",
    ignite: "...The hearth answers.",
    zoom: "Wait— this is no ordinary stove...",
    awake: "A co-creator awakens!",
    dance: "It does the Robot Dance!\nThe ally has joined your quest."
  };

  var booted = false;

  function initAwaken8Bit() {
    var host = document.getElementById("prometheusScene");
    if (!host || booted) return;
    booted = true;

    host.className = "zelda-scene";
    host.removeAttribute("data-animate");
    host.style.opacity = "1";
    host.style.visibility = "visible";
    host.setAttribute("role", "application");
    host.setAttribute(
      "aria-label",
      "Interactive 8-bit scene: drag the flaming gauntlet into the stove to awaken the robot"
    );

    // Ensure parent can't stay GSAP-hidden
    var wrap = host.closest(".about-animation");
    if (wrap) {
      wrap.removeAttribute("data-animate");
      wrap.style.opacity = "1";
      wrap.style.visibility = "visible";
      wrap.style.transform = "none";
    }

    host.innerHTML =
      '<div class="zelda-bezel">' +
      '<canvas class="zelda-canvas" id="zeldaCanvas" width="256" height="224"></canvas>' +
      '<div class="zelda-hud is-on" id="zeldaHud">DRAG GAUNTLET → STOVE</div>' +
      "</div>" +
      '<div class="zelda-dialog" id="zeldaDialog">' +
      '<div class="zelda-dialog-name">PROMETHEUS</div>' +
      '<p class="zelda-dialog-text" id="zeldaText"></p>' +
      '<span class="zelda-dialog-cursor" id="zeldaCursor">▼</span>' +
      "</div>";

    var canvas = document.getElementById("zeldaCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    var dialogEl = document.getElementById("zeldaText");
    var cursorEl = document.getElementById("zeldaCursor");
    var hudEl = document.getElementById("zeldaHud");

    var W = 256;
    var H = 224;

    // Start zoomed enough to read the forge AND see the gauntlet in-frame
    var phase = "intro";
    var phaseT = 0;
    var cam = 1.35;
    var camTarget = 1.35;
    var camX = 128;
    var camY = 118;
    var stoveHeat = 0;
    var danceT = 0;
    var complete = false;
    var dragging = false;
    // Gauntlet starts clearly on-screen (left of stove mouth)
    var gauntlet = { x: 78, y: 148 };
    var stoveMouth = { x: 128, y: 108, r: 22 };
    var typeFull = "";
    var typeShown = "";
    var typeIdx = 0;
    var typeTimer = 0;
    var blink = 0;
    var idleBaseY = 148;

    function say(text) {
      typeFull = text;
      typeShown = "";
      typeIdx = 0;
      typeTimer = 0;
      if (cursorEl) cursorEl.style.opacity = "0";
      if (dialogEl) dialogEl.textContent = "";
    }

    function updateTyping(dt) {
      typeTimer += dt;
      if (typeIdx < typeFull.length && typeTimer > 0.028) {
        typeTimer = 0;
        typeIdx++;
        typeShown = typeFull.slice(0, typeIdx);
        if (dialogEl) dialogEl.textContent = typeShown;
      } else if (typeIdx >= typeFull.length) {
        blink += dt;
        if (cursorEl) cursorEl.style.opacity = blink % 0.8 < 0.4 ? "1" : "0";
      }
    }

    say(DIALOGUE.intro);
    setTimeout(function () {
      if (phase === "intro") {
        phase = "play";
        say(DIALOGUE.hint);
        if (hudEl) hudEl.classList.add("is-on");
      }
    }, 1800);

    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }

    function drawCheckerFloor() {
      for (var y = 168; y < 240; y += 8) {
        for (var x = -40; x < 300; x += 8) {
          var on = ((x + y) / 8) % 2 === 0;
          px(x, y, 8, 8, on ? "#1a2438" : "#121a28");
        }
      }
    }

    function drawBrickWall() {
      for (var y = -20; y < 180; y += 8) {
        var off = (Math.floor(y / 8) % 2) * 4;
        for (var x = -40; x < 300; x += 16) {
          px(x + off, y, 15, 7, "#2a3548");
          px(x + off, y, 15, 1, "#3a4a62");
          px(x + off + 14, y, 1, 7, "#1a2435");
        }
      }
    }

    function drawFire(x, y, t, scale) {
      scale = scale || 1;
      var tongues = [
        { dx: 0, c: "#fff6a8", h: 14 },
        { dx: -3, c: "#ffb347", h: 11 },
        { dx: 3, c: "#ff7a28", h: 12 },
        { dx: -5, c: "#ff4d1a", h: 8 },
        { dx: 5, c: "#ff4d1a", h: 9 }
      ];
      for (var i = 0; i < tongues.length; i++) {
        var f = tongues[i];
        var bob = Math.sin(t * 10 + i) * 2;
        var hh = Math.round((f.h + bob) * scale);
        var ww = Math.max(2, Math.round(4 * scale));
        px(x + f.dx * scale - ww / 2, y - hh, ww, hh, f.c);
      }
      px(x - 2, y - 2, 4, 3, "#ffe08a");
    }

    function drawGauntlet(x, y, t) {
      // Classic Zelda item pickup vibe — chunky metal + gold + flame
      px(x - 9, y - 2, 18, 14, "#6a7a8c");
      px(x - 8, y - 1, 16, 12, "#8a9bb0");
      px(x - 7, y, 14, 10, "#dce3ec");
      // knuckles
      px(x - 8, y - 5, 4, 5, "#9aabbf");
      px(x - 3, y - 6, 4, 6, "#b8c4d4");
      px(x + 2, y - 6, 4, 6, "#b8c4d4");
      px(x + 7, y - 5, 4, 5, "#9aabbf");
      // gold trim (Loot accent)
      px(x - 9, y + 10, 18, 3, "#e8a735");
      px(x - 6, y + 2, 12, 2, "#c9a24a");
      // wrist cuff
      px(x - 6, y + 13, 12, 7, "#5a6a7c");
      px(x - 5, y + 14, 10, 2, "#e8a735");
      // Sparkle like a Zelda item
      if (Math.floor(t * 6) % 2 === 0) {
        px(x + 10, y - 10, 2, 2, "#fff");
        px(x - 12, y - 4, 2, 2, "#ffe08a");
      }
      drawFire(x, y - 8, t, 1.15);
    }

    function drawStoveClose(heat, t) {
      // Iron stove — larger for readability at start zoom
      px(86, 72, 84, 78, "#2e2835");
      px(90, 76, 76, 70, "#4a4250");
      px(92, 78, 72, 66, "#5a5260");
      // rivets
      [[96, 82], [156, 82], [96, 136], [156, 136]].forEach(function (p) {
        px(p[0], p[1], 3, 3, "#2a2430");
        px(p[0] + 1, p[1] + 1, 1, 1, "#7a7280");
      });
      // top plate
      px(82, 66, 92, 10, "#5a5260");
      px(84, 68, 88, 5, "#7a7280");
      // chimney
      px(150, 38, 16, 32, "#3a3340");
      px(148, 34, 20, 8, "#4a4250");
      if (heat > 0.15) {
        for (var s = 0; s < 4; s++) {
          var sy = 28 - ((t * 22 + s * 12) % 30);
          px(155 + Math.sin(t * 3 + s) * 3, sy, 5, 5, "rgba(190,200,210," + (0.25 + heat * 0.35) + ")");
        }
      }
      // mouth
      px(106, 92, 44, 36, "#05040a");
      px(108, 94, 40, 32, "#12101a");
      // gold Zelda frame
      px(104, 90, 48, 4, "#e8a735");
      px(104, 124, 48, 4, "#e8a735");
      px(104, 90, 4, 38, "#e8a735");
      px(148, 90, 4, 38, "#e8a735");
      // grate
      for (var g = 0; g < 4; g++) {
        px(114 + g * 8, 100, 2, 22, "#2a2832");
      }
      if (heat > 0) {
        var glow = Math.round(80 + heat * 100);
        px(112, 100, 32, 22, "rgba(255," + Math.min(200, glow) + ",20," + (0.2 + heat * 0.6) + ")");
        if (heat > 0.35) drawFire(128, 120, t, 0.85 + heat * 0.55);
      }
      // feet
      px(92, 150, 10, 8, "#2a2430");
      px(154, 150, 10, 8, "#2a2430");
      // name plate
      px(116, 132, 24, 8, "#2a2430");
      px(118, 134, 20, 3, "#e8a735");
    }

    function drawRobot(t, awake, dancing) {
      var bounce = dancing ? Math.abs(Math.sin(t * 8)) * 5 : 0;
      var armL = dancing ? Math.sin(t * 8) * 20 : awake ? -10 : 4;
      var armR = dancing ? -Math.sin(t * 8) * 20 : awake ? 10 : -4;
      var legL = dancing ? Math.sin(t * 8) * 7 : 0;
      var legR = dancing ? -Math.sin(t * 8) * 7 : 0;
      var by = -bounce;

      px(108, 196, 40, 5, "rgba(0,0,0,0.4)");

      px(110 + legL, 172 + by, 12, 24, "#5a6a7c");
      px(134 + legR, 172 + by, 12, 24, "#5a6a7c");
      px(108 + legL, 194 + by, 16, 5, "#3a4a5c");
      px(132 + legR, 194 + by, 16, 5, "#3a4a5c");

      // torso (the “stove” revealed as a bot)
      px(102, 118 + by, 52, 56, "#6a7a8c");
      px(104, 120 + by, 48, 52, "#8a9aac");
      px(112, 132 + by, 32, 28, "#2a2430");
      px(114, 134 + by, 28, 24, awake ? "#ff6a28" : "#12101a");
      if (awake) drawFire(128, 154 + by, t, 0.6);
      px(110, 130 + by, 36, 3, "#e8a735");
      px(110, 158 + by, 36, 3, "#e8a735");

      // arms
      px(86, 126 + by + armL * 0.12, 18, 12, "#6a7a8c");
      px(152, 126 + by + armR * 0.12, 18, 12, "#6a7a8c");
      px(80, 136 + by + armL * 0.35, 14, 30, "#7a8a9c");
      px(162, 136 + by + armR * 0.35, 14, 30, "#7a8a9c");
      px(76, 162 + by + armL, 16, 12, "#b8c4d4");
      px(164, 162 + by + armR, 16, 12, "#b8c4d4");

      // head
      px(110, 90 + by, 36, 30, "#8a9aac");
      px(112, 92 + by, 32, 26, "#a8b8c8");
      px(124, 80 + by, 8, 12, "#6a7a8c");
      px(122, 76 + by, 12, 8, awake ? "#3dff8a" : "#445");

      if (awake) {
        var blinkEye = Math.floor(t * 2) % 9 === 0;
        if (!blinkEye) {
          px(116, 100 + by, 8, 8, "#1a2030");
          px(132, 100 + by, 8, 8, "#1a2030");
          px(118, 102 + by, 4, 4, "#5ef0ff");
          px(134, 102 + by, 4, 4, "#5ef0ff");
        } else {
          px(116, 103 + by, 8, 2, "#1a2030");
          px(132, 103 + by, 8, 2, "#1a2030");
        }
        px(120, 114 + by, 16, 3, "#1a2030");
      } else {
        px(116, 104 + by, 8, 2, "#445");
        px(132, 104 + by, 8, 2, "#445");
      }
    }

    function worldToScreen(wx, wy) {
      return {
        x: (wx - camX) * cam + W / 2,
        y: (wy - camY) * cam + H / 2
      };
    }

    function screenToWorld(sx, sy) {
      return {
        x: (sx - W / 2) / cam + camX,
        y: (sy - H / 2) / cam + camY
      };
    }

    function eventToCanvas(e) {
      var rect = canvas.getBoundingClientRect();
      var client = e.touches && e.touches[0] ? e.touches[0] : e;
      return {
        x: ((client.clientX - rect.left) / rect.width) * W,
        y: ((client.clientY - rect.top) / rect.height) * H
      };
    }

    function onDown(e) {
      if (phase !== "play" && phase !== "near") return;
      e.preventDefault();
      var p = eventToCanvas(e);
      var g = worldToScreen(gauntlet.x, gauntlet.y);
      if (Math.hypot(p.x - g.x, p.y - g.y) < 36) {
        dragging = true;
        host.classList.add("is-dragging");
        if (hudEl) hudEl.classList.remove("is-on");
      }
    }
    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();
      var p = eventToCanvas(e);
      var w = screenToWorld(p.x, p.y);
      gauntlet.x = Math.max(40, Math.min(210, w.x));
      gauntlet.y = Math.max(60, Math.min(175, w.y));
    }
    function onUp() {
      dragging = false;
      host.classList.remove("is-dragging");
    }

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    var last = performance.now();
    function tick(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phaseT += dt;
      updateTyping(dt);

      if (!dragging && (phase === "play" || phase === "intro" || phase === "near")) {
        gauntlet.y = idleBaseY + Math.sin(now / 400) * 2.5;
      }

      if (phase === "play" || phase === "near") {
        var dist = Math.hypot(gauntlet.x - stoveMouth.x, gauntlet.y - stoveMouth.y);
        if (phase === "play" && dist < 48) {
          phase = "near";
          say(DIALOGUE.near);
        }
        if (dragging && dist < stoveMouth.r + 8) {
          dragging = false;
          phase = "insert";
          phaseT = 0;
          say(DIALOGUE.insert);
          stoveHeat = 0.35;
          host.classList.add("has-interacted");
          if (hudEl) hudEl.classList.remove("is-on");
        }
      }

      if (phase === "insert") {
        gauntlet.x += (stoveMouth.x - gauntlet.x) * 0.14;
        gauntlet.y += (stoveMouth.y + 8 - gauntlet.y) * 0.14;
        stoveHeat = Math.min(1, stoveHeat + dt * 0.9);
        if (phaseT > 1.0) {
          phase = "ignite";
          phaseT = 0;
          say(DIALOGUE.ignite);
          stoveHeat = 1;
        }
      }

      if (phase === "ignite") {
        stoveHeat = 1;
        if (phaseT > 1.3) {
          phase = "zoom";
          phaseT = 0;
          say(DIALOGUE.zoom);
          camTarget = 1;
          camY = 135;
        }
      }

      if (phase === "zoom") {
        cam += (camTarget - cam) * 0.045;
        camY += (135 - camY) * 0.045;
        stoveHeat = 1;
        if (phaseT > 2.0 && Math.abs(cam - 1) < 0.06) {
          phase = "dance";
          phaseT = 0;
          say(DIALOGUE.awake);
          complete = true;
          host.classList.add("is-complete");
          setTimeout(function () {
            say(DIALOGUE.dance);
          }, 1500);
          var live = document.getElementById("ariaLiveRegion");
          if (live) live.textContent = "The robot has awakened and is dancing.";
        }
      }

      if (phase === "dance") {
        cam = 1;
        camY = 135;
        danceT += dt;
        stoveHeat = 1;
      }

      // --- Draw ---
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam, cam);
      ctx.translate(-camX, -camY);

      drawBrickWall();
      drawCheckerFloor();

      if (phase === "dance" || (phase === "zoom" && cam < 1.2) || cam <= 1.02) {
        drawRobot(now / 1000, true, phase === "dance");
      } else {
        drawStoveClose(stoveHeat, now / 1000);
      }

      if (phase !== "zoom" && phase !== "dance") {
        var hide = phase === "insert" || phase === "ignite" ? Math.min(1, phaseT * 1.2) : 0;
        if (hide < 0.9) {
          ctx.globalAlpha = 1 - hide;
          drawGauntlet(gauntlet.x, gauntlet.y, now / 1000);
          ctx.globalAlpha = 1;
        }
      }

      if (phase === "near" || phase === "insert") {
        for (var i = 0; i < 6; i++) {
          var ang = now / 180 + i;
          px(
            stoveMouth.x + Math.cos(ang) * 24,
            stoveMouth.y + Math.sin(ang) * 16,
            2,
            2,
            i % 2 ? "#ffe08a" : "#6ecbff"
          );
        }
      }

      ctx.restore();

      // Soft vignette
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, 6);
      ctx.fillRect(0, H - 6, W, 6);

      // CRT scanlines
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      for (var sl = 0; sl < H; sl += 2) {
        ctx.fillRect(0, sl, W, 1);
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.PrometheusAwaken = { init: initAwaken8Bit };

  function bootWhenReady() {
    if (document.getElementById("prometheusScene")) {
      initAwaken8Bit();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootWhenReady);
  } else {
    bootWhenReady();
  }
  // Late fallback if pantheon/main remount timing shifts
  window.addEventListener("load", function () {
    if (!booted) bootWhenReady();
  });
})();
