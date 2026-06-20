(function () {
  function mount(videoId, maskId, streamUrl) {
    function init() {
      var video = document.getElementById(videoId);
      var mask = document.getElementById(maskId);
      var loaded = false;
      var hls = null;

      if (!video || !streamUrl) {
        return;
      }

      function attachStream(playAfterAttach) {
        if (loaded) {
          if (playAfterAttach) {
            video.play().catch(function () {});
          }
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          if (playAfterAttach) {
            video.play().catch(function () {});
          }
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          if (playAfterAttach && window.Hls.Events) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          }
          return;
        }

        video.src = streamUrl;
        if (playAfterAttach) {
          video.play().catch(function () {});
        }
      }

      function begin() {
        if (mask) {
          mask.classList.add("is-hidden");
        }
        attachStream(true);
      }

      if (mask) {
        mask.addEventListener("click", begin);
      }

      video.addEventListener("play", function () {
        if (!loaded) {
          attachStream(false);
        }
        if (mask) {
          mask.classList.add("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (!loaded) {
          begin();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  window.SitePlayer = {
    mount: mount
  };
})();
