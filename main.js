(function () {
  "use strict";

  // =============================================
  // PROMETHEUS — Multi-Page Interactive Engine
  // Page-aware: detects current page, runs only relevant code
  // =============================================

  var mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5 };
  var isDesktop = window.matchMedia("(pointer: fine) and (min-width: 769px)").matches;
  var isMobile = !isDesktop || window.innerWidth < 769;
  var currentPage = document.body.getAttribute("data-page") || "home";

  function canvasSize(canvas) {
    var parent = canvas.parentElement;
    var w = canvas.clientWidth || canvas.offsetWidth || 0;
    var h = canvas.clientHeight || canvas.offsetHeight || 0;
    if (parent) {
      if (w < 2) w = parent.clientWidth;
      if (h < 2) h = parent.clientHeight;
    }
    return { w: Math.max(2, w || 800), h: Math.max(2, h || 500) };
  }

  document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = e.clientX / window.innerWidth;
    mouse.ny = e.clientY / window.innerHeight;
  });

  // =============================================
  // 1. PAGE TRANSITIONS
  // =============================================
  var pageTransition = document.getElementById("pageTransition");

  function revealPage() {
    document.documentElement.classList.add("is-ui-ready");
    if (!pageTransition) return;
    // Wait two frames so logo layout is committed before the curtain lifts.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pageTransition.classList.add("revealed");
      });
    });
  }

  function initPageTransitions() {
    // Intercept internal links for torch-fire transitions
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http") || href.startsWith("tel:")) return;

      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = a.href;
        if (window.PrometheusPantheon && typeof window.PrometheusPantheon.navigateWithFire === "function") {
          window.PrometheusPantheon.navigateWithFire(target, a);
          return;
        }
        if (pageTransition) {
          pageTransition.classList.remove("revealed");
          pageTransition.classList.add("leaving");
          setTimeout(function () {
            window.location = target;
          }, 900);
        } else {
          window.location = target;
        }
      });
    });
  }

  // =============================================
  // 2. LOADING SCREEN
  // =============================================
  var loader = document.getElementById("loader");
  var loaderBar = document.getElementById("loaderBar");
  var loaderCounter = document.getElementById("loaderCounter");
  var loadProgress = { value: 0 };

  function runLoader(callback) {
    // Home uses the divine-flame creation opener instead of the numeric loader
    if (currentPage === "home" && window.PrometheusPantheon && typeof window.PrometheusPantheon.runCreationOpening === "function") {
      if (loader) {
        loader.classList.add("done");
        loader.style.display = "none";
      }
      revealPage();
      window.PrometheusPantheon.runCreationOpening(callback);
      return;
    }
    if (!loader || typeof gsap === "undefined") {
      if (callback) callback();
      revealPage();
      return;
    }
    gsap.to(loadProgress, {
      value: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: function () {
        var v = Math.round(loadProgress.value);
        if (loaderCounter) loaderCounter.textContent = v;
        if (loaderBar) loaderBar.style.width = v + "%";
      },
      onComplete: function () {
        gsap.to(loader, {
          opacity: 0, duration: 0.5, ease: "power2.inOut",
          onComplete: function () {
            loader.classList.add("done");
            loader.style.display = "none";
            revealPage();
            if (callback) callback();
          }
        });
      }
    });
  }

  // =============================================
  // 3. PROGRESS BAR
  // =============================================
  function initProgressBar() {
    var bar = document.getElementById("progressBar");
    if (!bar) return;
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) bar.style.width = (window.scrollY / h) * 100 + "%";
    }, { passive: true });
  }

  // =============================================
  // 4. CUSTOM CURSOR
  // =============================================
  function initCursor() {
    var cursor = document.getElementById("cursor");
    var cursorText = document.getElementById("cursorText");
    if (!isDesktop || !cursor) {
      if (cursor) cursor.style.display = "none";
      return;
    }
    var cx = 0, cy = 0;
    (function tick() {
      cx += (mouse.x - cx) * 0.15;
      cy += (mouse.y - cy) * 0.15;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(tick);
    })();

    document.querySelectorAll("a, button, .tilt-card, .feature-card, .vision-card, .city-card, .inspiration-card, .stat, .preview-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("hovering");
        var text = el.getAttribute("data-cursor") || "";
        if (text && cursorText) cursorText.textContent = text;
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("hovering");
      });
    });
    document.addEventListener("mousedown", function () { cursor.classList.add("clicking"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("clicking"); });
  }

  // =============================================
  // 5. THREE.JS — Hero Particles (Home only)
  // =============================================
  function initThreeScene() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

    var count = isMobile ? 200 : 500;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    var velocities = new Float32Array(count * 3);
    var sizes = new Float32Array(count);

    function resetParticle(i) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = Math.random() * 0.007 + 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
      sizes[i] = Math.random() * 3 + 1;
    }
    for (var i = 0; i < count; i++) resetParticle(i);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    var material = new THREE.ShaderMaterial({
      vertexShader:
        "attribute float size;" +
        "varying float vAlpha;" +
        "void main() {" +
        "  vec4 mv = modelViewMatrix * vec4(position, 1.0);" +
        "  gl_PointSize = size * (180.0 / -mv.z);" +
        "  gl_Position = projectionMatrix * mv;" +
        "  vAlpha = smoothstep(5.0, 0.0, length(position.xy)) * 0.55;" +
        "}",
      fragmentShader:
        "varying float vAlpha;" +
        "void main() {" +
        "  float d = length(gl_PointCoord - vec2(0.5));" +
        "  if (d > 0.5) discard;" +
        "  float g = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);" +
        "  vec3 c = mix(vec3(0.76, 0.28, 0.1), vec3(0.96, 0.7, 0.2), g);" +
        "  gl_FragColor = vec4(c, g * vAlpha);" +
        "}",
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(geometry, material));
    var mouseTarget = { x: 0, y: 0 };
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      mouseTarget.x += ((mouse.nx - 0.5) * 2 - mouseTarget.x) * 0.05;
      mouseTarget.y += ((0.5 - mouse.ny) * 2 - mouseTarget.y) * 0.05;
      var pos = geometry.attributes.position.array;
      for (var j = 0; j < count; j++) {
        var ix = j * 3;
        pos[ix] += velocities[ix];
        pos[ix + 1] += velocities[ix + 1];
        pos[ix + 2] += velocities[ix + 2];
        var dx = pos[ix] - mouseTarget.x * 3;
        var dy = pos[ix + 1] - mouseTarget.y * 3;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
          var force = (2 - dist) * 0.0012;
          pos[ix] += dx * force;
          pos[ix + 1] += dy * force;
        }
        pos[ix] += Math.sin(t * 0.4 + j * 0.1) * 0.0008;
        if (pos[ix + 1] > 4) {
          resetParticle(j);
          pos[ix + 1] = -3;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      camera.position.x += (mouseTarget.x * 0.25 - camera.position.x) * 0.02;
      camera.position.y += (mouseTarget.y * 0.15 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 5b. THREE.JS — Wireframe Humanoid (Robotics)
  // =============================================
  function initRobotScene() {
    var canvas = document.getElementById("pageCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var sz = canvasSize(canvas);
    var w = sz.w, h = sz.h;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.8, 5.5);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(w, h);
    renderer.setClearColor(0x05070e, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

    var wireMat = new THREE.MeshBasicMaterial({ color: 0x7ec8ff, wireframe: true, transparent: true, opacity: 0.28 });
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xff3d1f, transparent: true, opacity: 0.75 });
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.2 });

    var robot = new THREE.Group();

    // Head — icosahedron wireframe (consciousness)
    robot.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), wireMat).translateY(2.3));
    var headCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), glowMat);
    headCore.position.y = 2.3;
    robot.add(headCore);

    // Torso — wireframe box
    robot.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.45, 2, 2, 2), wireMat).translateY(1.2));
    // Core heart glow
    var heart = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), glowMat);
    heart.position.set(0, 1.35, 0.15);
    robot.add(heart);

    // Arms
    var armGeo = new THREE.CylinderGeometry(0.07, 0.05, 1.0, 6);
    [-1, 1].forEach(function (side) {
      var upper = new THREE.Mesh(armGeo, wireMat);
      upper.position.set(side * 0.7, 1.55, 0);
      upper.rotation.z = side * 0.25;
      robot.add(upper);
      var lower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.85, 6), wireMat);
      lower.position.set(side * 0.82, 0.75, 0);
      lower.rotation.z = side * 0.1;
      robot.add(lower);
      // Hand
      robot.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), glowMat).translateX(side * 0.85).translateY(0.3));
    });

    // Legs
    var legGeo = new THREE.CylinderGeometry(0.09, 0.06, 1.2, 6);
    [-1, 1].forEach(function (side) {
      var upper = new THREE.Mesh(legGeo, wireMat);
      upper.position.set(side * 0.28, -0.1, 0);
      robot.add(upper);
      var lower = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.0, 6), wireMat);
      lower.position.set(side * 0.28, -1.2, 0);
      robot.add(lower);
      robot.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glowMat).translateX(side * 0.28).translateY(-1.7));
    });

    // Joint spheres
    var jGeo = new THREE.SphereGeometry(0.05, 6, 6);
    [[0,1.85,0],[-.55,1.8,0],[.55,1.8,0],[0,0.55,0],[-.28,0.5,0],[.28,0.5,0],[-.28,-0.7,0],[.28,-0.7,0]].forEach(function (p) {
      robot.add(new THREE.Mesh(jGeo, glowMat).translateX(p[0]).translateY(p[1]).translateZ(p[2]));
    });

    // Spine line (connecting head to pelvis)
    var spineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 2.3, 0), new THREE.Vector3(0, 0.55, 0)
    ]);
    robot.add(new THREE.Line(spineGeo, new THREE.LineBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.45 })));

    scene.add(robot);

    // Ambient dust particles
    var dustCount = isMobile ? 50 : 120;
    var dGeo = new THREE.BufferGeometry();
    var dPos = new Float32Array(dustCount * 3);
    for (var i = 0; i < dustCount; i++) {
      dPos[i*3]   = (Math.random() - 0.5) * 8;
      dPos[i*3+1] = (Math.random() - 0.5) * 6;
      dPos[i*3+2] = (Math.random() - 0.5) * 5;
    }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xff3d1f, size: 0.02, transparent: true, opacity: 0.35 })));

    var clock = new THREE.Clock();
    var targetRotY = 0, targetRotX = 0;

    canvas.parentElement.style.cursor = "grab";
    canvas.style.pointerEvents = "auto";
    var dragging = false, dragX = 0;
    canvas.addEventListener("mousedown", function (e) { dragging = true; dragX = e.clientX; canvas.parentElement.style.cursor = "grabbing"; });
    window.addEventListener("mousemove", function (e) { if (dragging) targetRotY += (e.clientX - dragX) * 0.005; dragX = e.clientX; });
    window.addEventListener("mouseup", function () { dragging = false; canvas.parentElement.style.cursor = "grab"; });
    // Touch support
    canvas.addEventListener("touchstart", function (e) { dragging = true; dragX = e.touches[0].clientX; });
    canvas.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      targetRotY += (e.touches[0].clientX - dragX) * 0.005;
      dragX = e.touches[0].clientX;
    }, { passive: false });
    canvas.addEventListener("touchend", function () { dragging = false; });

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      if (!dragging) {
        targetRotY += ((mouse.nx - 0.5) * 1.2 - targetRotY) * 0.01;
        targetRotX = (mouse.ny - 0.5) * 0.4;
      }
      robot.rotation.y += (targetRotY - robot.rotation.y) * 0.04;
      robot.rotation.x += (targetRotX - robot.rotation.x) * 0.04;

      // Breathing
      var breath = Math.sin(t * 1.2) * 0.015;
      robot.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);
      robot.position.y = Math.sin(t * 0.7) * 0.08;

      // Head core pulse
      headCore.scale.setScalar(0.8 + Math.sin(t * 2.5) * 0.25);
      // Heart pulse
      heart.scale.setScalar(0.8 + Math.sin(t * 3) * 0.3);

      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 5c. THREE.JS — Organic Cityscape (Cities)
  // =============================================
  function initCityScene() {
    var canvas = document.getElementById("pageCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var sz = canvasSize(canvas);
    var w = sz.w, h = sz.h;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(w, h);
    renderer.setClearColor(0x05070e, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

    var city = new THREE.Group();
    var buildMat = new THREE.MeshBasicMaterial({ color: 0xffd2c2, wireframe: true, transparent: true, opacity: 0.14 });
    var greenMat = new THREE.MeshBasicMaterial({ color: 0xff8f6b, transparent: true, opacity: 0.22 });
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.45 });
    var treeMat = new THREE.MeshBasicMaterial({ color: 0x6dbf6a, wireframe: true, transparent: true, opacity: 0.22 });
    var buildings = [];

    // Grid ground
    var gridHelper = new THREE.GridHelper(14, 28, 0x1c1c24, 0x1c1c24);
    gridHelper.position.y = -0.01;
    city.add(gridHelper);

    // Buildings — clustered in zones
    for (var i = 0; i < (isMobile ? 25 : 45); i++) {
      var bh = 0.3 + Math.random() * 3.5;
      var bw = 0.25 + Math.random() * 0.6;
      var bd = 0.25 + Math.random() * 0.6;
      var geo = new THREE.BoxGeometry(bw, bh, bd, 1, 1, 1);
      var b = new THREE.Mesh(geo, buildMat.clone());
      var angle = Math.random() * Math.PI * 2;
      var radius = 0.5 + Math.random() * 5.5;
      b.position.set(Math.cos(angle) * radius, bh / 2, Math.sin(angle) * radius);
      b.rotation.y = Math.random() * 0.3;
      b.userData.baseHeight = bh;
      b.userData.phase = Math.random() * Math.PI * 2;
      buildings.push(b);
      city.add(b);

      // Window lights (glowing points on some buildings)
      if (bh > 1.5 && Math.random() > 0.4) {
        var windowCount = Math.floor(bh * 2);
        for (var wi = 0; wi < windowCount; wi++) {
          var wp = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), glowMat);
          wp.position.set(
            b.position.x + (Math.random() - 0.5) * bw * 0.7,
            0.3 + Math.random() * bh * 0.8,
            b.position.z + (Math.random() > 0.5 ? bd/2 + 0.01 : -bd/2 - 0.01)
          );
          city.add(wp);
        }
      }
    }

    // Trees — organic green cones scattered between buildings
    for (var ti = 0; ti < (isMobile ? 8 : 18); ti++) {
      var tree = new THREE.Group();
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 5), new THREE.MeshBasicMaterial({ color: 0x5c554e, transparent: true, opacity: 0.2 }));
      trunk.position.y = 0.2;
      tree.add(trunk);
      var foliage = new THREE.Mesh(new THREE.ConeGeometry(0.3 + Math.random() * 0.2, 0.6 + Math.random() * 0.4, 6), treeMat);
      foliage.position.y = 0.55 + Math.random() * 0.2;
      tree.add(foliage);
      var ta = Math.random() * Math.PI * 2;
      var tr = 1 + Math.random() * 6;
      tree.position.set(Math.cos(ta) * tr, 0, Math.sin(ta) * tr);
      city.add(tree);
    }

    // Central green dome (nature hub)
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), greenMat);
    city.add(dome);

    scene.add(city);

    var clock = new THREE.Clock();
    var camAngle = 0;
    canvas.style.pointerEvents = "auto";
    var dragging = false, dragX = 0, dragAngle = 0;
    canvas.addEventListener("mousedown", function (e) { dragging = true; dragX = e.clientX; dragAngle = camAngle; });
    window.addEventListener("mousemove", function (e) { if (dragging) camAngle = dragAngle + (e.clientX - dragX) * 0.003; });
    window.addEventListener("mouseup", function () { dragging = false; });
    // Touch support
    canvas.addEventListener("touchstart", function (e) { dragging = true; dragX = e.touches[0].clientX; dragAngle = camAngle; });
    canvas.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      camAngle = dragAngle + (e.touches[0].clientX - dragX) * 0.003;
      dragX = e.touches[0].clientX;
    }, { passive: false });
    canvas.addEventListener("touchend", function () { dragging = false; });

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      if (!dragging) camAngle += 0.001;

      camera.position.x = Math.sin(camAngle) * 10;
      camera.position.z = Math.cos(camAngle) * 10;
      camera.position.y = 5 + (mouse.ny - 0.5) * 2;
      camera.lookAt(0, 0.5, 0);

      // Buildings breathe gently
      buildings.forEach(function (b) {
        var pulse = 1 + Math.sin(t * 0.8 + b.userData.phase) * 0.03;
        b.scale.y = pulse;
        b.position.y = b.userData.baseHeight * pulse / 2;
      });

      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 5d. THREE.JS — Three Pillars (Vision)
  // =============================================
  function initVisionScene() {
    var canvas = document.getElementById("pageCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var sz = canvasSize(canvas);
    var w = sz.w, h = sz.h;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setClearColor(0x05070e, 1);

    var group = new THREE.Group();
    var wireMat = function (c) { return new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.25 }); };
    var solidMat = function (c) { return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6 }); };

    // Central core — small glowing sphere
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), solidMat(0xe8a735));
    group.add(core);

    // Pillar 1: Robotics — Icosahedron (machine consciousness)
    var p1 = new THREE.Group();
    p1.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), wireMat(0xe8a735)));
    p1.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), solidMat(0xe8a735)));
    group.add(p1);

    // Pillar 2: Architecture — OctahedronGeometry (structural form)
    var p2 = new THREE.Group();
    p2.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), wireMat(0x6dbf6a)));
    p2.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), solidMat(0x6dbf6a)));
    group.add(p2);

    // Pillar 3: Ecology — Torus (cycles, regeneration)
    var p3 = new THREE.Group();
    p3.add(new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 8, 20), wireMat(0x5b9bd5)));
    p3.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), solidMat(0x5b9bd5)));
    group.add(p3);

    var pillars = [p1, p2, p3];

    // Connection lines (will be updated each frame)
    var lineMat = new THREE.LineBasicMaterial({ color: 0xf0ede8, transparent: true, opacity: 0.08 });
    var lineGeos = [];
    for (var li = 0; li < 3; li++) {
      var lg = new THREE.BufferGeometry();
      lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      var line = new THREE.Line(lg, lineMat);
      group.add(line);
      lineGeos.push(lg);
    }

    scene.add(group);

    var clock = new THREE.Clock();
    canvas.style.pointerEvents = "auto";

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      var orbitR = 1.8 + Math.sin(t * 0.3) * 0.2;
      var speed = 0.4 + (mouse.nx - 0.5) * 0.3;

      pillars.forEach(function (p, i) {
        var angle = t * speed + (i * Math.PI * 2 / 3);
        p.position.x = Math.cos(angle) * orbitR;
        p.position.z = Math.sin(angle) * orbitR * 0.5;
        p.position.y = Math.sin(angle * 0.7 + i) * 0.4;
        p.rotation.x = t * 0.3 + i;
        p.rotation.y = t * 0.5 + i;
      });

      // Update connection lines
      for (var ci = 0; ci < 3; ci++) {
        var a = pillars[ci].position;
        var b = pillars[(ci + 1) % 3].position;
        var arr = lineGeos[ci].attributes.position.array;
        arr[0] = a.x; arr[1] = a.y; arr[2] = a.z;
        arr[3] = b.x; arr[4] = b.y; arr[5] = b.z;
        lineGeos[ci].attributes.position.needsUpdate = true;
      }

      core.scale.setScalar(0.8 + Math.sin(t * 2) * 0.3);
      group.rotation.y += ((mouse.nx - 0.5) * 0.5 - group.rotation.y) * 0.02;
      group.rotation.x += ((mouse.ny - 0.5) * 0.2 - group.rotation.x) * 0.02;

      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 5e. THREE.JS — Sacred Flame (Philosophy)
  // =============================================
  function initFlameScene() {
    var canvas = document.getElementById("pageCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var sz = canvasSize(canvas);
    var w = sz.w, h = sz.h;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setClearColor(0x05070e, 1);

    // Sacred geometry — wireframe icosahedron
    var sacredGeo = new THREE.IcosahedronGeometry(1.5, 1);
    var sacredMesh = new THREE.Mesh(sacredGeo, new THREE.MeshBasicMaterial({
      color: 0xf0ede8, wireframe: true, transparent: true, opacity: 0.06
    }));
    scene.add(sacredMesh);

    // Inner dodecahedron
    var innerGeo = new THREE.DodecahedronGeometry(0.8, 0);
    var innerMesh = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({
      color: 0xe8a735, wireframe: true, transparent: true, opacity: 0.1
    }));
    scene.add(innerMesh);

    // Fire particles flowing upward through geometry
    var count = isMobile ? 200 : 400;
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    var vel = new Float32Array(count * 3);
    var sizes = new Float32Array(count);

    function resetFlameParticle(i) {
      var angle = Math.random() * Math.PI * 2;
      var r = Math.random() * 0.6;
      pos[i*3]   = Math.cos(angle) * r;
      pos[i*3+1] = -2 + Math.random() * 0.5;
      pos[i*3+2] = Math.sin(angle) * r;
      vel[i*3]   = (Math.random() - 0.5) * 0.003;
      vel[i*3+1] = 0.008 + Math.random() * 0.012;
      vel[i*3+2] = (Math.random() - 0.5) * 0.003;
      sizes[i] = 1 + Math.random() * 3;
    }
    for (var i = 0; i < count; i++) resetFlameParticle(i);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    var flameMat = new THREE.ShaderMaterial({
      vertexShader:
        "attribute float size;" +
        "varying float vAlpha;" +
        "void main() {" +
        "  vec4 mv = modelViewMatrix * vec4(position, 1.0);" +
        "  gl_PointSize = size * (150.0 / -mv.z);" +
        "  gl_Position = projectionMatrix * mv;" +
        "  float h = (position.y + 2.0) / 4.5;" +
        "  vAlpha = smoothstep(0.0, 0.3, h) * smoothstep(1.0, 0.5, h) * 0.6;" +
        "}",
      fragmentShader:
        "varying float vAlpha;" +
        "void main() {" +
        "  float d = length(gl_PointCoord - vec2(0.5));" +
        "  if (d > 0.5) discard;" +
        "  float g = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);" +
        "  vec3 c = mix(vec3(0.77, 0.28, 0.17), vec3(0.96, 0.65, 0.21), g);" +
        "  gl_FragColor = vec4(c, g * vAlpha);" +
        "}",
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(geo, flameMat));

    var clock = new THREE.Clock();

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Wind from mouse
      var windX = (mouse.nx - 0.5) * 0.006;
      var windZ = (mouse.ny - 0.5) * 0.004;

      var arr = geo.attributes.position.array;
      for (var j = 0; j < count; j++) {
        var ix = j * 3;
        arr[ix]   += vel[ix] + windX;
        arr[ix+1] += vel[ix+1];
        arr[ix+2] += vel[ix+2] + windZ;
        // Swirl
        arr[ix] += Math.sin(t + j * 0.1) * 0.001;
        if (arr[ix+1] > 2.5) resetFlameParticle(j);
      }
      geo.attributes.position.needsUpdate = true;

      sacredMesh.rotation.x = t * 0.08;
      sacredMesh.rotation.y = t * 0.12;
      innerMesh.rotation.x = -t * 0.1;
      innerMesh.rotation.y = -t * 0.15;

      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 5f. THREE.JS — Network Graph (Contact)
  // =============================================
  function initNetworkScene() {
    var canvas = document.getElementById("pageCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    var sz = canvasSize(canvas);
    var w = sz.w, h = sz.h;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setClearColor(0x05070e, 1);

    // Nodes
    var nodeCount = isMobile ? 30 : 60;
    var nodeMat = new THREE.MeshBasicMaterial({ color: 0xe8a735, transparent: true, opacity: 0.5 });
    var nodes = [];
    for (var i = 0; i < nodeCount; i++) {
      var size = 0.03 + Math.random() * 0.04;
      var node = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 6), nodeMat.clone());
      node.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4
      );
      node.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.001
      );
      scene.add(node);
      nodes.push(node);
    }

    // Connection lines (dynamic)
    var maxConnections = isMobile ? 60 : 120;
    var linePositions = new Float32Array(maxConnections * 6);
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    var lineMesh = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: 0xe8a735, transparent: true, opacity: 0.06
    }));
    scene.add(lineMesh);

    var mouseWorld = new THREE.Vector3(0, 0, 0);
    var clock = new THREE.Clock();

    (function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      mouseWorld.x = (mouse.nx - 0.5) * 6;
      mouseWorld.y = (0.5 - mouse.ny) * 4;

      // Move nodes
      nodes.forEach(function (n) {
        n.position.add(n.userData.vel);
        // Wrap around bounds
        if (Math.abs(n.position.x) > 5) n.userData.vel.x *= -1;
        if (Math.abs(n.position.y) > 3.5) n.userData.vel.y *= -1;
        if (Math.abs(n.position.z) > 3) n.userData.vel.z *= -1;

        // Attract toward mouse
        var dx = mouseWorld.x - n.position.x;
        var dy = mouseWorld.y - n.position.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2.5) {
          var force = (2.5 - dist) * 0.00015;
          n.position.x += dx * force;
          n.position.y += dy * force;
        }

        // Gentle sine drift
        n.position.x += Math.sin(t * 0.3 + n.id) * 0.0003;
      });

      // Update connections — connect nearby nodes
      var connIdx = 0;
      var arr = lineGeo.attributes.position.array;
      for (var a = 0; a < nodeCount && connIdx < maxConnections; a++) {
        for (var b = a + 1; b < nodeCount && connIdx < maxConnections; b++) {
          var d = nodes[a].position.distanceTo(nodes[b].position);
          if (d < 1.5) {
            var idx = connIdx * 6;
            arr[idx]   = nodes[a].position.x;
            arr[idx+1] = nodes[a].position.y;
            arr[idx+2] = nodes[a].position.z;
            arr[idx+3] = nodes[b].position.x;
            arr[idx+4] = nodes[b].position.y;
            arr[idx+5] = nodes[b].position.z;
            connIdx++;
          }
        }
      }
      // Zero out unused connections
      for (var z = connIdx * 6; z < maxConnections * 6; z++) arr[z] = 0;
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, connIdx * 2);

      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", function () {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
  }

  // =============================================
  // 6. GSAP — Shared Scroll Animations
  // =============================================
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // --- Hero intro (home only) ---
    if (currentPage === "home") {
      document.body.classList.add("is-entered");
      // Ensure title lines are visible even if a prior transform stuck
      document.querySelectorAll(".line-inner").forEach(function (el) {
        gsap.set(el, { y: 0, clearProps: false });
      });
      gsap.set([".hero-eyebrow", ".hero-sub", ".hero-actions", ".hero-scroll"], { opacity: 1, y: 0 });

      var tl = gsap.timeline();
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, 0);
      document.querySelectorAll(".line-inner").forEach(function (el, i) {
        tl.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power4.out" }, 0.15 + i * 0.1);
      });
      tl.from(".hero-sub", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.7);
      tl.from(".hero-actions", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.85);
      tl.from(".hero-scroll", { opacity: 0, y: 10, duration: 0.6, ease: "power2.out" }, 1.1);
    }

    // --- Inner page hero reveal ---
    if (currentPage !== "home") {
      gsap.from(".page-hero-label", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
      gsap.from(".page-hero-title", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.2 });
      gsap.from(".page-hero-desc", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.4 });
    }

    // --- Scroll-triggered fade-ups ---
    document.querySelectorAll("[data-animate='fade-up']").forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-delay") || 0);
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out", delay: d,
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- Split-lines ---
    document.querySelectorAll("[data-animate='split-lines']").forEach(function (el) {
      gsap.from(el, {
        y: 35, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- Horizontal scroll (home robotics section) ---
    if (currentPage === "home" && window.innerWidth > 768) {
      var hsection = document.querySelector(".horizontal-section");
      var htrack = document.querySelector(".horizontal-track");
      if (hsection && htrack) {
        gsap.to(htrack, {
          x: function () { return -(htrack.scrollWidth - window.innerWidth); },
          ease: "none",
          scrollTrigger: {
            trigger: hsection, start: "top top",
            end: function () { return "+=" + (htrack.scrollWidth - window.innerWidth); },
            scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true
          }
        });
      }
    }

    // --- Philosophy: word-by-word reveal ---
    var quoteEl = document.querySelector("[data-animate='split-words']");
    if (quoteEl) {
      var rawText = quoteEl.textContent.trim();
      var words = rawText.split(/\s+/);
      quoteEl.innerHTML = words.map(function (w) {
        return '<span class="word">' + w + '</span>';
      }).join(' ');
      var wordEls = quoteEl.querySelectorAll(".word");
      ScrollTrigger.create({
        trigger: quoteEl,
        start: "top 80%", end: "bottom 30%", scrub: true,
        onUpdate: function (self) {
          wordEls.forEach(function (w, idx) {
            w.classList.toggle("visible", self.progress > idx / wordEls.length);
          });
        }
      });
    }

    // --- Header scroll ---
    var header = document.getElementById("header");
    if (header) {
      ScrollTrigger.create({
        start: 80,
        onUpdate: function (self) {
          header.classList.toggle("scrolled", self.scroll() > 80);
        }
      });
    }

    // --- Parallax ---
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed") || 0.2);
      gsap.to(el, {
        y: function () { return window.innerHeight * speed; },
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom", end: "bottom top", scrub: true
        }
      });
    });

    // --- Page-specific animations ---
    // About interactive awakening is handled by pantheon.js
    initCounters();
  }

  // =============================================
  // 7. PROMETHEUS INTERACTIVE ANIMATION (legacy no-op)
  // Replaced by pantheon.js awaken scene (hand → robot core)
  // =============================================
  function initPrometheusAnimation() {
    return;
    var scene = document.getElementById("prometheusScene");
    var figure = document.getElementById("promFigure");
    var boulder = document.getElementById("promBoulder");
    var sparks = document.getElementById("promSparks");
    var progressFill = document.getElementById("promProgressBar");
    var progressLabel = document.getElementById("promProgressLabel");
    var armFront = document.getElementById("promArmFront");
    var armBack = document.getElementById("promArmBack");
    var legFront = document.getElementById("promLegFront");
    var legBack = document.getElementById("promLegBack");
    var head = document.getElementById("promHead");
    var boulderGlowEl = boulder ? boulder.querySelector("circle:last-child") : null;
    var sparkEls = sparks ? sparks.querySelectorAll("circle") : [];

    if (!scene || !figure || !boulder) return;

    // ---- Slope geometry: left side of mountain ----
    // Path follows: bottom (85, 455) -> summit (198, 75)
    // This matches the dashed line in the SVG
    var pathStartX = 85, pathStartY = 455;
    var pathEndX   = 198, pathEndY   = 75;
    // Slope angle in radians (for figure rotation)
    var slopeAngle = Math.atan2(pathEndY - pathStartY, pathEndX - pathStartX);
    var slopeDegrees = slopeAngle * (180 / Math.PI); // about -73 degrees

    var progress = 0;        // 0 = bottom, 1 = summit
    var displayProgress = 0; // smoothed for rendering
    var targetProgress = 0;
    var isDragging = false;
    var walkPhase = 0;
    var prevProgress = 0;    // for velocity detection
    var dragStartY = 0;
    var dragStartProgress = 0;
    var boulderAngle = 0;
    var slideVelocity = 0;
    var sparkTimer = 0;

    // ---- Position along slope path ----
    function getPathPos(p) {
      p = Math.max(0, Math.min(1, p));
      return {
        x: pathStartX + (pathEndX - pathStartX) * p,
        y: pathStartY + (pathEndY - pathStartY) * p
      };
    }

    // Figure leans into the slope: perpendicular to the slope surface
    // At rest: leaning against slope. Climbing harder = leaning more.
    function getFigureRotation(p, effort) {
      // Base: lean to match slope angle + offset so figure faces uphill
      // Slope goes up-right, so figure should face right and lean into slope
      var base = -25; // base lean
      var strain = effort * 8; // lean harder when climbing fast
      return base - strain + p * 5; // straighten slightly near top
    }

    function updateVisuals(p) {
      p = Math.max(0, Math.min(1, p));
      displayProgress = p;

      var pos = getPathPos(p);
      var velocity = Math.abs(p - prevProgress);
      var effort = Math.min(1, velocity * 80); // 0-1 effort level

      // Figure: positioned on slope, rotated to lean into mountain
      var figRot = getFigureRotation(p, effort);
      figure.setAttribute("transform",
        "translate(" + pos.x + "," + pos.y + ") rotate(" + figRot + ")");

      // Boulder: sits above and slightly ahead of figure's hands
      // Offset in the direction the figure is pushing (uphill)
      var bx = pos.x + 14;
      var by = pos.y - 52;
      boulder.setAttribute("transform",
        "translate(" + bx + "," + by + ") rotate(" + Math.round(boulderAngle) + ")");

      // Sparks: follow boulder position
      if (sparks) {
        sparks.setAttribute("transform", "translate(" + bx + "," + by + ")");
      }

      // Boulder glow: brighter when moving
      if (boulderGlowEl) {
        boulderGlowEl.setAttribute("opacity", (effort * 0.5).toFixed(2));
      }

      // Spark visibility: only visible when moving
      sparkEls.forEach(function (s, i) {
        if (velocity > 0.0008) {
          sparkTimer += 0.15;
          var phase = sparkTimer + i * 1.3;
          var life = (Math.sin(phase) + 1) * 0.5; // 0-1 cycle
          var sx = Math.sin(phase * 2.3 + i) * 15;
          var sy = -Math.abs(Math.cos(phase * 1.7 + i)) * 25 - 5;
          s.setAttribute("cx", sx);
          s.setAttribute("cy", sy);
          s.setAttribute("opacity", (life * effort * 0.9).toFixed(2));
        } else {
          s.setAttribute("opacity", "0");
        }
      });

      // Progress bar
      var pct = Math.round(p * 100);
      if (progressFill) progressFill.style.setProperty("--fill", pct + "%");
      if (progressLabel) progressLabel.textContent = pct + "%";

      prevProgress = p;
    }

    // ---- Walking cycle: legs step UP the slope, arms push boulder ----
    function walkCycle(speed, direction) {
      walkPhase += speed;
      var s = Math.sin(walkPhase);
      var c = Math.cos(walkPhase);
      var mag = Math.min(1, speed * 8); // amplitude scales with speed

      // Arms: front arm pushes up toward boulder, back arm swings
      if (armFront) {
        armFront.setAttribute("x2", (18 + s * 4 * mag).toFixed(1));
        armFront.setAttribute("y2", (-28 - Math.abs(s) * 3 * mag).toFixed(1));
      }
      if (armBack) {
        armBack.setAttribute("x2", (-10 + s * 3 * mag).toFixed(1));
        armBack.setAttribute("y2", (-22 + c * 2 * mag).toFixed(1));
      }

      // Legs: stepping motion — one leg reaches uphill, other pushes off
      // "Uphill" stepping means the front leg reaches higher (more negative y)
      if (legFront) {
        var lfx = 12 + s * 6 * mag;
        var lfy = 4 - Math.abs(s) * 5 * mag; // lifts higher during step
        legFront.setAttribute("x2", lfx.toFixed(1));
        legFront.setAttribute("y2", lfy.toFixed(1));
      }
      if (legBack) {
        var lbx = -8 - s * 5 * mag;
        var lby = 2 - Math.abs(c) * 4 * mag;
        legBack.setAttribute("x2", lbx.toFixed(1));
        legBack.setAttribute("y2", lby.toFixed(1));
      }

      // Head bobs slightly with effort
      if (head) {
        head.setAttribute("cy", (-48 + Math.abs(s) * 1.5 * mag).toFixed(1));
      }

      // Boulder rolls uphill (negative = rolling up-right along slope)
      boulderAngle += speed * (direction > 0 ? 3 : -5);
    }

    // ---- Initialize at bottom ----
    updateVisuals(0);

    // ---- Pointer handling ----
    function getPointerY(e) {
      return e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;
    }

    function onDown(e) {
      e.preventDefault();
      isDragging = true;
      slideVelocity = 0;
      dragStartY = getPointerY(e);
      dragStartProgress = progress;
      scene.classList.add("dragging", "interacted");
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      var currentY = getPointerY(e);
      var rect = scene.getBoundingClientRect();
      var deltaY = dragStartY - currentY; // positive = dragging up
      // Sensitivity: full drag across scene height = full climb
      var sensitivity = 2.2 / rect.height;
      targetProgress = Math.max(0, Math.min(1, dragStartProgress + deltaY * sensitivity));
    }

    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      scene.classList.remove("dragging");
      // Let gravity take over — starts slow, accelerates
      slideVelocity = -0.0005;
    }

    // Mouse
    scene.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    // Touch
    scene.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    // ---- Animation loop ----
    (function tick() {
      requestAnimationFrame(tick);

      if (isDragging) {
        // Snappy response to drag input
        var diff = targetProgress - progress;
        progress += diff * 0.2;
        // Walk speed proportional to movement
        var walkSpeed = Math.abs(diff) * 3;
        if (walkSpeed > 0.005) {
          walkCycle(walkSpeed, diff > 0 ? 1 : -1);
        }
      } else {
        // Gravity: accelerates downward
        slideVelocity -= 0.00006; // gravity pull
        slideVelocity = Math.max(slideVelocity, -0.012); // terminal velocity

        // Friction slows it slightly
        slideVelocity *= 0.998;

        progress += slideVelocity;

        // Floor bounce at bottom
        if (progress <= 0) {
          progress = 0;
          slideVelocity = Math.abs(slideVelocity) * 0.25; // bouncy landing
          if (slideVelocity < 0.0004) slideVelocity = 0; // settle
        }

        // Cap at top (in case of weird state)
        if (progress > 1) { progress = 1; slideVelocity = 0; }

        // Slide-back walking (slower, legs drag)
        if (Math.abs(slideVelocity) > 0.0008) {
          walkCycle(Math.abs(slideVelocity) * 8, slideVelocity > 0 ? 1 : -1);
        }
      }

      updateVisuals(progress);
    })();

    // Gentle scroll nudge when section enters view
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: scene,
        start: "top 75%",
        end: "bottom 20%",
        onUpdate: function (self) {
          // Only nudge if at rest at bottom and not interacted
          if (!isDragging && progress < 0.02 && slideVelocity === 0) {
            var nudge = self.progress * 0.08;
            if (nudge > progress) {
              progress = nudge;
              walkCycle(0.02, 1);
            }
          }
        }
      });
    }
  }

  // =============================================
  // 8. COUNTER ANIMATION
  // =============================================
  function initCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        onUpdate: function () { el.textContent = Math.round(obj.val); }
      });
    });
  }

  // =============================================
  // 9. MAGNETIC ELEMENTS
  // =============================================
  function initMagnetic() {
    if (!isDesktop) return;
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-strength") || 15);
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) / r.width * s,
          y: (e.clientY - r.top - r.height / 2) / r.height * s,
          duration: 0.35, ease: "power3.out"
        });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  // =============================================
  // 10. TILT CARDS
  // =============================================
  function initTiltCards() {
    if (!isDesktop) return;
    document.querySelectorAll(".tilt-card, .preview-card").forEach(function (card) {
      var glow = card.querySelector("[class$='-glow']");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        gsap.to(card, {
          rotateX: (y - r.height / 2) / (r.height / 2) * -4,
          rotateY: (x - r.width / 2) / (r.width / 2) * 4,
          duration: 0.35, ease: "power2.out",
          transformPerspective: 800, transformOrigin: "center"
        });
        if (glow) { glow.style.left = x + "px"; glow.style.top = y + "px"; }
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  // =============================================
  // 11. INTERACTIVE MICRO-INTERACTIONS
  // =============================================
  function initInteractiveElements() {
    // Vision cards pulse
    document.querySelectorAll(".vision-card").forEach(function (card) {
      card.addEventListener("click", function () {
        gsap.fromTo(card, { scale: 1 }, { scale: 1.04, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
        var line = card.querySelector(".vision-card-line");
        if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", transformOrigin: "left center" });
      });
    });

    // City cards spin icon
    document.querySelectorAll(".city-card").forEach(function (card) {
      var icon = card.querySelector(".city-card-icon svg");
      var clicks = 0;
      card.addEventListener("click", function () {
        clicks++;
        if (icon) gsap.to(icon, { rotation: clicks * 360, duration: 0.6, ease: "back.out(1.7)" });
        gsap.fromTo(card, { y: 0 }, { y: -8, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 });
      });
    });

    // Feature cards flip
    document.querySelectorAll(".feature-card").forEach(function (card) {
      card.addEventListener("click", function () {
        gsap.fromTo(card, { rotateY: 0 }, { rotateY: 10, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, transformPerspective: 800 });
        var num = card.querySelector(".feature-num");
        if (num) gsap.fromTo(num, { scale: 1, color: "rgba(232,167,53,0.3)" }, { scale: 1.3, color: "#e8a735", duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 });
      });
    });

    // Stats re-count
    document.querySelectorAll(".stat").forEach(function (stat) {
      stat.addEventListener("click", function () {
        var numEl = stat.querySelector("[data-count]");
        if (numEl) {
          var target = parseInt(numEl.getAttribute("data-count"), 10);
          var obj = { val: 0 };
          numEl.textContent = "0";
          gsap.to(obj, { val: target, duration: 1.2, ease: "power2.out", onUpdate: function () { numEl.textContent = Math.round(obj.val); } });
        }
        gsap.fromTo(stat, { scale: 1 }, { scale: 1.08, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
      });
    });

    // Philosophy click particles
    var philBlock = document.querySelector(".philosophy-block");
    if (philBlock) {
      philBlock.style.cursor = "pointer";
      philBlock.addEventListener("click", function (e) {
        var r = philBlock.getBoundingClientRect();
        for (var i = 0; i < 12; i++) spawnParticle(philBlock, e.clientX - r.left, e.clientY - r.top);
      });
    }

    // Inspiration cards bounce
    document.querySelectorAll(".inspiration-card").forEach(function (card) {
      card.addEventListener("click", function () {
        gsap.fromTo(card, { scale: 1, y: 0 }, { scale: 1.03, y: -6, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 });
      });
    });

    // Principle cards pulse
    document.querySelectorAll(".principle-card").forEach(function (card) {
      card.addEventListener("click", function () {
        gsap.fromTo(card, { scale: 1 }, { scale: 1.04, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
      });
    });
  }

  function spawnParticle(parent, x, y) {
    var el = document.createElement("span");
    el.className = "click-particle";
    el.style.left = x + "px"; el.style.top = y + "px";
    parent.appendChild(el);
    var angle = Math.random() * Math.PI * 2;
    var dist = 40 + Math.random() * 80;
    var sz = 3 + Math.random() * 5;
    el.style.width = sz + "px"; el.style.height = sz + "px";
    gsap.fromTo(el, { opacity: 1, scale: 1 }, {
      x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 30,
      opacity: 0, scale: 0, duration: 0.6 + Math.random() * 0.4, ease: "power2.out",
      onComplete: function () { el.remove(); }
    });
  }

  // =============================================
  // 12. SMOOTH SCROLL (in-page anchors)
  // =============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#") return;
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          var y = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
          // Close mobile menu
          var menu = document.getElementById("navMenu");
          var burger = document.getElementById("navBurger");
          if (menu && menu.classList.contains("open")) {
            menu.classList.remove("open");
            if (burger) burger.classList.remove("open");
          }
        }
      });
    });
  }

  // =============================================
  // 13. MOBILE MENU
  // =============================================
  function initMenu() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("navMenu");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      var isOpen = burger.classList.toggle("open");
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", isOpen);
    });
  }

  // =============================================
  // 14. CONTACT FORM (with proper submission)
  // =============================================
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("contactSubmit");
    if (!form || !status || !submitBtn) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Disable submit button
      submitBtn.disabled = true;
      var origText = submitBtn.querySelector(".btn-text").textContent;
      submitBtn.querySelector(".btn-text").textContent = "Sending...";
      
      // Hide previous status
      status.style.display = "none";
      status.className = "form-status";
      
      // Get form data
      var formData = new FormData(form);
      
      // Submit via fetch
      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      })
      .then(function (response) {
        if (response.ok) {
          status.className = "form-status success";
          status.textContent = "✓ Message sent successfully! We'll get back to you soon.";
          status.style.display = "block";
          form.reset();
        } else {
          return response.json().then(function (data) {
            throw new Error(data.error || "Form submission failed");
          });
        }
      })
      .catch(function (error) {
        status.className = "form-status error";
        status.textContent = "✗ Oops! Something went wrong. Please try again or email us directly.";
        status.style.display = "block";
        console.error("Form error:", error);
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-text").textContent = origText;
      });
    });
  }

  // =============================================
  // 15. NAV ACTIVE STATE
  // =============================================
  function initActiveNav() {
    var links = document.querySelectorAll(".nav-link:not(.nav-link--cta)");
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      // Match based on data-page
      var pageName = href.replace(".html", "").replace("./", "").replace("/", "");
      if (pageName === "index" || pageName === "") pageName = "home";
      if (pageName === currentPage) link.classList.add("active");
    });
  }

  // =============================================
  // 15. ACCESSIBILITY ENHANCEMENTS
  // =============================================
  function initAccessibility() {
    // Add keyboard navigation for interactive elements
    document.addEventListener("keydown", function (e) {
      // ESC to close mobile menu
      if (e.key === "Escape") {
        var burger = document.getElementById("navBurger");
        var menu = document.getElementById("navMenu");
        if (burger && menu && burger.classList.contains("open")) {
          burger.classList.remove("open");
          menu.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        }
      }
    });

    // Improve focus visibility for keyboard users
    var focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(function (el) {
      el.addEventListener("focus", function () {
        this.classList.add("keyboard-focus");
      });
      el.addEventListener("blur", function () {
        this.classList.remove("keyboard-focus");
      });
    });

    // Add ARIA live region for dynamic content updates
    if (!document.getElementById("ariaLiveRegion")) {
      var liveRegion = document.createElement("div");
      liveRegion.id = "ariaLiveRegion";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      document.body.appendChild(liveRegion);
    }

    // Add reduced motion support
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  // =============================================
  // INIT
  // =============================================
  document.body.style.overflow = "hidden";
  initMenu();
  initProgressBar();
  initActiveNav();
  initAccessibility();

  function startExperience() {
    document.body.style.overflow = "";
    initCursor();

    if (currentPage === "home") initThreeScene();
    if (currentPage === "robotics") initRobotScene();
    if (currentPage === "cities") initCityScene();
    if (currentPage === "vision") initVisionScene();
    if (currentPage === "philosophy") initFlameScene();
    if (currentPage === "contact") initNetworkScene();

    initGSAP();
    initMagnetic();
    initTiltCards();
    initInteractiveElements();
    initPageTransitions();
    initSmoothScroll();

    if (currentPage === "contact") {
      initContactForm();
    }
  }

  runLoader(function () {
    startExperience();
  });

})();
