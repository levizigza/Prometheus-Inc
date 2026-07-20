/* ============================================
   PROMETHEUS — Cathedral-glass co-creator murals
   Bright jewel craft · page-relevant · creative divinity
   ============================================ */
(function () {
  "use strict";

  var PAGE = {
    home: {
      myth: "Co-creators and the First Fire",
      src: "assets/murals/mural-guardian.png",
      pos: "50% 58%",
      zoom: 1.04,
      focus: { x: 0.5, y: 0.58 }
    },
    vision: {
      myth: "Three Pillars of Becoming",
      src: "assets/murals/mural-laws.png",
      pos: "50% 45%",
      zoom: 1.08,
      focus: { x: 0.5, y: 0.4 }
    },
    about: {
      myth: "The Gift Shared Between Hands",
      src: "assets/murals/mural-forge.png",
      pos: "48% 48%",
      zoom: 1.08,
      focus: { x: 0.48, y: 0.45 }
    },
    robotics: {
      myth: "Companions Crafted for Care",
      src: "assets/murals/mural-companions.png",
      pos: "50% 48%",
      zoom: 1.1,
      focus: { x: 0.5, y: 0.48 }
    },
    cities: {
      myth: "Raising Mythic Living Cities",
      src: "assets/murals/mural-city.png",
      pos: "50% 50%",
      zoom: 1.1,
      focus: { x: 0.5, y: 0.5 }
    },
    philosophy: {
      myth: "Wisdom Written Together",
      src: "assets/murals/mural-wisdom.png",
      pos: "50% 48%",
      zoom: 1.08,
      focus: { x: 0.5, y: 0.48 }
    },
    projects: {
      myth: "Hands That Build With Us",
      src: "assets/murals/mural-builders.png",
      pos: "50% 45%",
      zoom: 1.1,
      focus: { x: 0.5, y: 0.45 }
    },
    contact: {
      myth: "Call Across the Shared Flame",
      src: "assets/murals/mural-signal.png",
      pos: "50% 46%",
      zoom: 1.08,
      focus: { x: 0.5, y: 0.46 }
    },
    insights: {
      myth: "Memory of Cities to Come",
      src: "assets/murals/mural-memory.png",
      pos: "50% 42%",
      zoom: 1.1,
      focus: { x: 0.5, y: 0.42 }
    }
  };

  function cfg() {
    var page = document.body.getAttribute("data-page") || "home";
    return PAGE[page] || PAGE.home;
  }

  function init() {
    document.querySelectorAll(".site-mural-canvas, .site-mural").forEach(function (el) {
      el.remove();
    });

    var conf = cfg();
    var root = document.createElement("div");
    root.className = "site-mural site-mural--mythic";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="site-mural-art-wrap">' +
      '<img class="site-mural-art" alt="" src="' + conf.src + '" />' +
      "</div>" +
      '<div class="site-mural-glass"></div>' +
      '<canvas class="site-mural-fx"></canvas>' +
      '<div class="site-mural-scrim"></div>' +
      '<div class="site-mural-caption">' + conf.myth + "</div>";

    document.body.insertBefore(root, document.body.firstChild);

    var art = root.querySelector(".site-mural-art");
    var wrap = root.querySelector(".site-mural-art-wrap");
    art.style.objectPosition = conf.pos;

    var canvas = root.querySelector(".site-mural-fx");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var mouse = { nx: 0.5, ny: 0.5 };

    document.addEventListener("mousemove", function (e) {
      mouse.nx = e.clientX / window.innerWidth;
      mouse.ny = e.clientY / window.innerHeight;
    });

    function size() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    var driftX = 0;
    var driftY = 0;

    function drawFx(t) {
      var w = window.innerWidth;
      var h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      var fx = w * (0.3 + conf.focus.x * 0.4) + (mouse.nx - 0.5) * 20;
      var fy = h * (0.25 + conf.focus.y * 0.35) + (mouse.ny - 0.5) * 14;

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var pulse = 0.28 + Math.sin(t * 1.5) * 0.08;
      var R = Math.min(w, h) * 0.09 * (0.9 + Math.sin(t * 2) * 0.1);
      var g = ctx.createRadialGradient(fx, fy, 0, fx, fy, R * 2.2);
      g.addColorStop(0, "rgba(255,230,150," + (0.22 * pulse / 0.28) + ")");
      g.addColorStop(0.4, "rgba(255,140,50," + (0.1 * pulse / 0.28) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, fy, R * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    (function loop() {
      var t = performance.now() / 1000;
      driftX += ((mouse.nx - 0.5) * 10 - driftX) * 0.03;
      driftY += ((mouse.ny - 0.5) * 8 - driftY) * 0.03;
      if (wrap) {
        wrap.style.transform =
          "translate(" + driftX.toFixed(2) + "px," + driftY.toFixed(2) + "px) scale(" + conf.zoom + ")";
      }
      drawFx(t);
      requestAnimationFrame(loop);
    })();
  }

  window.PrometheusMurals = { init: init };
})();
