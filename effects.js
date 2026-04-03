(function () {
  var petalsEl = document.getElementById("fx-petals");
  var heartLayer = document.getElementById("heart-layer");
  var videoEl = document.getElementById("bg-video");
  var panelMain = document.getElementById("panel-main");
  var panelServers = document.getElementById("panel-servers");
  var tabToggle = document.getElementById("tab-toggle");
  var welcomeOverlay = document.getElementById("welcome-overlay");

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.7)" stroke-width="0.85" ' +
    'd="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function siteStarted() {
    return document.body.classList.contains("site-started");
  }

  /** After welcome: audio always on — no mute toggle in the UI. */
  function forceSoundOn() {
    if (!videoEl || !siteStarted()) return;
    videoEl.muted = false;
    videoEl.volume = 1;
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

  function playWithSoundOnly() {
    if (!videoEl) return Promise.resolve();
    videoEl.muted = false;
    videoEl.volume = 1;
    var p = videoEl.play();
    if (p && typeof p.catch === "function") {
      return p.catch(function () {
        videoEl.muted = false;
        videoEl.volume = 1;
        return videoEl.play();
      });
    }
    return Promise.resolve();
  }

  function playWelcomeStartWithSound() {
    if (!videoEl) return Promise.resolve();
    videoEl.muted = false;
    videoEl.volume = 1;
    var p = videoEl.play();
    if (!p || typeof p.then !== "function") {
      return Promise.resolve();
    }
    return p
      .then(function () {
        forceSoundOn();
      })
      .catch(function () {
        videoEl.muted = false;
        videoEl.volume = 1;
        return videoEl.play();
      })
      .catch(function () {
        videoEl.muted = false;
        videoEl.volume = 1;
        return videoEl.play();
      })
      .catch(function () {
        videoEl.muted = false;
        videoEl.volume = 1;
        return videoEl.play();
      })
      .then(function () {
        forceSoundOn();
      });
  }

  function dismissWelcome() {
    if (!welcomeOverlay || siteStarted()) return;
    document.body.classList.add("site-started");
    welcomeOverlay.classList.add("is-dismissed");
    welcomeOverlay.setAttribute("aria-hidden", "true");
    welcomeOverlay.setAttribute("tabindex", "-1");
    playWelcomeStartWithSound()
      .catch(function () {})
      .finally(function () {
        forceSoundOn();
        var n = 0;
        var pulse = setInterval(function () {
          forceSoundOn();
          if (++n >= 20) clearInterval(pulse);
        }, 150);
      });
  }

  function initWelcome() {
    if (!welcomeOverlay) return;
    welcomeOverlay.addEventListener("click", function (e) {
      e.preventDefault();
      dismissWelcome();
    });
    welcomeOverlay.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismissWelcome();
      }
    });
    setTimeout(function () {
      try {
        welcomeOverlay.focus();
      } catch (err) {}
    }, 0);
  }

  function initVideo() {
    if (!videoEl) return;
    initVideoTrim();
    initWelcome();

    videoEl.pause();
    videoEl.muted = true;

    videoEl.addEventListener(
      "playing",
      function () {
        if (siteStarted()) forceSoundOn();
      },
      { passive: true }
    );

    var sourceEl = videoEl.querySelector("source");
    if (sourceEl) {
      videoEl.addEventListener(
        "error",
        function () {
          if (sourceEl.dataset.retried) return;
          sourceEl.dataset.retried = "1";
          try {
            sourceEl.src = new URL("peekaboo-bg.mp4", document.baseURI).href;
            videoEl.load();
            if (siteStarted()) {
              playWithSoundOnly()
                .catch(function () {})
                .finally(function () {
                  forceSoundOn();
                });
            }
          } catch (e) {}
        },
        { passive: true }
      );
    }

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.hidden || !siteStarted() || !videoEl) return;
        forceSoundOn();
        var p = videoEl.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () {});
        }
      },
      { passive: true }
    );
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
    if (!heartLayer || !siteStarted()) return;
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
  initTab();
  initPetals();

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
})();
