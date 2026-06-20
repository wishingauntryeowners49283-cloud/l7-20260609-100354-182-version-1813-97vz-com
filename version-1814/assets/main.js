(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-movie-grid]');
    if (!panel || !grid) {
      return;
    }
    var input = panel.querySelector('[data-filter-input]');
    var select = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var categoryMatch = !category || cardCategory === category;
        card.style.display = queryMatch && categoryMatch ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video-source');
      var hlsInstance = null;
      var initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function setup() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('当前网络无法加载视频，请稍后重试');
            }
          });
          return Promise.resolve();
        }
        video.src = source;
        setStatus('当前浏览器需要支持 HLS 播放');
        return Promise.resolve();
      }

      function play() {
        setup().then(function () {
          button.classList.add('is-hidden');
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              button.classList.remove('is-hidden');
              setStatus('点击播放按钮开始播放');
            });
          }
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
        setStatus('');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var input = document.querySelector('[data-search-page-input]');
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lowered = query.toLowerCase();
    var matches = window.SEARCH_INDEX.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category]
        .join(' ')
        .toLowerCase()
        .indexOf(lowered) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = '搜索结果：' + query;
    }
    results.innerHTML = matches.map(renderSearchCard).join('') || '<div class="content-card"><h2>没有找到相关内容</h2><p>可以换一个剧名、地区、年份或类型继续搜索。</p></div>';
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[match];
    });
  }

  function renderSearchCard(item) {
    return [
      '<a class="movie-card" href="', escapeHtml(item.url), '" data-category="', escapeHtml(item.categoryKey), '">',
      '<div class="movie-thumb">',
      '<img src="', escapeHtml(item.cover), '" alt="', escapeHtml(item.title), '" loading="lazy">',
      '<span class="movie-type">', escapeHtml(item.type), '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<span class="chip">', escapeHtml(item.category), '</span>',
      '<h3>', escapeHtml(item.title), '</h3>',
      '<p>', escapeHtml(item.description), '</p>',
      '<div class="movie-meta">',
      '<span>', escapeHtml(item.year), '</span>',
      '<span>', escapeHtml(item.region), '</span>',
      '<span>', escapeHtml(item.genre), '</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join('');
  }
})();
