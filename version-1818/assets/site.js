(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var movieList = document.querySelector('[data-movie-list]');

  if (filterPanel && movieList) {
    var cards = Array.prototype.slice.call(movieList.querySelectorAll('[data-title]'));
    var input = filterPanel.querySelector('[data-filter-input]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function fillSelect(select, key) {
      if (!select) {
        return;
      }
      var values = [];
      cards.forEach(function (card) {
        var value = card.dataset[key] || '';
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(regionSelect, 'region');
    fillSelect(typeSelect, 'type');
    fillSelect(yearSelect, 'year');

    if (input && query) {
      input.value = query;
    }

    function applyFilter() {
      var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var visible = true;
        visible = visible && (!keyword || text.indexOf(keyword) !== -1);
        visible = visible && (!region || card.dataset.region === region);
        visible = visible && (!type || card.dataset.type === type);
        visible = visible && (!year || card.dataset.year === year);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-video'));

  videos.forEach(function (video) {
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('.player-start') : null;
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function startVideo() {
      loadStream();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
