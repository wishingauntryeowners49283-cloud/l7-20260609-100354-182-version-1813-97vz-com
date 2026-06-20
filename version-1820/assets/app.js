document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var navPanel = document.getElementById("navPanel");

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", function () {
      var open = navPanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = "./search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var heroThumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === heroIndex);
    });
    heroThumbs.forEach(function (thumb, current) {
      thumb.classList.toggle("is-active", current === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
    }
    if (heroSlides.length > 1) {
      heroTimer = setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  heroThumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      showHero(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      startHeroTimer();
    });
  });

  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");

  if (prev) {
    prev.addEventListener("click", function () {
      showHero(heroIndex - 1);
      startHeroTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showHero(heroIndex + 1);
      startHeroTimer();
    });
  }

  startHeroTimer();

  function applyFilter(input) {
    var selector = input.getAttribute("data-target") || ".movie-grid";
    var scope = document.querySelector(selector);
    if (!scope) {
      scope = input.closest("main") || document;
    }
    var query = input.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var visible = 0;
    cards.forEach(function (item) {
      var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      item.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector(input.getAttribute("data-empty") || "");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  document.querySelectorAll(".movie-filter").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input);
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input.classList.contains("is-global")) {
      input.value = query;
      applyFilter(input);
    }
  });

  function showVideoMessage(shell, message) {
    var box = shell.querySelector(".video-message");
    if (box) {
      box.textContent = message;
      box.classList.add("is-visible");
    }
  }

  function startVideo(shell) {
    var video = shell.querySelector("video");
    var stream = shell.getAttribute("data-stream");
    if (!video || !stream) {
      showVideoMessage(shell, "视频暂时无法播放，请稍后再试");
      return;
    }

    shell.classList.add("is-playing");

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video.hlsInstance = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showVideoMessage(shell, "视频暂时无法播放，请稍后再试");
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      }, { once: true });
      return;
    }

    video.src = stream;
    video.play().catch(function () {
      showVideoMessage(shell, "视频暂时无法播放，请稍后再试");
    });
  }

  document.querySelectorAll(".video-shell").forEach(function (shell) {
    var button = shell.querySelector(".play-trigger");
    if (button) {
      button.addEventListener("click", function () {
        startVideo(shell);
      });
    }
  });
});
