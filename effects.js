(function () {
  var snowEl = document.getElementById("fx-snow");
  var thunderEl = document.getElementById("fx-thunder");
  var petalsEl = document.getElementById("fx-petals");
  var heartLayer = document.getElementById("heart-layer");

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.7)" stroke-width="0.85" ' +
    'd="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function initSnow() {
    if (!snowEl) return;
    var n = 48;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "snowflake";
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDuration = 7 + Math.random() * 9 + "s";
      s.style.animationDelay = Math.random() * 8 + "s";
      var sz = 3 + Math.random() * 4;
      s.style.width = sz + "px";
      s.style.height = sz + "px";
      s.style.opacity = String(0.45 + Math.random() * 0.5);
      snowEl.appendChild(s);
    }
  }

  function initThunder() {
    if (!thunderEl) return;
    var flash = document.createElement("div");
    flash.className = "fx-thunder__flash";
    thunderEl.appendChild(flash);

    function strike() {
      flash.classList.remove("is-active");
      void flash.offsetWidth;
      flash.classList.add("is-active");

      var bolt = document.createElement("div");
      bolt.className = "fx-thunder__bolt";
      bolt.style.left = 15 + Math.random() * 70 + "%";
      thunderEl.appendChild(bolt);
      void bolt.offsetWidth;
      bolt.classList.add("is-strike");
      setTimeout(function () {
        bolt.remove();
      }, 400);
    }

    function schedule() {
      strike();
      setTimeout(schedule, 2200 + Math.random() * 4200);
    }
    setTimeout(schedule, 800 + Math.random() * 1500);
  }

  function initPetals() {
    if (!petalsEl) return;
    var n = 22;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "petal " + (Math.random() > 0.45 ? "petal--pink" : "petal--black");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 12 + Math.random() * 16 + "s";
      p.style.animationDelay = Math.random() * 10 + "s";
      p.style.setProperty("--rot", String(Math.random() * 360));
      petalsEl.appendChild(p);
    }
  }

  var lastHeart = 0;
  var heartCount = 0;
  var maxHearts = 14;

  function spawnHeart(clientX, clientY) {
    if (!heartLayer) return;
    var now = Date.now();
    if (now - lastHeart < 72) return;
    lastHeart = now;
    if (heartCount >= maxHearts) return;

    var el = document.createElement("div");
    el.className = "glass-heart";
    el.style.left = clientX + "px";
    el.style.top = clientY + "px";
    el.style.setProperty("--hx", String((Math.random() - 0.5) * 40));
    el.innerHTML = HEART_SVG;
    heartLayer.appendChild(el);
    heartCount++;

    setTimeout(function () {
      el.remove();
      heartCount--;
    }, 980);
  }

  function onMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }
    spawnHeart(x, y);
  }

  initSnow();
  initThunder();
  initPetals();

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
})();
