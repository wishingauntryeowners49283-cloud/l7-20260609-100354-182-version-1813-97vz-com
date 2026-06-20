(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var searchParam = new URLSearchParams(window.location.search).get('q') || '';
    var searchInput = document.getElementById('movieSearch');
    if (searchInput && searchParam) {
      searchInput.value = searchParam;
    }

    var filterControls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-control]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function filterCards() {
      var q = (document.getElementById('movieSearch') || { value: '' }).value.trim().toLowerCase();
      var year = (document.getElementById('yearFilter') || { value: '' }).value;
      var type = (document.getElementById('typeFilter') || { value: '' }).value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
        var matchType = !type || (card.getAttribute('data-type') || '') === type;
        card.classList.toggle('is-filtered-out', !(matchQuery && matchYear && matchType));
      });
    }

    filterControls.forEach(function (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    });

    if (filterControls.length) {
      filterCards();
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function startPlayer(frame) {
      var video = frame.querySelector('video');
      var overlay = frame.querySelector('.video-overlay');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream-url');
      if (!stream) {
        return;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (!video.getAttribute('data-loaded')) {
        video.setAttribute('data-loaded', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = stream;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        }
      } else {
        playVideo();
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(function (frame) {
      var overlay = frame.querySelector('.video-overlay');
      var video = frame.querySelector('video');
      if (overlay) {
        overlay.addEventListener('click', function () {
          startPlayer(frame);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startPlayer(frame);
          }
        });
      }
    });
  });
})();
