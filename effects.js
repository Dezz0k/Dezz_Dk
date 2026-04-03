(function () {
  var petalsEl = document.getElementById("fx-petals");
  var heartLayer = document.getElementById("heart-layer");
  var videoEl = document.getElementById("bg-video");
  var unmuteBtn = document.getElementById("unmute-btn");
  var panelMain = document.getElementById("panel-main");
  var panelServers = document.getElementById("panel-servers");
  var tabToggle = document.getElementById("tab-toggle");

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.7)" stroke-width="0.85" ' +
    'd="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function syncSoundLabel() {
    if (!videoEl || !unmuteBtn) return;
    var on = !videoEl.muted;
    unmuteBtn.textContent = on ? "Sound off" : "Sound on";
    unmuteBtn.setAttribute("aria-pressed", on ? "true" : "false");
    unmuteBtn.setAttribute("aria-label", on ? "Mute video" : "Enable video sound");
  }

  function initVideoTrim() {
    if (!videoEl) return;
    videoEl.addEventListener("loadedmetadata", function () {
      var d = videoEl.duration;
      if (d && !isNaN(d) && d > 2.1) {
        videoEl._trimAt = d - 2;
      }
    });
    videoEl.addEventListener("timeupdate", function () {
      if (videoEl._trimAt != null && videoEl.currentTime >= videoEl._trimAt) {
        videoEl.currentTime = 0;
      }
    });
  }

  function playWithSoundPreferred() {
    if (!videoEl) return Promise.resolve();
    videoEl.muted = false;
    videoEl.volume = 1;
    var p = videoEl.play();
    if (p && typeof p.catch === "function") {
      return p.catch(function () {
        videoEl.muted = true;
        return videoEl.play();
      });
    }
    return Promise.resolve();
  }

  function initVideo() {
    if (!videoEl) return;
    initVideoTrim();

    function tryPlay() {
      playWithSoundPreferred()
        .catch(function () {})
        .finally(function () {
          syncSoundLabel();
        });
    }

    tryPlay();

    document.addEventListener(
      "visibilitychange",
      function () {
        if (!document.hidden) tryPlay();
      },
      { passive: true }
    );

    var unlocked = false;
    function unlockOnce() {
      if (unlocked) return;
      unlocked = true;
      playWithSoundPreferred()
        .catch(function () {})
        .finally(function () {
          syncSoundLabel();
        });
      document.removeEventListener("pointerdown", unlockOnce);
      document.removeEventListener("touchstart", unlockOnce);
      document.removeEventListener("keydown", unlockOnce);
    }
    document.addEventListener("pointerdown", unlockOnce, { passive: true });
    document.addEventListener("touchstart", unlockOnce, { passive: true });
    document.addEventListener("keydown", unlockOnce, { passive: true });
  }

  function initUnmute() {
    if (!videoEl || !unmuteBtn) return;
    syncSoundLabel();
    unmuteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      videoEl.muted = !videoEl.muted;
      var p = videoEl.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {});
      }
      syncSoundLabel();
    });
  }

  function initTab() {
    if (!panelMain || !panelServers || !tabToggle) return;
    var serversOpen = false;

    function setView(open) {
      serversOpen = open;
      panelMain.classList.toggle("is-hidden", open);
      panelServers.classList.toggle("is-visible", open);
      panelServers.setAttribute("aria-hidden", open ? "false" : "true");
      tabToggle.setAttribute("aria-expanded", open ? "true" : "false");
      tabToggle.textContent = open ? "Links" : "Servers";
      document.body.classList.toggle("view-servers", open);
    }

    tabToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setView(!serversOpen);
    });
  }

  function initPetals() {
    if (!petalsEl) return;
    var n = 42;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      var glass = Math.random() > 0.42;
      p.className = "petal " + (glass ? "petal--glass" : "petal--solid");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 11 + Math.random() * 18 + "s";
      p.style.animationDelay = Math.random() * 12 + "s";
      p.style.setProperty("--rot", String(Math.random() * 360));
      var w = 10 + Math.random() * 10;
      p.style.width = w + "px";
      p.style.height = w * 1.25 + "px";
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

  initVideo();
  initUnmute();
  initTab();
  initPetals();

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
})();
